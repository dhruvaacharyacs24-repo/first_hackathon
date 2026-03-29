import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateResponse } from './utils'

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
    const message = String(req.body?.message ?? '').trim()
    const role = String(req.body?.role ?? '') as 'prosecutor' | 'defense'
    const historyRaw = Array.isArray(req.body?.history) ? req.body.history : []

    const history = historyRaw
      .map((item: unknown) => {
        const rec = (item ?? {}) as Record<string, unknown>
        const hRole = String(rec.role ?? 'user').trim() || 'user'
        const hText = String(rec.content ?? '').trim()
        return { role: hRole, content: hText }
      })
      .filter((item: { role: string; content: string }) => item.content.length > 0)

    if (!message) {
      return res.status(400).json({ error: 'message is required' })
    }
    if (!['prosecutor', 'defense'].includes(role)) {
      return res.status(400).json({ error: 'role must be prosecutor or defense' })
    }

    const courtRole = role === 'prosecutor' ? 'prosecution' : 'defence'
    const historyPayload = history.map((h: { role: string; content: string }) => ({
      role: h.role,
      text: h.content,
    }))

    // Set timeout
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Response generation timeout')), 20000),
    )
    const replyPromise = generateResponse(courtRole, historyPayload, '', message)

    const reply = await Promise.race([replyPromise, timeoutPromise])
    const safe = reply.trim().length > 0 ? reply.trim() : 'Error: AI failed to respond'

    return res.json({ reply: safe })
  } catch (err) {
    console.error('Chat error:', err)
    return res.json({ reply: 'Error: AI failed to respond' })
  }
}
