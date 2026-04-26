window.ESB_Features = window.ESB_Features || {};

window.ESB_Features.AITypingChallenge = ({ onClose, srsData, allSentencesFlat, AudioService }) => {
    const { useState, useEffect, useRef } = React;
    
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [mistakes, setMistakes] = useState(0);
    const [status, setStatus] = useState('idle'); // 'idle', 'correct', 'failed'
    const [isLoading, setIsLoading] = useState(true);

    const inputRef = useRef(null);

    // 1. ฟังก์ชันดึง Data และสั่ง AI Gen ประโยค
    useEffect(() => {
        const generateAISentences = async () => {
            // ดึงประโยคที่เคยทำ SRS ไปแล้ว
            const learnedCards = allSentencesFlat.filter(c => srsData[c.uniqueId]);
            
            // สุ่มมาสัก 20 ประโยคเพื่อส่งให้ AI เป็นต้นแบบ
            const shuffled = window.Utils.shuffleArray(learnedCards).slice(0, 20);
            const templates = shuffled.map(c => c.en).join(" | ");

            // ประวัติประโยคที่เคย Gen ไปแล้ว (ดึงจาก LocalStorage)
            let history = [];
            try { history = JSON.parse(localStorage.getItem('esb_ai_history')) || []; } catch(e) {}

            const systemPrompt = `คุณคือ AI สำหรับแอปเรียนภาษาอังกฤษ สร้างโจทย์ดัดแปลงจากโครงสร้างประโยคเหล่านี้: ${templates}
            
            กฎการสร้าง:
            1. เลือกโครงสร้างประโยคที่ดัดแปลงได้ (เช่น I wish I had..., Do you know where...) ข้ามประโยคตายตัวเช่น How are you?, Definitely.
            2. ดัดแปลงคำศัพท์ (Noun, Verb, Adjective) ให้เป็นประโยคใหม่ที่ความหมายเปลี่ยนไปแต่โครงสร้างเดิม
            3. สร้างมา 10 ประโยค ไม่ให้ซ้ำกับประวัติเหล่านี้: ${history.slice(-50).join(", ")}
            4. คืนค่าเป็น JSON Array ที่มี key: "en" (ประโยคภาษาอังกฤษที่ดัดแปลงแล้ว) และ "th" (คำแปลภาษาไทยของประโยคนั้น) ห้ามมีข้อความอื่นนอกจาก JSON`;

            try {
                // เรียกใช้ Vercel API ของคุณ
                const response = await fetch("/api/chat", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: "Generate 10 challenge sentences.", systemPrompt: systemPrompt })
                });
                
                const data = await response.json();
                
                // คาดหวังว่า AI จะส่งกลับมาเป็น String ที่มีโครงสร้าง JSON (อาจต้องใช้ Regex ช่วยตัดกรอบ ```json ออกถ้า AI ใส่มา)
                const jsonMatch = data.reply.match(/\[.*\]/s); 
                const generatedData = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

                if (generatedData.length > 0) {
                    setQueue(generatedData);
                    // บันทึกประวัติกันซ้ำ
                    const newHistory = [...history, ...generatedData.map(g => g.en)].slice(-100);
                    localStorage.setItem('esb_ai_history', JSON.stringify(newHistory));
                } else {
                    alert("AI Error: ไม่สามารถสร้างโจทย์ได้");
                    onClose();
                }
            } catch (error) {
                console.error("AI Generation failed:", error);
                alert("เชื่อมต่อ AI ล้มเหลว");
                onClose();
            } finally {
                setIsLoading(false);
            }
        };

        generateAISentences();
    }, []);

    useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, [currentIndex, status, mistakes]);

    const checkAnswer = () => {
        if (!userInput.trim()) return;
        
        const currentCard = queue[currentIndex];
        const cleanStr = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
        
        if (cleanStr(userInput) === cleanStr(currentCard.en)) {
            setStatus('correct');
            AudioService?.speak(currentCard.en, 'en-US');
            setTimeout(() => { handleNext(); }, 1500);
        } else {
            // ระบบ 3 Strikes
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setUserInput(''); // ล้างช่องพิมพ์ให้พิมพ์ใหม่
            
            if (newMistakes >= 3) {
                setStatus('failed');
                AudioService?.speak(currentCard.en, 'en-US');
            }
        }
    };

    const handleNext = () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(c => c + 1);
            setUserInput('');
            setMistakes(0);
            setStatus('idle');
        } else {
            onClose(); 
        }
    };

    if (isLoading) return <div className="fixed inset-0 z-[200] bg-[#0B1121] flex items-center justify-center text-brand-yellow font-bold text-xl animate-pulse">🤖 AI is generating your daily challenge...</div>;
    if (queue.length === 0) return null;

    const currentCard = queue[currentIndex];
    
    // Logic สร้างคำใบ้ตามจำนวนที่ตอบผิด
    let hintText = "";
    if (mistakes === 1) {
        hintText = currentCard.en.substring(0, 3) + "..."; // ใบ้ 3 ตัวอักษรแรก
    } else if (mistakes === 2) {
        const words = currentCard.en.split(' ');
        hintText = words.slice(0, Math.ceil(words.length / 2)).join(' ') + "..."; // ใบ้ครึ่งประโยค
    } else if (mistakes >= 3) {
        hintText = currentCard.en; // เฉลยทั้งหมด
    }

    return (
        <div className="fixed inset-0 z-[200] bg-[#0B1121] text-slate-200 flex flex-col font-sans animate-in slide-in-from-bottom-4 duration-300">
            <header className="flex items-center justify-between p-5 border-b border-white/5 bg-[#151F32]">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><span className="material-symbols-outlined text-slate-400">close</span></button>
                <div className="text-center">
                    <h2 className="font-bold text-brand-yellow tracking-widest uppercase text-sm">AI Daily Challenge</h2>
                    <p className="text-[10px] text-slate-400 mt-1">{currentIndex + 1} / {queue.length}</p>
                </div>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center relative">
                <div className="mb-4">
                    <span className="px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-brand-accent/10 text-brand-accent border-brand-accent/20">
                        Translate to English 🇹🇭 ➔ 🇬🇧
                    </span>
                </div>

                <div className="w-full max-w-md bg-[#151F32] p-8 rounded-3xl border border-white/5 shadow-2xl mb-8 relative text-center">
                    <p className="text-2xl font-bold text-brand-yellow leading-relaxed mb-4">{currentCard.th}</p>
                    
                    {/* พื้นที่แสดงคำใบ้ */}
                    <div className="h-8">
                        {mistakes > 0 && status !== 'correct' && (
                            <p className={`text-lg font-mono tracking-widest ${mistakes >= 3 ? 'text-rose-500' : 'text-slate-400'}`}>
                                {hintText}
                            </p>
                        )}
                    </div>
                    
                    {/* จุดไข่ปลาบอกจำนวนครั้งที่พลาด */}
                    <div className="flex justify-center gap-2 mt-4">
                        {[1, 2, 3].map(strike => (
                            <div key={strike} className={`w-2 h-2 rounded-full ${mistakes >= strike ? 'bg-rose-500' : 'bg-slate-700'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="w-full max-w-md relative">
                    <input 
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => { setUserInput(e.target.value); if(status !== 'failed') setStatus('idle'); }}
                        onKeyDown={(e) => e.key === 'Enter' && status === 'idle' && checkAnswer()}
                        disabled={status === 'correct' || status === 'failed'}
                        placeholder={mistakes >= 3 ? "Click Next to continue" : "Type English translation..."}
                        autoComplete="off" spellCheck="false"
                        className={`w-full bg-[#151F32] border-2 rounded-2xl py-5 px-6 text-xl text-white outline-none transition-all text-center ${
                            status === 'correct' ? 'border-emerald-500 text-emerald-400' : 
                            status === 'failed' ? 'border-rose-500 text-rose-400' : 
                            'border-slate-700 focus:border-brand-blue'
                        }`}
                    />
                </div>
            </div>

            <footer className="p-6 flex gap-4 max-w-md mx-auto w-full pb-safe">
                {status === 'failed' ? (
                    <button onClick={handleNext} className="w-full py-4 rounded-2xl font-bold text-white shadow-lg bg-rose-500 active:scale-95 transition-all">
                        Next Word
                    </button>
                ) : (
                    <button 
                        onClick={status === 'correct' ? handleNext : checkAnswer}
                        disabled={!userInput.trim() && status !== 'correct'}
                        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                            status === 'correct' ? 'bg-emerald-500' : 'bg-brand-blue disabled:opacity-50'
                        }`}
                    >
                        {status === 'correct' ? 'Next' : 'Check Answer'}
                    </button>
                )}
            </footer>
        </div>
    );
};
