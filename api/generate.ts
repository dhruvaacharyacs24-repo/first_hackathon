import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateResponse, normalizeHistoryPayload } from './utils'

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
    const body = req.body ?? {}
    const {
      mode,
      input: inputRaw,
      history: historyRaw = [],
      caseString: caseRaw,
    } = body as {
      mode?: string
      input?: string
      history?: unknown[]
      caseString?: string
    }

    const input = String(inputRaw ?? '')
    const caseString = String(caseRaw ?? '')
    const history = normalizeHistoryPayload(historyRaw)

    // Set timeout for long-running operation
    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error('Response generation timeout')), 25000),
    )

    const generatePromise = (async () => {
      let replies: { role: string; text: string }[] = []

      if (mode === 'prosecution') {
        const updatedHistory = [
          ...history,
          { role: 'prosecution', text: input },
        ]

        const [defence, judge] = await Promise.all([
          generateResponse('defence', updatedHistory, caseString, input),
          generateResponse('judge', updatedHistory, caseString, input),
        ])

        replies = [
          { role: 'defence', text: defence.trim() },
          { role: 'judge', text: judge.trim() },
        ]
      } else if (mode === 'defence') {
        const prosecution = await generateResponse('prosecution', history, caseString, '')

        replies = [{ role: 'prosecution', text: prosecution.trim() }]
      } else if (mode === 'demo') {
        const [prosecution, defence, judge] = await Promise.all([
          generateResponse('prosecution', history, caseString, ''),
          generateResponse('defence', history, caseString, ''),
          generateResponse('judge', history, caseString, ''),
        ])

        replies = [
          { role: 'prosecution', text: prosecution.trim() },
          { role: 'defence', text: defence.trim() },
          { role: 'judge', text: judge.trim() },
        ]
      } else {
        throw new Error('Invalid mode')
      }

      return { replies }
    })()

    const result = await Promise.race([generatePromise, timeoutPromise])

    return res.status(200).json(result)
  } catch (err) {
    console.error('Endpoint ERROR:', err)
    return res.status(500).json({ error: 'Server error', replies: [] })
  }
}
