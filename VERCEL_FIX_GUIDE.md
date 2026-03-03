# Vercel Deployment Fix Guide

## Problem Identified

Your project was encountering the error:
```
No Output Directory named "dist" found after the Build completed. Configure the Output Directory in your Project Settings. Alternatively, configure vercel.json#outputDirectory.
```

## Root Cause

This error occurs because Vercel was looking for a `dist` directory, but your Next.js project generates a `.next` directory during the build process. The `vercel.json` configuration was missing the `outputDirectory` specification.

## Solution Applied

The following changes have been made to fix the deployment:

### 1. Updated `vercel.json`

Added the `outputDirectory` property to explicitly tell Vercel where to find the build output:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "bun install",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  ...
}
```

**Key Changes:**
- **`"outputDirectory": ".next"`** - Tells Vercel that the build output is in the `.next` directory (Next.js default)
- **Updated rewrites** - Changed from `/(.*) → /` to `/(?!api)(.*) → /` to prevent API routes from being rewritten

### 2. Why This Works

Next.js builds to the `.next` directory by default when you run `next build`. This directory contains:
- Compiled JavaScript and CSS
- Server-side rendered pages
- Static assets
- Build metadata

Vercel's Next.js framework detection should automatically handle this, but explicitly setting `outputDirectory` ensures there's no ambiguity.

## Verification Steps

Before deploying to Vercel, verify locally:

```bash
# Install dependencies
bun install

# Build the project
npm run build
# or
bun run build

# Verify .next directory was created
ls -la .next
```

You should see the `.next` directory with the following structure:
```
.next/
├── static/
├── server/
├── cache/
└── ...
```

## Additional Recommendations

### 1. Environment Variables
Ensure all required environment variables are set in Vercel Project Settings:
- Database connection strings (if using Prisma)
- API keys (Firebase, etc.)
- Authentication secrets

### 2. Database Migrations
If using Prisma, add a build command to run migrations:

Update `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build"
}
```

Or in `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### 3. Optimize for Production

In `next.config.ts`, consider adding:
```typescript
const nextConfig: NextConfig = {
  // ... existing config
  swcMinify: true,  // Use SWC for faster minification
  compress: true,   // Enable gzip compression
  productionBrowserSourceMaps: false, // Disable source maps in production
};
```

### 4. Check Build Logs

After deployment, check Vercel's build logs for any warnings or errors:
1. Go to your Vercel project dashboard
2. Click on the deployment
3. View the "Build Logs" tab

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Module not found" errors | Ensure all dependencies are in `package.json` and run `bun install` locally |
| API routes not working | Check that API routes are in `src/app/api/` directory |
| Environment variables undefined | Add them to Vercel Project Settings → Environment Variables |
| Build timeout | Optimize dependencies or increase timeout in Vercel settings |
| Static assets not loading | Ensure assets are in `public/` directory |

## Deployment Checklist

- [ ] `vercel.json` has `"outputDirectory": ".next"`
- [ ] All environment variables are set in Vercel dashboard
- [ ] `package.json` has correct build script
- [ ] Dependencies are compatible (check `bun.lock`)
- [ ] No TypeScript errors (or `ignoreBuildErrors: true` is set)
- [ ] API routes are properly configured
- [ ] Database migrations are handled (if applicable)
- [ ] Build succeeds locally: `bun run build`

## Next Steps

1. **Push changes to your repository**
   ```bash
   git add vercel.json
   git commit -m "fix: configure vercel output directory for next.js"
   git push
   ```

2. **Trigger a new deployment**
   - Go to your Vercel dashboard
   - Click "Redeploy" or push a new commit
   - Monitor the build logs

3. **Test the deployment**
   - Visit your deployed URL
   - Check that all pages load correctly
   - Test API routes if applicable

## Support

If you continue to experience issues:
1. Check Vercel's build logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure your repository is up to date with these changes
4. Check the [Next.js Vercel deployment guide](https://nextjs.org/docs/deployment/vercel)

---

**Last Updated:** March 3, 2026
**Configuration Version:** 1.0
