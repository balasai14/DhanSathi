const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authController = require('./controllers/authController');
const financeController = require('./controllers/financeController');
const aiController = require('./controllers/aiController');
const mcpController = require('./controllers/mcpController');
const analyticsController = require('./controllers/analyticsController');
const { protect } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const { validateFinanceProfile, validateAIQuery, validateSimulation } = require('./middleware/validation');
const { apiLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Body parser, cookies, and CORS
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
}));

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// --- Routes ---
app.post('/api/auth/signup', authLimiter, authController.signup);
app.post('/api/auth/login', authLimiter, authController.login);
app.post('/api/auth/demo', authLimiter, authController.loginDemo);
app.get('/api/auth/me', protect, authController.getMe);
app.post('/api/auth/logout', authController.logout);

// --- Finance Routes ---
app.post('/api/finance/save', protect, validateFinanceProfile, financeController.saveProfile);
app.get('/api/finance/get', protect, financeController.getProfile);
app.get('/api/finance/analytics', protect, analyticsController.getAnalytics);

// --- MCP Data Exchange ---
app.get('/api/mcp/export', protect, mcpController.exportMCPFormat);
app.post('/api/mcp/import', protect, mcpController.importMCPFormat);

// --- AI & Compute Intelligence ---
app.post('/api/ai/analyze', protect, aiLimiter, validateAIQuery, aiController.analyzeFinance);
app.post('/api/compute', aiController.computeOnly);
app.post('/api/simulate', protect, validateSimulation, aiController.simulateGrowth);

// Example protected route for financial data
app.get('/api/test-protected', protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}, your data is safe.` });
});

// Global error handler (must be last)
app.use(errorHandler);

// --- MongoDB Connection ---
const DB = process.env.MONGO_URI || 'mongodb://localhost:27017/finova-ai';
mongoose.connect(DB).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
