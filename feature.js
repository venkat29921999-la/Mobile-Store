/* =========================================================
   STACKLY — feature.js
   Page-specific animations for feature.html only.
   Assumes script.js has already wired up the shared
   preloader / header / hamburger / cursor-glow / back-to-top
   / [data-aos] reveal behaviour — only new interactions for
   the Features page are added below.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const isDesktop = () => window.matchMedia('(min-width:901px)').matches;

  /* ---------- 1. Hero — cursor spotlight title + orbit stage ---------- */
  const heroTitle = document.getElementById('ftHeroTitle');
  if (heroTitle && isDesktop()) {
    heroTitle.addEventListener('mousemove', (e) => {
      const rect = heroTitle.getBoundingClientRect();
      heroTitle.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
      heroTitle.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
    });
  }

  if (hasGsap) {
    gsap.set(['.ft-crumb', '.ft-hero .eyebrow', '.ft-hero-title', '.ft-hero-sub', '.ft-hero-cta'], { opacity: 0, y: 24 });
    gsap.to(['.ft-crumb', '.ft-hero .eyebrow', '.ft-hero-title', '.ft-hero-sub', '.ft-hero-cta'], {
      opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', delay: 0.3
    });
    gsap.from('.ft-orbit-stage', { opacity: 0, scale: 0.85, duration: 1, ease: 'power3.out', delay: 0.9 });
  }

  const ftTrustItems = document.querySelectorAll('.ft-trust-item, .ft-trust-divider');
  if (hasGsap && ftTrustItems.length) {
    gsap.set(ftTrustItems, { opacity: 0, y: 14 });
    gsap.to(ftTrustItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out', delay: 1.3 });
  }

  /* ---------- 2. Bento grid — staggered reveal + 3D tilt ---------- */
  const bentoCards = document.querySelectorAll('.ft-bento-card');
  if (bentoCards.length && isDesktop()) {
    bentoCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const tilt = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-4px)`;
        if (hasGsap) gsap.to(card, { duration: 0.4, ease: 'power2.out', transform: tilt });
        else card.style.transform = tilt;
      });
      card.addEventListener('mouseleave', () => {
        const reset = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)';
        if (hasGsap) gsap.to(card, { duration: 0.5, ease: 'power2.out', transform: reset });
        else card.style.transform = reset;
      });
    });
  }

  /* ---------- 3. Deep dive tabs — sliding indicator + spec bars ---------- */
  const tabBtns = document.querySelectorAll('.ft-tab-btn');
  const tabIndicator = document.getElementById('ftTabIndicator');
  const tabPanels = document.querySelectorAll('.ft-tab-panel');

  function moveIndicator(btn) {
    if (!tabIndicator) return;
    tabIndicator.style.width = btn.offsetWidth + 'px';
    tabIndicator.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
  }

  function fillBars(panel) {
    panel.querySelectorAll('.ft-bar-fill').forEach(bar => {
      const pct = bar.dataset.pct || 0;
      bar.style.width = '0%';
      requestAnimationFrame(() => { bar.style.width = pct + '%'; });
    });
  }

  if (tabBtns.length) {
    const activeBtn = document.querySelector('.ft-tab-btn.active');
    if (activeBtn) {
      // Wait a tick so layout/fonts are settled before measuring offsets.
      requestAnimationFrame(() => moveIndicator(activeBtn));
      const activePanel = document.querySelector('.ft-tab-panel.active');
      if (activePanel) fillBars(activePanel);
    }
    window.addEventListener('resize', () => {
      const current = document.querySelector('.ft-tab-btn.active');
      if (current) moveIndicator(current);
    });

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        moveIndicator(btn);

        const targetId = btn.dataset.tab;
        tabPanels.forEach(panel => {
          if (panel.dataset.panel === targetId) {
            panel.classList.add('active');
            fillBars(panel);
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  }

  /* ---------- 4. Under the hood — pinned horizontal scroll ---------- */
  const hPin = document.getElementById('ftHorizontalPin');
  const hViewport = document.getElementById('ftHViewport');
  const hTrack = document.getElementById('ftHTrack');
  const hProgressFill = document.getElementById('ftHProgressFill');

  if (hPin && hViewport && hTrack && hasGsap && isDesktop()) {
    let scrollDistance = 0;
    ScrollTrigger.create({
      trigger: hPin,
      start: 'top top',
      end: () => {
        scrollDistance = Math.max(hTrack.scrollWidth - hViewport.clientWidth, 0);
        return '+=' + (scrollDistance + 400);
      },
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(hTrack, { x: -scrollDistance * self.progress });
        if (hProgressFill) hProgressFill.style.width = (self.progress * 100) + '%';
      }
    });
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------- 5. Spec sheet accordion — expand/collapse + gauge fill ---------- */
  const accItems = document.querySelectorAll('.ft-acc-item');
  accItems.forEach(item => {
    const head = item.querySelector('.ft-acc-head');
    const gauge = item.querySelector('.ft-acc-gauge');

    function animateGauge() {
      if (!gauge || gauge.dataset.animated) return;
      const pct = parseFloat(gauge.dataset.pct) || 0;
      const fill = gauge.querySelector('.ft-gauge-fill');
      if (fill) {
        const circumference = 264; // 2 * PI * 42
        fill.style.strokeDashoffset = String(circumference * (1 - pct / 100));
      }
      gauge.dataset.animated = 'true';
    }

    if (item.classList.contains('active')) animateGauge();

    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      accItems.forEach(other => {
        other.classList.remove('active');
        other.querySelector('.ft-acc-head').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('active');
        head.setAttribute('aria-expanded', 'true');
        animateGauge();
      }
    });
  });

  /* ---------- 6. Comparison table — row reveal on scroll ---------- */
  const compareRows = document.querySelectorAll('.ft-row');
  if (compareRows.length && 'IntersectionObserver' in window) {
    const rowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          rowObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    compareRows.forEach(row => rowObserver.observe(row));
  } else {
    compareRows.forEach(row => row.classList.add('in-view'));
  }

  /* ---------- 7. 360 reel — scroll-driven (desktop) + drag (all) ---------- */
  const reelPin = document.getElementById('ftReelPin');
  const reelStage = document.getElementById('ftReelStage');
  const reelFrames = document.querySelectorAll('.ft-reel-frame');
  const reelDeg = document.getElementById('ftReelDeg');
  const reelHint = document.getElementById('ftReelDragHint');
  const reelCallouts = document.querySelectorAll('.ft-reel-callout');
  const frameCount = reelFrames.length;

  function setReelFrame(index, degrees) {
    const clamped = ((index % frameCount) + frameCount) % frameCount;
    reelFrames.forEach(f => f.classList.toggle('active', parseInt(f.dataset.frame, 10) === clamped));
    if (reelDeg) reelDeg.textContent = Math.round(degrees) % 360 + '°';
    reelCallouts.forEach(c => c.classList.toggle('show', parseInt(c.dataset.at, 10) === clamped));
  }

  if (frameCount) {
    // Scroll-driven rotation, desktop only.
    if (reelPin && hasGsap && isDesktop()) {
      ScrollTrigger.create({
        trigger: reelPin,
        start: 'top top',
        end: '+=1400',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const degrees = self.progress * 360;
          const frameIndex = Math.floor((degrees / 360) * frameCount);
          setReelFrame(frameIndex, degrees);
        }
      });
    }

    // Drag-to-rotate, works on both desktop and touch as a bonus interaction.
    if (reelStage) {
      let dragging = false;
      let startX = 0;
      let startFrame = 0;
      let currentDeg = 0;

      const onDown = (clientX) => {
        dragging = true;
        startX = clientX;
        startFrame = currentDeg;
        if (reelHint) reelHint.style.opacity = '0';
      };
      const onMove = (clientX) => {
        if (!dragging) return;
        const delta = clientX - startX;
        currentDeg = startFrame + delta * 0.6;
        const frameIndex = Math.round((currentDeg / 360) * frameCount);
        setReelFrame(frameIndex, currentDeg);
      };
      const onUp = () => { dragging = false; };

      reelStage.addEventListener('pointerdown', (e) => { reelStage.setPointerCapture(e.pointerId); onDown(e.clientX); });
      reelStage.addEventListener('pointermove', (e) => onMove(e.clientX));
      reelStage.addEventListener('pointerup', onUp);
      reelStage.addEventListener('pointercancel', onUp);
    }
  }

  /* ---------- 8. Closing CTA — magnetic button ---------- */
  const magWrap = document.getElementById('ftMagWrap');
  const magBtn = document.getElementById('ftMagBtn');
  if (magWrap && magBtn && isDesktop()) {
    magWrap.addEventListener('mousemove', (e) => {
      const rect = magWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      if (hasGsap) gsap.to(magBtn, { x, y, duration: 0.4, ease: 'power2.out' });
      else magBtn.style.transform = `translate(${x}px, ${y}px)`;
    });
    magWrap.addEventListener('mouseleave', () => {
      if (hasGsap) gsap.to(magBtn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      else magBtn.style.transform = 'translate(0, 0)';
    });
  }

});