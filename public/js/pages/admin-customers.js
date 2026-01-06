(function () {
  window.PV = window.PV || {};

  const CUSTOMERS = [
    { name: 'Ahmad', phone: '0700000001', email: 'ahmad@example.com', limit: 50000, used: 12000, active: true },
    { name: 'Maryam', phone: '0700000002', email: 'maryam@example.com', limit: 30000, used: 31000, active: true },
    { name: 'Karim', phone: '0700000003', email: 'karim@example.com', limit: 20000, used: 20000, active: true },
    { name: 'Sami', phone: '0700000004', email: 'sami@example.com', limit: 15000, used: 4500, active: true },
    { name: 'Hameed', phone: '0700000005', email: 'hameed@example.com', limit: 0, used: 0, active: false }
  ];

  function creditStatus(c) {
    if (c.limit <= 0) return 'Good';
    if (c.used > c.limit) return 'Over Limit';
    if (c.used === c.limit) return 'At Limit';
    return 'Good';
  }

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['admin'] });

    const tbody = document.getElementById('customers-table-body');
    const searchEl = document.getElementById('customers-search');
    const creditEl = document.getElementById('customers-credit-filter');
    const paginationEl = document.getElementById('customers-pagination');
    const pageSizeEl = document.getElementById('customers-page-size');

    const state = { search: '', credit: '', page: 1, pageSize: 10 };

    function filtered() {
      return CUSTOMERS.filter((c) => {
        const q = state.search.toLowerCase();
        const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
        const st = creditStatus(c);
        const matchesCredit = !state.credit || st === state.credit;
        return matchesSearch && matchesCredit;
      });
    }

    function render() {
      const rows = filtered();
      const page = PV.table.paginate(rows, { page: state.page, pageSize: state.pageSize });
      state.page = page.page;

      if (tbody) {
        tbody.innerHTML = page.items
          .map((c, idx) => {
            const st = creditStatus(c);
            const badge = st === 'Good' ? 'success' : st === 'At Limit' ? 'warning' : 'danger';
            const available = Math.max(0, c.limit - c.used);
            return `
              <tr>
                <td>${c.name}</td>
                <td class="pv-mono">${c.phone}</td>
                <td>${c.email || '-'}</td>
                <td class="pv-mono">${PV.formatCurrency(c.limit)}</td>
                <td class="pv-mono">${PV.formatCurrency(c.used)}</td>
                <td class="pv-mono">${PV.formatCurrency(available)}</td>
                <td><span class="pv-badge ${badge}">${st}</span></td>
                <td class="text-end">
                  <button type="button" class="btn btn-sm btn-outline-primary" data-view="${idx}">${PV.t('common.view')}</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" data-credit="${idx}">Credit</button>
                </td>
              </tr>`;
          })
          .join('');

        tbody.querySelectorAll('[data-view]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const c = CUSTOMERS[Number(btn.getAttribute('data-view'))];
            const modalEl = document.getElementById('customerDetailsModal');
            if (!modalEl) return;

            modalEl.querySelector('[data-customer-name]').textContent = c.name;
            modalEl.querySelector('[data-customer-phone]').textContent = c.phone;
            modalEl.querySelector('[data-customer-email]').textContent = c.email || '-';
            modalEl.querySelector('[data-customer-limit]').textContent = PV.formatCurrency(c.limit);
            modalEl.querySelector('[data-customer-used]').textContent = PV.formatCurrency(c.used);
            modalEl.querySelector('[data-customer-available]').textContent = PV.formatCurrency(Math.max(0, c.limit - c.used));

            if (window.bootstrap?.Modal) {
              new bootstrap.Modal(modalEl).show();
            }
          });
        });

        tbody.querySelectorAll('[data-credit]').forEach((btn) => {
          btn.addEventListener('click', () => {
            PV.toast({ type: 'success', title: 'Credit', message: 'Update credit limit (demo). Wire to /api/customers/:id.' });
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

    if (creditEl) creditEl.addEventListener('change', () => {
      state.credit = creditEl.value;
      updateAndRender();
    });

    if (pageSizeEl) pageSizeEl.addEventListener('change', () => {
      state.pageSize = Number(pageSizeEl.value || 10);
      updateAndRender();
    });

    render();
  });
})();
