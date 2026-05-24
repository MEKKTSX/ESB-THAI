// ==========================================
// 📖 STORY LISTENING FEATURE (Premium Story Listening Room)
// ==========================================
window.ESB_Features = window.ESB_Features || {};

window.ESB_Features.StoryListeningView = ({ onClose, settings }) => {
    const { useState, useEffect, useRef } = React;
    const { XIcon, Volume2Icon, CheckCircleIcon } = window.Icons || {};

    const [activeStory, setActiveStory] = useState(null); // 'bird', 'tea', 'bookstore'
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
    const [playbackSpeed, setPlaybackSpeed] = useState(settings?.speed || 1.0);
    const [showTranslations, setShowTranslations] = useState(true);

    const utteranceRef = useRef(null);

    // เรื่องสั้นคลังนิทาน (Short Stories Bank)
    const STORIES = {
        bird: {
            title: "The Brave Little Bird",
            desc: "ความกล้าหาญของลูกนกตัวน้อยผู้กลัวการบิน",
            icon: "🐦",
            level: "Easy",
            levelColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            sentences: [
                {
                    en: "Once upon a time, a little bird named Pippin lived in a tall oak tree.",
                    th: "กาลครั้งหนึ่ง ลูกนกตัวน้อยชื่อพิกพินอาศัยอยู่บนต้นโอ๊กสูงใหญ่"
                },
                {
                    en: "Pippin had small wings, so he was very afraid of flying.",
                    th: "พิกพินมีปีกเล็กๆ ดังนั้นเขาจึงกลัวการบินเป็นอย่างมาก"
                },
                {
                    en: "One sunny morning, his friends flew away to find delicious food.",
                    th: "เช้าวันแดดจ้าวันหนึ่ง เพื่อนๆ ของเขาบินออกไปหาอาหารแสนอร่อย"
                },
                {
                    en: "Pippin stayed behind in his nest and felt very lonely.",
                    th: "พิกพินอยู่ข้างหลังในรังของเขาและรู้สึกเหงามาก"
                },
                {
                    en: "Suddenly, a strong wind shook the tree, and his nest began to slide.",
                    th: "ทันใดนั้น ลมแรงพัดสั่นสะเทือนต้นไม้ และรังของเขาก็เริ่มลื่นไถลลงมา"
                },
                {
                    en: "Pippin knew he had to be brave to save himself.",
                    th: "พิกพินรู้ว่าเขาต้องกล้าหาญเพื่อช่วยชีวิตตนเอง"
                },
                {
                    en: "He closed his eyes, spread his wings, and jumped out of the nest.",
                    th: "เขาหลับตา สยายปีกออก และกระโดดลงมาจากรัง"
                },
                {
                    en: "He flapped his wings as hard as he could.",
                    th: "เขาขยับปีกอย่างสุดกำลังเท่าที่จะทำได้"
                },
                {
                    en: "To his surprise, he was flying elegantly!",
                    th: "น่าประหลาดใจเป็นอย่างยิ่ง เขาบินได้อย่างสง่างาม!"
                },
                {
                    en: "He smiled happily and joined his friends in the blue sky.",
                    th: "เขายิ้มอย่างมีความสุขและบินไปสมทบกับเพื่อนๆ บนท้องฟ้าสีคราม"
                }
            ]
        },
        tea: {
            title: "A Perfect Cup of Tea",
            desc: "การปรุงแต่งชาแก้วโปรดเพื่อสลายความเหนื่อยล้า",
            icon: "☕",
            level: "Medium",
            levelColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            sentences: [
                {
                    en: "Yesterday afternoon, Sarah decided to make a hot cup of English tea.",
                    th: "เมื่อบ่ายวานนี้ ซาร่าห์ตัดสินใจชงชาอังกฤษร้อนๆ สักถ้วย"
                },
                {
                    en: "She boiled fresh water in a beautiful silver kettle.",
                    th: "เธอต้มน้ำสะอาดในกาน้ำสีเงินใบงาม"
                },
                {
                    en: "While waiting, she chose her favorite white ceramic mug.",
                    th: "ในระหว่างที่รอ เธอเลือกแก้วมัคเซรามิกสีขาวใบโปรดของเธอ"
                },
                {
                    en: "She placed a tea bag inside and gently poured the boiling water.",
                    th: "เธอวางถุงชาไว้ด้านในแล้วเทน้ำเดือดลงไปอย่างระมัดระวัง"
                },
                {
                    en: "She waited for exactly four minutes to let the tea steep perfectly.",
                    th: "เธอรอเป็นเวลาสี่นาทีพอดีเพื่อให้ชาแช่ตัวสกัดรสชาติได้อย่างสมบูรณ์แบบ"
                },
                {
                    en: "Next, she added a splash of cold milk and a small spoon of organic honey.",
                    th: "ต่อมา เธอเติมนมเย็นเล็กน้อยและน้ำผึ้งออร์แกนิกช้อนเล็กๆ"
                },
                {
                    en: "She stirred it gently and took a slow, warm sip.",
                    th: "เธอคนช้าๆ และจิบน้ำชาอุ่นๆ อย่างเชื่องช้า"
                },
                {
                    en: "The warm tea was absolutely perfect and delicious.",
                    th: "น้ำชาอุ่นแก้วนั้นสมบูรณ์แบบและอร่อยเป็นที่สุด"
                },
                {
                    en: "It made her feel relaxed and happy after a long day of hard study.",
                    th: "มันทำให้เธอรู้สึกผ่อนคลายและมีความสุขหลังจากวันแห่งการเรียนหนักมาทั้งวัน"
                }
            ]
        },
        bookstore: {
            title: "The Quiet Bookstore",
            desc: "หลบหลีกความวุ่นวายในร้านหนังสือสงบใจกลางเมือง",
            icon: "📚",
            level: "Hard",
            levelColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            sentences: [
                {
                    en: "In the heart of Bangkok, there is a tiny, quiet bookstore hidden in a narrow street.",
                    th: "ณ ใจกลางกรุงเทพมหานคร มีร้านหนังสือเล็กๆ เงียบสงบซ่อนอยู่ในซอกซอยแคบๆ"
                },
                {
                    en: "The owner, an old man with thin glasses, welcomes everyone with a gentle smile.",
                    th: "เจ้าของร้านซึ่งเป็นชายชราสวมแว่นตาบางๆ คอยต้อนรับทุกคนด้วยรอยยิ้มอันอ่อนโยน"
                },
                {
                    en: "Inside the shop, the dark wooden shelves are covered with hundreds of old books.",
                    th: "ภายในร้าน ชั้นวางไม้สีเข้มคลาคล่ำไปด้วยหนังสือเก่าแก่หลายร้อยเล่ม"
                },
                {
                    en: "The air smells like sweet old paper, wood dust, and soft tea.",
                    th: "อากาศอบอวลไปด้วยกลิ่นกระดาษเก่าอันหอมหวาน ฝุ่นไม้ และน้ำชาอ่อนๆ"
                },
                {
                    en: "Today, a young college student entered the shop to escape the hot afternoon sun.",
                    th: "วันนี้ นักเรียนสาวระดับวิทยาลัยคนหนึ่งเดินเข้าร้านเพื่อหลบแดดบ่ายอันร้อนระอุ"
                },
                {
                    en: "She sat on a very cozy blue armchair near the window.",
                    th: "เธอนั่งลงบนเก้าอี้โซฟาเท้าแขนสีน้ำเงินแสนสบายริมหน้าต่าง"
                },
                {
                    en: "She opened a mysterious adventure book and slowly started to read.",
                    th: "เธอเปิดหนังสือผจญภัยอันลึกลับเล่มหนึ่งและค่อยๆ เริ่มเปิดอ่านช้าๆ"
                },
                {
                    en: "For two peaceful hours, she forgot all about the noisy city outside.",
                    th: "ตลอดสองชั่วโมงอันแสนสงบใจ เธอละทิ้งความจำเกี่ยวกับเมืองใหญ่อันเสียงดังวุ่นวายภายนอกไปจนหมดสิ้น"
                }
            ]
        }
    };

    // ควบคุมระบบการเล่นเสียงออกทีละประโยค (Premium Story Reading Engine)
    const playSentence = (index) => {
        if (!activeStory || index < 0 || index >= STORIES[activeStory].sentences.length) {
            setIsPlaying(false);
            setActiveSentenceIdx(-1);
            return;
        }

        setActiveSentenceIdx(index);
        setIsPlaying(true);

        const text = STORIES[activeStory].sentences[index].en;

        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = playbackSpeed;

        // ค้นหาเสียงพรีเมียมเสมือนมนุษย์ (จัดอันดับเน้นเสียงผู้ชายตามความพึงพอใจการเรียนรู้)
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
            const enVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith('en'));
            
            let selectedVoice = null;
            
            // 1. ค้นหาเสียงผู้ชายคุณภาพสูงก่อน
            const maleKeywords = ['david', 'daniel', 'male', 'guy', 'aaron', 'ryan', 'gordon', 'stefan', 'iom'];
            selectedVoice = enVoices.find(v => {
                const nameLower = v.name.toLowerCase();
                return maleKeywords.some(keyword => nameLower.includes(keyword));
            });
            
            // 2. ถ้าไม่พบ ให้ลองหาเสียงที่ระบุ Premium หรือ Natural
            if (!selectedVoice) {
                selectedVoice = enVoices.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('natural'));
            }
            
            // 3. ถ้าไม่พบ ให้ลองหาเสียงของ Google
            if (!selectedVoice) {
                selectedVoice = enVoices.find(v => v.name.toLowerCase().includes('google'));
            }
            
            // 4. ถ้าไม่มีจริง ๆ ลองหาเสียง Apple หรือ Samantha
            if (!selectedVoice) {
                selectedVoice = enVoices.find(v => v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('apple'));
            }
            
            // 5. Fallback
            if (!selectedVoice && enVoices.length > 0) {
                selectedVoice = enVoices[0];
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        // เมื่ออ่านจบประโยคนี้ ให้เล่นประโยคถัดไปโดยอัตโนมัติ
        utterance.onend = () => {
            if (isPlaying) {
                const nextIndex = index + 1;
                if (nextIndex < STORIES[activeStory].sentences.length) {
                    playSentence(nextIndex);
                } else {
                    setIsPlaying(false);
                    setActiveSentenceIdx(-1);
                }
            }
        };

        utterance.onerror = () => {
            setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            const targetIdx = activeSentenceIdx === -1 ? 0 : activeSentenceIdx;
            playSentence(targetIdx);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setActiveSentenceIdx(-1);
    };

    // ล้างเสียงพูดเมื่อปิดห้องฟัง
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // ปรับเปลี่ยนความเร็วเสียงพูดแบบเรียลไทม์
    useEffect(() => {
        if (isPlaying && activeSentenceIdx !== -1) {
            playSentence(activeSentenceIdx);
        }
    }, [playbackSpeed]);

    return (
        <div className="fixed inset-0 z-[120] bg-gradient-to-br from-[#080B11] via-[#0E131F] to-[#17132B] flex flex-col h-full w-full overflow-hidden text-slate-200 animate-fade-in">
            
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between z-10 bg-[#080B11]/85 backdrop-blur-xl border-b border-white/[0.05] shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:scale-105 active:scale-95 transition-all">
                    {XIcon ? <XIcon size={20} /> : '✕'}
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">English Listening Room</span>
                    <span className="text-xs font-bold text-slate-200 mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                        {activeStory ? STORIES[activeStory].title : "Story Room"}
                    </span>
                </div>
                <div className="w-8"></div>
            </div>

            {/* Scenario Selection View */}
            {!activeStory ? (
                <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 mx-auto flex items-center justify-center text-3xl shadow-lg">
                            🎧
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Listening Practice Room</h2>
                        <p className="text-xs text-slate-500">ฝึกฟังนิทานและเรื่องเล่าสั้นๆ ปรับความเร็วและจิ้มออกเสียงโต้ตอบเพื่อประสิทธิภาพสูงสุด</p>
                    </div>

                    <div className="space-y-4 pt-4">
                        {Object.entries(STORIES).map(([key, value]) => (
                            <div 
                                key={key}
                                onClick={() => setActiveStory(key)}
                                className="backdrop-blur-md bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-white/[0.04] p-5 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300 group active:scale-[0.98] shadow-lg"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#04060A]/80 border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    {value.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-extrabold text-white group-hover:text-purple-400 transition-colors">{value.title}</h4>
                                        <span className={`border text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${value.levelColor}`}>
                                            {value.level}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">{value.desc}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-purple-400 transition-colors">chevron_right</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Player & Interactive Transcript View */
                <div className="flex-1 flex flex-col overflow-hidden w-full relative">
                    
                    {/* Upper Interactive Transcript Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6" style={{ scrollbarWidth: 'none' }}>
                        
                        <div className="max-w-md mx-auto space-y-5">
                            {STORIES[activeStory].sentences.map((sent, index) => {
                                const isCurrent = activeSentenceIdx === index;
                                return (
                                    <div 
                                        key={index}
                                        onClick={() => playSentence(index)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 relative border ${
                                            isCurrent 
                                                ? 'bg-purple-500/[0.05] border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                                                : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.06]'
                                        }`}
                                    >
                                        {/* Glowing line indicator */}
                                        {isCurrent && (
                                            <div className="absolute top-0 bottom-0 left-0 w-1 bg-purple-500 rounded-l-2xl"></div>
                                        )}

                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <p className={`text-[13px] md:text-sm font-semibold leading-relaxed transition-colors ${
                                                    isCurrent ? 'text-purple-400 font-extrabold' : 'text-slate-100'
                                                }`}>
                                                    {sent.en}
                                                </p>
                                                {showTranslations && (
                                                    <p className="text-[11px] md:text-xs text-slate-400 font-medium leading-relaxed">
                                                        {sent.th}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); playSentence(index); }}
                                                className={`p-1.5 rounded-full shrink-0 transition-colors ${
                                                    isCurrent 
                                                        ? 'bg-purple-500/10 text-purple-400' 
                                                        : 'bg-[#04060A] text-slate-600 hover:text-slate-300'
                                                }`}
                                            >
                                                {Volume2Icon ? <Volume2Icon size={14} /> : '🔊'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Media Controller Dashboard */}
                    <div className="p-6 bg-navy-950/80 border-t border-white/[0.05] backdrop-blur-xl shrink-0 z-20">
                        <div className="max-w-md mx-auto flex flex-col space-y-4">
                            
                            {/* Title & translation toggling */}
                            <div className="flex justify-between items-center px-1">
                                <div>
                                    <h4 className="text-sm font-black text-white leading-none">{STORIES[activeStory].title}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Level: {STORIES[activeStory].level}</p>
                                </div>
                                <button 
                                    onClick={() => setShowTranslations(prev => !prev)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        showTranslations 
                                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                                            : 'bg-white/5 border-white/10 text-slate-500'
                                    }`}
                                >
                                    {showTranslations ? "Hide Translation" : "Show Translation"}
                                </button>
                            </div>

                            {/* Media progress indicator */}
                            <div className="w-full h-1 bg-[#04060A] rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300 rounded-full"
                                    style={{ 
                                        width: `${
                                            activeSentenceIdx === -1 
                                                ? 0 
                                                : ((activeSentenceIdx + 1) / STORIES[activeStory].sentences.length) * 100
                                        }%` 
                                    }}
                                ></div>
                            </div>

                            {/* Playback Settings & Media Control Buttons */}
                            <div className="flex justify-between items-center py-1">
                                
                                {/* Speed Controller buttons */}
                                <div className="flex bg-[#04060A]/80 border border-white/5 rounded-xl p-0.5">
                                    {[0.75, 1.0, 1.25].map((sp) => (
                                        <button 
                                            key={sp}
                                            onClick={() => setPlaybackSpeed(sp)}
                                            className={`px-2.5 py-1.5 text-[9px] font-black rounded-lg transition-all ${
                                                playbackSpeed === sp 
                                                    ? 'bg-purple-600 text-white shadow-md' 
                                                    : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            {sp.toFixed(2)}x
                                        </button>
                                    ))}
                                </div>

                                {/* Main Player keys */}
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={handleStop}
                                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors active:scale-90"
                                        title="Stop Playback"
                                    >
                                        <span className="material-symbols-outlined text-lg">stop</span>
                                    </button>
                                    
                                    <button 
                                        onClick={handlePlayPause}
                                        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-transform"
                                        title={isPlaying ? "Pause" : "Play Story"}
                                    >
                                        <span className="material-symbols-outlined text-2xl font-black">
                                            {isPlaying ? 'pause' : 'play_arrow'}
                                        </span>
                                    </button>
                                </div>

                                {/* Select another story Button */}
                                <button 
                                    onClick={() => { handleStop(); setActiveStory(null); }}
                                    className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 active:scale-95 transition-all"
                                >
                                    Stories List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
