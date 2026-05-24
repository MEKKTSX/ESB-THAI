// ==========================================
// ⌨️ TYPING CHALLENGE FEATURE (Anki-like Smart Diff Checking)
// ==========================================
window.ESB_Features = window.ESB_Features || {};

window.ESB_Features.TypingChallengeView = ({ queue, onClose, onSaveSRS, settings }) => {
    const { useState, useEffect, useRef } = React;
    const { XIcon, Volume2Icon, CheckCircleIcon, BookIcon, SlidersIcon } = window.Icons || {};

    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showHintCount, setShowHintCount] = useState(0);
    const inputRef = useRef(null);

    const currentCard = queue[currentIndex];

    // จัดเตรียมข้อความและตัวอักษร
    const targetText = currentCard?.en || "";
    const promptText = currentCard?.th || "";

    // ปรับปรุงการสลับภาษาในการพิมพ์ (สลับได้ผ่าน Settings)
    const isThaiPrompt = true; // แปลไทย -> พิมพ์อังกฤษเป็นมาตรฐานที่ดีที่สุดสำหรับคนไทย

    // เล่นเสียงอ่านอัตโนมัติเมื่อกดตรวจคำตอบหรือเฉลย
    useEffect(() => {
        if (settings?.autoPlay && isSubmitted && currentCard && window.Utils?.speak) {
            const playSpeed = settings?.speed || 1.0;
            window.Utils.speak(targetText, 'en-US', playSpeed);
        }
    }, [currentIndex, isSubmitted, currentCard, settings, targetText]);

    // โฟกัสกล่องรับค่าอัตโนมัติเมื่อเปลี่ยนข้อ
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        setUserInput("");
        setIsSubmitted(false);
        setShowHintCount(0);
    }, [currentIndex]);

    // คีย์ลัดนำทางและให้คะแนนตามมาตรฐาน Anki (1-4 ให้คะแนนเมื่อส่งคำตอบแล้ว)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (!isSubmitted) return;
            
            // คีย์ 1-4 สำหรับประเมินผล SRS
            if (e.key === '1') {
                e.preventDefault();
                handleRate('again');
            } else if (e.key === '2') {
                e.preventDefault();
                handleRate('hard');
            } else if (e.key === '3') {
                e.preventDefault();
                handleRate('good');
            } else if (e.key === '4') {
                e.preventDefault();
                handleRate('easy');
            } 
            // Enter หรือ Spacebar เมื่อส่งคำตอบแล้ว: ถ้าถูก 100% ให้ Easy ถ้าผิดให้ Again
            else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isExactlyCorrect) {
                    handleRate('easy');
                } else {
                    handleRate('again');
                }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isSubmitted, isExactlyCorrect, currentIndex, queue]);

    if (!currentCard) {
        return (
            <div className="fixed inset-0 z-50 bg-[#0B1121] flex flex-col items-center justify-center animate-fade-in p-6">
                <div className="text-brand-yellow mb-6 text-6xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Challenge Complete!</h2>
                <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">You've successfully typed and reviewed all selected cards.</p>
                <button onClick={onClose} className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-navy-900 font-bold rounded-2xl shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all uppercase text-sm tracking-wider">
                    Go Back To Dashboard
                </button>
            </div>
        );
    }

    // ฟังก์ชันทำความสะอาดข้อความเพื่อเปรียบเทียบความถูกต้องโดยไม่ซีเรียสเรื่องตัวเล็กใหญ่หรือเครื่องหมายวรรคตอน
    const cleanText = (str) => {
        return str.toLowerCase()
                  .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"")
                  .replace(/\s{2,}/g," ")
                  .trim();
    };

    // คำนวณความถูกต้องแบบคร่าวๆ เพื่อตัดสินระบบ Easy/Again
    const userClean = cleanText(userInput);
    const targetClean = cleanText(targetText);
    const isExactlyCorrect = userClean === targetClean;

    // ระบบเปรียบเทียบคำสะกดแบบเรียลไทม์ (Spelling Realtime Diff Engine)
    const renderDiff = () => {
        const target = targetText;
        const user = userInput;
        const result = [];
        const maxLen = Math.max(target.length, user.length);
        
        // แปลงเครื่องหมายคำพูดหยักหรือตรงให้เป็นมาตรฐานเดียวกัน
        const norm = (c) => (c === '’' || c === '`' || c === '‘') ? "'" : c;

        for (let i = 0; i < maxLen; i++) {
            const tChar = target[i];
            const uChar = user[i];

            if (uChar === undefined) {
                // ตัวอักษรที่ยังไม่ได้พิมพ์ (แสดงสีเทาจางตามความคลาสสิก)
                result.push(
                    <span key={i} className="text-slate-600 font-mono tracking-wider">
                        {tChar === ' ' ? '\u00A0' : tChar}
                    </span>
                );
            } else if (tChar !== undefined) {
                const isMatch = norm(tChar).toLowerCase() === norm(uChar).toLowerCase();
                if (isMatch) {
                    // พิมพ์ถูก: สีเขียวมรกตเรืองแสงพรีเมียม
                    result.push(
                        <span key={i} className="text-emerald-400 font-mono font-bold tracking-wider drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">
                            {uChar === ' ' ? '\u00A0' : uChar}
                        </span>
                    );
                } else {
                    // พิมพ์ผิด: พื้นหลังสีแดงอ่อนขีดเส้นใต้สีแดงเด่นชัด
                    result.push(
                        <span key={i} className="bg-rose-500/20 text-rose-400 font-mono font-bold tracking-wider border-b-2 border-rose-500 px-[0.5px]" title={`Expected: ${tChar === ' ' ? 'Space' : tChar}`}>
                            {uChar === ' ' ? '\u00A0' : uChar}
                        </span>
                    );
                }
            } else {
                // พิมพ์เกิน: แสดงตัวอักษรสีแดงจางๆ แบบเส้นประ
                result.push(
                    <span key={i} className="bg-rose-500/10 text-rose-300 font-mono font-bold tracking-wider border-b-2 border-dashed border-rose-400 px-[0.5px]">
                        {uChar === ' ' ? '\u00A0' : uChar}
                    </span>
                );
            }
        }
        return (
            <div className="flex flex-wrap items-center justify-center gap-y-1.5 text-base md:text-lg tracking-wider font-mono select-none break-all max-w-full">
                {result}
            </div>
        );
    };

    // ปุ่มช่วยเหลือ: ค่อยๆ บอกตัวอักษรถัดไป
    const handleGetHint = () => {
        if (showHintCount < targetText.length) {
            const nextCount = showHintCount + 3; // เผยทีละ 3 ตัวอักษร
            setShowHintCount(nextCount);
            setUserInput(targetText.substring(0, nextCount));
            if (inputRef.current) inputRef.current.focus();
        }
    };

    const handleCheckAnswer = () => {
        setIsSubmitted(true);
    };

    const handleRate = (rating) => {
        if (onSaveSRS) {
            onSaveSRS(currentCard.uniqueId, rating);
        }
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose(); // จบเซสชัน
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1F1A3A] flex flex-col h-full w-full overflow-hidden animate-fade-in text-slate-200">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between z-10 bg-navy-900/40 backdrop-blur-md border-b border-white/[0.06] shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:scale-105 active:scale-95 transition-all">
                    {XIcon ? <XIcon size={20} /> : '✕'}
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Session Review</span>
                    <span className="text-sm font-bold text-white tracking-wider">Typing Challenge</span>
                </div>
                <div className="w-8"></div>
            </div>

            {/* Top Progress Bar */}
            <div className="px-6 mt-3 shrink-0">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    <span>PROGRESS</span>
                    <span className="text-brand-yellow font-bold">{currentIndex + 1} / {queue.length}</span>
                </div>
                <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 transition-all duration-300 rounded-full" style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}></div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] flex-1 rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden">
                    
                    {/* Glowing effect inside card */}
                    <div className="absolute -top-24 -right-24 w-60 h-60 bg-yellow-500/5 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                    {/* Card Content */}
                    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-center space-y-8" style={{ scrollbarWidth: 'none' }}>
                        {/* Thai Prompt */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-extrabold tracking-widest text-brand-yellow/80 border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1.5 rounded-full uppercase">Translate to English</span>
                            <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug pt-3 px-2">{promptText}</h3>
                        </div>

                        {/* Visual Diff Output */}
                        {userInput.length > 0 && (
                            <div className="w-full p-6 bg-navy-950/60 rounded-3xl border border-white/5 shadow-inner">
                                {renderDiff()}
                            </div>
                        )}

                        {/* Target Display (When Submitted) */}
                        {isSubmitted && (
                            <div className="space-y-4 animate-fade-in w-full max-w-md">
                                <div className="w-12 h-1 bg-navy-800 rounded-full mx-auto"></div>
                                <div className="flex flex-col items-center space-y-2">
                                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Correct Answer</span>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl md:text-2xl font-bold text-emerald-400">{targetText}</p>
                                        <button 
                                            onClick={() => window.Utils?.speak && window.Utils.speak(targetText, 'en-US', settings?.speed || 1.0)} 
                                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-colors active:scale-90"
                                        >
                                            {Volume2Icon ? <Volume2Icon size={16} /> : '🔊'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Input Area */}
                    <div className="p-6 bg-navy-950/40 border-t border-white/[0.06] backdrop-blur-md shrink-0">
                        {!isSubmitted ? (
                            <div className="space-y-4 max-w-xl mx-auto">
                                <div className="flex gap-2">
                                    <input 
                                        ref={inputRef}
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && userInput.trim() && handleCheckAnswer()}
                                        placeholder="Type the English sentence here..."
                                        className="flex-1 bg-navy-900/80 border border-white/10 rounded-2xl px-5 py-4 text-white text-base focus:outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 transition-all font-mono shadow-inner"
                                        autoComplete="off"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                    />
                                    <button 
                                        onClick={handleCheckAnswer}
                                        disabled={!userInput.trim()}
                                        className="px-6 bg-white text-navy-900 font-extrabold rounded-2xl hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center"
                                    >
                                        Check
                                    </button>
                                </div>

                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] text-slate-500 font-medium">Press ENTER to submit your answer</p>
                                    <button 
                                        onClick={handleGetHint}
                                        className="text-xs text-brand-yellow/70 hover:text-brand-yellow font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1.5"
                                    >
                                        💡 Give Hint
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto space-y-4">
                                <div className="text-center">
                                    {isExactlyCorrect ? (
                                        <p className="text-emerald-400 font-bold text-sm flex items-center justify-center gap-1.5 animate-pulse">
                                            🎉 100% Perfect Spelling! Excellent work!
                                        </p>
                                    ) : (
                                        <p className="text-amber-400/80 font-bold text-sm">
                                            💡 You were close! Rate how well you recalled this:
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2.5 h-16">
                                    <button 
                                        onClick={() => handleRate('again')} 
                                        className="flex-1 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 flex flex-col items-center justify-center active:scale-95 transition-transform"
                                    >
                                        <span className="font-extrabold text-sm">Again</span>
                                        <span className="text-[9px] opacity-60 mt-0.5">&lt; 1m</span>
                                    </button>
                                    <button 
                                        onClick={() => handleRate('hard')} 
                                        className="flex-1 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 flex flex-col items-center justify-center active:scale-95 transition-transform"
                                    >
                                        <span className="font-extrabold text-sm">Hard</span>
                                        <span className="text-[9px] opacity-60 mt-0.5">2d</span>
                                    </button>
                                    <button 
                                        onClick={() => handleRate('good')} 
                                        className="flex-1 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 flex flex-col items-center justify-center active:scale-95 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                    >
                                        <span className="font-extrabold text-sm">Good</span>
                                        <span className="text-[9px] opacity-60 mt-0.5">4d</span>
                                    </button>
                                    <button 
                                        onClick={() => handleRate('easy')} 
                                        className="flex-1 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 flex flex-col items-center justify-center active:scale-95 transition-transform"
                                    >
                                        <span className="font-extrabold text-sm">Easy</span>
                                        <span className="text-[9px] opacity-60 mt-0.5">7d</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
