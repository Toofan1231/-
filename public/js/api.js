(function () {
  window.PV = window.PV || {};

  PV.apiBaseUrl = function () {
    const override = localStorage.getItem('pv_api_base_url');
    if (override) return override.replace(/\/$/, '');
    return `${window.location.origin}/api`;
  };

  PV.session = {
    getUser() {
      const raw = localStorage.getItem('pv_user');
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    getToken() {
      return localStorage.getItem('pv_token');
    },
    setSession({ user, token }) {
      localStorage.setItem('pv_user', JSON.stringify(user));
      if (token) localStorage.setItem('pv_token', token);
      else localStorage.removeItem('pv_token');
    },
    clear() {
      localStorage.removeItem('pv_user');
      localStorage.removeItem('pv_token');
    },
    isAuthenticated() {
      return !!this.getUser();
    },
    redirectToHome(user) {
      const u = user || this.getUser();
      if (!u) {
        window.location.href = '/index.html';
        return;
      }
      if (u.role === 'admin') {
        window.location.href = '/admin-dashboard.html';
        return;
      }
      window.location.href = '/staff-dashboard.html';
    },
    requireAuth({ roles } = {}) {
      const user = this.getUser();
      if (!user) {
        localStorage.setItem('pv_flash', JSON.stringify({ type: 'warning', message: PV.t('auth.sessionExpired') }));
        window.location.href = '/index.html';
        return null;
      }

      if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user.role)) {
        this.redirectToHome(user);
        return null;
      }

      return user;
    }
  };

  PV.api = {
    async request(path, { method, body, auth, headers } = {}) {
      const url = `${PV.apiBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
      const h = new Headers(headers || {});
      h.set('Content-Type', 'application/json');

      const lang = PV.getLanguage ? PV.getLanguage() : 'en';
      const acceptLang = lang === 'da' ? 'da' : lang === 'ps' ? 'ps' : 'en';
      h.set('Accept-Language', acceptLang);

      if (auth !== false) {
        const token = PV.session.getToken();
        if (token) h.set('Authorization', `Bearer ${token}`);
      }

      const res = await fetch(url, {
        method: method || 'GET',
        headers: h,
        body: body ? JSON.stringify(body) : undefined
      });

      let data;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        if (res.status === 401) {
          PV.session.clear();
          localStorage.setItem('pv_flash', JSON.stringify({ type: 'warning', message: PV.t('auth.sessionExpired') }));
        }

        const message = data?.message || `Request failed (${res.status})`;
        const err = new Error(message);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    },

    get(path, options) {
      return this.request(path, { ...options, method: 'GET' });
    },
    post(path, body, options) {
      return this.request(path, { ...options, method: 'POST', body });
    },
    patch(path, body, options) {
      return this.request(path, { ...options, method: 'PATCH', body });
    },
    del(path, options) {
      return this.request(path, { ...options, method: 'DELETE' });
    }
  };

  PV.consumeFlash = function () {
    const raw = localStorage.getItem('pv_flash');
    if (!raw) return;
    localStorage.removeItem('pv_flash');

    try {
      const flash = JSON.parse(raw);
      PV.toast({ type: flash.type, title: flash.type === 'error' ? 'Error' : 'Info', message: flash.message });
    } catch {
      // ignore
    }
  };
})();
