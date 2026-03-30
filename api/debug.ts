import type { VercelRequest, VercelResponse } from '@vercel/node'
import Groq from 'groq-sdk'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const groqKey = process.env.GROQ_API_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY

  const debugInfo: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      GROQ_API_KEY: groqKey ? `Exists (Prefix: ${groqKey.substring(0, 4)}..., Length: ${groqKey.length})` : 'MISSING',
      VITE_SUPABASE_URL: supabaseUrl ? 'Exists' : 'MISSING',
      VITE_SUPABASE_ANON_KEY: supabaseAnon ? 'Exists' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: supabaseService ? 'Exists' : 'MISSING',
    },
    headers: req.headers,
  }

  // Test Groq connection if key exists
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey })
      const start = Date.now()
      await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5,
      })
      debugInfo.groqTest = {
        status: 'SUCCESS',
        latencyMs: Date.now() - start,
      }
    } catch (err: any) {
      debugInfo.groqTest = {
        status: 'FAILED',
        error: err.message || String(err),
      }
    }
  }

  return res.status(200).json(debugInfo)
}
