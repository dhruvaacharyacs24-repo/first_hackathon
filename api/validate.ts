import type { VercelRequest, VercelResponse } from '@vercel/node'
import { validateStatementWithLLM } from './utils'

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
    const statement = String(req.body?.statement ?? '')

    const valid = await validateStatementWithLLM(statement)

    return res.json({ valid })
  } catch (err) {
    console.error('Validation error:', err)
    return res.status(500).json({ valid: String(req.body?.statement ?? '').trim().length >= 10 })
  }
}
