const AudioService = {
    // ⚠️ เอา API Key ที่ก๊อปมา วางในเครื่องหมายคำพูดด้านล่างนี้
    apiKey: 'sk_3aacc8e306f7312c4688a6d85f145e4d592ed8fe07206bc8', 
    
    speak: async function(text, lang = 'en-US', speed = 1.0) {
        // เลือกเสียงคนพากย์ (Rachel เป็นเสียงผู้หญิงอเมริกันที่เนียนมาก)
        const voiceId = '21m00Tcm4TlvDq8ikWAM'; 
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        try {
            // สั่งให้แอปวิ่งไปขอไฟล์เสียง MP3 จาก ElevenLabs
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2", // โมเดลนี้พูดได้ 29 ภาษารวมถึงไทย
                })
            });

            if (response.ok) {
                // เอาไฟล์ MP3 ที่ได้มาเล่น
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                audio.playbackRate = speed;
                audio.play();
            } else {
                console.warn("โควต้า ElevenLabs อาจจะหมด สลับไปใช้เสียงหุ่นยนต์แทน");
                this.fallbackSpeak(text, lang, speed);
            }
        } catch(error) {
            console.warn("เน็ตหลุด สลับไปใช้เสียงหุ่นยนต์แทน", error);
            this.fallbackSpeak(text, lang, speed);
        }
    },

    fallbackSpeak: function(text, lang, speed) {
        window.speechSynthesis.cancel();
        const fallbackVoice = new SpeechSynthesisUtterance(text);
        fallbackVoice.lang = lang.includes('en') ? 'en-US' : 'th-TH';
        fallbackVoice.rate = speed * 0.85; 
        window.speechSynthesis.speak(fallbackVoice);
    }
};

window.ESB_Features = window.ESB_Features || {};
window.ESB_Features.AudioService = AudioService;
