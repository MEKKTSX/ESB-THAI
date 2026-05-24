// ==========================================
// 🌟 SHARED UTILITIES & PREMIUM COMPONENTS
// ==========================================
window.Utils = {
    shuffleArray: (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    
    // Anki-like Supervised SRS Algorithm
    calculateSRS: (cardData, rating) => {
        let { interval = 0, ease = 2.5, step = 0 } = cardData || {};
        if (rating === 'again') { 
            step = 0; 
            interval = 0; 
            ease = Math.max(1.3, ease - 0.2); 
        } else if (rating === 'hard') { 
            if (step === 0) { 
                interval = 1; 
                step = 1; 
            } else { 
                interval = Math.max(1, Math.round(interval * 1.2)); 
                ease = Math.max(1.3, ease - 0.15); 
            } 
        } else if (rating === 'good') { 
            if (step === 0) { 
                interval = 4; 
                step = 1; 
            } else { 
                interval = Math.max(1, Math.round(interval * ease)); 
            } 
        } else if (rating === 'easy') { 
            if (step === 0) { 
                interval = 7; 
                step = 1; 
            } else { 
                ease += 0.15; 
                interval = Math.max(7, Math.round(interval * ease * 1.3)); 
            } 
        }
        const nextDate = new Date();
        if (interval > 0) {
            nextDate.setDate(nextDate.getDate() + interval);
            nextDate.setHours(4, 0, 0, 0); // รีเซ็ตการสอบทบทวนตอนตี 4 ของวันตามระบบสากลของ Anki
        } else {
            nextDate.setMinutes(nextDate.getMinutes() + 10); // ถ้า Again จะกลับมาในอีก 10 นาที (ตามมาตรฐาน Anki)
        }
        return { interval, ease, step, nextReview: nextDate.getTime() };
    },

    // แบ่งคำประโยคอัจฉริยะ (Smart Sentence Chunking)
    smartChunk: (text) => {
        const words = text.split(' '); 
        const chunks = []; 
        let current = [];
        const breakWords = new Set(['and', 'but', 'or', 'so', 'because', 'to', 'for', 'with', 'in', 'on', 'at', 'about', 'which', 'that', 'who', 'when', 'where', 'while']);
        
        words.forEach((word) => {
            const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
            if (breakWords.has(cleanWord) && current.length > 0) { 
                chunks.push(current.join(' ')); 
                current = [word]; 
            } else { 
                current.push(word); 
                if (word.match(/[.,!?:]$/)) { 
                    chunks.push(current.join(' ')); 
                    current = []; 
                } 
            }
        });
        if (current.length > 0) chunks.push(current.join(' '));
        return chunks.filter(c => c.trim().length > 0);
    },

    // ป้องกันคลื่นเสียงชนกันพร้อมค้นหาเสียงพรีเมียมเสมือนมนุษย์ (Premium Hybrid Speech Engine)
    speak: (text, lang = 'en-US', speed = 1.0, onEnd = null) => {
        try {
            // โหลดและดึงค่าเสียงจากการตั้งค่า LocalStorage
            let savedSettings = null;
            try {
                savedSettings = JSON.parse(localStorage.getItem('esb_app_settings'));
            } catch(e) {}
            
            const useCloud = savedSettings && savedSettings.voiceEngine === 'cloud' && navigator.onLine && window.puter;
            
            if (useCloud) {
                // เคลียร์เสียง Cloud เก่าที่เล่นอยู่
                if (window._currentCloudAudio) {
                    window._currentCloudAudio.pause();
                    window._currentCloudAudio = null;
                }
                if (window._cloudFallbackTimeout) {
                    clearTimeout(window._cloudFallbackTimeout);
                    window._cloudFallbackTimeout = null;
                }
                
                // สั่งตัดเสียงออฟไลน์ทันทีด้วย
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }

                // เลือกผู้ให้บริการและเสียงพูดคุณภาพตามหลักภาษา
                // สำหรับอังกฤษใช้ OpenAI Onyx (เสียงผู้ชายสมจริง) ส่วนภาษาอื่น (ไทย) ใช้ Gemini
                const isEnglish = lang.toLowerCase().startsWith('en');
                const provider = isEnglish ? "openai" : "gemini";
                const voice = isEnglish ? "onyx" : "Puck";
                
                let didFallback = false;
                
                // สร้างระบบป้องกันความล่าช้า (Timeout Fallback): หากคลาวด์ใช้เวลาโหลดเกิน 2.5 วินาที จะตัดเข้าออฟไลน์ทันที
                window._cloudFallbackTimeout = setTimeout(() => {
                    didFallback = true;
                    console.warn("AI Cloud Voice timed out (2.5s), falling back to offline native speech.");
                    window.Utils.speakNative(text, lang, speed, onEnd);
                }, 2500);

                window.puter.ai.txt2speech(text, {
                    provider: provider,
                    voice: voice
                }).then((audio) => {
                    if (didFallback) return; // หากข้ามไปเล่นออฟไลน์แล้ว ไม่ต้องรันซ้ำ
                    
                    if (window._cloudFallbackTimeout) {
                        clearTimeout(window._cloudFallbackTimeout);
                        window._cloudFallbackTimeout = null;
                    }

                    audio.playbackRate = speed;
                    window._currentCloudAudio = audio;
                    
                    audio.onended = () => {
                        if (window._currentCloudAudio === audio) {
                            window._currentCloudAudio = null;
                        }
                        if (onEnd) onEnd();
                    };
                    
                    audio.onerror = () => {
                        if (window._currentCloudAudio === audio) {
                            window._currentCloudAudio = null;
                        }
                        console.warn("Cloud playback error, falling back to native.");
                        window.Utils.speakNative(text, lang, speed, onEnd);
                    };

                    audio.play().catch(e => {
                        console.warn("Cloud playback blocked or failed, falling back to native.", e);
                        window.Utils.speakNative(text, lang, speed, onEnd);
                    });
                }).catch(err => {
                    if (didFallback) return;
                    if (window._cloudFallbackTimeout) {
                        clearTimeout(window._cloudFallbackTimeout);
                        window._cloudFallbackTimeout = null;
                    }
                    console.warn("Puter.js error, falling back to native.", err);
                    window.Utils.speakNative(text, lang, speed, onEnd);
                });
            } else {
                window.Utils.speakNative(text, lang, speed, onEnd);
            }
        } catch (e) { 
            console.warn("Speech error, falling back to native.", e); 
            window.Utils.speakNative(text, lang, speed, onEnd);
        }
    },

    // ระบบสังเคราะห์เสียงดั้งเดิมของตัวเครื่อง (Offline Native Engine)
    speakNative: (text, lang = 'en-US', speed = 1.0, onEnd = null) => {
        try {
            if (window._currentCloudAudio) {
                window._currentCloudAudio.pause();
                window._currentCloudAudio = null;
            }
            if (window._cloudFallbackTimeout) {
                clearTimeout(window._cloudFallbackTimeout);
                window._cloudFallbackTimeout = null;
            }
            
            if (!('speechSynthesis' in window)) {
                if (onEnd) onEnd();
                return;
            }
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang; 
            utterance.rate = speed;
            
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                const targetLangShort = lang.split('-')[0].toLowerCase();
                const matchedVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(targetLangShort));
                
                if (matchedVoices.length > 0) {
                    let selectedVoice = null;
                    
                    // 1. ค้นหาเสียงผู้ชายคุณภาพสูงก่อน
                    const maleKeywords = ['david', 'daniel', 'male', 'guy', 'aaron', 'ryan', 'gordon', 'stefan', 'iom'];
                    selectedVoice = matchedVoices.find(v => {
                        const nameLower = v.name.toLowerCase();
                        return maleKeywords.some(keyword => nameLower.includes(keyword));
                    });
                    
                    // 2. ถ้าไม่พบ ให้ลองหาเสียงที่ระบุ Premium หรือ Natural
                    if (!selectedVoice) {
                        selectedVoice = matchedVoices.find(v => {
                            const nameLower = v.name.toLowerCase();
                            return nameLower.includes('premium') || nameLower.includes('natural');
                        });
                    }
                    
                    // 3. ถ้าไม่พบ ลองหาเสียงของ Google
                    if (!selectedVoice) {
                        selectedVoice = matchedVoices.find(v => v.name.toLowerCase().includes('google'));
                    }
                    
                    // 4. ถ้าไม่มีจริง ๆ ให้ลองหาเสียง Samantha หรือ Apple
                    if (!selectedVoice) {
                        const popularNames = ['samantha', 'karen', 'moira', 'tessa', 'zira', 'hazel', 'apple'];
                        selectedVoice = matchedVoices.find(v => {
                            const nameLower = v.name.toLowerCase();
                            return popularNames.some(p => nameLower.includes(p));
                        });
                    }
                    
                    // 5. Fallback: เอาเสียงแรกของระบบในภาษานั้น
                    if (!selectedVoice) {
                        selectedVoice = matchedVoices[0];
                    }
                    
                    if (selectedVoice) {
                        utterance.voice = selectedVoice;
                    }
                }
            }
            
            if (onEnd) {
                utterance.onend = onEnd;
                utterance.onerror = onEnd;
            }
            
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn("Native speech error", e);
            if (onEnd) onEnd();
        }
    },

    // สั่งปิดเสียงสังเคราะห์และสตรีมมิ่งทั้งหมดในระบบทันที
    cancelSpeak: () => {
        try {
            if (window._currentCloudAudio) {
                window._currentCloudAudio.pause();
                window._currentCloudAudio = null;
            }
            if (window._cloudFallbackTimeout) {
                clearTimeout(window._cloudFallbackTimeout);
                window._cloudFallbackTimeout = null;
            }
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        } catch(e) {
            console.warn("Cancel speech error", e);
        }
    }
};

// กระตุ้นให้เบราว์เซอร์ดาวน์โหลดและแคชรายชื่อเสียงเมื่อหน้าเว็บรันครั้งแรก (แก้อาการเสียงหุ่นยนต์บนมือถือ)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
}

const IconBase = ({ children, size = 24, className = "", onClick }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} onClick={onClick}>{children}</svg>
);

window.Icons = {
    HomeIcon: (p) => <IconBase {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></IconBase>,
    BookIcon: (p) => <IconBase {...p}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></IconBase>,
    DictIcon: (p) => <IconBase {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></IconBase>,
    ChartIcon: (p) => <IconBase {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></IconBase>,
    UserIcon: (p) => <IconBase {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconBase>,
    BellIcon: (p) => <IconBase {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></IconBase>,
    FlameIcon: (p) => <IconBase {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></IconBase>,
    TargetIcon: (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></IconBase>,
    PlayIcon: (p) => <IconBase {...p}><polygon points="5 3 19 12 5 21 5 3"/></IconBase>,
    CardsIcon: (p) => <IconBase {...p}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></IconBase>,
    LockIcon: (p) => <IconBase {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>,
    ChevronLeftIcon: (p) => <IconBase {...p}><path d="m15 18-6-6 6-6"/></IconBase>,
    SettingsIcon: (p) => <IconBase {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></IconBase>,
    BookmarkIcon: (p) => <IconBase {...p}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></IconBase>,
    CheckCircleIcon: (p) => <IconBase {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconBase>,
    CircleIcon: (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/></IconBase>,
    XIcon: (p) => <IconBase {...p}><path d="M18 6 6 18"/><path d="m6 6 18 18"/></IconBase>,
    DownloadIcon: (p) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></IconBase>,
    UploadIcon: (p) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconBase>,
    Volume2Icon: (p) => <IconBase {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></IconBase>,
    SlidersIcon: (p) => <IconBase {...p}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></IconBase>
};

window.SharedComponents = {
    // 1. Navigation bar ด้านล่าง แบบแก้วคริสตัล (Glassmorphic Navigation Bar)
    BottomNav: ({ activeTab, setActiveTab }) => {
        const navItems = [
            { id: 'home', icon: window.Icons.HomeIcon, label: 'Home' },
            { id: 'study', icon: window.Icons.DictIcon, label: 'Study' },
            { id: 'progress', icon: window.Icons.ChartIcon, label: 'Review' },
            { id: 'profile', icon: window.Icons.UserIcon, label: 'Profile' }
        ];
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-navy-950/80 backdrop-blur-xl border-t border-white/5 pb-safe z-40 shadow-2xl">
                <div className="flex justify-around items-center h-16 px-4 max-w-lg mx-auto">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button 
                                key={item.id} 
                                onClick={() => setActiveTab(item.id)} 
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-all duration-300 ${isActive ? 'text-brand-yellow font-extrabold' : 'text-slate-500 hover:text-slate-400'}`}
                            >
                                <Icon size={20} className={isActive ? "fill-brand-yellow/15 text-brand-yellow drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : "text-slate-500"} />
                                <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    },

    // 2. การ์ดประโยคระดับพรีเมียม (Premium Chunked Sentence Card)
    ChunkedSentenceCard: ({ 
        sentence, 
        isActive, 
        onClick, 
        onSaveSRS, 
        langToggle, 
        isSelectionMode, 
        isSelected, 
        onToggleSelect, 
        isBookmarked, 
        onToggleBookmark, 
        isLocked,
        isCustom, // Props บ่งบอกว่าเป็นการ์ดสร้างเอง
        onDeleteCustomCard // Callback ลบการ์ดสร้างเอง
    }) => {
        const { BookmarkIcon, Volume2Icon, CheckCircleIcon, CircleIcon } = window.Icons || {};
        
        const mainText = langToggle === 'en' ? sentence.en : sentence.th;
        const chunks = window.Utils.smartChunk(sentence.en);
        
        const borderStyle = isSelected 
            ? "border-2 border-brand-yellow shadow-[0_0_20px_rgba(250,204,21,0.25)] bg-[#1e293b]/80" 
            : (isLocked 
                ? "border border-emerald-500/20 bg-emerald-500/[0.01] opacity-50" 
                : "border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08]");

        const handleCardClick = () => {
            if (isSelectionMode) { 
                onToggleSelect(); 
            } else { 
                onClick(); 
            }
        };

        const renderSelectRing = () => {
            if (isSelected) return <CheckCircleIcon size={20} className="text-brand-yellow fill-brand-yellow/10" />;
            if (isLocked) return <CheckCircleIcon size={20} className="text-emerald-500 fill-emerald-500/10" />;
            return <CircleIcon size={20} className="text-slate-600" />;
        };
        
        return (
            <div 
                onClick={handleCardClick} 
                className={`backdrop-blur-md p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden active:scale-[0.99] ${borderStyle} ${!isActive ? 'flex justify-between items-center gap-3' : ''}`}
            >
                {/* Custom Card indicator */}
                {isCustom && (
                    <div className="absolute top-0 left-0 bg-blue-600/25 border-r border-b border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-br-lg text-[8px] font-extrabold uppercase tracking-widest z-10">
                        Custom
                    </div>
                )}
                {isSelected && (
                    <div className="absolute top-0 right-0 bg-brand-yellow text-navy-900 px-3 py-0.5 rounded-bl-lg text-[8px] font-extrabold z-10 uppercase tracking-widest">
                        Selected
                    </div>
                )}

                {!isActive && (
                    <>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {isSelectionMode && renderSelectRing()}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-slate-100 leading-snug truncate pr-2">{mainText}</h3>
                                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                    {isLocked ? 'Reviewed today' : `Tap to ${isSelectionMode ? 'select' : 'reveal detail'}`}
                                </p>
                            </div>
                        </div>
                        
                        {/* Action buttons (when card collapsed) */}
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            {!isSelectionMode && (
                                <button 
                                    onClick={() => window.Utils.speak(sentence.en)}
                                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                                >
                                    {Volume2Icon ? <Volume2Icon size={16} /> : '🔊'}
                                </button>
                            )}
                            
                            {/* Delete custom card button */}
                            {isCustom && onDeleteCustomCard && (
                                <button 
                                    onClick={() => {
                                        if (window.confirm("ยืนยันการลบการ์ดคำศัพท์นี้ถาวรครับ?")) {
                                            onDeleteCustomCard();
                                        }
                                    }}
                                    className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-full transition-colors"
                                    title="Delete Card"
                                >
                                    <span className="material-symbols-outlined text-sm font-bold">delete</span>
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* Expanded Details View */}
                {isActive && (
                    <div className="animate-fade-in w-full space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                {isSelectionMode && renderSelectRing()}
                                <span className="bg-brand-yellow/10 text-brand-yellow text-[8px] font-extrabold px-2.5 py-1 rounded border border-brand-yellow/20 uppercase tracking-widest">
                                    Active
                                </span>
                            </div>
                            
                            {/* Speech and Bookmark Tools */}
                            <div className="flex gap-2.5 items-center" onClick={e => e.stopPropagation()}>
                                {isCustom && onDeleteCustomCard && (
                                    <button 
                                        onClick={() => {
                                            if (window.confirm("ยืนยันการลบการ์ดคำศัพท์นี้ถาวรครับ?")) {
                                                onDeleteCustomCard();
                                            }
                                        }}
                                        className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-full transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => onToggleBookmark()}
                                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                                >
                                    {BookmarkIcon && <BookmarkIcon size={18} className={isBookmarked ? "text-brand-yellow fill-brand-yellow" : "text-slate-500"} />}
                                </button>
                                
                                <button 
                                    onClick={() => window.Utils.speak(sentence.en)}
                                    className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform text-navy-900 font-bold"
                                >
                                    {Volume2Icon ? <Volume2Icon size={16} className="fill-navy-900" /> : '🔊'}
                                </button>
                            </div>
                        </div>

                        {/* Chunked word badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {chunks.map((chunk, i) => (
                                <span 
                                    key={i} 
                                    className="bg-navy-950/60 text-blue-100 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/[0.04] shadow-inner"
                                >
                                    {chunk}
                                </span>
                            ))}
                        </div>

                        {/* Translation */}
                        <div className="border-t border-white/[0.06] pt-3.5 space-y-1">
                            {langToggle === 'th' && (
                                <p className="text-white text-sm font-semibold">{sentence.en}</p>
                            )}
                            <p className="text-slate-300 text-sm font-semibold">{sentence.th}</p>
                        </div>

                        {/* SRS Quick Score Rating (if not locked) */}
                        {!isSelectionMode && !isLocked && (
                            <div className="flex items-center justify-between border-t border-white/[0.06] pt-3.5" onClick={e => e.stopPropagation()}>
                                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Rate Recalled</span>
                                <div className="flex gap-1.5">
                                    <button 
                                        onClick={() => { onSaveSRS(sentence.uniqueId, 'again'); onClick(); }} 
                                        className="px-2.5 py-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold active:scale-95 transition-transform"
                                    >
                                        Again
                                    </button>
                                    <button 
                                        onClick={() => { onSaveSRS(sentence.uniqueId, 'good'); onClick(); }} 
                                        className="px-2.5 py-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold active:scale-95 transition-transform"
                                    >
                                        Good
                                    </button>
                                    <button 
                                        onClick={() => { onSaveSRS(sentence.uniqueId, 'easy'); onClick(); }} 
                                        className="px-2.5 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold active:scale-95 transition-transform"
                                    >
                                        Easy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
};
