const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const db = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan(process.env.LOG_LEVEL || 'dev'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await db.testConnection();
  res.status(dbConnected ? 200 : 503).json({
    status: 'success',
    message: 'Paint & Varnish Shop Accounting System API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  console.log('🔄 Testing database connection...');
  await db.testConnection();

  app.listen(PORT, () => {
    console.log('============================================================');
    console.log('🚀 Paint & Varnish Shop Accounting System API');
    console.log('============================================================');
    console.log(`📡 Server running on port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log('🌐 Language Support: Dari (دری), Pashto (پښتو), English');
    console.log('============================================================');
  });
};

startServer();
