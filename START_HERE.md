# 🎯 START HERE - Vercel Deployment Guide

Welcome! Your AI Courtroom Simulator is now ready for Vercel deployment. Follow these steps:

## ⏱️ Time Required: ~15 minutes

## Step 1: Prepare Supabase (2 minutes)

### 1.1 Create Storage Bucket

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Storage** → Click **Create a new bucket**
4. Name: `evidence`
5. Click **Create bucket**
6. Click on the bucket, then **Policies**
7. Add policy: Allow **anyone** to **read** in this bucket

✅ Storage bucket ready!

## Step 2: Prepare Environment Variables (2 minutes)

### 2.1 Get Your Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Copy your API key
3. Save it somewhere safe

### 2.2 Get Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` (save as `VITE_SUPABASE_URL`)
   - `anon public` key (save as `VITE_SUPABASE_ANON_KEY`)
   - `service_role` key (save as `SUPABASE_SERVICE_ROLE_KEY`)

✅ All keys ready!

## Step 3: Push Code to GitHub (3 minutes)

```bash
cd d:\College\SEM4\hackathon\new\ai-courtroom-simulator

git add .
git commit -m "Add Vercel serverless functions - ready for deployment"
git push origin main
```

✅ Code on GitHub!

## Step 4: Deploy to Vercel (5 minutes)

### Option A: Via Web Dashboard (Easiest)

1. Go to [Vercel](https://vercel.com)
2. Click **Add New** → **Project**
3. Select your GitHub repository
4. Click **Import**

### Option B: Via CLI

```bash
npm install -g vercel
vercel --prod
```

Either way, continue to Step 4b...

### Step 4b: Add Environment Variables

In the Vercel deployment dialog or dashboard:

**Environment Variables:**
```
GROQ_API_KEY = [your groq API key]
VITE_SUPABASE_URL = [your supabase URL]
VITE_SUPABASE_ANON_KEY = [your anon key]
SUPABASE_SERVICE_ROLE_KEY = [your service role key]
VITE_API_BASE = [leave empty]
```

Click **Deploy**!

✅ Deployment started!

## Step 5: Verify Deployment (3 minutes)

Wait for the build to complete (usually 2-3 minutes).

Once complete:
1. Your app is live at `https://your-project.vercel.app`
2. Click the URL to open it

### Test It Works

1. Refresh the page
2. Try starting a case
3. Submit an argument
4. Judge should respond
5. Try uploading evidence

✅ All working? Great! You're done!

## 🆘 If Something Goes Wrong

### Deployment Failed?
- Check Vercel logs for errors
- Verify all environment variables are set
- Ensure code was pushed to GitHub

### APIs not connecting?
- Check `VITE_API_BASE` is **empty** in production
- Open browser DevTools → Network tab
- API calls should show as `/api/*` (not http://localhost)

### Files not uploading?
- Verify Supabase bucket `evidence` exists
- Ensure bucket is PUBLIC
- Check policies allow public read

### AI responses incomplete?
- Should be fixed! Submit a GitHub issue if not

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed troubleshooting.

## 📚 Next Steps

- Read [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - What was fixed
- Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Common commands
- Read [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Full deployment guide

## 🎉 Congratulations!

Your AI Courtroom Simulator is now running on Vercel with:
- ✅ Full AI responses (no timeouts)
- ✅ Persistent file storage  
- ✅ Serverless scaling
- ✅ Production-ready architecture

Share your deployment URL with the team!

---

**Questions?** Check the documentation or submit a GitHub issue.
