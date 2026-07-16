import { buildSystemPrompt } from './chat-prompt.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

    const { message, languageId, context } = req.body || {}
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'Message is required' })
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'AI service is not configured' })

    try {
        // ใช้ 2.5-flash รุ่นใหม่ล่าสุด
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `${buildSystemPrompt({ languageId, context })}\n\nQuestion: ${message}` }] }] })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text
            res.status(200).json({ reply: reply.replace(/[*`#]/g, '').trim() })
        } else {
            res.status(500).json({ error: 'AI ไม่ตอบกลับ' });
        }
    } catch (error) {
        const status = error.message === 'Unsupported learning language' ? 400 : 500
        res.status(status).json({ error: error.message })
    }
}
