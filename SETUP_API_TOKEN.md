# 🔐 Setting Up Cloudflare API Token Securely

## ⚠️ SECURITY WARNING

**Your API token has been exposed!** You should regenerate it immediately:

1. Go to [Cloudflare Dashboard → Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Find your token and click "Roll" or delete it
3. Create a new token with the same permissions

## How to Configure API Token in Cloudflare Pages

### Option 1: Environment Variables in Cloudflare Dashboard (Recommended)

1. **Go to your Cloudflare Pages project**
   - Navigate to Workers & Pages → Pages → Your Project

2. **Open Settings → Environment variables**

3. **Add the API token:**
   - **Variable name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Your API token (the new one after regenerating)
   - **Environment**: Select "Production", "Preview", or both

4. **Save the settings**

### Option 2: For Local Development (Optional)

If you want to test deployments locally, create a `.env.local` file (this file is gitignored):

```bash
# .env.local (DO NOT COMMIT THIS FILE)
CLOUDFLARE_API_TOKEN=your_token_here
```

**Important**: Never commit `.env.local` or any file containing your API token to Git!

## Required API Token Permissions

Your API token needs these permissions:
- **Account** → **Cloudflare Pages** → **Edit**

To create/update a token with correct permissions:
1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Add custom permission: **Cloudflare Pages** → **Edit**
5. Set account resources to your account
6. Create token and copy it immediately

## Verify Configuration

After setting up the token in Cloudflare Dashboard:

1. The token will be available in build environment as `$CLOUDFLARE_API_TOKEN`
2. Wrangler will automatically use it when running `wrangler pages deploy`
3. No need to modify your deploy command - it will work automatically

## Current Deploy Command

Your deploy command should remain:
```
npx wrangler pages deploy out --project-name=nexenova-studios
```

Wrangler will automatically read `CLOUDFLARE_API_TOKEN` from environment variables.

## Security Best Practices

✅ **DO:**
- Store tokens in Cloudflare Dashboard environment variables
- Use `.env.local` for local testing (gitignored)
- Regenerate tokens if exposed
- Use least-privilege permissions

❌ **DON'T:**
- Commit tokens to Git
- Share tokens in chat/messages
- Store tokens in code files
- Use tokens with excessive permissions

## Troubleshooting

If you still see authentication errors:

1. **Verify token is set**: Check Cloudflare Dashboard → Environment variables
2. **Check token permissions**: Ensure it has Pages:Edit permission
3. **Verify project name**: Make sure `nexenova-studios` matches your project name
4. **Try regenerating token**: Sometimes tokens need to be refreshed
