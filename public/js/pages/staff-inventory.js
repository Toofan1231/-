(function () {
  window.PV = window.PV || {};

  const PRODUCTS = [
    { name: 'Wall Paint 20L', category: 'Paint', barki: 24, shah: 18, min: 10 },
    { name: 'Primer 5L', category: 'Paint', barki: 8, shah: 4, min: 8 },
    { name: 'Varnish 4L', category: 'Varnish', barki: 6, shah: 2, min: 6 },
    { name: 'Thinner 1L', category: 'Chemicals', barki: 55, shah: 36, min: 20 },
    { name: 'Brush Set', category: 'Tools', barki: 7, shah: 3, min: 5 }
  ];

  const BRANCH_COL = {
    1: 'barki',
    2: 'shah'
  };

  function statusFor(qty, min) {
    if (qty <= min * 0.6) return { label: 'Critical', badge: 'danger' };
    if (qty <= min) return { label: 'Low', badge: 'warning' };
    return { label: 'Good', badge: 'success' };
  }

  PV.onReady(() => {
    const user = PV.auth.initProtectedPage({ roles: ['staff', 'admin'] });
    if (!user) return;

    const tbody = document.getElementById('inventory-table-body');
    const searchEl = document.getElementById('inventory-search');
    const categoryEl = document.getElementById('inventory-category');
    const statusEl = document.getElementById('inventory-status');

    const branchId = user.branch_id || 1;
    const col = BRANCH_COL[branchId] || 'barki';

    const state = { search: '', category: '', status: '' };

    function filtered() {
      return PRODUCTS.filter((p) => {
        const q = state.search.toLowerCase();
        const matchesSearch = !q || p.name.toLowerCase().includes(q);
        const matchesCategory = !state.category || p.category === state.category;
        const qty = Number(p[col] || 0);
        const st = statusFor(qty, p.min);
        const matchesStatus = !state.status || st.label === state.status;
        return matchesSearch && matchesCategory && matchesStatus;
      });
    }

    function render() {
      const rows = filtered();
      if (!tbody) return;
      tbody.innerHTML = rows
        .map((p) => {
          const qty = Number(p[col] || 0);
          const st = statusFor(qty, p.min);
          return `
            <tr>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td class="pv-mono">${qty}</td>
              <td class="pv-mono">${p.min}</td>
              <td><span class="pv-badge ${st.badge}">${st.label}</span></td>
            </tr>`;
        })
        .join('');
    }

    if (searchEl) searchEl.addEventListener('input', PV.debounce(() => {
      state.search = searchEl.value;
      render();
    }, 120));
    if (categoryEl) categoryEl.addEventListener('change', () => {
      state.category = categoryEl.value;
      render();
    });
    if (statusEl) statusEl.addEventListener('change', () => {
      state.status = statusEl.value;
      render();
    });

    render();
  });
})();
