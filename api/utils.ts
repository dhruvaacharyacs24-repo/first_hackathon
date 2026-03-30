import Groq from 'groq-sdk'

const apiKey = process.env.GROQ_API_KEY
if (!apiKey) {
  console.error('Missing GROQ_API_KEY environment variable')
}
const groq = new Groq({
  apiKey: apiKey || 'MISSING_API_KEY',
})

export type HistoryTurn = { role: string; text: string }
export type EvidenceSummary = { description: string; fileType: string }

export function formatCaseWithEvidence(caseText: string, evidence: EvidenceSummary[]): string {
  if (evidence.length === 0) return caseText
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

export function validationReplyContent(content: unknown): string {
  if (content == null) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text?: string }).text ?? '')
        }
        return ''
      })
      .join('')
      .trim()
  }
  return String(content)
}

export async function generateResponse(
  role: string,
  history: HistoryTurn[] = [],
  caseString = '',
  input = '',
): Promise<string> {
  if (input) {
    const cleanedInput = input.trim().toLowerCase()
    const invalidInputs = ['hi', 'hello', 'hey', 'ok', 'okay', 'yo', 'hii']
    if (invalidInputs.includes(cleanedInput) || cleanedInput.length < 5) {
      return 'Please provide a meaningful argument related to the case.'
    }
  }

  const fullPrompt = `You are acting as a ${role} in a courtroom.

Case: ${caseString || 'Not provided'}

Rules:
- Accept user arguments even if imperfect
- Interpret the intent instead of rejecting
- Ignore casual or irrelevant inputs like greetings
- Focus only on meaningful legal arguments
- If argument is weak, challenge it instead of calling it invalid
- If multiple arguments are present, respond to the most important ones
- NEVER say 'invalid argument' unless completely irrelevant

Latest Input:
${input}

Respond logically in 2-3 lines.`

  // Create messages array - Groq works best with simple user/assistant pattern
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...history.map((h: HistoryTurn) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: h.text,
    })),
    { role: 'user', content: fullPrompt },
  ]

  try {
    console.log(`\n📨 [${role.toUpperCase()}] Generating response...`)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      console.error(`❌ [${role}] Empty response from Groq`)
      return 'API Error: The AI returned an empty response.'
    }

    console.log(`✅ [${role}] Response received: ${response.slice(0, 80)}...`)
    return response.trim()
  } catch (error: any) {
    console.error(`\n❌ GROQ ERROR for ${role}:`, error)
    const msg = error?.message || String(error)
    return `AI Error: ${msg}`
  }
}

export async function validateStatementWithLLM(statement: string): Promise<boolean> {
  return statement.trim().length >= 10
}

export async function validateEvidenceWithVision(
  imageBuffer: Buffer,
  mimeType: string,
  description: string,
): Promise<{ valid: boolean; reason: string }> {
  const base64Image = imageBuffer.toString('base64')
  const prompt = [
    `User Evidence Description: "${description}"`,
    '',
    'Analyze the provided image and description. Determine if this constitutes a valid legal document or relevant evidence for a courtroom simulation.',
    '',
    'If the image is irrelevant (e.g., food, memes, unrelated objects), reject it.',
    '',
    'Respond STRICTLY in the following format:',
    'VALID: [Brief 1-sentence reason]',
    'OR',
    'INVALID: [Brief 1-sentence reason]',
  ].join('\n')

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
      max_tokens: 150,
      temperature: 0.2,
    })

    const raw = validationReplyContent(completion?.choices?.[0]?.message?.content)
    const normalized = raw.trim().toUpperCase()

    if (normalized.startsWith('VALID')) {
      return { valid: true, reason: raw.replace(/^VALID:?\s*/i, '').trim() }
    } else if (normalized.startsWith('INVALID')) {
      return { valid: false, reason: raw.replace(/^INVALID:?\s*/i, '').trim() }
    }
  } catch (err) {
    console.error('Vision validation error', err)
  }

  return { valid: true, reason: 'Accepted (AI validation omitted due to system error)' }
}

export function normalizeHistoryPayload(raw: unknown): HistoryTurn[] {
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
