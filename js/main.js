/* Pickupsan - site geneli betikler */

// WhatsApp numarası ve e-posta (değişirse sadece burayı güncelleyin)
var WHATSAPP = '905070633068';
var EMAIL = 'info@pickupsan.com';

/* ---- Menü: kaydırınca koyulaşır, mobilde açılır/kapanır ---- */
var header = document.querySelector('.header');
function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 40); }
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

var menuBtn = document.querySelector('.menu-btn');
var nav = document.getElementById('nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    header.classList.add('scrolled');
  });
}

/* ---- Kaydırınca beliren öğeler ---- */
var revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(function (el) { io.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add('in'); });
}

/* ---- Sayılar yukarı doğru sayar (data-count="450") ---- */
document.querySelectorAll('[data-count]').forEach(function (el) {
  var target = parseInt(el.getAttribute('data-count'), 10);
  var suffix = el.getAttribute('data-suffix') || '';
  var done = false;
  function run() {
    if (done) return; done = true;
    var start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { run(); o.disconnect(); } }).observe(el);
  } else { run(); }
});

/* ---- Araç bulucu: seçilen aracın sayfasına git ---- */
document.querySelectorAll('[data-finder]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = form.querySelector('select').value;
    if (v) window.location.href = v + '-kabin.html';
  });
});

/* ---- Ürün sayfası: küçük resme tıklayınca büyük resmi değiştir ---- */
var mainImg = document.querySelector('.product__main img');
document.querySelectorAll('.thumbs button').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.thumbs button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    mainImg.style.opacity = 0;
    setTimeout(function () { mainImg.src = btn.dataset.src; mainImg.style.opacity = 1; }, 180);
  });
});

/* ---- Galeri: tam ekran görüntüleyici (tüm galeriler ortak) ---- */
var lb = document.createElement('div');
lb.className = 'lightbox';
lb.innerHTML = '<button class="lb-close" aria-label="Kapat">&times;</button>' +
  '<button class="lb-prev" aria-label="Önceki">&#8249;</button><img alt="">' +
  '<button class="lb-next" aria-label="Sonraki">&#8250;</button><span class="lb-count"></span>';
document.body.appendChild(lb);
var lbImg = lb.querySelector('img'), lbCount = lb.querySelector('.lb-count'), lbList = [], idx = 0;
function show(i) { idx = (i + lbList.length) % lbList.length; lbImg.src = lbList[idx].src; lbImg.alt = lbList[idx].alt || ''; lbCount.textContent = (idx + 1) + ' / ' + lbList.length; }
function openLb(list, i) { lbList = list; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeLb() { lb.classList.remove('open'); if (!document.querySelector('.mview.open')) document.body.style.overflow = ''; }
lb.querySelector('.lb-close').onclick = closeLb;
lb.querySelector('.lb-prev').onclick = function () { show(idx - 1); };
lb.querySelector('.lb-next').onclick = function () { show(idx + 1); };
lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
var tx0 = 0;
lb.addEventListener('touchstart', function (e) { tx0 = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - tx0; if (Math.abs(d) > 40) show(idx + (d < 0 ? 1 : -1)); });

var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
var linkList = links.map(function (a) { return { src: a.href, alt: a.querySelector('img').alt }; });
links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); openLb(linkList, i); }); });

/* ---- Galeri: marka / model ---- */
var mcards = Array.prototype.slice.call(document.querySelectorAll('.mcard'));
var mview = null;
if (mcards.length) {
  /* marka süzgeci */
  document.querySelectorAll('.mfilter .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      document.querySelectorAll('.mfilter .chip').forEach(function (x) { x.classList.toggle('active', x === c); });
      mcards.forEach(function (m) { m.hidden = !!c.dataset.f && m.dataset.brand !== c.dataset.f; });
    });
  });
  mview = document.createElement('div');
  mview.className = 'mview'; mview.setAttribute('role', 'dialog'); mview.setAttribute('aria-modal', 'true');
  mview.innerHTML = '<div class="mview__bar"><div class="mview__t" lang="en"><small></small><b></b><span></span></div>' +
    '<a class="btn btn--wa mview__wa" target="_blank" rel="noopener">Fiyat sor</a><button class="mview__x" aria-label="Kapat">&times;</button></div>' +
    '<div class="mview__body"><div class="mview__grid"></div><div class="mview__end"><p>Bu araç için <span class="accent">kabin fiyatı</span> alın</p>' +
    '<span style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn--ghost mview__page">Model sayfası</a><a class="btn btn--primary mview__quote">Teklif formu</a></span></div></div>';
  document.body.appendChild(mview);
  var mgrid = mview.querySelector('.mview__grid');
  function openModel(card, push) {
    var d = card.dataset, n = +d.n, list = [], html = '', v = d.brand + ' ' + d.name;
    for (var i = 1; i <= n; i++) {
      var base = 'images/modeller/' + d.model + '/' + (i < 10 ? '0' : '') + i;
      list.push({ src: base + '.webp', alt: v + ' kabin ' + i });
      html += '<a href="' + base + '.webp"><img src="' + base + '-k.webp" alt="' + v + ' kabin ' + i + '" loading="lazy"></a>';
    }
    mview.querySelector('.mview__t small').textContent = d.brand;
    mview.querySelector('.mview__t b').textContent = d.name;
    mview.querySelector('.mview__t span').textContent = n + ' fotoğraf';
    mview.querySelector('.mview__wa').href = 'https://wa.me/905070633068?text=' + encodeURIComponent('Merhaba, ' + v + ' için kabin fiyatı almak istiyorum.');
    mview.querySelector('.mview__quote').href = 'teklif.html?arac=' + (d.quote || (d.page ? d.page.replace('-kabin.html', '') : 'diger'));
    var pg = mview.querySelector('.mview__page'); pg.hidden = !d.page; if (d.page) pg.href = d.page;
    mgrid.innerHTML = html;
    Array.prototype.forEach.call(mgrid.querySelectorAll('a'), function (a, i) { a.onclick = function (e) { e.preventDefault(); openLb(list, i); }; });
    mview.querySelector('.mview__body').scrollTop = 0;
    mview.classList.add('open'); document.body.style.overflow = 'hidden';
    if (push) history.pushState({ m: d.model }, '', '#' + d.model);
  }
  function closeModel(fromPop) {
    if (!mview.classList.contains('open')) return;
    mview.classList.remove('open'); document.body.style.overflow = '';
    if (!fromPop && history.state && history.state.m) history.back();
    else if (!fromPop) history.replaceState(null, '', location.pathname);
  }
  mview.querySelector('.mview__x').onclick = function () { closeModel(); };
  mcards.forEach(function (c) { c.addEventListener('click', function (e) { e.preventDefault(); openModel(c, true); }); });
  window.addEventListener('popstate', function () { closeLb(); var h = location.hash.slice(1), c = h && document.querySelector('.mcard[data-model="' + h + '"]'); if (c) openModel(c, false); else closeModel(true); });
  var startCard = location.hash && document.querySelector('.mcard[data-model="' + location.hash.slice(1) + '"]');
  if (startCard) openModel(startCard, false);
}
document.addEventListener('keydown', function (e) {
  if (lb.classList.contains('open')) {
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  } else if (e.key === 'Escape' && mview && mview.classList.contains('open')) closeModel();
});

/* ---- Teklif formu: bilgileri WhatsApp veya e-posta mesajına dönüştürür ---- */
var quote = document.getElementById('quote');
if (quote) {
  var params = new URLSearchParams(location.search);
  ['seri', 'arac'].forEach(function (k) {
    var v = params.get(k);
    if (v && quote.elements[k]) quote.elements[k].value = v;
  });

  quote.addEventListener('submit', function (e) {
    e.preventDefault();
    var via = e.submitter ? e.submitter.value : 'wa';
    function val(name) {
      var el = quote.elements[name];
      if (!el) return '';
      if (el.tagName === 'SELECT') return el.value ? el.options[el.selectedIndex].text : '';
      return el.value.trim();
    }
    var lines = [
      'Merhaba, pickup kabini için teklif almak istiyorum.',
      'Ad Soyad: ' + val('ad'),
      'Telefon: ' + val('tel'),
      'Araç: ' + val('arac') + (val('yil') ? ' ' + val('yil') : ''),
      'Seri: ' + (val('seri') || 'Emin değilim')
    ];
    if (val('sehir')) lines.push('Şehir: ' + val('sehir'));
    if (val('not')) lines.push('Not: ' + val('not'));
    var msg = lines.join('\n');

    if (via === 'mail') {
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Kabin Teklif Talebi') + '&body=' + encodeURIComponent(msg);
    } else {
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank');
    }
  });
}
