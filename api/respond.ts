import type { VercelRequest, VercelResponse } from '@vercel/node'
import Groq from 'groq-sdk'

// --- Inlined Utilities to solve Vercel Module Resolution issues ---
const apiKey = process.env.GROQ_API_KEY
const groq = new Groq({
  apiKey: apiKey || 'MISSING_API_KEY',
})

type HistoryTurn = { role: string; text: string }
type EvidenceSummary = { description: string; fileType: string }

function formatCaseWithEvidence(caseText: string, evidence: EvidenceSummary[]): string {
  if (!evidence || evidence.length === 0) return caseText
  const block = (evidence || [])
    .flatMap((e) => {
      if (!e) return []
      return [
        `* Description: ${String(e.description ?? '').slice(0, 600)}`,
        `  File type: ${String(e.fileType ?? '').slice(0, 120)}`,
      ]
    })
    .join('\n')
  return `${caseText}\n\nEvidence:\n${block}\n\nConsider the following evidence while responding.`
}

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

async function generateResponse(
  role: string,
  history: HistoryTurn[] = [],
  caseString = '',
  input = '',
): Promise<string> {
  const fullPrompt = `You are acting as a ${role} in a courtroom.
  
Case: ${caseString || 'Not provided'}

Rules:
- DO NOT REPEAT previous arguments or phrases. Always move the case forward.
- Introduce new legal challenges or facts based on the latest input.
- Keep responses formal, sharp, and strictly 2-3 lines.

Latest Input:
${input}
`

  // SLIDING WINDOW: Only send the last 8 messages to keep the prompt fast and within the 9s limit
  const recentHistory = history.slice(-8)

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...recentHistory.map((h: HistoryTurn) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: h.text,
    })),
    { role: 'user', content: fullPrompt },
  ]

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.5, // Discourage repetition
    })

    const response = completion.choices[0]?.message?.content
    if (!response) return 'AI Error: Empty response from engine.'
    return response.trim()
  } catch (error: any) {
    const msg = error?.message || String(error)
    return `AI Error: ${msg}`
  }
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
    const role = String(req.body?.role ?? '') as 'prosecution' | 'defence' | 'judge'
    const caseText = String(req.body?.caseText ?? '')
    const lastArgument = String(req.body?.lastArgument ?? '')
    const evidenceRaw = Array.isArray(req.body?.evidence) ? req.body.evidence : []

    const evidence: EvidenceSummary[] = evidenceRaw
      .map((e: unknown) => {
        const rec = (e ?? {}) as Record<string, unknown>
        return {
          description: String(rec.description ?? ''),
          fileType: String(rec.fileType ?? ''),
        }
      })
      .filter((e: EvidenceSummary) => e.description.trim().length > 0 || e.fileType.trim().length > 0)

    if (!['prosecution', 'defence', 'judge'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const caseString = formatCaseWithEvidence(caseText, evidence)
    const historyRaw = req.body?.history
    const history = normalizeHistoryPayload(historyRaw)

    // Set 9s timeout for Vercel 10s limit
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('The Judge is thinking too slowly (9s Timeout). Please try again.')), 9000),
    )
    const generationPromise = generateResponse(role, history, caseString, lastArgument)

    const text = await Promise.race([generationPromise, timeoutPromise])

    return res.status(200).json({ text })
  } catch (err: any) {
    console.error('LLM error:', err)
    return res.status(500).json({ 
      error: err.message || String(err),
      stack: err.stack 
    })
  }
}
