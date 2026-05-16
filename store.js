// ==========================================
// 1. مصفوفة المنتجات (أضف، احذف، أو عدل هنا براحتك كمطور)
// ==========================================
const productsData = [
    {
        id: 1,
        title: "كاميرا مراقبة ذكية 4K",
        price: 49.99,
        desc: "رؤية ليلية فائقة مع تتبع ذكي وحفظ سحابي آمن لبياناتك.",
        icon: "📹",
        bgClass: "bg-red",
        category: "cameras", 
        tag: "موصى به",
        tagClass: "hot"
    },
    {
        id: 2,
        title: "نظام إدارة العقارات",
        price: 28.50,
        desc: "لوحة تحكم برمجية ذكية لمتابعة الإيجارات، العقود والمبيعات الفورية.",
        icon: "🏠",
        bgClass: "bg-green",
        category: "realestate",
        tag: "متميز",
        tagClass: "price-tag"
    },
    {
        id: 3,
        title: "قفل ذكي بيومتري",
        price: 89.99,
        desc: "فتح عبر بصمة الإصبع، الهاتف، أو الكارت مخصص للأبواب والمكاتب.",
        icon: "🔒",
        bgClass: "bg-purple",
        category: "security",
        tag: "جديد",
        tagClass: ""
    },
    {
        id: 4,
        title: "جهاز تتبع وربط مركزي",
        price: 35.00,
        desc: "يربط كاميرات المراقبة بالكامل لتعمل بكفاءة على شاشات المراقبة.",
        icon: "🎛️",
        bgClass: "bg-blue",
        category: "cameras",
        tag: "نفذت الكمية",
        tagClass: "sold-out",
        isOutOfStock: true 
    },
    {
        id: 5,
        title: "باقة الأمان المتكاملة للمنزل",
        price: 119.00,
        desc: "تتضمن كاميرتين، قفل ذكي، وحساسات حركة بربط لاسلكي مستقر.",
        icon: "🛡️",
        bgClass: "bg-orange",
        category: "security",
        tag: "-20%",
        tagClass: "discount"
    }
];

// مصفوفة لتخزين عناصر سلة المشتريات الحالية
let cart = [];

// ==========================================
// 2. دالة رندرة (رسم) المنتجات في الصفحة
// ==========================================
function renderProducts(filterCategory = "all") {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let html = "";
    let count = 0;

    productsData.forEach(prod => {
        // التحقق من الفلتر الجانبي
        if (filterCategory !== "all" && prod.category !== filterCategory) {
            return; 
        }
        
        count++;

        // معالجة حالة إذا كان المنتج خارج المخزن
        const isOut = prod.isOutOfStock;
        const cardClass = isOut ? "product-card out-of-stock" : "product-card";
        const btnContent = isOut ? "×" : "+";
        const btnDisabled = isOut ? "disabled" : "";

        // بناء كود الـ HTML لكل كارد
        html += `
        <div class="product-card ${cardClass}">
            <div class="image-container ${prod.bgClass}">
                ${prod.tag ? `<span class="tag ${prod.tagClass}">${prod.tag}</span>` : ''}
                <div class="prod-img">${prod.icon}</div>
            </div>
            <div class="product-info">
                <h4 class="prod-title">${prod.title}</h4>
                <p class="prod-desc">${prod.desc}</p>
                <div class="price-row">
                    <span class="price">${prod.price}$</span>
                    <button class="add-to-cart-btn" ${btnDisabled} onclick="addToCart('${prod.title}', ${prod.price})">${btnContent}</button>
                </div>
            </div>
        </div>`;
    });

    grid.innerHTML = html;

    // تحديث عدد العناصر التي تم العثور عليها في الواجهة
    const countSpan = document.querySelector('.results-count');
    if (countSpan) countSpan.innerText = `تم العثور على ${count} عناصر`;
}

// ==========================================
// 3. إدارة عمليات السلة (إضافة، تعديل، حذف)
// ==========================================
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price: parseFloat(price), quantity: 1 });
    }
    
    updateCartUI();
}

function updateCartUI() {
    const cartBadge = document.getElementById('cartBadge');
    const container = document.getElementById('cartItemsContainer');
    const totalSumSpan = document.getElementById('cartTotalSum');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) cartBadge.innerText = totalItems;
    
    if (cart.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="empty-cart-msg">
                    <span class="empty-icon">🛒</span>
                    <p>السلة فارغة حالياً</p>
                </div>`;
        }
        if (totalSumSpan) totalSumSpan.innerText = "0.00$";
        return;
    }
    
    let html = "";
    let totalCost = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalCost += itemTotal;
        
        html += `
        <div class="cart-item-row">
            <div class="item-details">
                <h5>${item.name}</h5>
                <span>${item.price}$ × ${item.quantity}</span>
            </div>
            <button onclick="removeFromCart(${index})" class="remove-item-btn">🗑️</button>
        </div>`;
    });
    
    if (container) container.innerHTML = html;
    if (totalSumSpan) totalSumSpan.innerText = totalCost.toFixed(2) + "$";
}

function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCartUI();
}

function toggleCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

// ==========================================
// 4. دالة معالجة الفاتورة والاتصال الفوري بالواتساب
// ==========================================
function goToCheckout() {
    if (cart.length === 0) {
        alert('سلتك فارغة، أضف بعض المنتجات أولاً!');
        return;
    }
    
    let message = "*مرحباً BTM (طلب جديد من الموقع)* 🚀\n\n";
    message += "أود طلب المنتجات والخدمات التالية:\n";
    message += "----------------------------------------\n";
    
    cart.forEach(item => {
        const lineTotal = (item.price * item.quantity).toFixed(2);
        message += `• *${item.name}*\n  الكمية: ${item.quantity} × السعر: ${item.price}$ | الإجمالي: ${lineTotal}$\n`;
    });
    
    const total = document.getElementById('cartTotalSum').innerText;
    message += "----------------------------------------\n";
    message += `💰 *المجموع الكلي المكتوب:* ${total}\n\n`;
    message += "يرجى تأكيد الطلب لمتابعة تفاصيل الشحن والتركيب. وشكراً!";
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "00201025717429"; 
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
}

// ==========================================
// 5. إدارة مستمعات الأحداث للتصنيفات الجانبية
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. رسم جميع المنتجات لأول مرة تلقائياً
    renderProducts("all");

    // 2. تشغيل نظام تبديل الفلاتر الجانبية برمجياً
    const categoryItems = document.querySelectorAll('.category-list li');
    categoryItems.forEach((li, index) => {
        li.addEventListener('click', () => {
            categoryItems.forEach(item => item.classList.remove('active'));
            li.classList.add('active');

            let cat = "all";
            if (index === 1) cat = "realestate";
            if (index === 2) cat = "cameras";
            if (index === 3) cat = "security";
            if (index === 4) cat = "hardware"; 

            renderProducts(cat);
        });
    });
});