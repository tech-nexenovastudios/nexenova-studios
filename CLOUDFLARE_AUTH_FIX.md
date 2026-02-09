# 🔐 Cloudflare Authentication Fix

## The Problem

You're seeing:
```
Authentication error [code: 10000]
Deploy command cannot be empty
```

## Solution: Use Required Deploy Command + Fix Authentication

### Step 1: Set the Deploy Command

In Cloudflare Dashboard → Settings → Builds & deployments:

**Deploy command:**
```
npx wrangler pages deploy out --project-name=nexenova-studios
```

**Non-production branch deploy command:**
```
npx wrangler pages deploy out --project-name=nexenova-studios --branch=$CF_PAGES_BRANCH
```

### Step 2: Configure API Token Properly

Since Cloudflare requires a deploy command, you need to set up the API token:

1. **Add API token to Environment Variables:**
   - Go to Settings → Environment variables
   - Click "Add variable"
   - **Variable name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Your API token (see `SETUP_API_TOKEN.md` for security instructions)
   - **Environment**: Select "Production" (and "Preview" if needed)
   - Click "Save"

2. **Verify token permissions:**
   - Your token needs `Cloudflare Pages:Edit` permission
   - Check at [API Tokens](https://dash.cloudflare.com/profile/api-tokens)

3. **Verify project name:**
   - Make sure `nexenova-studios` matches your actual project name
   - Check in Cloudflare Dashboard → Workers & Pages → Pages

**⚠️ Security Note**: Never commit your API token to Git. Always use Cloudflare Dashboard environment variables.

### Step 3: Alternative - Use Environment Variables

If the above doesn't work, try using Cloudflare's built-in environment variables:

**Deploy command:**
```
npx wrangler pages deploy out --project-name=$CF_PAGES_PROJECT_NAME
```

**Non-production branch deploy command:**
```
npx wrangler pages deploy out --project-name=$CF_PAGES_PROJECT_NAME --branch=$CF_PAGES_BRANCH
```

Cloudflare automatically sets these variables in the build environment.

## Complete Build Settings

```
Build command: npm run build
Deploy command: npx wrangler pages deploy out --project-name=nexenova-studios
Non-production branch deploy command: npx wrangler pages deploy out --project-name=nexenova-studios --branch=$CF_PAGES_BRANCH
Build output directory: out
Root directory: /
Node.js version: 18
```

## Why This Works

- Cloudflare's build environment has built-in authentication for Git-based deployments
- Using `$CF_PAGES_PROJECT_NAME` ensures the project name is always correct
- Removing conflicting API tokens allows Cloudflare's OAuth to work properly

## Still Having Issues?

1. Check Cloudflare Pages → Settings → Git integration is connected
2. Verify the project name matches exactly
3. Try using the environment variable version of the deploy command
4. Check build logs for more specific error messages
