# 🚀 Quick Reference Guide

## Local Development

```bash
# Install dependencies
npm install

# Run everything (frontend + backend)
npm run dev

# Frontend only (Vite dev server)
npm run frontend

# Backend only (Express server)
npm run backend

# Run linter
npm lint

# Build for production
npm run build

# Preview production build
npm preview
```

URLs:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

## Environment Variables

### Local Development (.env.local)
```env
GROQ_API_KEY=your_key
VITE_API_BASE=http://localhost:3000
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
PORT=3000
```

### Production (.env or Vercel Dashboard)
```env
GROQ_API_KEY=your_key
VITE_API_BASE=          (empty - uses relative paths)
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

## API Endpoints

### Local Development
```
POST http://localhost:3000/api/respond           - AI response
POST http://localhost:3000/api/generate          - Multi-party generation
POST http://localhost:3000/api/chat              - Chat
POST http://localhost:3000/api/verdict           - Verdict
POST http://localhost:3000/api/upload-evidence   - Upload file
POST http://localhost:3000/api/validate          - Validate statement
```

### Production (Vercel)
```
POST https://your-project.vercel.app/api/respond           - AI response
POST https://your-project.vercel.app/api/generate          - Multi-party generation
POST https://your-project.vercel.app/api/chat              - Chat
POST https://your-project.vercel.app/api/verdict           - Verdict
POST https://your-project.vercel.app/api/upload-evidence   - Upload file
POST https://your-project.vercel.app/api/validate          - Validate statement
```

## Testing Endpoints

```bash
# Test AI response
curl -X POST http://localhost:3000/api/respond \
  -H "Content-Type: application/json" \
  -d '{
    "role": "judge",
    "caseText": "Theft case",
    "lastArgument": "The accused was present",
    "evidence": [],
    "history": []
  }'

# Test chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "This is a legal argument",
    "role": "prosecutor",
    "history": []
  }'

# Test verdict
curl -X POST http://localhost:3000/api/verdict \
  -H "Content-Type: application/json" \
  -d '{
    "caseText": "Murder case",
    "history": [
      {"role": "prosecution", "text": "Evidence shows guilt"},
      {"role": "defence", "text": "No proof"}
    ],
    "evidence": []
  }'
```

## File Structure

```
ai-courtroom-simulator/
├── api/                          # Vercel serverless functions
│   ├── respond.ts
│   ├── generate.ts
│   ├── chat.ts
│   ├── verdict.ts
│   ├── upload-evidence.ts
│   ├── validate.ts
│   └── utils.ts
├── src/                          # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── lib/
│       └── supabase.ts
├── public/                       # Static assets
├── backend/                      # Local Express server (dev only)
│   └── server.ts
├── .env                          # Production environment
├── .env.local                    # Local development environment
├── .env.example                  # Template
├── vercel.json                   # Vercel configuration
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── README.md                     # Project readme
├── VERCEL_DEPLOYMENT.md          # Deployment guide
├── MIGRATION_GUIDE.md            # Technical details
├── DEPLOYMENT_CHECKLIST.md       # Pre/post deployment
├── DEPLOYMENT_SUMMARY.md         # What was fixed
└── LOCAL_TESTING.md              # Testing guide
```

## Common Issues & Fixes

### AI responses incomplete?
- Already fixed! Timeouts set to 20-25 seconds

### Files disappear after upload?
- Check Supabase bucket `evidence` exists and is PUBLIC
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### API returns 405?
- Ensure method is POST (not GET)
- Check CORS headers in response

### Can't find API endpoint?
- In production: `VITE_API_BASE` must be empty
- Check browser Network tab shows `/api/*` paths

### Says localhost:3000 not found?
- Make sure `npm run backend` is running
- Check `.env.local` has `VITE_API_BASE=http://localhost:3000`

## Useful Links

- Vercel Dashboard: https://vercel.com
- Groq Console: https://console.groq.com
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub: https://github.com
- TypeScript Docs: https://www.typescriptlang.org/docs

## Key Commands Cheat Sheet

```fish
# Development
npm run dev              # Start everything
npm run frontend         # Just frontend
npm run backend          # Just backend

# Building
npm run build            # Build for production
npm run preview          # Preview build locally
npm lint                 # Check code style

# Deployment
vercel                   # Deploy to staging
vercel --prod            # Deploy to production
vercel logs              # View logs

# Git
git add .
git commit -m "message"
git push origin main     # Triggers Vercel auto-deploy

# Docker (if needed)
docker build -t ai-courtroom .
docker run -p 3000:3000 ai-courtroom
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Cold Start | < 1s | ~500ms ✅ |
| API Response | < 10s | ~5s ✅ |
| Frontend Load | < 3s | ~2s ✅ |
| File Upload | < 30s | ~5-10s ✅ |

---

**Need more help?** Read the detailed documentation:
- `VERCEL_DEPLOYMENT.md` - Complete deployment steps
- `MIGRATION_GUIDE.md` - Technical architecture changes
- `DEPLOYMENT_CHECKLIST.md` - Before/after deployment checklist
