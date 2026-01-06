(function () {
  window.PV = window.PV || {};

  const PAYMENTS = [
    { no: 'PAY-060', customer: 'Ahmad', amount: 1200, date: '2026-01-06', method: 'Cash', status: 'Completed' },
    { no: 'PAY-059', customer: 'Sami', amount: 800, date: '2026-01-06', method: 'Cash', status: 'Completed' },
    { no: 'PAY-058', customer: 'Maryam', amount: 600, date: '2026-01-06', method: 'Transfer', status: 'Completed' }
  ];

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['staff', 'admin'] });

    const tbody = document.getElementById('payments-table-body');
    const searchEl = document.getElementById('payments-search');
    const paginationEl = document.getElementById('payments-pagination');

    const state = { search: '', page: 1, pageSize: 10 };

    function filtered() {
      const q = state.search.toLowerCase();
      return PAYMENTS.filter((p) => !q || p.customer.toLowerCase().includes(q) || p.no.toLowerCase().includes(q));
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
              <td><span class="pv-badge success">${p.status}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" type="button">${PV.t('common.view')}</button>
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

    const form = document.getElementById('payment-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        PV.toast({ type: 'success', title: 'Payment', message: 'Recorded (demo).' });
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
