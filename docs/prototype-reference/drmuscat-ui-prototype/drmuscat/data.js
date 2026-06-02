/* ============================================================
   DrMuscat — shared mock data (frontend only, no backend)
   One source of truth for providers, categories, areas, articles.
   Bilingual fields use {en, ar}. Consumed by render helpers in
   pages; safe to import standalone (attaches to window.DM_DATA).
   ============================================================ */
(function(){
  'use strict';

  // ---- CATEGORIES ----
  // {slug, name{en,ar}, subtitle{en,ar}, description{en,ar}, icon, featured}
  var categories = [
    { slug:'doctors',     icon:'i-stetho',   featured:true,  name:{en:'Doctors',en_:'',ar:'أطباء'},        subtitle:{en:'General · Specialists',ar:'عام · أخصائيون'},  description:{en:'General practitioners and specialist doctors across Muscat.',ar:'أطباء عموميون وأخصائيون في مختلف أنحاء مسقط.'} },
    { slug:'clinics',     icon:'i-building', featured:true,  name:{en:'Clinics',ar:'عيادات'},               subtitle:{en:'Private · Multi-specialty',ar:'خاصة · متعددة'}, description:{en:'Private and multi-specialty clinics for everyday care.',ar:'عيادات خاصة ومتعددة التخصصات للرعاية اليومية.'} },
    { slug:'dental',      icon:'i-tooth',    featured:true,  name:{en:'Dental',ar:'أسنان'},                 subtitle:{en:'Ortho · Implants',ar:'تقويم · زراعة'},        description:{en:'Dental centers offering orthodontics, implants and cosmetic dentistry.',ar:'مراكز أسنان تقدّم التقويم والزراعة وطب الأسنان التجميلي.'} },
    { slug:'dermatology', icon:'i-sparkle',  featured:true,  name:{en:'Dermatology',ar:'جلدية'},            subtitle:{en:'Skin · Cosmetic',ar:'بشرة · تجميل'},          description:{en:'Skin, cosmetic and laser dermatology providers.',ar:'مزوّدو خدمات الجلدية والتجميل والليزر.'} },
    { slug:'pharmacies',  icon:'i-pill',     featured:true,  name:{en:'Pharmacies',ar:'صيدليات'},           subtitle:{en:'24h · Delivery',ar:'24 ساعة · توصيل'},        description:{en:'Pharmacies across Muscat, many open 24 hours with delivery.',ar:'صيدليات في مسقط، كثير منها مفتوح 24 ساعة مع توصيل.'} },
    { slug:'labs',        icon:'i-flask',    featured:true,  name:{en:'Labs',ar:'مختبرات'},                 subtitle:{en:'Blood · Imaging',ar:'تحاليل · أشعة'},         description:{en:'Diagnostic labs for blood tests, imaging and home visits.',ar:'مختبرات تشخيصية للتحاليل والأشعة والزيارات المنزلية.'} },
    { slug:'physiotherapy',icon:'i-activity',featured:false, name:{en:'Physiotherapy',ar:'علاج طبيعي'},     subtitle:{en:'Rehab · Sports',ar:'تأهيل · رياضة'},          description:{en:'Physiotherapy and rehabilitation, including sports recovery.',ar:'العلاج الطبيعي والتأهيل، بما في ذلك التعافي الرياضي.'} },
    { slug:'beauty-laser',icon:'i-scan',     featured:false, name:{en:'Beauty & Laser',ar:'تجميل وليزر'},   subtitle:{en:'Aesthetics',ar:'تجميل'},                      description:{en:'Beauty, aesthetics and laser clinics.',ar:'عيادات التجميل والعناية والليزر.'} },
    { slug:'wellness',    icon:'i-heart',    featured:false, name:{en:'Wellness',ar:'العافية'},             subtitle:{en:'Spa · Recovery',ar:'سبا · استشفاء'},          description:{en:'Wellness centers, spa and recovery.',ar:'مراكز العافية والسبا والاستشفاء.'} },
    { slug:'gyms',        icon:'i-dumbbell', featured:false, name:{en:'Gyms',ar:'صالات رياضية'},            subtitle:{en:'Studios · PT',ar:'استوديوهات · تدريب'},       description:{en:'Gyms, studios and personal training.',ar:'صالات رياضية واستوديوهات وتدريب شخصي.'} },
    { slug:'healthy-food',icon:'i-leaf',     featured:false, name:{en:'Healthy Restaurants',ar:'مطاعم صحية'},subtitle:{en:'Meals · Nutrition',ar:'وجبات · تغذية'},      description:{en:'Healthy restaurants and nutrition-focused meal providers.',ar:'مطاعم صحية ومزوّدو وجبات تركّز على التغذية.'} }
  ];

  // ---- AREAS ----
  // {slug, name{en,ar}, providerCount, featuredCategories[]}
  var areas = [
    { slug:'al-khuwair', providerCount:42, name:{en:'Al Khuwair',ar:'الخوير'}, featuredCategories:['dental','clinics','pharmacies'] },
    { slug:'qurum',      providerCount:28, name:{en:'Qurum',ar:'القرم'},        featuredCategories:['dermatology','clinics','wellness'] },
    { slug:'azaiba',     providerCount:19, name:{en:'Azaiba',ar:'العذيبة'},     featuredCategories:['labs','dental','pharmacies'] },
    { slug:'seeb',       providerCount:23, name:{en:'Seeb',ar:'السيب'},          featuredCategories:['physiotherapy','clinics','labs'] },
    { slug:'bausher',    providerCount:14, name:{en:'Bausher',ar:'بوشر'},        featuredCategories:['clinics','pharmacies'] },
    { slug:'ghubra',     providerCount:16, name:{en:'Ghubra',ar:'الغبرة'},       featuredCategories:['dental','dermatology'] },
    { slug:'muttrah',    providerCount:11, name:{en:'Muttrah',ar:'مطرح'},        featuredCategories:['pharmacies','clinics'] },
    { slug:'ruwi',       providerCount:17, name:{en:'Ruwi',ar:'روي'},            featuredCategories:['pharmacies','labs'] },
    { slug:'al-hail',    providerCount:9,  name:{en:'Al Hail',ar:'الحيل'},        featuredCategories:['clinics','gyms'] }
  ];

  // ---- PROVIDERS ----
  // full structure per spec; placeholderVariant maps to a media tint class
  var providers = [
    { id:'p1', slug:'muscat-skin-clinic', logo:'M', category:'dermatology', area:'qurum',
      name:{en:'Muscat Skin Clinic',ar:'عيادة مسقط للجلدية'},
      verificationStatus:'verified', claimedStatus:'claimed',
      shortDescription:{en:'A premium dermatology and laser clinic in Qurum offering skin, cosmetic and laser treatments.',ar:'عيادة جلدية وليزر مميّزة في القرم تقدّم علاجات البشرة والتجميل والليزر.'},
      services:[{en:'Skin consultation',ar:'استشارة جلدية'},{en:'Laser treatment',ar:'علاج بالليزر'},{en:'Cosmetic dermatology',ar:'جلدية تجميلية'},{en:'Acne care',ar:'علاج حب الشباب'},{en:'Pigmentation',ar:'التصبّغات'}],
      tags:[{en:'Skin',ar:'بشرة'},{en:'Laser',ar:'ليزر'},{en:'Cosmetic',ar:'تجميل'}],
      whatsapp:'+96890000001', phone:'+96824000001', directionsUrl:'#',
      openingHours:{en:'Sat–Thu 9:00–21:00 · Fri closed',ar:'السبت–الخميس 9:00–21:00 · الجمعة مغلق'},
      licenseInfo:{en:'Licensed information on file',ar:'معلومات الترخيص محفوظة'},
      hasOffer:true, respondsOnWhatsapp:true, placeholderVariant:'beauty', wm:'i-sparkle' },

    { id:'p2', slug:'al-khuwair-dental-center', logo:'A', category:'dental', area:'al-khuwair',
      name:{en:'Al Khuwair Dental Center',ar:'مركز الخوير للأسنان'},
      verificationStatus:'verified', claimedStatus:'claimed',
      shortDescription:{en:'Family and cosmetic dental center in Al Khuwair with orthodontics and implants.',ar:'مركز أسنان عائلي وتجميلي في الخوير يقدّم التقويم والزراعة.'},
      services:[{en:'Orthodontics',ar:'تقويم الأسنان'},{en:'Implants',ar:'زراعة'},{en:'Whitening',ar:'تبييض'},{en:'Root canal',ar:'علاج العصب'}],
      tags:[{en:'Ortho',ar:'تقويم'},{en:'Implants',ar:'زراعة'},{en:'Whitening',ar:'تبييض'}],
      whatsapp:'+96890000002', phone:'+96824000002', directionsUrl:'#',
      openingHours:{en:'Sat–Thu 8:30–20:00 · Fri 16:00–20:00',ar:'السبت–الخميس 8:30–20:00 · الجمعة 16:00–20:00'},
      licenseInfo:{en:'Licensed information on file',ar:'معلومات الترخيص محفوظة'},
      hasOffer:true, respondsOnWhatsapp:false, placeholderVariant:'provider', wm:'i-tooth' },

    { id:'p3', slug:'azaiba-diagnostic-lab', logo:'A', category:'labs', area:'azaiba',
      name:{en:'Azaiba Diagnostic Lab',ar:'مختبر العذيبة التشخيصي'},
      verificationStatus:'verified', claimedStatus:'claimed',
      shortDescription:{en:'Diagnostic laboratory in Azaiba offering blood tests, imaging and home sample collection.',ar:'مختبر تشخيصي في العذيبة يقدّم التحاليل والأشعة وسحب العينات منزلياً.'},
      services:[{en:'Blood tests',ar:'تحاليل الدم'},{en:'Imaging',ar:'أشعة'},{en:'Home visit',ar:'زيارة منزلية'}],
      tags:[{en:'Blood',ar:'تحاليل'},{en:'Imaging',ar:'أشعة'},{en:'Home visit',ar:'زيارة منزلية'}],
      whatsapp:'+96890000003', phone:'+96824000003', directionsUrl:'#',
      openingHours:{en:'Daily 7:00–22:00',ar:'يومياً 7:00–22:00'},
      licenseInfo:{en:'Verified license info',ar:'معلومات ترخيص موثّقة'},
      hasOffer:false, respondsOnWhatsapp:false, placeholderVariant:'provider', wm:'i-flask' },

    { id:'p4', slug:'seeb-physiotherapy', logo:'S', category:'physiotherapy', area:'seeb',
      name:{en:'Seeb Physiotherapy',ar:'مركز السيب للعلاج الطبيعي'},
      verificationStatus:'verified', claimedStatus:'unclaimed',
      shortDescription:{en:'Physiotherapy and sports rehabilitation center in Seeb.',ar:'مركز للعلاج الطبيعي والتأهيل الرياضي في السيب.'},
      services:[{en:'Rehabilitation',ar:'إعادة تأهيل'},{en:'Sports therapy',ar:'علاج رياضي'},{en:'Manual therapy',ar:'علاج يدوي'}],
      tags:[{en:'Rehab',ar:'تأهيل'},{en:'Sports',ar:'رياضة'}],
      whatsapp:'+96890000004', phone:'+96824000004', directionsUrl:'#',
      openingHours:{en:'Sat–Thu 9:00–20:00',ar:'السبت–الخميس 9:00–20:00'},
      licenseInfo:{en:'Licensed information on file',ar:'معلومات الترخيص محفوظة'},
      hasOffer:false, respondsOnWhatsapp:true, placeholderVariant:'wellness', wm:'i-activity' },

    { id:'p5', slug:'ruwi-care-pharmacy', logo:'R', category:'pharmacies', area:'ruwi',
      name:{en:'Ruwi Care Pharmacy',ar:'صيدلية روي كير'},
      verificationStatus:'verified', claimedStatus:'claimed',
      shortDescription:{en:'24-hour pharmacy in Ruwi with home delivery across central Muscat.',ar:'صيدلية تعمل 24 ساعة في روي مع توصيل منزلي في وسط مسقط.'},
      services:[{en:'Prescriptions',ar:'وصفات طبية'},{en:'Delivery',ar:'توصيل'},{en:'Health products',ar:'منتجات صحية'}],
      tags:[{en:'24h',ar:'24 ساعة'},{en:'Delivery',ar:'توصيل'}],
      whatsapp:'+96890000005', phone:'+96824000005', directionsUrl:'#',
      openingHours:{en:'Open 24 hours',ar:'مفتوحة 24 ساعة'},
      licenseInfo:{en:'Licensed information on file',ar:'معلومات الترخيص محفوظة'},
      hasOffer:false, respondsOnWhatsapp:false, placeholderVariant:'provider', wm:'i-pill' },

    { id:'p6', slug:'qurum-family-clinic', logo:'Q', category:'clinics', area:'qurum',
      name:{en:'Qurum Family Clinic',ar:'عيادة القرم العائلية'},
      verificationStatus:'verified', claimedStatus:'claimed',
      shortDescription:{en:'Multi-specialty family clinic in Qurum covering general medicine, pediatrics and ENT.',ar:'عيادة عائلية متعددة التخصصات في القرم تشمل الطب العام والأطفال والأنف والأذن.'},
      services:[{en:'General medicine',ar:'طب عام'},{en:'Pediatrics',ar:'طب أطفال'},{en:'ENT',ar:'أنف وأذن وحنجرة'}],
      tags:[{en:'General',ar:'عام'},{en:'Pediatrics',ar:'أطفال'},{en:'ENT',ar:'أنف وأذن'}],
      whatsapp:'+96890000006', phone:'+96824000006', directionsUrl:'#',
      openingHours:{en:'Sat–Thu 8:00–22:00 · Fri 16:00–22:00',ar:'السبت–الخميس 8:00–22:00 · الجمعة 16:00–22:00'},
      licenseInfo:{en:'Verified license info',ar:'معلومات ترخيص موثّقة'},
      hasOffer:false, respondsOnWhatsapp:true, placeholderVariant:'provider', wm:'i-stetho' }
  ];

  // ---- ARTICLES ----
  // {slug, title{en,ar}, category{en,ar}, excerpt{en,ar}, readTime, date, placeholderVariant}
  var articles = [
    { slug:'choosing-a-trusted-clinic-in-muscat', placeholderVariant:'article', wm:'i-building', readTime:5, date:'2026-05-20',
      title:{en:'Choosing a trusted clinic in Muscat',ar:'كيف تختار عيادة موثوقة في مسقط'},
      category:{en:'Guide',ar:'دليل'},
      excerpt:{en:'What to look for — licensing, clear information and direct contact — when choosing where to get care.',ar:'ما الذي تبحث عنه — الترخيص ووضوح المعلومات والتواصل المباشر — عند اختيار مكان الرعاية.'} },
    { slug:'what-verified-provider-means', placeholderVariant:'article', wm:'i-shield', readTime:4, date:'2026-05-12',
      title:{en:'What "verified provider" means',ar:'ماذا يعني مزود موثوق؟'},
      category:{en:'Guide',ar:'دليل'},
      excerpt:{en:'How DrMuscat reviews licensing details and claimed profiles — and what it does not do.',ar:'كيف يراجع DrMuscat معلومات الترخيص والملفات الموثّقة — وما لا يفعله.'} },
    { slug:'wellness-and-care-the-omani-way', placeholderVariant:'wellness', wm:'i-leaf', readTime:6, date:'2026-04-28',
      title:{en:'Wellness & care, the Omani way',ar:'العافية والرعاية على الطريقة العُمانية'},
      category:{en:'Guide',ar:'دليل'},
      excerpt:{en:'Blending modern healthcare with local wellness culture across Muscat.',ar:'الدمج بين الرعاية الصحية الحديثة وثقافة العافية المحلية في مسقط.'} }
  ];

  window.DM_DATA = { categories:categories, areas:areas, providers:providers, articles:articles,
    byCategory:function(slug){return providers.filter(function(p){return p.category===slug;});},
    byArea:function(slug){return providers.filter(function(p){return p.area===slug;});},
    provider:function(slug){return providers.filter(function(p){return p.slug===slug;})[0];},
    cat:function(slug){return categories.filter(function(c){return c.slug===slug;})[0];},
    areaBy:function(slug){return areas.filter(function(a){return a.slug===slug;})[0];},
    article:function(slug){return articles.filter(function(a){return a.slug===slug;})[0];}
  };
})();
