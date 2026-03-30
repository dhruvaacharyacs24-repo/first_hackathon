import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { validateEvidenceWithVision } from './utils'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

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
    // Get form data from the request body
    // Note: For proper multipart handling, you might need to use a library like busboy
    // For now, we'll assume the file is sent as base64 or binary in the body

    const description = String(req.body?.description ?? '').trim()
    const fileName = String(req.body?.fileName ?? 'evidence')
    const mimeType = String(req.body?.mimeType ?? 'application/octet-stream')
    const fileBuffer = req.body?.fileBuffer // Base64 encoded or Buffer

    if (!description) {
      return res.status(400).json({ error: 'Missing description' })
    }

    if (!fileBuffer) {
      return res.status(400).json({ error: 'Missing file' })
    }

    // Convert base64 to buffer if needed
    let buffer: Buffer
    if (typeof fileBuffer === 'string') {
      buffer = Buffer.from(fileBuffer, 'base64')
    } else if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer
    } else {
      return res.status(400).json({ error: 'Invalid file format' })
    }

    // Check file size (4.5MB limit for Vercel Free Tier)
    if (buffer.length > 4.5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large for Vercel Free tier (max 4.5MB)' })
    }

    // AI Validation for Images
    if (mimeType.startsWith('image/')) {
      try {
        const { valid, reason } = await validateEvidenceWithVision(buffer, mimeType, description)
        if (!valid) {
          return res.status(400).json({ error: `Evidence Rejected: ${reason}` })
        }
      } catch (vErr) {
        console.error('Validation step encountered an error', vErr)
        // Continue if validation fails to not block the user entirely
      }
    }

    // Upload to Supabase Storage
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const ext = sanitizedFileName.split('.').pop() || 'bin'
    const uniqueFileName = `${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`
    const filePath = `evidence/${uniqueFileName}`

    const { data, error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return res.status(500).json({ error: 'Failed to upload file to storage' })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('evidence').getPublicUrl(data.path)

    return res.json({
      fileUrl: publicUrl,
      description,
      fileName: sanitizedFileName,
      fileType: mimeType,
      storagePath: data.path,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: 'Upload failed' })
  }
}
