(function () {
  window.PV = window.PV || {};

  const ALL_SALES = [
    { invoice: 'INV-204', customer: 'Ahmad', branch_id: 1, amount: 3400, status: 'Paid', date: '2026-01-06', owner: 'me' },
    { invoice: 'INV-203', customer: 'Sami', branch_id: 1, amount: 1800, status: 'Paid', date: '2026-01-06', owner: 'me' },
    { invoice: 'INV-202', customer: 'Karim', branch_id: 1, amount: 2900, status: 'Pending', date: '2026-01-05', owner: 'me' },
    { invoice: 'INV-201', customer: 'Hameed', branch_id: 2, amount: 1500, status: 'Paid', date: '2026-01-05', owner: 'other' },
    { invoice: 'INV-200', customer: 'Maryam', branch_id: 1, amount: 1000, status: 'Paid', date: '2026-01-04', owner: 'me' }
  ];

  const BRANCH = {
    1: 'Barki',
    2: 'Shah Shahid'
  };

  PV.onReady(() => {
    const user = PV.auth.initProtectedPage({ roles: ['staff', 'admin'] });
    if (!user) return;

    PV.salesForm && PV.salesForm.init();

    const tbody = document.getElementById('sales-table-body');
    const searchEl = document.getElementById('sales-search');
    const statusEl = document.getElementById('sales-status');
    const pageSizeEl = document.getElementById('sales-page-size');
    const paginationEl = document.getElementById('sales-pagination');

    const state = {
      search: '',
      status: '',
      page: 1,
      pageSize: 10
    };

    function filtered() {
      const branchId = user.branch_id || 1;
      return ALL_SALES.filter((s) => {
        if (s.branch_id !== branchId) return false;
        if (user.role !== 'admin' && s.owner !== 'me') return false;

        const q = state.search.toLowerCase();
        const matchesSearch = !q || s.invoice.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q);
        const matchesStatus = !state.status || s.status === state.status;
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
            (s) => `
            <tr>
              <td class="pv-mono">${s.invoice}</td>
              <td>${s.customer}</td>
              <td>${BRANCH[s.branch_id] || '-'}</td>
              <td class="pv-mono">${PV.formatCurrency(s.amount)}</td>
              <td><span class="pv-badge ${s.status === 'Paid' ? 'success' : 'warning'}">${s.status}</span></td>
              <td>${PV.formatDate(s.date)}</td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-primary" data-view="${s.invoice}">${PV.t('common.view')}</button>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-print="${s.invoice}">${PV.t('common.print')}</button>
              </td>
            </tr>`
          )
          .join('');

        tbody.querySelectorAll('[data-print]').forEach((b) => {
          b.addEventListener('click', () => window.print());
        });

        tbody.querySelectorAll('[data-view]').forEach((b) => {
          b.addEventListener('click', () => {
            PV.toast({ type: 'success', title: 'Details', message: 'Staff can view own invoices only (demo).' });
          });
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

    function updateAndRender() {
      state.page = 1;
      render();
    }

    if (searchEl) searchEl.addEventListener('input', PV.debounce(() => {
      state.search = searchEl.value;
      updateAndRender();
    }, 120));
    if (statusEl) statusEl.addEventListener('change', () => {
      state.status = statusEl.value;
      updateAndRender();
    });
    if (pageSizeEl) pageSizeEl.addEventListener('change', () => {
      state.pageSize = Number(pageSizeEl.value || 10);
      updateAndRender();
    });

    render();
  });
})();
