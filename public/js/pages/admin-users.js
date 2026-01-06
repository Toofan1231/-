(function () {
  window.PV = window.PV || {};

  const USERS = [
    { name: 'System Admin', email: 'admin@paintshop.com', role: 'admin', branch: 'Barki', status: 'Active', lastLogin: '2026-01-06' },
    { name: 'Staff 1', email: 'staff1@paintshop.com', role: 'staff', branch: 'Barki', status: 'Active', lastLogin: '2026-01-05' },
    { name: 'Staff 2', email: 'staff2@paintshop.com', role: 'staff', branch: 'Shah Shahid', status: 'Inactive', lastLogin: '2025-12-30' }
  ];

  PV.onReady(() => {
    PV.auth.initProtectedPage({ roles: ['admin'] });

    const tbody = document.getElementById('users-table-body');
    const roleEl = document.getElementById('users-role');
    const branchEl = document.getElementById('users-branch');
    const statusEl = document.getElementById('users-status');
    const searchEl = document.getElementById('users-search');
    const paginationEl = document.getElementById('users-pagination');

    const state = { search: '', role: '', branch: '', status: '', page: 1, pageSize: 10 };

    function filtered() {
      const q = state.search.toLowerCase();
      return USERS.filter((u) => {
        const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        const matchesRole = !state.role || u.role === state.role;
        const matchesBranch = !state.branch || u.branch === state.branch;
        const matchesStatus = !state.status || u.status === state.status;
        return matchesSearch && matchesRole && matchesBranch && matchesStatus;
      });
    }

    function render() {
      const rows = filtered();
      const page = PV.table.paginate(rows, { page: state.page, pageSize: state.pageSize });
      state.page = page.page;

      if (tbody) {
        tbody.innerHTML = page.items
          .map(
            (u, idx) => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td><span class="pv-badge ${u.role === 'admin' ? 'success' : 'warning'}">${u.role}</span></td>
              <td>${u.branch || '-'}</td>
              <td><span class="pv-badge ${u.status === 'Active' ? 'success' : 'danger'}">${u.status}</span></td>
              <td>${PV.formatDate(u.lastLogin)}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" type="button" data-action="role" data-idx="${idx}">Role</button>
                <button class="btn btn-sm btn-outline-secondary" type="button" data-action="reset" data-idx="${idx}">Reset</button>
                <button class="btn btn-sm btn-outline-danger" type="button" data-action="toggle" data-idx="${idx}">Toggle</button>
              </td>
            </tr>`
          )
          .join('');

        tbody.querySelectorAll('[data-action]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            PV.toast({ type: 'success', title: 'Users', message: `${action} (demo). Wire to /api/users.` });
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
    if (roleEl) roleEl.addEventListener('change', () => {
      state.role = roleEl.value;
      updateAndRender();
    });
    if (branchEl) branchEl.addEventListener('change', () => {
      state.branch = branchEl.value;
      updateAndRender();
    });
    if (statusEl) statusEl.addEventListener('change', () => {
      state.status = statusEl.value;
      updateAndRender();
    });

    const form = document.getElementById('user-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        PV.toast({ type: 'success', title: 'Users', message: 'User created (demo).' });
        const modalEl = document.getElementById('newUserModal');
        if (modalEl && window.bootstrap?.Modal) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
      });
    }

    render();
  });
})();
