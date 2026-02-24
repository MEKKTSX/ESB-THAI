const { useState, useEffect } = React;

// ----------------------------------------------------
// 1. หน้า Review Schedule (สถิติ และ Bar Chart)
// ----------------------------------------------------
// review.js
window.ReviewScheduleView = ({ memoryStats, dueCards, srsData, reviewHistory, onOpenSettings, onStartReview, dailyProgress, sessionGoals, SessionData }) => {
    const { SettingsIcon, PlayIcon, CheckCircleIcon } = window.Icons;
    
    // ⭐️ นับความยาวของ ID ที่ถูกทำไปแล้ว (เพื่อแก้บั๊กนับข้อซ้ำ)
    const session1Count = (dailyProgress.reviewedCards && dailyProgress.reviewedCards['session-1']) ? dailyProgress.reviewedCards['session-1'].length : 0;
    const session2Count = (dailyProgress.reviewedCards && dailyProgress.reviewedCards['session-2']) ? dailyProgress.reviewedCards['session-2'].length : 0;
    const session3Count = (dailyProgress.reviewedCards && dailyProgress.reviewedCards['session-3']) ? dailyProgress.reviewedCards['session-3'].length : 0;

    return (
        <div className="min-h-screen bg-[#0B1121] pb-48 animate-fade-in relative overflow-y-auto">
            <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-20 bg-[#0B1121]/90 backdrop-blur-md border-b border-white/5">
                <div className="w-8"></div>
                <h1 className="text-xl font-bold text-white tracking-wide">Review Schedule</h1>
                <button onClick={onOpenSettings} className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
                    <SettingsIcon size={24}/>
                </button>
            </div>

            <div className="px-5 mt-6 space-y-5">
                
                <div className="bg-gradient-to-b from-navy-800 to-[#10172A] p-7 rounded-[2rem] border border-white/5 shadow-xl flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-yellow/5 rounded-full blur-3xl"></div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6 text-center relative z-10">Daily Goal Progress</span>
                    
                    <div className="space-y-5 w-full relative z-10">
                        {/* Session 1 */}
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-200">Session 1</span>
                                <span className={session1Count >= sessionGoals['session-1'] ? "text-emerald-400 shadow-emerald-500/50" : "text-brand-yellow"}>
                                    {session1Count} <span className="text-slate-500 font-normal">/ {sessionGoals['session-1']}</span>
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-navy-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div className={`h-full rounded-full transition-all duration-1000 relative ${session1Count >= sessionGoals['session-1'] ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'}`} style={{ width: `${Math.min((session1Count / sessionGoals['session-1']) * 100, 100)}%` }}>
                                    <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                            </div>
                        </div>

                        {/* Session 2 */}
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-200">Session 2</span>
                                <span className={session2Count >= sessionGoals['session-2'] ? "text-emerald-400" : "text-brand-yellow"}>
                                    {session2Count} <span className="text-slate-500 font-normal">/ {sessionGoals['session-2']}</span>
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-navy-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div className={`h-full rounded-full transition-all duration-1000 relative ${session2Count >= sessionGoals['session-2'] ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'}`} style={{ width: `${Math.min((session2Count / sessionGoals['session-2']) * 100, 100)}%` }}>
                                     <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                            </div>
                        </div>

                        {/* Session 3 */}
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-200">Session 3</span>
                                <span className={session3Count >= sessionGoals['session-3'] ? "text-emerald-400" : "text-brand-yellow"}>
                                    {session3Count} <span className="text-slate-500 font-normal">/ {sessionGoals['session-3']}</span>
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-navy-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div className={`h-full rounded-full transition-all duration-1000 relative ${session3Count >= sessionGoals['session-3'] ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'}`} style={{ width: `${Math.min((session3Count / sessionGoals['session-3']) * 100, 100)}%` }}>
                                     <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-5 border-t border-white/5 text-center relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{dueCards.length} <span className="text-xl font-normal text-slate-300">Reviews Due</span></h2>
                        <p className="text-xs text-slate-500">Cards scheduled for today.</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-navy-800/80 backdrop-blur border border-white/10 p-5 rounded-[1.5rem] shadow-lg text-center"><div className="text-2xl font-bold text-brand-yellow mb-1">{memoryStats.unseen}</div><div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span> Unseen</div></div>
                    <div className="bg-navy-800/80 backdrop-blur border border-white/10 p-5 rounded-[1.5rem] shadow-lg text-center"><div className="text-2xl font-bold text-brand-yellow mb-1">{memoryStats.learning}</div><div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]"></span> Learning</div></div>
                    <div className="bg-navy-800/80 backdrop-blur border border-white/10 p-5 rounded-[1.5rem] shadow-lg text-center"><div className="text-2xl font-bold text-brand-yellow mb-1">{memoryStats.mastered}</div><div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> Mastered</div></div>
                </div>

                {/* ⭐️ เพิ่มการตรวจสอบให้มั่นใจว่าโหลด Retention Chart ติดแน่นอน */}
                {window.ESB_Features && window.ESB_Features.UpcomingReviews && <window.ESB_Features.UpcomingReviews srsData={srsData} dueCardsCount={dueCards.length} />}
                {window.ESB_Features && window.ESB_Features.RetentionChart ? <window.ESB_Features.RetentionChart reviewHistory={reviewHistory} /> : <div className="text-center text-rose-500 text-xs my-4 p-4 border border-rose-500/20 rounded-xl bg-rose-500/5">Error: RetentionChart component is missing. Please check retentionFeature.js</div>}
            </div>
            
            <div className="fixed bottom-[85px] left-0 right-0 px-5 flex justify-center z-30 pointer-events-none">
                <button 
                    onClick={() => onStartReview(dueCards)}
                    disabled={dueCards.length === 0}
                    className={`pointer-events-auto w-full max-w-sm rounded-2xl py-4 px-6 font-bold flex items-center justify-center gap-3 transition-all tracking-widest text-sm uppercase ${dueCards.length > 0 ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-navy-900 shadow-[0_10px_25px_-5px_rgba(250,204,21,0.4)] active:scale-95' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md cursor-not-allowed shadow-lg'}`}
                >
                    {dueCards.length > 0 ? (
                        <><PlayIcon size={20} className="fill-navy-900" /> Start Review Session</>
                    ) : (
                        <><CheckCircleIcon size={20} /> All Cleared! 🎉</>
                    )}
                </button>
            </div>
        </div>
    );
};

// ----------------------------------------------------
// 2. หน้า Flashcard Settings Modal
// ----------------------------------------------------
// ในไฟล์ review.js ให้หา window.FlashcardSettingsModal แล้ววางทับด้วยโค้ดนี้ครับ
window.FlashcardSettingsModal = ({ settings, setSettings, SessionData, onClose }) => {
    const { BookIcon } = window.Icons;
    const togglePool = (id) => setSettings(prev => ({ ...prev, pool: prev.pool.includes(id) ? prev.pool.filter(p => p !== id) : [...prev.pool, id] }));

    return (
        // ⭐️ เปลี่ยน z-50 เป็น z-[999] เพื่อให้มันเด้งขึ้นมาทับหน้า Flashcard แน่นอน 100%
        <div className="fixed inset-0 z-[999] bg-[#0B1121] flex flex-col animate-fade-in overflow-y-auto">
            <div className="sticky top-0 bg-[#0B1121]/90 backdrop-blur border-b border-white/5 px-5 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-white">Flashcard Settings</h2>
                <button onClick={onClose} className="text-brand-yellow font-bold text-sm hover:text-yellow-400 transition-colors">Done</button>
            </div>
            <div className="p-5 space-y-8 pb-32">
                <div>
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Card Front Language</h3>
                    <div className="bg-navy-800 p-1.5 rounded-xl flex border border-white/5">
                        <button onClick={() => setSettings({...settings, cardFront: 'th'})} className={`flex-1 py-3 text-sm font-bold rounded-lg flex justify-center items-center gap-2 transition-all ${settings.cardFront === 'th' ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-slate-300'}`}>🇹🇭 Thai</button>
                        <button onClick={() => setSettings({...settings, cardFront: 'en'})} className={`flex-1 py-3 text-sm font-bold rounded-lg flex justify-center items-center gap-2 transition-all ${settings.cardFront === 'en' ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-slate-300'}`}>🇺🇸 English</button>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-3"><h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Audio Speed</h3><span className="bg-navy-800 border border-white/5 px-2 py-1 rounded text-xs font-bold text-brand-yellow">{settings.speed}x</span></div>
                    <div className="bg-navy-800 p-6 rounded-2xl border border-white/5 relative shadow-lg">
                        <input type="range" min="0.5" max="1.5" step="0.25" value={settings.speed} onChange={(e) => setSettings({...settings, speed: parseFloat(e.target.value)})} className="w-full accent-brand-yellow bg-navy-900 h-1.5 rounded-lg appearance-none cursor-pointer" />
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mt-4"><span>Slow</span><span>Normal</span><span>Fast</span></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-3"><h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Review Pool</h3><button onClick={() => setSettings({...settings, pool: SessionData.map(s => s.id)})} className="text-xs font-bold text-brand-yellow hover:text-yellow-400">Select All</button></div>
                    <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden shadow-lg">
                        {SessionData.map((session, index) => {
                            const isSelected = settings.pool.includes(session.id);
                            return (
                                <div key={session.id} onClick={() => togglePool(session.id)} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-navy-700/50 transition-colors ${index !== SessionData.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-[#0B1121] border border-white/5 flex items-center justify-center shadow-inner"><BookIcon size={18} className="text-slate-400" /></div><div><h4 className="text-sm font-bold text-white">{session.title.split(':')[0]}</h4></div></div>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none"><input type="checkbox" checked={isSelected} readOnly className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-navy-700 appearance-none cursor-pointer z-10 transition-all duration-300" /><label className="toggle-label block overflow-hidden h-5 rounded-full bg-[#0B1121] shadow-inner cursor-pointer transition-all duration-300"></label></div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Behavior</h3>
                    <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden shadow-lg">
                        <div onClick={() => setSettings({...settings, autoPlay: !settings.autoPlay})} className="flex items-center justify-between p-4 cursor-pointer hover:bg-navy-700/50 transition-colors">
                            <span className="text-sm font-bold text-white">Auto-play Audio</span>
                            <div className="relative inline-block w-10 mr-2"><input type="checkbox" checked={settings.autoPlay} readOnly className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-navy-700 appearance-none z-10 transition-all cursor-pointer" /><label className="toggle-label block h-5 rounded-full bg-[#0B1121] shadow-inner transition-all cursor-pointer"></label></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



// ----------------------------------------------------
// 3. หน้าทำข้อสอบ Flashcard (กดซ่อน/โชว์ได้อิสระ)
// ----------------------------------------------------
window.FlashcardQuizView = ({ quizQueue, settings, onClose, onSaveSRS, onOpenSettings, dailyProgress, sessionGoals }) => {
    const { useState, useEffect } = React;
    
    const Fallback = () => <span style={{color:'red'}}>?</span>;
    const Icons = window.Icons || {};
    const XIcon = Icons.XIcon || Fallback;
    const SlidersIcon = Icons.SlidersIcon || Fallback;
    const Volume2Icon = Icons.Volume2Icon || Fallback;
    const BookIcon = Icons.BookIcon || Fallback;
    const CheckCircleIcon = Icons.CheckCircleIcon || Fallback;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const currentCard = quizQueue[currentIndex];
    
    // ⭐️ 1. ตั้งค่าตรรกะข้อความและเสียงพูด
    const isThaiFront = settings.cardFront === 'th';
    const frontText = isThaiFront ? currentCard?.th : currentCard?.en;
    const backText = isThaiFront ? currentCard?.en : currentCard?.th;
    
    // ⭐️ 2. กำหนดว่าเสียงต้องอ่านประโยคไหน และใช้สำเนียงอะไร (อ่านเฉพาะคำเฉลย)
    const speakText = isThaiFront ? currentCard?.en : currentCard?.th;
    const speakLang = isThaiFront ? 'en-US' : 'th-TH';

    useEffect(() => {
        // ⭐️ Auto-play ทำงานตอนโชว์เฉลยเท่านั้น
        if (settings.autoPlay && showAnswer && currentCard && window.Utils && window.Utils.speak) {
            window.Utils.speak(speakText, speakLang, settings.speed);
        }
    }, [currentIndex, showAnswer, currentCard, settings, speakText, speakLang]);

    if (!currentCard) {
        return (
            <div className="fixed inset-0 z-50 bg-[#0B1121] flex flex-col items-center justify-center animate-fade-in">
                <div className="text-brand-yellow mb-4"><CheckCircleIcon size={64} /></div>
                <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
                <button onClick={onClose} className="px-8 py-3 bg-navy-800 text-white rounded-xl font-bold mt-4">Go Back</button>
            </div>
        );
    }

    const handleRate = (rating) => {
        // ให้มันซ่อนคำตอบทันที แล้วค่อยเปลี่ยน Index
        setShowAnswer(false); 
        onSaveSRS(currentCard.uniqueId, rating);
        if (currentIndex < quizQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose(); 
        }
    };

    const sessionGoal = sessionGoals[currentCard.sessionId] || 0;
    const sessionProgress = (dailyProgress?.reviewedCards && dailyProgress.reviewedCards[currentCard.sessionId]) ? dailyProgress.reviewedCards[currentCard.sessionId].length : 0;

    return (
        <div className="fixed inset-0 z-[60] bg-[#0B1121] flex flex-col h-full w-full overflow-hidden animate-fade-in">
            <div className="px-5 py-4 flex items-center justify-between z-10 bg-[#0B1121]/90 backdrop-blur-md shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white"><XIcon size={24} /></button>
                <h2 className="text-lg font-bold text-slate-200">Review Mode</h2>
                <button onClick={onOpenSettings} className="p-2 -mr-2 text-slate-400 hover:text-white"><SlidersIcon size={20}/></button>
            </div>
            
            <div className="px-6 mb-4 shrink-0">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                    <span>Session Progress</span>
                    <span className="text-brand-yellow">{currentIndex + 1} / {quizQueue.length}</span>
                </div>
                <div className="w-full h-1.5 bg-navy-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300" style={{ width: `${((currentIndex + 1) / quizQueue.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="flex-1 flex flex-col px-5 pb-6 overflow-hidden">
                <div className="bg-gradient-to-b from-navy-800 to-navy-900 flex-1 rounded-[2rem] shadow-xl border border-white/5 flex flex-col relative overflow-hidden" 
                     onClick={() => { if(!showAnswer) setShowAnswer(true); }}>
                    
                    <div className="flex justify-between items-start p-5 absolute w-full top-0 shrink-0 z-10">
                        {showAnswer ? <span className="border border-brand-yellow/30 text-brand-yellow text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest">Answer</span> : <span></span>}
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
                        
                        {/* ⭐️ ถอดแอนิเมชันหน่วงเวลาออก แล้วใช้แบบตัดฉึบเมื่อ showAnswer เป็น true */}
                        {showAnswer && (
                            <>
                                <div className="w-12 h-1 bg-navy-700 rounded-full mx-auto my-8 shrink-0"></div>
                                <div className="flex flex-col items-center justify-center w-full animate-fade-in">
                                    <p className="text-2xl md:text-3xl font-bold text-blue-400 leading-snug">{backText}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {!showAnswer && (
                        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center opacity-40 pointer-events-none">
                            <p className="text-[10px] font-bold tracking-widest uppercase mb-2">Tap to flip</p>
                            <BookIcon size={24}/>
                        </div>
                    )}

                    {showAnswer && (
                        <div className="p-4 bg-navy-900/50 backdrop-blur shrink-0 border-t border-white/5 z-20">
                            <p className="text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">How well did you know this?</p>
                            <div className="flex gap-2 h-16">
                                <button onClick={(e) => { e.stopPropagation(); handleRate('again'); }} className="flex-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex flex-col items-center justify-center active:scale-95 transition-transform"><span className="font-bold text-sm">Again</span><span className="text-[10px] opacity-60">&lt; 1m</span></button>
                                <button onClick={(e) => { e.stopPropagation(); handleRate('hard'); }} className="flex-1 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex flex-col items-center justify-center active:scale-95 transition-transform"><span className="font-bold text-sm">Hard</span><span className="text-[10px] opacity-60">2d</span></button>
                                <button onClick={(e) => { e.stopPropagation(); handleRate('good'); }} className="flex-1 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex flex-col items-center justify-center active:scale-95 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.15)]"><span className="font-bold text-sm">Good</span><span className="text-[10px] opacity-60">4d</span></button>
                                <button onClick={(e) => { e.stopPropagation(); handleRate('easy'); }} className="flex-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex flex-col items-center justify-center active:scale-95 transition-transform"><span className="font-bold text-sm">Easy</span><span className="text-[10px] opacity-60">7d</span></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
