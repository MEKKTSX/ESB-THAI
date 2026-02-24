window.ESB_Features = window.ESB_Features || {};

window.ESB_Features.PracticeFlashcardView = ({ queue, settings, onClose, onOpenSettings }) => {
    const { useState, useEffect } = React;
    
    const Fallback = () => <span style={{color:'red'}}>?</span>;
    const Icons = window.Icons || {};
    const XIcon = Icons.XIcon || Fallback;
    const SlidersIcon = Icons.SlidersIcon || Fallback;
    const Volume2Icon = Icons.Volume2Icon || Fallback;
    const BookIcon = Icons.BookIcon || Fallback;
    const ChevronLeftIcon = Icons.ChevronLeftIcon || Fallback;
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    if (!queue || queue.length === 0) return null;
    const currentCard = queue[currentIndex];

    if (!currentCard) {
        return (
            <div className="fixed inset-0 z-[80] bg-[#0B1121] flex flex-col items-center justify-center">
                <button onClick={onClose} className="px-8 py-3 bg-navy-800 text-white rounded-xl">Go Back</button>
            </div>
        );
    }

    // ⭐️ 1. ตั้งค่าตรรกะข้อความและเสียงพูด
    const isThaiFront = settings.cardFront === 'th';
    const frontText = isThaiFront ? currentCard.th : currentCard.en;
    const backText = isThaiFront ? currentCard.en : currentCard.th;
    
    // ⭐️ 2. กำหนดว่าเสียงต้องอ่านประโยคไหน และใช้สำเนียงอะไร (อ่านเฉพาะคำเฉลย)
    const speakText = isThaiFront ? currentCard.en : currentCard.th;
    const speakLang = isThaiFront ? 'en-US' : 'th-TH';

    useEffect(() => {
        // ⭐️ Auto-play จะทำงานตอนโชว์เฉลยเท่านั้น (showAnswer === true)
        if (settings.autoPlay && showAnswer && currentCard) {
            setTimeout(() => {
                if (window.Utils && window.Utils.speak) {
                    window.Utils.speak(speakText, speakLang, settings.speed);
                }
            }, 100);
        }
    }, [currentIndex, showAnswer, currentCard, settings, speakText, speakLang]);

    const handleNext = () => {
        if (currentIndex < queue.length - 1) {
            setShowAnswer(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setShowAnswer(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-[#0B1121] flex flex-col h-full w-full overflow-hidden animate-fade-in">
            <div className="px-5 py-4 flex items-center justify-between z-10 shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white"><XIcon size={24} /></button>
                <h2 className="text-lg font-bold text-slate-200 uppercase tracking-widest text-sm">Practice Mode</h2>
                <button onClick={onOpenSettings} className="p-2 -mr-2 text-slate-400 hover:text-white"><SlidersIcon size={20}/></button>
            </div>
            
            <div className="px-6 mb-4 shrink-0">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                    <span>Progress</span>
                    <span className="text-white">{currentIndex + 1} / {queue.length}</span>
                </div>
                <div className="w-full h-1 bg-navy-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full transition-all duration-300" style={{ width: `${((currentIndex+1)/queue.length)*100}%` }}></div>
                </div>
            </div>

            <div className="flex-1 flex flex-col px-5 pb-6 overflow-hidden">
                <div className="bg-navy-800 flex-1 rounded-[2rem] shadow-xl border border-white/5 flex flex-col relative overflow-hidden cursor-pointer" onClick={() => setShowAnswer(!showAnswer)}>
                    <div className="flex justify-between items-start p-5 absolute w-full top-0 z-10">
                        {showAnswer ? <span className="bg-slate-200 text-navy-900 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest">Answer</span> : <span></span>}
                        {/* ⭐️ 3. กดลำโพงก็จะอ่านคำเฉลย ด้วยสำเนียงที่ถูกต้อง */}
                        <button onClick={(e) => { 
                            e.stopPropagation(); 
                            if(window.Utils && window.Utils.speak) window.Utils.speak(speakText, speakLang, settings.speed); 
                        }} className="text-slate-400 hover:text-white p-1">
                            <Volume2Icon size={24} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 pt-16 text-center" style={{ scrollbarWidth: 'none' }}>
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug">{frontText}</h3>
                        {showAnswer && <div className="w-12 h-1 bg-navy-600 rounded-full mx-auto my-8 shrink-0"></div>}
                        {showAnswer && <div className="w-full flex flex-col items-center justify-center animate-fade-in"><p className="text-2xl md:text-3xl font-bold text-brand-yellow leading-snug">{backText}</p></div>}
                    </div>

                    {!showAnswer && (
                        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center justify-center opacity-40 pointer-events-none">
                            <p className="text-[10px] font-bold tracking-widest uppercase mb-2">Tap to flip</p>
                            <BookIcon size={24}/>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 px-5 pb-8 z-30 w-full shrink-0">
                <button onClick={handlePrev} disabled={currentIndex === 0} className="flex-1 py-4 rounded-2xl bg-navy-800 border border-white/10 text-white font-bold active:scale-95 disabled:opacity-30 flex justify-center items-center gap-2 transition-all">
                    <ChevronLeftIcon size={20} /> Prev
                </button>
                <button onClick={handleNext} className="flex-1 py-4 rounded-2xl bg-slate-100 text-navy-900 font-bold active:scale-95 shadow-[0_0_20px_rgba(241,245,249,0.2)] flex justify-center items-center gap-2 transition-all">
                    {currentIndex === queue.length - 1 ? 'Finish 🎉' : 'Next'} <ChevronLeftIcon size={20} className="rotate-180" />
                </button>
            </div>
        </div>
    );
};
