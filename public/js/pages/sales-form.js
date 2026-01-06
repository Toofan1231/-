(function () {
  window.PV = window.PV || {};

  const SAMPLE_PRODUCTS = [
    { id: 1, name: 'Wall Paint 20L', price: 4500 },
    { id: 2, name: 'Primer 5L', price: 1200 },
    { id: 3, name: 'Varnish 4L', price: 1600 },
    { id: 4, name: 'Thinner 1L', price: 220 },
    { id: 5, name: 'Brush Set', price: 380 }
  ];

  function money(n) {
    return PV.formatCurrency(n);
  }

  function recalc(container) {
    const rows = Array.from(container.querySelectorAll('[data-sale-item-row]'));
    let subtotal = 0;

    rows.forEach((r) => {
      const qty = Number(r.querySelector('[name="qty"]')?.value || 0);
      const unit = Number(r.querySelector('[name="unit_price"]')?.value || 0);
      const line = qty * unit;
      subtotal += line;
      const out = r.querySelector('[data-line-subtotal]');
      if (out) out.textContent = money(line);
    });

    const discount = Number(document.getElementById('sale-discount')?.value || 0);
    const total = Math.max(0, subtotal - discount);

    const subtotalEl = document.getElementById('sale-subtotal');
    const totalEl = document.getElementById('sale-total');
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (totalEl) totalEl.textContent = money(total);
  }

  function addRow(container) {
    const row = document.createElement('tr');
    row.setAttribute('data-sale-item-row', '1');

    const productOptions = SAMPLE_PRODUCTS.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');

    row.innerHTML = `
      <td>
        <select class="form-select form-select-sm" name="product_id" aria-label="Product">
          <option value="">Select…</option>
          ${productOptions}
        </select>
      </td>
      <td style="width: 110px;">
        <input class="form-control form-control-sm" name="qty" type="number" min="1" value="1" />
      </td>
      <td style="width: 150px;">
        <input class="form-control form-control-sm pv-mono" name="unit_price" type="number" min="0" value="0" />
      </td>
      <td class="pv-mono" data-line-subtotal>0</td>
      <td style="width: 80px;">
        <button type="button" class="btn btn-sm btn-outline-danger" data-remove-row aria-label="Remove">×</button>
      </td>
    `;

    const productEl = row.querySelector('[name="product_id"]');
    const qtyEl = row.querySelector('[name="qty"]');
    const unitEl = row.querySelector('[name="unit_price"]');

    productEl.addEventListener('change', () => {
      const id = Number(productEl.value);
      const prod = SAMPLE_PRODUCTS.find((p) => p.id === id);
      if (prod) unitEl.value = String(prod.price);
      recalc(container);
    });

    const onInput = PV.debounce(() => recalc(container), 60);
    qtyEl.addEventListener('input', onInput);
    unitEl.addEventListener('input', onInput);

    row.querySelector('[data-remove-row]').addEventListener('click', () => {
      row.remove();
      recalc(container);
    });

    container.appendChild(row);
    recalc(container);
  }

  PV.salesForm = {
    init() {
      const itemsTbody = document.getElementById('sale-items-body');
      if (!itemsTbody) return;

      const addBtn = document.getElementById('sale-add-item');
      if (addBtn) addBtn.addEventListener('click', () => addRow(itemsTbody));

      const discountEl = document.getElementById('sale-discount');
      if (discountEl) discountEl.addEventListener('input', PV.debounce(() => recalc(itemsTbody), 60));

      if (itemsTbody.children.length === 0) addRow(itemsTbody);

      const form = document.getElementById('sale-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        PV.toast({ type: 'success', title: 'Sale', message: 'Saved (demo). Backend integration can be wired to /api/sales.' });

        const modalEl = document.getElementById('newSaleModal');
        if (modalEl && window.bootstrap?.Modal) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
      });
    }
  };
})();
