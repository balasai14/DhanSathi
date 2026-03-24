# 💰 DhanSathi — Your AI-Powered Virtual CFO

Most finance apps just tell you what you *spent*. **DhanSathi** tells you what you should *do*. 

It’s a comprehensive financial intelligence system that combines real-time portfolio tracking, deep health analytics, and a "Virtual CFO" that actually knows your numbers.

---

## ✨ What makes DhanSathi different?

*   **🤖 The Virtual CFO:** Unlike generic AI, our advisor analyzes your *actual* cash flow, debt-to-income ratio, and investment risk to give you personalized, actionable advice.
*   **📈 Real-Time Portfolio:** Connect your investments and see your total net worth, asset allocation, and P&L updated live via Yahoo Finance.
*   **🏥 Financial Health Check:** Get a "Health Score" based on your savings rate, debt levels, and diversification—not just a list of transactions.
*   **🔮 Simulation Engine:** Plan your future with precision. Simulate SIP growth, compound interest, or see exactly how much faster you’d be debt-free by increasing your EMIs.
*   **🇮🇳 Built for India:** Native support for Indian financial instruments, from SIPs and EMIs to Nifty 50 tracking.

---

## 🛠️ The Tech Behind the Intelligence

We built DhanSathi using a modern, high-performance stack designed for speed and security.

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), Tailwind CSS 4, Recharts |
| **Backend** | FastAPI (Python 3.11+), SQLAlchemy 2.0 |
| **Database** | PostgreSQL |
| **Security** | JWT Authentication + Bcrypt Hashing |
| **Intelligence** | OpenRouter (GPT-4o / Claude 3.5 / Gemini) |
| **Market Data** | Yahoo Finance (yfinance) |

---

## 🚀 Getting Started

Setting up DhanSathi on your local machine is straightforward. You'll need Python 3.11+, Node.js 18+, and a PostgreSQL instance.

### 1. Database Setup
First, create a fresh database for the app:
```bash
psql -U postgres -c "CREATE DATABASE financeiq;"
```

### 2. Configure Environment
Copy the example environment file and add your credentials:
```bash
cp .env.example .env
```
> **Tip:** Make sure to add your `DATABASE_URL` and an [OpenRouter API Key](https://openrouter.ai/keys) to enable the AI features.

### 3. Launch the Backend
```bash
# Set up a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install & Run
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*Your API will be live at `http://localhost:8000/docs`*

### 4. Launch the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*The dashboard will be waiting for you at `http://localhost:3000`*

---

## 📂 Project Structure

*   `app/` — **The Brain**: Contains the FastAPI logic, financial engines (metrics, simulation, portfolio), and AI integration.
*   `frontend/` — **The Body**: A lightning-fast Next.js 16 interface with a focus on clean data visualization.
*   `alembic/` — **The Memory**: Database migration scripts to keep your schema in sync.

---

## 🤝 Contributing

We're building DhanSathi to help everyone make smarter financial decisions. If you have ideas for new simulations or better AI prompts, feel free to open a PR!

---

## 📜 License
MIT © 2026 House of Coders
