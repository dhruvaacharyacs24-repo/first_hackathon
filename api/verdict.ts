import { VercelRequest, VercelResponse } from '@vercel/node'
import Groq from 'groq-sdk'
import { normalizeHistoryPayload, EvidenceSummary } from './utils'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

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
    const historyRaw = req.body?.history
    const caseText = String(req.body?.caseText ?? '')
    const evidenceRaw = Array.isArray(req.body?.evidence) ? req.body.evidence : []

    const history = normalizeHistoryPayload(historyRaw)
    const evidence: EvidenceSummary[] = evidenceRaw.map((e: any) => ({
      description: String(e.description ?? ''),
      fileType: String(e.fileType ?? ''),
    }))

    const prompt = [
      'Evaluate the following courtroom simulation and provide a final verdict.',
      '',
      'Case Details:',
      caseText,
      '',
      'Trial History:',
      history.map((h) => `[${h.role.toUpperCase()}] ${h.text}`).join('\n'),
      '',
      'Evidence Presented:',
      evidence.map((e) => `- ${e.description} (${e.fileType})`).join('\n'),
      '',
      'Rules for Judgment:',
      '1. Analyze the strength of arguments from both Prosecution and Defence.',
      '2. Consider the relevance and impact of the evidence.',
      '3. Decide on a winner: PROSECUTION or DEFENCE. There are NO TIES.',
      '4. Provide a detailed, formal reasoning in 3-4 sentences.',
      '',
      'Respond STRICTLY in JSON format:',
      '{ "winner": "PROSECUTION", "judgement": "..." } or { "winner": "DEFENCE", "judgement": "..." }',
    ].join('\n')

    // Set timeout for generation
    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error('Verdict generation timeout')), 25000),
    )

    const verdictPromise = (async () => {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      })

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}')

      // Fallback if AI skips the winner key or returns invalid
      if (!result.winner || !['PROSECUTION', 'DEFENCE'].includes(result.winner.toUpperCase())) {
        result.winner = Math.random() > 0.5 ? 'PROSECUTION' : 'DEFENCE'
      }

      return result
    })()

    const result = await Promise.race([verdictPromise, timeoutPromise])

    return res.json(result)
  } catch (err) {
    console.error('Verdict error:', err)
    return res.status(500).json({ error: 'Judge failed to reach a verdict.' })
  }
}
