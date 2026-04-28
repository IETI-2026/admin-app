import { Router } from 'express'
import { addDocument, getAndDeleteDocument, listDocuments } from '../store/documentStore'

export const documentVerificationRouter = Router()

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

// POST / — receives document forwarded from main backend (server-to-server, no auth)
documentVerificationRouter.post('/', (req, res) => {
  const { userId, fileName, mimeType, fileBase64 } = req.body as {
    userId?: string
    fileName?: string
    mimeType?: string
    fileBase64?: string
  }

  if (!userId || !fileName || !mimeType || !fileBase64) {
    res.status(400).json({ message: 'userId, fileName, mimeType and fileBase64 are required' })
    return
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    res.status(400).json({ message: 'mimeType not allowed' })
    return
  }

  const meta = addDocument(userId, fileName, mimeType, fileBase64)
  res.status(201).json(meta)
})

// GET / — admin lists pending documents (metadata only, image not included)
// Optional ?userId= filter to fetch documents for a specific provider
// Auth guard commented out for MVP — uncomment requireAdminAuth when auth is wired
// documentVerificationRouter.use(requireAdminAuth)
documentVerificationRouter.get('/', (req, res) => {
  const userId = req.query.userId as string | undefined
  const allItems = listDocuments()
  const items = userId ? allItems.filter((d) => d.userId === userId) : allItems
  res.json({ items, total: items.length })
})

// GET /:id/image — serves the image once, then removes it from memory
documentVerificationRouter.get('/:id/image', (req, res) => {
  const { id } = req.params
  const doc = getAndDeleteDocument(id)

  if (!doc) {
    res.status(404).json({ message: 'Document not found or already viewed' })
    return
  }

  res.json({
    id: doc.id,
    userId: doc.userId,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    fileBase64: doc.fileBase64,
    receivedAt: doc.receivedAt,
  })
})
