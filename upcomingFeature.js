// upcomingFeature.js
window.ESB_Features = window.ESB_Features || {};

window.ESB_Features.UpcomingReviews = ({ srsData, dueCardsCount }) => {
    const { useMemo, useState } = React;
    const [popupContent, setPopupContent] = useState(null);

    // ฟังก์ชันตรวจสอบสถิติการเรียน (ต้องมีข้อมูลอย่างน้อย 7 วัน)
    const handleViewMonthClick = () => {
        const history = JSON.parse(localStorage.getItem('esb_review_history') || '{}');
        const daysLearned = Object.keys(history).length;

        if (daysLearned >= 7) {
            setPopupContent({
                title: "Monthly View Unlocked 🗓️",
                desc: `ยอดเยี่ยมมากคุณเมฆ! คุณเรียนมาแล้ว ${daysLearned} วัน สถิติของคุณพร้อมสำหรับมุมมองรายเดือนแล้ว (ฟีเจอร์ตัวเต็มจะมาในอัปเดตถัดไป)`,
                btnText: "รับทราบ"
            });
        } else {
            setPopupContent({
                title: "Feature Locked 🔒",
                desc: `ขณะนี้คุณมีข้อมูลสถิติเพียง ${daysLearned} วัน กรุณาเรียนต่อเนื่องให้ครบ 7 วันเพื่อเปิดใช้งานระบบวิเคราะห์รายเดือน`,
                btnText: "ตกลง"
            });
        }
    };

    // คำนวณจำนวนการ์ดที่จะต้องทบทวนล่วงหน้า
    const upcomingDays = useMemo(() => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // วันนี้
        days.push({
            label: 'Today',
            date: today.getDate(),
            count: dueCardsCount,
            isToday: true
        });

        // ล่วงหน้าอีก 4 วัน
        for (let i = 1; i <= 4; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            
            const startOfDay = nextDate.getTime();
            const endOfDay = startOfDay + (24 * 60 * 60 * 1000) - 1;
            
            let count = 0;
            Object.values(srsData).forEach(card => {
                if (card.nextReview >= startOfDay && card.nextReview <= endOfDay) {
                    count++;
                }
            });

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.push({
                label: dayNames[nextDate.getDay()],
                date: nextDate.getDate(),
                count: count,
                isToday: false
            });
        }
        return days;
    }, [srsData, dueCardsCount]);

    return (
        <div className="relative">
            <div className="flex justify-between items-end mb-3 mt-4">
                <h3 className="text-sm font-bold text-white text-[13px] tracking-wide">Upcoming Reviews</h3>
                <button 
                    onClick={handleViewMonthClick} 
                    className="text-xs font-semibold text-brand-yellow hover:text-yellow-400 transition-colors"
                >
                    View Month
                </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {upcomingDays.map((day, idx) => (
                    <div key={idx} className={`rounded-xl p-3 min-w-[75px] text-center transition-all ${day.isToday ? 'bg-navy-800 border-2 border-brand-yellow shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'bg-navy-800 border border-navy-700 opacity-80'}`}>
                        <div className={`text-[10px] font-bold uppercase ${day.isToday ? 'text-brand-yellow' : 'text-slate-500'}`}>{day.label}</div>
                        <div className="text-xl font-bold text-white my-1">{day.date}</div>
                        {day.isToday ? (
                            <div className="flex justify-center gap-1">
                                <span className="w-1 h-1 bg-brand-yellow rounded-full"></span>
                                <span className="w-1 h-1 bg-brand-yellow rounded-full"></span>
                            </div>
                        ) : (
                            <div className="text-[9px] text-slate-500">{day.count} cards</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Custom Theme Pop-up */}
            {popupContent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy-900/90 backdrop-blur-sm animate-fade-in" onClick={() => setPopupContent(null)}>
                    <div className="bg-navy-800 border border-brand-yellow/30 p-8 rounded-3xl shadow-glow-yellow max-w-sm w-full text-center relative" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-yellow/20">
                            <span className="text-2xl">{popupContent.title.includes('Locked') ? '🔒' : '🗓️'}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{popupContent.title}</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            {popupContent.desc}
                        </p>
                        <button 
                            onClick={() => setPopupContent(null)}
                            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-navy-900 font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-yellow-500/20"
                        >
                            {popupContent.btnText}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
