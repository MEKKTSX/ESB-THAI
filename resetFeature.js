// ไฟล์: features/resetFeature.js

const ResetDataButton = () => {
    const handleReset = () => {
        // ใช้หน้าต่าง Confirm เพื่อกันการเผลอกดโดน
        const confirmed = window.confirm(
            "⚠️ คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการ 'รีเซ็ตข้อมูลทั้งหมด'?\n\nข้อมูลความจำและสถิติ SRS ทั้งหมดจะหายไปและเริ่มต้นใหม่จากศูนย์ (ไม่สามารถกู้คืนได้เว้นแต่คุณจะ Export สำรองไว้ก่อนหน้านี้)"
        );

        if (confirmed) {
            // ลบข้อมูลใน LocalStorage ทิ้ง
            localStorage.removeItem('esb_srs_data');
            localStorage.removeItem('esb_app_settings');
            localStorage.removeItem('esb_bookmarks');
            localStorage.removeItem('esb_review_history');
            
            // ⭐️ ต้องเพิ่มบรรทัดนี้ ยอด Daily Goal ถึงจะกลายเป็น 0/40
            localStorage.removeItem('esb_daily_progress');
            localStorage.removeItem('esb_time_spent')
            alert("ล้างข้อมูลเรียบร้อยแล้ว ระบบจะทำการรีเฟรชเพื่อเริ่มต้นใหม่");
            // รีเฟรชหน้าเว็บเพื่อให้แอปดึง State ว่างเปล่ามาใช้
            window.location.reload();
        }
    };

    return (
        <button 
            onClick={handleReset} 
            className="flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-lg font-medium text-sm transition-colors border border-rose-100"
            title="ลบข้อมูลการเรียนรู้ทั้งหมด"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            เริ่มใหม่ (Reset All)
        </button>
    );
};

// 💡 เสียบฟีเจอร์นี้เข้ากับตัวแปร Global ที่เรารอรับไว้ใน index.html
window.ESB_Features = window.ESB_Features || {};
window.ESB_Features.ResetButton = ResetDataButton;


