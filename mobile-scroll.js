/* Phone scroll choreography (max-width 719px). Layout lives in mobile.css; this adds the motion.
   [data-hscroll]          card rows pin under the header and slide sideways as the page scrolls
   [data-mstack]           rows stacked by mobile.css rise in as they enter
   [data-mstack=timeline]  the line fills and each step lights up as you pass it
   Desktop and tablet are left exactly as exported. */
(function () {
  var PHONE = '(max-width: 719px)';
  var BAR = 80; // fixed booking bar along the bottom of the screen on phones
  var PACE = 1.5; // page scroll per pixel of sideways travel: about one flick per card
  var tries = 0;

  function boot() {
    // Wait for the page runtime to render into #dc-root; the raw template is replaced on render.
    var ready = window.gsap && window.ScrollTrigger && document.querySelector('#dc-root [data-hscroll], #dc-root [data-mstack]');
    if (!ready) { if (tries++ < 150) setTimeout(boot, 60); return; }
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });

    var headerH = function () {
      var h = document.querySelector('[data-sc-name="Site Header"]');
      return h ? h.getBoundingClientRect().height : 0;
    };

    gsap.matchMedia().add({ phone: PHONE, reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
      if (!ctx.conditions.phone) return;
      var reduce = ctx.conditions.reduce;
      var switchedOn = [], fitters = [];

      if (!reduce) gsap.utils.toArray('#dc-root [data-hscroll]').forEach(function (wrap) {
        var row = wrap.querySelector('[data-hrow]');
        if (!row || !row.lastElementChild) return;
        wrap.setAttribute('data-hscroll-on', wrap.getAttribute('data-hscroll') || '');
        row.style.position = 'relative';
        switchedOn.push(wrap);
        var dist = function () {
          var last = row.lastElementChild;
          var padR = parseFloat(getComputedStyle(row).paddingRight) || 0;
          return Math.max(0, last.offsetLeft + last.offsetWidth + padR - row.clientWidth);
        };
        if (dist() < 8) { wrap.removeAttribute('data-hscroll-on'); return; }
        // Short screens: trim the photos so the whole card sits between the header and the booking bar.
        // Computed from the photo's designed shape, so it gives the same answer on every refresh.
        var photos = Array.prototype.map.call(row.children, function (c) { return c.firstElementChild; });
        var saved = photos.map(function (d) { return d.style.getPropertyValue('aspect-ratio'); });
        var shape = String(getComputedStyle(photos[0]).aspectRatio).match(/([\d.]+)\s*\/\s*([\d.]+)/);
        var hPerW = shape ? parseFloat(shape[2]) / parseFloat(shape[1]) : 0;
        var restore = function () {
          photos.forEach(function (d, i) {
            d.style.removeProperty('height');
            if (saved[i]) d.style.setProperty('aspect-ratio', saved[i]); else d.style.removeProperty('aspect-ratio');
          });
        };
        var fit = function () {
          if (!hPerW) return;
          var natural = photos[0].offsetWidth * hPerW;
          var rest = wrap.offsetHeight - photos[0].offsetHeight; // text under the photo, plus the progress line
          var h = Math.max(120, Math.min(natural, window.innerHeight - headerH() - BAR - 20 - rest));
          if (h >= natural - 1) { restore(); return; }
          photos.forEach(function (d) { d.style.setProperty('height', Math.round(h) + 'px'); d.style.setProperty('aspect-ratio', 'auto', 'important'); });
        };
        fit();
        ST.addEventListener('refreshInit', fit);
        fitters.push(function () { ST.removeEventListener('refreshInit', fit); restore(); });
        var fill = wrap.querySelector('[data-hprog] > i');
        var top = function () {
          var hh = headerH();
          var room = window.innerHeight - hh - BAR - wrap.offsetHeight;
          return Math.round(hh + Math.max(6, room / 2));
        };
        var slide = gsap.to(row, {
          x: function () { return -dist(); },
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: function () { return 'top ' + top() + 'px'; },
            end: function () { return '+=' + Math.round(dist() * PACE); },
            pin: true,
            scrub: 0.5,
            snap: { snapTo: 1 / (row.children.length - 1), inertia: false, duration: { min: 0.2, max: 0.5 }, delay: 0.08, ease: 'power1.inOut' }, // nearest card, never flung past one
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: function (self) { if (fill) fill.style.transform = 'scaleX(' + self.progress.toFixed(3) + ')'; }
          }
        });
        // Cards that start off to the right ease in as they slide onto the screen.
        Array.prototype.forEach.call(row.children, function (card, i) {
          if (card.offsetLeft + card.offsetWidth * 0.5 < row.clientWidth) return;
          gsap.fromTo(card, { opacity: 0.25, y: 34, rotation: i % 2 ? -2.5 : 2.5 }, {
            opacity: 1, y: 0, rotation: 0, ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 100%', end: 'left 62%', scrub: true }
          });
        });
      });

      gsap.utils.toArray('#dc-root [data-mstack]').forEach(function (list) {
        var kind = list.getAttribute('data-mstack');
        var items = Array.prototype.slice.call(list.children);

        if (kind === 'timeline') {
          ST.create({
            trigger: list, start: 'top 62%', end: 'bottom 62%',
            onUpdate: function (self) { list.style.setProperty('--fill', self.progress.toFixed(3)); },
            onLeave: function () { list.style.setProperty('--fill', '1'); },
            onLeaveBack: function () { list.style.setProperty('--fill', '0'); }
          });
          items.forEach(function (li) {
            ST.create({
              trigger: li, start: 'top 62%', end: 'max',
              onToggle: function (self) { if (self.isActive) li.setAttribute('data-on', ''); else li.removeAttribute('data-on'); }
            });
            if (!reduce) gsap.from(li, { opacity: 0, x: -18, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 90%' } });
          });
          return;
        }

        if (reduce) return;
        items.forEach(function (el, i) {
          var from = { opacity: 0, y: kind === 'grid' ? 50 : 70, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } };
          if (kind === 'grid') from.delay = (i % 2) * 0.08;
          if (kind === 'list') from.rotation = i % 2 ? 2 : -2;
          gsap.from(el, from);
        });
      });

      return function () {
        fitters.forEach(function (undo) { undo(); });
        switchedOn.forEach(function (w) {
          w.removeAttribute('data-hscroll-on');
          var r = w.querySelector('[data-hrow]'); if (r) r.style.position = '';
        });
      };
    });

    // Re-measure once fonts and images settle, and when content above a pinned row changes height
    // (the Client Results filter does this).
    var lastH = 0, t = 0;
    var refresh = function () { ST.refresh(); lastH = document.documentElement.scrollHeight; };
    window.addEventListener('load', refresh, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        clearTimeout(t);
        t = setTimeout(function () {
          if (Math.abs(document.documentElement.scrollHeight - lastH) > 2) refresh();
        }, 200);
      }).observe(document.body);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
