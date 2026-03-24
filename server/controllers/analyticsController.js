const FinancialProfile = require('../models/FinancialProfile');
const financeUtils = require('../utils/financeUtils');

/**
 * Get comprehensive financial analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await FinancialProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'No financial profile found. Please update your details first.'
      });
    }

    // Calculate total assets
    const totalAssets = Object.values(profile.investments || {}).reduce((sum, val) => sum + (val || 0), 0);
    
    // Calculate total liabilities
    const totalLiabilities = Object.values(profile.loans || {}).reduce((sum, val) => sum + (val || 0), 0);
    
    // Calculate liquid assets (excluding real estate and retirement funds)
    const liquidAssets = 
      (profile.investments?.stocks || 0) +
      (profile.investments?.mutual_funds || 0) +
      (profile.investments?.bonds || 0) +
      (profile.investments?.fd || 0) +
      (profile.investments?.gold || 0) +
      (profile.investments?.crypto || 0);

    // Calculate retirement assets
    const retirementAssets = 
      (profile.investments?.epf || 0) +
      (profile.investments?.ppf || 0) +
      (profile.investments?.nps || 0);

    // Calculate total insurance coverage
    const totalInsurance = Object.values(profile.insurance || {}).reduce((sum, val) => sum + (val || 0), 0);

    // Core metrics
    const savingsRate = financeUtils.calculateSavingsRate(profile.income, profile.expenses);
    const debtRatio = financeUtils.calculateDebtRatio(totalAssets, totalLiabilities);
    const netWorth = financeUtils.calculateNetWorth(totalAssets, totalLiabilities);
    const healthScore = financeUtils.calculateHealthScore(savingsRate, debtRatio, profile.credit_score);
    
    // Advanced metrics
    const emergencyFundMonths = financeUtils.calculateEmergencyFundMonths(liquidAssets, profile.expenses);
    const assetAllocation = financeUtils.calculateAssetAllocation(profile.investments);
    const diversificationScore = financeUtils.calculateDiversificationScore(profile.investments);
    
    // Retirement planning
    const retirementCorpus = profile.age ? financeUtils.calculateRetirementCorpus(
      profile.age,
      60, // retirement age
      85, // life expectancy
      profile.expenses,
      6 // inflation rate
    ) : 0;

    // Tax savings (assuming 80C investments)
    const investment80C = 
      (profile.investments?.ppf || 0) +
      (profile.investments?.epf || 0) +
      (profile.investments?.nps || 0);
    const taxSavings = financeUtils.calculateTaxSavings(investment80C, 30);

    // Monthly surplus
    const monthlySurplus = profile.income - profile.expenses;

    // Debt service ratio (assuming 20-year loans at 10% interest)
    const estimatedMonthlyDebt = totalLiabilities > 0 
      ? financeUtils.simulateLoanRepayment(totalLiabilities, 10, 20).emi 
      : 0;
    const debtToIncome = financeUtils.calculateDebtToIncome(estimatedMonthlyDebt, profile.income);

    // Build comprehensive analytics response
    const analytics = {
      summary: {
        netWorth,
        totalAssets,
        totalLiabilities,
        liquidAssets,
        retirementAssets,
        totalInsurance,
        monthlySurplus,
        healthScore
      },
      ratios: {
        savingsRate: parseFloat(savingsRate.toFixed(2)),
        debtToAssetRatio: parseFloat(debtRatio.toFixed(2)),
        debtToIncomeRatio: parseFloat(debtToIncome.toFixed(2)),
        emergencyFundMonths: parseFloat(emergencyFundMonths.toFixed(1)),
        diversificationScore
      },
      planning: {
        retirementCorpusNeeded: retirementCorpus,
        currentRetirementSavings: retirementAssets,
        retirementGap: Math.max(0, retirementCorpus - retirementAssets),
        taxSavingsAnnual: taxSavings,
        investment80C
      },
      allocation: assetAllocation,
      insights: generateInsights(profile, {
        savingsRate,
        debtRatio,
        emergencyFundMonths,
        diversificationScore,
        healthScore
      })
    };

    res.status(200).json({
      status: 'success',
      data: analytics
    });

  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate analytics'
    });
  }
};

/**
 * Generate actionable insights based on financial metrics
 */
function generateInsights(profile, metrics) {
  const insights = [];

  // Savings rate insights
  if (metrics.savingsRate < 20) {
    insights.push({
      type: 'warning',
      category: 'savings',
      message: `Your savings rate is ${metrics.savingsRate.toFixed(0)}%. Aim for at least 20% to build wealth effectively.`,
      action: 'Review expenses and identify areas to cut back'
    });
  } else if (metrics.savingsRate >= 40) {
    insights.push({
      type: 'success',
      category: 'savings',
      message: `Excellent! Your ${metrics.savingsRate.toFixed(0)}% savings rate is in the top 10% of users.`,
      action: 'Consider increasing investment allocation'
    });
  }

  // Emergency fund insights
  if (metrics.emergencyFundMonths < 3) {
    insights.push({
      type: 'critical',
      category: 'emergency',
      message: `Your emergency fund covers only ${metrics.emergencyFundMonths.toFixed(1)} months. Aim for 6 months.`,
      action: `Build emergency fund to ₹${(profile.expenses * 6).toLocaleString()}`
    });
  }

  // Debt insights
  if (metrics.debtRatio > 50) {
    insights.push({
      type: 'warning',
      category: 'debt',
      message: `High debt-to-asset ratio at ${metrics.debtRatio.toFixed(0)}%. Consider debt consolidation.`,
      action: 'Focus on paying down high-interest debt first'
    });
  }

  // Diversification insights
  if (metrics.diversificationScore < 40) {
    insights.push({
      type: 'info',
      category: 'diversification',
      message: `Low diversification score (${metrics.diversificationScore}). Your portfolio is concentrated.`,
      action: 'Spread investments across multiple asset classes'
    });
  }

  // Credit score insights
  if (profile.credit_score < 700) {
    insights.push({
      type: 'warning',
      category: 'credit',
      message: `Credit score of ${profile.credit_score} is below ideal. This affects loan eligibility.`,
      action: 'Pay bills on time and reduce credit utilization'
    });
  }

  // Age-based insights
  if (profile.age && profile.age < 35 && metrics.savingsRate > 30) {
    insights.push({
      type: 'success',
      category: 'planning',
      message: `At age ${profile.age} with ${metrics.savingsRate.toFixed(0)}% savings rate, you're on track for early retirement.`,
      action: 'Consider aggressive growth investments'
    });
  }

  return insights;
}

module.exports = exports;
