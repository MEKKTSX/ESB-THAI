window.Utils = {
    shuffleArray: (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    calculateSRS: (cardData, rating) => {
        let { interval = 0, ease = 2.5, step = 0 } = cardData || {};
        if (rating === 'again') { step = 0; interval = 0; ease = Math.max(1.3, ease - 0.2); } 
        else if (rating === 'hard') { if (step === 0) { interval = 1; step = 1; } else { interval = Math.max(1, Math.round(interval * 1.2)); ease = Math.max(1.3, ease - 0.15); } } 
        else if (rating === 'good') { if (step === 0) { interval = 4; step = 1; } else { interval = Math.max(1, Math.round(interval * ease)); } } 
        else if (rating === 'easy') { if (step === 0) { interval = 7; step = 1; } else { ease += 0.15; interval = Math.max(7, Math.round(interval * ease * 1.3)); } }
        const nextDate = new Date();
        if (interval > 0) nextDate.setDate(nextDate.getDate() + interval);
        else nextDate.setMinutes(nextDate.getMinutes() + 10);
        nextDate.setHours(4, 0, 0, 0); 
        return { interval, ease, step, nextReview: nextDate.getTime() };
    },
    smartChunk: (text) => {
        const words = text.split(' '); const chunks = []; let current = [];
        const breakWords = new Set(['and', 'but', 'or', 'so', 'because', 'to', 'for', 'with', 'in', 'on', 'at', 'about', 'which', 'that', 'who', 'when', 'where', 'while']);
        words.forEach((word) => {
            const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
            if (breakWords.has(cleanWord) && current.length > 0) { chunks.push(current.join(' ')); current = [word]; } 
            else { current.push(word); if (word.match(/[.,!?:]$/)) { chunks.push(current.join(' ')); current = []; } }
        });
        if (current.length > 0) chunks.push(current.join(' '));
        return chunks.filter(c => c.trim().length > 0);
    },
    speak: (text, lang = 'en-US', speed = 1.0) => {
        try {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang; utterance.rate = speed;
            window.speechSynthesis.speak(utterance);
        } catch (e) { console.warn("Audio error", e); }
    }
};

const IconBase = ({ children, size = 24, className = "", onClick }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} onClick={onClick}>{children}</svg>
);

window.Icons = {
    HomeIcon: (p) => <IconBase {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></IconBase>,
    BookIcon: (p) => <IconBase {...p}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></IconBase>,
    DictIcon: (p) => <IconBase {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></IconBase>,
    ChartIcon: (p) => <IconBase {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></IconBase>,
    UserIcon: (p) => <IconBase {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconBase>,
    BellIcon: (p) => <IconBase {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></IconBase>,
    FlameIcon: (p) => <IconBase {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></IconBase>,
    TargetIcon: (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></IconBase>,
    PlayIcon: (p) => <IconBase {...p}><polygon points="5 3 19 12 5 21 5 3"/></IconBase>,
    CardsIcon: (p) => <IconBase {...p}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></IconBase>,
    LockIcon: (p) => <IconBase {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>,
    ChevronLeftIcon: (p) => <IconBase {...p}><path d="m15 18-6-6 6-6"/></IconBase>,
    SettingsIcon: (p) => <IconBase {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></IconBase>,
    BookmarkIcon: (p) => <IconBase {...p}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></IconBase>,
    CheckCircleIcon: (p) => <IconBase {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconBase>,
    CircleIcon: (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/></IconBase>,
    XIcon: (p) => <IconBase {...p}><path d="M18 6 6 18"/><path d="m6 6 18 18"/></IconBase>,
    DownloadIcon: (p) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></IconBase>,
    UploadIcon: (p) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconBase>,
    Volume2Icon: (p) => <IconBase {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></IconBase>,
    SlidersIcon: (p) => <IconBase {...p}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></IconBase>
};

window.SharedComponents = {
    BottomNav: ({ activeTab, setActiveTab }) => {
        const navItems = [
            { id: 'home', icon: window.Icons.HomeIcon, label: 'Home' },
            { id: 'study', icon: window.Icons.DictIcon, label: 'Study' },
            { id: 'progress', icon: window.Icons.ChartIcon, label: 'Review' },
            { id: 'profile', icon: window.Icons.UserIcon, label: 'Profile' }
        ];
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-navy-700 pb-safe z-40">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-brand-yellow' : 'text-slate-500'}`}>
                                <Icon size={22} className={isActive ? "fill-brand-yellow/20" : ""} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    },
    ChunkedSentenceCard: ({ sentence, isActive, onClick, onSaveSRS, langToggle, isSelectionMode, isSelected, onToggleSelect, isBookmarked, onToggleBookmark, isLocked }) => {
        const { BookmarkIcon, Volume2Icon, CheckCircleIcon, CircleIcon } = window.Icons;
        const mainText = langToggle === 'en' ? sentence.en : sentence.th;
        const chunks = window.Utils.smartChunk(sentence.en);
        
        const borderStyle = isSelected 
            ? "border-2 border-brand-yellow shadow-[0_0_15px_rgba(250,204,21,0.2)]" 
            : (isLocked ? "border border-transparent opacity-40 grayscale" : "border border-navy-700/50 hover:bg-navy-700/50");

        // ⭐️ แก้ไขให้โหมดเลือกการ์ด สามารถจิ้มเลือกการ์ดที่ติดล็อคไปแล้วได้!
        const handleCardClick = () => {
            if (isSelectionMode) { 
                onToggleSelect(); 
            } 
            else { 
                onClick(); 
            }
        };

        const renderSelectRing = () => {
            if (isSelected) return <CheckCircleIcon size={24} className="text-brand-yellow fill-brand-yellow/20" />;
            if (isLocked) return <CheckCircleIcon size={24} className="text-emerald-500 fill-emerald-500/20" />;
            return <CircleIcon size={24} className="text-navy-600" />;
        };
        
        return (
            <div onClick={handleCardClick} className={`bg-navy-800 p-4 md:p-5 rounded-xl cursor-pointer transition-all relative overflow-hidden ${borderStyle} ${!isActive ? 'flex justify-between items-center' : ''}`}>
                {isSelected && <div className="absolute top-0 right-0 bg-brand-yellow text-navy-900 px-3 py-0.5 rounded-bl-lg text-[10px] font-bold z-10 uppercase">Selected</div>}
                {!isActive && (
                    <>
                        <div className="flex items-center gap-3 flex-1">
                            {isSelectionMode && renderSelectRing()}
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-100 leading-snug">{mainText}</h3>
                                <p className="text-xs text-slate-500 mt-1">{isLocked ? 'Reviewed today' : `Tap to ${isSelectionMode ? 'select' : 'reveal'}`}</p>
                            </div>
                        </div>
                        {!isSelectionMode && <Volume2Icon size={20} className="text-slate-500 shrink-0 ml-2" onClick={(e) => { e.stopPropagation(); window.Utils.speak(sentence.en); }} />}
                    </>
                )}
                {isActive && (
                    <div className="animate-fade-in w-full">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-2">
                                {isSelectionMode && renderSelectRing()}
                                <span className="bg-brand-yellow/20 text-brand-yellow text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-brand-yellow/30">Active</span>
                            </div>
                            <div className="flex gap-3 items-center" onClick={e => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}><BookmarkIcon size={20} className={isBookmarked ? "text-brand-yellow fill-brand-yellow" : "text-slate-500"} /></button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)] active:scale-95 transition-transform"><Volume2Icon size={20} className="text-navy-900 fill-navy-900" onClick={() => window.Utils.speak(sentence.en)} /></div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">{chunks.map((chunk, i) => <span key={i} className="bg-navy-900/80 text-blue-100 text-sm font-semibold px-3 py-2 rounded-lg border border-navy-700">{chunk}</span>)}</div>
                        <div className="border-t border-navy-700/50 pt-4 mb-5">
                            {langToggle === 'th' && <p className="text-white text-[15px] font-medium mb-2">{sentence.en}</p>}
                            <p className="text-slate-300 text-[15px] font-medium">{sentence.th}</p>
                        </div>
                        {!isSelectionMode && !isLocked && (
                            <div className="flex items-center justify-between border-t border-navy-700/50 pt-4" onClick={(e) => e.stopPropagation()}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SRS Rating</span>
                                <div className="flex gap-1.5">
                                    <button onClick={() => { onSaveSRS(sentence.uniqueId, 'again'); onClick(); }} className="px-3 py-1.5 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold">Again</button>
                                    <button onClick={() => { onSaveSRS(sentence.uniqueId, 'good'); onClick(); }} className="px-3 py-1.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">Good</button>
                                    <button onClick={() => { onSaveSRS(sentence.uniqueId, 'easy'); onClick(); }} className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">Easy</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
};
