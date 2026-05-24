// ==========================================
// 📖 STUDY MODE & CUSTOM CARD CREATOR
// ==========================================
window.StudyListView = ({ 
    SessionData, 
    initialSessionIndex, 
    allSentencesFlat, 
    onSaveSRS, 
    srsData, 
    selectedCards, 
    toggleCardSelection, 
    toggleSelectAll, 
    onStartCustomReview, 
    bookmarks, 
    toggleBookmark, 
    clearSelection, 
    onStartPracticeReview, 
    onStartTypingReview,
    onOpenSettings,
    onAddCustomCard, // Callback จาก app.js
    onDeleteCustomCard // Callback จาก app.js
}) => {
    const { useState, useEffect } = React;
    
    const { SettingsIcon, PlayIcon, CardsIcon } = window.Icons || {};
    const { ChunkedSentenceCard } = window.SharedComponents || {};

    const [activeSessionIdx, setActiveSessionIdx] = useState(initialSessionIndex || 0);
    const [activeCat, setActiveCat] = useState(SessionData[activeSessionIdx]?.data[0]?.id);
    const [activeId, setActiveId] = useState(null);
    const [langToggle, setLangToggle] = useState('en');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [lastTap, setLastTap] = useState({ id: null, time: 0 });
    
    // คีย์สำหรับค้นหาและการเปิดแผงคำสั่ง Custom Card
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddCardPanel, setShowAddCardPanel] = useState(false);
    const [customEn, setCustomEn] = useState("");
    const [customTh, setCustomTh] = useState("");

    const session = SessionData[activeSessionIdx];

    useEffect(() => { 
        if(SessionData[activeSessionIdx]) {
            setActiveCat(SessionData[activeSessionIdx].data[0]?.id); 
        }
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

    const handleCreateCustomCard = (e) => {
        e.preventDefault();
        if (!customEn.trim() || !customTh.trim()) {
            alert("กรุณากรอกทั้งภาษาอังกฤษและภาษาไทยให้ครบถ้วนครับ");
            return;
        }
        if (onAddCustomCard) {
            onAddCustomCard({ en: customEn.trim(), th: customTh.trim() });
            setCustomEn("");
            setCustomTh("");
            setShowAddCardPanel(false);
        }
    };

    const srsValidCount = selectedCards.filter(id => !(srsData[id] && srsData[id].nextReview > Date.now())).length;

    // กรองการ์ดประโยคตามแถบค้นหา (Global Search)
    const filteredSentences = (sentences, catId) => {
        if (!searchQuery.trim()) return sentences;
        const q = searchQuery.toLowerCase();
        return sentences.filter(s => 
            s.en.toLowerCase().includes(q) || 
            s.th.toLowerCase().includes(q)
        );
    };

    return (
        <div className="bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1F1A3A] flex flex-col animate-fade-in relative min-h-screen text-slate-200">
            
            {/* Sticky Header with Dropdown Selection */}
            <div className="sticky top-0 z-30 h-16 bg-[#0B1121]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-6">
                <div className="w-8"></div>
                
                <div className="relative">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                        className="flex items-center gap-2 text-base font-extrabold text-white bg-white/[0.03] border border-white/[0.08] px-4 py-2 rounded-full hover:bg-white/[0.08] transition-all"
                    >
                        <span>{session?.title.split(':')[0]}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    {isDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-72 backdrop-blur-xl bg-[#151F32]/95 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden py-2.5 animate-scale-in">
                                {SessionData.map((s, i) => (
                                    <button 
                                        key={s.id} 
                                        onClick={() => { setActiveSessionIdx(i); setIsDropdownOpen(false); }} 
                                        className={`w-full text-left px-5 py-3.5 transition-colors ${activeSessionIdx === i ? 'text-brand-yellow bg-white/[0.04] border-l-4 border-brand-yellow font-extrabold' : 'text-slate-300 hover:bg-white/[0.02]'}`}
                                    >
                                        <div className="font-bold text-sm">{s.title.split(':')[0]}</div>
                                        <div className="text-xs opacity-60 truncate mt-0.5">{s.title.split(':')[1]}</div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button 
                    onClick={onOpenSettings} 
                    className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:scale-105 active:scale-95 transition-all"
                >
                    {SettingsIcon ? <SettingsIcon size={18} /> : '⚙️'}
                </button>
            </div>

            {/* Sub-Header Tools Panel */}
            <div className="px-5 py-3 border-b border-white/[0.04] bg-navy-950/20 space-y-3.5">
                {/* Search & Custom Card Controls Row */}
                <div className="flex gap-2">
                    {/* Premium Search Bar */}
                    <div className="flex-1 bg-navy-950/60 border border-white/5 rounded-2xl flex items-center px-4 focus-within:border-brand-yellow/30 transition-all">
                        <span className="material-symbols-outlined text-slate-500 text-lg mr-2">search</span>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search sentences..."
                            className="w-full bg-transparent border-none text-white text-xs outline-none py-3"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white">✕</button>
                        )}
                    </div>

                    {/* Add Custom Card Trigger Button */}
                    <button 
                        onClick={() => setShowAddCardPanel(!showAddCardPanel)}
                        className={`px-4 rounded-2xl font-bold text-xs border flex items-center gap-1.5 transition-all ${
                            showAddCardPanel 
                                ? 'bg-brand-yellow text-navy-900 border-brand-yellow' 
                                : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:bg-white/[0.06]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        <span>Add Card</span>
                    </button>
                </div>

                {/* Collapsible Custom Card Panel */}
                {showAddCardPanel && (
                    <form onSubmit={handleCreateCustomCard} className="backdrop-blur-md bg-white/[0.02] border border-brand-yellow/20 p-5 rounded-2xl shadow-xl animate-scale-in space-y-4">
                        <h4 className="text-[10px] font-extrabold text-brand-yellow uppercase tracking-widest flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            <span>Create Your Own Flashcard</span>
                        </h4>
                        
                        <div className="space-y-3">
                            <input 
                                type="text"
                                value={customEn}
                                onChange={(e) => setCustomEn(e.target.value)}
                                placeholder="English sentence (e.g., I love coding.)"
                                className="w-full bg-navy-950/80 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow/40 shadow-inner"
                                required
                            />
                            <input 
                                type="text"
                                value={customTh}
                                onChange={(e) => setCustomTh(e.target.value)}
                                placeholder="Thai translation (e.g., ฉันรักการเขียนโค้ด)"
                                className="w-full bg-navy-950/80 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow/40 shadow-inner"
                                required
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button 
                                type="button" 
                                onClick={() => setShowAddCardPanel(false)}
                                className="px-4 py-2 bg-navy-900 text-slate-400 rounded-xl text-xs font-bold active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-navy-900 rounded-xl text-xs font-bold active:scale-95 shadow-md shadow-yellow-500/10"
                            >
                                Save Card
                            </button>
                        </div>
                    </form>
                )}

                {/* Selection Tools & Language Toggle row */}
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Selection Tools</span>
                    <div className="flex gap-2">
                        {isSelectionMode && (
                            <button onClick={() => toggleSelectAll(targetSessIDs, !isSessAll)} className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border transition-all ${isSessAll ? 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30' : 'bg-navy-900 text-slate-400 border-white/[0.04]'}`}>
                                {isSessAll ? 'Deselect Session' : 'Select Session'}
                            </button>
                        )}
                        <button 
                            onClick={isSelectionMode ? handleCancelSelection : () => setIsSelectionMode(true)} 
                            className={`text-[10px] font-extrabold px-3.5 py-1.5 rounded-full border transition-all ${isSelectionMode ? 'bg-brand-yellow text-navy-900 border-brand-yellow shadow-md' : 'bg-navy-900 text-slate-300 border-white/[0.06] hover:text-white'}`}
                        >
                            {isSelectionMode ? 'Cancel' : 'Select Cards'}
                        </button>
                    </div>
                </div>

                <div className="bg-navy-950/60 p-1 rounded-xl flex border border-white/[0.04] max-w-sm mx-auto">
                    <button onClick={() => setLangToggle('en')} className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${langToggle === 'en' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-navy-900 shadow-md font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}>English</button>
                    <button onClick={() => setLangToggle('th')} className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${langToggle === 'th' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-navy-900 shadow-md font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}>Thai</button>
                </div>
            </div>

            {/* Categories horizontal list */}
            {(!searchQuery.trim()) && (
                <div className="overflow-x-auto whitespace-nowrap px-4 py-3 border-b border-white/[0.04]" style={{scrollbarWidth: 'none'}}>
                    <div className="flex items-center gap-2">
                        {session?.data.map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => {
                                    const now = Date.now();
                                    if (lastTap.id === cat.id && now - lastTap.time < 300) {
                                        toggleSelectAll(targetCatIDs, !isCatAll); 
                                        setLastTap({ id: null, time: 0 });
                                    } else { 
                                        setActiveCat(cat.id); 
                                        setLastTap({ id: cat.id, time: now }); 
                                    }
                                }} 
                                className={`px-4 py-2 rounded-full text-xs font-extrabold border transition-all ${activeCat === cat.id ? 'bg-[#1e293b] text-brand-yellow border-brand-yellow/30 shadow-inner' : 'bg-transparent text-slate-500 border-white/[0.06] hover:border-slate-700'}`}
                            >
                                {cat.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Flashcard List */}
            <div className="p-4 flex-1 pb-44 space-y-3">
                {session?.data.map((cat) => {
                    if (!searchQuery.trim() && cat.id !== activeCat) return null;
                    
                    const sentencesToShow = filteredSentences(cat.sentences || [], cat.id);
                    if (searchQuery.trim() && sentencesToShow.length === 0) return null;

                    return (
                        <div key={cat.id} className="space-y-3 animate-fade-in">
                            {searchQuery.trim() && (
                                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-2 mb-1">{cat.title}</h4>
                            )}
                            {sentencesToShow.map((s) => {
                                // ดึงตำแหน่งดัชนีของประโยคเพื่อประกอบเป็น ID
                                const idx = cat.sentences.indexOf(s);
                                const uId = `${cat.id}-${idx}`;
                                const card = allSentencesFlat.find(sf => sf.uniqueId === uId);
                                if (!card) return null;
                                
                                const isLocked = srsData[uId] && srsData[uId].nextReview > Date.now();
                                const isCustom = card.sessionId === 'custom-session';

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
                                        isCustom={isCustom}
                                        onDeleteCustomCard={() => onDeleteCustomCard && onDeleteCustomCard(uId)}
                                    />
                                );
                            })}
                        </div>
                    );
                })}

                {/* Empty State when Search has no results */}
                {searchQuery.trim() && !session?.data.some(cat => filteredSentences(cat.sentences || [], cat.id).length > 0) && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <span className="material-symbols-outlined text-5xl text-slate-600 mb-3">search_off</span>
                        <p className="text-slate-400 font-bold text-sm">No matching sentences found</p>
                        <p className="text-xs text-slate-500 mt-1">Try another search term</p>
                    </div>
                )}
            </div>

            {/* Selection Sticky Action Buttons */}
            {selectedCards.length > 0 && (
                <div className="fixed bottom-24 left-0 right-0 px-5 flex flex-col gap-2.5 z-30 animate-fade-in pointer-events-auto max-w-sm mx-auto">
                    <button 
                        onClick={onStartCustomReview} 
                        className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-navy-900 shadow-[0_10px_25px_-5px_rgba(250,204,21,0.45)] rounded-2xl py-4 font-bold flex items-center justify-center gap-2 uppercase text-xs active:scale-95 transition-transform"
                    >
                        {PlayIcon ? <PlayIcon size={16} className="fill-navy-900" /> : '▶'} Custom Study ({srsValidCount})
                    </button>
                    
                    <div className="flex gap-2 w-full">
                        <button 
                            onClick={onStartPracticeReview} 
                            className="flex-1 bg-white text-navy-900 shadow-xl rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 uppercase text-[10px] tracking-wider active:scale-95 transition-transform border border-white/10"
                        >
                            {CardsIcon ? <CardsIcon size={14} className="fill-slate-400" /> : '🗂️'} Flash Card ({selectedCards.length})
                        </button>
                        
                        <button 
                            onClick={onStartTypingReview} 
                            className="flex-1 bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 uppercase text-[10px] tracking-wider active:scale-95 transition-transform border border-blue-500/20"
                        >
                            <span className="material-symbols-outlined text-sm">keyboard</span>
                            <span>Typing ({selectedCards.length})</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
