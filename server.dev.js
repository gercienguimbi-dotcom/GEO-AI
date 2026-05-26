// Serveur local uniquement pour le développement
// En production sur Vercel, c'est api/chat.js qui est utilisé
import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'

// Charge les variables d'environnement depuis .env
let GROQ_API_KEY = process.env.GROQ_API_KEY
if (!GROQ_API_KEY) {
  try {
    const env = readFileSync('.env', 'utf-8')
    GROQ_API_KEY = env.match(/GROQ_API_KEY=(.+)/)?.[1]?.trim()
  } catch {}
}

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY manquante dans .env' })
  }
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: req.body.messages,
        max_tokens: 1000,
      }),
    })
    const data = await response.json()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3001, () => console.log('🌍 Dev server → http://localhost:3001'))
