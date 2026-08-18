/* =========================================================
   STACKLY — contact.js
   Page-specific animations for contact.html only.
   Assumes script.js has already wired up the shared
   preloader / header / hamburger / cursor-glow / back-to-top
   / [data-aos] reveal behaviour — only new interactions for
   the Contact page are added below.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const isDesktop = () => window.matchMedia('(min-width:901px)').matches;

  /* ---------- 1. Hero — fade-up title + magnetic floating chips ---------- */

  if (hasGsap) {
    gsap.set(['.ct-crumb', '.ct-status-pill', '.ct-hero-title', '.ct-hero-sub', '.ct-hero-cta'], { opacity: 0, y: 22 });
    gsap.to(['.ct-crumb', '.ct-status-pill', '.ct-hero-title', '.ct-hero-sub', '.ct-hero-cta'], {
      opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.3
    });
    gsap.from('.ct-hero-photo', { opacity: 0, scale: 0.92, duration: 1, ease: 'power3.out', delay: 0.5 });
    gsap.from('.ct-chip-float', { opacity: 0, y: 16, duration: 0.7, stagger: 0.15, ease: 'back.out(1.6)', delay: 1.1 });
  } else {
    document.querySelectorAll('.ct-chip-float, .ct-hero-photo').forEach(el => { el.style.opacity = '1'; });
  }

  // Magnetic pull on floating chips (desktop only) — each chip drifts toward
  // the cursor within a radius, and eases back to its resting spot otherwise.
  const heroVisual = document.getElementById('ctHeroVisual');
  const floatChips = document.querySelectorAll('.ct-chip-float');
  if (heroVisual && floatChips.length && isDesktop()) {
    const MAX_PULL = 16;
    const RADIUS = 220;
    heroVisual.addEventListener('mousemove', (e) => {
      floatChips.forEach(chip => {
        const rect = chip.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < RADIUS) {
          const pull = (1 - dist / RADIUS) * MAX_PULL;
          const angle = Math.atan2(dy, dx);
          const tx = Math.cos(angle) * pull;
          const ty = Math.sin(angle) * pull;
          chip.style.transform = `translate(${tx}px, ${ty}px)`;
        } else {
          chip.style.transform = 'translate(0,0)';
        }
      });
    });
    heroVisual.addEventListener('mouseleave', () => {
      floatChips.forEach(chip => { chip.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------- 2. Channels — 3D flip cards ---------- */
  const flipCards = document.querySelectorAll('.ct-flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      flipCards.forEach(other => { if (other !== card) other.classList.remove('is-flipped'); });
      card.classList.toggle('is-flipped');
    });
  });

  /* ---------- 3. Form — sliding subject chips + live chat preview ---------- */
  const subjectChips = document.querySelectorAll('.ct-subject-chip');
  const subjectIndicator = document.getElementById('ctSubjectIndicator');
  const previewSubject = document.getElementById('ctPreviewSubject');
  let currentSubject = 'Order Issue';

  function moveSubjectIndicator(btn) {
    if (!subjectIndicator) return;
    subjectIndicator.style.width = btn.offsetWidth + 'px';
    subjectIndicator.style.transform = `translateX(${btn.offsetLeft}px)`;
  }

  if (subjectChips.length) {
    const activeChip = document.querySelector('.ct-subject-chip.active');
    if (activeChip) requestAnimationFrame(() => moveSubjectIndicator(activeChip));
    window.addEventListener('resize', () => {
      const current = document.querySelector('.ct-subject-chip.active');
      if (current) moveSubjectIndicator(current);
    });
    subjectChips.forEach(chip => {
      chip.addEventListener('click', () => {
        subjectChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        moveSubjectIndicator(chip);
        currentSubject = chip.dataset.subject;
        if (previewSubject) {
          previewSubject.textContent = 'Subject: ' + currentSubject;
          previewSubject.classList.remove('ct-bubble-empty');
        }
      });
    });
  }
  // Set initial preview subject bubble
  if (previewSubject) {
    previewSubject.textContent = 'Subject: ' + currentSubject;
    previewSubject.classList.remove('ct-bubble-empty');
  }

  const messageInput = document.getElementById('ctMessage');
  const previewMessage = document.getElementById('ctPreviewMessage');
  const typingIndicator = document.getElementById('ctTypingIndicator');
  let typingTimeout = null;

  if (messageInput && previewMessage && typingIndicator) {
    messageInput.addEventListener('input', () => {
      const val = messageInput.value.trim();
      typingIndicator.classList.toggle('show', val.length > 0);
      clearTimeout(typingTimeout);
      if (val.length > 0) {
        typingTimeout = setTimeout(() => {
          typingIndicator.classList.remove('show');
          previewMessage.textContent = val;
          previewMessage.classList.remove('ct-bubble-empty');
        }, 550);
      } else {
        previewMessage.classList.add('ct-bubble-empty');
      }
    });
  }

  const ctForm = document.getElementById('ctForm');
  const sendBtn = document.getElementById('ctSendBtn');
  if (ctForm && sendBtn) {
    ctForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (sendBtn.classList.contains('is-sent')) return;
      sendBtn.classList.add('is-sent');
      setTimeout(() => {
        sendBtn.classList.remove('is-sent');
        ctForm.reset();
        if (previewMessage) previewMessage.classList.add('ct-bubble-empty');
      }, 2600);
    });
  }

  /* ---------- 4. Offices — dashed flight-path route selector ---------- */
  const officeTabs = document.querySelectorAll('.ct-office-tab');
  const routeDest = document.getElementById('ctRouteDest');
  const routeDestLabel = document.getElementById('ctRouteDestLabel');
  const routeLine = document.getElementById('ctRouteLine');
  const routePlane = document.getElementById('ctRoutePlane');

  const officePositions = {
    austin: { x: 360, label: 'Austin' },
    berlin: { x: 260, label: 'Berlin' },
    tokyo: { x: 320, label: 'Tokyo' }
  };

  function animateRoute(key) {
    if (!routeLine) return;
    // Reset the dash so it "draws" in again on every switch.
    const len = routeLine.getTotalLength ? routeLine.getTotalLength() : 260;
    routeLine.style.transition = 'none';
    routeLine.style.strokeDasharray = String(len);
    routeLine.style.strokeDashoffset = String(len);
    // Force reflow so the transition re-triggers.
    void routeLine.getBoundingClientRect();
    routeLine.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.16,.84,.44,1)';
    requestAnimationFrame(() => { routeLine.style.strokeDashoffset = '0'; });

    const pos = officePositions[key] || officePositions.austin;
    if (routeDest) routeDest.setAttribute('cx', pos.x);
    if (routeDestLabel) { routeDestLabel.setAttribute('x', pos.x); routeDestLabel.textContent = pos.label; }
    if (routePlane) {
      if (hasGsap) gsap.to(routePlane, { attr: { x: pos.x - 46 }, duration: 1.1, ease: 'power2.out' });
      else routePlane.setAttribute('x', pos.x - 46);
    }
  }

  officeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      officeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.dataset.office;

      document.querySelectorAll('.ct-office-info').forEach(info => {
        info.classList.toggle('active', info.dataset.officeInfo === key);
      });
      document.querySelectorAll('.ct-office-img').forEach(img => {
        img.classList.toggle('active', img.dataset.officeImg === key);
      });
      animateRoute(key);
    });
  });

  /* ---------- 5. FAQ — chat-log accordion ---------- */
  const faqItems = document.querySelectorAll('.ct-faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.ct-faq-q');
    const typingRow = item.querySelector('.ct-faq-typing-row .ct-typing');
    const answer = item.querySelector('.ct-faq-a-bubble');

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(other => { other.classList.remove('open'); });
      if (isOpen) return;

      item.classList.add('open');
      if (typingRow && answer) {
        answer.style.opacity = '0';
        typingRow.classList.add('show');
        setTimeout(() => {
          typingRow.classList.remove('show');
          answer.style.transition = 'opacity .4s ease';
          answer.style.opacity = '1';
        }, 550);
      }
    });
  });

  // Staggered rise-in as the chat log scrolls into view.
  if (faqItems.length && 'IntersectionObserver' in window) {
    const faqObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('in-view'), i * 90);
          faqObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    faqItems.forEach(item => faqObserver.observe(item));
  } else {
    faqItems.forEach(item => item.classList.add('in-view'));
  }

  /* ---------- 6. Response pulse — sonar avatars + orbit stat count-up ---------- */
  const orbitStats = document.querySelectorAll('.ct-orbit-stat');
  if (orbitStats.length && 'IntersectionObserver' in window) {
    const orbitObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          const numEl = entry.target.querySelector('.ct-orbit-num');
          if (numEl && !numEl.dataset.animated) {
            numEl.dataset.animated = 'true';
            const value = parseFloat(numEl.dataset.value);
            const suffix = numEl.dataset.suffix || '';
            if (hasGsap) {
              const obj = { v: 0 };
              gsap.to(obj, {
                v: value, duration: 1.3, ease: 'power2.out',
                onUpdate: () => { numEl.textContent = Math.round(obj.v) + suffix; }
              });
            } else {
              numEl.textContent = value + suffix;
            }
          }
          orbitObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    orbitStats.forEach(stat => orbitObserver.observe(stat));
  } else {
    orbitStats.forEach(stat => {
      stat.classList.add('in-view');
      const numEl = stat.querySelector('.ct-orbit-num');
      if (numEl) numEl.textContent = numEl.dataset.value + (numEl.dataset.suffix || '');
    });
  }

  /* ---------- 7. Testimonials — draggable auto-scrolling ticker ---------- */
  const ticker = document.getElementById('ctTicker');
  const tickerTrack = document.getElementById('ctTickerTrack');
  if (ticker && tickerTrack) {
    // Duplicate the track once for a seamless auto-scroll loop.
    tickerTrack.innerHTML += tickerTrack.innerHTML;

    let autoX = 0;
    let dragging = false;
    let startX = 0;
    let startOffset = 0;
    let paused = false;
    let halfWidth = 0;

    function measure() { halfWidth = tickerTrack.scrollWidth / 2; }
    measure();
    window.addEventListener('resize', measure);

    function tick() {
      if (!dragging && !paused) {
        autoX -= 0.4;
        if (Math.abs(autoX) >= halfWidth) autoX = 0;
        tickerTrack.style.transform = `translateX(${autoX}px)`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    ticker.addEventListener('mouseenter', () => { paused = true; });
    ticker.addEventListener('mouseleave', () => { paused = false; });

    const onDown = (clientX) => {
      dragging = true;
      ticker.classList.add('is-dragging');
      startX = clientX;
      startOffset = autoX;
    };
    const onMove = (clientX) => {
      if (!dragging) return;
      autoX = startOffset + (clientX - startX);
      if (autoX > 0) autoX -= halfWidth;
      if (Math.abs(autoX) >= halfWidth) autoX += halfWidth;
      tickerTrack.style.transform = `translateX(${autoX}px)`;
    };
    const onUp = () => { dragging = false; ticker.classList.remove('is-dragging'); };

    ticker.addEventListener('pointerdown', (e) => { ticker.setPointerCapture(e.pointerId); onDown(e.clientX); });
    ticker.addEventListener('pointermove', (e) => onMove(e.clientX));
    ticker.addEventListener('pointerup', onUp);
    ticker.addEventListener('pointercancel', onUp);
  }

  /* ---------- 8. Final CTA — magnetic button + particle burst ---------- */
  const magWrap = document.getElementById('ctMagWrap');
  const magBtn = document.getElementById('ctMagBtn');
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

  if (magBtn) {
    magBtn.addEventListener('click', (e) => {
      const rect = magBtn.getBoundingClientRect();
      const originX = e.clientX - rect.left;
      const originY = e.clientY - rect.top;
      const colors = ['#4e5bff', '#7c85ff', '#f6f6f4'];

      for (let i = 0; i < 14; i++) {
        const particle = document.createElement('span');
        particle.className = 'ct-particle';
        particle.style.background = colors[i % colors.length];
        particle.style.left = originX + 'px';
        particle.style.top = originY + 'px';
        magBtn.appendChild(particle);

        const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
        const distance = 40 + Math.random() * 40;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        if (hasGsap) {
          gsap.to(particle, {
            x: dx, y: dy, opacity: 0, scale: 0.3, duration: 0.7, ease: 'power2.out',
            onComplete: () => particle.remove()
          });
        } else {
          particle.style.transition = 'transform .7s ease-out, opacity .7s ease-out';
          requestAnimationFrame(() => {
            particle.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
            particle.style.opacity = '0';
          });
          setTimeout(() => particle.remove(), 720);
        }
      }
    });
  }

});