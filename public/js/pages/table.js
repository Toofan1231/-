(function () {
  window.PV = window.PV || {};

  PV.table = {
    paginate(rows, { page, pageSize }) {
      const p = Math.max(1, page || 1);
      const size = Math.max(1, pageSize || 10);
      const total = rows.length;
      const totalPages = Math.max(1, Math.ceil(total / size));
      const safePage = Math.min(p, totalPages);
      const start = (safePage - 1) * size;
      return {
        page: safePage,
        pageSize: size,
        total,
        totalPages,
        items: rows.slice(start, start + size)
      };
    },

    renderPagination(el, { page, totalPages, onChange }) {
      if (!el) return;
      el.innerHTML = '';

      const makeBtn = (label, target, disabled) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-sm btn-outline-secondary';
        b.textContent = label;
        b.disabled = !!disabled;
        b.addEventListener('click', () => onChange(target));
        return b;
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'd-flex align-items-center gap-2';

      wrapper.appendChild(makeBtn('‹', page - 1, page <= 1));
      const info = document.createElement('span');
      info.className = 'pv-muted small';
      info.textContent = `${page} / ${totalPages}`;
      wrapper.appendChild(info);
      wrapper.appendChild(makeBtn('›', page + 1, page >= totalPages));

      el.appendChild(wrapper);
    }
  };
})();
