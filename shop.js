/* =========================================================
   STACKLY — shop.js
   Page-specific animations for shop.html only.
   Does not modify or duplicate anything from script.js or
   about.js — assumes script.js has already wired up the
   shared preloader / header / hamburger / cursor-glow /
   back-to-top / counters, and only adds new, shop-page
   specific interactions below.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Hero — ambient spotlight glow + depth-parallax product cluster + text scramble ---------- */
  const spHero = document.getElementById('sp-hero');
  const spSpotlight = document.getElementById('spHeroSpotlight');
  const spShowcase = document.getElementById('spHeroShowcase');
  const spClusterEls = spShowcase ? Array.from(spShowcase.querySelectorAll('[data-depth]')) : [];

  if (spHero && spSpotlight) {
    if (window.matchMedia('(min-width:701px)').matches) {
      spHero.addEventListener('mousemove', (e) => {
        const rect = spHero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        spSpotlight.style.setProperty('--sx', x + '%');
        spSpotlight.style.setProperty('--sy', y + '%');

        if (spShowcase && spClusterEls.length) {
          const srect = spShowcase.getBoundingClientRect();
          const px = (e.clientX - srect.left) / srect.width - 0.5;
          const py = (e.clientY - srect.top) / srect.height - 0.5;
          spClusterEls.forEach(el => {
            const depth = parseFloat(el.dataset.depth) || 20;
            const tx = px * depth;
            const ty = py * depth;
            if (hasGsap) gsap.to(el, { duration: 0.6, ease: 'power2.out', x: tx, y: ty });
            else el.style.transform = `translate(${tx}px, ${ty}px)`;
          });
        }
      });
      spHero.addEventListener('mouseleave', () => {
        spSpotlight.style.setProperty('--sx', '72%');
        spSpotlight.style.setProperty('--sy', '45%');
        spClusterEls.forEach(el => {
          if (hasGsap) gsap.to(el, { duration: 0.8, ease: 'power2.out', x: 0, y: 0 });
          else el.style.transform = 'translate(0,0)';
        });
      });
    }
  }

  const scrambleEl = document.getElementById('spScrambleTitle');
  if (scrambleEl) {
    const finalText = scrambleEl.dataset.text || scrambleEl.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let frame = 0;
    const totalFrames = 26;

    function scrambleStep() {
      let out = '';
      const revealCount = Math.floor((frame / totalFrames) * finalText.length);
      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        if (ch === ' ') { out += ' '; continue; }
        if (i < revealCount) out += ch;
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      scrambleEl.textContent = out;
      frame++;
      if (frame <= totalFrames) requestAnimationFrame(() => setTimeout(scrambleStep, 28));
      else scrambleEl.textContent = finalText;
    }
    scrambleEl.textContent = '';
    setTimeout(scrambleStep, 500);
  }

  /* Hero quick-filter pills jump to grid and apply filter */
  document.querySelectorAll('.sp-pill[data-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      const f = pill.dataset.filter;
      const btn = document.querySelector(`.sp-filter[data-filter="${f}"]`);
      if (btn) setTimeout(() => btn.click(), 550);
    });
  });

  /* ---------- 2. Filter bar — liquid morph indicator + product filtering ---------- */
  const filters = Array.from(document.querySelectorAll('.sp-filter'));
  const liquid = document.getElementById('spFilterLiquid');
  const cards = Array.from(document.querySelectorAll('.sp-card'));
  const resultCount = document.getElementById('spResultCount');
  const spEmpty = document.getElementById('spEmpty');
  const sortSelect = document.getElementById('spSort');
  const spGrid = document.getElementById('spGrid');

  function moveLiquid(btn) {
    if (!liquid || !btn) return;
    liquid.style.width = btn.offsetWidth + 'px';
    liquid.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
  }

  function rollNumber(el, value) {
    if (!el) return;
    if (hasGsap) {
      const obj = { v: parseInt(el.textContent) || 0 };
      gsap.to(obj, { v: value, duration: 0.5, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v); } });
    } else {
      el.textContent = value;
    }
  }

  function applyFilter(filterVal) {
    let visibleCount = 0;
    cards.forEach((card, i) => {
      const match = filterVal === 'all' || card.dataset.category === filterVal;
      if (match) {
        card.classList.remove('sp-card-hidden');
        visibleCount++;
        if (hasGsap) {
          gsap.fromTo(card, { opacity: 0, y: 24, rotateX: -12 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.5, ease: 'power2.out', delay: i * 0.04 });
        }
      } else {
        card.classList.add('sp-card-hidden');
      }
    });
    rollNumber(resultCount, visibleCount);
    if (spEmpty) spEmpty.classList.toggle('is-visible', visibleCount === 0);
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      moveLiquid(btn);
      applyFilter(btn.dataset.filter);
    });
  });

  window.addEventListener('load', () => {
    const activeBtn = document.querySelector('.sp-filter.active');
    moveLiquid(activeBtn);
  });
  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.sp-filter.active');
    moveLiquid(activeBtn);
  });

  if (sortSelect && spGrid) {
    sortSelect.addEventListener('change', () => {
      const mode = sortSelect.value;
      const sorted = cards.slice().sort((a, b) => {
        if (mode === 'price-asc') return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        if (mode === 'price-desc') return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        if (mode === 'rating') return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        return 0;
      });
      sorted.forEach(card => spGrid.appendChild(card));
      if (hasGsap) {
        gsap.fromTo(sorted, { opacity: 0.4, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out' });
      }
    });
  }

  /* ---------- 3. Product grid — scroll reveal + wishlist burst + quick add ---------- */
  cards.forEach((card, i) => {
    if (hasGsap) {
      gsap.set(card, { opacity: 0, y: 40, rotateX: -14, transformPerspective: 800 });
      ScrollTrigger.create({
        trigger: card, start: 'top 92%', once: true,
        onEnter: () => gsap.to(card, { opacity: 1, y: 0, rotateX: 0, duration: 0.65, ease: 'power3.out', delay: (i % 4) * 0.08 })
      });
    }
  });

  document.querySelectorAll('.sp-wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('is-active');
      btn.classList.remove('bursting');
      void btn.offsetWidth;
      if (btn.classList.contains('is-active')) btn.classList.add('bursting');
    });
  });

  document.querySelectorAll('.sp-quickadd .add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (hasGsap) {
        gsap.fromTo(btn, { scale: 1 }, { scale: 0.8, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' });
      }
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-check');
        setTimeout(() => { icon.classList.remove('fa-check'); icon.classList.add('fa-plus'); }, 1400);
      }
    });
  });

  /* ---------- 4. Flash deal — split-flap countdown ---------- */
  function buildFlap(elId) {
    const el = document.getElementById(elId);
    if (!el) return null;
    return {
      el,
      top: el.querySelector('.sp-flap-top span'),
      bottom: el.querySelector('.sp-flap-bottom span'),
      foldTop: el.querySelector('.sp-flap-fold-top span'),
      foldBottom: el.querySelector('.sp-flap-fold-bottom span'),
      current: null
    };
  }

  const flapHours = buildFlap('spFlapHours');
  const flapMinutes = buildFlap('spFlapMinutes');
  const flapSeconds = buildFlap('spFlapSeconds');

  function setFlap(flap, value) {
    if (!flap) return;
    const val = String(value).padStart(2, '0');
    if (flap.current === val) return;
    const prev = flap.current === null ? val : flap.current;
    flap.current = val;
    flap.top.textContent = val;
    flap.foldTop.textContent = prev;
    flap.bottom.textContent = val;
    flap.foldBottom.textContent = val;
    flap.el.classList.remove('is-flipping');
    void flap.el.offsetWidth;
    flap.el.classList.add('is-flipping');
  }

  // Countdown target: rolls to a fresh 6-hour window if the stored one has expired.
  let dealEnd = parseInt(localStorage.getItem('orbixDealEnd') || '0', 10);
  if (!dealEnd || dealEnd < Date.now()) {
    dealEnd = Date.now() + (6 * 60 * 60 * 1000);
    try { localStorage.setItem('orbixDealEnd', String(dealEnd)); } catch (e) {}
  }

  function tickCountdown() {
    let diff = Math.max(0, dealEnd - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setFlap(flapHours, h);
    setFlap(flapMinutes, m);
    setFlap(flapSeconds, s);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- 5. New arrivals — waterfall (CSS-driven; JS only for reveal) ---------- */
  const spWaterfall = document.getElementById('spWaterfall');
  if (spWaterfall && hasGsap) {
    gsap.set(spWaterfall, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: spWaterfall, start: 'top 85%', once: true,
      onEnter: () => gsap.to(spWaterfall, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
    });
  }

  /* ---------- 6. Build a bundle — configurator ---------- */
  const configSteps = Array.from(document.querySelectorAll('.sp-config-step'));
  const configDots = Array.from(document.querySelectorAll('.sp-config-dot'));
  const configPrev = document.getElementById('spConfigPrev');
  const configNext = document.getElementById('spConfigNext');
  const configFill = document.getElementById('spConfigProgressFill');
  const configTotalEl = document.getElementById('spConfigTotal');
  const configImgs = Array.from(document.querySelectorAll('.sp-config-img'));
  let configStep = 1;
  const totalSteps = configSteps.length || 3;

  const prices = { case: 39, charger: 49, cable: 19 };

  function updateTotal() {
    const total = prices.case + prices.charger + prices.cable;
    rollNumber(configTotalEl, total);
  }

  function goToStep(n) {
    configStep = Math.min(Math.max(n, 1), totalSteps);
    configSteps.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === configStep));
    configDots.forEach(d => d.classList.toggle('active', parseInt(d.dataset.goto) === configStep));
    if (configFill) configFill.style.width = (configStep / totalSteps * 100) + '%';
    if (configPrev) configPrev.disabled = configStep === 1;
    if (configNext) {
      configNext.innerHTML = configStep === totalSteps
        ? '<span>Done</span><i class="fa-solid fa-check"></i>'
        : 'Next <i class="fa-solid fa-arrow-right"></i>';
    }
  }
  goToStep(1);
  updateTotal();

  if (configNext) configNext.addEventListener('click', () => {
    if (configStep < totalSteps) goToStep(configStep + 1);
    else {
      const addBtn = document.getElementById('spConfigAdd');
      if (addBtn && hasGsap) gsap.fromTo(addBtn, { scale: 1 }, { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1 });
    }
  });
  if (configPrev) configPrev.addEventListener('click', () => goToStep(configStep - 1));
  configDots.forEach(dot => dot.addEventListener('click', () => goToStep(parseInt(dot.dataset.goto))));

  document.querySelectorAll('.sp-swatches').forEach(group => {
    const slot = group.dataset.slot;
    group.querySelectorAll('.sp-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        group.querySelectorAll('.sp-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        prices[slot] = parseFloat(swatch.dataset.price) || 0;
        updateTotal();

        // ripple click effect
        const ripple = document.createElement('span');
        ripple.className = 'sp-ripple';
        const rect = swatch.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        swatch.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);

        // cross-fade image swap for case slot
        if (slot === 'case') {
          const idx = parseInt(swatch.dataset.index) || 0;
          configImgs.forEach((img, i) => img.classList.toggle('active', i === idx));
        }
      });
    });
  });

  /* ---------- 7. Ratings & trust — breakdown bars + badge pop + count-up ---------- */
  const trustSection = document.getElementById('sp-trust');
  const trustNumber = document.getElementById('spTrustNumber');
  const barRows = document.querySelectorAll('.sp-bar-row');
  const badgePops = document.querySelectorAll('.sp-badge-pop');

  if (trustSection) {
    const runTrust = () => {
      if (trustNumber) {
        if (hasGsap) {
          const obj = { v: 0 };
          gsap.to(obj, { v: 4.9, duration: 1.3, ease: 'power2.out', onUpdate: () => { trustNumber.textContent = obj.v.toFixed(1); } });
        } else {
          trustNumber.textContent = '4.9';
        }
      }
      barRows.forEach((row, i) => {
        const fill = row.querySelector('.sp-bar-fill');
        const pct = row.dataset.pct;
        setTimeout(() => { if (fill) fill.style.width = pct + '%'; }, i * 110);
      });
      badgePops.forEach((b, i) => {
        setTimeout(() => b.classList.add('is-in'), 300 + i * 120);
      });
    };
    if (hasGsap) {
      ScrollTrigger.create({ trigger: trustSection, start: 'top 75%', once: true, onEnter: runTrust });
    } else {
      runTrust();
    }
  }

  /* ---------- 8. Shop CTA — morphing SVG blob loop + ripple + form ---------- */
  const blobPath = document.getElementById('spCtaBlobPath');
  if (blobPath) {
    const blobShapes = [
      'M300,60 C400,60 520,140 520,280 C520,420 410,540 280,540 C150,540 60,430 80,300 C100,170 200,60 300,60 Z',
      'M290,80 C420,60 540,160 500,290 C470,400 380,520 260,510 C140,500 60,400 70,280 C80,160 160,100 290,80 Z',
      'M310,70 C430,90 510,190 490,310 C470,430 370,520 250,500 C130,480 70,370 90,260 C110,150 190,50 310,70 Z',
      'M300,60 C400,60 520,140 520,280 C520,420 410,540 280,540 C150,540 60,430 80,300 C100,170 200,60 300,60 Z'
    ];
    let shapeIndex = 0;
    if (hasGsap) {
      function morphBlob() {
        shapeIndex = (shapeIndex + 1) % blobShapes.length;
        gsap.to(blobPath, {
          duration: 6, ease: 'sine.inOut',
          attr: { d: blobShapes[shapeIndex] },
          onComplete: morphBlob
        });
      }
      gsap.set(blobPath, { attr: { d: blobShapes[0] } });
      morphBlob();
      gsap.to('.sp-cta-blob', { rotate: 360, duration: 40, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    } else {
      blobPath.setAttribute('d', blobShapes[0]);
    }
  }

  const ctaForm = document.getElementById('spCtaForm');
  const ctaMsg = document.getElementById('spCtaMsg');
  if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = ctaForm.querySelector('.sp-ripple-btn');
      if (btn) {
        const ripple = document.createElement('span');
        ripple.className = 'sp-ripple';
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.4;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 750);
      }
      if (ctaMsg) {
        ctaMsg.textContent = "You're on the list — we'll email you the moment it's back.";
        ctaMsg.style.opacity = '1';
      }
      ctaForm.reset();
    });
  }

});