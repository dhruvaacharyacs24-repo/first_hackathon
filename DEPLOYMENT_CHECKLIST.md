# ✅ Vercel Deployment Checklist

Complete this checklist before and during deployment to Vercel.

## Pre-Deployment Setup

### Backend Configuration
- [ ] All API endpoints created in `/api` folder
- [ ] `vercel.json` created with proper configuration
- [ ] `.env.example` created with all required variables
- [ ] `.vercelignore` file created to exclude unnecessary files
- [ ] `package.json` includes `@vercel/node` dependency
- [ ] TypeScript `tsconfig.app.json` includes `/api` folder

### Supabase Setup
- [ ] Supabase project created
- [ ] Storage bucket named `evidence` created
- [ ] Storage bucket is set to PUBLIC
- [ ] RLS policies allow public read access
- [ ] Supabase URL and keys obtained

### Groq AI Setup
- [ ] Groq account created
- [ ] API key generated and secured
- [ ] LLaMA and Vision models available in your plan

## Environment Variables

In your Vercel Project Settings, add these:

### Required Variables
- [ ] `GROQ_API_KEY` = [your Groq API key from console.groq.com]
- [ ] `VITE_SUPABASE_URL` = [your Supabase URL from dashboard]
- [ ] `VITE_SUPABASE_ANON_KEY` = [your Supabase anon key]

### Optional but Recommended
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = [your service role key - better for backend uploads]

### Leave Empty
- [ ] `VITE_API_BASE` = [leave empty for production - uses relative paths]

## Pre-Deployment Testing

### Local Testing
- [ ] Run `npm install` locally
- [ ] Run `npm run dev` and test all features
- [ ] Test file uploads
- [ ] Test AI responses
- [ ] Test verdict generation

### Backend Testing
- [ ] Run `npm run backend` separately
- [ ] Test endpoints with cURL:
  ```bash
  curl -X POST http://localhost:3000/api/respond \
    -H "Content-Type: application/json" \
    -d '{"role":"judge","caseText":"Test","lastArgument":"Test","evidence":[]}'
  ```

## Git & GitHub

- [ ] All changes committed: `git add .`
- [ ] Commit message: `git commit -m "Add Vercel serverless functions"`
- [ ] Code pushed to GitHub: `git push origin main`
- [ ] Repository is public (if using GitHub integration)

## Vercel Deployment

### Via GitHub (Recommended)
- [ ] Go to https://vercel.com
- [ ] Click "New Project"
- [ ] Select your GitHub repository
- [ ] Configure project settings (should auto-detect React + Vite)
- [ ] Add all environment variables
- [ ] Click "Deploy"
- [ ] Wait for build to complete

### Via Vercel CLI
- [ ] Install: `npm install -g vercel`
- [ ] Run: `vercel`
- [ ] Login with GitHub account
- [ ] Add environment variables when prompted
- [ ] Choose production environment
- [ ] Wait for deployment

## Post-Deployment Verification

### Testing Production
- [ ] Open your Vercel deployment URL
- [ ] Application loads correctly
- [ ] Frontend styles render properly
- [ ] No console errors in browser DevTools
- [ ] API calls show as `/api/*` in Network tab

### API Endpoint Testing
- [ ] Test `/api/respond`: Get AI response
- [ ] Test `/api/generate`: Multi-party generation
- [ ] Test `/api/chat`: Chat endpoint
- [ ] Test `/api/verdict`: Verdict generation
- [ ] Test `/api/validate`: Statement validation

### File Upload Testing
- [ ] Upload an image file
- [ ] Upload a PDF document
- [ ] Verify files appear in Supabase Storage
- [ ] Verify public URLs are accessible
- [ ] Test image validation with invalid image (should reject)

### AI Response Testing
- [ ] Prosecution provides arguments
- [ ] Defense responds appropriately
- [ ] Judge renders verdict
- [ ] Responses are complete (not cut off)
- [ ] Evidence is considered in responses

## Troubleshooting

### If Functions Timeout
- [ ] Check Vercel function logs: `vercel logs <function-name>`
- [ ] Increase timeout limit in `vercel.json` (if on Pro plan)
- [ ] Check Groq API response time

### If Files Don't Upload
- [ ] Verify Supabase storage bucket `evidence` exists
- [ ] Verify bucket is PUBLIC
- [ ] Check bucket RLS policies allow public access
- [ ] Check `SUPABASE_SERVICE_ROLE_KEY` is set

### If API Returns 405
- [ ] Ensure request method is POST (not GET)
- [ ] Check CORS headers in API response
- [ ] Verify URL doesn't have extra slashes

### If AI Responses Incomplete
- [ ] Check Groq API rate limits
- [ ] Check `max_tokens` setting in `api/utils.ts`
- [ ] Review function timeout settings
- [ ] Check Groq API status site

### If Frontend Can't Find API
- [ ] Verify `VITE_API_BASE` is empty in production env
- [ ] Check Network tab shows `/api/*` calls (not http://localhost:3000)
- [ ] Clear browser cache and rebuild locally

## Performance Monitoring

After deployment:
- [ ] Check Vercel Analytics dashboard
- [ ] Monitor function duration (should be < 10 seconds typically)
- [ ] Check error rates in logs
- [ ] Monitor Supabase storage usage
- [ ] Review API call frequency on Groq dashboard

## Final Sign-Off

- [ ] All features working in production
- [ ] No errors in Vercel logs
- [ ] No errors in browser console
- [ ] File uploads persist correctly
- [ ] AI responses complete fully
- [ ] Ready for user access!

## Rollback Plan (if issues arise)

If deployment breaks:
1. [ ] Revert to last working commit: `git revert <commit>`
2. [ ] Push to GitHub
3. [ ] Vercel will auto-redeploy (if set to auto-deploy on push)
4. [ ] Or manually redeploy from Vercel dashboard

## Next Steps

After successful deployment:
- [ ] Share project URL with team/users
- [ ] Monitor for any issues
- [ ] Gather user feedback
- [ ] Plan follow-up improvements
- [ ] Update documentation with live URL

---

**Need Help?**
- Read: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Read: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Check: [LOCAL_TESTING.md](./LOCAL_TESTING.md)
