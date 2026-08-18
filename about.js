/* =========================================================
   STACKLY — about.js
   Page-specific animations for about.html only.
   Does not modify or duplicate anything from script.js —
   this file assumes script.js has already wired up the
   shared preloader / header / hamburger / cursor-glow /
   back-to-top behaviour, and only adds the new, about-page
   specific interactions below.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Hero — staggered line reveal ---------- */
  const maskLines = document.querySelectorAll('.ab-mask-line');
  if (maskLines.length) {
    if (hasGsap) {
      gsap.set(maskLines, { opacity: 0, y: 46 });
      gsap.to(maskLines, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out', delay: 0.3 });
    }
  }
  const heroCue = document.querySelector('.ab-scroll-cue');
  const heroSub = document.querySelector('.ab-hero-sub');
  const heroCta = document.querySelector('.ab-hero-cta');
  const heroCrumb = document.querySelector('.ab-crumb');
  const heroTrustItems = document.querySelectorAll('.ab-trust-item, .ab-trust-divider');
  if (hasGsap && (heroSub || heroCta || heroCrumb || heroCue)) {
    gsap.set([heroCrumb, heroSub, heroCta, heroCue], { opacity: 0, y: 20 });
    gsap.to([heroCrumb, heroSub, heroCta, heroCue], { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.75 });
  }
  if (hasGsap && heroTrustItems.length) {
    gsap.set(heroTrustItems, { opacity: 0, y: 14 });
    gsap.to(heroTrustItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out', delay: 1.3 });
  }

  /* ---------- 1b. Hero — photo stack + badges entrance, cursor parallax ---------- */
  const heroPhotos = document.querySelectorAll('.ab-photo');
  const heroBadges = document.querySelectorAll('.ab-hero-badge');
  if (hasGsap && heroPhotos.length) {
    gsap.to(heroPhotos, { opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power2.out', delay: 0.5 });
  } else {
    heroPhotos.forEach(p => { p.style.opacity = '1'; });
  }
  if (hasGsap && heroBadges.length) {
    gsap.to(heroBadges, { opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power2.out', delay: 1.6 });
  } else {
    heroBadges.forEach(b => { b.style.opacity = '1'; });
  }

  const heroSection = document.getElementById('ab-hero');
  const photoStack = document.getElementById('abPhotoStack');
  const blob1 = document.getElementById('abBlob1');
  const blob2 = document.getElementById('abBlob2');
  const blob3 = document.getElementById('abBlob3');
  if (heroSection && window.matchMedia('(min-width:901px)').matches) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      if (photoStack) {
        const tilt = `perspective(1000px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
        if (hasGsap) gsap.to(photoStack, { duration: 0.7, ease: 'power2.out', transform: tilt });
        else photoStack.style.transform = tilt;
      }
      [[blob1, 26], [blob2, -20], [blob3, 34]].forEach(([blob, speed]) => {
        if (!blob) return;
        blob.style.setProperty('--px', (px * speed) + 'px');
        blob.style.setProperty('--py', (py * speed) + 'px');
      });
    });
    heroSection.addEventListener('mouseleave', () => {
      if (photoStack) {
        const reset = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        if (hasGsap) gsap.to(photoStack, { duration: 0.8, ease: 'power2.out', transform: reset });
        else photoStack.style.transform = reset;
      }
      [blob1, blob2, blob3].forEach(blob => {
        if (!blob) return;
        blob.style.setProperty('--px', '0px');
        blob.style.setProperty('--py', '0px');
      });
    });
  }

  /* ---------- 2. Mission — pinned Ken Burns zoom ---------- */
  const missionSection = document.getElementById('ab-mission');
  const missionMedia = document.getElementById('abMissionMedia');
  const missionContent = document.querySelector('.ab-mission-content');
  if (hasGsap && missionSection && missionMedia) {
    gsap.fromTo(missionMedia.querySelector('img'),
      { scale: 1.25 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: missionSection, start: 'top bottom', end: 'bottom top', scrub: true } }
    );
    if (missionContent) {
      gsap.set(missionContent, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: missionSection, start: 'top 60%',
        onEnter: () => gsap.to(missionContent, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }),
        onLeaveBack: () => gsap.to(missionContent, { opacity: 0, y: 40, duration: 0.5, ease: 'power2.in' })
      });
    }
  } else if (missionContent) {
    missionContent.style.opacity = '1';
  }

  /* ---------- 3. Craftsmanship — drag comparison slider ---------- */
  const compare = document.getElementById('abCompare');
  const compareBefore = document.getElementById('abCompareBefore');
  const compareHandle = document.getElementById('abCompareHandle');
  if (compare && compareBefore && compareHandle) {
    let compareDragging = false;

    function setComparePct(pct) {
      pct = Math.min(Math.max(pct, 0), 100);
      compareBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      compareHandle.style.left = pct + '%';
    }
    function pctFromEvent(clientX) {
      const rect = compare.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }
    setComparePct(50);

    compareHandle.addEventListener('pointerdown', (e) => {
      compareDragging = true;
      compareHandle.setPointerCapture(e.pointerId);
      compare.classList.add('is-dragging');
    });
    compare.addEventListener('pointermove', (e) => {
      if (!compareDragging) return;
      setComparePct(pctFromEvent(e.clientX));
    });
    ['pointerup', 'pointercancel'].forEach(evt => {
      compareHandle.addEventListener(evt, () => { compareDragging = false; compare.classList.remove('is-dragging'); });
    });
    // Click anywhere on the strip to jump the slider there too
    compare.addEventListener('click', (e) => {
      if (e.target.closest('.ab-compare-handle')) return;
      setComparePct(pctFromEvent(e.clientX));
    });

    if (hasGsap) {
      gsap.from(compare, {
        opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: compare, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }
  }

  /* ---------- 4. Stats — radial progress rings + count-up ---------- */
  const ringStats = document.querySelectorAll('.ab-ring-stat');
  if (ringStats.length) {
    const CIRC = 2 * Math.PI * 52; // matches r=52 in the SVG markup
    ringStats.forEach(stat => {
      const fillCircle = stat.querySelector('.ab-ring-fill');
      const numEl = stat.querySelector('.ab-ring-num');
      const value = parseFloat(stat.dataset.value);
      const max = parseFloat(stat.dataset.max) || 100;
      const suffix = stat.dataset.suffix || '';
      const scale = parseFloat(stat.dataset.scale) || 1; // for decimal displays like 4.9 or 1.2
      const pct = Math.min(value / max, 1);

      if (fillCircle) {
        fillCircle.style.strokeDasharray = String(CIRC);
        fillCircle.style.strokeDashoffset = String(CIRC);
      }

      const animateStat = () => {
        if (fillCircle) {
          if (hasGsap) {
            gsap.to(fillCircle, { strokeDashoffset: CIRC * (1 - pct), duration: 1.4, ease: 'power3.out' });
          } else {
            fillCircle.style.strokeDashoffset = String(CIRC * (1 - pct));
          }
        }
        if (numEl) {
          const obj = { v: 0 };
          if (hasGsap) {
            gsap.to(obj, {
              v: value, duration: 1.4, ease: 'power2.out',
              onUpdate: () => { numEl.textContent = (scale > 1 ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix; }
            });
          } else {
            numEl.textContent = value + suffix;
          }
        }
      };

      if (hasGsap) {
        ScrollTrigger.create({
          trigger: stat, start: 'top 85%', once: true,
          onEnter: animateStat
        });
      } else {
        animateStat();
      }
    });
  }

  /* ---------- 5. Values — SVG icon draw-in ---------- */
  const valueCards = document.querySelectorAll('.ab-value-card');
  if (valueCards.length) {
    valueCards.forEach((card, i) => {
      const paths = card.querySelectorAll('.ab-value-icon path, .ab-value-icon circle');
      paths.forEach(p => {
        const len = p.getTotalLength ? p.getTotalLength() : 100;
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
      });
      if (hasGsap) {
        gsap.set(card, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: card, start: 'top 88%', once: true,
          onEnter: () => {
            gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
            gsap.to(paths, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut', stagger: 0.08, delay: 0.15 });
          }
        });
      } else {
        card.style.opacity = '1';
        paths.forEach(p => { p.style.strokeDashoffset = '0'; });
      }
    });
  }

  /* ---------- 6. Team — magnetic tilt + duotone reveal cards ---------- */
  const teamCards = document.querySelectorAll('.ab-team-card');
  teamCards.forEach((card, i) => {
    if (hasGsap) {
      gsap.set(card, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: card, start: 'top 90%', once: true,
        onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: (i % 4) * 0.08 })
      });
    }
    if (window.matchMedia('(min-width:901px)').matches) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const tilt = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-4px)`;
        if (hasGsap) gsap.to(card, { duration: 0.4, ease: 'power2.out', transform: tilt });
        else card.style.transform = tilt;
      });
      card.addEventListener('mouseleave', () => {
        const reset = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)';
        if (hasGsap) gsap.to(card, { duration: 0.5, ease: 'power2.out', transform: reset });
        else card.style.transform = reset;
      });
    }
  });

  /* ---------- 7. Journey — diagonal wipe milestone images ---------- */
  const journeyRows = document.querySelectorAll('.ab-journey-row');
  if (journeyRows.length && hasGsap) {
    journeyRows.forEach((row, i) => {
      const media = row.querySelector('.ab-journey-media');
      const text = row.querySelector('.ab-journey-text');
      const fromRight = row.classList.contains('ab-journey-reverse');

      if (media) gsap.set(media, { clipPath: fromRight ? 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' : 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)' });
      if (text) gsap.set(text, { opacity: 0, x: fromRight ? 30 : -30 });

      ScrollTrigger.create({
        trigger: row, start: 'top 82%', once: true,
        onEnter: () => {
          if (media) gsap.to(media, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1.1, ease: 'power4.out' });
          if (text) gsap.to(text, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 });
        }
      });
    });
  } else {
    journeyRows.forEach(row => {
      const media = row.querySelector('.ab-journey-media');
      const text = row.querySelector('.ab-journey-text');
      if (media) media.style.clipPath = 'none';
      if (text) text.style.opacity = '1';
    });
  }

  /* ---------- 8. Careers CTA — parallax bg, floating badges, magnetic button ---------- */
  const careersSection = document.getElementById('ab-careers');
  const careersMedia = document.getElementById('abCareersMedia');
  if (hasGsap && careersSection && careersMedia) {
    gsap.fromTo(careersMedia, { yPercent: -12 }, {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: careersSection, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  const badges = document.querySelectorAll('.ab-badge');
  if (badges.length && hasGsap) {
    gsap.set(badges, { opacity: 0, y: 24, scale: 0.9 });
    ScrollTrigger.create({
      trigger: '.ab-careers-badges', start: 'top 85%', once: true,
      onEnter: () => gsap.to(badges, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.6)' })
    });
  } else {
    badges.forEach(b => { b.style.opacity = '1'; });
  }

  const magWrap = document.getElementById('abMagneticWrap');
  const magBtn = document.getElementById('abMagneticBtn');
  if (magWrap && magBtn && window.matchMedia('(min-width:901px)').matches) {
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