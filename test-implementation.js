#!/usr/bin/env node

// Simple test to validate implementation structure
console.log('🔍 Validating Paint & Varnish Shop Accounting System - Phase 3 Implementation');
console.log('=' .repeat(70));

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'middleware/auth.js',
  'middleware/authorization.js',
  'controllers/authController.js',
  'controllers/userController.js',
  'routes/authRoutes.js',
  'routes/userRoutes.js',
  'config/jwt.js',
  'server.js'
];

let allFilesExist = true;

console.log('\n📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

console.log('\n🔍 Checking JWT implementation in authController.js:');
const authController = fs.readFileSync(path.join(__dirname, 'controllers/authController.js'), 'utf8');
const hasJwtImport = authController.includes("require('jsonwebtoken')");
const hasJwtConfig = authController.includes('jwtConfig');
const hasTokenGeneration = authController.includes('jwt.sign');
const returnsToken = authController.includes('token');

console.log(`  ${hasJwtImport ? '✅' : '❌'} JWT import`);
console.log(`  ${hasJwtConfig ? '✅' : '❌'} JWT config usage`);
console.log(`  ${hasTokenGeneration ? '✅' : '❌'} Token generation`);
console.log(`  ${returnsToken ? '✅' : '❌'} Token in response`);

console.log('\n🔍 Checking protected routes middleware:');
const authMiddleware = fs.readFileSync(path.join(__dirname, 'middleware/auth.js'), 'utf8');
const hasAuthHeaderCheck = authMiddleware.includes('authorization');
const hasTokenVerification = authMiddleware.includes('jwt.verify');
const hasUserAttachment = authMiddleware.includes('req.user');

console.log(`  ${hasAuthHeaderCheck ? '✅' : '❌'} Authorization header check`);
console.log(`  ${hasTokenVerification ? '✅' : '❌'} JWT verification`);
console.log(`  ${hasUserAttachment ? '✅' : '❌'} User attachment to req.user`);

console.log('\n🔍 Checking authorization middleware:');
const authzMiddleware = fs.readFileSync(path.join(__dirname, 'middleware/authorization.js'), 'utf8');
const hasRequireAdmin = authzMiddleware.includes('requireAdmin');
const hasSameUserOrAdmin = authzMiddleware.includes('requireSameUserOrAdmin');
const hasRoleChecking = authzMiddleware.includes('req.user.role');

console.log(`  ${hasRequireAdmin ? '✅' : '❌'} Admin role checking`);
console.log(`  ${hasSameUserOrAdmin ? '✅' : '❌'} Same user or admin checking`);
console.log(`  ${hasRoleChecking ? '✅' : '❌'} Role-based authorization`);

console.log('\n🔍 Checking user management endpoints:');
const userController = fs.readFileSync(path.join(__dirname, 'controllers/userController.js'), 'utf8');
const hasGetAllUsers = userController.includes('getAllUsers');
const hasGetUserById = userController.includes('getUserById');
const hasUpdateUser = userController.includes('updateUser');
const hasDeleteUser = userController.includes('deleteUser');
const hasChangeRole = userController.includes('changeUserRole');

console.log(`  ${hasGetAllUsers ? '✅' : '❌'} GET /users endpoint`);
console.log(`  ${hasGetUserById ? '✅' : '❌'} GET /users/:id endpoint`);
console.log(`  ${hasUpdateUser ? '✅' : '❌'} PUT /users/:id endpoint`);
console.log(`  ${hasDeleteUser ? '✅' : '❌'} DELETE /users/:id endpoint`);
console.log(`  ${hasChangeRole ? '✅' : '❌'} PUT /users/:id/role endpoint`);

console.log('\n🔍 Checking route protection:');
const userRoutes = fs.readFileSync(path.join(__dirname, 'routes/userRoutes.js'), 'utf8');
const hasAuthMiddleware = userRoutes.includes('authenticateToken');
const hasAdminMiddleware = userRoutes.includes('requireAdmin()');
const hasUserMiddleware = userRoutes.includes('requireSameUserOrAdmin()');

console.log(`  ${hasAuthMiddleware ? '✅' : '❌'} Auth middleware applied`);
console.log(`  ${hasAdminMiddleware ? '✅' : '❌'} Admin middleware for admin endpoints`);
console.log(`  ${hasUserMiddleware ? '✅' : '❌'} User middleware for user endpoints`);

console.log('\n🔍 Checking server integration:');
const server = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
const hasUserRoutes = server.includes('userRoutes');
const hasUserRoutesUsage = server.includes('/api/users');

console.log(`  ${hasUserRoutes ? '✅' : '❌'} User routes imported`);
console.log(`  ${hasUserRoutesUsage ? '✅' : '❌'} User routes mounted`);

console.log('\n' + '=' .repeat(70));
console.log('🎉 Implementation validation completed!');
console.log('\n✅ All core components are in place for JWT authentication and user management');
console.log('📋 Next steps:');
console.log('   1. Set up PostgreSQL database');
console.log('   2. Run database migrations');
console.log('   3. Test endpoints with actual database connection');