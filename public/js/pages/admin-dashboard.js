(function () {
  window.PV = window.PV || {};

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  PV.onReady(async () => {
    const user = PV.auth.initProtectedPage({ roles: ['admin'] });
    if (!user) return;

    const welcomeEl = document.getElementById('pv-welcome');
    if (welcomeEl) welcomeEl.textContent = PV.t('dashboard.welcome', { name: user.name });

    // In a full integration these would come from API endpoints.
    // For now we render stable demo values and keep the code ready for real API mapping.
    const summary = {
      todaySales: 48500,
      todayExpenses: 9200,
      todayProfit: 39300,
      receivables: 155000,
      activeCustomers: 124,
      totalProducts: 312,
      lowStock: 9,
      overduePayments: 4
    };

    setText('kpi-sales', PV.formatCurrency(summary.todaySales));
    setText('kpi-expenses', PV.formatCurrency(summary.todayExpenses));
    setText('kpi-profit', PV.formatCurrency(summary.todayProfit));
    setText('kpi-receivables', PV.formatCurrency(summary.receivables));

    setText('stat-customers', summary.activeCustomers);
    setText('stat-products', summary.totalProducts);
    setText('stat-low-stock', summary.lowStock);
    setText('stat-overdue', summary.overduePayments);

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return PV.formatDate(d);
    });

    PV.charts.createLine(document.getElementById('chart-sales-trend'), {
      labels: days,
      data: [22000, 28000, 25000, 30000, 41000, 36000, summary.todaySales]
    });

    PV.charts.createBar(document.getElementById('chart-branch-compare'), {
      labels: ['Barki', 'Shah Shahid'],
      data: [29000, 19500]
    });

    PV.charts.createBar(document.getElementById('chart-top-products'), {
      labels: ['Primer', 'Wall Paint', 'Varnish', 'Brush', 'Thinner'],
      data: [12000, 9800, 7600, 5200, 4400],
      horizontal: true
    });

    PV.charts.createPie(document.getElementById('chart-payment-status'), {
      labels: ['Paid', 'Pending'],
      data: [68, 32]
    });

    const recentSales = [
      { invoice: 'INV-1041', customer: 'Ahmad', branch: 'Barki', amount: 12500, status: 'Paid', date: new Date() },
      { invoice: 'INV-1040', customer: 'Hameed', branch: 'Shah Shahid', amount: 8400, status: 'Pending', date: new Date() },
      { invoice: 'INV-1039', customer: 'Sami', branch: 'Barki', amount: 6200, status: 'Paid', date: new Date() },
      { invoice: 'INV-1038', customer: 'Karim', branch: 'Barki', amount: 9100, status: 'Paid', date: new Date() },
      { invoice: 'INV-1037', customer: 'Maryam', branch: 'Shah Shahid', amount: 4300, status: 'Pending', date: new Date() }
    ];

    const salesBody = document.getElementById('recent-sales-body');
    if (salesBody) {
      salesBody.innerHTML = recentSales
        .map(
          (s) => `
          <tr>
            <td class="pv-mono">${s.invoice}</td>
            <td>${s.customer}</td>
            <td>${s.branch}</td>
            <td class="pv-mono">${PV.formatCurrency(s.amount)}</td>
            <td><span class="pv-badge ${s.status === 'Paid' ? 'success' : 'warning'}">${s.status}</span></td>
            <td>${PV.formatDate(s.date)}</td>
          </tr>`
        )
        .join('');
    }

    const recentPaymentsBody = document.getElementById('recent-payments-body');
    if (recentPaymentsBody) {
      const payments = [
        { no: 'PAY-240', customer: 'Ahmad', amount: 5000, method: 'Cash', date: new Date() },
        { no: 'PAY-239', customer: 'Maryam', amount: 2200, method: 'Cash', date: new Date() },
        { no: 'PAY-238', customer: 'Hameed', amount: 3000, method: 'Transfer', date: new Date() },
        { no: 'PAY-237', customer: 'Sami', amount: 1600, method: 'Cash', date: new Date() },
        { no: 'PAY-236', customer: 'Karim', amount: 4100, method: 'Cash', date: new Date() }
      ];
      recentPaymentsBody.innerHTML = payments
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

    const recentExpensesBody = document.getElementById('recent-expenses-body');
    if (recentExpensesBody) {
      const expenses = [
        { category: 'Transport', desc: 'Delivery to customer', amount: 800, branch: 'Barki', date: new Date() },
        { category: 'Utilities', desc: 'Electricity', amount: 1200, branch: 'Shah Shahid', date: new Date() },
        { category: 'Supplies', desc: 'Stationery', amount: 350, branch: 'Barki', date: new Date() },
        { category: 'Maintenance', desc: 'Shop repairs', amount: 950, branch: 'Barki', date: new Date() },
        { category: 'Transport', desc: 'Supplier pickup', amount: 1100, branch: 'Shah Shahid', date: new Date() }
      ];

      recentExpensesBody.innerHTML = expenses
        .map(
          (x) => `
          <tr>
            <td>${PV.formatDate(x.date)}</td>
            <td>${x.category}</td>
            <td>${x.desc}</td>
            <td class="pv-mono">${PV.formatCurrency(x.amount)}</td>
            <td>${x.branch}</td>
          </tr>`
        )
        .join('');
    }

    document.querySelectorAll('[data-pv-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.getAttribute('data-pv-action');
        const routes = {
          newSale: '/admin-sales.html',
          newPurchase: '/admin-purchases.html',
          newCustomer: '/admin-customers.html',
          viewReports: '/admin-reports.html'
        };
        if (routes[action]) window.location.href = routes[action];
      });
    });
  });
})();
