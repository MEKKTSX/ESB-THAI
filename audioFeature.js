// ไฟล์: features/audioFeature.js (เวอร์ชันอัปเกรดสำหรับมือถือ)
const AudioService = {
    speak: (text, lang = 'en-US') => {
        // 1. ยกเลิกเสียงที่ค้างอยู่
        window.speechSynthesis.cancel();

        // 2. สร้าง Utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        // 3. จัดการเรื่อง Voice (แก้ไขบั๊กเสียงไม่มาในครั้งแรกบนมือถือ)
        const speakNow = () => {
            const voices = window.speechSynthesis.getVoices();
            const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
                         || voices.find(v => v.lang.startsWith('en'));
            if (enVoice) utterance.voice = enVoice;
            window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length !== 0) {
            speakNow();
        } else {
            // ถ้า voices ยังไม่โหลด (พบบ่อยในมือถือ) ให้รอจนกว่าจะโหลดเสร็จ
            window.speechSynthesis.onvoiceschanged = speakNow;
        }
    }
};

const SpeakerButton = ({ text, className = "" }) => {
    return (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                // 💡 ปลุกระบบเสียง (บางเบราว์เซอร์ต้องการการสั่ง Resume ก่อน)
                if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                }
                AudioService.speak(text);
            }}
            className={`p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all ${className}`}
            title="Listen"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
        </button>
    );
};

window.ESB_Features = window.ESB_Features || {};
window.ESB_Features.Speaker = SpeakerButton;
window.ESB_Features.AudioService = AudioService;