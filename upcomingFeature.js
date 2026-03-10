// upcomingFeature.js
window.ESB_Features = window.ESB_Features || {};

// ⭐️ เปลี่ยนมารับค่า srsData และ dueCardsCount แทน reviewHistory
window.MonthlyCalendarModal = ({ srsData = {}, dueCardsCount = 0, onClose }) => {
    const { useState, useMemo } = React;
    const [viewDate, setViewDate] = useState(new Date());
    
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('en-US', { month: 'short' }); 
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // ⭐️ คำนวณพยากรณ์การ์ดในอนาคต (Forecast) จาก srsData
    const futureDueMap = useMemo(() => {
        const map = {};
        const today = new Date();
        today.setHours(0,0,0,0);
        
        Object.values(srsData).forEach(card => {
            if (card.nextReview) {
                const reviewDate = new Date(card.nextReview);
                reviewDate.setHours(0,0,0,0);
                if (reviewDate.getTime() > today.getTime()) {
                    const key = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, '0')}-${String(reviewDate.getDate()).padStart(2, '0')}`;
                    map[key] = (map[key] || 0) + 1;
                }
            }
        });
        return map;
    }, [srsData]);

    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-[#151F32] w-full max-w-[320px] rounded-[2rem] p-6 border border-brand-yellow/30 shadow-[0_0_40px_rgba(250,204,21,0.15)] relative" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full border border-white/10 bg-[#1E293B] flex items-center justify-center text-xl shadow-inner">🗓️</div>
                </div>

                <div className="flex justify-between items-center mb-6 mt-2">
                    <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-brand-yellow transition-colors font-bold text-lg">&lt;</button>
                    <h3 className="text-lg font-bold text-white tracking-widest uppercase">{monthName} <span className="text-brand-yellow">{year}</span></h3>
                    <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-brand-yellow transition-colors font-bold text-lg">&gt;</button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3 border-b border-white/5 pb-2">
                    {weekDays.map((d, i) => <div key={i} className="text-[10px] font-bold text-slate-500 text-center">{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2 mb-6">
                    {blanks.map((_, i) => <div key={`blank-${i}`} className="aspect-square"></div>)}
                    {days.map(day => {
                        const cellDate = new Date(year, month, day);
                        cellDate.setHours(0,0,0,0);
                        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        
                        let count = 0;
                        let isPast = cellDate.getTime() < today.getTime();
                        let isToday = cellDate.getTime() === today.getTime();

                        // ⭐️ ดึงยอดการ์ดที่ค้างอยู่ (Due)
                        if (isToday) {
                            count = dueCardsCount; // วันนี้เอายอดจริงๆ มาโชว์
                        } else if (!isPast) {
                            count = futureDueMap[dateKey] || 0; // อนาคตเอายอดพยากรณ์มาโชว์
                        }

                        // จัดสีให้ดูง่าย
                        let styleClass = "bg-[#0B1121] text-slate-600 border border-white/5";
                        if (isPast) {
                            styleClass = "bg-transparent text-slate-700 opacity-50"; // วันในอดีต (จางลง)
                        } else if (isToday) {
                            styleClass = "bg-navy-800 text-white border-2 border-brand-yellow shadow-[0_0_10px_rgba(250,204,21,0.2)]"; // วันนี้ (กรอบเหลือง)
                        } else if (count > 0) {
                            styleClass = "bg-navy-800 border border-navy-600 text-slate-300"; // วันที่มีการ์ดรอทวน
                        }

                        return (
                            <div key={day} className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${styleClass}`}>
                                <span className={`text-[12px] font-semibold leading-none ${isToday ? 'text-brand-yellow' : ''}`}>{day}</span>
                                {/* โชว์ตัวเลขการ์ด (เฉพาะวันนี้และอนาคต) */}
                                {!isPast && (
                                    <span className={`text-[8px] mt-0.5 leading-none tracking-tighter ${count > 0 ? (isToday ? 'text-brand-yellow' : 'text-slate-400') : 'text-slate-600'}`}>
                                        {count > 0 ? count : '-'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button onClick={onClose} className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-[#0B1121] py-4 rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(250,204,21,0.3)] active:scale-95 transition-all">
                    รับทราบ
                </button>
            </div>
        </div>
    );
};

window.ESB_Features.UpcomingReviews = ({ srsData, dueCardsCount }) => {
    const { useMemo, useState } = React;
    const [showCalendar, setShowCalendar] = useState(false);

    const handleViewMonthClick = () => {
        setShowCalendar(true);
    };

    const upcomingDays = useMemo(() => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        days.push({
            label: 'Today',
            date: today.getDate(),
            count: dueCardsCount,
            isToday: true
        });

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

            {/* ⭐️ ส่ง srsData และ dueCardsCount ไปให้ปฏิทิน */}
            {showCalendar && (
                <window.MonthlyCalendarModal 
                    srsData={srsData} 
                    dueCardsCount={dueCardsCount} 
                    onClose={() => setShowCalendar(false)} 
                />
            )}
        </div>
    );
};
