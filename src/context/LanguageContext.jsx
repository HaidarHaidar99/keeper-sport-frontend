import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    brandName: "KEEPER SPORTS",
    tagline: "Authentic Football Kits & Performance Sportswear",
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    customKit: "Custom Kit Designer",
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
    noProductsFound: "No products matched your filters.",
    addToCart: "Add to Cart",
    selectSize: "Select Size",
    availableStock: "In Stock",
    outOfStock: "Out of Stock",
    featured: "Featured",
    sale: "SALE",
    quickView: "Quick View",

    // Custom Kit Designer
    kitDesignerTitle: "2D Custom Kit Designer",
    kitDesignerSubtitle: "Customize your dream football jersey with authentic fonts, numbers, and sleeve badges.",
    primaryColor: "Base Color",
    collarStyle: "Collar & Accents",
    playerName: "Player Name",
    playerNumber: "Number",
    fontStyle: "Typography Style",
    addCustomKitToCart: "Add Custom Jersey to Cart",

    // Cart & Checkout
    cartTitle: "Your Shopping Cart",
    emptyCart: "Your cart is currently empty.",
    subtotal: "Subtotal",
    deliveryFee: "Delivery Fee",
    calculatedAtCheckout: "Calculated at checkout",
    total: "Total",
    proceedToCheckout: "Proceed to Checkout",
    checkoutTitle: "Secure Checkout",
    deliveryDetails: "Delivery Details",
    fullName: "Full Name",
    phone: "Phone Number",
    city: "City",
    address: "Detailed Street Address",
    policyAgreement: "I acknowledge and agree that Keeper Sports operates under an Exchanges Only — No Refunds policy.",
    placeOrder: "Place Order (Cash On Delivery)",
    orderConfirmed: "Order Placed Successfully!",
    orderNumber: "Order Number",
    saveGuestTokenNotice: "Your order tracking token has been saved to this device.",

    // Exchange
    requestExchange: "Request Size Exchange",
    exchangeNotice: "Size exchange is available once your order has been Delivered."
  },
  ar: {
    brandName: "كيبر سبورتس",
    tagline: "أطقم كرة القدم الأصلية والملابس الرياضية الاحترافية",
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

    // Custom Kit Designer
    kitDesignerTitle: "مصمم التيشيرتات ثنائي الأبعاد",
    kitDesignerSubtitle: "صمم تيشيرتك المفضل بأرقامك وأسماءك المفضلة مع شعارات احترافية.",
    primaryColor: "لون التيشيرت",
    collarStyle: "شكل الياقة والأطراف",
    playerName: "اسم اللاعب",
    playerNumber: "الرقم",
    fontStyle: "نوع الخط",
    addCustomKitToCart: "إضافة التيشيرت المخصص للسلة",

    // Cart & Checkout
    cartTitle: "سلة التسوق الخاصة بك",
    emptyCart: "سلة التسوق فارغة حالياً.",
    subtotal: "المجموع الفرعي",
    deliveryFee: "تكلفة التوصيل",
    calculatedAtCheckout: "تحسب عند إتمام الطلب",
    total: "الإجمالي",
    proceedToCheckout: "متابعة لإتمام الطلب",
    checkoutTitle: "إتمام الطلب بأمان",
    deliveryDetails: "بيانات التوصيل",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    city: "المدينة",
    address: "العنوان التفصيلي والشارع",
    policyAgreement: "أوافق على سياسة متجر كيبر سبورتس (استبدال المقاس فقط — لا يوجد استرجاع للأموال).",
    placeOrder: "تأكيد الطلب (الدفع عند الاستلام)",
    orderConfirmed: "تم استلام طلبك بنجاح!",
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
