const { useState, useEffect } = React;

// ----------------------------------------------------
// 1. หน้า Review Schedule (สถิติ และ Bar Chart)
// ----------------------------------------------------
window.ReviewScheduleView = ({ memoryStats, dueCards, srsData, reviewHistory, onOpenSettings, onStartReview, dailyProgress, sessionGoals, SessionData }) => {
    const { SettingsIcon, PlayIcon, CheckCircleIcon, ChartIcon } = window.Icons || {};
    
    const session1Count = (dailyProgress.reviewedCards && dailyProgress.reviewedCards['session-1']) ? dailyProgress.reviewedCards['session-1'].length : 0;
    const session2Count = (dailyProgress.reviewedCards && dailyProgress.reviewedCards['session-2']) ? dailyProgress.reviewedCards['session-2'].length : 0;
    const session3Count = (dailyProgress.reviewedCards && dailyProgress.reviewedCards['session-3']) ? dailyProgress.reviewedCards['session-3'].length : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#080B11] via-[#0E131F] to-[#17132B] pb-48 animate-fade-in relative overflow-y-auto text-slate-200">
            {/* Background Decorative Glows */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-[400px] right-5 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-20 bg-[#080B11]/85 backdrop-blur-xl border-b border-white/[0.04]">
                <div className="w-8"></div>
                <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Review Schedule</h1>
                <button onClick={onOpenSettings} className="p-2.5 text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-full hover:scale-105 active:scale-95 transition-all">
                    {SettingsIcon ? <SettingsIcon size={18} /> : '⚙️'}
                </button>
            </div>

            <div className="px-5 mt-6 space-y-6 max-w-md mx-auto">
                
                {/* Daily Goal Progress Card */}
                <div className="backdrop-blur-xl bg-white/[0.02] p-6.5 rounded-[2rem] border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col relative overflow-hidden group hover:border-white/[0.08] transition-all duration-500">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500"></div>
                    
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-6 text-center relative z-10 flex items-center justify-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse"></span>
                        Daily Goal Progress
                    </span>
                    
                    <div className="space-y-5 w-full relative z-10">
                        {/* Session 1 */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-300 font-semibold text-[11px]">Session 1: Basic Conversations</span>
                                <span className={session1Count >= sessionGoals['session-1'] ? "text-emerald-400 font-black text-xs" : "text-brand-yellow text-xs font-black"}>
                                    {session1Count} <span className="text-slate-500 font-normal">/ {sessionGoals['session-1']}</span>
                                </span>
                            </div>
                            <div className="w-full h-2 bg-[#04060A] rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div className={`h-full rounded-full transition-all duration-1000 relative ${session1Count >= sessionGoals['session-1'] ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`} style={{ width: `${Math.min((session1Count / sessionGoals['session-1']) * 100, 100)}%` }}>
                                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Session 2 */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-300 font-semibold text-[11px]">Session 2: Intermediate Dialogues</span>
                                <span className={session2Count >= sessionGoals['session-2'] ? "text-emerald-400 font-black text-xs" : "text-brand-yellow text-xs font-black"}>
                                    {session2Count} <span className="text-slate-500 font-normal">/ {sessionGoals['session-2']}</span>
                                </span>
                            </div>
                            <div className="w-full h-2 bg-[#04060A] rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div className={`h-full rounded-full transition-all duration-1000 relative ${session2Count >= sessionGoals['session-2'] ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`} style={{ width: `${Math.min((session2Count / sessionGoals['session-2']) * 100, 100)}%` }}>
                                     <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Session 3 */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-300 font-semibold text-[11px]">Session 3: Advanced Sentences</span>
                                <span className={session3Count >= sessionGoals['session-3'] ? "text-emerald-400 font-black text-xs" : "text-brand-yellow text-xs font-black"}>
                                    {session3Count} <span className="text-slate-500 font-normal">/ {sessionGoals['session-3']}</span>
                                </span>
                            </div>
                            <div className="w-full h-2 bg-[#04060A] rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div className={`h-full rounded-full transition-all duration-1000 relative ${session3Count >= sessionGoals['session-3'] ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`} style={{ width: `${Math.min((session3Count / sessionGoals['session-3']) * 100, 100)}%` }}>
                                     <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-5 border-t border-white/[0.05] text-center relative z-10">
                        <h2 className="text-3xl font-black text-white mb-1 tracking-tight flex items-baseline justify-center gap-1.5">
                            {dueCards.length}
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reviews Due</span>
                        </h2>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">Scheduled cards requiring review today</p>
                    </div>
                </div>

                {/* Unseen/Learning/Mastered Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] p-4.5 rounded-2xl shadow-lg text-center transition-all duration-300">
                        <div className="text-2xl font-black text-brand-yellow drop-shadow-[0_0_10px_rgba(250,204,21,0.2)] mb-1">{memoryStats.unseen}</div>
                        <div className="flex items-center justify-center gap-1 text-[8px] font-black text-slate-500 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow"></span> 
                            <span>Unseen</span>
                        </div>
                    </div>
                    <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] p-4.5 rounded-2xl shadow-lg text-center transition-all duration-300">
                        <div className="text-2xl font-black text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.2)] mb-1">{memoryStats.learning}</div>
                        <div className="flex items-center justify-center gap-1 text-[8px] font-black text-slate-500 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> 
                            <span>Learning</span>
                        </div>
                    </div>
                    <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] p-4.5 rounded-2xl shadow-lg text-center transition-all duration-300">
                        <div className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)] mb-1">{memoryStats.mastered}</div>
                        <div className="flex items-center justify-center gap-1 text-[8px] font-black text-slate-500 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 
                            <span>Mastered</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming Reviews and Retention Chart */}
                {window.ESB_Features && window.ESB_Features.UpcomingReviews && (
                    <window.ESB_Features.UpcomingReviews srsData={srsData} dueCardsCount={dueCards.length} reviewHistory={reviewHistory} />
                )}
                
                {window.ESB_Features && window.ESB_Features.RetentionChart ? (
                    <window.ESB_Features.RetentionChart reviewHistory={reviewHistory} />
                ) : (
                    <div className="text-center text-rose-500 text-xs my-4 p-4 border border-rose-500/20 rounded-xl bg-rose-500/5">
                        Error: RetentionChart component is missing.
                    </div>
                )}
            </div>
            
            {/* Start Review Floating Bar */}
            <div className="fixed bottom-[85px] left-0 right-0 px-5 flex justify-center z-30 pointer-events-none">
                <button 
                    onClick={() => onStartReview(dueCards)}
                    disabled={dueCards.length === 0}
                    className={`pointer-events-auto w-full max-w-xs rounded-2xl py-4.5 px-6 font-extrabold flex items-center justify-center gap-2 transition-all duration-300 tracking-wider text-xs uppercase ${
                        dueCards.length > 0 
                            ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-navy-950 shadow-[0_10px_30px_rgba(250,204,21,0.35)] active:scale-[0.97] hover:brightness-105' 
                            : 'bg-emerald-500/[0.04] text-emerald-400 border border-emerald-500/20 backdrop-blur-md cursor-not-allowed opacity-90'
                    }`}
                >
                    {dueCards.length > 0 ? (
                        <>
                            {PlayIcon ? <PlayIcon size={14} className="fill-navy-950 text-navy-950" /> : '▶'} 
                            <span>Start Review Session ({dueCards.length})</span>
                        </>
                    ) : (
                        <>
                            {CheckCircleIcon ? <CheckCircleIcon size={16} /> : '✓'} 
                            <span>All Cleared for Today! 🎉</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// ----------------------------------------------------
// 2. หน้า Flashcard Settings Modal
// ----------------------------------------------------
window.FlashcardSettingsModal = ({ settings, setSettings, SessionData, onClose }) => {
    const { BookIcon } = window.Icons || {};
    const togglePool = (id) => setSettings(prev => ({ ...prev, pool: prev.pool.includes(id) ? prev.pool.filter(p => p !== id) : [...prev.pool, id] }));

    return (
        <div className="fixed inset-0 z-[999] bg-gradient-to-br from-[#080B11] via-[#0E131F] to-[#17132B] flex flex-col animate-fade-in overflow-y-auto text-slate-200">
            <div className="sticky top-0 bg-[#080B11]/85 backdrop-blur-xl border-b border-white/[0.05] px-5 py-4 flex items-center justify-between z-10">
                <h2 className="text-base font-extrabold text-white tracking-wider">SRS Session Settings</h2>
                <button onClick={onClose} className="text-brand-yellow font-black text-xs hover:text-yellow-400 active:scale-95 transition-all uppercase tracking-widest bg-brand-yellow/10 border border-brand-yellow/20 px-3 py-1.5 rounded-lg">Done</button>
            </div>
            
            <div className="p-5 space-y-8 pb-32 max-w-md mx-auto w-full">
                {/* Language Side */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase px-1">Card Front Language</h3>
                    <div className="bg-[#04060A]/80 p-1 rounded-xl flex border border-white/[0.04]">
                        <button onClick={() => setSettings({...settings, cardFront: 'th'})} className={`flex-1 py-3 text-xs font-bold rounded-lg flex justify-center items-center gap-2 transition-all duration-300 ${settings.cardFront === 'th' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-300'}`}>🇹🇭 Thai Front</button>
                        <button onClick={() => setSettings({...settings, cardFront: 'en'})} className={`flex-1 py-3 text-xs font-bold rounded-lg flex justify-center items-center gap-2 transition-all duration-300 ${settings.cardFront === 'en' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-300'}`}>🇺🇸 English Front</button>
                    </div>
                </div>

                {/* Speed Side */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Audio Pronounce Speed</h3>
                        <span className="bg-white/5 border border-white/[0.05] px-2 py-0.5 rounded text-[10px] font-extrabold text-brand-yellow">{settings.speed}x</span>
                    </div>
                    <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/[0.05] shadow-inner">
                        <input type="range" min="0.5" max="1.5" step="0.25" value={settings.speed} onChange={(e) => setSettings({...settings, speed: parseFloat(e.target.value)})} className="w-full accent-brand-yellow bg-navy-950 h-1.5 rounded-lg appearance-none cursor-pointer" />
                        <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase mt-4 tracking-widest"><span>Slow (0.5x)</span><span>Normal (1x)</span><span>Fast (1.5x)</span></div>
                    </div>
                </div>

                {/* Pool Decks Selection */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Active Decks Pool</h3>
                        <button onClick={() => setSettings({...settings, pool: SessionData.map(s => s.id)})} className="text-xs font-extrabold text-brand-yellow hover:text-yellow-400 transition-colors uppercase tracking-wider">Select All</button>
                    </div>
                    <div className="bg-white/[0.01] rounded-2xl border border-white/[0.05] overflow-hidden shadow-inner">
                        {SessionData.map((session, index) => {
                            const isSelected = settings.pool.includes(session.id);
                            return (
                                <div key={session.id} onClick={() => togglePool(session.id)} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors ${index !== SessionData.length - 1 ? 'border-b border-white/[0.03]' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#04060A] border border-white/5 flex items-center justify-center shadow-inner text-slate-400">
                                            {BookIcon ? <BookIcon size={14} /> : '📚'}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white leading-none">{session.title.split(':')[0]}</h4>
                                        </div>
                                    </div>
                                    <div className="relative inline-block w-9 mr-2 align-middle select-none">
                                        <input type="checkbox" checked={isSelected} readOnly className="toggle-checkbox absolute block w-4.5 h-4.5 rounded-full bg-white border-4 border-navy-800 appearance-none cursor-pointer z-10 transition-all duration-300" />
                                        <label className="toggle-label block overflow-hidden h-4.5 rounded-full bg-navy-950 shadow-inner cursor-pointer transition-all duration-300"></label>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Auto Play Option */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase px-1">Behavior</h3>
                    <div className="bg-white/[0.01] rounded-2xl border border-white/[0.05] overflow-hidden shadow-inner">
                        <div onClick={() => setSettings({...settings, autoPlay: !settings.autoPlay})} className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors">
                            <span className="text-xs font-bold text-white">Auto-play Audio on Reveal</span>
                            <div className="relative inline-block w-9 mr-2">
                                <input type="checkbox" checked={settings.autoPlay} readOnly className="toggle-checkbox absolute block w-4.5 h-4.5 rounded-full bg-white border-4 border-navy-800 appearance-none z-10 transition-all cursor-pointer" />
                                <label className="toggle-label block h-4.5 rounded-full bg-navy-950 shadow-inner transition-all cursor-pointer"></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------
// 3. หน้าทำข้อสอบ Flashcard พลิกได้แบบ 3 มิติ (3D Premium Flashcard Quiz View)
// ----------------------------------------------------
window.FlashcardQuizView = ({ quizQueue, settings, onClose, onSaveSRS, onOpenSettings }) => {
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
    
    const isThaiFront = settings.cardFront === 'th';
    const frontText = isThaiFront ? currentCard?.th : currentCard?.en;
    const backText = isThaiFront ? currentCard?.en : currentCard?.th;
    
    const speakText = isThaiFront ? currentCard?.en : currentCard?.th;
    const speakLang = isThaiFront ? 'en-US' : 'th-TH';

    // เล่นเสียงอัตโนมัติเมื่อกดแสดงคำเฉลย
    useEffect(() => {
        if (settings.autoPlay && showAnswer && currentCard && window.Utils && window.Utils.speak) {
            window.Utils.speak(speakText, speakLang, settings.speed);
        }
    }, [currentIndex, showAnswer, currentCard, settings, speakText, speakLang]);

    // จัดการคีย์บอร์ดลัด (Anki Parity Keyboard Shortcuts)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!currentCard) return;
            
            if (!showAnswer) {
                // กด Spacebar หรือ Enter เพื่อพลิกการ์ดเฉลย
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setShowAnswer(true);
                }
            } else {
                // กดคีย์ 1-4 เพื่อให้คะแนน หรือกด Space/Enter อีกรอบเพื่อเลือก 'good' (เป็นค่ากลาง)
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
                } else if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleRate('good');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAnswer, currentIndex, currentCard, quizQueue]);

    if (!currentCard) {
        return (
            <div className="fixed inset-0 z-50 bg-[#080B11] flex flex-col items-center justify-center animate-fade-in p-6">
                <div className="text-brand-yellow mb-6 text-6xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-black text-white mb-2">Review Complete!</h2>
                <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">You've successfully studied all scheduled items in this session.</p>
                <button onClick={onClose} className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-navy-950 font-black rounded-2xl shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all uppercase text-sm tracking-wider">
                    Go Back To Dashboard
                </button>
            </div>
        );
    }

    const handleRate = (rating) => {
        setShowAnswer(false); 
        onSaveSRS(currentCard.uniqueId, rating);
        if (currentIndex < quizQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose(); 
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-gradient-to-br from-[#080B11] via-[#0E131F] to-[#17132B] flex flex-col h-full w-full overflow-hidden animate-fade-in text-slate-200">
            {/* Background Decorative Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between z-10 bg-navy-900/40 backdrop-blur-md shrink-0 border-b border-white/[0.05]">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:scale-105 active:scale-95 transition-all">
                    <XIcon size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">SRS SuperMemo Engine</span>
                    <span className="text-xs font-bold text-slate-200 mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-ping"></span>
                        Active Review Session
                    </span>
                </div>
                <button onClick={onOpenSettings} className="p-2 -mr-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:scale-105 active:scale-95 transition-all">
                    <SlidersIcon size={18}/>
                </button>
            </div>
            
            {/* Session Progress Bar */}
            <div className="px-6 mb-4 mt-3 shrink-0 max-w-md mx-auto w-full">
                <div className="flex justify-between text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                    <span>CARDS PROGRESS</span>
                    <span className="text-brand-yellow font-black">{currentIndex + 1} / {quizQueue.length}</span>
                </div>
                <div className="w-full h-1.5 bg-[#04060A] border border-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-300 rounded-full" style={{ width: `${((currentIndex + 1) / quizQueue.length) * 100}%` }}></div>
                </div>
            </div>

            {/* Main Interactive Flipcard Area */}
            <div className="flex-1 flex flex-col px-5 pb-6 overflow-hidden max-w-md mx-auto w-full">
                
                {/* 3D perspective structure */}
                <div className="flex-1 perspective-1000 relative select-none">
                    
                    {/* Flipping container */}
                    <div 
                        onClick={() => { if(!showAnswer) setShowAnswer(true); }}
                        className={`w-full h-full transform-style-3d transition-transform duration-500 relative cursor-pointer ${
                            showAnswer ? 'rotate-y-180' : ''
                        }`}
                    >
                        {/* 🌟 FRONT FACE (Question) */}
                        <div className="absolute inset-0 w-full h-full backface-hidden backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] shadow-2xl flex flex-col p-6 overflow-hidden">
                            <div className="flex justify-between items-center w-full pb-4 border-b border-white/[0.04]">
                                <span className="border border-brand-yellow/30 text-brand-yellow text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-brand-yellow/10">
                                    Question Front
                                </span>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if(window.Utils && window.Utils.speak) window.Utils.speak(isThaiFront ? currentCard?.th : currentCard?.en, isThaiFront ? 'th-TH' : 'en-US', settings.speed); 
                                    }} 
                                    className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors active:scale-90"
                                >
                                    <Volume2Icon size={18} />
                                </button>
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-[0.2em] mb-4">
                                    {isThaiFront ? 'แปลประโยคภาษาไทยเป็นภาษาอังกฤษ' : 'Translate English to Thai'}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed tracking-wide text-center">
                                    {frontText}
                                </h3>
                                
                                <div className="mt-8 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2 flex items-center gap-1.5 text-slate-500 hover:text-slate-400 hover:border-white/10 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                    <span>Tap Card or Press [Space] to flip</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-center opacity-25 pb-4">
                                <BookIcon size={20}/>
                            </div>
                        </div>

                        {/* 🌟 BACK FACE (Answer) */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 backdrop-blur-xl bg-[#0F1422]/90 border border-white/[0.08] rounded-[2.5rem] shadow-2xl flex flex-col p-6 overflow-hidden">
                            <div className="flex justify-between items-center w-full pb-4 border-b border-white/[0.04]">
                                <span className="border border-emerald-500/30 text-emerald-400 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-emerald-500/10">
                                    Answer Back
                                </span>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if(window.Utils && window.Utils.speak) window.Utils.speak(speakText, speakLang, settings.speed); 
                                    }} 
                                    className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors active:scale-90"
                                >
                                    <Volume2Icon size={18} />
                                </button>
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6 text-center">
                                <div className="space-y-1.5 w-full">
                                    <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase">Question</p>
                                    <h4 className="text-sm font-semibold text-slate-400 leading-normal">{frontText}</h4>
                                </div>
                                <div className="w-12 h-[1px] bg-white/[0.05] rounded-full mx-auto"></div>
                                <div className="space-y-2 w-full">
                                    <p className="text-[8px] text-brand-yellow font-black tracking-widest uppercase">Correct Translation</p>
                                    <h3 className="text-xl md:text-2xl font-black text-emerald-400 leading-relaxed tracking-wide drop-shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                                        {backText}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center justify-center opacity-25 pb-4">
                                <CheckCircleIcon size={20}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SRS Score Ratings Action Panel (Visible below card when flipped) */}
            <div className={`p-5 bg-navy-950/60 border-t border-white/[0.05] backdrop-blur-xl shrink-0 z-20 transition-all duration-300 transform ${
                showAnswer ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
            }`}>
                <div className="max-w-md mx-auto space-y-3.5">
                    <p className="text-center text-[9px] font-black tracking-[0.18em] text-slate-400 uppercase">
                        Rate how well you recalled this card:
                    </p>
                    <div className="flex gap-2 h-16">
                        {/* Rating Buttons with clear Keyboard shortcuts indicators */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRate('again'); }} 
                            className="flex-1 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 flex flex-col items-center justify-center active:scale-95 transition-all"
                        >
                            <span className="font-black text-xs uppercase tracking-wider">Again</span>
                            <span className="text-[8px] opacity-60 mt-0.5">&lt; 10m [1]</span>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRate('hard'); }} 
                            className="flex-1 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 hover:border-orange-500/30 flex flex-col items-center justify-center active:scale-95 transition-all"
                        >
                            <span className="font-black text-xs uppercase tracking-wider">Hard</span>
                            <span className="text-[8px] opacity-60 mt-0.5">2d [2]</span>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRate('good'); }} 
                            className="flex-1 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 hover:border-blue-500/30 flex flex-col items-center justify-center active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-400/30"
                        >
                            <span className="font-black text-xs uppercase tracking-wider flex items-center gap-1">Good <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span></span>
                            <span className="text-[8px] opacity-75 mt-0.5">4d [3/Space]</span>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRate('easy'); }} 
                            className="flex-1 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 flex flex-col items-center justify-center active:scale-95 transition-all"
                        >
                            <span className="font-black text-xs uppercase tracking-wider">Easy</span>
                            <span className="text-[8px] opacity-60 mt-0.5">7d [4]</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
