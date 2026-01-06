(function () {
  window.PV = window.PV || {};

  PV.charts = {
    createLine(ctx, { labels, data, label }) {
      if (!window.Chart) return null;
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: label || '',
              data,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.12)',
              fill: true,
              tension: 0.35,
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { intersect: false }
          },
          scales: {
            y: { ticks: { callback: (v) => PV.formatCurrency(v) } }
          }
        }
      });
    },

    createBar(ctx, { labels, data, horizontal }) {
      if (!window.Chart) return null;
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: ['rgba(0, 123, 255, 0.7)', 'rgba(40, 167, 69, 0.7)', 'rgba(255, 193, 7, 0.7)', 'rgba(220, 53, 69, 0.7)', 'rgba(52, 58, 64, 0.7)']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          indexAxis: horizontal ? 'y' : 'x',
          scales: {
            x: { ticks: { callback: (v) => (horizontal ? PV.formatCurrency(v) : v) } },
            y: { ticks: { callback: (v) => (horizontal ? v : PV.formatCurrency(v)) } }
          }
        }
      });
    },

    createPie(ctx, { labels, data }) {
      if (!window.Chart) return null;
      return new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: ['rgba(40, 167, 69, 0.75)', 'rgba(255, 193, 7, 0.75)', 'rgba(220, 53, 69, 0.75)', 'rgba(0, 123, 255, 0.75)']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  };
})();
