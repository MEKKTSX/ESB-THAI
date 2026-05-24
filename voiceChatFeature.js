// ==========================================
// 🎙️ AI VOICE TALK FEATURE (Realtime Interactive Speech Dialogue)
// ==========================================
window.ESB_Features = window.ESB_Features || {};

window.ESB_Features.AIVoiceTalkView = ({ onClose, settings }) => {
    const { useState, useEffect, useRef } = React;
    const { XIcon, Volume2Icon, CheckCircleIcon } = window.Icons || {};

    const [activeScenario, setActiveScenario] = useState(null); // 'cafe', 'directions', 'hobbies'
    const [chatHistory, setChatHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [recognitionSupported, setRecognitionSupported] = useState(true);
    const [showResults, setShowResults] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // รายชื่อหัวข้อบทสนทนาและโครงสร้างประโยคโต้ตอบออฟไลน์
    const SCENARIOS = {
        cafe: {
            title: "At the Star Café",
            subtitle: "ฝึกสั่งอาหารและเครื่องดื่มในร้านกาแฟ",
            icon: "☕",
            steps: [
                {
                    aiPrompt: "Welcome to Star Café! What would you like to order today?",
                    userSuggestions: [
                        "I would like a cup of hot coffee and a chocolate cake, please.",
                        "Can I have an iced green tea and a warm croissant, please?",
                        "Hello! Do you have any fresh juices?"
                    ],
                    // ตัวประมวลคำตอบของผู้เรียน
                    processReply: (userText) => {
                        const clean = userText.toLowerCase();
                        if (clean.includes("coffee") || clean.includes("cake")) {
                            return {
                                nextPrompt: "Excellent choice! A coffee and a chocolate cake. Would you like a hot coffee or an iced coffee? And what size?",
                                suggestions: ["Hot coffee, large size, please.", "Iced coffee, medium size, please."]
                            };
                        } else if (clean.includes("tea") || clean.includes("croissant")) {
                            return {
                                nextPrompt: "Great! A green tea and a croissant. Would you like the croissant warmed up?",
                                suggestions: ["Yes, please warm it up.", "No, thank you, cold is fine."]
                            };
                        } else {
                            return {
                                nextPrompt: "Yes, we have fresh orange juice and sweet apple juice! Which one do you prefer?",
                                suggestions: ["I prefer orange juice, please.", "I will take the apple juice, please."]
                            };
                        }
                    }
                },
                {
                    // Step 1 response processing
                    processReply: (userText) => {
                        const clean = userText.toLowerCase();
                        if (clean.includes("hot") || clean.includes("iced")) {
                            return {
                                nextPrompt: "Perfect! You got it. That will be six dollars total. Will that be cash or card?",
                                suggestions: ["I will pay with cash.", "Here is my credit card."]
                            };
                        } else if (clean.includes("warm") || clean.includes("yes") || clean.includes("please")) {
                            return {
                                nextPrompt: "Excellent! I will warm it up for you. That will be five dollars. Cash or credit card?",
                                suggestions: ["I will pay with cash.", "I'll pay by card, please."]
                            };
                        } else {
                            return {
                                nextPrompt: "Great choice! Fresh juice is very healthy. That will be four dollars. Cash or credit card?",
                                suggestions: ["Here is cash.", "By credit card, please."]
                            };
                        }
                    }
                },
                {
                    // Step 2 final processing
                    processReply: (userText) => {
                        return {
                            nextPrompt: "Perfect, transaction complete! You can take a seat, and I will bring it to you shortly. Enjoy your day!",
                            suggestions: [],
                            isFinal: true
                        };
                    }
                }
            ]
        },
        directions: {
            title: "Asking for Directions",
            subtitle: "ฝึกถามทางไปยังจุดหมายต่าง ๆ ในต่างแดน",
            icon: "🗺️",
            steps: [
                {
                    aiPrompt: "Excuse me, are you lost? Can I help you find something in this area?",
                    userSuggestions: [
                        "Yes, please! I am looking for the nearest subway station.",
                        "Yes, could you tell me how to get to the public library?",
                        "Oh, hi! Is there a good restaurant nearby?"
                    ],
                    processReply: (userText) => {
                        const clean = userText.toLowerCase();
                        if (clean.includes("subway") || clean.includes("station")) {
                            return {
                                nextPrompt: "Oh, the subway is very close! Walk straight for two blocks, then turn left. You will see it on your right. Is that clear?",
                                suggestions: ["Yes, I understand. Walk straight and turn left.", "Can you please repeat that?"]
                            };
                        } else if (clean.includes("library")) {
                            return {
                                nextPrompt: "The library is about a ten-minute walk from here. Walk past the bank, then turn right. Do you know where the bank is?",
                                suggestions: ["Yes, I see the bank down the street.", "No, where is the bank exactly?"]
                            };
                        } else {
                            return {
                                nextPrompt: "There is an amazing Thai restaurant just across the street! It is very delicious. Do you like spicy food?",
                                suggestions: ["Yes, I love spicy Thai food!", "No, I prefer mild food, thank you."]
                            };
                        }
                    }
                },
                {
                    processReply: (userText) => {
                        const clean = userText.toLowerCase();
                        if (clean.includes("repeat") || clean.includes("where")) {
                            return {
                                nextPrompt: "No problem! Walk straight down this road, turn left at the corner, and the station is right next to the big supermarket. You cannot miss it!",
                                suggestions: ["Thank you so much for your help!", "I got it now! Have a nice day."]
                            };
                        } else {
                            return {
                                nextPrompt: "Perfect! You are on the right track. It is very simple to find. Have a safe trip!",
                                suggestions: ["Thank you! Have a great day.", "Thanks! Appreciate your kindness."]
                            };
                        }
                    }
                },
                {
                    processReply: (userText) => {
                        return {
                            nextPrompt: "You are very welcome! Helping travelers always makes my day. Enjoy your journey!",
                            suggestions: [],
                            isFinal: true
                        };
                    }
                }
            ]
        },
        hobbies: {
            title: "Hobbies & Daily Life",
            subtitle: "แลกเปลี่ยนพูดคุยเรื่องกิจกรรมยามว่าง",
            icon: "🎾",
            steps: [
                {
                    aiPrompt: "Hello! It is so nice to meet you. What do you usually like to do in your free time?",
                    userSuggestions: [
                        "I really enjoy reading romantic books and playing tennis.",
                        "I love cooking delicious food for my family and watching movies.",
                        "I prefer traveling to new places and taking beautiful photos."
                    ],
                    processReply: (userText) => {
                        const clean = userText.toLowerCase();
                        if (clean.includes("reading") || clean.includes("books") || clean.includes("tennis")) {
                            return {
                                nextPrompt: "Wow, books and tennis! A perfect balance of mind and body. Who is your favorite writer? Or do you play tennis often?",
                                suggestions: ["My favorite writer is William Shakespeare.", "I play tennis with my friends every weekend."]
                            };
                        } else if (clean.includes("cooking") || clean.includes("movies")) {
                            return {
                                nextPrompt: "Cooking and movies sound lovely! What is your favorite dish to cook? Or what kind of movies do you enjoy?",
                                suggestions: ["I love to cook Italian pasta.", "I really enjoy watching adventure movies."]
                            };
                        } else {
                            return {
                                nextPrompt: "Traveling and photography! That is wonderful. What was the most beautiful place you visited recently?",
                                suggestions: ["I visited a beautiful mountain peak last month.", "I traveled to a quiet beach near Bangkok."]
                            };
                        }
                    }
                },
                {
                    processReply: (userText) => {
                        return {
                            nextPrompt: "That sounds absolutely wonderful! Doing things you love is key to a happy life. Keep doing it! What is your main goal for learning English?",
                            suggestions: ["I want to speak English fluently when traveling.", "I want to improve my career options."]
                        };
                    }
                },
                {
                    processReply: (userText) => {
                        return {
                            nextPrompt: "An inspiring goal! You are doing amazing. Practice makes perfect, and you are getting better every day. Good luck!",
                            suggestions: [],
                            isFinal: true
                        };
                    }
                }
            ]
        }
    };

    // เปิดใช้งาน Web Speech Recognition สำหรับพูดคุย
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setRecognitionSupported(false);
            return;
        }

        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
            setIsListening(true);
            setTranscript("");
        };

        rec.onerror = (e) => {
            console.error("Speech Recognition Error", e);
            setIsListening(false);
        };

        rec.onend = () => {
            setIsListening(false);
        };

        rec.onresult = (e) => {
            const speechToText = e.results[0][0].transcript;
            setTranscript(speechToText);
            handleSendUserMessage(speechToText);
        };

        recognitionRef.current = rec;
    }, [activeScenario, currentStep]);

    // เล่นเสียงประโยคแรกของ AI เมื่อเลือกห้อง
    useEffect(() => {
        if (activeScenario) {
            const firstPrompt = SCENARIOS[activeScenario].steps[0].aiPrompt;
            setChatHistory([
                { role: 'ai', text: firstPrompt }
            ]);
            setSuggestions(SCENARIOS[activeScenario].steps[0].userSuggestions);
            setCurrentStep(0);
            setShowResults(false);

            // พูดเสียง
            setTimeout(() => {
                if (window.Utils?.speak) {
                    window.Utils.speak(firstPrompt, 'en-US', settings?.speed || 1.0);
                }
            }, 500);
        }
    }, [activeScenario]);

    // เลื่อนลงไปข้างล่างแชทเมื่อมีข้อความใหม่
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory]);

    const startRecording = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch(err) {
                console.warn(err);
            }
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const handleSendUserMessage = (text) => {
        if (!text.trim() || isThinking) return;

        // บันทึกข้อความผู้ใช้ลงแชท
        setChatHistory(prev => [...prev, { role: 'user', text: text }]);
        setIsThinking(true);

        const currentScenarioData = SCENARIOS[activeScenario];
        const stepData = currentScenarioData.steps[currentStep];

        setTimeout(() => {
            // คำนวณหาคำตอบของ AI ถัดไป
            const result = stepData.processReply(text);
            
            setChatHistory(prev => [...prev, { role: 'ai', text: result.nextPrompt }]);
            
            if (result.isFinal) {
                setSuggestions([]);
                setShowResults(true);
            } else {
                setSuggestions(result.suggestions);
                setCurrentStep(prev => prev + 1);
            }

            setIsThinking(false);

            // AI ออกเสียงพูด
            if (window.Utils?.speak) {
                window.Utils.speak(result.nextPrompt, 'en-US', settings?.speed || 1.0);
            }
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[120] bg-gradient-to-br from-[#080B11] via-[#0E131F] to-[#17132B] flex flex-col h-full w-full overflow-hidden text-slate-200 animate-fade-in">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between z-10 bg-[#080B11]/85 backdrop-blur-xl border-b border-white/[0.05] shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:scale-105 active:scale-95 transition-all">
                    {XIcon ? <XIcon size={20} /> : '✕'}
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">AI Interactive Dialogue</span>
                    <span className="text-xs font-bold text-slate-200 mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        {activeScenario ? SCENARIOS[activeScenario].title : "AI Voice Talk"}
                    </span>
                </div>
                <div className="w-8"></div>
            </div>

            {/* Scenario Selection View */}
            {!activeScenario ? (
                <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center text-3xl shadow-lg">
                            🎙️
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">AI Voice Dialogue Lab</h2>
                        <p className="text-xs text-slate-500">เลือกสถานการณ์จำลองภาษาอังกฤษ เพื่อฝึกพูดตอบโต้เสียงกับ AI เสมือนจริง</p>
                    </div>

                    <div className="space-y-4 pt-4">
                        {Object.entries(SCENARIOS).map(([key, value]) => (
                            <div 
                                key={key}
                                onClick={() => setActiveScenario(key)}
                                className="backdrop-blur-md bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 hover:bg-white/[0.04] p-5 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300 group active:scale-[0.98] shadow-lg"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#04060A]/80 border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    {value.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors">{value.title}</h4>
                                    <p className="text-[10px] text-slate-500 mt-1">{value.subtitle}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-blue-400 transition-colors">chevron_right</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Chat Dialogue View */
                <div className="flex-1 flex flex-col overflow-hidden max-w-md mx-auto w-full relative">
                    
                    {/* Chat Messages Log */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'none' }}>
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end animate-slide-left' : 'justify-start animate-slide-right'}`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-sm font-bold shadow-inner ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 border-blue-500 text-white' 
                                            : 'bg-white/[0.04] border-white/5 text-slate-300'
                                    }`}>
                                        {msg.role === 'user' ? 'Me' : 'AI'}
                                    </div>
                                    {/* Message Text Bubble */}
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed relative ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-tr-sm shadow-md'
                                            : 'bg-white/[0.02] text-slate-200 border border-white/[0.06] rounded-tl-sm shadow-inner'
                                    }`}>
                                        <p>{msg.text}</p>
                                        
                                        {/* Speak Button (Replay for AI) */}
                                        {msg.role === 'ai' && (
                                            <button 
                                                onClick={() => window.Utils?.speak && window.Utils.speak(msg.text, 'en-US', settings?.speed || 1.0)}
                                                className="absolute -bottom-3 -right-2 p-1.5 bg-[#0F1422] hover:bg-[#151D31] text-slate-400 hover:text-white rounded-full border border-white/5 shadow-md transition-colors"
                                            >
                                                {Volume2Icon ? <Volume2Icon size={12} /> : '🔊'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* AI thinking buble */}
                        {isThinking && (
                            <div className="flex justify-start items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center text-sm font-bold animate-spin text-blue-400">
                                    ⏳
                                </div>
                                <div className="bg-white/[0.01] border border-white/5 text-slate-500 px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs animate-pulse">
                                    AI is typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Completion Screen Overlay */}
                    {showResults && (
                        <div className="absolute inset-0 bg-[#080B11]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-4 animate-bounce">
                                🏆
                            </div>
                            <h3 className="text-xl font-black text-white">Conversation Complete!</h3>
                            <p className="text-xs text-slate-500 mt-2 max-w-xs">ยอดเยี่ยมมากครับ! คุณได้โต้ตอบจำลองตามหัวข้อและฝึกสำเนียงสำเร็จแล้ว</p>
                            
                            <div className="bg-white/[0.02] border border-white/[0.05] p-4.5 rounded-2xl w-full max-w-xs mt-6 text-left space-y-3.5 shadow-inner">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fluency Checklist</h4>
                                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                                    {CheckCircleIcon ? <CheckCircleIcon size={14} className="text-emerald-400 fill-emerald-500/10" /> : '✓'}
                                    <span>ฝึกตอบโต้ครบขั้นตอนของบทสนทนา</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                                    {CheckCircleIcon ? <CheckCircleIcon size={14} className="text-emerald-400 fill-emerald-500/10" /> : '✓'}
                                    <span>ใช้ศัพท์พื้นฐานถูกต้องและเหมาะสม</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                                    {CheckCircleIcon ? <CheckCircleIcon size={14} className="text-emerald-400 fill-emerald-500/10" /> : '✓'}
                                    <span>พัฒนาการออกเสียงสูงเหมือนมนุษย์</span>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full max-w-xs mt-8">
                                <button 
                                    onClick={() => setActiveScenario(null)}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    Practice Another
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-extrabold rounded-2xl active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    Exit Lab
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Chat Controls & Voice input Bottom Panel */}
                    {!showResults && (
                        <div className="p-5 bg-navy-950/60 border-t border-white/[0.05] backdrop-blur-xl shrink-0 space-y-4">
                            
                            {/* Suggestions tap options */}
                            {suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">Suggested replies (Tap to choose):</p>
                                    <div className="flex flex-col gap-2 max-h-28 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                                        {suggestions.map((sug, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleSendUserMessage(sug)}
                                                disabled={isThinking}
                                                className="w-full text-left bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/10 text-slate-300 p-2.5 rounded-xl text-xs leading-normal transition-all active:scale-[0.99] truncate font-medium disabled:opacity-50"
                                            >
                                                {sug}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Voice input mic area */}
                            <div className="flex flex-col items-center justify-center py-2 space-y-2">
                                {recognitionSupported ? (
                                    <>
                                        <button 
                                            onMouseDown={startRecording}
                                            onMouseUp={stopRecording}
                                            onTouchStart={startRecording}
                                            onTouchEnd={stopRecording}
                                            disabled={isThinking}
                                            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all relative ${
                                                isListening 
                                                    ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-500/20 shadow-rose-500/25 animate-pulse' 
                                                    : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-blue-600/35 hover:shadow-blue-600/50'
                                            } disabled:opacity-30 disabled:pointer-events-none`}
                                            title="Hold and talk to AI"
                                        >
                                            {/* Micro ripples */}
                                            {isListening && (
                                                <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75"></div>
                                            )}
                                            <span className="material-symbols-outlined text-2xl font-black">{isListening ? 'mic' : 'mic'}</span>
                                        </button>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                            {isListening ? "Listening... Release to send" : "Hold button & speak English"}
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-center py-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        💡 Microphone Speech Recognition is not supported by your browser. Please tap suggested replies above to talk!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
