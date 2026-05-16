const API_URL = "https://watermelonwithoutwater.github.io/";
const GOOGLE_CLIENT_ID = "922073879513-h45gm9u4kk44o3tjgrg96d0jf95puedh.apps.googleusercontent.com";

// --- 1. نظام تشغيل وحقن زر جوجل الرسمي برمجياً ---
function initializeGoogleAuth() {
    const googleBtnDiv = document.getElementById('googleBtn');
    
    // التحقق من وجود العنصر في الصفحة الحالية ومكتبة جوجل محملة
    if (googleBtnDiv && typeof google === 'object' && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse
        });

        // تخصيص مظهر وحجم الزر ليناسب أبعاد الكارد تماماً
        google.accounts.id.renderButton(
            googleBtnDiv,
            { 
                theme: document.body.classList.contains('dark-mode') ? "filled_black" : "outline", 
                size: "large",
                width: googleBtnDiv.parentElement.offsetWidth,
                text: "signup_with",
                shape: "pill"
            }
        );
    } else if (googleBtnDiv) {
        // في حال تأخر تحميل مكتبة جوجل، نعيد المحاولة بعد نصف ثانية
        setTimeout(initializeGoogleAuth, 500);
    }
}

// معالجة البيانات العائدة من جوجل وتوجيه المستخدم للمتجر
function handleGoogleCredentialResponse(response) {
    try {
        const payload = parseJwt(response.credential);
        const userData = {
            username: payload.name,
            email: payload.email,
            google_id: payload.sub
        };
        
        // حفظ البيانات موحدة محلياً
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true'); // تفعيل للحارس

        // التوجيه الفوري لصفحة المتجر
        window.location.href = "store.html";
    } catch (error) {
        console.error("حدث خطأ أثناء فحص بيانات جوجل:", error);
    }
}

// دالة فك تشفير توكن جوجل (JWT)
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// --- 2. إدارة العمليات الأساسية (تسجيل / دخول التقليدي) ---
async function handleAuth(type) {
    const statusMsg = document.getElementById('statusMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const username = document.getElementById('username')?.value;

    if (!email || !password) return;

    // تغيير حالة الزر لمنع التكرار
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = type === 'register' ? "جاري إنشاء الحساب..." : "جاري الدخول...";
    }

    const endpoint = type === 'register' ? 'register' : 'login';
    const payload = type === 'register' ? { username, email, password } : { email, password };

    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (response.ok) {
            // حفظ البيانات موحدة محلياً في الـ LocalStorage
            localStorage.setItem('currentUser', JSON.stringify({
                username: result.user || username || "مستكشف BTM",
                email: email
            }));
            localStorage.setItem('isLoggedIn', 'true'); // تفعيل للحارس

            // الانتقال الفوري لصفحة المتجر
            window.location.href = "store.html";
        } else {
            if (statusMsg) {
                statusMsg.style.color = "red";
                statusMsg.innerText = result.error || "حدث خطأ في العملية";
            }
            resetSubmitButton(submitBtn, type);
        }
    } catch (e) {
        if (statusMsg) {
            statusMsg.style.color = "orange";
            statusMsg.innerText = "فشل الاتصال بالسيرفر المطور (Localhost)";
        }
        resetSubmitButton(submitBtn, type);
    }
}

function resetSubmitButton(btn, type) {
    if (btn) {
        btn.disabled = false;
        btn.innerText = type === 'register' ? "إنشــــاء الحساب" : "دخــــــــول";
    }
}

// --- 3. تهيئة بيئة العمل والمزامنة والوضع الليلي ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateToggleButton(true);
    }
}

function updateToggleButton(isDark) {
    const btn = document.getElementById('darkModeToggle');
    if (btn) btn.innerText = isDark ? "☀️" : "🌙";
}

// نظام القائمة المنسدلة للبروفايل
function toggleDropdown() {
    const menu = document.getElementById("userMenu");
    if (menu) menu.classList.toggle("show");
}

function updateUI() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');
    const nameDisplay = document.getElementById('displayUsername');
    
    // جلب زر ابدأ الآن
    const heroBtn = document.getElementById('heroBtn');

    if (user) {
        // [حالة: المستخدم مسجل دخول]
        if (nameDisplay) nameDisplay.innerText = user.username;
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        
        if (heroBtn) {
            // تحديث النص الداخلي مع الحفاظ على السهم الجمالي
            heroBtn.innerHTML = `الذهاب للمتجر <span class="arrow">←</span>`;
            
            // توجيهه برمجياً عند الضغط إلى المتجر
            heroBtn.onclick = () => {
                window.location.href = "store.html";
            };
        }
    } else {
        // [حالة: زائر جديد غير مسجل]
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';

        if (heroBtn) {
            heroBtn.innerHTML = `ابدأ الآن ! <span class="arrow">←</span>`;
            
            // توجيهه برمجياً عند الضغط إلى إنشاء الحساب
            heroBtn.onclick = () => {
                window.location.href = "createac.html";
            };
        }
    }
}

// دالة تسجيل الخروج الكاملة والموحدة لشاشات الموقع
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn'); // مسح حالة الحارس
    
    // التوجيه لصفحة الدخول لضمان عدم بقائه في المتجر
    window.location.href = "signin.html";
}

// إطلاق الوظائف فور جاهزية الـ DOM بالكامل
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateUI();
    initializeGoogleAuth(); // استدعاء حقن زر جوجل

    // ربط مستمع الحدث لزر الوضع الداكن
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateToggleButton(isDark);
            
            // إعادة رسم زر جوجل ليتناسب مع ألوان الثيم الجديد تلقائياً
            const googleBtnDiv = document.getElementById('googleBtn');
            if (googleBtnDiv) {
                googleBtnDiv.innerHTML = "";
                initializeGoogleAuth();
            }
        });
    }
});
