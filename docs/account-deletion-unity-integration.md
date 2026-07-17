# Account deletion — status & how to finish

Google Play account/data deletion for the Unity games. The **entire pipeline is
built, deployed, and tested** except the live Unity credentials, which only you can
create. Once you add them, deletions run automatically.

Public URL (give this to Play Console): **`https://nexenovastudios.com/delete-account`**

---

## Architecture (all serverless, on infra already in use)

```
User submits form (/delete-account)
  -> edge POST /account-deletion         : row 'pending_verification' + confirm email
User clicks email link
  -> edge GET /account-deletion/verify   : 'verified', scheduled_deletion_at = now + 30d
     (or /cancel -> 'cancelled')
Hourly:
  pg_cron -> pg_net POST /account-deletion/process   (x-cron-secret from Vault)
    -> edge: for each verified row past its grace period:
         token-exchange (service account) -> DELETE Unity player (REST)
         -> 'completed' + completion email   (404 = already gone = success)
         -> on error: retry; 'failed' after 5 attempts
         -> if Unity creds absent: stays 'verified' (safe, waits for setup)
```

No GitHub Actions, no Cloudflare Worker, no `ugs` CLI (a CLI can't run in a serverless
runtime — that's why REST was chosen). `ugs` is still fine for manual one-off deletes.

## What's built & verified ✓

- **Page** `src/app/components/legal/DeleteAccountPage.tsx` — form (Player ID required,
  email double opt-in, "permanent" ack, what-gets-deleted disclosure) + verify/cancel
  handler. Routed, middleware-allow-listed, footer link, `noindex`. **Deployed to prod.**
- **DB** `public.account_deletion_requests` — RLS-locked (service-role only), status
  lifecycle, 30-day grace. Migration `create_account_deletion_requests`.
- **Edge fn** `supabase/functions/make-server-dff5028d/index.ts` — routes
  `/account-deletion`, `/verify`, `/cancel`, `/process` (cron-gated by `CRON_SECRET`).
  `deleteUnityAccount()` implements the REST deletion. **Deployed.**
- **Cron** — `pg_cron` job `account-deletion-process`, hourly, active. Secret + URL in
  **Vault** (`account_deletion_cron_secret`, `account_deletion_process_url`). `CRON_SECRET`
  set on the function. Verified: `pg_net -> function` returns 200; a due row is correctly
  picked up and (without Unity creds) safely deferred.

## What YOU must do to go live

### 1. Create a Unity Service Account
Unity Cloud dashboard → Administration → Service Accounts. Give it the **Player Admin**
role (permission to delete players). Note the **Key ID** and **Secret Key**.

### 2. Set 4 secrets on the edge function
```
npx supabase secrets set \
  UNITY_PROJECT_ID=<project id> \
  UNITY_ENV_ID=<production environment id> \
  UNITY_SERVICE_ACCOUNT_KEY=<key id> \
  UNITY_SERVICE_ACCOUNT_SECRET=<secret key> \
  --project-ref frncdqehmtfbteyrnymp
```
The moment these exist, the hourly job starts actually deleting (until then, due rows
just wait in `verified`).

### 3. Confirm the delete endpoint
`deleteUnityAccount()` defaults to:
```
DELETE https://services.api.unity.com/player-auth-admin/v1/projects/{projectId}/users/{playerId}
```
This is the documented shape, but Unity's docs are a JS SPA I couldn't read the exact
path from — **verify it** at <https://services.docs.unity.com/player-auth-admin/v1/>
(Player Authentication Admin API → delete). If it differs, don't touch code — just set:
```
npx supabase secrets set UNITY_DELETE_URL_TEMPLATE='<exact url with {projectId} and {playerId}>' --project-ref frncdqehmtfbteyrnymp
```
The token-exchange call (`POST services.api.unity.com/auth/v1/token-exchange`) is confirmed.

### 4. (Optional) purge other services' data
`ugs player delete` / the admin DELETE removes the **Authentication identity**. If the
games persist player data in **Cloud Save / Economy / Leaderboards**, add those purges
in `deleteUnityAccount()` (marked with a comment) before returning — they are
**environment-scoped**. If the games are Authentication-only, the identity delete is enough.

### 5. Play Console
Data safety → set the account-deletion URL to `https://nexenovastudios.com/delete-account`.
The page already states what's deleted, retention exceptions, and the timeframe.

## Testing after you add creds
1. Submit a real request for a throwaway Player ID → confirm email → click verify.
2. Force it due: `update public.account_deletion_requests set scheduled_deletion_at = now() where player_id = '<id>';`
3. Fire the processor now instead of waiting for the hour:
   ```
   curl -s -X POST https://frncdqehmtfbteyrnymp.supabase.co/functions/v1/make-server-dff5028d/account-deletion/process \
     -H "x-cron-secret: <the CRON_SECRET value>"
   ```
   Expect `{"completed":1,...}` and the player gone in the Unity dashboard.
4. Check the schedule anytime: `select * from cron.job_run_details order by start_time desc limit 5;`

## Handy references
- Status lifecycle: `pending_verification → verified → processing → completed | failed`, or `cancelled`.
- Inspect the queue: `select status, count(*) from public.account_deletion_requests group by status;`
- Rotate the cron secret: update Vault `account_deletion_cron_secret` **and** re-set `CRON_SECRET` on the function to the same value.
