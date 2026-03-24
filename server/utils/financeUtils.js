/**
 * Deterministic Financial Computation Engine
 */

const financeUtils = {
  calculateSavingsRate: (income, expenses) => {
    if (!income || income <= 0) return 0;
    const savings = Math.max(0, income - expenses);
    return (savings / income) * 100;
  },

  calculateDebtRatio: (totalAssets, totalDebt) => {
    if (!totalAssets || totalAssets <= 0) return totalDebt > 0 ? 100 : 0;
    return (totalDebt / totalAssets) * 100;
  },

  calculateNetWorth: (totalAssets, totalDebt) => {
    return (totalAssets || 0) - (totalDebt || 0);
  },

  /**
   * Calculate financial health score (0-100)
   * Based on savings rate, debt ratio, and credit score
   */
  calculateHealthScore: (savingsRate, debtRatio, creditScore) => {
    const savingsScore = Math.min(savingsRate * 1.1, 44); // Max 44 points
    const debtScore = Math.max(0, 100 - debtRatio) * 0.35; // Max 35 points
    const creditScoreNormalized = ((creditScore || 700) / 900) * 21; // Max 21 points
    
    return Math.max(0, Math.min(100, Math.round(savingsScore + debtScore + creditScoreNormalized)));
  },

  /**
   * Calculate emergency fund adequacy (months of expenses covered)
   */
  calculateEmergencyFundMonths: (liquidAssets, monthlyExpenses) => {
    if (!monthlyExpenses || monthlyExpenses <= 0) return 0;
    return liquidAssets / monthlyExpenses;
  },

  /**
   * Calculate retirement corpus needed
   * Based on current age, retirement age, life expectancy, and monthly expenses
   */
  calculateRetirementCorpus: (currentAge, retirementAge, lifeExpectancy, monthlyExpenses, inflationRate = 6) => {
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    
    // Future value of monthly expenses at retirement
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    
    // Total corpus needed (assuming 4% withdrawal rate)
    const corpusNeeded = futureMonthlyExpenses * 12 * yearsInRetirement;
    
    return Math.round(corpusNeeded);
  },

  /**
   * Calculate tax savings under Section 80C
   */
  calculateTaxSavings: (investment80C, taxBracket = 30) => {
    const maxDeduction = 150000; // Section 80C limit
    const eligibleAmount = Math.min(investment80C, maxDeduction);
    return Math.round(eligibleAmount * (taxBracket / 100));
  },

  /**
   * Compound interest simulation
   * P = principal, r = annual rate, t = years, m = monthly contribution
   */
  simulateInvestment: (principal, annualRate, years, monthlyContribution = 0) => {
    const r = annualRate / 100 / 12;
    const months = years * 12;
    
    // Future value of principal: P * (1 + r)^n
    let fvPrincipal = principal * Math.pow(1 + r, months);
    
    // Future value of a series (annuity): PMT * [((1 + r)^n - 1) / r]
    let fvContributions = 0;
    if (r > 0) {
      fvContributions = monthlyContribution * ((Math.pow(1 + r, months) - 1) / r);
    } else {
      fvContributions = monthlyContribution * months;
    }

    return {
      finalValue: Math.round(fvPrincipal + fvContributions),
      estimatedGrowth: Math.round((fvPrincipal + fvContributions) - (principal + (monthlyContribution * months))),
      totalInvested: principal + (monthlyContribution * months)
    };
  },

  /**
   * Loan repayment simulation
   * P = principal, r = annual rate, t = years
   */
  simulateLoanRepayment: (principal, annualRate, years) => {
    if (principal <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    
    const r = annualRate / 100 / 12;
    const n = years * 12;

    // EMI = [P * r * (1 + r)^n] / [(1 + r)^n – 1]
    let emi = 0;
    if (r > 0) {
      emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      emi = principal / n;
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      tenureMonths: n
    };
  },

  /**
   * Calculate asset allocation percentages
   */
  calculateAssetAllocation: (investments) => {
    const total = Object.values(investments || {}).reduce((sum, val) => sum + (val || 0), 0);
    if (total === 0) return {};
    
    const allocation = {};
    for (const [key, value] of Object.entries(investments || {})) {
      allocation[key] = ((value || 0) / total) * 100;
    }
    return allocation;
  },

  /**
   * Calculate debt-to-income ratio
   */
  calculateDebtToIncome: (monthlyDebtPayments, monthlyIncome) => {
    if (!monthlyIncome || monthlyIncome <= 0) return 0;
    return (monthlyDebtPayments / monthlyIncome) * 100;
  },

  /**
   * Calculate investment diversification score (0-100)
   * Higher score = better diversification
   */
  calculateDiversificationScore: (investments) => {
    const values = Object.values(investments || {}).filter(v => v > 0);
    if (values.length === 0) return 0;
    
    const total = values.reduce((sum, val) => sum + val, 0);
    const percentages = values.map(v => v / total);
    
    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = percentages.reduce((sum, p) => sum + (p * p), 0);
    
    // Convert to 0-100 scale (lower HHI = better diversification)
    // Perfect diversification (10 equal assets) = HHI of 0.1
    // No diversification (1 asset) = HHI of 1.0
    const score = Math.max(0, Math.min(100, (1 - hhi) * 111));
    
    return Math.round(score);
  }
};

module.exports = financeUtils;
