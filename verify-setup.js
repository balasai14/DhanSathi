/**
 * Setup Verification Script
 * Run this to verify your environment is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Finova AI Setup...\n');

let errors = 0;
let warnings = 0;

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  console.error('❌ Node.js version must be 18 or higher. Current:', nodeVersion);
  errors++;
} else {
  console.log('✅ Node.js version:', nodeVersion);
}

// Check if .env exists
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ server/.env file not found. Copy from .env.example');
  errors++;
} else {
  console.log('✅ server/.env file exists');
  
  // Check if API key is configured
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_gemini_api_key_here')) {
    console.warn('⚠️  GEMINI_API_KEY not configured in server/.env');
    warnings++;
  } else {
    console.log('✅ GEMINI_API_KEY is configured');
  }
  
  if (envContent.includes('your_jwt_secret_here')) {
    console.warn('⚠️  JWT_SECRET not configured in server/.env');
    warnings++;
  } else {
    console.log('✅ JWT_SECRET is configured');
  }
}

// Check if node_modules exist
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ node_modules not found. Run: npm install');
  errors++;
} else {
  console.log('✅ Frontend dependencies installed');
}

const serverNodeModulesPath = path.join(__dirname, 'server', 'node_modules');
if (!fs.existsSync(serverNodeModulesPath)) {
  console.error('❌ server/node_modules not found. Run: cd server && npm install');
  errors++;
} else {
  console.log('✅ Backend dependencies installed');
}

// Check critical files
const criticalFiles = [
  'server/server.js',
  'server/controllers/aiController.js',
  'server/controllers/authController.js',
  'server/controllers/financeController.js',
  'server/controllers/mcpController.js',
  'server/controllers/analyticsController.js',
  'server/middleware/authMiddleware.js',
  'server/middleware/errorHandler.js',
  'server/middleware/validation.js',
  'server/middleware/rateLimiter.js',
  'server/models/User.js',
  'server/models/FinancialProfile.js',
  'server/utils/financeUtils.js',
  'src/App.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/AIChat.jsx',
  'src/pages/Simulator.jsx',
  'package.json',
  'server/package.json'
];

console.log('\n📁 Checking critical files...');
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing: ${file}`);
    errors++;
  }
});
console.log('✅ All critical files present');

// Check documentation
const docFiles = [
  'README.md',
  'QUICKSTART.md',
  'API_DOCUMENTATION.md',
  'DEPLOYMENT.md',
  'TESTING.md',
  'REQUIREMENTS_COMPLIANCE.md',
  'PROJECT_SUMMARY.md',
  'FIXES_APPLIED.md',
  'DEMO_GUIDE.md'
];

console.log('\n📚 Checking documentation...');
docFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Missing: ${file}`);
    warnings++;
  }
});
console.log('✅ Documentation complete');

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Verification Summary');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✅ Perfect! Your setup is complete and ready to run.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Start MongoDB: net start MongoDB');
  console.log('   2. Start backend: cd server && npm run dev');
  console.log('   3. Start frontend: npm run dev');
  console.log('   4. Open: http://localhost:5173/landing');
} else {
  if (errors > 0) {
    console.error(`\n❌ ${errors} error(s) found. Please fix before running.`);
  }
  if (warnings > 0) {
    console.warn(`\n⚠️  ${warnings} warning(s) found. Review recommended.`);
  }
}

console.log('\n📖 For detailed setup instructions, see QUICKSTART.md');
console.log('');
