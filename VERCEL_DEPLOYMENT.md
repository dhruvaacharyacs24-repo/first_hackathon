# Vercel Deployment Setup

This document explains how to properly deploy the AI Courtroom Simulator to Vercel.

## Required Environment Variables

Before deploying to Vercel, add these environment variables in your Vercel project settings:

### From `.env` (Add to Vercel)

1. **GROQ_API_KEY** - Your Groq API key
   - Get from: https://console.groq.com/keys
   
2. **VITE_SUPABASE_URL** - Your Supabase project URL
   - Get from: Supabase Dashboard > Settings > API
   
3. **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous key
   - Get from: Supabase Dashboard > Settings > API
   
4. **SUPABASE_SERVICE_ROLE_KEY** (Optional but recommended) - For backend file uploads
   - Get from: Supabase Dashboard > Settings > API (Service Role Key)
   - This provides more permissions for the backend to store files

### Supabase Storage Setup

1. Create a new storage bucket called **`evidence`** in your Supabase project
2. Make it **PUBLIC** so files can be accessed via URL
3. In RLS Policies, allow public read access to the `evidence` bucket

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Update Environment Variables in .env

```env
GROQ_API_KEY=your_groq_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Push to GitHub

```bash
git add .
git commit -m "Add Vercel serverless functions"
git push origin main
```

### 4. Deploy to Vercel

**Option A: Via GitHub (Recommended)**
1. Go to https://vercel.com
2. Connect your GitHub repository
3. Add all environment variables in Project Settings
4. Deploy

**Option B: Via Vercel CLI**

```bash
vercel
```

Then add environment variables when prompted or configure in the Vercel Dashboard.

## API Endpoints After Deployment

Your API endpoints will be available at:

- `https://your-project.vercel.app/api/respond` - Main courtroom response
- `https://your-project.vercel.app/api/generate` - Multi-party generation
- `https://your-project.vercel.app/api/chat` - Chat endpoint
- `https://your-project.vercel.app/api/verdict` - Final verdict
- `https://your-project.vercel.app/api/upload-evidence` - File upload
- `https://your-project.vercel.app/api/validate` - Statement validation

## File Uploads

- Files are now stored in **Supabase Storage** instead of local disk
- This ensures uploads persist across function invocations
- Maximum file size: **10MB**
- Supported types: **Images** and **PDF/Word documents**

## Troubleshooting

### Issue: "Function Timeout"
- Solution: Increase Vercel function timeout in `vercel.json` or upgrade plan

### Issue: "Files not persisting"
- Solution: Ensure Supabase storage bucket `evidence` is created and public

### Issue: "API returns 405"
- Solution: Check request method (should be POST for most endpoints)

### Issue: "AI responses are incomplete"
- Solution: This is now fixed with serverless function timeouts set to 25 seconds

## Local Development

```bash
npm run dev
```

This will run:
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:3000 (Express for local testing)

The frontend will proxy API requests to localhost:3000 during dev.

## Switching Between Local and Production APIs

The frontend automatically uses the correct API base:
- **Local dev**: Uses vite proxy to http://localhost:3000
- **Production**: Uses relative paths `/api/*` which resolve to Vercel functions

No code changes needed - it's handled by the `VITE_API_BASE` environment variable.
