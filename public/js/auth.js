(function () {
  window.PV = window.PV || {};

  PV.auth = {
    initLoginPage() {
      const form = document.getElementById('login-form');
      const langSelect = document.getElementById('pv-lang-select');
      const emailInput = document.getElementById('email');
      const rememberCheckbox = document.getElementById('remember');
      const submitBtn = document.getElementById('login-submit');
      const errorEl = document.getElementById('login-error');

      PV.initLanguageSelector(langSelect);
      PV.applyTranslations();
      PV.consumeFlash && PV.consumeFlash();

      const rememberedEmail = localStorage.getItem('pv_remember_email');
      if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
      }

      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.add('d-none');
        }

        const email = emailInput?.value?.trim();
        const password = document.getElementById('password')?.value;
        const remember = !!rememberCheckbox?.checked;

        if (!email || !password) {
          if (errorEl) {
            errorEl.textContent = PV.t('auth.invalidCredentials');
            errorEl.classList.remove('d-none');
          }
          return;
        }

        const originalText = submitBtn?.innerHTML;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span class="pv-spinner" aria-hidden="true"></span> <span class="ms-2">${PV.t('auth.signingIn')}</span>`;
        }

        try {
          const res = await PV.api.post('/auth/login', { email, password }, { auth: false });
          const user = res?.data?.user;
          if (!user) throw new Error('Invalid server response');

          PV.session.setSession({ user, token: res?.data?.token });

          if (remember) localStorage.setItem('pv_remember_email', email);
          else localStorage.removeItem('pv_remember_email');

          PV.session.redirectToHome(user);
        } catch (err) {
          const msg = err?.data?.message || err.message || PV.t('auth.invalidCredentials');
          if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.remove('d-none');
          }
          PV.toast({ type: 'error', title: 'Login', message: msg });
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        }
      });
    },

    initProtectedPage({ roles } = {}) {
      PV.consumeFlash && PV.consumeFlash();
      const user = PV.session.requireAuth({ roles });
      if (!user) return null;

      const langSelect = document.getElementById('pv-lang-select');
      PV.initLanguageSelector(langSelect);

      const userNameEl = document.getElementById('pv-user-name');
      if (userNameEl) userNameEl.textContent = user.name;

      const userMetaEl = document.getElementById('pv-user-meta');
      if (userMetaEl) {
        const branch = user.branch_id ? String(user.branch_id) : '-';
        userMetaEl.textContent = `${user.role}${branch ? ` • ${branch}` : ''}`;
      }

      const logoutBtn = document.getElementById('pv-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          PV.session.clear();
          window.location.href = '/index.html';
        });
      }

      PV.sidebar && PV.sidebar.init({ role: user.role });
      PV.applyTranslations();

      return user;
    }
  };
})();
