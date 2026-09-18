import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    brandName: "KEEPER SPORTS",
    tagline: "Everything a footballer needs",
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    customKit: "Kit Designer",
    reviews: "Reviews",
    about: "About Us",
    contact: "Contact",
    searchPlaceholder: "Search shirts, boots, accessories...",
    cart: "Cart",
    favorites: "Favorites",
    myOrders: "My Orders",
    login: "Login",
    register: "Register",
    logout: "Logout",
    account: "Account",
    adminPanel: "Admin Panel",
    
    // Header & Announcement
    announcementDefault: "100% Authentic Pitch Kits | Size Exchanges Guaranteed | Fast Delivery",

    // Homepage Sections
    featuredCollection: "Featured Pitch Gear",
    featuredSubtitle: "Curated top-tier match shirts, elite boots, and sportswear",
    shopByCategory: "Shop by Category",
    shopByCategorySubtitle: "Explore specialized equipment designed for real performance",
    exclusiveOffers: "Limited-Time Offers",
    exclusiveOffersSubtitle: "Exclusive price drops on authentic matchday releases",
    offerEndsIn: "Offer Ends In",
    days: "d",
    hours: "h",
    minutes: "m",
    seconds: "s",
    newArrivals: "New Pitch Arrivals",
    newArrivalsSubtitle: "The latest 2026/27 official team shirts and high-performance boots",
    customerReviews: "What Footballers Say",
    customerReviewsSubtitle: "Real photo reviews and ratings from players across the pitch",
    ourStoryTitle: "Everything a Footballer Needs",
    ourStoryText: "Keeper Sports is dedicated to footballers who demand authentic gear. From licensed club shirts and pro-level boots to precision custom printing, we equip players at every level of the game.",
    whatsAppCtaTitle: "Need Instant Sizing Advice or Direct WhatsApp Ordering?",
    whatsAppCtaSubtitle: "Connect directly with our gear specialists on WhatsApp for instant confirmation and advice.",
    chatOnWhatsApp: "Order via WhatsApp",
    viewAllProducts: "View All Gear",

    // Product Catalog
    allProducts: "All Products",
    filters: "Filters",
    clearFilters: "Clear All",
    category: "Category",
    size: "Size",
    priceRange: "Price Range",
    inStockOnly: "In Stock Only",
    onSaleOnly: "On Sale Only",
    sortBy: "Sort By",
    sortBestSeller: "Best Seller",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortRatingDesc: "Highest Rated",
    sortRatingAsc: "Lowest Rated",
    sortAZ: "Name: A to Z",
    sortZA: "Name: Z to A",
    noProductsFound: "No products matched your criteria.",
    addToCart: "Add to Cart",
    selectSize: "Select Size",
    availableStock: "In Stock",
    outOfStock: "Out of Stock",
    featured: "Featured",
    sale: "SALE",
    quickView: "Quick View",
    quickSelectSize: "Choose Size",

    // Custom Kit Designer
    kitDesignerTitle: "2D Team Kit Designer",
    kitDesignerSubtitle: "Craft your squad's kit with authentic club artwork, official typography, and sleeve badges.",
    playerName: "Player Name",
    playerNumber: "Number (1–99)",
    addCustomKitToCart: "Add Customized Kit to Cart",

    // Cart & Checkout
    cartTitle: "Your Shopping Cart",
    emptyCart: "Your cart is currently empty.",
    subtotal: "Subtotal",
    deliveryFee: "Delivery Fee",
    calculatedAtCheckout: "Calculated at checkout",
    total: "Total",
    proceedToCheckout: "Proceed to Checkout",
    checkoutTitle: "Checkout",
    deliveryDetails: "Delivery Snapshot",
    fullName: "Full Name",
    phone: "Phone Number",
    country: "Country",
    city: "City",
    address: "Street Address",
    liveLocation: "Live Location (Optional)",
    saveForNextTime: "Save delivery info on this device for next time",
    policyAgreement: "I acknowledge that Keeper Sports operates under an Exchanges Only — No Refunds policy.",
    placeOrder: "Place Order (Cash On Delivery)",
    orderConfirmed: "Order Confirmed!",
    orderNumber: "Order Number",
    saveGuestTokenNotice: "Your order tracking token has been saved to this device.",

    // Exchange
    requestExchange: "Request Size Exchange",
    exchangeNotice: "Size exchanges are available once your order has been marked as Delivered."
  },
  ar: {
    brandName: "كيبر سبورتس",
    tagline: "كل ما يحتاجه لاعب كرة القدم",
    home: "الرئيسية",
    shop: "المتجر",
    categories: "الأقسام",
    customKit: "مصمم التيشيرتات",
    reviews: "التقييمات",
    about: "من نحن",
    contact: "اتصل بنا",
    searchPlaceholder: "ابحث عن قمصان، أحذية، معدات...",
    cart: "السلة",
    favorites: "المفضلة",
    myOrders: "طلباتي",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    logout: "تسجيل الخروج",
    account: "حسابي",
    adminPanel: "لوحة التحكم",

    // Header & Announcement
    announcementDefault: "أطقم أصلية 100% | استبدال المقاس متاح | توصيل سريع وموثوق",

    // Homepage Sections
    featuredCollection: "تشكيلة مميزة للملعب",
    featuredSubtitle: "أفضل قمصان المباريات والأحذية الاحترافية المختارة بعناية",
    shopByCategory: "تسوق حسب القسم",
    shopByCategorySubtitle: "اكتشف المعدات الرياضية المصممة لتقديم أعلى أداء",
    exclusiveOffers: "عروض حصرية لفترة محدودة",
    exclusiveOffersSubtitle: "تخفيضات خاصة على أحدث إصدارات الأطقم الرسمية",
    offerEndsIn: "ينتهي العرض خلال",
    days: "يوم",
    hours: "ساعة",
    minutes: "دقيقة",
    seconds: "ثانية",
    newArrivals: "وصل حديثاً",
    newArrivalsSubtitle: "أحدث قمصان موسم 2026/27 والأحذية الاحترافية الجديدة",
    customerReviews: "آراء اللاعبين والعملاء",
    customerReviewsSubtitle: "تقييمات وصور حقيقية من لاعبي كرة القدم بعد استلام طلباتهم",
    ourStoryTitle: "كل ما يحتاجه لاعب كرة القدم",
    ourStoryText: "كيبر سبورتس وجهتك الأولى المتخصصة في قمصان الأندية الأصلية، الأحذية الاحترافية، وتصميم الأطقم المخصصة بأعلى معايير الجودة المعتمدة.",
    whatsAppCtaTitle: "هل تحتاج لمساعدة باختيار المقاس أو الطلب المباشر عبر واتساب؟",
    whatsAppCtaSubtitle: "تواصل مباشرة مع خبرائنا عبر واتساب للتأكد من المقاسات وتأكيد طلبك فوراً.",
    chatOnWhatsApp: "اطلب عبر واتساب",
    viewAllProducts: "تصفح جميع المنتجات",

    // Product Catalog
    allProducts: "جميع المنتجات",
    filters: "الفلاتر",
    clearFilters: "مسح الفلاتر",
    category: "القسم",
    size: "المقاس",
    priceRange: "نطاق السعر",
    inStockOnly: "المتوفر فقط",
    onSaleOnly: "التخفيضات فقط",
    sortBy: "ترتيب حسب",
    sortBestSeller: "الأكثر مبيعاً",
    sortPriceAsc: "السعر: من الأقل للأعلى",
    sortPriceDesc: "السعر: من الأعلى للأقل",
    sortRatingDesc: "الأعلى تقييماً",
    sortRatingAsc: "الأقل تقييماً",
    sortAZ: "الاسم: أ إلى ي",
    sortZA: "الاسم: ي إلى أ",
    noProductsFound: "لم يتم العثور على منتجات مطابقة لخيارات البحث.",
    addToCart: "أضف إلى السلة",
    selectSize: "اختر المقاس",
    availableStock: "متوفر بالمخزون",
    outOfStock: "نفذت الكمية",
    featured: "مميز",
    sale: "تخفيض",
    quickView: "نظرة سريعة",
    quickSelectSize: "حدد المقاس",

    // Custom Kit Designer
    kitDesignerTitle: "مصمم أطقم الفرق ثنائي الأبعاد",
    kitDesignerSubtitle: "صمم تيشيرت ناديك المفضل بالأطقم الأصلية والخطوط الرسمية وشارات الأكمام.",
    playerName: "اسم اللاعب",
    playerNumber: "الرقم (1–99)",
    addCustomKitToCart: "إضافة الطقم المخصص للسلة",

    // Cart & Checkout
    cartTitle: "سلة التسوق",
    emptyCart: "سلة التسوق فارغة حالياً.",
    subtotal: "المجموع الفرعي",
    deliveryFee: "تكلفة التوصيل",
    calculatedAtCheckout: "تحسب عند إتمام الطلب",
    total: "الإجمالي",
    proceedToCheckout: "متابعة لإتمام الطلب",
    checkoutTitle: "إتمام الطلب",
    deliveryDetails: "بيانات التوصيل",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    country: "الدولة",
    city: "المدينة",
    address: "العنوان التفصيلي والشارع",
    liveLocation: "الموقع المباشر (اختياري)",
    saveForNextTime: "حفظ بيانات التوصيل على هذا الجهاز للمرات القادمة",
    policyAgreement: "أوافق على سياسة متجر كيبر سبورتس (استبدال المقاس فقط — لا يوجد استرجاع للأموال).",
    placeOrder: "تأكيد الطلب (الدفع عند الاستلام)",
    orderConfirmed: "تم تأكيد طلبك بنجاح!",
    orderNumber: "رقم الطلب",
    saveGuestTokenNotice: "تم حفظ رمز تتبع طلبك بأمان على هذا الجهاز.",

    // Exchange
    requestExchange: "طلب استبدال المقاس",
    exchangeNotice: "يمكنك طلب استبدال المقاس بمجرد توصيل طلبك بنجاح."
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('ks_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('ks_lang', language);
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRtl: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
