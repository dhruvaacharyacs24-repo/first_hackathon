import type { VercelRequest, VercelResponse } from '@vercel/node'
import Groq from 'groq-sdk'

// --- Inlined Utilities to solve Vercel Module Resolution issues ---
const apiKey = process.env.GROQ_API_KEY
const groq = new Groq({
  apiKey: apiKey || 'MISSING_API_KEY',
})

type HistoryTurn = { role: string; text: string }
type EvidenceSummary = { description: string; fileType: string }

function normalizeHistoryPayload(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const rec = (item ?? {}) as Record<string, unknown>
    const roleStr = String(rec.role ?? '').toLowerCase()
    return {
      role: roleStr.includes('assistant') ? 'assistant' : 'user',
      text: String(rec.text ?? rec.content ?? ''),
    }
  })
}

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const historyRaw = req.body?.history
    const caseText = String(req.body?.caseText ?? '')
    const evidenceRaw = Array.isArray(req.body?.evidence) ? req.body.evidence : []

    const history = normalizeHistoryPayload(historyRaw)
    const evidence: EvidenceSummary[] = evidenceRaw.map((e: any) => ({
      description: String(e.description ?? ''),
      fileType: String(e.fileType ?? ''),
    }))

    const prompt = `Evaluate this courtroom simulation.
Case: ${caseText}
Trial History (Recent 12 turns):
${history.slice(-12).map((h) => `[${h.role.toUpperCase()}] ${h.text}`).join('\n')}
Evidence: ${evidence.map((e) => `- ${e.description}`).join('\n')}

Rules:
1. Decide winner: PROSECUTION or DEFENCE. (NO TIES).
2. Provide formal reasoning (2-3 sentences).

Respond STRICTLY in JSON:
{ "winner": "PROSECUTION", "judgement": "..." }
`

    // Set 9s timeout for Vercel 10s limit
    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error('The Judge is thinking too slowly (9s Timeout). Please try again.')), 9000),
    )

    const verdictPromise = (async () => {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      })

      const resText = completion.choices[0]?.message?.content || '{}'
      const result = JSON.parse(resText)

      if (!result.winner || !['PROSECUTION', 'DEFENCE'].includes(result.winner.toUpperCase())) {
        result.winner = Math.random() > 0.5 ? 'PROSECUTION' : 'DEFENCE'
      }
      return result
    })()

    const result = await Promise.race([verdictPromise, timeoutPromise])
    return res.json(result)
  } catch (err: any) {
    console.error('Verdict error:', err)
    return res.status(500).json({ error: err.message || 'Judge failed to reach a verdict.' })
  }
}
