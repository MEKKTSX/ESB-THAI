window.ProfileView = ({ memoryStats, onExport, onImport, bookmarksCount, dueCardsCount, onOpenBookmarks }) => {
    const { useRef } = React; // ⭐️ ดึงจาก React มาไว้ข้างในนี้
    
    // ระบบต้านทานไอคอนหาย
    const Fallback = () => <span></span>;
    const Icons = window.Icons || {};
    const ChartIcon = Icons.ChartIcon || Fallback;
    const DownloadIcon = Icons.DownloadIcon || Fallback;
    const UploadIcon = Icons.UploadIcon || Fallback;
    const XIcon = Icons.XIcon || Fallback;
    const BookmarkIcon = Icons.BookmarkIcon || Fallback;
    const ChevronLeftIcon = Icons.ChevronLeftIcon || Fallback;

    const fileInputRef = useRef(null);

    const handleResetAll = () => {
        if(window.confirm("⚠️ คำเตือน: คุณต้องการ 'ล้างข้อมูลทั้งหมด' รวมถึงเวลาที่ใช้งานวันนี้ และกลับไปเริ่มใหม่จากศูนย์ใช่ไหม?")) {
            // ลบข้อมูลการเรียนและ SRS
            localStorage.removeItem('esb_srs_data');
            localStorage.removeItem('esb_app_settings');
            localStorage.removeItem('esb_bookmarks');
            localStorage.removeItem('esb_review_history'); 
            localStorage.removeItem('esb_daily_progress'); 
            
            // ⭐️ บรรทัดที่หายไป: ลบเวลาใช้งานวันนี้
            localStorage.removeItem('esb_time_spent'); 
            
            // สั่งโหลดหน้าเว็บใหม่เพื่อให้ State ใน App กลับเป็นค่าเริ่มต้น
            window.location.reload();
        }
    };


    return (
        <div className="p-5 pb-32 animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-8 pt-2">Profile & Settings</h1>
            
            <div className="bg-navy-800 p-5 rounded-2xl border border-navy-700 mb-6 shadow-lg">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ChartIcon size={16}/> Progress Stats</h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-navy-900 p-4 rounded-xl border border-navy-700 text-center"><div className="text-xl font-bold text-slate-300 mb-1">{memoryStats.unseen}</div><div className="text-[9px] text-slate-500 uppercase tracking-widest">Unseen</div></div>
                    <div className="bg-navy-900 p-4 rounded-xl border border-brand-accent/30 text-center"><div className="text-xl font-bold text-brand-accent mb-1">{memoryStats.learning}</div><div className="text-[9px] text-brand-accent/70 uppercase tracking-widest">Learning</div></div>
                    <div className="bg-navy-900 p-4 rounded-xl border border-emerald-500/30 text-center"><div className="text-xl font-bold text-emerald-500 mb-1">{memoryStats.mastered}</div><div className="text-[9px] text-emerald-500/70 uppercase tracking-widest">Mastered</div></div>
                </div>
            </div>

            <div className="mb-6">
                 <button onClick={onOpenBookmarks} className="w-full flex items-center justify-between bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white p-5 rounded-2xl shadow-lg transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center"><BookmarkIcon size={20} className="text-brand-yellow" /></div>
                        <span className="font-bold">My Bookmarks</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-brand-yellow/20 text-brand-yellow text-xs font-bold px-2 py-1 rounded-full">{bookmarksCount} saved</span>
                        <ChevronLeftIcon size={16} className="text-slate-500 rotate-180" />
                    </div>
                </button>
            </div>

            {/* ปุ่มแจ้งเตือน */}
            <div className="mb-6">
                {window.ESB_Features && window.ESB_Features.NotificationToggle ? (
                    <window.ESB_Features.NotificationToggle dueCount={dueCardsCount} />
                ) : (
                    <button className="w-full flex items-center justify-center bg-navy-900 border border-navy-700 text-slate-500 py-4 rounded-xl text-sm">กำลังโหลดระบบแจ้งเตือน...</button>
                )}
            </div>

            <div className="bg-navy-800 p-5 rounded-2xl border border-navy-700 mb-6 shadow-lg space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data Management</h3>
                <button onClick={onExport} className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-700 border border-navy-700 text-white py-4 rounded-xl font-bold transition-colors text-sm"><DownloadIcon size={18}/> Backup Data (JSON)</button>
                <label className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-700 border border-navy-700 text-white py-4 rounded-xl font-bold transition-colors cursor-pointer text-sm">
                    <UploadIcon size={18}/> Restore Data <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={onImport} />
                </label>
            </div>

            <div className="mt-8">
                <button onClick={handleResetAll} className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-rose-500/10 border border-rose-500/30 text-rose-500 py-4 rounded-xl font-bold transition-colors text-sm">
                    <XIcon size={18} /> เริ่มใหม่ (Reset All)
                </button>
            </div>
        </div>
    );
};
