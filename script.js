/* =========================================================
   STACKLY — script.js
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('done'), 500);
  });
  // fallback in case load event already fired
  setTimeout(() => preloader.classList.add('done'), 2200);

  /* ---------- Scroll reveal (self-contained — no external CDN) ---------- */
  const revealEls = document.querySelectorAll('[data-aos]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      // Only hide elements once we're certain we can also reveal them.
      revealEls.forEach(el => el.classList.add('reveal'));
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.getAttribute('data-aos-delay'), 10) || 0;
            setTimeout(() => entry.target.classList.add('in-view'), delay);
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(el => revealObserver.observe(el));

      // Safety net: if something never triggers (edge-case geometry,
      // element inside an unusual container, etc.) force it visible
      // rather than leaving it hidden.
      setTimeout(() => {
        revealEls.forEach(el => el.classList.add('in-view'));
      }, 4000);
    }
    // If IntersectionObserver isn't supported, elements simply stay in
    // their default fully-visible state — nothing to do.
  }

  /* ---------- GSAP setup ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    backToTop.classList.toggle('show', y > 700);
  }, { passive: true });

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Hamburger / mobile drawer ---------- */
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');

  function toggleDrawer(force) {
    const open = force !== undefined ? force : !drawer.classList.contains('open');
    drawer.classList.toggle('open', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  const drawerClose = document.getElementById('drawerClose');
  hamburger.addEventListener('click', () => toggleDrawer());
  if (drawerClose) drawerClose.addEventListener('click', () => toggleDrawer(false));
  drawer.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });

  /* ---------- Active nav link — based on current page ---------- */
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link:not(.login)');
  const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  navLinks.forEach(link => {
    const linkFile = (link.getAttribute('href').split('#')[0] || 'index.html').toLowerCase();
    link.classList.toggle('active', linkFile === currentFile);
  });

  /* ---------- Cursor glow (desktop) ---------- */
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(min-width:901px)').matches) {
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  /* ---------- Hero orbit parallax (GSAP + mouse) ---------- */
  const heroOrbit = document.getElementById('heroOrbit');
  if (window.gsap && heroOrbit) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = heroOrbit.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      gsap.to(heroOrbit, { rotateY: dx * 14, rotateX: -dy * 14, duration: 0.8, ease: 'power2.out', transformPerspective: 900 });
    });
    document.querySelector('.hero').addEventListener('mouseleave', () => {
      gsap.to(heroOrbit, { rotateY: 0, rotateX: 0, duration: 1 });
    });
    gsap.from('.hero-orbit', { opacity: 0, scale: 0.8, duration: 1.2, ease: 'power3.out', delay: 0.2 });
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => el.textContent = Math.round(obj.val).toLocaleString()
        });
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Best Sellers — 3D coverflow carousel ---------- */
  const cfStage = document.getElementById('coverflowStage');
  const cfTrack = document.getElementById('coverflowTrack');
  if (cfStage && cfTrack) {
    const cfCards = Array.from(cfTrack.querySelectorAll('.cf-card'));
    const cfDotsWrap = document.getElementById('cfDots');
    const cfPrevBtn = document.querySelector('.cf-prev');
    const cfNextBtn = document.querySelector('.cf-next');
    const CF_AUTO_MS = 3800;
    let cfActive = 0;
    let cfAutoTimer;

    cfCards.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'cf-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => { cfSetActive(i); cfRestartAuto(); });
      cfDotsWrap.appendChild(dot);
    });
    const cfDots = Array.from(cfDotsWrap.children);

    function cfRender() {
      cfCards.forEach((card, i) => {
        const offset = i - cfActive;
        const abs = Math.abs(offset);
        card.classList.toggle('is-active', offset === 0);
        if (abs > 3) {
          card.style.opacity = '0';
          card.style.zIndex = '0';
          card.style.transform = `translate(-50%,-50%) translateX(${offset * 40}px) scale(0.4)`;
          return;
        }
        const tx = offset * 150;
        const rotY = offset * -30;
        const scale = 1 - abs * 0.14;
        card.style.transform = `translate(-50%,-50%) translateX(${tx}px) rotateY(${rotY}deg) scale(${scale})`;
        card.style.opacity = String(Math.max(1 - abs * 0.32, 0));
        card.style.zIndex = String(10 - abs);
      });
      cfDots.forEach((d, i) => d.classList.toggle('active', i === cfActive));
    }
    function cfSetActive(i) {
      cfActive = ((i % cfCards.length) + cfCards.length) % cfCards.length;
      cfRender();
    }
    function cfNext() { cfSetActive(cfActive + 1); }
    function cfPrev() { cfSetActive(cfActive - 1); }
    function cfRestartAuto() {
      clearInterval(cfAutoTimer);
      cfAutoTimer = setInterval(cfNext, CF_AUTO_MS);
    }

    if (cfNextBtn) cfNextBtn.addEventListener('click', () => { cfNext(); cfRestartAuto(); });
    if (cfPrevBtn) cfPrevBtn.addEventListener('click', () => { cfPrev(); cfRestartAuto(); });

    cfCards.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        if (i !== cfActive) { cfSetActive(i); cfRestartAuto(); }
      });
      const addBtn = card.querySelector('.add-btn');
      if (addBtn) addBtn.addEventListener('click', (e) => e.stopPropagation());
    });

    // Drag / swipe to change active card
    let cfDragging = false, cfStartX = 0, cfDeltaX = 0, cfPointerId = null;
    cfStage.addEventListener('pointerdown', (e) => {
      cfDragging = true; cfStartX = e.clientX; cfDeltaX = 0; cfPointerId = e.pointerId;
      cfStage.classList.add('dragging');
      cfStage.setPointerCapture(e.pointerId);
      clearInterval(cfAutoTimer);
    });
    cfStage.addEventListener('pointermove', (e) => {
      if (!cfDragging || e.pointerId !== cfPointerId) return;
      cfDeltaX = e.clientX - cfStartX;
    });
    function cfEndDrag() {
      if (!cfDragging) return;
      cfDragging = false;
      cfStage.classList.remove('dragging');
      if (Math.abs(cfDeltaX) > 60) { cfDeltaX > 0 ? cfPrev() : cfNext(); }
      cfDeltaX = 0;
      cfRestartAuto();
    }
    cfStage.addEventListener('pointerup', cfEndDrag);
    cfStage.addEventListener('pointercancel', cfEndDrag);

    cfStage.addEventListener('mouseenter', () => clearInterval(cfAutoTimer));
    cfStage.addEventListener('mouseleave', () => { if (!cfDragging) cfRestartAuto(); });

    cfRender();
    cfRestartAuto();
  }

  /* ---------- Sticky scroll section (image + text swap) ---------- */
  const stickySteps = document.querySelectorAll('.sticky-step');
  const stickyImgs = document.querySelectorAll('.sticky-img');

  function activateStep(step) {
    const idx = step.getAttribute('data-step');
    stickySteps.forEach(s => s.classList.toggle('active', s === step));
    stickyImgs.forEach(img => img.classList.toggle('active', img.getAttribute('data-step') === idx));
  }

  if (stickySteps.length && stickyImgs.length && 'IntersectionObserver' in window) {
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activateStep(entry.target);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    stickySteps.forEach(step => stickyObserver.observe(step));
  }

  /* ---------- Timeline fill line on scroll (comet-trail progress) ---------- */
  const timelineFill = document.getElementById('timelineFill');
  const timelineSection = document.querySelector('.timeline-section');
 if (timelineFill && timelineSection && window.ScrollTrigger && window.matchMedia('(min-width:901px)').matches
) {
    const isMobileLine = () => window.matchMedia('(max-width:900px)').matches;
    ScrollTrigger.create({
      trigger: timelineSection,
      start: 'top 70%',
      end: 'bottom 70%',
      onUpdate: (self) => {
        const pct = (self.progress * 100) + '%';
        if (isMobileLine()) { timelineFill.style.height = pct; timelineFill.style.width = '100%'; }
        else { timelineFill.style.width = pct; timelineFill.style.height = '100%'; }
      }
    });
  }

  /* ---------- Timeline items — staggered reveal + active dot + iris image wipe ---------- */
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (timelineItems.length && window.gsap && window.ScrollTrigger) {
    timelineItems.forEach((item, i) => {
      const dot = item.querySelector('.timeline-dot');
      const card = item.querySelector('.timeline-card');
      const imgWrap = item.querySelector('.timeline-img-wrap');
      const dir = i % 2 === 0 ? -1 : 1;

      gsap.set(card, { opacity: 0, y: 46, rotate: dir * 4, scale: 0.92 });
      if (imgWrap) gsap.set(imgWrap, { clipPath: 'circle(0% at 50% 50%)' });

      ScrollTrigger.create({
        trigger: item,
        start: 'top 82%',
        onEnter: () => {
          dot.classList.add('active');
          gsap.to(card, { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 0.8, ease: 'back.out(1.6)' });
          if (imgWrap) gsap.to(imgWrap, { clipPath: 'circle(140% at 50% 50%)', duration: 1, ease: 'power3.out', delay: 0.15 });
        },
        onEnterBack: () => dot.classList.add('active'),
        onLeaveBack: () => dot.classList.remove('active')
      });
    });
  }

  /* ---------- Flip cards — tap support on touch devices ---------- */
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      if (window.matchMedia('(hover:none)').matches) {
        card.classList.toggle('flipped');
      }
    });
  });

  /* ---------- Testimonials swipe-stack (drag, buttons, dots, autoplay) ---------- */
  const swapStack = document.getElementById('swapStack');
  if (swapStack) {
    const cards = Array.from(swapStack.querySelectorAll('.swap-card'));
    const dotsWrap = document.getElementById('swapDots');
    const prevBtn = document.querySelector('.swap-prev');
    const nextBtn = document.querySelector('.swap-next');
    const AUTO_MS = 4500;
    let order = cards.map((_, i) => i); // order[0] = index (into `cards`) of the front-most card
    let autoTimer;

    cards.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'swap-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => { goTo(i); restartAuto(); });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function useGsapOrFallback(el, props, duration) {
      if (window.gsap) { gsap.to(el, { ...props, duration, ease: 'power3.out' }); }
      else {
        el.style.transition = `transform ${duration}s ease, opacity ${duration}s ease`;
        if (props.x !== undefined || props.y !== undefined || props.rotate !== undefined || props.scale !== undefined) {
          el.style.transform = `translate(${props.x || 0}px, ${props.y || 0}px) rotate(${props.rotate || 0}deg) scale(${props.scale !== undefined ? props.scale : 1})`;
        }
        if (props.opacity !== undefined) el.style.opacity = props.opacity;
        if (props.zIndex !== undefined) el.style.zIndex = props.zIndex;
      }
    }
    function setImmediate(el, props) {
      if (window.gsap) { gsap.set(el, props); }
      else {
        el.style.transition = 'none';
        el.style.transform = `translate(${props.x || 0}px, ${props.y || 0}px) rotate(${props.rotate || 0}deg) scale(${props.scale !== undefined ? props.scale : 1})`;
        if (props.opacity !== undefined) el.style.opacity = props.opacity;
        if (props.zIndex !== undefined) el.style.zIndex = props.zIndex;
      }
    }

    function layout(animate) {
      order.forEach((cardIdx, pos) => {
        const card = cards[cardIdx];
        card.classList.toggle('is-front', pos === 0);
        const target = {
          x: 0,
          y: pos * 14,
          scale: 1 - pos * 0.06,
          rotate: pos === 0 ? 0 : (cardIdx % 2 === 0 ? -3 : 3) * pos,
          opacity: pos > 2 ? 0 : 1 - pos * 0.3,
          zIndex: cards.length - pos
        };
        if (animate) useGsapOrFallback(card, target, 0.55);
        else setImmediate(card, target);
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === order[0]));
    }

    function next(dir) {
      dir = dir || 1;
      const frontIdx = order[0];
      const frontCard = cards[frontIdx];
      useGsapOrFallback(frontCard, { x: dir * 420, rotate: dir * 16, opacity: 0 }, 0.4);
      setTimeout(() => {
        order.push(order.shift());
        setImmediate(frontCard, { x: -dir * 420, rotate: -dir * 16, opacity: 0 });
        layout(true);
      }, 260);
    }
    function prev() {
      order.unshift(order.pop());
      const frontCard = cards[order[0]];
      setImmediate(frontCard, { x: -420, rotate: -16, opacity: 0, zIndex: cards.length + 2 });
      layout(true);
    }
    function goTo(targetIdx) {
      let guard = 0;
      while (order[0] !== targetIdx && guard < cards.length) { order.push(order.shift()); guard++; }
      layout(true);
    }
    function restartAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => next(1), AUTO_MS);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(1); restartAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartAuto(); });

    // Drag / swipe support on the front card
    let dragStartX = 0, dragCurrentX = 0, dragging = false, activePointerId = null;
    swapStack.addEventListener('pointerdown', (e) => {
      const front = cards[order[0]];
      if (e.target.closest('.swap-card') !== front) return;
      dragging = true;
      dragStartX = e.clientX;
      activePointerId = e.pointerId;
      front.classList.add('dragging');
      front.setPointerCapture(e.pointerId);
      clearInterval(autoTimer);
    });
    swapStack.addEventListener('pointermove', (e) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      const front = cards[order[0]];
      dragCurrentX = e.clientX - dragStartX;
      setImmediate(front, { x: dragCurrentX, rotate: dragCurrentX / 18 });
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      const front = cards[order[0]];
      front.classList.remove('dragging');
      if (Math.abs(dragCurrentX) > 110) {
        next(dragCurrentX > 0 ? 1 : -1);
      } else {
        useGsapOrFallback(front, { x: 0, rotate: 0, opacity: 1 }, 0.4);
      }
      dragCurrentX = 0;
      restartAuto();
    }
    swapStack.addEventListener('pointerup', endDrag);
    swapStack.addEventListener('pointercancel', endDrag);

    layout(false);
    restartAuto();
    swapStack.addEventListener('mouseenter', () => clearInterval(autoTimer));
    swapStack.addEventListener('mouseleave', () => { if (!dragging) restartAuto(); });
  }

  /* ---------- FAQ split-view explorer ---------- */
  const faqTabs = Array.from(document.querySelectorAll('.faq-tab'));
  if (faqTabs.length) {
    const faqPanelContent = document.getElementById('faqPanelContent');
    const faqBgIcon = document.getElementById('faqBgIcon');
    const faqStep = document.getElementById('faqStep');
    const faqTitle = document.getElementById('faqAnswerTitle');
    const faqText = document.getElementById('faqAnswerText');
    const faqPrevBtn = document.getElementById('faqPrevBtn');
    const faqNextBtn = document.getElementById('faqNextBtn');
    let faqActive = Math.max(faqTabs.findIndex(t => t.classList.contains('active')), 0);

    function faqApply(i) {
      const tab = faqTabs[i];
      faqBgIcon.innerHTML = `<i class="fa-solid ${tab.dataset.icon}"></i>`;
      faqStep.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(faqTabs.length).padStart(2, '0');
      faqTitle.textContent = tab.dataset.title;
      faqText.textContent = tab.dataset.text;
    }

    function faqSetActive(i, animate) {
      faqActive = ((i % faqTabs.length) + faqTabs.length) % faqTabs.length;
      faqTabs.forEach((t, idx) => t.classList.toggle('active', idx === faqActive));

      if (animate && window.gsap) {
        gsap.to(faqPanelContent, {
          opacity: 0, y: 10, duration: 0.18, ease: 'power2.in',
          onComplete: () => {
            faqApply(faqActive);
            gsap.fromTo(faqPanelContent, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
            gsap.fromTo(faqBgIcon, { rotate: -18, scale: 0.8, opacity: 0 }, { rotate: -8, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' });
          }
        });
      } else {
        faqApply(faqActive);
      }
    }

    faqTabs.forEach((tab, i) => tab.addEventListener('click', () => faqSetActive(i, true)));
    if (faqPrevBtn) faqPrevBtn.addEventListener('click', () => faqSetActive(faqActive - 1, true));
    if (faqNextBtn) faqNextBtn.addEventListener('click', () => faqSetActive(faqActive + 1, true));

    faqSetActive(faqActive, false);
  }

  /* ---------- Newsletter form ---------- */
  const form = document.getElementById('newsletterForm');
  const msg = document.getElementById('formMsg');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.textContent = "You're in! Check your inbox for your welcome code.";
      form.reset();
    });
  }

  /* ---------- Categories — pinned horizontal scroll gallery ---------- */
  const catPin = document.getElementById('catPin');
  const catTrack = document.getElementById('catTrack');
  const catProgressBar = document.getElementById('catProgressBar');
  if (catPin && catTrack && window.gsap && window.ScrollTrigger && window.matchMedia('(min-width:901px)').matches) {
    const catViewport = catPin.querySelector('.cat-viewport');
    const catCards = Array.from(catTrack.querySelectorAll('.cat-card'));

    function focusCards() {
      const vRect = catViewport.getBoundingClientRect();
      const centerX = vRect.left + vRect.width / 2;
      catCards.forEach(card => {
        const r = card.getBoundingClientRect();
        const dist = Math.abs((r.left + r.width / 2) - centerX);
        const norm = Math.min(dist / (vRect.width * 0.65), 1);
        card.style.transform = `scale(${1 - norm * 0.08})`;
        card.style.opacity = 1 - norm * 0.45;
      });
    }

    let scrollDistance = 0;
    const st = ScrollTrigger.create({
      trigger: catPin,
      start: 'top 100px',
      end: () => {
        scrollDistance = Math.max(catTrack.scrollWidth - catViewport.clientWidth, 0);
        return '+=' + scrollDistance;
      },
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(catTrack, { x: -scrollDistance * self.progress });
        if (catProgressBar) catProgressBar.style.width = (self.progress * 100) + '%';
        focusCards();
      }
    });

    window.addEventListener('load', () => { ScrollTrigger.refresh(); focusCards(); });
    focusCards();
  }

});