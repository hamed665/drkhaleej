/* ============================================================
   DrMuscat — hi-fi homepage interactions
   ============================================================ */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- scroll header ---------- */
  var header = document.querySelector('.header');
  function onScroll(){
    if(window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- scroll reveal ---------- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal,[data-stagger]'));
  revealEls.forEach(function(el){
    if(el.hasAttribute('data-stagger')){
      var step = parseInt(el.getAttribute('data-stagger')) || 70;
      [].forEach.call(el.children, function(c,i){ c.style.setProperty('--d', (i*step)+'ms'); });
    }
  });
  function reveal(el){
    el.classList.add('in');
    // settle to final state even if the compositor isn't advancing transitions
    // (offscreen/background render) — timers fire regardless of paint.
    setTimeout(function(){ el.classList.add('settled'); }, 900);
  }
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ reveal(en.target); io.unobserve(en.target); }
      });
    }, {threshold:0.08, rootMargin:'0px 0px -6% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
    // reveal anything already in view on first paint (IO can be slow / not fire in some frames)
    requestAnimationFrame(function(){
      revealEls.forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.top < window.innerHeight * 0.96) reveal(el);
      });
    });
    // hard failsafe — never leave SEO content hidden
    setTimeout(function(){ revealEls.forEach(reveal); }, 1600);
  } else {
    revealEls.forEach(reveal);
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var sheet = document.querySelector('.msheet');
  var scrim = document.querySelector('.scrim');
  function openMenu(){ sheet.classList.add('open'); scrim.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeMenu(){ sheet.classList.remove('open'); scrim.classList.remove('open'); document.body.style.overflow=''; }
  if(menuBtn){ menuBtn.addEventListener('click', openMenu); }
  if(scrim){ scrim.addEventListener('click', closeMenu); }
  document.querySelectorAll('[data-close-menu]').forEach(function(b){ b.addEventListener('click', closeMenu); });
  document.querySelectorAll('.msheet nav a').forEach(function(a){ a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });

  /* ---------- search suggestions ---------- */
  var SUGG = {
    what: [
      ['Dentist','search','Dental & orthodontics'],
      ['Dermatologist','search','Skin, laser & aesthetics'],
      ['General clinic','clinic','Family & specialist care'],
      ['Pharmacy','pharmacy','Including 24h & delivery'],
      ['Diagnostic lab','lab','Blood tests & imaging'],
      ['Laser clinic','beauty','Cosmetic & laser'],
      ['Physiotherapy','physio','Rehab & sports recovery']
    ],
    where: [
      ['Al Khuwair','pin','42 providers'],
      ['Qurum','pin','28 providers'],
      ['Azaiba','pin','19 providers'],
      ['Seeb','pin','23 providers'],
      ['Bausher','pin','14 providers'],
      ['Muscat — all areas','pin','Across the city']
    ]
  };
  var arWhat = {
    'Dentist':'طبيب أسنان','Dermatologist':'طبيب جلدية','General clinic':'عيادة عامة',
    'Pharmacy':'صيدلية','Diagnostic lab':'مختبر تشخيصي','Laser clinic':'عيادة ليزر','Physiotherapy':'علاج طبيعي'
  };
  var arWhere = {
    'Al Khuwair':'الخوير','Qurum':'القرم','Azaiba':'العذيبة','Seeb':'السيب','Bausher':'بوشر','Muscat — all areas':'مسقط — كل المناطق'
  };

  var rail = document.querySelector('.searchrail');
  function buildSuggest(field){
    var box = field.querySelector('.suggest');
    var input = field.querySelector('input');
    var key = field.getAttribute('data-field');
    var list = SUGG[key];
    box.innerHTML = '<div class="sg-head">'+(key==='what'?'Popular searches':'Areas in Muscat')+'</div>';
    list.forEach(function(item){
      var b = document.createElement('button');
      b.type='button';
      b.innerHTML = '<span class="sgic"><svg class="ic"><use href="#ic-'+item[1]+'"></use></svg></span>'+
        '<span><span class="sglabel">'+item[0]+'</span><span class="sgsub">'+item[2]+'</span></span>';
      b.addEventListener('mousedown', function(e){
        e.preventDefault();
        input.value = item[0];
        closeSuggest(field);
      });
      box.appendChild(b);
    });
  }
  function openSuggest(field){
    document.querySelectorAll('.sf').forEach(function(f){ if(f!==field) closeSuggest(f); });
    field.classList.add('active');
    field.querySelector('.suggest').classList.add('open');
    rail.classList.add('focused');
  }
  function closeSuggest(field){
    field.classList.remove('active');
    var s = field.querySelector('.suggest');
    if(s) s.classList.remove('open');
    if(!document.querySelector('.suggest.open')) rail.classList.remove('focused');
  }
  document.querySelectorAll('.sf[data-field]').forEach(function(field){
    buildSuggest(field);
    var input = field.querySelector('input');
    input.addEventListener('focus', function(){ openSuggest(field); });
    input.addEventListener('input', function(){
      var q = input.value.trim().toLowerCase();
      var btns = field.querySelectorAll('.suggest button');
      btns.forEach(function(b){
        var t = b.querySelector('.sglabel').textContent.toLowerCase();
        b.style.display = (!q || t.indexOf(q)>-1) ? '' : 'none';
      });
    });
    input.addEventListener('blur', function(){ setTimeout(function(){ closeSuggest(field); }, 120); });
  });

  /* ---------- search submit states ---------- */
  var searchBtn = document.querySelector('.searchrail .btn');
  if(searchBtn){
    searchBtn.addEventListener('click', function(){
      if(searchBtn.classList.contains('loading')) return;
      searchBtn.classList.add('loading');
      setTimeout(function(){
        searchBtn.classList.remove('loading');
        // gentle pulse on rail to acknowledge
        rail.animate([{boxShadow:'var(--sh-lg),0 0 0 4px rgba(111,183,170,.4)'},{boxShadow:'var(--sh-lg)'}],
          {duration:600, easing:'cubic-bezier(0.22,1,0.36,1)'});
      }, 950);
    });
  }

  /* ---------- chips select ---------- */
  document.querySelectorAll('.hero-chips .chip').forEach(function(c){
    c.addEventListener('click', function(){
      document.querySelectorAll('.hero-chips .chip').forEach(function(x){ x.classList.remove('on'); });
      c.classList.add('on');
      var whatInput = document.querySelector('.sf[data-field="what"] input');
      if(whatInput) whatInput.value = c.getAttribute('data-val') || c.textContent.trim();
    });
  });

  /* ---------- carousel ---------- */
  document.querySelectorAll('.caro').forEach(function(caro){
    var track = caro.querySelector('.caro-track');
    var prev = caro.querySelector('[data-caro="prev"]');
    var next = caro.querySelector('[data-caro="next"]');
    var dotsWrap = caro.querySelector('.dots');
    var cards = [].slice.call(track.children);
    function rtl(){ return document.documentElement.dir === 'rtl'; }
    function cardStep(){
      if(cards.length<2) return cards[0]? cards[0].offsetWidth+22 : 300;
      return Math.abs(cards[1].offsetLeft - cards[0].offsetLeft);
    }
    // dots = number of "pages"
    function pages(){ return Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth)); }
    function buildDots(){
      if(!dotsWrap) return;
      dotsWrap.innerHTML='';
      var n = pages();
      for(var i=0;i<n;i++){
        var d=document.createElement('button'); d.className='dot'; d.setAttribute('aria-label','Go to slide '+(i+1));
        (function(idx){ d.addEventListener('click', function(){ track.scrollTo({left:idx*track.clientWidth*(rtl()?-1:1), behavior:reduce?'auto':'smooth'}); }); })(i);
        dotsWrap.appendChild(d);
      }
      syncDots();
    }
    function syncDots(){
      if(!dotsWrap) return;
      var pos = Math.abs(track.scrollLeft);
      var idx = Math.round(pos / track.clientWidth);
      [].forEach.call(dotsWrap.children, function(d,i){ d.classList.toggle('on', i===idx); });
      // arrow disabled states
      var maxScroll = track.scrollWidth - track.clientWidth - 2;
      var atStart = pos <= 2, atEnd = pos >= maxScroll;
      if(prev) prev.disabled = rtl()? atEnd : atStart;
      if(next) next.disabled = rtl()? atStart : atEnd;
      // in RTL both, recompute simply:
      if(rtl()){ if(prev) prev.disabled = atStart; if(next) next.disabled = atEnd; }
    }
    function go(dir){ // dir: -1 prev (visual), +1 next (visual)
      var amount = cardStep() * (rtl()? -dir : dir);
      track.scrollBy({left:amount, behavior:reduce?'auto':'smooth'});
    }
    if(prev) prev.addEventListener('click', function(){ go(-1); });
    if(next) next.addEventListener('click', function(){ go(1); });
    track.addEventListener('scroll', function(){ window.requestAnimationFrame(syncDots); }, {passive:true});
    // keyboard
    track.setAttribute('tabindex','0');
    track.addEventListener('keydown', function(e){
      if(e.key==='ArrowRight'){ e.preventDefault(); go(rtl()?-1:1); }
      if(e.key==='ArrowLeft'){ e.preventDefault(); go(rtl()?1:-1); }
    });
    buildDots();
    window.addEventListener('resize', buildDots);
    caro._rebuild = buildDots;
  });

  /* ---------- language toggle (EN ⇄ AR) ---------- */
  var html = document.documentElement;
  function setLang(lang){
    var ar = lang==='ar';
    html.lang = ar?'ar':'en';
    html.dir = ar?'rtl':'ltr';
    document.querySelectorAll('[data-en]').forEach(function(el){
      var v = el.getAttribute(ar?'data-ar':'data-en');
      if(v!=null) el.textContent = v;
    });
    document.querySelectorAll('[data-en-ph]').forEach(function(el){
      el.setAttribute('placeholder', el.getAttribute(ar?'data-ar-ph':'data-en-ph')||'');
    });
    document.querySelectorAll('.langswitch .lng').forEach(function(el){ el.textContent = ar?'EN':'العربية'; });
    // rebuild suggestion lists language
    document.querySelectorAll('.sf[data-field] .suggest .sglabel').forEach(function(lbl){
      var en = lbl.getAttribute('data-en-key');
      if(!en){ en = lbl.textContent; lbl.setAttribute('data-en-key', en); }
      if(ar){ lbl.textContent = arWhat[en]||arWhere[en]||en; }
      else { lbl.textContent = en; }
    });
    // rebuild carousels (layout direction changed)
    document.querySelectorAll('.caro').forEach(function(c){ if(c._rebuild) c._rebuild(); });
    try{ localStorage.setItem('dm_lang', lang); }catch(e){}
  }
  document.querySelectorAll('.langswitch,[data-lang-toggle]').forEach(function(b){
    b.addEventListener('click', function(){
      setLang(html.dir==='rtl' ? 'en' : 'ar');
    });
  });
  // restore
  try{ var L = localStorage.getItem('dm_lang'); if(L) setLang(L); }catch(e){}

  /* ---------- active nav on scroll (scrollspy) ---------- */
  var sections = [].slice.call(document.querySelectorAll('section[id]'));
  var navlinks = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  if(sections.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var id = en.target.id;
          navlinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href')==='#'+id); });
        }
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    sections.forEach(function(s){ spy.observe(s); });
  }
})();
