window.StudyListView = ({ SessionData, initialSessionIndex, allSentencesFlat, onSaveSRS, srsData, selectedCards, toggleCardSelection, toggleSelectAll, onStartCustomReview, bookmarks, toggleBookmark, clearSelection, onStartPracticeReview, onOpenSettings }) => {
    const { useState, useEffect } = React;
    
    const { SettingsIcon, PlayIcon, CardsIcon } = window.Icons;
    const { ChunkedSentenceCard } = window.SharedComponents;

    const [activeSessionIdx, setActiveSessionIdx] = useState(initialSessionIndex || 0);
    const [activeCat, setActiveCat] = useState(SessionData[activeSessionIdx]?.data[0]?.id);
    const [activeId, setActiveId] = useState(null);
    const [langToggle, setLangToggle] = useState('en');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [lastTap, setLastTap] = useState({ id: null, time: 0 });

    const session = SessionData[activeSessionIdx];

    useEffect(() => { 
        if(SessionData[activeSessionIdx]) setActiveCat(SessionData[activeSessionIdx].data[0]?.id); 
    }, [activeSessionIdx, SessionData]);

    const currentCatCards = session?.data.find(c => c.id === activeCat)?.sentences.map((_, i) => `${activeCat}-${i}`) || [];
    const allSessCards = session?.data.flatMap(cat => cat.sentences.map((_, i) => `${cat.id}-${i}`)) || [];
    
    const targetCatIDs = currentCatCards;
    const targetSessIDs = allSessCards;
    
    const isCatAll = targetCatIDs.length > 0 && targetCatIDs.every(id => selectedCards.includes(id));
    const isSessAll = targetSessIDs.length > 0 && targetSessIDs.every(id => selectedCards.includes(id));

    const handleCancelSelection = () => {
        if (clearSelection) clearSelection(); 
        setIsSelectionMode(false); 
    };

    const srsValidCount = selectedCards.filter(id => !(srsData[id] && srsData[id].nextReview > Date.now())).length;

    return (
        <div className="bg-[#0B1121] flex flex-col animate-fade-in relative min-h-screen">
            <div className="relative h-16 bg-[#0B1121]/95 backdrop-blur-md border-b border-white/5 flex items-center justify-center sticky top-0 z-30 px-10">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-lg font-bold text-white">
                    {session?.title.split(':')[0]}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {isDropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                        <div className="absolute top-full mt-2 w-72 bg-navy-800 border border-navy-700 rounded-2xl shadow-2xl z-50 overflow-hidden py-2">
                            {SessionData.map((s, i) => (
                                <button key={s.id} onClick={() => { setActiveSessionIdx(i); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 ${activeSessionIdx === i ? 'text-brand-yellow bg-navy-700/50 border-l-4 border-brand-yellow' : 'text-slate-300'}`}>
                                    <div className="font-bold text-sm">{s.title.split(':')[0]}</div>
                                    <div className="text-xs opacity-60 truncate">{s.title.split(':')[1]}</div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {/* ⭐️ แก้ไขให้ปุ่ม Setting ทำงานได้แล้ว */}
                <button onClick={onOpenSettings} className="absolute right-4 p-2 text-brand-yellow active:scale-90 transition-transform"><SettingsIcon size={20} /></button>
            </div>

            <div className="px-4 py-3 border-b border-white/5 bg-[#0B1121]/80">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selection Tools</span>
                    <div className="flex gap-2">
                        {isSelectionMode && (
                            <button onClick={() => toggleSelectAll(targetSessIDs, !isSessAll)} className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${isSessAll ? 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/50' : 'bg-navy-800 text-slate-400 border-navy-700'}`}>
                                {isSessAll ? 'Deselect Session' : 'Select Session'}
                            </button>
                        )}
                        <button 
                            onClick={isSelectionMode ? handleCancelSelection : () => setIsSelectionMode(true)} 
                            className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${isSelectionMode ? 'bg-brand-yellow text-navy-900 border-brand-yellow shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'bg-navy-800 text-brand-accent border-navy-700 hover:text-white'}`}
                        >
                            {isSelectionMode ? 'Cancel' : 'Select Cards'}
                        </button>
                    </div>
                </div>
                <div className="bg-navy-800/80 p-1.5 rounded-xl flex border border-white/5">
                    <button onClick={() => setLangToggle('en')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${langToggle === 'en' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-navy-900 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>English</button>
                    <button onClick={() => setLangToggle('th')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${langToggle === 'th' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-navy-900 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Thai</button>
                </div>
            </div>

            <div className="bg-[#0B1121] overflow-x-auto whitespace-nowrap px-4 py-3 border-b border-white/5" style={{scrollbarWidth: 'none'}}>
                <div className="flex items-center gap-2">
                    {session?.data.map(cat => (
                        <button key={cat.id} onClick={() => {
                            const now = Date.now();
                            if (lastTap.id === cat.id && now - lastTap.time < 300) {
                                toggleSelectAll(targetCatIDs, !isCatAll); 
                                setLastTap({ id: null, time: 0 });
                            } else { setActiveCat(cat.id); setLastTap({ id: cat.id, time: now }); }
                        }} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${activeCat === cat.id ? 'bg-navy-800 text-brand-yellow border-brand-yellow/30 shadow-inner' : 'bg-transparent text-slate-500 border-navy-700/50 hover:border-navy-600'}`}>{cat.title}</button>
                    ))}
                </div>
            </div>

            <div className="p-4 flex-1 pb-32">
                {session?.data.map((cat) => {
                    if (cat.id !== activeCat) return null;
                    return (
                        <div key={cat.id} className="space-y-3">
                            {cat.sentences.map((_, i) => {
                                const uId = `${cat.id}-${i}`;
                                const card = allSentencesFlat.find(s => s.uniqueId === uId);
                                if (!card) return null;
                                const isLocked = srsData[uId] && srsData[uId].nextReview > Date.now();
                                return (
                                    <ChunkedSentenceCard 
                                        key={uId} 
                                        sentence={card} 
                                        isActive={activeId === uId} 
                                        onClick={() => setActiveId(activeId === uId ? null : uId)} 
                                        onSaveSRS={onSaveSRS} 
                                        langToggle={langToggle} 
                                        isSelectionMode={isSelectionMode} 
                                        isSelected={selectedCards.includes(uId)} 
                                        onToggleSelect={() => toggleCardSelection(uId)} 
                                        isBookmarked={bookmarks.includes(uId)} 
                                        onToggleBookmark={() => toggleBookmark(uId)} 
                                        isLocked={isLocked} 
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {selectedCards.length > 0 && (
                <div className="fixed bottom-24 left-0 right-0 px-5 flex flex-col gap-3 z-30 animate-fade-in pointer-events-auto">
                    <button onClick={onStartCustomReview} className="w-full max-w-sm mx-auto bg-gradient-to-r from-yellow-400 to-amber-500 text-navy-900 shadow-[0_10px_20px_-5px_rgba(250,204,21,0.5)] rounded-2xl py-4 font-bold flex items-center justify-center gap-3 uppercase text-sm active:scale-95 transition-transform">
                        <PlayIcon size={20} /> Study Selected ({srsValidCount})
                    </button>
                    <button onClick={onStartPracticeReview} className="w-full max-w-sm mx-auto bg-slate-100 text-navy-900 shadow-xl rounded-2xl py-4 font-bold flex items-center justify-center gap-3 uppercase text-sm active:scale-95 transition-transform">
                        <CardsIcon size={20} className="fill-slate-400" /> Flash Card ({selectedCards.length})
                    </button>
                </div>
            )}
        </div>
    );
};
