import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  generateResponse,
  normalizeHistoryPayload,
  formatCaseWithEvidence,
} from './utils'
import type { EvidenceSummary } from './utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Isolation Test: Ensure the URL and Body parsing are working on Vercel
    const bodyText = JSON.stringify(req.body ?? {}).slice(0, 50)
    return res.status(200).json({ 
      text: `AI Engine (Isolation Mode): Detected role: ${req.body?.role || 'None'}. Body snippet: ${bodyText}...`
    })
  } catch (err: any) {
    return res.status(500).json({ error: `Isolation Crash: ${err.message}` })
  }
}
