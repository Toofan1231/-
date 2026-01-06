const db = require('../config/database');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const messages = require('../i18n/messages');
const { ERROR_CODES } = require('../config/constants');

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Get all suppliers with pagination and filters
const getAllSuppliers = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  
  const { limit = 10, offset = 0, active = 'true' } = req.query;
  
  const activeFilter = active === 'true' ? '1=1' : '1=1';
  const params = [];
  
  // Build query
  const countQuery = `SELECT COUNT(*) FROM suppliers WHERE ${activeFilter}`;
  const query = `
    SELECT 
      s.id,
      s.name,
      s.contact_person,
      s.phone,
      s.email,
      s.address,
      s.created_at,
      s.updated_at,
      COUNT(p.id) as total_purchases
    FROM suppliers s
    LEFT JOIN purchases p ON s.id = p.supplier_id
    WHERE ${activeFilter}
    GROUP BY s.id
    ORDER BY s.name ASC
    LIMIT $1 OFFSET $2
  `;
  params.push(parseInt(limit), parseInt(offset));
  
  const [suppliersResult, countResult] = await Promise.all([
    db.query(query, params),
    db.query(countQuery)
  ]);
  
  const total = parseInt(countResult.rows[0].count);
  
  res.status(200).json({
    status: 'success',
    message: messages[lang].common.success || 'Success',
    data: {
      suppliers: suppliersResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    }
  });
});

// Get supplier by ID
const getSupplierById = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  const { id } = req.params;
  
  const result = await db.query(
    `SELECT 
      s.id,
      s.name,
      s.contact_person,
      s.phone,
      s.email,
      s.address,
      s.created_at,
      s.updated_at
    FROM suppliers s
    WHERE s.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return next(new AppError(messages[lang].common.notFound, 404, ERROR_CODES.NOT_FOUND));
  }
  
  res.status(200).json({
    status: 'success',
    message: messages[lang].common.success || 'Success',
    data: {
      supplier: result.rows[0]
    }
  });
});

// Create new supplier
const createSupplier = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  
  const { name, contact_person, phone, email, address } = req.body;
  
  // Validation
  if (!name || !contact_person || !phone) {
    return next(new AppError(messages[lang].common.validationError, 400, ERROR_CODES.VALIDATION_ERROR));
  }
  
  if (email && !validateEmail(email)) {
    return next(new AppError(messages[lang].common.validationError, 400, ERROR_CODES.VALIDATION_ERROR));
  }
  
  if (phone && !validatePhone(phone)) {
    return next(new AppError(messages[lang].common.validationError, 400, ERROR_CODES.VALIDATION_ERROR));
  }
  
  // Check for duplicate email (if provided)
  if (email) {
    const existingSupplier = await db.query('SELECT id FROM suppliers WHERE email = $1', [email]);
    if (existingSupplier.rows.length > 0) {
      return next(new AppError(messages[lang].auth.emailExists, 409, ERROR_CODES.DUPLICATE_EMAIL));
    }
  }
  
  const result = await db.query(
    `INSERT INTO suppliers (name, contact_person, phone, email, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, contact_person, phone, email, address, created_at, updated_at`,
    [name, contact_person, phone, email || null, address || null]
  );
  
  res.status(201).json({
    status: 'success',
    message: messages[lang].common.success || 'Success',
    data: {
      supplier: result.rows[0]
    }
  });
});

// Update supplier
const updateSupplier = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  const { id } = req.params;
  
  // Check if supplier exists
  const existingSupplier = await db.query('SELECT id FROM suppliers WHERE id = $1', [id]);
  if (existingSupplier.rows.length === 0) {
    return next(new AppError(messages[lang].common.notFound, 404, ERROR_CODES.NOT_FOUND));
  }
  
  const { name, contact_person, phone, email, address } = req.body;
  
  // Validation
  if (email && !validateEmail(email)) {
    return next(new AppError(messages[lang].common.validationError, 400, ERROR_CODES.VALIDATION_ERROR));
  }
  
  if (phone && !validatePhone(phone)) {
    return next(new AppError(messages[lang].common.validationError, 400, ERROR_CODES.VALIDATION_ERROR));
  }
  
  // Check for duplicate email (if provided)
  if (email) {
    const duplicateEmail = await db.query('SELECT id FROM suppliers WHERE email = $1 AND id != $2', [email, id]);
    if (duplicateEmail.rows.length > 0) {
      return next(new AppError(messages[lang].auth.emailExists, 409, ERROR_CODES.DUPLICATE_EMAIL));
    }
  }
  
  // Build update query
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (name) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (contact_person) {
    updates.push(`contact_person = $${paramCount++}`);
    values.push(contact_person);
  }
  if (phone) {
    updates.push(`phone = $${paramCount++}`);
    values.push(phone);
  }
  if (email !== undefined) {
    updates.push(`email = $${paramCount++}`);
    values.push(email);
  }
  if (address !== undefined) {
    updates.push(`address = $${paramCount++}`);
    values.push(address);
  }
  
  if (updates.length === 0) {
    return next(new AppError(messages[lang].common.validationError, 400, ERROR_CODES.VALIDATION_ERROR));
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const query = `
    UPDATE suppliers 
    SET ${updates.join(', ')} 
    WHERE id = $${paramCount}
    RETURNING id, name, contact_person, phone, email, address, created_at, updated_at
  `;
  
  const result = await db.query(query, values);
  
  res.status(200).json({
    status: 'success',
    message: messages[lang].common.success || 'Success',
    data: {
      supplier: result.rows[0]
    }
  });
});

// Soft delete supplier
const deleteSupplier = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  const { id } = req.params;
  
  // Check if supplier exists
  const existingSupplier = await db.query('SELECT id FROM suppliers WHERE id = $1', [id]);
  if (existingSupplier.rows.length === 0) {
    return next(new AppError(messages[lang].common.notFound, 404, ERROR_CODES.NOT_FOUND));
  }
  
  // Check if supplier has any purchases
  const purchaseCheck = await db.query('SELECT id FROM purchases WHERE supplier_id = $1 LIMIT 1', [id]);
  if (purchaseCheck.rows.length > 0) {
    return next(new AppError(
      messages[lang].common.error || 'Cannot delete supplier with existing purchases',
      400,
      'supplier-has-purchases'
    ));
  }
  
  // Hard delete (soft delete not implemented in this schema)
  await db.query('DELETE FROM suppliers WHERE id = $1', [id]);
  
  res.status(200).json({
    status: 'success',
    message: messages[lang].common.supplierDeleted || 'Supplier deleted successfully',
    data: {
      supplier: null
    }
  });
});

// Get supplier purchase history
const getSupplierPurchases = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  const { id } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  
  // Check if supplier exists
  const supplierCheck = await db.query('SELECT id FROM suppliers WHERE id = $1', [id]);
  if (supplierCheck.rows.length === 0) {
    return next(new AppError(messages[lang].common.notFound, 404, ERROR_CODES.NOT_FOUND));
  }
  
  const purchasesQuery = `
    SELECT 
      p.id,
      p.total_amount,
      p.purchase_date,
      p.status,
      p.created_at,
      b.name as branch_name,
      COUNT(pi.id) as item_count
    FROM purchases p
    LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
    LEFT JOIN branches b ON p.branch_id = b.id
    WHERE p.supplier_id = $1
    GROUP BY p.id, b.name
    ORDER BY p.purchase_date DESC
    LIMIT $2 OFFSET $3
  `;
  
  const countQuery = 'SELECT COUNT(*) FROM purchases WHERE supplier_id = $1';
  
  const [purchasesResult, countResult] = await Promise.all([
    db.query(purchasesQuery, [id, parseInt(limit), parseInt(offset)]),
    db.query(countQuery, [id])
  ]);
  
  const total = parseInt(countResult.rows[0].count);
  
  res.status(200).json({
    status: 'success',
    message: messages[lang].common.success || 'Success',
    data: {
      purchases: purchasesResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    }
  });
});

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPurchases
};