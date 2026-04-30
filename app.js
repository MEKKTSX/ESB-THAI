// ==========================================
// 🤖 FLOATING AI CHATBOT (V4 - Bulletproof Stable Model)
// ==========================================
const FloatingAIChat = () => {
    const { useState, useRef, useEffect } = React;
    const { XIcon } = window.Icons || {};
    
    const BACKEND_URL = "/api/chat"; 

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'มีประโยคไหนในแอปที่สงสัย พิมพ์ถามผมได้เลยครับ! 😊' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const chatHeadRef = useRef(null);
    const dragInfo = useRef({
        isDragging: false,
        currentX: window.innerWidth - 80,
        currentY: window.innerHeight - 150,
        startX: 0, startY: 0,
        isMoved: false
    });

    useEffect(() => {
        if (chatHeadRef.current) {
            chatHeadRef.current.style.left = `${dragInfo.current.currentX}px`;
            chatHeadRef.current.style.top = `${dragInfo.current.currentY}px`;
        }
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handlePointerDown = (e) => {
        dragInfo.current.isDragging = true;
        dragInfo.current.isMoved = false;
        dragInfo.current.startX = (e.clientX || e.touches?.[0].clientX) - dragInfo.current.currentX;
        dragInfo.current.startY = (e.clientY || e.touches?.[0].clientY) - dragInfo.current.currentY;
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!dragInfo.current.isDragging) return;
        
        const x = (e.clientX || e.touches?.[0].clientX) - dragInfo.current.startX;
        const y = (e.clientY || e.touches?.[0].clientY) - dragInfo.current.startY;
        
        if (Math.abs(x - dragInfo.current.currentX) > 3 || Math.abs(y - dragInfo.current.currentY) > 3) {
            dragInfo.current.isMoved = true;
        }

        const clampedX = Math.max(10, Math.min(x, window.innerWidth - 70));
        const clampedY = Math.max(10, Math.min(y, window.innerHeight - 70));

        dragInfo.current.currentX = clampedX;
        dragInfo.current.currentY = clampedY;

        requestAnimationFrame(() => {
            if (chatHeadRef.current) {
                chatHeadRef.current.style.left = `${clampedX}px`;
                chatHeadRef.current.style.top = `${clampedY}px`;
            }
        });
    };

    const handlePointerUp = (e) => {
        if (!dragInfo.current.isDragging) return;
        dragInfo.current.isDragging = false;
        e.target.releasePointerCapture(e.pointerId);

        if (!dragInfo.current.isMoved) {
            setIsOpen(true);
            setTimeout(() => { setIsOpen(true); }, 50);
        }
    };
    
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const systemPrompt = `คุณคือผู้ช่วยอัจฉริยะประจำแอป "ESB Thai" (English Sentence Bank) ข้อมูลแอปเบื้องต้น:
            - แอปนี้ใช้ฝึกภาษาอังกฤษด้วยระบบ SRS
            - โหมด Study: ใช้เปิดดูประโยคใหม่ๆ พร้อมคำแปล
            - โหมด Review: ใช้ทดสอบความจำ
            - โหมด Typing: ใช้ฝึกพิมพ์ประโยคคำถาม-คำตอบ
            กฎ: ตอบคำถามเกี่ยวกับภาษาอังกฤษ แกรมม่า คำแปล ได้อย่างถูกต้อง สั้นๆ กระชับ เป็นมิตร ห้ามใช้ Markdown`;
            
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, systemPrompt: systemPrompt })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Error: ${data.error}` }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: `⚠️ เชื่อมต่อไม่ได้: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onPointerDown={() => setIsOpen(false)}></div>
                    <div className="relative w-full max-w-[340px] h-[480px] max-h-[80vh] bg-[#0B1121]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-scale-in">
                        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-navy-900/80">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🤖</span>
                                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">English Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                {XIcon ? <XIcon size={20}/> : '✕'}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-brand-yellow text-navy-900 font-bold rounded-tr-sm' : 'bg-navy-800 text-slate-200 border border-white/5 rounded-tl-sm'}`}>
                                {msg.text}
                                </div>
                            </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="bg-navy-800 text-slate-500 p-3 rounded-2xl rounded-tl-sm text-xs">AI กำลังคิด...</div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-navy-900/80">
                            <div className="flex bg-[#0B1121] border border-white/10 rounded-2xl overflow-hidden focus-within:border-brand-yellow/50 transition-all">
                                <input 
                                    type="text" 
                                    value={input} 
                                    onChange={(e) => setInput(e.target.value)} 
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="พิมพ์คำถามที่นี่..." 
                                    className="flex-1 bg-transparent text-white text-sm px-4 py-3.5 outline-none"
                                />
                                <button onClick={handleSendMessage} className="px-5 text-brand-yellow font-bold text-sm active:bg-white/5">ส่ง</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div 
                ref={chatHeadRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`fixed z-[999] w-14 h-14 rounded-full bg-navy-800 border-2 border-brand-yellow shadow-[0_0_20px_rgba(250,204,21,0.3)] flex items-center justify-center text-2xl cursor-grab active:cursor-grabbing touch-none select-none ${isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'} transition-all duration-300`}
                style={{ position: 'fixed' }}
            >
                🤖
            </div>
        </>
    );
};

// ==========================================
// 🌟 PREMIUM DASHBOARD COMPONENT 
// ==========================================
const PremiumDashboardView = ({ currentStreak, masteredCount, sessionProgressData, currentActiveSession, setCurrentTab }) => {
    return (
        <div className="px-6 pt-12 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center border border-slate-700">
                        <span className="material-symbols-outlined text-blue-500">school</span>
                    </div>
                    <div>
                        <h1 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ESB Thai</h1>
                        <p className="text-lg font-bold mt-0.5">Dashboard</p>
                    </div>
                </div>
                <div className="p-2 rounded-full hover:bg-slate-800">
                    <span className="material-symbols-outlined text-slate-300">notifications</span>
                </div>
            </header>

            <div>
                <h2 className="text-3xl font-light text-white mb-1">Good Evening,</h2>
                <h2 className="text-3xl font-bold text-white">Learner.</h2>
            </div>

            <section className="grid grid-cols-2 gap-4">
                <div className="bg-[#161e2d] p-5 rounded-2xl border border-slate-800/80">
                    <div className="flex justify-between items-start mb-2">
                        <span className="material-symbols-outlined text-blue-500">local_fire_department</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{currentStreak} <span className="text-sm font-normal text-slate-400">days</span></p>
                    <p className="text-xs text-slate-500 mt-1">Keep it up!</p>
                </div>
                <div className="bg-[#161e2d] p-5 rounded-2xl border border-slate-800/80">
                    <div className="flex justify-between items-start mb-2">
                        <span className="material-symbols-outlined text-amber-400">workspace_premium</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mastered</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{masteredCount} <span className="text-sm font-normal text-slate-400">words</span></p>
                    <p className="text-xs text-slate-500 mt-1">Long-term memory</p>
                </div>
            </section>

            {currentActiveSession && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Current Session</h3>
                        <button className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">View All</button>
                    </div>
                    <div className="relative w-full rounded-3xl overflow-hidden border border-amber-400/20 bg-[#141b28] shadow-[0_0_20px_rgba(251,191,36,0.05)] p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4 border ${currentActiveSession.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'}`}>
                                    {currentActiveSession.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                                </span>
                                <h4 className="text-2xl font-bold text-white mb-2">{currentActiveSession.title}</h4>
                                <p className="text-sm text-slate-400 font-light">Continue your learning journey.</p>
                            </div>
                            <div onClick={() => setCurrentTab('study')} className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0 cursor-pointer hover:bg-amber-400/20">
                                <span className="material-symbols-outlined text-2xl">play_arrow</span>
                            </div>
                        </div>
                        <div className="mt-8">
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 tracking-widest uppercase">
                                <span>{currentActiveSession.learnedCards} / {currentActiveSession.totalCards} CARDS</span>
                                <span className="text-amber-400">{currentActiveSession.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-1000" style={{width: `${currentActiveSession.progressPercent}%`}}></div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="pb-8">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Learning Path</h3>
                <div className="space-y-4">
                    {sessionProgressData.map((session, idx) => {
                        const isLocked = !session.isUnlocked;
                        const iconList = ['book', 'business_center', 'flight', 'restaurant', 'computer'];
                        
                        return (
                            <div key={idx} onClick={() => { if (!isLocked) setCurrentTab('study'); }} className={`bg-[#161e2d] border ${isLocked ? 'border-slate-800/50 opacity-60' : 'border-slate-700/80 hover:border-amber-400/30 cursor-pointer'} p-5 rounded-2xl flex items-center gap-4 transition-all group`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLocked ? 'bg-[#1a2333] text-slate-600' : 'bg-[#1a2333] text-slate-300 group-hover:text-amber-400'}`}>
                                    <span className="material-symbols-outlined">{iconList[idx % 5] || 'book'}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-semibold text-base ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>{session.title}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex-1 bg-slate-800/80 rounded-full h-1 overflow-hidden">
                                            <div className={`h-1 rounded-full ${isLocked ? 'bg-slate-600' : 'bg-slate-400'}`} style={{width: `${session.progressPercent}%`}}></div>
                                        </div>
                                        <span className={`text-[10px] font-bold ${isLocked ? 'text-slate-600' : 'text-slate-500'}`}>{session.progressPercent}%</span>
                                    </div>
                                </div>
                                <span className={`material-symbols-outlined ${isLocked ? 'text-slate-700' : 'text-slate-500 group-hover:text-amber-400'}`}>
                                    {isLocked ? 'lock' : 'chevron_right'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

// ==========================================
// 🚀 MAIN APP
// ==========================================
const App = () => {
    const { useState, useEffect, useMemo } = React;
    
    const SessionData = window.ESB_Sessions || [];
    const getTodayKey = () => { 
        const d = new Date(); 
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; 
    };
    
    const [srsData, setSrsData] = useState(() => { try { return JSON.parse(localStorage.getItem('esb_srs_data')) || {}; } catch(e) { return {}; } });
    
    const [appSettings, setAppSettings] = useState(() => { 
        try { 
            const saved = JSON.parse(localStorage.getItem('esb_app_settings'));
            if (saved) return saved;
            return { cardFront: 'th', speed: 1.0, pool: SessionData.map(s => s.id), autoPlay: true, loop: false }; 
        } catch(e) { 
            return { cardFront: 'th', speed: 1.0, pool: SessionData.map(s => s.id), autoPlay: true, loop: false }; 
        } 
    });

    // 🌟 🌟 🌟 ระบบ Auto-sync Pool: เติม Session ใหม่ให้อัตโนมัติ ป้องกันปัญหาการ์ดหาย 🌟 🌟 🌟
    useEffect(() => {
        setAppSettings(prev => {
            const currentPool = prev.pool || [];
            const allSessionIds = SessionData.map(s => s.id);
            const missingIds = allSessionIds.filter(id => !currentPool.includes(id));
            
            if (missingIds.length > 0) {
                return { ...prev, pool: [...currentPool, ...missingIds] };
            }
            return prev;
        });
    }, [SessionData]);
    // ---------------------------------------------------------

    const [bookmarks, setBookmarks] = useState(() => { try { return JSON.parse(localStorage.getItem('esb_bookmarks')) || []; } catch(e) { return []; } });
    const [reviewHistory, setReviewHistory] = useState(() => { try { return JSON.parse(localStorage.getItem('esb_review_history')) || {}; } catch(e) { return {}; } });

    const [dailyProgress, setDailyProgress] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('esb_daily_progress'));
            if (saved && saved.date === getTodayKey()) return saved;
            return { date: getTodayKey(), reviewedCards: {} };
        } catch(e) { return { date: getTodayKey(), reviewedCards: {} }; }
    });

    const [timeSpent, setTimeSpent] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('esb_time_spent'));
            if (saved && saved.date === getTodayKey()) return saved;
            return { date: getTodayKey(), seconds: 0 };
        } catch(e) { return { date: getTodayKey(), seconds: 0 }; }
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeSpent(prev => {
                const newData = { date: getTodayKey(), seconds: prev.seconds + 1 };
                localStorage.setItem('esb_time_spent', JSON.stringify(newData));
                return newData;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => { localStorage.setItem('esb_app_settings', JSON.stringify(appSettings)); }, [appSettings]);
    useEffect(() => { localStorage.setItem('esb_srs_data', JSON.stringify(srsData)); }, [srsData]);
    useEffect(() => { localStorage.setItem('esb_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
    useEffect(() => { localStorage.setItem('esb_review_history', JSON.stringify(reviewHistory)); }, [reviewHistory]);
    useEffect(() => { localStorage.setItem('esb_daily_progress', JSON.stringify(dailyProgress)); }, [dailyProgress]);

    const [currentTab, setCurrentTab] = useState('home');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    
    const [quizQueue, setQuizQueue] = useState(null);
    const [practiceQueue, setPracticeQueue] = useState(null);
    const [typingQueue, setTypingQueue] = useState(null);
    
    const [targetSessionForStudy, setTargetSessionForStudy] = useState(0);
    const [selectedCards, setSelectedCards] = useState([]);
    
    const SESSION_GOALS = { 'session-1': 40, 'session-2': 30, 'session-3': 20 };
    
    const allSentencesFlat = useMemo(() => {
        const flat = [];
        SessionData.forEach(session => {
            if(!session.data) return;
            session.data.forEach(cat => {
                if(!cat.sentences) return;
                cat.sentences.forEach((s, idx) => { 
                    flat.push({ ...s, uniqueId: `${cat.id}-${idx}`, sessionId: session.id }); 
                });
            });
        });
        return flat;
    }, [SessionData]);

    const dueCards = useMemo(() => {
        const now = Date.now();
        return allSentencesFlat.filter(card => {
            if (!appSettings.pool.includes(card.sessionId)) return false;
            const data = srsData[card.uniqueId];
            return data && data.nextReview <= now;
        });
    }, [allSentencesFlat, srsData, appSettings.pool]);

    const currentStreak = useMemo(() => {
        let streak = 0; let checkDate = new Date(); checkDate.setHours(0,0,0,0);
        const todayStr = getTodayKey();
        if (reviewHistory[todayStr]?.total > 0) streak = 1;
        for (let i = 1; i < 365; i++) {
            let d = new Date(); d.setDate(d.getDate() - i);
            let dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if (reviewHistory[dStr]?.total > 0) streak++; else break;
        }
        return streak;
    }, [reviewHistory]);

    const memoryStats = useMemo(() => {
        let unseen = allSentencesFlat.length; let learning = 0; let mastered = 0;
        Object.values(srsData).forEach(card => { unseen--; if (card.interval >= 21) mastered++; else learning++; });
        return { total: allSentencesFlat.length, unseen, learning, mastered };
    }, [allSentencesFlat, srsData]);

    const sessionProgressData = useMemo(() => {
        let isPreviousCompleted = true;
        return SessionData.map((session, index) => {
            let totalCards = 0;
            let learnedCards = 0;
            if(session.data) {
                session.data.forEach(cat => {
                    if(cat.sentences) {
                        cat.sentences.forEach((s, idx) => {
                            totalCards++;
                            const uniqueId = `${cat.id}-${idx}`;
                            if (srsData[uniqueId]) learnedCards++;
                        });
                    }
                });
            }
            const progressPercent = totalCards === 0 ? 0 : Math.round((learnedCards / totalCards) * 100);
            const isCompleted = progressPercent >= 100;
            const isUnlocked = index === 0 || isPreviousCompleted || learnedCards > 0;
            isPreviousCompleted = isCompleted;
            return { ...session, totalCards, learnedCards, progressPercent, isCompleted, isUnlocked };
        });
    }, [SessionData, srsData]);

    const currentActiveSession = useMemo(() => {
        if (!sessionProgressData || sessionProgressData.length === 0) return null;
        const active = sessionProgressData.find(s => s.isUnlocked && !s.isCompleted);
        return active || sessionProgressData[sessionProgressData.length - 1]; 
    }, [sessionProgressData]);

    const handleExport = () => {
        try {
            const backup = { esb_srs_data: srsData, esb_app_settings: appSettings, esb_bookmarks: bookmarks, esb_review_history: reviewHistory, esb_daily_progress: dailyProgress, esb_time_spent: timeSpent, export_date: new Date().toISOString() };
            const jsonString = JSON.stringify(backup, null, 2);
            const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
            const link = document.createElement('a');
            link.href = `data:application/json;base64,${base64Data}`;
            link.download = `ESB_Backup_${getTodayKey()}.json`;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        } catch (e) { alert("Backup Failed"); }
    };

    const handleImport = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                Object.keys(data).forEach(key => { if(key.startsWith('esb_')) localStorage.setItem(key, JSON.stringify(data[key])); });
                window.location.reload();
            } catch (err) { alert("Invalid File"); }
        };
        reader.readAsText(file);
    };

    const handleResetAll = () => {
        if(window.confirm("⚠️ ยืนยัน: ล้างข้อมูลทั้งหมดรวมถึงเวลาใช้งานวันนี้ด้วยใช่ไหม? (ไม่สามารถกู้ได้)")) {
            let id = window.setTimeout(function() {}, 0);
            while (id--) { window.clearTimeout(id); }
            localStorage.clear();
            window.location.href = window.location.href.split('?')[0] + '?reset=' + Date.now();
        }
    };

    const handleSaveSRS = (uId, rating) => {
        if (!window.Utils?.calculateSRS) return;
        setSrsData(prev => ({ ...prev, [uId]: window.Utils.calculateSRS(prev[uId] || {}, rating) }));
        const dateKey = getTodayKey();
        setReviewHistory(prev => {
            const curr = prev[dateKey] || { correct: 0, total: 0 };
            return { ...prev, [dateKey]: { total: curr.total + 1, correct: curr.correct + (rating !== 'again' ? 1 : 0) } };
        });
        const card = allSentencesFlat.find(c => c.uniqueId === uId);
        if (card) {
            setDailyProgress(prev => {
                const newRev = { ...prev.reviewedCards };
                if (!newRev[card.sessionId]) newRev[card.sessionId] = [];
                if (!newRev[card.sessionId].includes(uId)) newRev[card.sessionId] = [...newRev[card.sessionId], uId];
                return { ...prev, reviewedCards: newRev };
            });
        }

        if (rating === 'again') {
            setQuizQueue(prevQueue => {
                if (prevQueue) {
                    const cardToRepeat = prevQueue.find(c => c.uniqueId === uId);
                    if (cardToRepeat) return [...prevQueue, cardToRepeat];
                }
                return prevQueue;
            });
        } else {
            setSelectedCards(prev => prev.filter(id => id !== uId));
        }
    };
    
    const renderActiveMode = () => {
        if (typingQueue && window.ESB_Features?.TypingChallengeView) return <div className="fixed inset-0 z-[100] bg-[#0B1121]"><window.ESB_Features.TypingChallengeView queue={typingQueue} onClose={() => setTypingQueue(null)} AudioService={window.ESB_Features?.AudioService} /></div>;
        if (practiceQueue && window.ESB_Features?.PracticeFlashcardView) return <div className="fixed inset-0 z-[100] bg-[#0B1121]"><window.ESB_Features.PracticeFlashcardView queue={practiceQueue} settings={appSettings} onClose={() => setPracticeQueue(null)} onOpenSettings={() => setShowSettingsModal(true)} /></div>;
        if (quizQueue && window.FlashcardQuizView) return <div className="fixed inset-0 z-[100] bg-[#0B1121]"><window.FlashcardQuizView quizQueue={quizQueue} settings={appSettings} onClose={() => setQuizQueue(null)} onSaveSRS={handleSaveSRS} onOpenSettings={() => setShowSettingsModal(true)} dailyProgress={dailyProgress} sessionGoals={SESSION_GOALS} /></div>;
        
        return (
            <div className="pb-24 relative min-h-screen">
                
                {currentTab === 'home' && (
                    <PremiumDashboardView 
                        currentStreak={currentStreak}
                        masteredCount={memoryStats.mastered}
                        sessionProgressData={sessionProgressData}
                        currentActiveSession={currentActiveSession}
                        setCurrentTab={setCurrentTab}
                    />
                )}
                
                {currentTab === 'study' && window.StudyListView && (
                    <window.StudyListView 
                        SessionData={SessionData} 
                        initialSessionIndex={targetSessionForStudy} 
                        allSentencesFlat={allSentencesFlat} 
                        onSaveSRS={handleSaveSRS} 
                        srsData={srsData} 
                        selectedCards={selectedCards} 
                        toggleCardSelection={(id)=>setSelectedCards(prev=>prev.includes(id)?prev.filter(c=>c!==id):[...prev,id])} 
                        toggleSelectAll={(ids,s)=>setSelectedCards(prev=>Array.from(new Set(s?[...prev,...ids]:prev.filter(id=>!ids.includes(id)))))} 
                        clearSelection={()=>setSelectedCards([])} 
                        bookmarks={bookmarks} 
                        toggleBookmark={(id)=>setBookmarks(prev=>prev.includes(id)?prev.filter(b=>b!==id):[...prev,id])} 
                        onOpenSettings={() => setShowSettingsModal(true)} 
                        onStartCustomReview={()=>{const now=Date.now(); const custom=allSentencesFlat.filter(c=>selectedCards.includes(c.uniqueId)&&!(srsData[c.uniqueId]?.nextReview>now)); if(custom.length>0) setQuizQueue(window.Utils.shuffleArray(custom)); else alert("Cards already reviewed today");}} 
                        onStartPracticeReview={()=>{const custom=allSentencesFlat.filter(c=>selectedCards.includes(c.uniqueId)); if(custom.length>0) setPracticeQueue(window.Utils.shuffleArray(custom));}} 
                        onStartTypingReview={()=>{
                            const custom = allSentencesFlat.filter(c => selectedCards.includes(c.uniqueId)); 
                            if(custom.length > 0) setTypingQueue(window.Utils.shuffleArray(custom));
                        }} 
                    />
                )}
                
                {currentTab === 'progress' && window.ReviewScheduleView && <window.ReviewScheduleView memoryStats={memoryStats} dueCards={dueCards} srsData={srsData} reviewHistory={reviewHistory} onOpenSettings={() => setShowSettingsModal(true)} onStartReview={(cards)=>setQuizQueue(window.Utils.shuffleArray(cards))} dailyProgress={dailyProgress} sessionGoals={SESSION_GOALS} SessionData={SessionData} />}
                
                {currentTab === 'profile' && window.ProfileView && <window.ProfileView memoryStats={memoryStats} bookmarksCount={bookmarks.length} dueCardsCount={dueCards.length} onOpenBookmarks={() => setShowBookmarkModal(true)} onExport={handleExport} onImport={handleImport} onResetAll={handleResetAll} />}
                
                {window.SharedComponents?.BottomNav && <window.SharedComponents.BottomNav activeTab={currentTab} setActiveTab={setCurrentTab} />}

                {currentTab === 'home' && (
                    <div className="fixed bottom-28 left-0 w-full px-6 flex justify-center pointer-events-none z-40">
                        <button 
                            onClick={() => {
                                if(dueCards.length > 0) setQuizQueue(window.Utils.shuffleArray(dueCards));
                            }}
                            disabled={dueCards.length === 0}
                            className={`pointer-events-auto w-full max-w-[320px] h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 border ${dueCards.length > 0 ? 'bg-blue-600 text-white border-blue-400/30 shadow-[0_8px_30px_rgba(37,99,235,0.4)]' : 'bg-[#1e293b] text-slate-500 border-slate-700 shadow-none'}`}
                        >
                            <span className="material-symbols-outlined">{dueCards.length > 0 ? 'style' : 'done_all'}</span>
                            {dueCards.length > 0 ? `Start Flashcards (${dueCards.length})` : 'All Cleared! 🎉'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0B1121] font-sans text-slate-200">
            {renderActiveMode()}
            {showSettingsModal && window.FlashcardSettingsModal && <window.FlashcardSettingsModal settings={appSettings} setSettings={setAppSettings} SessionData={SessionData} onClose={() => setShowSettingsModal(false)} />}
            {showBookmarkModal && window.ESB_Features?.BookmarkModal && <window.ESB_Features.BookmarkModal bookmarks={bookmarks} allSentencesFlat={allSentencesFlat} onToggleBookmark={(id)=>setBookmarks(prev=>prev.includes(id)?prev.filter(b=>b!==id):[...prev,id])} onClose={() => setShowBookmarkModal(false)} />}
            
            <FloatingAIChat />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => { console.log('Service Worker Registered!', reg.scope); })
            .catch(err => { console.log('Service Worker Registration Failed!', err); });
    });
            }
