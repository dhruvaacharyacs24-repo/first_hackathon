// LocalTesting.md - How to test serverless functions locally

## Testing with Vercel Functions Locally

### Option 1: Use Vercel CLI (Best)

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Test serverless functions locally
vercel dev
```

This starts a local environment that mimics Vercel's serverless functions.

### Option 2: Keep Express Running

For backward compatibility, keep `npm run backend` running:

```bash
npm run backend  # Runs backend/server.ts with Express
```

Then in another terminal:

```bash
npm run frontend  # Runs Vite frontend
```

The frontend will proxy requests to Express automatically.

### Option 3: Manual cURL Testing

Test individual endpoints:

```bash
# Test AI response endpoint
curl -X POST http://localhost:3000/api/respond \
  -H "Content-Type: application/json" \
  -d '{
    "role": "judge",
    "caseText": "Theft case",
    "lastArgument": "The accused was at the scene",
    "evidence": [],
    "history": []
  }'

# Test chat endpoint  
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "This is a meaningful legal argument",
    "role": "prosecutor",
    "history": []
  }'

# Test generate endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "prosecution",
    "input": "The evidence clearly shows guilt",
    "caseString": "Murder case",
    "history": []
  }'
```

## Environment Variables for Testing

Make sure `.env.local` has:

```env
GROQ_API_KEY=your_key_here
VITE_API_BASE=http://localhost:3000
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Testing File Uploads

**Note:** The `upload-evidence` endpoint requires multipart form data. 

Since the serverless version expects base64-encoded data, you'll need to:

1. Use the browser UI to test file uploads
2. Or use a multipart-capable client

For now, file uploads work through the browser frontend.
