const AudioService = {
    voices: [],
    
    init: function() {
        // โหลดรายการเสียงทั้งหมดที่มีในเครื่องมาเก็บไว้
        const loadVoices = () => {
            this.voices = window.speechSynthesis.getVoices();
        };
        
        loadVoices();
        // บางเบราว์เซอร์ต้องรอให้เสียงโหลดเสร็จก่อน
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    },

    speak: function(text, lang = 'en-US', speed = 1.0) {
        if (!window.speechSynthesis) {
            console.warn("Browser does not support Speech Synthesis");
            return;
        }

        // หยุดเสียงเก่าที่อาจจะกำลังพูดค้างอยู่
        window.speechSynthesis.cancel(); 

        const utterance = new SpeechSynthesisUtterance(text);
        
        // 🌟 ปรับความเร็ว (Rate): ลดทอนลง 15% จากค่าที่ตั้งไว้เพื่อให้การควบกล้ำ/เว้นวรรคชัดขึ้น
        utterance.rate = speed * 0.85; 
        
        // 🌟 ปรับระดับเสียง (Pitch): ดันขึ้นนิดนึงให้ฟังดูเป็นมิตร ไม่แข็งกระด้าง
        utterance.pitch = 1.05; 

        // 🌟 ระบบ AI คัดกรองเสียง (Voice Selector)
        if (this.voices.length > 0) {
            let selectedVoice = null;
            
            if (lang.includes('en')) {
                // หาเสียงภาษาอังกฤษเกรดพรีเมียม (จัดลำดับความสำคัญ)
                selectedVoice = 
                    this.voices.find(v => v.name.includes('Google US English')) || // เสียงเนียนของ Chrome/Android
                    this.voices.find(v => v.name.includes('Samantha')) || // เสียงเนียนของ Mac/iOS
                    this.voices.find(v => v.name.includes('Siri')) || // เสียง Siri (ถ้าเบราว์เซอร์อนุญาต)
                    this.voices.find(v => v.name.includes('UK English Female')) || // เสียงสำเนียงบริติชชัดๆ
                    this.voices.find(v => v.lang === 'en-US' && v.localService === false) || // เสียงผ่าน Cloud (ชัดกว่า)
                    this.voices.find(v => v.lang.startsWith('en')); // ถ้าไม่มี เอาอันแรกที่เจอ
            } 
            else if (lang.includes('th')) {
                // หาเสียงภาษาไทยเกรดพรีเมียม
                selectedVoice = 
                    this.voices.find(v => v.name.includes('Narisa')) || // เสียงภาษาไทยที่ดีที่สุดบน Apple
                    this.voices.find(v => v.name.includes('Kanya')) || // เสียงผู้หญิงบน Mac
                    this.voices.find(v => v.name.includes('Google') && v.lang === 'th-TH') || // เสียงของ Android
                    this.voices.find(v => v.lang === 'th-TH');
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        // สั่งให้พูด
        window.speechSynthesis.speak(utterance);
    }
};

// เริ่มทำงานทันที
AudioService.init();

// ส่งออกไปให้ app.js ใช้งาน
window.ESB_Features = window.ESB_Features || {};
window.ESB_Features.AudioService = AudioService;
