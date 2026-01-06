(function () {
  window.PV = window.PV || {};

  const PURCHASES = [
    { po: 'PO-501', supplier: 'Kabul Paint Co.', date: '2026-01-06', amount: 42000, status: 'Received' },
    { po: 'PO-500', supplier: 'Herat Chemicals', date: '2026-01-05', amount: 18000, status: 'Pending' },
    { po: 'PO-499', supplier: 'Asia Tools', date: '2026-01-04', amount: 6500, status: 'Received' },
    { po: 'PO-498', supplier: 'Kabul Paint Co.', date: '2026-01-03', amount: 9000, status: 'Cancelled' }
  ];

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['admin'] });

    const tbody = document.getElementById('purchases-table-body');
    const searchEl = document.getElementById('purchases-search');
    const statusEl = document.getElementById('purchases-status');
    const paginationEl = document.getElementById('purchases-pagination');

    const state = { search: '', status: '', page: 1, pageSize: 10 };

    function filtered() {
      const q = state.search.toLowerCase();
      return PURCHASES.filter((p) => {
        const matchesSearch = !q || p.po.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q);
        const matchesStatus = !state.status || p.status === state.status;
        return matchesSearch && matchesStatus;
      });
    }

    function render() {
      const rows = filtered();
      const page = PV.table.paginate(rows, { page: state.page, pageSize: state.pageSize });
      state.page = page.page;

      if (tbody) {
        tbody.innerHTML = page.items
          .map(
            (p) => `
            <tr>
              <td class="pv-mono">${p.po}</td>
              <td>${p.supplier}</td>
              <td>${PV.formatDate(p.date)}</td>
              <td class="pv-mono">${PV.formatCurrency(p.amount)}</td>
              <td><span class="pv-badge ${p.status === 'Received' ? 'success' : p.status === 'Pending' ? 'warning' : 'danger'}">${p.status}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" type="button">${PV.t('common.view')}</button>
                <button class="btn btn-sm btn-outline-secondary" type="button">Mark Received</button>
              </td>
            </tr>`
          )
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

    if (searchEl) searchEl.addEventListener('input', PV.debounce(() => {
      state.search = searchEl.value;
      state.page = 1;
      render();
    }, 120));

    if (statusEl) statusEl.addEventListener('change', () => {
      state.status = statusEl.value;
      state.page = 1;
      render();
    });

    render();
  });
})();
