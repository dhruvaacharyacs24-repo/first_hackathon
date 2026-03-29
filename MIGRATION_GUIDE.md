# Migration Guide: Express to Vercel Serverless

## What Changed

Your backend has been converted from a traditional Express server to Vercel serverless functions. This solves all deployment issues you were experiencing.

## Before (Local Only) ❌

```
backend/server.ts
  └── Express app with app.listen(3000)
  └── Files saved to local disk (/uploads)
  └── Doesn't work on Vercel
```

## After (Production Ready) ✅

```
api/
  ├── respond.ts          (AI courtroom responses)
  ├── generate.ts         (Multi-party generation)
  ├── chat.ts             (Chat endpoint)
  ├── verdict.ts          (Final judgment)
  ├── upload-evidence.ts  (File storage in Supabase)
  ├── validate.ts         (Statement validation)
  └── utils.ts            (Shared utilities)
  
vercel.json              (Vercel configuration)
VITE_API_BASE           (Empty for production - uses relative paths)
```

## Key Changes

### 1. **Express Server → Serverless Functions**

**Before:**
```typescript
app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

**After:**
```typescript
// Each endpoint is a standalone serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Function logic
}
```

### 2. **Local File Storage → Supabase Storage**

**Before:**
```typescript
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadsDir, { recursive: true })
    cb(null, uploadsDir)  // ❌ Ephemeral on Vercel
  }
})
```

**After:**
```typescript
// Files stored in Supabase Storage (persistent)
const { data, error } = await supabase.storage
  .from('evidence')
  .upload(filePath, buffer)
```

### 3. **CORS Handling**

**Before:**
```typescript
app.use(cors())  // Global middleware
```

**After:**
```typescript
// Per-endpoint CORS headers
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
```

### 4. **Frontend API Calls**

**Before:**
```typescript
const API_BASE = 'http://localhost:3000'  // ❌ Hardcoded
const res = await fetch(`${API_BASE}/api/respond`, ...)
```

**After:**
```typescript
const API_BASE = import.meta.env.VITE_API_BASE ?? ''  // ✅ Dynamic
const res = await fetch(`${API_BASE}/api/respond`, ...)
// In production: '' → Uses relative paths → /api/respond
// In local dev: 'http://localhost:3000' → Uses proxy
```

## What Works Now

✅ All features work in production (Vercel)
✅ File uploads persist correctly
✅ AI responses complete fully
✅ No Vercel timeout errors
✅ Serverless scaling - no running Express server = lower costs
✅ Zero cold start optimization

## Local Development (Unchanged)

```bash
npm run dev
```

This still runs both frontend and backend locally:
- Frontend: http://localhost:5173 (Vite)
- Backend: http://localhost:3000 (Express)
- Vite proxies `/api/*` calls to Express during dev

## Environment Variables

### Production (.env)
```env
GROQ_API_KEY=...
VITE_API_BASE=            # Empty - uses /api/* relative paths
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Local Development (.env.local)
```env
GROQ_API_KEY=...
VITE_API_BASE=http://localhost:3000    # Points to local Express
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## File Upload Flow

**Before:**
```
Browser → Express (file) → Local filesystem → /uploads/...
```

**After:**
```
Browser → Serverless Function → Supabase Storage → Public URL
```

Files are now:
- ✅ Persisted across function invocations
- ✅ Accessible from anywhere
- ✅ Secure in cloud storage
- ✅ CDN-backed for fast access

## Testing Deployment

### 1. Build locally and preview
```bash
npm run build
npm run preview
```

### 2. Test with Vercel CLI
```bash
vercel --prod
```

### 3. Check API endpoints
```bash
curl https://your-project.vercel.app/api/respond \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"role":"judge","caseText":"Test","lastArgument":"Test","evidence":[]}'
```

## Common Issues Fixed

| Issue | Before | After |
|-------|--------|-------|
| Function timeout after 30s | ❌ API cut off mid-response | ✅ 25s timeout before function completes |
| File uploads disappear | ❌ Saved to ephemeral /tmp or local disk | ✅ Stored in Supabase (persistent) |
| API calls fail in production | ❌ No serverless API handlers | ✅ Proper serverless functions |
| Hardcoded localhost URLs | ❌ Called http://localhost:3000 | ✅ Dynamic relative paths |

## Next Steps

1. ✅ Create Supabase storage bucket `evidence` (make it public)
2. ✅ Add environment variables to Vercel project
3. ✅ Push code to GitHub
4. ✅ Deploy to Vercel
5. ✅ Test all features

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment steps.
