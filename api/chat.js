export default async function handler(req, res) {
    // ดักฟังเฉพาะ Method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, systemPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // ใช้ 2.5-flash รุ่นใหม่ล่าสุด
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\nคำถาม: ${message}` }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            // ส่งคำตอบกลับ และลบสัญลักษณ์รกๆ ออก
            res.status(200).json({ reply: reply.replace(/[*`#]/g, '').trim() });
        } else {
            res.status(500).json({ error: 'AI ไม่ตอบกลับ' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
