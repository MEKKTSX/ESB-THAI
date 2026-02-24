window.ESB_Features = window.ESB_Features || {};

window.ESB_Features.RetentionChart = ({ reviewHistory }) => {
    const { useMemo } = React;

    const chartData = useMemo(() => {
        const data = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayOfWeek = today.getDay(); 
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + diffToMonday);

        let totalCorrect = 0;
        let totalReviewed = 0;
        const fixedLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            
            const dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            const historyObj = reviewHistory[dateKey] || { correct: 0, total: 0 };
            
            // คำนวณเปอร์เซ็นต์ความจำของแต่ละวัน
            const retentionStr = historyObj.total > 0 ? Math.round((historyObj.correct / historyObj.total) * 100) : 0;
            
            totalCorrect += historyObj.correct;
            totalReviewed += historyObj.total;

            data.push({
                dayLabel: fixedLabels[i],
                retention: retentionStr,
                isToday: d.getTime() === today.getTime(),
                hasData: historyObj.total > 0,
                isFuture: d.getTime() > today.getTime()
            });
        }

        const avgRetention = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;
        return { data, avgRetention };
    }, [reviewHistory]);

    return (
        <div className="bg-gradient-to-b from-navy-800 to-[#10172A] p-6 rounded-[2rem] border border-white/5 shadow-xl mt-6 mb-8 relative overflow-hidden">
            {/* แสงเรืองแสงมุมขวาบน */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-end mb-8 relative z-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Retention Rate</h3>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 leading-none">{chartData.avgRetention}%</span>
            </div>
            
            {/* ⭐️ โครงสร้างกราฟใหม่ที่บังคับให้แท่งยืดขึ้นตาม % แน่นอน */}
            <div className="flex items-end justify-between h-40 gap-2 pb-2 relative z-10 border-b border-navy-700/50">
                {chartData.data.map((item, idx) => {
                    // กำหนดความสูง: ถ้ามีข้อมูลเอาตาม % จริง (ขั้นต่ำ 15%), อนาคตเป็น 0%, อดีตที่ไม่ได้เล่นเป็น 5% (ฐาน)
                    const barHeight = item.hasData ? Math.max(15, item.retention) : (item.isFuture ? 0 : 5);
                    
                    return (
                        <div key={idx} className="flex flex-col items-center justify-end h-full w-full gap-3 group">
                            {/* กรอบพื้นหลังของแท่งกราฟ */}
                            <div className="w-full max-w-[28px] bg-[#0B1121] rounded-t-lg relative flex items-end overflow-hidden shadow-inner h-full border-t border-white/5">
                                {/* ตัวเนื้อสีของแท่งกราฟ */}
                                <div 
                                    className={`w-full rounded-t-lg transition-all duration-1000 ease-out relative ${item.isToday ? 'bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : (item.hasData ? 'bg-brand-accent/80' : 'bg-navy-700/50')}`}
                                    style={{ height: `${barHeight}%` }}
                                >
                                    {item.isToday && <div className="absolute inset-0 bg-white/20 rounded-t-lg"></div>}
                                </div>
                            </div>
                            
                            {/* ตัวอักษรบอกวัน (M T W...) */}
                            <span className={`text-[11px] font-bold ${item.isToday ? 'text-brand-yellow' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                {item.dayLabel}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
