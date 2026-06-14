/* ============================================================
   THE STORYLINE — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Header scroll state ── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () =>
      header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav overlay ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay   = document.querySelector('.nav-overlay');
  if (hamburger && overlay) {
    const toggle = (open) => {
      hamburger.setAttribute('aria-expanded', String(open));
      overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    hamburger.addEventListener('click', () =>
      toggle(hamburger.getAttribute('aria-expanded') !== 'true')
    );
    overlay.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => toggle(false))
    );
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) toggle(false);
    });
  }

  /* ── Active nav link ── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-overlay-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Scroll reveal ── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
  }

  /* ── Animated illustration draw-on observer ── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const illusSVGs = document.querySelectorAll('.illus-svg');
  if (illusSVGs.length) {
    if (reducedMotion) {
      illusSVGs.forEach(el => el.classList.add('drawn'));
    } else {
      const illusIO = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('drawn');
            /* Activate pencil cursor blink after its draw completes */
            const cursor = e.target.querySelector('.ts-cursor');
            if (cursor) {
              const delay = parseFloat(
                getComputedStyle(cursor).getPropertyValue('--fill-delay') || '1.8'
              ) * 1000;
              setTimeout(() => cursor.classList.add('ts-cursor-on'), delay || 1800);
            }
            illusIO.unobserve(e.target);
          }
        }),
        { threshold: 0.12, rootMargin: '0px 0px -20px 0px' }
      );
      illusSVGs.forEach(el => illusIO.observe(el));
    }
  }

  /* ── Set live clock to current time (montessori page) ── */
  const clockFace = document.querySelector('.ts-clock-face');
  if (clockFace) {
    const now   = new Date();
    const hDeg  = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
    const mDeg  = now.getMinutes() * 6;
    const hHand = clockFace.querySelector('.ts-clock-hour');
    const mHand = clockFace.querySelector('.ts-clock-min');
    if (hHand) hHand.setAttribute('transform', `rotate(${hDeg},45,45)`);
    if (mHand) mHand.setAttribute('transform', `rotate(${mDeg},45,45)`);
  }

  /* ── Tour booking form ── */
  const tourForm = document.getElementById('tour-form');
  if (tourForm) {
    tourForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = new FormData(tourForm);
      const submitBtn = tourForm.querySelector('[type="submit"]');
      const orig = submitBtn.textContent;
      submitBtn.textContent = 'Sent — we\'ll be in touch!';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      setTimeout(() => {
        submitBtn.textContent = orig;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        tourForm.reset();
      }, 4000);
    });
  }

  /* ── Hero video seamless crossfade loop ── */
  (function () {
    const wrap = document.querySelector('.hero-video-col');
    if (!wrap) return;
    const v1 = wrap.querySelector('video');
    if (!v1) return;

    v1.loop = false;

    const v2 = v1.cloneNode(true);
    v2.removeAttribute('autoplay');
    v2.loop = false;
    v2.style.opacity = '0';
    wrap.appendChild(v2);

    const FADE = 0.55;
    let active = v1, next = v2, crossing = false;

    function swap() {
      if (crossing) return;
      crossing = true;
      next.currentTime = 0;
      next.play().catch(() => {});
      active.style.transition = 'opacity 0.5s linear';
      next.style.transition   = 'opacity 0.5s linear';
      active.style.opacity = '0';
      next.style.opacity   = '1';
      setTimeout(() => {
        active.pause();
        [active, next] = [next, active];
        crossing = false;
      }, 520);
    }

    function monitor() {
      if (this.duration && !crossing && this.currentTime >= this.duration - FADE) {
        swap();
      }
    }

    v1.addEventListener('timeupdate', monitor);
    v2.addEventListener('timeupdate', monitor);
  })();

  /* ── Full Menu Modal ── */
  (function () {
    const modal = document.getElementById('full-menu-modal');
    const openBtn = document.getElementById('open-full-menu');
    const closeBtn = document.getElementById('full-menu-close');
    if (!modal || !openBtn) return;
    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  })();

  /* ── Smooth scroll for hash links on same page ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
