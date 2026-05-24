window.ProfileView = ({ memoryStats, onExport, onImport, bookmarksCount, dueCardsCount, onOpenBookmarks, onResetAll }) => {
    const { useRef } = React;
    const Icons = window.Icons || {};
    const { ChartIcon, DownloadIcon, UploadIcon, XIcon, BookmarkIcon, ChevronLeftIcon, TargetIcon } = Icons;

    const totalCards = memoryStats.unseen + memoryStats.learning + memoryStats.mastered;
    const unseenPct = totalCards > 0 ? (memoryStats.unseen / totalCards) * 100 : 0;
    const learningPct = totalCards > 0 ? (memoryStats.learning / totalCards) * 100 : 0;
    const masteredPct = totalCards > 0 ? (memoryStats.mastered / totalCards) * 100 : 0;

    return (
        <div className="p-5 pb-36 animate-fade-in max-w-md mx-auto text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pt-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-wide">My Profile</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Language learning statistics</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-yellow/20 to-amber-500/20 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow font-black shadow-lg">
                    {TargetIcon ? <TargetIcon size={20} /> : '🎯'}
                </div>
            </div>
            
            {/* Progress Stats Card */}
            <div className="bg-white/[0.02] border border-white/[0.05] p-5.5 rounded-[2rem] mb-6 shadow-2xl relative overflow-hidden group hover:border-white/[0.08] transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                    {ChartIcon && <ChartIcon size={14} className="text-indigo-400" />} Library Stats
                </h3>

                {/* Stacked Progress Bar */}
                <div className="w-full h-3 bg-navy-950/80 rounded-full overflow-hidden border border-white/5 shadow-inner mb-6 flex relative z-10">
                    {totalCards > 0 ? (
                        <>
                            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${unseenPct}%` }} title={`Unseen: ${memoryStats.unseen}`}></div>
                            <div className="h-full bg-orange-500" style={{ width: `${learningPct}%` }} title={`Learning: ${memoryStats.learning}`}></div>
                            <div className="h-full bg-emerald-500" style={{ width: `${masteredPct}%` }} title={`Mastered: ${memoryStats.mastered}`}></div>
                        </>
                    ) : (
                        <div className="h-full bg-slate-800 w-full"></div>
                    )}
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-3 gap-3 relative z-10">
                    <div className="bg-[#04060A]/40 border border-white/[0.03] p-4 rounded-2xl text-center">
                        <div className="text-xl font-black text-brand-yellow">{memoryStats.unseen}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Unseen</div>
                        <div className="text-[8px] text-slate-600 mt-0.5">({unseenPct.toFixed(0)}%)</div>
                    </div>
                    <div className="bg-[#04060A]/40 border border-white/[0.03] p-4 rounded-2xl text-center">
                        <div className="text-xl font-black text-orange-400">{memoryStats.learning}</div>
                        <div className="text-[9px] text-orange-400/80 font-bold uppercase mt-1">Learning</div>
                        <div className="text-[8px] text-slate-600 mt-0.5">({learningPct.toFixed(0)}%)</div>
                    </div>
                    <div className="bg-[#04060A]/40 border border-white/[0.03] p-4 rounded-2xl text-center">
                        <div className="text-xl font-black text-emerald-400">{memoryStats.mastered}</div>
                        <div className="text-[9px] text-emerald-500/80 font-bold uppercase mt-1">Mastered</div>
                        <div className="text-[8px] text-slate-600 mt-0.5">({masteredPct.toFixed(0)}%)</div>
                    </div>
                </div>
            </div>

            {/* Bookmarks Access Panel */}
            <div className="mb-6">
                 <button onClick={onOpenBookmarks} className="w-full flex items-center justify-between bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] hover:bg-white/[0.04] text-white p-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] group">
                    <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow shadow-inner">
                            {BookmarkIcon ? <BookmarkIcon size={16} className="fill-brand-yellow text-brand-yellow" /> : '🔖'}
                        </div>
                        <span className="font-extrabold text-sm tracking-wide text-slate-200">Sentence Bookmarks</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-brand-yellow/10 text-brand-yellow text-xs font-black px-3 py-1 rounded-full border border-brand-yellow/20">{bookmarksCount}</span>
                        {ChevronLeftIcon && <ChevronLeftIcon size={16} className="rotate-180 text-slate-500 group-hover:text-slate-300 transition-colors" />}
                    </div>
                </button>
            </div>

            {/* Notifications Toggle component */}
            <div className="mb-6">
                {window.ESB_Features?.NotificationToggle && <window.ESB_Features.NotificationToggle dueCount={dueCardsCount} />}
            </div>

            {/* Data Management Backup/Restore */}
            <div className="bg-white/[0.02] border border-white/[0.05] p-5.5 rounded-[2rem] mb-6 shadow-2xl space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Backup & Sync</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onExport} className="flex items-center justify-center gap-2 bg-[#0F1422] hover:bg-[#151D31] text-xs text-white border border-white/5 py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-all">
                        {DownloadIcon && <DownloadIcon size={16} className="text-slate-400" />} Export Backup
                    </button>
                    <label className="flex items-center justify-center gap-2 bg-[#0F1422] hover:bg-[#151D31] text-xs text-white border border-white/5 py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-all cursor-pointer">
                        {UploadIcon && <UploadIcon size={16} className="text-slate-400" />} Restore Backup
                        <input type="file" accept=".json" className="hidden" onChange={onImport} />
                    </label>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-950/15 border border-rose-500/10 p-5.5 rounded-[2rem] shadow-xl">
                <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Danger Zone
                </h3>
                <p className="text-[10px] text-rose-300/60 leading-normal mb-4 font-semibold">
                    Resetting deletes all customized study logs, bookmarks, and SRS progress data. This operation is non-reversible.
                </p>
                <button onClick={onResetAll} className="w-full flex items-center justify-center gap-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider active:scale-95 transition-all">
                    {XIcon && <XIcon size={14} />} Reset All Data
                </button>
            </div>
        </div>
    );
};
