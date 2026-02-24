window.DashboardView = ({ SessionData, srsData, timeSpent, currentStreak, dueCardsCount, onNavigateToSession, onNavigateTab }) => {
    // ⭐️ เพิ่ม State สำหรับควบคุม Popup
    const [showNotifPopup, setShowNotifPopup] = React.useState(false);
    
    const { BookIcon, BellIcon, FlameIcon, PlayIcon, LockIcon, CheckCircleIcon } = window.Icons;
    const activeMinutes = Math.floor(timeSpent / 60);

    const calcProgress = (sess) => {
        if (!sess || !sess.data || !Array.isArray(sess.data)) return { percent: 0, count: 0, total: 0 };
        const allIDs = sess.data.flatMap(cat => (cat.sentences && Array.isArray(cat.sentences)) ? cat.sentences.map((_, i) => `${cat.id}-${i}`) : []);
        if (allIDs.length === 0) return { percent: 0, count: 0, total: 0 };
        const learned = allIDs.filter(id => srsData && srsData[id]).length;
        return { percent: Math.round((learned / allIDs.length) * 100), count: learned, total: allIDs.length };
    };

    if (!SessionData || SessionData.length === 0) return null;

    const currentSession = SessionData[0];
    const sess1Prog = calcProgress(currentSession);

    return (
        <div className="p-5 pb-32 animate-fade-in relative z-10">
            {/* ⭐️ ดึงเอา Popup มาโชว์ถ้ากดกระดิ่ง */}
            {window.ESB_Features && window.ESB_Features.NotificationPopup && (
                <window.ESB_Features.NotificationPopup isOpen={showNotifPopup} onClose={() => setShowNotifPopup(false)} dueCount={dueCardsCount} />
            )}

            <div className="flex justify-between items-center mb-10 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)]"><BookIcon size={24} className="text-navy-900 fill-navy-900/50" /></div>
                    <div><div className="text-[10px] font-bold tracking-widest text-brand-yellow uppercase">ESB Thai</div><h1 className="text-2xl font-serif italic font-bold text-white leading-none">Dashboard</h1></div>
                </div>
                {/* ⭐️ แก้ไขปุ่มกระดิ่งให้สั่งเปิด Popup */}
                <button className="p-3 bg-navy-800 border border-white/5 rounded-full text-slate-300 relative shadow-lg active:scale-95 transition-transform" onClick={() => setShowNotifPopup(true)}>
                    <BellIcon size={20}/>
                    {/* แจ้งเตือนจุดแดงถ้ามีอัปเดตหรือการ์ดค้าง */}
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand-yellow rounded-full border-2 border-navy-800"></span>
                </button>
            </div>

            <div className="mb-8 pl-1"><h2 className="text-3xl font-light text-slate-300">Welcome back,</h2><h2 className="text-4xl font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mt-1">Learner.</h2></div>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-gradient-to-b from-navy-800 to-[#10172A] p-5 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden"><div className="absolute -right-4 -top-4 w-16 h-16 bg-brand-accent/10 rounded-full blur-xl"></div><div className="flex items-center gap-2 mb-3"><FlameIcon size={18} className="text-brand-accent drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" /><span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Current Streak</span></div><div className="flex items-baseline gap-1.5 relative z-10"><span className="text-4xl font-bold text-white tracking-tight">{currentStreak}</span><span className="text-sm font-medium text-slate-500">Days</span></div></div>
                <div className="bg-gradient-to-b from-navy-800 to-[#10172A] p-5 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden"><div className="absolute -right-4 -top-4 w-16 h-16 bg-brand-yellow/10 rounded-full blur-xl"></div><div className="flex items-center gap-2 mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-yellow drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Time Today</span></div><div className="flex items-baseline gap-1.5 relative z-10"><span className="text-4xl font-bold text-white tracking-tight">{activeMinutes}</span><span className="text-sm font-medium text-slate-500">Mins</span></div></div>
            </div>

            <div className="mb-10">
                <div className="flex justify-between items-end mb-4 px-1"><h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Current Session</h3><button onClick={() => onNavigateTab('study')} className="text-xs font-bold text-brand-yellow hover:text-yellow-300">VIEW ALL</button></div>
                <div onClick={() => onNavigateToSession(0)} className="bg-gradient-to-br from-navy-800 to-navy-900 p-6 rounded-[2rem] border border-brand-yellow/20 shadow-[0_10px_40px_-10px_rgba(250,204,21,0.15)] relative cursor-pointer overflow-hidden group"><div className="absolute right-0 top-0 w-40 h-40 bg-brand-yellow/5 rounded-full blur-3xl group-hover:bg-brand-yellow/10 transition-colors"></div><div className="flex justify-between items-start mb-6 relative z-10"><span className="bg-brand-yellow/10 text-brand-yellow text-[10px] font-bold px-3 py-1.5 rounded-lg border border-brand-yellow/20 uppercase tracking-widest backdrop-blur-md">In Progress</span><div className="w-12 h-12 rounded-full bg-navy-900/80 backdrop-blur border border-white/5 flex items-center justify-center text-brand-yellow shadow-inner group-hover:scale-110 transition-transform"><PlayIcon size={20} className="fill-brand-yellow" /></div></div><h2 className="text-2xl font-bold text-white mb-2 font-serif relative z-10">{currentSession?.title?.split(':')[0]}</h2><p className="text-sm text-slate-400 mb-8 relative z-10">Continue your learning journey.</p><div className="relative z-10"><div className="flex justify-between text-[11px] font-bold tracking-widest text-slate-400 mb-3 uppercase"><span>{sess1Prog.count} / {sess1Prog.total} Cards</span><span className="text-brand-yellow">{sess1Prog.percent}%</span></div><div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden border border-white/5 shadow-inner"><div className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 transition-all duration-1000 relative" style={{ width: `${sess1Prog.percent}%` }}><div className="absolute inset-0 bg-white/20"></div></div></div></div></div>
            </div>

            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 px-1">Learning Path</h3>
            <div className="space-y-4">
                {SessionData.slice(1).map((sess, i) => {
                    const prog = calcProgress(sess);
                    return (
                        <div key={sess.id} onClick={() => onNavigateToSession(i + 1)} className="flex items-center gap-5 bg-gradient-to-r from-navy-800 to-navy-900/80 p-5 rounded-3xl border border-white/5 shadow-lg cursor-pointer">
                            <div className="w-14 h-14 rounded-2xl bg-[#0B1121] flex items-center justify-center border border-white/5 shadow-inner shrink-0 relative overflow-hidden">{prog.percent >= 100 ? <CheckCircleIcon size={24} className="text-emerald-400 relative z-10"/> : <BookIcon size={24} className="text-slate-500 relative z-10"/>}</div><div className="flex-1 min-w-0"><h4 className="text-base font-bold text-slate-200 truncate">{sess.title.split(':')[0]}</h4><div className="flex items-center gap-3 mt-2"><div className="flex-1 h-1.5 bg-navy-900 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-slate-600 transition-all duration-700" style={{ width: `${prog.percent}%` }}></div></div><span className="text-[10px] font-bold text-slate-500 min-w-[24px] text-right">{prog.percent}%</span></div></div><div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center border border-white/5"><LockIcon size={14} className="text-slate-500" /></div>
                        </div>
                    );
                })}
            </div><div className="h-10"></div>
        </div>
    );
};
