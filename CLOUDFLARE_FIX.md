# ⚠️ Cloudflare Deployment Fix

## The Problem

You're seeing this error:
```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
  For Pages, please run `wrangler pages deploy` instead.
```

## The Solution

**If Cloudflare requires a deploy command, use this:**

1. Go to your Cloudflare Pages project
2. Navigate to **Settings** → **Builds & deployments**
3. Set the **Deploy command** to:
   ```
   npx wrangler pages deploy out --project-name=nexenova-studios --compatibility-date=2024-01-01
   ```

### Fixing Authentication Errors

If you see authentication errors, try these steps:

1. **Remove any API token from environment variables:**
   - Go to Settings → Environment variables
   - Delete `CLOUDFLARE_API_TOKEN` if it exists
   - Cloudflare should authenticate automatically for Git deployments

2. **Reconnect Git integration:**
   - Go to Settings → Git integration
   - Disconnect and reconnect your Git provider
   - This refreshes the OAuth authentication

3. **Verify project name matches:**
   - Ensure `--project-name=nexenova-studios` matches your actual project name in Cloudflare
   - Check the project name in Cloudflare Dashboard

4. **Alternative: Use environment variable for project name:**
   ```
   npx wrangler pages deploy out --project-name=$CF_PAGES_PROJECT_NAME
   ```

## Correct Build Settings

```
Build command: npm run build
Deploy command: npx wrangler pages deploy out --project-name=nexenova-studios --compatibility-date=2024-01-01
Non-production branch deploy command: npx wrangler pages deploy out --project-name=nexenova-studios --branch=$CF_PAGES_BRANCH
Build output directory: out
Root directory: /
Node.js version: 18
```

**Note**: Replace `nexenova-studios` with your actual Cloudflare Pages project name if different.

## Authentication Error Fix

If you see authentication errors like:
```
Authentication error [code: 10000]
```

**Solution**: Remove the deploy command entirely. For Git-based deployments:
- Cloudflare uses OAuth (no API token needed)
- Deployment happens automatically after build
- No manual deploy command required

## Why This Happened

Cloudflare suggested `npx wrangler deploy`, but that command is for **Cloudflare Workers**, not **Cloudflare Pages**. For Pages, you need `wrangler pages deploy`.

## After Fixing

1. Save your settings in Cloudflare Dashboard
2. Trigger a new deployment (push a commit or manually trigger)
3. The build should now complete successfully
