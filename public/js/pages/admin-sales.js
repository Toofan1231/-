(function () {
  window.PV = window.PV || {};

  const ALL_SALES = [
    { invoice: 'INV-1041', customer: 'Ahmad', branch: 'Barki', amount: 12500, status: 'Paid', date: '2026-01-06' },
    { invoice: 'INV-1040', customer: 'Hameed', branch: 'Shah Shahid', amount: 8400, status: 'Pending', date: '2026-01-06' },
    { invoice: 'INV-1039', customer: 'Sami', branch: 'Barki', amount: 6200, status: 'Paid', date: '2026-01-05' },
    { invoice: 'INV-1038', customer: 'Karim', branch: 'Barki', amount: 9100, status: 'Paid', date: '2026-01-05' },
    { invoice: 'INV-1037', customer: 'Maryam', branch: 'Shah Shahid', amount: 4300, status: 'Pending', date: '2026-01-04' },
    { invoice: 'INV-1036', customer: 'Naser', branch: 'Barki', amount: 2100, status: 'Paid', date: '2026-01-04' },
    { invoice: 'INV-1035', customer: 'Farid', branch: 'Shah Shahid', amount: 7600, status: 'Paid', date: '2026-01-03' },
    { invoice: 'INV-1034', customer: 'Latif', branch: 'Barki', amount: 3900, status: 'Pending', date: '2026-01-03' },
    { invoice: 'INV-1033', customer: 'Hassan', branch: 'Barki', amount: 5200, status: 'Paid', date: '2026-01-02' },
    { invoice: 'INV-1032', customer: 'Zahra', branch: 'Shah Shahid', amount: 6100, status: 'Paid', date: '2026-01-02' },
    { invoice: 'INV-1031', customer: 'Yasin', branch: 'Barki', amount: 3000, status: 'Pending', date: '2026-01-01' }
  ];

  PV.onReady(() => {
    const user = PV.auth.initProtectedPage({ roles: ['admin'] });
    if (!user) return;

    PV.salesForm && PV.salesForm.init();

    const tbody = document.getElementById('sales-table-body');
    const searchEl = document.getElementById('sales-search');
    const branchEl = document.getElementById('sales-branch');
    const statusEl = document.getElementById('sales-status');
    const pageSizeEl = document.getElementById('sales-page-size');
    const paginationEl = document.getElementById('sales-pagination');

    const state = {
      search: '',
      branch: '',
      status: '',
      page: 1,
      pageSize: 10
    };

    function filtered() {
      return ALL_SALES.filter((s) => {
        const q = state.search.toLowerCase();
        const matchesSearch = !q || s.invoice.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q);
        const matchesBranch = !state.branch || s.branch === state.branch;
        const matchesStatus = !state.status || s.status === state.status;
        return matchesSearch && matchesBranch && matchesStatus;
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
              <td>${s.branch}</td>
              <td class="pv-mono">${PV.formatCurrency(s.amount)}</td>
              <td><span class="pv-badge ${s.status === 'Paid' ? 'success' : 'warning'}">${s.status}</span></td>
              <td>${PV.formatDate(s.date)}</td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-primary" data-view="${s.invoice}">${PV.t('common.view')}</button>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-print="${s.invoice}">${PV.t('common.print')}</button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${s.invoice}">${PV.t('common.delete')}</button>
              </td>
            </tr>`
          )
          .join('');

        tbody.querySelectorAll('[data-print]').forEach((b) => {
          b.addEventListener('click', () => {
            PV.toast({ type: 'success', title: 'Print', message: 'Printing (demo)…' });
            window.print();
          });
        });

        tbody.querySelectorAll('[data-delete]').forEach((b) => {
          b.addEventListener('click', () => {
            PV.toast({ type: 'warning', title: 'Delete', message: 'Soft delete (demo). Wire to backend endpoint when available.' });
          });
        });

        tbody.querySelectorAll('[data-view]').forEach((b) => {
          b.addEventListener('click', () => {
            PV.toast({ type: 'success', title: 'Details', message: 'Sale details modal can be implemented with /api/sales/:id.' });
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
    if (branchEl) branchEl.addEventListener('change', () => {
      state.branch = branchEl.value;
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

    render();
  });
})();
