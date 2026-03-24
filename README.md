# Finova AI - AI-Powered Personal Finance Intelligence System

## 🎯 Problem Statement

An AI-powered personal finance agent that delivers deeply personalized financial insights through natural language interactions. The solution analyzes structured financial data (assets, liabilities, investments, credit score, EPF, etc.), simulates financial scenarios, and provides actionable recommendations while ensuring user privacy and data control.

## ✨ Key Features

### 1. **AI-Driven Financial Advisor**
- Natural language chat interface powered by Google Gemini AI
- Contextual analysis of your complete financial profile
- Personalized recommendations based on real-time data
- Privacy mode for sensitive data masking

### 2. **Comprehensive Financial Data Management**
- Structured data ingestion supporting:
  - Income & Expenses tracking
  - Investment portfolio (Stocks, Mutual Funds, Bonds, Gold, Real Estate, EPF, PPF, NPS, FD, Crypto)
  - Liabilities (Home Loan, Car Loan, Personal Loan, Education Loan, Credit Card Debt)
  - Insurance coverage (Life, Health, Term)
  - Credit score monitoring
  - Risk profile assessment

### 3. **Scenario Simulation Engine**
- What-if analysis for financial decisions
- Compound interest calculations
- Debt repayment vs investment comparison
- Multi-year wealth projection with visual charts
- Real-time parameter adjustments

### 4. **Financial Health Score**
- Dynamic scoring algorithm based on:
  - Savings rate (40% weight)
  - Debt-to-asset ratio (35% weight)
  - Credit score (25% weight)
- Visual health ring with color-coded status
- Actionable insights for improvement

### 5. **Security & Privacy**
- JWT-based authentication with HTTP-only cookies
- bcrypt password hashing
- Privacy-aware AI prompts (optional data masking)
- Secure MongoDB data storage
- CORS protection

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 with Vite
- React Router for navigation
- Chart.js for data visualization
- Axios for API communication
- Lucide React for icons
- React Markdown for AI responses

**Backend:**
- Node.js with Express 5
- MongoDB with Mongoose ODM
- Google Gemini AI (gemini-1.5-flash)
- JWT authentication
- Cookie-based session management

### Project Structure

```
├── server/
│   ├── controllers/
│   │   ├── aiController.js       # AI analysis & simulation logic
│   │   ├── authController.js     # Authentication endpoints
│   │   └── financeController.js  # Financial data CRUD
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── FinancialProfile.js   # Financial data schema
│   ├── utils/
│   │   └── financeUtils.js       # Calculation utilities
│   ├── .env.example              # Environment template
│   └── server.js                 # Express app entry
├── src/
│   ├── components/               # Reusable UI components
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth state
│   ├── pages/
│   │   ├── Landing.jsx           # Marketing landing page
│   │   ├── Auth.jsx              # Login/Signup
│   │   ├── Dashboard.jsx         # Financial overview
│   │   ├── AIChat.jsx            # AI advisor interface
│   │   ├── Simulator.jsx         # Scenario modeling
│   │   ├── Recommendations.jsx   # AI insights
│   │   └── Settings.jsx          # User preferences
│   └── App.jsx                   # Main app router
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-finance
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
```

4. **Configure environment variables**
```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your credentials:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finova-ai
JWT_SECRET=your_secure_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

6. **Start the backend server**
```bash
cd server
npm run dev
```

7. **Start the frontend (in a new terminal)**
```bash
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/demo` - Demo account login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Financial Data
- `POST /api/finance/save` - Save/update financial profile
- `GET /api/finance/get` - Retrieve financial profile

### AI Intelligence
- `POST /api/ai/analyze` - Get AI-powered financial advice
- `POST /api/simulate` - Run scenario simulations
- `POST /api/compute` - Calculate financial metrics

## 🔐 Security Features

1. **Authentication**
   - JWT tokens with 7-day expiry
   - HTTP-only cookies to prevent XSS
   - bcrypt password hashing (10 rounds)

2. **Privacy Controls**
   - Privacy mode masks absolute values in AI prompts
   - User-controlled data sharing preferences
   - Local processing options

3. **Data Protection**
   - CORS configured for specific origin
   - Environment variables for sensitive data
   - MongoDB connection with authentication

## 🎨 Key Differentiators

### vs Generic Budgeting Tools

1. **AI-Powered Reasoning**
   - Contextual understanding of financial situations
   - Personalized advice based on complete profile
   - Natural language interaction

2. **Scenario Simulation**
   - Real-time what-if analysis
   - Compound interest calculations
   - Debt vs investment optimization

3. **Comprehensive Data Model**
   - Supports EPF, PPF, NPS (India-specific)
   - Multiple asset classes
   - Insurance tracking
   - Risk profiling

4. **Privacy-First Design**
   - Optional data masking
   - User-controlled AI interactions
   - Transparent data usage

## 📈 Performance Indicators

- **Response Relevance**: AI responses contextualized to user's financial profile
- **Personalization Quality**: Recommendations based on 15+ financial parameters
- **Latency**: < 3s for AI analysis, < 500ms for simulations
- **Privacy Approach**: Optional privacy mode with ratio-based analysis

## 🧪 Demo Account

Try the system without signup:
- Click "Try Demo" on landing page
- Pre-loaded with sample financial data
- Full feature access

## 🛠️ Development

### Frontend Development
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend Development
```bash
cd server
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start
```

## 📝 Future Enhancements

- [ ] MCP (Model Context Protocol) integration
- [ ] Voice-based interaction
- [ ] Mobile app (React Native)
- [ ] Advanced tax optimization
- [ ] Goal-based planning
- [ ] Multi-currency support
- [ ] Bank account integration
- [ ] Automated data sync
- [ ] Social features (anonymous benchmarking)
- [ ] Export reports (PDF)

## 🤝 Contributing

This is a prototype developed for the Open Innovation challenge. Contributions are welcome!

## 📄 License

This project is developed as part of an academic/innovation challenge.

## 👥 Team

Developed for the AI-Powered Personal Finance Intelligence System challenge.

## 🙏 Acknowledgments

- Google Gemini AI for natural language processing
- MongoDB for flexible data storage
- React and Vite for modern frontend development
- Chart.js for beautiful visualizations

---

**Note**: This is a prototype system. For production deployment, additional security hardening, testing, and compliance measures are required.
