window.ESB_Features = window.ESB_Features || {};

// 📝 ข้อมูลจำลองการอัปเดตแอป
const SYSTEM_ANNOUNCEMENTS = [
    { id: 1, title: "🚀 Update: Luxury UI", desc: "เปลี่ยนดีไซน์หน้า Dashboard และแถบสถานะให้สวยหรูพรีเมียมขึ้น", date: "24 Feb 2026", isNew: true },
    { id: 2, title: "✨ Update: Flashcard Random", desc: "โหมด Flashcard สามารถสุ่มการ์ดไม่ให้ซ้ำกันได้แล้ว!", date: "24 Feb 2026", isNew: true },
    { id: 3, title: "🧠 Feature: Smart SRS", desc: "แยกโหมด Study Selected กับ Flashcard เพื่อป้องกันการทำลายระบบความจำ", date: "24 Feb 2026", isNew: false }
];

const NotificationService = {
    requestPermission: async () => {
        if (!("Notification" in window)) {
            alert("อุปกรณ์หรือบราวเซอร์นี้ไม่รองรับการแจ้งเตือนลงระบบครับ");
            return false;
        }
        const permission = await Notification.requestPermission();
        return permission === "granted";
    },
    checkPermission: () => {
        if (!("Notification" in window)) return false;
        return Notification.permission === "granted";
    },
    notifyUser: (title, body) => {
        if (Notification.permission === "granted" && navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, { body, icon: 'icon.png' });
            });
        } else if (Notification.permission === "granted") {
            new Notification(title, { body, icon: 'icon.png' });
        }
    }
};

// 1. ปุ่มเปิด/ปิด แจ้งเตือนมือถือ
window.ESB_Features.NotificationToggle = ({ dueCount }) => {
    const { useState, useEffect } = React; // ⭐️ ย้ายมาไว้ข้างในฟังก์ชัน!
    
    const [isGranted, setIsGranted] = useState(NotificationService.checkPermission());
    const { BellIcon } = window.Icons || {};

    const handleToggle = async () => {
        if (!isGranted) {
            const granted = await NotificationService.requestPermission();
            setIsGranted(granted);
            if (granted) {
                NotificationService.notifyUser("✅ เปิดแจ้งเตือนสำเร็จ!", "แอปจะคอยเตือนให้คุณมาทบทวนประโยค 3 เวลา (เช้า เที่ยง เย็น) ครับ");
            } else {
                alert("คุณปฏิเสธการแจ้งเตือน (หากต้องการเปิด ต้องไปแก้ในการตั้งค่าบราวเซอร์ครับ)");
            }
        } else {
            alert("✅ ระบบแจ้งเตือนมือถือเปิดอยู่แล้วครับ (หากต้องการปิด ต้องปิดจากตั้งค่าเครื่อง/บราวเซอร์)");
        }
    };

    useEffect(() => {
        if (!isGranted || dueCount === 0) return;
        const checkTime = () => {
            const now = new Date();
            if ((now.getHours() === 8 || now.getHours() === 13 || now.getHours() === 20) && now.getMinutes() === 0) {
                NotificationService.notifyUser("⏰ ถึงเวลาทบทวนแล้ว!", `คุณมี ${dueCount} ประโยคที่รอทบทวนอยู่ เข้ามาเคลียร์กันเลย!`);
            }
        };
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [isGranted, dueCount]);

    return (
        <button onClick={handleToggle} className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-700 border border-navy-700 text-white py-4 rounded-xl font-bold transition-colors text-sm shadow-lg">
            {BellIcon && <BellIcon size={18} className={isGranted ? "text-brand-yellow" : "text-slate-400"} />}
            {isGranted ? 'แจ้งเตือนระบบ: ทำงาน 🔔' : 'เปิดแจ้งเตือนมือถือ (Push)'}
        </button>
    );
};

// 2. Popup แจ้งเตือนในแอป
window.ESB_Features.NotificationPopup = ({ isOpen, onClose, dueCount }) => {
    if (!isOpen) return null;
    const { XIcon, CheckCircleIcon, PlayIcon } = window.Icons || {};

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-5 animate-fade-in">
            <div className="absolute inset-0 bg-[#0B1121]/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-gradient-to-b from-navy-800 to-navy-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden flex flex-col max-h-[70vh]">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0B1121]/50">
                    <h3 className="text-xl font-bold text-white">Notifications</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-navy-800 rounded-full active:scale-90 transition-transform">{XIcon && <XIcon size={20}/>}</button>
                </div>
                <div className="p-5 overflow-y-auto space-y-6" style={{scrollbarWidth: 'none'}}>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Daily Tasks</h4>
                        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-brand-yellow/30 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow shrink-0">
                                {dueCount > 0 ? (PlayIcon && <PlayIcon size={20} className="fill-brand-yellow"/>) : (CheckCircleIcon && <CheckCircleIcon size={24}/>)}
                            </div>
                            <div>
                                <h5 className="font-bold text-white text-base">SRS Reviews</h5>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    {dueCount > 0 ? <><span className="text-brand-yellow font-bold">{dueCount}</span> การ์ด รอทบทวนวันนี้</> : 'เคลียร์ครบหมดแล้ว ยอดเยี่ยม! 🎉'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Updates</h4>
                        <div className="space-y-3">
                            {SYSTEM_ANNOUNCEMENTS.map(ann => (
                                <div key={ann.id} className="bg-[#0B1121]/50 border border-white/5 rounded-2xl p-4 shadow-inner">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-slate-200 text-sm">{ann.title}</h5>
                                        {ann.isNew && <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/20 tracking-widest">NEW</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{ann.desc}</p>
                                    <span className="text-[10px] text-slate-500 font-medium">{ann.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
