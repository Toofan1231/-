(function () {
  window.PV = window.PV || {};

  const SUPPLIERS = [
    { name: 'Kabul Paint Co.', contact: 'Haji Noor', phone: '0700100001', email: 'sales@kabulpaint.com', location: 'Kabul' },
    { name: 'Herat Chemicals', contact: 'Sayed', phone: '0700100002', email: 'info@heratchem.com', location: 'Herat' },
    { name: 'Asia Tools', contact: 'Hamid', phone: '0700100003', email: 'support@asiatools.com', location: 'Kabul' }
  ];

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['admin'] });

    const tbody = document.getElementById('suppliers-table-body');
    const searchEl = document.getElementById('suppliers-search');
    const paginationEl = document.getElementById('suppliers-pagination');

    const state = { search: '', page: 1, pageSize: 10 };

    function filtered() {
      const q = state.search.toLowerCase();
      return SUPPLIERS.filter((s) => !q || s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q));
    }

    function render() {
      const rows = filtered();
      const page = PV.table.paginate(rows, { page: state.page, pageSize: state.pageSize });
      state.page = page.page;

      if (tbody) {
        tbody.innerHTML = page.items
          .map(
            (s, idx) => `
            <tr>
              <td>${s.name}</td>
              <td>${s.contact || '-'}</td>
              <td class="pv-mono">${s.phone || '-'}</td>
              <td>${s.email || '-'}</td>
              <td>${s.location || '-'}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" type="button" data-view="${idx}">${PV.t('common.view')}</button>
                <button class="btn btn-sm btn-outline-secondary" type="button">History</button>
              </td>
            </tr>`
          )
          .join('');

        tbody.querySelectorAll('[data-view]').forEach((btn) => {
          btn.addEventListener('click', () => PV.toast({ type: 'success', title: 'Supplier', message: 'Supplier details (demo).' }));
        });
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

    render();
  });
})();
