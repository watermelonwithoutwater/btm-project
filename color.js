// دالة تطبيق الثيم فور تحميل الصفحة
(function applyThemeImmediate() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
})();

// كود التحكم في الزر (يُستدعى بعد تحميل DOM)
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('darkModeToggle');
    
    // تحديث شكل الزر عند التحميل
    if (toggleBtn) {
        toggleBtn.innerText = document.body.classList.contains('dark-mode') ? "☀️" : "🌙";
        
        toggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            toggleBtn.innerText = isDark ? "☀️" : "🌙";
            
            // مزامنة الوضع مع جميع الصفحات المفتوحة
            window.dispatchEvent(new Event('storage'));
        });
    }
});

// مراقبة التغييرات في التخزين لتحديث الصفحات المفتوحة تلقائياً
window.addEventListener('storage', () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});