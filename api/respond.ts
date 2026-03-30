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

    // Set timeout for long-running operation
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('The Judge is thinking too slowly (9s Timeout). Please try again.')), 9000),
    )
    const generationPromise = generateResponse(role, history, caseString, lastArgument)

    const text = await Promise.race([generationPromise, timeoutPromise])

    return res.status(200).json({ text })
  } catch (err) {
    console.error('LLM error:', err)
    return res.status(500).json({ error: 'Failed to generate response' })
  }
}
