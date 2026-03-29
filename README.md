# AI Courtroom Simulator

An AI-powered courtroom simulation application where you can witness intelligent legal arguments between prosecutors, defense attorneys, and judges powered by Groq AI.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API Key (free from https://console.groq.com)
- Supabase account (free tier at https://supabase.com)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd ai-courtroom-simulator
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000 (API)

## 📱 Features

- **AI-Powered Responses**: Uses Groq's LLaMA model for realistic legal arguments
- **Multiple Court Roles**: Prosecution, Defense, and Judge AI personalities
- **Evidence Management**: Upload and validate case evidence (images, PDFs, documents)
- **Court Scenarios**: Pre-built case types (theft, murder, fraud, assault)
- **Verdict Generation**: AI judge provides reasoned verdicts based on trial

## 🏗️ Architecture

### Frontend (React + Vite)
- `src/App.tsx` - Main courtroom UI
- `src/lib/supabase.ts` - Supabase client
- Interactive court interface with Spline 3D models

### Backend (Vercel Serverless)
- `api/respond.ts` - AI courtroom responses
- `api/generate.ts` - Multi-party generation
- `api/chat.ts` - Chat endpoint
- `api/verdict.ts` - Final judgments
- `api/upload-evidence.ts` - File storage
- `api/utils.ts` - Shared utilities

### Storage
- **Files**: Supabase Storage (persistent cloud storage)
- **Database**: Supabase PostgreSQL (optional for future features)

## 📖 Documentation

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Production deployment guide
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Backend transformation details
- [LOCAL_TESTING.md](./LOCAL_TESTING.md) - Testing serverless functions locally

## 🚢 Deployment to Vercel

### One-Click Deploy

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables:
   - `GROQ_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional but recommended)
5. Deploy!

Your app will be live at `https://your-project.vercel.app`

### Detailed Guide

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for step-by-step instructions including:
- Supabase storage bucket setup
- Environment variable configuration
- Troubleshooting common issues

## 🔧 Environment Variables

```env
# Required
GROQ_API_KEY=your_groq_api_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional but recommended
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Development
VITE_API_BASE=http://localhost:3000  # Local dev only
PORT=3000
```

## 📊 API Endpoints

All endpoints use JSON and support CORS.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/respond` | POST | Get AI responses for a court role |
| `/api/generate` | POST | Generate multi-party responses |
| `/api/chat` | POST | Simple chat interface |
| `/api/verdict` | POST | Get AI judge verdict |
| `/api/upload-evidence` | POST | Upload evidence files |
| `/api/validate` | POST | Validate statements |

## 🧪 Testing

### Local Testing
```bash
npm run dev
```

### API Testing with cURL
```bash
curl -X POST http://localhost:3000/api/respond \
  -H "Content-Type: application/json" \
  -d '{"role":"judge","caseText":"Test case","lastArgument":"Test","evidence":[]}'
```

### Production Testing
```bash
vercel --prod  # Deploy for testing
```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Spline 3D
- **Backend**: Vercel Serverless, Groq AI, Express (local dev)
- **Storage**: Supabase (PostgreSQL + Cloud Storage)
- **Deployment**: Vercel

## 📄 License

Your License Here

## 🤝 Contributing

Contributions welcome! Please follow the coding style and add tests for new features.

## 📞 Support

- Issues: GitHub Issues
- Docs: Check markdown files in project root
- API: Groq documentation at https://console.groq.com
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
"# first_hackathon" 
