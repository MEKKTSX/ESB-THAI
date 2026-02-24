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

    // ⭐️ ฟังก์ชันพิฆาต: หยุดเวลาทุกอย่างในเว็บก่อนสั่งลบข้อมูล
    const handleResetAll = () => {
        if(window.confirm("⚠️ ยืนยัน: ล้างข้อมูลทั้งหมดรวมถึงเวลาใช้งานวันนี้ด้วยใช่ไหม? (ไม่สามารถกู้ได้)")) {
            // 1. แฮ็กระบบเพื่อหยุด setInterval ของเวลาที่กำลังวิ่งอยู่ทันที
            let id = window.setTimeout(function() {}, 0);
            while (id--) { window.clearTimeout(id); }
            
            // 2. ล้างข้อมูลทุกอย่างใน LocalStorage แบบถอนรากถอนโคน
            localStorage.clear();
            
            // 3. บังคับโหลดหน้าใหม่และทำลายแคชเก่าทิ้ง
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
                {currentTab === 'progress' && window.ReviewScheduleView && <window.ReviewScheduleView memoryStats={memoryStats} dueCards={dueCards} srsData={srsData} reviewHistory={reviewHistory} onOpenSettings={() => setShowSettingsModal(true)} onStartReview={(cards)=>setQuizQueue(window.Utils.shuffleArray(cards.slice(0,40)))} dailyProgress={dailyProgress} sessionGoals={SESSION_GOALS} SessionData={SessionData} />}
                
                {/* ⭐️ ส่ง onResetAll ไปให้หน้า Profile ด้วย */}
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
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
