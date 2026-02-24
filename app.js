const App = () => {
    const { useState, useEffect, useMemo } = React;
    
    const SessionData = window.ESB_Sessions || [];
    
    const getTodayKey = () => { 
        const d = new Date(); 
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; 
    };
    
    // --- State Management ---
    const [srsData, setSrsData] = useState(() => { try { return JSON.parse(localStorage.getItem('esb_srs_data')) || {}; } catch(e) { return {}; } });
    const [appSettings, setAppSettings] = useState(() => { try { return JSON.parse(localStorage.getItem('esb_app_settings')) || { cardFront: 'th', speed: 1.0, pool: SessionData.map(s => s.id), autoPlay: true, loop: false }; } catch(e) { return { cardFront: 'th', speed: 1.0, pool: SessionData.map(s => s.id), autoPlay: true, loop: false }; } });
    const [bookmarks, setBookmarks] = useState(() => { try { return JSON.parse(localStorage.getItem('esb_bookmarks')) || []; } catch(e) { return []; } });
    const [reviewHistory, setReviewHistory] = useState(() => { try { return JSON.parse(localStorage.getItem('esb_review_history')) || {}; } catch(e) { return {}; } });

    const [dailyProgress, setDailyProgress] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('esb_daily_progress'));
            if (saved && saved.date === getTodayKey() && saved.reviewedCards) return saved;
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

    // --- Effects (Auto Save) ---
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
    useEffect(() => { localStorage.setItem('esb_app_settings', JSON.stringify(appSettings)); }, [appSettings]);
    useEffect(() => { localStorage.setItem('esb_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
    useEffect(() => { localStorage.setItem('esb_review_history', JSON.stringify(reviewHistory)); }, [reviewHistory]);
    useEffect(() => { localStorage.setItem('esb_daily_progress', JSON.stringify(dailyProgress)); }, [dailyProgress]);

    // --- UI State ---
    const [currentTab, setCurrentTab] = useState('home');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [quizQueue, setQuizQueue] = useState(null);
    const [practiceQueue, setPracticeQueue] = useState(null);
    const [targetSessionForStudy, setTargetSessionForStudy] = useState(0);
    const [selectedCards, setSelectedCards] = useState([]);
    
    const SESSION_GOALS = { 'session-1': 40, 'session-2': 30, 'session-3': 20 };
    
    // --- Logic & Memos ---
    const currentStreak = useMemo(() => {
        let streak = 0;
        let checkDate = new Date();
        checkDate.setHours(0,0,0,0);
        const todayStr = getTodayKey();
        if (reviewHistory[todayStr] && reviewHistory[todayStr].total > 0) streak = 1;
        for (let i = 1; i < 365; i++) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            let dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if (reviewHistory[dStr] && reviewHistory[dStr].total > 0) {
                if (streak === 0 && i === 1) streak = 1; else if (streak > 0) streak++;
            } else { break; }
        }
        return streak;
    }, [reviewHistory]);

    const allSentencesFlat = useMemo(() => {
        const flat = []; let globalIndex = 0;
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

    const memoryStats = useMemo(() => {
        let unseen = allSentencesFlat.length; let learning = 0; let mastered = 0;
        Object.values(srsData).forEach(card => { unseen--; if (card.interval >= 21) mastered++; else learning++; });
        return { total: allSentencesFlat.length, unseen, learning, mastered };
    }, [allSentencesFlat, srsData]);

    // --- Handlers ---
    const handleSaveSRS = (uniqueId, rating) => {
        if (!window.Utils?.calculateSRS) return;
        setSrsData(prev => ({ ...prev, [uniqueId]: window.Utils.calculateSRS(prev[uniqueId] || {}, rating) }));
        const dateKey = getTodayKey();
        setReviewHistory(prev => {
            const currentDay = prev[dateKey] || { correct: 0, total: 0 };
            return { ...prev, [dateKey]: { total: currentDay.total + 1, correct: currentDay.correct + (rating !== 'again' ? 1 : 0) } };
        });
        const cardInfo = allSentencesFlat.find(c => c.uniqueId === uniqueId);
        if (cardInfo) {
            setDailyProgress(prev => {
                const newReviewed = { ...prev.reviewedCards };
                if (!newReviewed[cardInfo.sessionId]) newReviewed[cardInfo.sessionId] = [];
                if (!newReviewed[cardInfo.sessionId].includes(uniqueId)) newReviewed[cardInfo.sessionId] = [...newReviewed[cardInfo.sessionId], uniqueId];
                return { ...prev, reviewedCards: newReviewed };
            });
        }
        setSelectedCards(prev => prev.filter(id => id !== uniqueId));
    };
    
    const handleExport = () => {
        try {
            const backup = {
                esb_srs_data: srsData,
                esb_app_settings: appSettings,
                esb_bookmarks: bookmarks,
                esb_review_history: reviewHistory,
                esb_daily_progress: dailyProgress,
                esb_time_spent: timeSpent,
                export_date: new Date().toISOString()
            };

            const jsonString = JSON.stringify(backup, null, 2);
            
            // ใช้เทคนิค Base64 แทน Blob เพื่อความเสถียรบนมือถือ
            const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
            const dataUrl = `data:application/json;base64,${base64Data}`;
            
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `ESB_Backup_${getTodayKey()}.json`;
            
            // ต้องเพิ่ม Link เข้าไปใน DOM ก่อนสั่งคลิก (สำคัญมากสำหรับ iOS/Android)
            document.body.appendChild(link);
            link.click();
            
            // รอแป๊บนึงค่อยลบออก
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
            
        } catch (err) {
            alert("❌ เกิดข้อผิดพลาดในการ Backup: " + err.message);
        }
    };


    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.esb_srs_data) localStorage.setItem('esb_srs_data', JSON.stringify(data.esb_srs_data));
                if (data.esb_app_settings) localStorage.setItem('esb_app_settings', JSON.stringify(data.esb_app_settings));
                if (data.esb_bookmarks) localStorage.setItem('esb_bookmarks', JSON.stringify(data.esb_bookmarks));
                if (data.esb_review_history) localStorage.setItem('esb_review_history', JSON.stringify(data.esb_review_history));
                if (data.esb_daily_progress) localStorage.setItem('esb_daily_progress', JSON.stringify(data.esb_daily_progress));
                if (data.esb_time_spent) localStorage.setItem('esb_time_spent', JSON.stringify(data.esb_time_spent));
                alert("✅ นำเข้าข้อมูลสำเร็จ! กำลังรีโหลดแอป...");
                window.location.reload();
            } catch (err) { alert("❌ ไฟล์ไม่ถูกต้อง"); }
        };
        reader.readAsText(file);
    };

    const startQuiz = (cards) => { if (cards?.length > 0) setQuizQueue(window.Utils.shuffleArray(cards.slice(0, 40))); };
    const startCustomQuiz = () => { 
        const now = Date.now();
        const custom = allSentencesFlat.filter(c => selectedCards.includes(c.uniqueId) && !(srsData[c.uniqueId]?.nextReview > now));
        if (custom.length > 0) setQuizQueue(window.Utils.shuffleArray(custom));
        else alert("⚠️ การ์ดที่เลือกทำไปหมดแล้วในวันนี้ครับ");
    };
    const startPracticeReview = () => { 
        const custom = allSentencesFlat.filter(c => selectedCards.includes(c.uniqueId)); 
        if (custom.length > 0) setPracticeQueue(window.Utils.shuffleArray(custom)); 
    };

    const renderActiveMode = () => {
        if (practiceQueue) return <div className="fixed inset-0 z-[100] bg-[#0B1121]">{window.ESB_Features?.PracticeFlashcardView && <window.ESB_Features.PracticeFlashcardView queue={practiceQueue} settings={appSettings} onClose={() => setPracticeQueue(null)} onOpenSettings={() => setShowSettingsModal(true)} />}</div>;
        if (quizQueue) return <div className="fixed inset-0 z-[100] bg-[#0B1121]">{window.FlashcardQuizView && <window.FlashcardQuizView quizQueue={quizQueue} settings={appSettings} onClose={() => setQuizQueue(null)} onSaveSRS={handleSaveSRS} onOpenSettings={() => setShowSettingsModal(true)} dailyProgress={dailyProgress} sessionGoals={SESSION_GOALS} />}</div>;
        
        return (
            <div className="pb-24">
                {currentTab === 'home' && window.DashboardView && <window.DashboardView SessionData={SessionData} srsData={srsData} timeSpent={timeSpent.seconds} currentStreak={currentStreak} dueCardsCount={dueCards.length} onNavigateToSession={(i) => { setTargetSessionForStudy(i); setCurrentTab('study'); }} onNavigateTab={setCurrentTab} />}
                {currentTab === 'study' && window.StudyListView && <window.StudyListView SessionData={SessionData} initialSessionIndex={targetSessionForStudy} allSentencesFlat={allSentencesFlat} onSaveSRS={handleSaveSRS} srsData={srsData} selectedCards={selectedCards} toggleCardSelection={(id)=>setSelectedCards(prev=>prev.includes(id)?prev.filter(c=>c!==id):[...prev,id])} toggleSelectAll={(ids,s)=>setSelectedCards(prev=>Array.from(new Set(s?[...prev,...ids]:prev.filter(id=>!ids.includes(id)))))} onStartCustomReview={startCustomQuiz} bookmarks={bookmarks} toggleBookmark={(id)=>setBookmarks(prev=>prev.includes(id)?prev.filter(b=>b!==id):[...prev,id])} clearSelection={()=>setSelectedCards([])} onStartPracticeReview={startPracticeReview} onOpenSettings={() => setShowSettingsModal(true)} />}
                {currentTab === 'progress' && window.ReviewScheduleView && <window.ReviewScheduleView memoryStats={memoryStats} dueCards={dueCards} srsData={srsData} reviewHistory={reviewHistory} onOpenSettings={() => setShowSettingsModal(true)} onStartReview={startQuiz} dailyProgress={dailyProgress} sessionGoals={SESSION_GOALS} SessionData={SessionData} />}
                {currentTab === 'profile' && window.ProfileView && <window.ProfileView memoryStats={memoryStats} bookmarksCount={bookmarks.length} dueCardsCount={dueCards.length} onOpenBookmarks={() => setShowBookmarkModal(true)} onExport={handleExport} onImport={handleImport} />}
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
