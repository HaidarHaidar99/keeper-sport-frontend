import React from 'react';
import { ShieldCheck, Award, Shirt, Users, MapPin, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutPage = () => {
  const { t, isRtl } = useLanguage();

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>KEEPER SPORTS</span>
          <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '16px' }}>
            {isRtl ? "قصتنا وشغفنا بكرة القدم" : "Our Story & Passion for the Pitch"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.7 }}>
            {isRtl 
              ? "تأسس متجر كيبر سبورتس ليكون الملاذ الرياضي الأول لعشاق وممارسي كرة القدم، بتوفير القمصان الأصلية والأطقم المخصصة بأعلى معايير الجودة."
              : "Keeper Sports was established to bring football enthusiasts and athletes authentic sportswear, official club jerseys, and precision custom kit printing."}
          </p>
        </div>

        {/* Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              {isRtl ? "أصالة مضمونة 100%" : "Authenticity First"}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              {isRtl ? "كل قميص وحذاء ومعدة في متجرنا يتم فحصها بدقة لضمان معايير المصنّع الرسمية." : "Every single shirt, boot, and piece of gear is verified for authentic factory standards."}
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255, 184, 0, 0.1)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Shirt size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              {isRtl ? "مختبر الأطقم المخصصة 2D" : "2D Kit Custom Lab"}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              {isRtl ? "نمكن الفرق واللاعبين من طباعة أسمائهم وأرقامهم المفضلة بأنماط خطوط أصلية." : "Enabling football players and clubs to print customized names, numbers, and badges in real-time."}
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 229, 153, 0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <RefreshCw size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              {isRtl ? "سياسة استبدال عادلة" : "Exchanges Only Policy"}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              {isRtl ? "لضمان المقاس المثالي، نتيح استبدال المقاس خلال 3 أيام من الاستلام." : "To ensure your jersey fits you perfectly, we offer hassle-free size swaps within 3 days of delivery."}
            </p>
          </div>
        </div>

        {/* Physical Store Box */}
        <div className="glass-card glow-card-cyan" style={{ padding: '40px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', flexShrink: 0 }}>
            <MapPin size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
              {isRtl ? "تفضل بزيارة متجرنا الفعلي" : "Visit Our Physical Storefront"}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              {isRtl 
                ? "شارع فلسطين، بجانب الملعب الرياضي الرئيسي. أوقات العمل يومياً من الساعة 10:00 صباحاً وحتى 11:00 مساءً." 
                : "Palestine Street, next to Main Sports Arena. Open daily from 10:00 AM to 11:00 PM."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
