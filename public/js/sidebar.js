(function () {
  window.PV = window.PV || {};

  const ICONS = {
    dashboard: 'bi-speedometer2',
    sales: 'bi-receipt',
    purchases: 'bi-bag',
    inventory: 'bi-box-seam',
    customers: 'bi-people',
    suppliers: 'bi-truck',
    payments: 'bi-cash-coin',
    expenses: 'bi-wallet2',
    users: 'bi-person-badge',
    reports: 'bi-graph-up',
    settings: 'bi-gear'
  };

  const NAV = {
    admin: [
      { key: 'dashboard', href: '/admin-dashboard.html' },
      { key: 'sales', href: '/admin-sales.html' },
      { key: 'purchases', href: '/admin-purchases.html' },
      { key: 'inventory', href: '/admin-inventory.html' },
      { key: 'customers', href: '/admin-customers.html' },
      { key: 'suppliers', href: '/admin-suppliers.html' },
      { key: 'payments', href: '/admin-payments.html' },
      { key: 'expenses', href: '/admin-expenses.html' },
      { key: 'users', href: '/admin-users.html' },
      { key: 'reports', href: '/admin-reports.html' },
      { key: 'settings', href: '/admin-dashboard.html#settings' }
    ],
    staff: [
      { key: 'dashboard', href: '/staff-dashboard.html' },
      { key: 'sales', href: '/staff-sales.html' },
      { key: 'inventory', href: '/staff-inventory.html' },
      { key: 'customers', href: '/staff-customers.html' },
      { key: 'payments', href: '/staff-payments.html' },
      { key: 'settings', href: '/staff-dashboard.html#settings' }
    ]
  };

  PV.sidebar = {
    init({ role }) {
      const sidebar = document.getElementById('pv-sidebar');
      const navEl = document.getElementById('pv-sidebar-nav');
      if (!sidebar || !navEl) return;

      const items = NAV[role] || [];
      const current = window.location.pathname.split('/').pop();

      navEl.innerHTML = '';
      const list = document.createElement('div');
      list.className = 'pv-nav';

      items.forEach((it) => {
        const a = document.createElement('a');
        a.href = it.href;
        a.setAttribute('data-nav-key', it.key);
        a.innerHTML = `<i class="bi ${ICONS[it.key] || 'bi-circle'}"></i><span data-i18n="nav.${it.key}"></span>`;

        const target = it.href.split('/').pop();
        if (target === current) a.classList.add('active');

        list.appendChild(a);
      });

      navEl.appendChild(list);

      PV.applyTranslations(navEl);

      const toggleBtn = document.getElementById('pv-sidebar-toggle');
      const closeBtn = document.getElementById('pv-sidebar-close');

      const close = () => {
        sidebar.classList.remove('open');
        const backdrop = document.querySelector('.pv-sidebar-backdrop');
        if (backdrop) backdrop.remove();
      };

      const open = () => {
        sidebar.classList.add('open');
        if (!document.querySelector('.pv-sidebar-backdrop')) {
          const bd = document.createElement('div');
          bd.className = 'pv-sidebar-backdrop';
          bd.addEventListener('click', close);
          document.body.appendChild(bd);
        }
      };

      if (toggleBtn) toggleBtn.addEventListener('click', () => (sidebar.classList.contains('open') ? close() : open()));
      if (closeBtn) closeBtn.addEventListener('click', close);

      document.addEventListener('pv:languageChanged', () => {
        PV.applyTranslations(navEl);
      });
    }
  };
})();
