(function () {
  window.PV = window.PV || {};

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  PV.onReady(() => {
    const user = PV.auth.initProtectedPage({ roles: ['staff', 'admin'] });
    if (!user) return;

    const welcomeEl = document.getElementById('pv-welcome');
    if (welcomeEl) {
      const branch = user.branch_id ? ` • ${user.branch_id}` : '';
      welcomeEl.textContent = `${PV.t('dashboard.welcome', { name: user.name })}${branch}`;
    }

    const stats = {
      mySalesToday: 12600,
      customersServed: 8,
      invoicesCreated: 6
    };

    setText('kpi-my-sales', PV.formatCurrency(stats.mySalesToday));
    setText('kpi-customers-served', stats.customersServed);
    setText('kpi-invoices', stats.invoicesCreated);

    PV.charts.createPie(document.getElementById('chart-today-sales'), {
      labels: ['Paint', 'Varnish', 'Tools'],
      data: [52, 28, 20]
    });

    PV.charts.createBar(document.getElementById('chart-performance'), {
      labels: ['Me', 'Branch Avg'],
      data: [stats.mySalesToday, 9800]
    });

    const salesBody = document.getElementById('my-recent-sales-body');
    if (salesBody) {
      const sales = [
        { invoice: 'INV-204', customer: 'Ahmad', amount: 3400, date: new Date() },
        { invoice: 'INV-203', customer: 'Sami', amount: 1800, date: new Date() },
        { invoice: 'INV-202', customer: 'Karim', amount: 2900, date: new Date() },
        { invoice: 'INV-201', customer: 'Hameed', amount: 1500, date: new Date() },
        { invoice: 'INV-200', customer: 'Maryam', amount: 1000, date: new Date() }
      ];

      salesBody.innerHTML = sales
        .map(
          (s) => `
          <tr>
            <td class="pv-mono">${s.invoice}</td>
            <td>${s.customer}</td>
            <td class="pv-mono">${PV.formatCurrency(s.amount)}</td>
            <td>${PV.formatDate(s.date)}</td>
          </tr>`
        )
        .join('');
    }

    const paymentsBody = document.getElementById('payments-today-body');
    if (paymentsBody) {
      const payments = [
        { no: 'PAY-060', customer: 'Ahmad', amount: 1200, method: 'Cash', date: new Date() },
        { no: 'PAY-059', customer: 'Sami', amount: 800, method: 'Cash', date: new Date() },
        { no: 'PAY-058', customer: 'Maryam', amount: 600, method: 'Transfer', date: new Date() }
      ];

      paymentsBody.innerHTML = payments
        .map(
          (p) => `
          <tr>
            <td class="pv-mono">${p.no}</td>
            <td>${p.customer}</td>
            <td class="pv-mono">${PV.formatCurrency(p.amount)}</td>
            <td>${p.method}</td>
            <td>${PV.formatDate(p.date)}</td>
          </tr>`
        )
        .join('');
    }

    document.querySelectorAll('[data-pv-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.getAttribute('data-pv-action');
        const routes = {
          newSale: '/staff-sales.html',
          inventory: '/staff-inventory.html',
          payment: '/staff-payments.html',
          customers: '/staff-customers.html'
        };
        if (routes[action]) window.location.href = routes[action];
      });
    });
  });
})();
