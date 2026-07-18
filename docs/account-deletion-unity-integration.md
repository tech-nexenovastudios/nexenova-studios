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
         resolve target project (deep-link project id / game map / default)
         HTTP Basic auth (service-account key:secret) -> DELETE Unity player (REST)
         -> 'completed' + completion email   (404 = already gone = success)
         -> on error: retry; 'failed' after 5 attempts
         -> if Unity creds absent OR project unresolved/not allow-listed: stays 'verified' (safe)
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

## Live status

The pipeline is **live and has deleted a real player**. Secrets already set:
`UNITY_PROJECT_ID`, `UNITY_ENV_ID`, `UNITY_SERVICE_ACCOUNT_KEY`,
`UNITY_SERVICE_ACCOUNT_SECRET`, `UNITY_DELETE_URL_TEMPLATE`, `CRON_SECRET`.

### Service-account role (least privilege)
One **org-scoped** service account covers every project in the org. Grant it the
**`Player Authentication Admin`** role at the **organization** level (Unity Cloud →
Administration → Service Accounts → your account → **Add organization role**). Do NOT
use Owner (over-privileged) or `Player Authentication Token Issuer` (no delete).

### Auth (confirmed)
Player-Auth-Admin DeleteUser is an **Admin API**: authenticate with the service-account
key/secret DIRECTLY via **HTTP Basic** (`Authorization: Basic base64(keyId:secret)`).
No token-exchange (that's only for "trusted" APIs). Delete endpoint:
```
DELETE https://services.api.unity.com/player-auth-admin/v1/projects/{projectId}/users/{playerId}
```
Overridable via `UNITY_DELETE_URL_TEMPLATE` (already set) without a code change.

## Multi-project (one feature, all games)

A Unity service account is **org-scoped**, so the single credential can delete players in
every project under the org. The only per-request variable is the **project id**, resolved
by `resolveProjectId()` in this priority:

1. **Deep-link project id** — the in-game button passes `?project=<UnityProjectId>`
   (`Application.cloudProjectId`). Honored ONLY if allow-listed (see below).
2. **Game slug → project map** — env `UNITY_GAME_PROJECT_MAP`, JSON `{"<gameId>":"<projectId>"}`.
3. **`UNITY_PROJECT_ID`** — single-project default.

Persisted per row in `account_deletion_requests.unity_project_id`.

### Allow-list (security)
A client-supplied `project` is honored only if it's in the allow-list — otherwise the
org credential could be aimed at any project in the org by a tampered link. The allow-list
is the union of: `UNITY_GAME_PROJECT_MAP` values + `UNITY_PROJECT_ID` + explicit
`UNITY_ALLOWED_PROJECT_IDS` (comma-separated). Not allow-listed → row parks (never deletes).
```
npx supabase secrets set \
  UNITY_ALLOWED_PROJECT_IDS='9cc98e1a-d28c-4311-b4cc-dd9ab1e23446,<project-id-2>' \
  --project-ref frncdqehmtfbteyrnymp
```
If all games live in the one project already in `UNITY_PROJECT_ID`, the allow-list is
optional — that id is auto-allowed.

Get a project id via CLI (run inside each Unity game project): `ugs config get project-id`.
ugs can't enumerate the org, so gather them per project (or Unity dashboard).

Known: **Park Escape = `9cc98e1a-d28c-4311-b4cc-dd9ab1e23446`**.

## In-game "Delete Account" button (deep link)
```
https://nexenovastudios.com/delete-account?pid=<PlayerId>&project=<ProjectId>
```
```csharp
string url = "https://nexenovastudios.com/delete-account" +
    $"?pid={UnityWebRequest.EscapeURL(AuthenticationService.Instance.PlayerId)}" +
    $"&project={Application.cloudProjectId}";
Application.OpenURL(url);
```
The page prefills `pid`/`project`, the player enters email + consents, then the standard
double-opt-in + 30-day grace flow runs. The project UUID stays out of the visible form.

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
