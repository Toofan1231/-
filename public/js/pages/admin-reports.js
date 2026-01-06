(function () {
  window.PV = window.PV || {};

  function exportTableToCsv(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    const csv = rows
      .map((r) =>
        Array.from(r.querySelectorAll('th,td'))
          .map((c) => `"${String(c.textContent || '').replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['admin'] });

    const typeEl = document.getElementById('report-type');
    const generateBtn = document.getElementById('report-generate');

    function renderReport() {
      const now = new Date();
      const sales = 260000;
      const expenses = 84000;
      const profit = sales - expenses;

      document.getElementById('report-sales').textContent = PV.formatCurrency(sales);
      document.getElementById('report-expenses').textContent = PV.formatCurrency(expenses);
      document.getElementById('report-profit').textContent = PV.formatCurrency(profit);

      const labels = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return PV.formatDate(d);
      });

      PV.charts.createLine(document.getElementById('report-chart-sales'), {
        labels,
        data: [22000, 29000, 31000, 28000, 35000, 40000, 45000]
      });

      PV.charts.createBar(document.getElementById('report-chart-branch'), {
        labels: ['Barki', 'Shah Shahid'],
        data: [155000, 105000]
      });

      PV.charts.createBar(document.getElementById('report-chart-products'), {
        labels: ['Wall Paint', 'Primer', 'Varnish', 'Thinner', 'Brushes'],
        data: [72000, 56000, 41000, 29000, 18000],
        horizontal: true
      });

      const tbody = document.getElementById('report-products-body');
      if (tbody) {
        const rows = [
          { product: 'Wall Paint 20L', qty: 42, revenue: 72000 },
          { product: 'Primer 5L', qty: 55, revenue: 56000 },
          { product: 'Varnish 4L', qty: 24, revenue: 41000 },
          { product: 'Thinner 1L', qty: 120, revenue: 29000 },
          { product: 'Brush Set', qty: 35, revenue: 18000 }
        ];
        tbody.innerHTML = rows
          .map((r) => `
          <tr>
            <td>${r.product}</td>
            <td class="pv-mono">${r.qty}</td>
            <td class="pv-mono">${PV.formatCurrency(r.revenue)}</td>
          </tr>`)
          .join('');
      }

      const metaEl = document.getElementById('report-meta');
      if (metaEl) {
        metaEl.textContent = `Generated: ${PV.formatDate(now)} • Type: ${typeEl?.value || 'daily'}`;
      }

      PV.toast({ type: 'success', title: 'Report', message: 'Report generated (demo).' });
    }

    if (generateBtn) generateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderReport();
    });

    document.getElementById('report-export-pdf')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });

    document.getElementById('report-export-excel')?.addEventListener('click', (e) => {
      e.preventDefault();
      exportTableToCsv('report-products-table', 'report.csv');
    });

    renderReport();
  });
})();
