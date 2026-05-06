export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-[#333] leading-tight">
            عن <span className="text-[#537D84]">Little One</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            في Little One، نؤمن أن نوم طفلك هو أساس راحته ونموه السليم. بدأنا رحلتنا بشغف لتوفير أسرّة أطفال تجمع بين الأناقة العصرية، الراحة الفائقة، والأمان التام.
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="text-4xl font-bold text-[#537D84]">100%</span>
              <p className="text-sm text-gray-400 font-bold">مواد طبيعية وآمنة</p>
            </div>
            <div className="space-y-2">
              <span className="text-4xl font-bold text-[#537D84]">+500</span>
              <p className="text-sm text-gray-400 font-bold">عميل سعيد في ليبيا</p>
            </div>
          </div>
        </div>
        <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl">
          <img 
            src="/hero-image.jpg" 
            alt="About Little One" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="bg-[#f3efe9] rounded-[4rem] p-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-[#537D84] shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3 className="text-xl font-bold text-[#333]">الجودة والأمان</h3>
          <p className="text-gray-500 text-sm">نحرص على استخدام أفضل أنواع الخشب والدهانات الآمنة تماماً للأطفال.</p>
        </div>
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-[#537D84] shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 className="text-xl font-bold text-[#333]">تصميمات متميزة</h3>
          <p className="text-gray-500 text-sm">تصميمات عصرية تتناسب مع مختلف أذواق غرف الأطفال الحديثة.</p>
        </div>
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-[#537D84] shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <h3 className="text-xl font-bold text-[#333]">توصيل سريع</h3>
          <p className="text-gray-500 text-sm">خدمة توصيل موثوقة لجميع المدن الليبية مع عناية خاصة بالمنتج.</p>
        </div>
      </div>

      <div className="text-center space-y-8 py-20">
        <h2 className="text-3xl font-bold text-[#333]">نحن هنا لخدمتكم دائماً</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          فريق عملنا مستعد للإجابة على جميع استفساراتكم ومساعدتكم في اختيار الأفضل لأطفالكم.
        </p>
        <div className="flex justify-center gap-4">
          <a href="https://wa.me/2189XXXXXXX" className="bg-[#537D84] text-white px-10 py-4 rounded-full font-bold hover:bg-[#45676d] transition-all">تواصل معنا الآن</a>
        </div>
      </div>
    </div>
  );
}
