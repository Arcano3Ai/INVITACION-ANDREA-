/**
 * Orquestador principal de la invitación interactiva de Andrea.
 */
(function () {
  'use strict';

  // Configuración personalizable (puedes colocar el número de WhatsApp con lada, ej. "528112345678")
  const CONFIG = {
    whatsappPhone: '5218110626302',
    shareTitle: '🎀 Andrea — ¡Mis 2 Añitos!',
    shareText:
      'Tienes una invitación especial para celebrar los 2 añitos de Andrea. Sábado 21 de noviembre • Recepción 6:00 PM.'
  };

  let toastTimer = null;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-shown');
    }, 3200);
  }

  function init() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const sparkles = new window.SparkleSystem('sparkle-canvas');
    const musicPlayer = new window.MusicBoxPlayer('music-toggle-btn');

    const introScreen = document.getElementById('intro-screen');
    const envelope = document.getElementById('envelope-3d');
    const openBtn = document.getElementById('open-invitation-btn');
    const mainEl = document.getElementById('invitation-main');
    const floatingControls = document.getElementById('floating-controls');

    let isOpened = false;

    function openInvitation() {
      if (isOpened) return;
      isOpened = true;

      envelope.classList.add('is-open');

      // Explosión mágica de destellos desde el centro del sobre
      const rect = envelope.getBoundingClientRect();
      sparkles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 65);

      // Iniciar música ambiental y video del personaje al interactuar
      musicPlayer.play();
      const minnieVideo = document.getElementById('minnie-video');
      if (minnieVideo) {
        minnieVideo.play().catch(() => {});
      }

      // Transición fluida hacia la invitación
      setTimeout(() => {
        introScreen.classList.add('is-leaving');
        document.body.classList.remove('is-locked');
        window.scrollTo(0, 0);
        mainEl.setAttribute('aria-hidden', 'false');
        mainEl.classList.add('is-visible');
        floatingControls.setAttribute('aria-hidden', 'false');
        floatingControls.classList.add('is-visible');

        // Revelar elementos iniciales del Hero
        observeRevealElements();
      }, 1050);
    }

    if (envelope) {
      envelope.addEventListener('click', openInvitation);
      envelope.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openInvitation();
        }
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', openInvitation);
    }

    // Control de música flotante
    const musicBtn = document.getElementById('music-toggle-btn');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        const playing = musicPlayer.toggle();
        showToast(playing ? '🎵 Música ambiental activada' : '🔇 Música en pausa');
      });
    }

    // Google Calendar
    const googleCalLink = document.getElementById('google-cal-link');
    if (googleCalLink) {
      googleCalLink.href = window.InvitationCalendar.getGoogleCalendarUrl();
    }

    // Compartir invitación por WhatsApp
    function handleShare() {
      const url = window.location.href;
      const text = `🎀 *${CONFIG.shareTitle}*\n\n${CONFIG.shareText}\n\n✨ Abre tu invitación mágica aquí:\n${url}`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    const shareFab = document.getElementById('share-fab-btn');
    const shareMain = document.getElementById('share-main-btn');
    if (shareFab) shareFab.addEventListener('click', handleShare);
    if (shareMain) shareMain.addEventListener('click', handleShare);

    // Micro-interacción: lluvia de destellos al tocar el sobre de regalos
    const giftBtn = document.getElementById('gift-sparkle-btn');
    if (giftBtn) {
      giftBtn.addEventListener('click', () => {
        const rect = giftBtn.getBoundingClientRect();
        sparkles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 36);
        showToast('💖 ¡Gracias por tu cariño para Andrea!');
      });
    }

    // Tilt 3D reactivo al puntero sobre el sobre (solo desktop / puntero fino)
    if (envelope && window.matchMedia('(pointer: fine)').matches) {
      envelope.addEventListener('mousemove', (e) => {
        if (isOpened) return;
        const r = envelope.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        envelope.style.transform = `rotateY(${nx * 14}deg) rotateX(${-ny * 12}deg) translateY(-6px)`;
      });
      envelope.addEventListener('mouseleave', () => {
        if (!isOpened) envelope.style.transform = '';
      });
    }

    // Confirmación vía WhatsApp
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
      rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('guest-name');
        const countInput = document.getElementById('guest-count');
        const statusInput = document.getElementById('guest-status');
        const msgInput = document.getElementById('guest-message');

        const guestName = nameInput.value.trim();
        if (!guestName) {
          nameInput.focus();
          showToast('Por favor escribe tu nombre o familia 💕');
          return;
        }

        const lines = [
          '🎀 *Confirmación - 2 Añitos de Andrea* 🎀',
          `👤 *Nombre:* ${guestName}`,
          `🎉 *Asistencia:* ${statusInput.value}`,
          `👨‍👩‍👧‍👦 *Personas:* ${countInput.value}`
        ];

        const customMsg = msgInput.value.trim();
        if (customMsg) {
          lines.push(`💌 *Mensaje para Andrea:* "${customMsg}"`);
        }

        const encoded = encodeURIComponent(lines.join('\n'));
        const base = CONFIG.whatsappPhone
          ? `https://wa.me/${CONFIG.whatsappPhone}?text=${encoded}`
          : `https://wa.me/?text=${encoded}`;

        window.open(base, '_blank', 'noopener,noreferrer');
      });
    }

    // Cuenta regresiva
    startCountdown();

    // Parallax suave en scroll
    initParallax();
  }

  function startCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    const { start } = window.InvitationCalendar.getEventDates();
    const targetTime = start.getTime();

    function update() {
      const diff = Math.max(0, targetTime - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(mins).padStart(2, '0');
      secsEl.textContent = String(secs).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  function observeRevealElements() {
    const items = document.querySelectorAll('.reveal-item');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        let batchIdx = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${Math.min(batchIdx * 90, 360)}ms`;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
            batchIdx++;
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
    );

    items.forEach((el) => observer.observe(el));
  }

  function initParallax() {
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          layers.forEach((layer) => {
            const factor = parseFloat(layer.getAttribute('data-parallax')) || 0;
            layer.style.transform = `translate3d(0, ${scrollY * factor}px, 0)`;
          });
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

