// ==========================================
// 🤖 FLOATING AI CHATBOT (V4 - Bulletproof Stable Model)
// ==========================================
const FloatingAIChat = () => {
    const { useState, useRef, useEffect } = React;
    const { XIcon } = window.Icons || {};
    
    const BACKEND_URL = "/api/chat"; // Vercel จะรู้เองว่าต้องไปเรียกไฟล์ในโฟลเดอร์ api

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'มีประโยคไหนในแอปที่สงสัย พิมพ์ถามผมได้เลยครับ! 😊' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Refs สำหรับควบคุมการลากแบบ 60FPS
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

    // ----------------------------------------
    // 🖱️ ระบบลากปุ่มแบบ Ultra Smooth
    // ----------------------------------------
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
        
        // ตรวจสอบว่ามีการเคลื่อนที่จริงไหม (ป้องกันการแตะเบาๆ แล้วกลายเป็นลาก)
        if (Math.abs(x - dragInfo.current.currentX) > 3 || Math.abs(y - dragInfo.current.currentY) > 3) {
            dragInfo.current.isMoved = true;
        }

        // ดักขอบจอ
        const clampedX = Math.max(10, Math.min(x, window.innerWidth - 70));
        const clampedY = Math.max(10, Math.min(y, window.innerHeight - 70));

        dragInfo.current.currentX = clampedX;
        dragInfo.current.currentY = clampedY;

        // ใช้ requestAnimationFrame เพื่อความลื่นไหลสูงสุด
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

        // ถ้าไม่ได้ลาก ให้เปิดหน้าต่างแชท
        if (!dragInfo.current.isMoved) {
            setIsOpen(true);
            
            setTimeout(() => { 
                setIsOpen(true);
            }, 50);
        }
    };
    
        // ----------------------------------------
    // 💬 ระบบคุยกับ AI (เวอร์ชัน Vercel Backend)
    // ----------------------------------------
    const handleSendMessage = async () => {
        // ❌ ลบการเช็ค GEMINI_API_KEY ออกไป เพราะเราย้ายไปซ่อนที่ Vercel แล้ว
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            // ⭐️ 1. รวบ Prompt ให้เป็นก้อนเดียวสมบูรณ์
            const systemPrompt = `คุณคือผู้ช่วยอัจฉริยะประจำแอป "ESB Thai" (English Sentence Bank) ข้อมูลแอปเบื้องต้น:
            - แอปนี้ใช้ฝึกภาษาอังกฤษด้วยระบบ SRS (Spaced Repetition System) ยิ่งตอบถูกบ่อย การ์ดจะยิ่งทิ้งช่วงทบทวนนานขึ้น
            - โหมด Study: ใช้เปิดดูประโยคใหม่ๆ พร้อมคำแปล
            - โหมด Review: ใช้ทดสอบความจำ มี 4 ปุ่มคือ Again (เริ่มใหม่), Hard (ยาก), Good (พอได้), Easy (จำได้แม่น)
            - หน้า Home: มีปฏิทินแสดงความขยัน (Heatmap) ยิ่งทวนเยอะสียิ่งเข้ม
            
            กฎการตอบของคุณ:
            1. ตอบคำถามเกี่ยวกับภาษาอังกฤษ แกรมม่า คำแปล ได้อย่างถูกต้อง
            2. ถ้าผู้ใช้ถามวิธีใช้แอป หรือปุ่มต่างๆ ทำงานยังไง ให้อธิบายตามข้อมูลด้านบน
            3. ตอบสั้นๆ กระชับ เป็นมิตร เป็นธรรมชาติ
            4. ห้ามใช้สัญลักษณ์ Markdown (ห้ามพิมพ์ *, **, #) โดยเด็ดขาด`;
            
            // ⭐️ 2. เปลี่ยนมายิงไปที่ Vercel Backend ของเรา (BACKEND_URL = "/api/chat")
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    systemPrompt: systemPrompt
                })
            });

            const data = await response.json();
            
            // ⭐️ 3. รับคำตอบที่คลีนแล้วจาก Backend
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
            {/* กล่องแชท */}
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

            {/* ปุ่ม Chat Head */}
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
    const [appSettings, setAppSettings] = useState(() => { try { return JSON.parse(localStorage.getItem('esb_app_settings')) || { cardFront: 'th', speed: 1.0, pool: SessionData.map(s => s.id), autoPlay: true, loop: false }; } catch(e) { return { cardFront: 'th', speed: 1.0, pool: SessionData.map(s => s.id), autoPlay: true, loop: false }; } });
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

    useEffect(() => { localStorage.setItem('esb_srs_data', JSON.stringify(srsData)); }, [srsData]);
    useEffect(() => { localStorage.setItem('esb_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
    useEffect(() => { localStorage.setItem('esb_review_history', JSON.stringify(reviewHistory)); }, [reviewHistory]);
    useEffect(() => { localStorage.setItem('esb_daily_progress', JSON.stringify(dailyProgress)); }, [dailyProgress]);

    const [currentTab, setCurrentTab] = useState('home');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [quizQueue, setQuizQueue] = useState(null);
    const [practiceQueue, setPracticeQueue] = useState(null);
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
        setSelectedCards(prev => prev.filter(id => id !== uId));
    };

    const renderActiveMode = () => {
        if (practiceQueue) return <div className="fixed inset-0 z-[100] bg-[#0B1121]">{window.ESB_Features?.PracticeFlashcardView && <window.ESB_Features.PracticeFlashcardView queue={practiceQueue} settings={appSettings} onClose={() => setPracticeQueue(null)} onOpenSettings={() => setShowSettingsModal(true)} />}</div>;
        if (quizQueue) return <div className="fixed inset-0 z-[100] bg-[#0B1121]">{window.FlashcardQuizView && <window.FlashcardQuizView quizQueue={quizQueue} settings={appSettings} onClose={() => setQuizQueue(null)} onSaveSRS={handleSaveSRS} onOpenSettings={() => setShowSettingsModal(true)} dailyProgress={dailyProgress} sessionGoals={SESSION_GOALS} />}</div>;
        
        return (
            <div className="pb-24">
                {currentTab === 'home' && window.DashboardView && <window.DashboardView SessionData={SessionData} srsData={srsData} timeSpent={timeSpent.seconds} currentStreak={currentStreak} dueCardsCount={dueCards.length} onNavigateToSession={(i) => { setTargetSessionForStudy(i); setCurrentTab('study'); }} onNavigateTab={setCurrentTab} />}
                {currentTab === 'study' && window.StudyListView && <window.StudyListView SessionData={SessionData} initialSessionIndex={targetSessionForStudy} allSentencesFlat={allSentencesFlat} onSaveSRS={handleSaveSRS} srsData={srsData} selectedCards={selectedCards} toggleCardSelection={(id)=>setSelectedCards(prev=>prev.includes(id)?prev.filter(c=>c!==id):[...prev,id])} toggleSelectAll={(ids,s)=>setSelectedCards(prev=>Array.from(new Set(s?[...prev,...ids]:prev.filter(id=>!ids.includes(id)))))} onStartCustomReview={()=>{const now=Date.now(); const custom=allSentencesFlat.filter(c=>selectedCards.includes(c.uniqueId)&&!(srsData[c.uniqueId]?.nextReview>now)); if(custom.length>0) setQuizQueue(window.Utils.shuffleArray(custom)); else alert("Cards already reviewed today");}} bookmarks={bookmarks} toggleBookmark={(id)=>setBookmarks(prev=>prev.includes(id)?prev.filter(b=>b!==id):[...prev,id])} clearSelection={()=>setSelectedCards([])} onStartPracticeReview={()=>{const custom=allSentencesFlat.filter(c=>selectedCards.includes(c.uniqueId)); if(custom.length>0) setPracticeQueue(window.Utils.shuffleArray(custom));}} onOpenSettings={() => setShowSettingsModal(true)} />}
                {currentTab === 'progress' && window.ReviewScheduleView && <window.ReviewScheduleView memoryStats={memoryStats} dueCards={dueCards} srsData={srsData} reviewHistory={reviewHistory} onOpenSettings={() => setShowSettingsModal(true)} onStartReview={(cards)=>setQuizQueue(window.Utils.shuffleArray(cards))} dailyProgress={dailyProgress} sessionGoals={SESSION_GOALS} SessionData={SessionData} />}
                {currentTab === 'profile' && window.ProfileView && <window.ProfileView memoryStats={memoryStats} bookmarksCount={bookmarks.length} dueCardsCount={dueCards.length} onOpenBookmarks={() => setShowBookmarkModal(true)} onExport={handleExport} onImport={handleImport} onResetAll={handleResetAll} />}
                {window.SharedComponents?.BottomNav && <window.SharedComponents.BottomNav activeTab={currentTab} setActiveTab={setCurrentTab} />}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0B1121] font-sans text-slate-200">
            {renderActiveMode()}
            {showSettingsModal && window.FlashcardSettingsModal && <window.FlashcardSettingsModal settings={appSettings} setSettings={setAppSettings} SessionData={SessionData} onClose={() => setShowSettingsModal(false)} />}
            {showBookmarkModal && window.ESB_Features?.BookmarkModal && <window.ESB_Features.BookmarkModal bookmarks={bookmarks} allSentencesFlat={allSentencesFlat} onToggleBookmark={(id)=>setBookmarks(prev=>prev.includes(id)?prev.filter(b=>b!==id):[...prev,id])} onClose={() => setShowBookmarkModal(false)} />}
            
            {/* 🤖 ปุ่มแชทบอทลอยอยู่บนสุด */}
            <FloatingAIChat />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// --- รัน Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => { console.log('Service Worker Registered!', reg.scope); })
            .catch(err => { console.log('Service Worker Registration Failed!', err); });
    });
}
