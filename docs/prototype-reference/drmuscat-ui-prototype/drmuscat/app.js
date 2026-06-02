/* DrMuscat — premium homepage interactions */
(function(){
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header scroll compaction ---------- */
  var header = document.querySelector('.site-header');
  if(header){
    var onScroll = function(){
      if(window.scrollY > 24) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  /* ---------- mobile menu ---------- */
  var menu = document.getElementById('mMenu');
  function closeMenu(){ if(menu){ menu.classList.remove('open'); document.body.style.overflow=''; } }
  document.querySelectorAll('[data-menu-open]').forEach(function(b){
    b.addEventListener('click', function(){ if(menu){ menu.classList.add('open'); document.body.style.overflow='hidden'; } });
  });
  document.querySelectorAll('[data-menu-close]').forEach(function(b){
    b.addEventListener('click', closeMenu);
  });
  if(menu) menu.querySelectorAll('nav a').forEach(function(a){ a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });

  /* ---------- search suggestions ---------- */
  document.querySelectorAll('[data-suggest]').forEach(function(field){
    var input = field.querySelector('input');
    var drop = field.querySelector('.sr-suggest');
    if(!input || !drop) return;
    var opts = [].slice.call(drop.querySelectorAll('.sr-opt'));
    var cur = -1;
    function open(){ drop.classList.add('open'); }
    function close(){ drop.classList.remove('open'); cur=-1; opts.forEach(function(o){o.classList.remove('cur');}); }
    input.addEventListener('focus', open);
    input.addEventListener('input', function(){
      var v = input.value.trim().toLowerCase();
      var any=false;
      opts.forEach(function(o){
        var match = !v || o.textContent.toLowerCase().indexOf(v) > -1;
        o.style.display = match ? '' : 'none';
        if(match) any=true;
      });
      if(any) open(); else close();
    });
    opts.forEach(function(o){
      o.addEventListener('mousedown', function(e){
        e.preventDefault();
        input.value = o.getAttribute('data-val') || o.querySelector('span').textContent;
        close();
      });
    });
    input.addEventListener('keydown', function(e){
      var vis = opts.filter(function(o){return o.style.display!=='none';});
      if(e.key==='ArrowDown'){ e.preventDefault(); cur=Math.min(cur+1,vis.length-1); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); cur=Math.max(cur-1,0); }
      else if(e.key==='Enter' && cur>-1 && vis[cur]){ input.value = vis[cur].getAttribute('data-val')||vis[cur].querySelector('span').textContent; close(); return; }
      else if(e.key==='Escape'){ close(); return; }
      else return;
      opts.forEach(function(o){o.classList.remove('cur');});
      if(vis[cur]) vis[cur].classList.add('cur');
    });
    document.addEventListener('click', function(e){ if(!field.contains(e.target)) close(); });
  });

  /* ---------- chips select ---------- */
  document.querySelectorAll('[data-chipgroup]').forEach(function(group){
    group.querySelectorAll('.chip').forEach(function(c){
      c.addEventListener('click', function(){
        if(group.hasAttribute('data-single')) group.querySelectorAll('.chip').forEach(function(x){x.classList.remove('is-selected');});
        c.classList.toggle('is-selected');
      });
    });
  });

  /* ---------- carousels ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function(car){
    var track = car.querySelector('.car-track');
    var prev = car.querySelector('[data-prev]');
    var next = car.querySelector('[data-next]');
    function step(){ var first=track.children[0]; if(!first) return 320; var g=parseInt(getComputedStyle(track).gap)||22; return first.getBoundingClientRect().width + g; }
    function rtl(){ return document.documentElement.dir === 'rtl'; }
    function update(){
      var max = track.scrollWidth - track.clientWidth - 2;
      var sl = Math.abs(track.scrollLeft);
      if(prev) prev.disabled = sl <= 2;
      if(next) next.disabled = sl >= max;
    }
    function go(dir){ var d = step()*dir*(rtl()?-1:1); track.scrollBy({left:d, behavior:reduce?'auto':'smooth'}); }
    prev && prev.addEventListener('click', function(){ go(-1); });
    next && next.addEventListener('click', function(){ go(1); });
    track.addEventListener('scroll', function(){ window.requestAnimationFrame(update); }, {passive:true});
    setTimeout(update, 60);
    window.addEventListener('resize', update);
  });

  /* ---------- scroll reveal (robust: never leaves content hidden) ---------- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal, .stagger'));
  function reveal(el){
    el.classList.add('in');
    // Snap to resting state shortly after, so a throttled/backgrounded
    // compositor (where transitions freeze mid-flight) can never leave
    // content stuck at opacity:0. Timers fire even when rAF is paused.
    setTimeout(function(){ el.classList.add('settled'); }, 640);
  }
  if(reduce || !('IntersectionObserver' in window)){
    revealEls.forEach(reveal);
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ reveal(en.target); io.unobserve(en.target); }
      });
    }, {threshold:0.1, rootMargin:'0px 0px -6% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
    // reveal anything already in (or near) the viewport right away
    requestAnimationFrame(function(){
      var vh = window.innerHeight || 800;
      revealEls.forEach(function(el){
        if(el.getBoundingClientRect().top < vh * 0.94){ reveal(el); io.unobserve(el); }
      });
    });
    // safety net — if IO never fires (some embedded contexts), show everything
    setTimeout(function(){ revealEls.forEach(reveal); }, 2600);
  }

  /* ---------- active nav on scroll ---------- */
  var navlinks = [].slice.call(document.querySelectorAll('.nav a[data-sec]'));
  var secs = navlinks.map(function(a){ return document.getElementById(a.getAttribute('data-sec')); });
  if('IntersectionObserver' in window){
    var navIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var id = en.target.id;
          navlinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('data-sec')===id); });
        }
      });
    }, {threshold:0.4, rootMargin:'-30% 0px -50% 0px'});
    secs.forEach(function(s){ if(s) navIO.observe(s); });
  }

  /* ---------- list-your-center form ---------- */
  var submitBtn = document.getElementById('submitBtn');
  if(submitBtn){
    submitBtn.addEventListener('click', function(){
      var form = document.getElementById('formCard');
      var ok = document.getElementById('successCard');
      form.classList.add('hide');
      ok.classList.add('show');
      window.scrollTo({top:0, behavior:reduce?'auto':'smooth'});
    });
  }

  /* ---------- mobile filters ---------- */
  var filters = document.getElementById('filters');
  document.querySelectorAll('[data-filter-open]').forEach(function(b){
    b.addEventListener('click', function(){ filters.classList.add('open'); document.body.style.overflow='hidden'; });
  });
  document.querySelectorAll('[data-filter-close]').forEach(function(b){
    b.addEventListener('click', function(){ filters.classList.remove('open'); document.body.style.overflow=''; });
  });
  document.querySelectorAll('.filter-opt').forEach(function(o){
    o.addEventListener('click', function(){ o.classList.toggle('on'); });
  });

  /* ---------- bilingual EN ⇄ AR ---------- */
  function setLang(lang){
    var rtl = lang === 'ar';
    document.documentElement.lang = rtl ? 'ar-OM' : 'en-OM';
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.body.dir = rtl ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en]').forEach(function(el){
      var t = el.getAttribute(rtl ? 'data-ar' : 'data-en');
      if(t != null) el.textContent = t;
    });
    document.querySelectorAll('[data-en-ph]').forEach(function(el){
      var t = el.getAttribute(rtl ? 'data-ar-ph' : 'data-en-ph');
      if(t != null) el.setAttribute('placeholder', t);
    });
    // language buttons show the OTHER language as the target
    document.querySelectorAll('.lang').forEach(function(l){
      var tgt = l.querySelector('.lang-target');
      if(tgt) tgt.textContent = rtl ? 'English' : 'العربية';
    });
    try{ localStorage.setItem('dm_lang', lang); }catch(e){}
  }
  function toggleLang(){ setLang(document.documentElement.dir === 'rtl' ? 'en' : 'ar'); }
  document.querySelectorAll('.lang').forEach(function(l){
    l.addEventListener('click', toggleLang);
  });
  var saved='en';
  try{ saved = localStorage.getItem('dm_lang') || 'en'; }catch(e){}
  setLang(saved);
})();
