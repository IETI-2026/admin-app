import cors from 'cors'
import express from 'express'
import path from 'path'
import { documentVerificationRouter } from './routes/documentVerification'
import { skillSuggestionsRouter } from './routes/skillSuggestions'

const app = express()
const PORT = Number(process.env.ADMIN_SERVER_PORT ?? 4000)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json({ limit: '20mb' }))

app.use('/admin-api/skill-suggestions', skillSuggestionsRouter)
app.use('/admin-api/document-verification', documentVerificationRouter)

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('/(.*)', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Admin server running on http://localhost:${PORT}`)
})

export default app
