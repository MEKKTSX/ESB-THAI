// bookmarkFeature.js
window.ESB_Features = window.ESB_Features || {};

window.ESB_Features.BookmarkModal = ({ bookmarks, allSentencesFlat, onToggleBookmark, onClose }) => {
    const { XIcon, BookmarkIcon } = window.Icons;
    const { ChunkedSentenceCard } = window.SharedComponents;
    const { useState, useMemo } = React;

    // กรองข้อมูลประโยคที่ถูกเลือกไว้ (ใช้ useMemo เพื่อความเร็ว)
    const bookmarkedCards = useMemo(() => {
        if (!allSentencesFlat || !bookmarks) return [];
        return allSentencesFlat.filter(card => bookmarks.includes(card.uniqueId));
    }, [bookmarks, allSentencesFlat]);

    const [activeId, setActiveId] = useState(null);

    return (
        // ปรับ z-index ให้สูงขึ้นเพื่อให้ลอยทับ Bottom Nav แน่นอน
        <div className="fixed inset-0 z-[100] bg-navy-900 flex flex-col animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-navy-900/95 backdrop-blur border-b border-navy-800 px-5 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <BookmarkIcon size={24} className="text-brand-yellow fill-brand-yellow" />
                    <h2 className="text-xl font-bold text-white">My Bookmarks</h2>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
                    <XIcon size={24}/>
                </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3" style={{ scrollbarWidth: 'none' }}>
                {bookmarkedCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40 mt-20">
                        <BookmarkIcon size={64} className="text-slate-600 mb-4" />
                        <p className="text-slate-400 font-medium text-lg">No bookmarks yet.</p>
                        <p className="text-xs text-slate-500 mt-2">Go to Study mode and tap the bookmark icon.</p>
                    </div>
                ) : (
                    bookmarkedCards.map(card => (
                        <ChunkedSentenceCard 
                            key={card.uniqueId} 
                            sentence={card} 
                            isActive={activeId === card.uniqueId} 
                            onClick={() => setActiveId(activeId === card.uniqueId ? null : card.uniqueId)}
                            langToggle="en" 
                            isSelectionMode={false} 
                            isBookmarked={true}
                            onToggleBookmark={() => onToggleBookmark(card.uniqueId)}
                            onSaveSRS={() => {}} // ปิดการให้คะแนน SRS ในหน้านี้เพื่อไม่ให้กวนกัน
                        />
                    ))
                )}
            </div>
        </div>
    );
};
