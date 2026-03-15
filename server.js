const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: req.body.messages,
        max_tokens: 1000
      })
    })
    const text = await response.text()
console.log('GROQ RESPONSE:', text)
const data = JSON.parse(text)
    res.json(data)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3001, () => console.log('🐙 GEO AI Server running on port 3001'))