/* ═══════════════════════════════════════════════════════════════
   Mr. Plumber, Inc. — shared script for every page.

   ▸ SET THIS BEFORE LAUNCH ◂
   FORM_ENDPOINT must point at a real form handler (Formspree,
   Netlify Forms, or your own API route). While it is an empty
   string the quote form validates and shows its success panel but
   DOES NOT deliver the request anywhere.
   ═══════════════════════════════════════════════════════════════ */
const FORM_ENDPOINT = '';

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);

  /* ── current year ─────────────────────────────────────────── */
  document.querySelectorAll('[data-yr], #yr').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ── nav: solidify the glass once we leave the top ────────── */
  const nav = $('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── mobile drawer ────────────────────────────────────────── */
  const burger = $('burger');
  const drawer = $('drawer');
  if (burger && drawer) {
    const setDrawer = (open) => {
      drawer.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', () => setDrawer(drawer.hidden));
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) setDrawer(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) {
        setDrawer(false);
        burger.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (drawer.hidden) return;
      if (!drawer.contains(e.target) && !burger.contains(e.target)) setDrawer(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080 && !drawer.hidden) setDrawer(false);
    });
  }

  /* ── scroll reveals ───────────────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.06 }
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ── the copper line: water runs through it once, on arrival ─ */
  const rail = $('rail');
  if (rail) {
    if (reduced || !('IntersectionObserver' in window)) {
      rail.classList.add('is-flowing');
    } else {
      const railIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            rail.classList.add('is-flowing');
            railIO.disconnect();
          });
        },
        { threshold: 0.3 }
      );
      railIO.observe(rail);
    }
  }

  /* ── quote form (only on pages that have it) ──────────────── */
  const form = $('quoteForm');
  if (!form) return;

  const sent = $('sent');
  const submitBtn = $('submitBtn');
  const againBtn = $('againBtn');

  const rules = {
    'f-name': (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
    'f-phone': (v) =>
      v.replace(/\D/g, '').length >= 10 ? '' : 'Enter a 10-digit phone number so we can reach you.',
    'f-email': (v) =>
      !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email address looks incomplete.',
    'f-service': (v) => (v ? '' : 'Pick the service you need.'),
  };

  const check = (id) => {
    const input = $(id);
    if (!input) return true;
    const field = input.closest('.field');
    const msg = rules[id](input.value);
    field.classList.toggle('is-bad', Boolean(msg));
    const slot = field.querySelector('[data-err-for="' + id + '"]');
    if (slot) slot.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  };

  Object.keys(rules).forEach((id) => {
    const input = $(id);
    if (!input) return;
    input.addEventListener('blur', () => check(id));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('is-bad')) check(id);
    });
    input.addEventListener('change', () => check(id));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      const bad = form.querySelector('.field.is-bad input, .field.is-bad select');
      if (bad) {
        bad.focus();
        bad.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }
      return;
    }

    submitBtn.classList.add('is-busy');
    submitBtn.textContent = 'Sending…';

    const data = new FormData(form);

    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Request failed: ' + res.status);
      } else {
        console.warn('[Mr. Plumber] FORM_ENDPOINT is not set. This request was not delivered.', Object.fromEntries(data));
      }

      form.hidden = true;
      sent.hidden = false;
      sent.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    } catch (err) {
      console.error(err);
      submitBtn.classList.remove('is-busy');
      submitBtn.textContent = 'Send my request';

      let alertBox = form.querySelector('.form__error');
      if (!alertBox) {
        alertBox = document.createElement('p');
        alertBox.className = 'form__foot form__error';
        alertBox.setAttribute('role', 'alert');
        submitBtn.after(alertBox);
      }
      alertBox.innerHTML =
        'That request didn’t go through. Call <a href="tel:18036004357">803-600-4357</a> and we’ll take the details over the phone.';
    }
  });

  if (againBtn) {
    againBtn.addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('.field.is-bad').forEach((f) => f.classList.remove('is-bad'));
      const errored = form.querySelector('.form__error');
      if (errored) errored.remove();
      submitBtn.classList.remove('is-busy');
      submitBtn.textContent = 'Send my request';
      sent.hidden = true;
      form.hidden = false;
      $('f-name').focus();
    });
  }
})();
