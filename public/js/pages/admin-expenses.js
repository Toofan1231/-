(function () {
  window.PV = window.PV || {};

  const EXPENSES = [
    { date: '2026-01-06', category: 'Transport', description: 'Delivery', amount: 800, branch: 'Barki', status: 'Approved' },
    { date: '2026-01-06', category: 'Utilities', description: 'Electricity', amount: 1200, branch: 'Shah Shahid', status: 'Approved' },
    { date: '2026-01-05', category: 'Maintenance', description: 'Repairs', amount: 950, branch: 'Barki', status: 'Pending' },
    { date: '2026-01-04', category: 'Supplies', description: 'Stationery', amount: 350, branch: 'Barki', status: 'Approved' }
  ];

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['admin'] });

    const tbody = document.getElementById('expenses-table-body');
    const categoryEl = document.getElementById('expenses-category');
    const branchEl = document.getElementById('expenses-branch');
    const searchEl = document.getElementById('expenses-search');
    const paginationEl = document.getElementById('expenses-pagination');

    const state = { search: '', category: '', branch: '', page: 1, pageSize: 10 };

    function filtered() {
      const q = state.search.toLowerCase();
      return EXPENSES.filter((x) => {
        const matchesSearch = !q || x.description.toLowerCase().includes(q) || x.category.toLowerCase().includes(q);
        const matchesCategory = !state.category || x.category === state.category;
        const matchesBranch = !state.branch || x.branch === state.branch;
        return matchesSearch && matchesCategory && matchesBranch;
      });
    }

    function render() {
      const rows = filtered();
      const page = PV.table.paginate(rows, { page: state.page, pageSize: state.pageSize });
      state.page = page.page;

      if (tbody) {
        tbody.innerHTML = page.items
          .map(
            (x, idx) => `
            <tr>
              <td>${PV.formatDate(x.date)}</td>
              <td>${x.category}</td>
              <td>${x.description}</td>
              <td class="pv-mono">${PV.formatCurrency(x.amount)}</td>
              <td>${x.branch}</td>
              <td><span class="pv-badge ${x.status === 'Approved' ? 'success' : 'warning'}">${x.status}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" type="button" data-view="${idx}">${PV.t('common.view')}</button>
                <button class="btn btn-sm btn-outline-secondary" type="button">${PV.t('common.edit')}</button>
              </td>
            </tr>`
          )
          .join('');

        tbody.querySelectorAll('[data-view]').forEach((btn) => {
          btn.addEventListener('click', () => PV.toast({ type: 'success', title: 'Expense', message: 'Expense details (demo).' }));
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

    if (categoryEl) categoryEl.addEventListener('change', () => {
      state.category = categoryEl.value;
      updateAndRender();
    });

    if (branchEl) branchEl.addEventListener('change', () => {
      state.branch = branchEl.value;
      updateAndRender();
    });

    const form = document.getElementById('expense-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        PV.toast({ type: 'success', title: 'Expense', message: 'Saved (demo).' });
        const modalEl = document.getElementById('newExpenseModal');
        if (modalEl && window.bootstrap?.Modal) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
      });
    }

    render();
  });
})();
