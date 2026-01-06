(function () {
  window.PV = window.PV || {};

  const CUSTOMERS = [
    { name: 'Ahmad', phone: '0700000001', email: 'ahmad@example.com' },
    { name: 'Maryam', phone: '0700000002', email: 'maryam@example.com' },
    { name: 'Karim', phone: '0700000003', email: 'karim@example.com' },
    { name: 'Sami', phone: '0700000004', email: 'sami@example.com' }
  ];

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['staff', 'admin'] });

    const tbody = document.getElementById('customers-table-body');
    const searchEl = document.getElementById('customers-search');

    const state = { search: '' };

    function filtered() {
      const q = state.search.toLowerCase();
      return CUSTOMERS.filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }

    function render() {
      if (!tbody) return;
      tbody.innerHTML = filtered()
        .map(
          (c, idx) => `
          <tr>
            <td>${c.name}</td>
            <td class="pv-mono">${c.phone}</td>
            <td>${c.email || '-'}</td>
            <td class="text-end">
              <button type="button" class="btn btn-sm btn-outline-primary" data-view="${idx}">${PV.t('common.view')}</button>
            </td>
          </tr>`
        )
        .join('');

      tbody.querySelectorAll('[data-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const c = CUSTOMERS[Number(btn.getAttribute('data-view'))];
          PV.toast({ type: 'success', title: 'Customer', message: `${c.name} • ${c.phone}` });
        });
      });
    }

    if (searchEl) searchEl.addEventListener('input', PV.debounce(() => {
      state.search = searchEl.value;
      render();
    }, 120));

    render();
  });
})();
