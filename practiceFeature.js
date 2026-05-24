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
    const CheckCircleIcon = Icons.CheckCircleIcon || Fallback;
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    if (!queue || queue.length === 0) return null;
    const currentCard = queue[currentIndex];

    if (!currentCard) {
        return (
            <div className="fixed inset-0 z-[80] bg-[#0B1121] flex flex-col items-center justify-center animate-fade-in p-6">
                <div className="text-brand-yellow mb-4 text-6xl animate-bounce">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-2">Practice Complete!</h2>
                <button onClick={onClose} className="px-8 py-3 bg-navy-800 text-white rounded-xl font-bold mt-4" style={{ cursor: 'pointer' }}>Go Back</button>
            </div>
        );
    }

    const isThaiFront = settings.cardFront === 'th';
    const frontText = isThaiFront ? currentCard.th : currentCard.en;
    const backText = isThaiFront ? currentCard.en : currentCard.th;
    
    const speakText = isThaiFront ? currentCard.en : currentCard.th;
    const speakLang = isThaiFront ? 'en-US' : 'th-TH';

    useEffect(() => {
        if (settings.autoPlay && showAnswer && currentCard) {
            setTimeout(() => {
                if (window.Utils && window.Utils.speak) {
                    window.Utils.speak(speakText, speakLang, settings.speed);
                }
            }, 100);
        }
    }, [currentIndex, showAnswer, currentCard, settings, speakText, speakLang]);

    // คีย์ลัดสำหรับการฝึกฝนทบทวนทั่วไป
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!currentCard) return;
            
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!showAnswer) {
                    setShowAnswer(true);
                } else {
                    handleNext();
                }
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAnswer, currentIndex, currentCard, queue]);

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
        <div className="fixed inset-0 z-[80] bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1F1A3A] flex flex-col h-full w-full overflow-hidden animate-fade-in text-slate-200">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between z-10 shrink-0 bg-navy-900/40 backdrop-blur-md border-b border-white/[0.06]">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:scale-105 active:scale-95 transition-all">
                    <XIcon size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Practice Deck</span>
                    <span className="text-sm font-bold text-slate-200 mt-1">Study Session</span>
                </div>
                <button onClick={onOpenSettings} className="p-2 -mr-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:scale-105 active:scale-95 transition-all">
                    <SlidersIcon size={18}/>
                </button>
            </div>
            
            {/* Progress indicator */}
            <div className="px-6 mb-4 mt-3 shrink-0">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                    <span>PROGRESS</span>
                    <span className="text-white">{currentIndex + 1} / {queue.length}</span>
                </div>
                <div className="w-full h-1.5 bg-navy-955 border border-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 transition-all duration-300 rounded-full" style={{ width: `${((currentIndex+1)/queue.length)*100}%` }}></div>
                </div>
            </div>

            {/* Interactive Card containing 3D Flip */}
            <div className="flex-1 flex flex-col px-5 pb-6 overflow-hidden">
                
                {/* 3D perspective wrapper */}
                <div className="flex-1 perspective-1000 relative select-none">
                    
                    {/* Flipping container */}
                    <div 
                        onClick={() => setShowAnswer(!showAnswer)}
                        className={`w-full h-full transform-style-3d transition-transform duration-500 relative cursor-pointer ${
                            showAnswer ? 'rotate-y-180' : ''
                        }`}
                    >
                        {/* FRONT FACE */}
                        <div className="absolute inset-0 w-full h-full backface-hidden backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] shadow-2xl flex flex-col p-6 overflow-hidden">
                            <div className="flex justify-between items-center w-full pb-4 border-b border-white/[0.04]">
                                <span className="border border-brand-yellow/30 text-brand-yellow text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest bg-brand-yellow/10">
                                    Question Card
                                </span>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if(window.Utils && window.Utils.speak) window.Utils.speak(isThaiFront ? currentCard.th : currentCard.en, isThaiFront ? 'th-TH' : 'en-US', settings.speed); 
                                    }} 
                                    className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors active:scale-90"
                                >
                                    <Volume2Icon size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight">
                                    {frontText}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6 animate-pulse">
                                    Tap card to flip and reveal answer
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-center opacity-30 pb-4">
                                <BookIcon size={24}/>
                            </div>
                        </div>

                        {/* BACK FACE */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] shadow-2xl flex flex-col p-6 overflow-hidden">
                            <div className="flex justify-between items-center w-full pb-4 border-b border-white/[0.04]">
                                <span className="border border-emerald-500/30 text-emerald-400 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest bg-emerald-500/10">
                                    Answer Card
                                </span>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if(window.Utils && window.Utils.speak) window.Utils.speak(speakText, speakLang, settings.speed); 
                                    }} 
                                    className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors active:scale-90"
                                >
                                    <Volume2Icon size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
                                <div className="space-y-1.5">
                                    <p className="text-[9px] text-slate-500 font-extrabold tracking-widest uppercase">Question</p>
                                    <h3 className="text-lg font-bold text-slate-400 leading-normal">{frontText}</h3>
                                </div>
                                <div className="w-12 h-[2px] bg-white/[0.06] rounded-full mx-auto"></div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] text-brand-yellow font-extrabold tracking-widest uppercase">Correct Answer</p>
                                    <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-400 leading-snug drop-shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                                        {backText}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center justify-center opacity-30 pb-4">
                                <CheckCircleIcon size={24}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prev/Next buttons below card */}
            <div className="flex gap-4 px-5 pb-8 z-30 w-full shrink-0 max-w-md mx-auto">
                <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0} 
                    className="flex-1 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white font-bold active:scale-95 disabled:opacity-20 flex justify-center items-center gap-2 transition-all hover:bg-white/[0.06]"
                >
                    <ChevronLeftIcon size={18} /> 
                    <span>Prev</span>
                </button>
                <button 
                    onClick={handleNext} 
                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-navy-900 font-bold active:scale-95 shadow-xl flex justify-center items-center gap-2 transition-all hover:bg-white"
                >
                    <span>{currentIndex === queue.length - 1 ? 'Finish 🎉' : 'Next'}</span> 
                    <ChevronLeftIcon size={18} className="rotate-180" />
                </button>
            </div>
        </div>
    );
};
