(function () {
  window.PV = window.PV || {};

  PV.getLanguage = function () {
    return localStorage.getItem('pv_lang') || 'en';
  };

  PV.isRtlLanguage = function (lang) {
    return lang === 'da' || lang === 'ps';
  };

  PV.setLanguage = function (lang) {
    localStorage.setItem('pv_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = PV.isRtlLanguage(lang) ? 'rtl' : 'ltr';

    PV.applyTranslations();

    document.dispatchEvent(new CustomEvent('pv:languageChanged', { detail: { lang } }));
  };

  PV.getTranslations = function (lang) {
    const langs = window.PV_LANGS || {};
    return langs[lang] || langs.en || {};
  };

  PV.t = function (key, vars) {
    const lang = PV.getLanguage();
    const primary = PV.getTranslations(lang);
    const fallback = PV.getTranslations('en');

    function resolve(obj) {
      return key.split('.').reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), obj);
    }

    let value = resolve(primary);
    if (value == null) value = resolve(fallback);
    if (value == null) value = key;

    if (vars && typeof value === 'string') {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replaceAll(`{{${k}}}`, String(v));
      });
    }

    return value;
  };

  PV.applyTranslations = function (root) {
    const ctx = root || document;

    ctx.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const varsRaw = el.getAttribute('data-i18n-vars');
      const vars = varsRaw ? JSON.parse(varsRaw) : undefined;
      el.textContent = PV.t(key, vars);
    });

    ctx.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', PV.t(key));
    });

    ctx.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', PV.t(key));
    });

    ctx.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', PV.t(key));
    });

    ctx.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = PV.t(key);
    });
  };

  PV.formatCurrency = function (amount) {
    const lang = PV.getLanguage();
    const locale = lang === 'en' ? 'en-US' : lang === 'da' ? 'fa-AF' : 'ps-AF';

    const safe = Number(amount || 0);
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(safe);
  };

  PV.formatDate = function (date) {
    const lang = PV.getLanguage();
    const locale = lang === 'en' ? 'en-US' : lang === 'da' ? 'fa-AF' : 'ps-AF';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' }).format(d);
  };

  PV.debounce = function (fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  PV.ensureToastContainer = function () {
    let el = document.getElementById('pv-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'pv-toast-container';
      document.body.appendChild(el);
    }
    return el;
  };

  PV.toast = function ({ type, title, message, timeoutMs }) {
    const container = PV.ensureToastContainer();

    const toast = document.createElement('div');
    toast.className = `pv-toast ${type || 'success'}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const left = document.createElement('div');

    const t = document.createElement('p');
    t.className = 'pv-toast-title';
    t.textContent = title || (type === 'error' ? 'Error' : 'Success');

    const m = document.createElement('p');
    m.className = 'pv-toast-message';
    m.textContent = message || '';

    left.appendChild(t);
    left.appendChild(m);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn btn-sm btn-link text-decoration-none';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close');

    close.addEventListener('click', () => {
      toast.remove();
    });

    toast.appendChild(left);
    toast.appendChild(close);

    container.appendChild(toast);

    const ms = timeoutMs == null ? 3500 : timeoutMs;
    if (ms > 0) {
      setTimeout(() => {
        toast.remove();
      }, ms);
    }
  };

  PV.initLanguageSelector = function (selectEl) {
    if (!selectEl) return;

    const current = PV.getLanguage();
    selectEl.value = current;
    selectEl.addEventListener('change', () => {
      PV.setLanguage(selectEl.value);
    });

    document.addEventListener('pv:languageChanged', () => {
      selectEl.value = PV.getLanguage();
    });
  };

  PV.onReady = function (fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
      return;
    }
    fn();
  };

  PV.onReady(() => {
    PV.setLanguage(PV.getLanguage());
  });
})();
