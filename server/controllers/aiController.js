const { GoogleGenerativeAI } = require('@google/generative-ai');
const FinancialProfile = require('../models/FinancialProfile');
const financeUtils = require('../utils/financeUtils');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeFinance = async (req, res) => {
  try {
    const { query, privacyMode = false } = req.body;
    const userId = req.user.id;

    // 1. Fetch User Data
    const profile = await FinancialProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(200).json({
        status: 'success',
        data: {
          recommendation: "I don't have enough data about your finances yet. Please update your details in the Dashboard first so I can provide accurate insights! 😊",
          reasoning: ["No data profile found", "Missing income metrics"],
          confidence: 0
        }
      });
    }

    // 2. Compute Deterministic Metrics
    const totalInvested = 
      (profile.investments?.stocks || 0) + 
      (profile.investments?.mutual_funds || 0) +
      (profile.investments?.bonds || 0) +
      (profile.investments?.gold || 0) +
      (profile.investments?.real_estate || 0) +
      (profile.investments?.epf || 0) +
      (profile.investments?.ppf || 0) +
      (profile.investments?.nps || 0) +
      (profile.investments?.fd || 0) +
      (profile.investments?.crypto || 0);
    
    const totalDebt = 
      (profile.loans?.home_loan || 0) +
      (profile.loans?.car_loan || 0) +
      (profile.loans?.personal_loan || 0) +
      (profile.loans?.education_loan || 0) +
      (profile.loans?.credit_card_debt || 0);
    
    const totalInsurance = 
      (profile.insurance?.life_insurance || 0) +
      (profile.insurance?.health_insurance || 0) +
      (profile.insurance?.term_insurance || 0);
    
    const savingsRate = financeUtils.calculateSavingsRate(profile.income, profile.expenses);
    const debtRatio = financeUtils.calculateDebtRatio(totalInvested, totalDebt);
    const netWorth = financeUtils.calculateNetWorth(totalInvested, totalDebt);

    // 3. Mask Privacy Sensitive Data if enabled
    const profileContext = privacyMode ? `
      [DATA REDACTED FOR PRIVACY]
      CALCULATED METRICS:
      - Savings Velocity: ${savingsRate.toFixed(1)}% (Target: >30%)
      - Capital Structure Stability: ${debtRatio.toFixed(1)}% (Target: <40%)
      - Net Worth Status: Defined by current Portfolio Equity
      - Risk Profile: ${profile.risk_profile || 'moderate'}
      - Age Group: ${profile.age ? Math.floor(profile.age / 10) * 10 + 's' : 'Not specified'}
    ` : `
      USER PROFILE RAW DATA:
      - Monthly Income: ₹${profile.income}
      - Monthly Expenses: ₹${profile.expenses}
      - Total Investment Assets: ₹${totalInvested}
        * Stocks: ₹${profile.investments?.stocks || 0}
        * Mutual Funds: ₹${profile.investments?.mutual_funds || 0}
        * EPF: ₹${profile.investments?.epf || 0}
        * PPF: ₹${profile.investments?.ppf || 0}
        * NPS: ₹${profile.investments?.nps || 0}
        * Fixed Deposits: ₹${profile.investments?.fd || 0}
        * Bonds: ₹${profile.investments?.bonds || 0}
        * Gold: ₹${profile.investments?.gold || 0}
        * Real Estate: ₹${profile.investments?.real_estate || 0}
        * Crypto: ₹${profile.investments?.crypto || 0}
      - Total Liabilities: ₹${totalDebt}
        * Home Loan: ₹${profile.loans?.home_loan || 0}
        * Car Loan: ₹${profile.loans?.car_loan || 0}
        * Personal Loan: ₹${profile.loans?.personal_loan || 0}
        * Education Loan: ₹${profile.loans?.education_loan || 0}
        * Credit Card Debt: ₹${profile.loans?.credit_card_debt || 0}
      - Insurance Coverage: ₹${totalInsurance}
        * Life Insurance: ₹${profile.insurance?.life_insurance || 0}
        * Health Insurance: ₹${profile.insurance?.health_insurance || 0}
        * Term Insurance: ₹${profile.insurance?.term_insurance || 0}
      - Demographics:
        * Age: ${profile.age || 'Not specified'}
        * Dependents: ${profile.dependents || 0}
        * Risk Profile: ${profile.risk_profile || 'moderate'}
      CALCULATED METRICS:
      - Savings Rate: ${savingsRate.toFixed(2)}%
      - Debt-to-Asset Ratio: ${debtRatio.toFixed(2)}%
      - Net Worth: ₹${netWorth}
    `;

    // 4. Prepare Prompt for Structured JSON
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are Finova AI, an elite financial advisor with expertise in wealth management, tax optimization, and strategic planning.
      Analyze this user's profile and answer their query with deep financial reasoning.
      
      FINANCIAL CONTEXT:
      ${profileContext}
      - Credit Reliability: ${profile.credit_score || '700'}

      USER QUERY: "${query}"

      INSTRUCTIONS:
      1. Always return a perfectly formed JSON object.
      2. If data was REDACTED due to privacy, focus your advice on the derived percentages (Velocity, Stability).
      3. Use the provided metrics to back your advice with specific calculations.
      4. Avoid mentioning absolute numbers if they were redacted.
      5. Provide strategic reasoning that goes beyond simple budgeting advice.
      6. Consider tax implications, risk management, and long-term wealth building.
      7. If relevant, mention India-specific instruments like EPF, PPF, NPS, Section 80C, etc.
      8. Provide comparison scenarios when applicable (e.g., invest vs pay debt).

      JSON STRUCTURE:
      {
        "recommendation": "string (detailed strategic advice with specific action items)",
        "reasoning": ["string (key insight 1)", "string (key insight 2)", "string (key insight 3)"],
        "comparison": { 
          "optionA": number (financial outcome of option A), 
          "optionB": number (financial outcome of option B), 
          "labelA": "string (description of option A)", 
          "labelB": "string (description of option B)" 
        },
        "confidence": number (0-100, based on data completeness and query clarity)
      }
    `;

    // 4. Generate AI Advice
    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();

    // Safe Parsing
    let structuredData;
    try {
      structuredData = JSON.parse(aiResponseText);
    } catch (e) {
      console.warn('JSON Parse failed, attempting clean:', e);
      const cleaned = aiResponseText.replace(/```json|```/g, '').trim();
      structuredData = JSON.parse(cleaned);
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...structuredData,
        metrics: {
          savingsRate: savingsRate.toFixed(2),
          debtRatio: debtRatio.toFixed(2),
          netWorth
        }
      }
    });

  } catch (err) {
    console.error('AI Analysis Error:', err);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate financial intelligence. Please check your GEMINI_API_KEY and connection.' 
    });
  }
};

/**
 * Real Simulation Endpoint
 */
exports.simulateGrowth = async (req, res) => {
  try {
    const { 
      monthlyInvestment, 
      years, 
      returnRate, 
      initialEquity = 0, 
      repayDebtFirst = false,
      debtAmount = 1500000,
      debtRate = 10.5
    } = req.body;
    
    const timeSeries = [];
    let currentWealth = initialEquity;
    let currentDebt = repayDebtFirst ? debtAmount : 0;
    
    // Yearly loop
    for (let y = 0; y <= years; y++) {
      timeSeries.push({
        year: y,
        value: Math.round(currentWealth),
        debt: Math.round(currentDebt)
      });

      // Monthly inner loop for compounding
      for (let m = 0; m < 12; m++) {
        if (repayDebtFirst && currentDebt > 0) {
          const interest = (currentDebt * (debtRate / 100)) / 12;
          const principalPayment = Math.max(0, monthlyInvestment - interest);
          currentDebt = Math.max(0, currentDebt - principalPayment);
          
          if (currentDebt === 0) {
            const extra = principalPayment - (currentDebt + principalPayment); // Simple leftover
            currentWealth = (currentWealth + extra) * (1 + (returnRate / 100) / 12);
          }
        } else {
          currentWealth = (currentWealth + monthlyInvestment) * (1 + (returnRate / 100) / 12);
        }
      }
    }

    const final = timeSeries[timeSeries.length - 1];

    res.status(200).json({ 
      status: 'success', 
      data: {
        timeSeries,
        finalValue: final.value,
        growth: final.value - (monthlyInvestment * 12 * years)
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

/**
 * Deterministic Computation Endpoint
 */
exports.computeOnly = async (req, res) => {
  try {
    const { income, expenses, stocks, mutual_funds, home_loan } = req.body;
    
    const assets = (stocks || 0) + (mutual_funds || 0);
    const debt = (home_loan || 0);
    
    const results = {
      savingsRate: financeUtils.calculateSavingsRate(income, expenses),
      debtRatio: financeUtils.calculateDebtRatio(assets, debt),
      netWorth: financeUtils.calculateNetWorth(assets, debt),
    };

    res.status(200).json({ status: 'success', data: results });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
