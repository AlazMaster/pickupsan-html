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

/* ---- Galeri: tam ekran görüntüleyici ---- */
var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
if (links.length) {
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button class="lb-close" aria-label="Kapat">&times;</button>' +
    '<button class="lb-prev" aria-label="Önceki">&#8249;</button><img alt="">' +
    '<button class="lb-next" aria-label="Sonraki">&#8250;</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), idx = 0;
  function show(i) { idx = (i + links.length) % links.length; lbImg.src = links[idx].href; lbImg.alt = links[idx].querySelector('img').alt; }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; });
  });
  lb.querySelector('.lb-close').onclick = close;
  lb.querySelector('.lb-prev').onclick = function () { show(idx - 1); };
  lb.querySelector('.lb-next').onclick = function () { show(idx + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
}

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
