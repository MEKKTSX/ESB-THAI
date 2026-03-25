const AudioService = {
    speak: function(text, lang = 'en-US', speed = 1.0) {
        // 1. ตรวจสอบภาษา ('en' หรือ 'th')
        const languageCode = lang.includes('en') ? 'en' : 'th';
        
        // 2. แอบเนียนใช้ API เสียงของ Google Translate (เสียงมนุษย์ที่เป็นธรรมชาติกว่า)
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${languageCode}&q=${encodeURIComponent(text)}`;
        
        // 3. สร้าง Audio Object และเล่นเสียง
        const audio = new Audio(url);
        
        // ปรับความเร็วเสียงตามหน้า Settings
        audio.playbackRate = speed;
        
        audio.play().catch(error => {
            console.warn("เน็ตอาจจะหลุด หรือ Google บล็อค สลับไปใช้เสียงหุ่นยนต์สำรอง...", error);
            
            // 4. แผนสำรอง (Fallback) ถ้าเล่นเสียงจากเน็ตไม่ได้ ให้กลับไปใช้เสียงในเครื่อง
            window.speechSynthesis.cancel();
            const fallbackVoice = new SpeechSynthesisUtterance(text);
            fallbackVoice.lang = lang;
            fallbackVoice.rate = speed * 0.85; // ทำให้ช้าลงนิดนึงจะได้ฟังรู้เรื่อง
            window.speechSynthesis.speak(fallbackVoice);
        });
    }
};

// ส่งออกไปให้ app.js ใช้งาน
window.ESB_Features = window.ESB_Features || {};
window.ESB_Features.AudioService = AudioService;
