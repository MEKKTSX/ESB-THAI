window.ProfileView = ({ memoryStats, onExport, onImport, bookmarksCount, dueCardsCount, onOpenBookmarks, onResetAll }) => {
    const { useRef } = React;
    const Icons = window.Icons || {};
    const { ChartIcon, DownloadIcon, UploadIcon, XIcon, BookmarkIcon, ChevronLeftIcon } = Icons;

    return (
        <div className="p-5 pb-32 animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-8 pt-2">Profile & Settings</h1>
            
            <div className="bg-navy-800 p-5 rounded-2xl border border-white/5 mb-6 shadow-lg">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    {ChartIcon && <ChartIcon size={16}/>} Progress Stats
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-navy-900 p-4 rounded-xl text-center"><div className="text-xl font-bold text-slate-300">{memoryStats.unseen}</div><div className="text-[9px] text-slate-500 uppercase">Unseen</div></div>
                    <div className="bg-navy-900 p-4 rounded-xl text-center"><div className="text-xl font-bold text-brand-accent">{memoryStats.learning}</div><div className="text-[9px] text-brand-accent/70 uppercase">Learning</div></div>
                    <div className="bg-navy-900 p-4 rounded-xl text-center"><div className="text-xl font-bold text-emerald-500">{memoryStats.mastered}</div><div className="text-[9px] text-emerald-500/70 uppercase">Mastered</div></div>
                </div>
            </div>

            <div className="mb-6">
                 <button onClick={onOpenBookmarks} className="w-full flex items-center justify-between bg-navy-800 border border-white/5 text-white p-5 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">{BookmarkIcon && <BookmarkIcon size={20} className="text-brand-yellow" />}<span className="font-bold">My Bookmarks</span></div>
                    <div className="flex items-center gap-2"><span className="bg-brand-yellow/20 text-brand-yellow text-xs font-bold px-2 py-1 rounded-full">{bookmarksCount}</span>{ChevronLeftIcon && <ChevronLeftIcon size={16} className="rotate-180" />}</div>
                </button>
            </div>

            <div className="mb-6">
                {window.ESB_Features?.NotificationToggle && <window.ESB_Features.NotificationToggle dueCount={dueCardsCount} />}
            </div>

            <div className="bg-navy-800 p-5 rounded-2xl border border-white/5 mb-6 shadow-lg space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Management</h3>
                <button onClick={onExport} className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white py-4 rounded-xl font-bold shadow-md active:scale-95 transition-all">
                    {DownloadIcon && <DownloadIcon size={18}/>} Backup Data (JSON)
                </button>
                <label className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white py-4 rounded-xl font-bold shadow-md active:scale-95 transition-all cursor-pointer">
                    {UploadIcon && <UploadIcon size={18}/>} Restore Data <input type="file" accept=".json" className="hidden" onChange={onImport} />
                </label>
            </div>

            <div className="mt-8">
                {/* ⭐️ เรียกใช้ onResetAll ที่ส่งตรงมาจาก app.js */}
                <button onClick={onResetAll} className="w-full flex items-center justify-center gap-2 border border-rose-500/30 text-rose-500 py-4 rounded-xl font-bold active:scale-95 transition-all">
                    {XIcon && <XIcon size={18} />} เริ่มใหม่ (Reset All)
                </button>
            </div>
        </div>
    );
};
