// ==========================================
// 🌟 PREMIUM CONSOLIDATED DASHBOARD VIEW
// ==========================================
window.DashboardView = ({ 
    currentStreak, 
    masteredCount, 
    sessionProgressData, 
    currentActiveSession, 
    setCurrentTab,
    dueCardsCount,
    timeSpent,
    srsData,
    onStartVoiceChat,
    onStartStoryListening
}) => {
    const { useState, useMemo } = React;
    const { 
        HomeIcon, BellIcon, FlameIcon, PlayIcon, LockIcon, 
        CheckCircleIcon, BookIcon, UserIcon, TargetIcon 
    } = window.Icons || {};

    const [showNotifPopup, setShowNotifPopup] = useState(false);

    const activeMinutes = Math.floor(timeSpent.seconds / 60) || 0;

    // ระบบความสำเร็จล้ำสมัย (Achievement Badges System)
    const achievements = useMemo(() => {
        const totalLearned = Object.keys(srsData || {}).length;
        return [
            {
                id: 'first_step',
                title: 'First Step',
                desc: 'Learned at least 1 card',
                icon: '🌱',
                isUnlocked: totalLearned >= 1,
                color: 'from-green-500/20 to-emerald-500/10 text-emerald-400 border-emerald-500/30'
            },
            {
                id: 'consistency',
                title: 'Consistent Learner',
                desc: '3-day streak active',
                icon: '🔥',
                isUnlocked: currentStreak >= 3,
                color: 'from-orange-500/20 to-rose-500/10 text-orange-400 border-orange-500/30'
            },
            {
                id: 'master_mind',
                title: 'Memory Master',
                desc: 'Mastered 10+ cards',
                icon: '🧠',
                isUnlocked: masteredCount >= 10,
                color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30'
            },
            {
                id: 'dedicated',
                title: 'True Dedicated',
                desc: 'Studied for 10+ mins today',
                icon: '🏆',
                isUnlocked: activeMinutes >= 10,
                color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30'
            }
        ];
    }, [srsData, currentStreak, masteredCount, activeMinutes]);

    return (
        <div className="px-6 pt-12 pb-32 space-y-8 animate-fade-in text-slate-200">
            {/* Notification Popup Modal */}
            {window.ESB_Features?.NotificationPopup && (
                <window.ESB_Features.NotificationPopup 
                    isOpen={showNotifPopup} 
                    onClose={() => setShowNotifPopup(false)} 
                    dueCount={dueCardsCount} 
                />
            )}

            {/* Header */}
            <header className="flex justify-between items-center relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center border border-white/[0.08] shadow-lg">
                        <span className="material-symbols-outlined text-blue-400 font-bold">school</span>
                    </div>
                    <div>
                        <h1 className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase leading-none">ESB Thai</h1>
                        <p className="text-lg font-extrabold mt-1 text-white tracking-tight">Dashboard</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowNotifPopup(true)} 
                    className="p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-full text-slate-300 relative shadow-lg active:scale-95 transition-transform"
                >
                    {BellIcon ? <BellIcon size={18} /> : '🔔'}
                    {dueCardsCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0B1121] animate-pulse"></span>
                    )}
                </button>
            </header>

            {/* Welcome Message */}
            <div className="space-y-1">
                <h2 className="text-3xl font-light text-slate-300">Welcome back,</h2>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight leading-tight">
                    Premium Learner.
                </h2>
            </div>

            {/* Primary Stats Panel */}
            <section className="grid grid-cols-2 gap-4">
                {/* Streak Card */}
                <div className="backdrop-blur-md bg-white/[0.02] p-5 rounded-3xl border border-white/[0.06] shadow-xl relative overflow-hidden group hover:border-orange-500/20 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-colors"></div>
                    <div className="flex justify-between items-start mb-3">
                        {FlameIcon ? <FlameIcon size={20} className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" /> : '🔥'}
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Active Streak</span>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{currentStreak} <span className="text-sm font-normal text-slate-400">days</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">Keep the flame alive!</p>
                </div>

                {/* Mastered/Retention Stats Card */}
                <div className="backdrop-blur-md bg-white/[0.02] p-5 rounded-3xl border border-white/[0.06] shadow-xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
                    <div className="flex justify-between items-start mb-3">
                        <span className="material-symbols-outlined text-emerald-400 text-xl drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">workspace_premium</span>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Mastered</span>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{masteredCount} <span className="text-sm font-normal text-slate-400">words</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">Long-term memory</p>
                </div>
            </section>

            {/* Time studied & due reviews secondary row */}
            <section className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-md bg-white/[0.02] px-5 py-4 rounded-2xl border border-white/[0.05] flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-400">schedule</span>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Minutes Today</p>
                        <p className="text-lg font-bold text-white mt-0.5">{activeMinutes} mins</p>
                    </div>
                </div>
                <div className="backdrop-blur-md bg-white/[0.02] px-5 py-4 rounded-2xl border border-white/[0.05] flex items-center gap-3">
                    <span className="material-symbols-outlined text-rose-400">style</span>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pending Due</p>
                        <p className="text-lg font-bold text-white mt-0.5">{dueCardsCount} cards</p>
                    </div>
                </div>
            </section>

            {/* AI Interactive Practice Labs */}
            <section className="space-y-3 max-w-md mx-auto w-full">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    AI Practice Rooms
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Lab 1: AI Voice Talk */}
                    <div 
                        onClick={onStartVoiceChat}
                        className="backdrop-blur-xl bg-white/[0.02] p-5 rounded-3xl border border-white/[0.05] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer shadow-xl relative overflow-hidden group flex flex-col justify-between h-32 active:scale-95"
                    >
                        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-blue-400 text-xl drop-shadow-[0_0_8px_rgba(59,130,246,0.35)]">mic</span>
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Talk AI</span>
                        </div>
                        <div className="space-y-0.5 mt-auto relative z-10">
                            <h4 className="text-[12px] font-extrabold text-white tracking-wide">AI Voice Talk</h4>
                            <p className="text-[9px] text-slate-500 font-bold">Realtime Speech chat</p>
                        </div>
                    </div>

                    {/* Lab 2: Story Listening */}
                    <div 
                        onClick={onStartStoryListening}
                        className="backdrop-blur-xl bg-white/[0.02] p-5 rounded-3xl border border-white/[0.05] hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer shadow-xl relative overflow-hidden group flex flex-col justify-between h-32 active:scale-95"
                    >
                        <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-purple-400 text-xl drop-shadow-[0_0_8px_rgba(168,85,247,0.35)]">hearing</span>
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Listening</span>
                        </div>
                        <div className="space-y-0.5 mt-auto relative z-10">
                            <h4 className="text-[12px] font-extrabold text-white tracking-wide">Story Room</h4>
                            <p className="text-[9px] text-slate-500 font-bold">Listen to narratives</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gamified Achievements Badges */}
            <section className="space-y-3">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Achievement Badges</h3>
                <div className="grid grid-cols-4 gap-2.5">
                    {achievements.map((ach) => (
                        <div 
                            key={ach.id} 
                            className={`backdrop-blur-md rounded-2xl p-3 border text-center flex flex-col items-center justify-center relative group cursor-pointer transition-all duration-300 ${
                                ach.isUnlocked 
                                    ? `bg-gradient-to-b ${ach.color} shadow-lg scale-100 hover:scale-105` 
                                    : 'bg-navy-950/40 border-white/[0.04] opacity-30 grayscale'
                            }`}
                            title={ach.desc}
                        >
                            <span className="text-2xl mb-1.5">{ach.icon}</span>
                            <span className="text-[9px] font-extrabold truncate w-full tracking-tight">{ach.title}</span>
                            
                            {/* Hover tooltip for rules */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block w-40 bg-navy-950 border border-white/10 p-2 rounded-xl text-left text-[9px] shadow-2xl z-50 pointer-events-none">
                                <p className="font-extrabold text-white mb-0.5">{ach.title}</p>
                                <p className="text-slate-400 leading-tight">{ach.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Active Session Showcase Card */}
            {currentActiveSession && (
                <section className="space-y-3">
                    <div className="flex items-end justify-between px-1">
                        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Deck / Session</h3>
                        <button onClick={() => setCurrentTab('study')} className="text-[10px] font-extrabold text-brand-yellow uppercase tracking-wider hover:underline">View All</button>
                    </div>
                    <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-brand-yellow/20 bg-gradient-to-br from-[#131A26] to-[#0A0D15] shadow-2xl p-6 md:p-8 group">
                        {/* Glowing background */}
                        <div className="absolute right-0 top-0 w-44 h-44 bg-brand-yellow/5 rounded-full blur-3xl group-hover:bg-brand-yellow/10 transition-all duration-500"></div>
                        
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest mb-4 border ${currentActiveSession.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]'}`}>
                                    {currentActiveSession.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                                </span>
                                <h4 className="text-2xl font-extrabold text-white mb-2 leading-tight tracking-tight">{currentActiveSession.title.split(':')[0]}</h4>
                                <p className="text-xs text-slate-400 font-light truncate max-w-[200px]">{currentActiveSession.title.split(':')[1] || 'Learn high-frequency sentences.'}</p>
                            </div>
                            <button 
                                onClick={() => setCurrentTab('study')}
                                className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-navy-900 shadow-[0_8px_25px_rgba(250,204,21,0.35)] shrink-0 hover:scale-105 active:scale-95 transition-all"
                            >
                                {PlayIcon ? <PlayIcon size={22} className="fill-navy-900 ml-0.5" /> : '▶'}
                            </button>
                        </div>
                        <div className="mt-8">
                            <div className="flex justify-between text-[10px] font-extrabold text-slate-400 mb-2 tracking-widest uppercase">
                                <span>{currentActiveSession.learnedCards} / {currentActiveSession.totalCards} CARDS</span>
                                <span className="text-brand-yellow">{currentActiveSession.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-white/5 shadow-inner">
                                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-1000" style={{width: `${currentActiveSession.progressPercent}%`}}></div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Learning Path (Deck Progression List) */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Learning Path Progression</h3>
                <div className="space-y-3">
                    {sessionProgressData.map((session, idx) => {
                        const isLocked = !session.isUnlocked;
                        const iconList = ['book', 'business_center', 'flight', 'restaurant', 'computer'];
                        
                        return (
                            <div 
                                key={idx} 
                                onClick={() => { if (!isLocked) setCurrentTab('study'); }} 
                                className={`backdrop-blur-md bg-white/[0.02] border ${isLocked ? 'border-white/[0.02] opacity-40' : 'border-white/[0.06] hover:border-brand-yellow/30 cursor-pointer'} p-4.5 rounded-2xl flex items-center gap-4 transition-all duration-300 group`}
                            >
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isLocked ? 'bg-navy-950 text-slate-600' : 'bg-navy-900 text-slate-300 group-hover:text-brand-yellow transition-colors'}`}>
                                    <span className="material-symbols-outlined">{iconList[idx % 5] || 'book'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm truncate ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>{session.title.split(':')[0]}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="flex-1 bg-navy-950 rounded-full h-1.5 overflow-hidden shadow-inner border border-white/5">
                                            <div className={`h-full rounded-full transition-all duration-700 ${isLocked ? 'bg-slate-700' : 'bg-slate-400 group-hover:bg-brand-yellow'}`} style={{width: `${session.progressPercent}%`}}></div>
                                        </div>
                                        <span className={`text-[9px] font-extrabold min-w-[22px] text-right ${isLocked ? 'text-slate-600' : 'text-slate-500'}`}>{session.progressPercent}%</span>
                                    </div>
                                </div>
                                <div className="shrink-0 pl-1">
                                    {isLocked ? (
                                        <LockIcon size={14} className="text-slate-700" />
                                    ) : (
                                        session.isCompleted ? (
                                            <CheckCircleIcon size={18} className="text-emerald-400 fill-emerald-500/10" />
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-500 group-hover:text-brand-yellow transition-colors">chevron_right</span>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};
