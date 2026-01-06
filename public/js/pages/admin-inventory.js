(function () {
  window.PV = window.PV || {};

  const PRODUCTS = [
    { name: 'Wall Paint 20L', category: 'Paint', barki: 24, shah: 18, min: 10, value: 4500 },
    { name: 'Primer 5L', category: 'Paint', barki: 8, shah: 4, min: 8, value: 1200 },
    { name: 'Varnish 4L', category: 'Varnish', barki: 6, shah: 2, min: 6, value: 1600 },
    { name: 'Thinner 1L', category: 'Chemicals', barki: 55, shah: 36, min: 20, value: 220 },
    { name: 'Brush Set', category: 'Tools', barki: 7, shah: 3, min: 5, value: 380 }
  ];

  function statusFor(total, min) {
    if (total <= min * 0.6) return { label: 'Critical', badge: 'danger' };
    if (total <= min) return { label: 'Low', badge: 'warning' };
    return { label: 'Good', badge: 'success' };
  }

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['admin'] });

    const tbody = document.getElementById('inventory-table-body');
    const searchEl = document.getElementById('inventory-search');
    const categoryEl = document.getElementById('inventory-category');
    const statusEl = document.getElementById('inventory-status');
    const paginationEl = document.getElementById('inventory-pagination');
    const pageSizeEl = document.getElementById('inventory-page-size');

    const state = { search: '', category: '', status: '', page: 1, pageSize: 10 };

    function filtered() {
      return PRODUCTS.filter((p) => {
        const q = state.search.toLowerCase();
        const matchesSearch = !q || p.name.toLowerCase().includes(q);
        const matchesCategory = !state.category || p.category === state.category;
        const totalQty = p.barki + p.shah;
        const st = statusFor(totalQty, p.min);
        const matchesStatus = !state.status || st.label === state.status;
        return matchesSearch && matchesCategory && matchesStatus;
      });
    }

    function renderAlerts() {
      const low = PRODUCTS.filter((p) => statusFor(p.barki + p.shah, p.min).label !== 'Good');
      const banner = document.getElementById('low-stock-banner');
      const list = document.getElementById('low-stock-list');
      if (!banner || !list) return;

      if (low.length === 0) {
        banner.classList.add('d-none');
        return;
      }

      banner.classList.remove('d-none');
      list.innerHTML = low
        .map((p) => `<li>${p.name} (${p.barki + p.shah} / min ${p.min})</li>`)
        .join('');
    }

    function render() {
      const rows = filtered();
      const page = PV.table.paginate(rows, { page: state.page, pageSize: state.pageSize });
      state.page = page.page;

      if (tbody) {
        tbody.innerHTML = page.items
          .map((p) => {
            const totalQty = p.barki + p.shah;
            const st = statusFor(totalQty, p.min);
            const totalValue = totalQty * p.value;
            return `
              <tr>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td class="pv-mono">${p.barki}</td>
                <td class="pv-mono">${p.shah}</td>
                <td class="pv-mono">${p.min}</td>
                <td class="pv-mono">${PV.formatCurrency(totalValue)}</td>
                <td><span class="pv-badge ${st.badge}">${st.label}</span></td>
                <td class="text-end">
                  <button type="button" class="btn btn-sm btn-outline-primary">${PV.t('common.view')}</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary">${PV.t('common.edit')}</button>
                </td>
              </tr>`;
          })
          .join('');
      }

      PV.table.renderPagination(paginationEl, {
        page: page.page,
        totalPages: page.totalPages,
        onChange: (p) => {
          state.page = p;
          render();
        }
      });
    }

    function updateAndRender() {
      state.page = 1;
      render();
    }

    if (searchEl) searchEl.addEventListener('input', PV.debounce(() => {
      state.search = searchEl.value;
      updateAndRender();
    }, 120));
    if (categoryEl) categoryEl.addEventListener('change', () => {
      state.category = categoryEl.value;
      updateAndRender();
    });
    if (statusEl) statusEl.addEventListener('change', () => {
      state.status = statusEl.value;
      updateAndRender();
    });
    if (pageSizeEl) pageSizeEl.addEventListener('change', () => {
      state.pageSize = Number(pageSizeEl.value || 10);
      updateAndRender();
    });

    renderAlerts();
    render();
  });
})();
