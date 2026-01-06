(function () {
  window.PV = window.PV || {};

  const PAYMENTS = [
    { no: 'PAY-240', customer: 'Ahmad', amount: 5000, date: '2026-01-06', method: 'Cash', status: 'Completed' },
    { no: 'PAY-239', customer: 'Maryam', amount: 2200, date: '2026-01-06', method: 'Transfer', status: 'Completed' },
    { no: 'PAY-238', customer: 'Hameed', amount: 3000, date: '2026-01-05', method: 'Cash', status: 'Pending' },
    { no: 'PAY-237', customer: 'Sami', amount: 1600, date: '2026-01-05', method: 'Cash', status: 'Completed' },
    { no: 'PAY-236', customer: 'Karim', amount: 4100, date: '2026-01-04', method: 'Cash', status: 'Pending' }
  ];

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['admin'] });

    const tbody = document.getElementById('payments-table-body');
    const searchEl = document.getElementById('payments-search');
    const methodEl = document.getElementById('payments-method');
    const statusEl = document.getElementById('payments-status');
    const paginationEl = document.getElementById('payments-pagination');

    const state = { search: '', method: '', status: '', page: 1, pageSize: 10 };

    function filtered() {
      const q = state.search.toLowerCase();
      return PAYMENTS.filter((p) => {
        const matchesSearch = !q || p.customer.toLowerCase().includes(q) || p.no.toLowerCase().includes(q);
        const matchesMethod = !state.method || p.method === state.method;
        const matchesStatus = !state.status || p.status === state.status;
        return matchesSearch && matchesMethod && matchesStatus;
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
              <td class="pv-mono">${p.no}</td>
              <td>${p.customer}</td>
              <td class="pv-mono">${PV.formatCurrency(p.amount)}</td>
              <td>${PV.formatDate(p.date)}</td>
              <td>${p.method}</td>
              <td><span class="pv-badge ${p.status === 'Completed' ? 'success' : 'warning'}">${p.status}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" type="button">${PV.t('common.view')}</button>
                <button class="btn btn-sm btn-outline-secondary" type="button">Receipt</button>
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

    function updateAndRender() {
      state.page = 1;
      render();
    }

    if (searchEl) searchEl.addEventListener('input', PV.debounce(() => {
      state.search = searchEl.value;
      updateAndRender();
    }, 120));
    if (methodEl) methodEl.addEventListener('change', () => {
      state.method = methodEl.value;
      updateAndRender();
    });
    if (statusEl) statusEl.addEventListener('change', () => {
      state.status = statusEl.value;
      updateAndRender();
    });

    const form = document.getElementById('payment-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        PV.toast({ type: 'success', title: 'Payment', message: 'Recorded (demo). Wire to /api/payments.' });
        const modalEl = document.getElementById('newPaymentModal');
        if (modalEl && window.bootstrap?.Modal) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
      });
    }

    render();
  });
})();
