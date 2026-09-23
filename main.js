/* ═══════════════════════════════════════════════════════════════
   Mr. Plumber, Inc. shared script for every page.

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

  /* ── who-we-serve: each industry opens to explain itself ──── */
  document.querySelectorAll('.ind__more').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    const label = btn.querySelector('span');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      if (label) label.textContent = open ? 'Read More' : 'Less';
    });
  });

  /* ── forms ─────────────────────────────────────────────────────
     Both the residential quote form and the commercial account form
     run through here. Neither delivers anywhere until FORM_ENDPOINT
     above is pointed at a real handler. */
  const required = (label) => (v) => (v.trim().length >= 2 ? '' : label);
  const phoneRule = (v) =>
    v.replace(/\D/g, '').length >= 10 ? '' : 'Enter a 10-digit phone number so we can reach you.';
  const emailRule = (optional) => (v) =>
    (optional && !v.trim()) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
      ? ''
      : 'That email address looks incomplete.';
  const chosen = (label) => (v) => (v ? '' : label);

  const FORMS = [
    {
      form: 'quoteForm', sent: 'sent', submit: 'submitBtn', again: 'againBtn',
      idle: 'Send My Request', busy: 'Sending…', first: 'f-name',
      rules: {
        'f-name': required('Please enter your name.'),
        'f-phone': phoneRule,
        'f-email': emailRule(true),
        'f-service': chosen('Pick the service you need.'),
      },
    },
    {
      form: 'acctForm', sent: 'acctSent', submit: 'acctSubmit', again: 'acctAgain',
      idle: 'Open My Account', busy: 'Sending…', first: 'a-company',
      rules: {
        'a-company': required('Please enter your company name.'),
        'a-name': required('Please enter a contact name.'),
        'a-phone': phoneRule,
        'a-email': emailRule(false),
        'a-type': chosen('Tell us what kind of business this is.'),
        'a-props': chosen('Pick how many properties this covers.'),
        'a-billing': chosen('Pick how you would like to be billed.'),
      },
    },
  ];

  FORMS.forEach((cfg) => {
    const form = $(cfg.form);
    if (!form) return;

    const sent = $(cfg.sent);
    const submitBtn = $(cfg.submit);
    const againBtn = $(cfg.again);

    const check = (id) => {
      const input = $(id);
      if (!input) return true;
      const field = input.closest('.field');
      const msg = cfg.rules[id](input.value);
      field.classList.toggle('is-bad', Boolean(msg));
      const slot = field.querySelector('[data-err-for="' + id + '"]');
      if (slot) slot.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };

    Object.keys(cfg.rules).forEach((id) => {
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

      if (Object.keys(cfg.rules).map(check).includes(false)) {
        const bad = form.querySelector('.field.is-bad input, .field.is-bad select');
        if (bad) {
          bad.focus();
          bad.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        }
        return;
      }

      submitBtn.classList.add('is-busy');
      submitBtn.textContent = cfg.busy;

      const data = new FormData(form);
      data.append('_form', cfg.form === 'acctForm' ? 'Commercial account' : 'Residential quote');

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
        submitBtn.textContent = cfg.idle;

        let alertBox = form.querySelector('.form__error');
        if (!alertBox) {
          alertBox = document.createElement('p');
          alertBox.className = 'form__foot form__error';
          alertBox.setAttribute('role', 'alert');
          submitBtn.after(alertBox);
        }
        alertBox.innerHTML =
          'That request didn\u2019t go through. Call <a href="tel:18036004357">803-600-4357</a> and we\u2019ll take the details over the phone.';
      }
    });

    if (againBtn) {
      againBtn.addEventListener('click', () => {
        form.reset();
        form.querySelectorAll('.field.is-bad').forEach((f) => f.classList.remove('is-bad'));
        const errored = form.querySelector('.form__error');
        if (errored) errored.remove();
        submitBtn.classList.remove('is-busy');
        submitBtn.textContent = cfg.idle;
        sent.hidden = true;
        form.hidden = false;
        const first = $(cfg.first);
        if (first) first.focus();
      });
    }
  });
})();
