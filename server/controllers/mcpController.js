const FinancialProfile = require('../models/FinancialProfile');
const User = require('../models/User');

/**
 * MCP-Compatible Data Export
 * Exports user financial data in Model Context Protocol compatible JSON format
 */
exports.exportMCPFormat = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    const profile = await FinancialProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'No financial profile found'
      });
    }

    // MCP-Compatible JSON Structure
    const mcpData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      financial_profile: {
        income: {
          monthly: profile.income,
          annual: profile.income * 12,
          currency: 'INR'
        },
        expenses: {
          monthly: profile.expenses,
          annual: profile.expenses * 12,
          currency: 'INR'
        },
        assets: {
          liquid: {
            stocks: profile.investments?.stocks || 0,
            mutual_funds: profile.investments?.mutual_funds || 0,
            bonds: profile.investments?.bonds || 0,
            crypto: profile.investments?.crypto || 0
          },
          retirement: {
            epf: profile.investments?.epf || 0,
            ppf: profile.investments?.ppf || 0,
            nps: profile.investments?.nps || 0
          },
          fixed: {
            fixed_deposits: profile.investments?.fd || 0,
            gold: profile.investments?.gold || 0,
            real_estate: profile.investments?.real_estate || 0
          },
          total: calculateTotalAssets(profile.investments)
        },
        liabilities: {
          secured: {
            home_loan: profile.loans?.home_loan || 0,
            car_loan: profile.loans?.car_loan || 0,
            education_loan: profile.loans?.education_loan || 0
          },
          unsecured: {
            personal_loan: profile.loans?.personal_loan || 0,
            credit_card_debt: profile.loans?.credit_card_debt || 0
          },
          total: calculateTotalLiabilities(profile.loans)
        },
        insurance: {
          life_insurance: profile.insurance?.life_insurance || 0,
          health_insurance: profile.insurance?.health_insurance || 0,
          term_insurance: profile.insurance?.term_insurance || 0
        },
        metrics: {
          credit_score: profile.credit_score || 0,
          net_worth: calculateTotalAssets(profile.investments) - calculateTotalLiabilities(profile.loans),
          savings_rate: calculateSavingsRate(profile.income, profile.expenses),
          debt_to_asset_ratio: calculateDebtRatio(
            calculateTotalAssets(profile.investments),
            calculateTotalLiabilities(profile.loans)
          ),
          monthly_surplus: profile.income - profile.expenses
        },
        demographics: {
          age: profile.age || 0,
          dependents: profile.dependents || 0,
          risk_profile: profile.risk_profile || 'moderate'
        },
        last_updated: profile.lastUpdated
      }
    };

    res.status(200).json({
      status: 'success',
      format: 'MCP-compatible',
      data: mcpData
    });

  } catch (err) {
    console.error('MCP Export Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export MCP-compatible data'
    });
  }
};

/**
 * Import MCP-Compatible Data
 */
exports.importMCPFormat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { financial_profile } = req.body;

    if (!financial_profile) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid MCP format: missing financial_profile'
      });
    }

    // Map MCP format to internal schema
    const profileData = {
      userId,
      income: financial_profile.income?.monthly || 0,
      expenses: financial_profile.expenses?.monthly || 0,
      investments: {
        stocks: financial_profile.assets?.liquid?.stocks || 0,
        mutual_funds: financial_profile.assets?.liquid?.mutual_funds || 0,
        bonds: financial_profile.assets?.liquid?.bonds || 0,
        crypto: financial_profile.assets?.liquid?.crypto || 0,
        epf: financial_profile.assets?.retirement?.epf || 0,
        ppf: financial_profile.assets?.retirement?.ppf || 0,
        nps: financial_profile.assets?.retirement?.nps || 0,
        fd: financial_profile.assets?.fixed?.fixed_deposits || 0,
        gold: financial_profile.assets?.fixed?.gold || 0,
        real_estate: financial_profile.assets?.fixed?.real_estate || 0
      },
      loans: {
        home_loan: financial_profile.liabilities?.secured?.home_loan || 0,
        car_loan: financial_profile.liabilities?.secured?.car_loan || 0,
        education_loan: financial_profile.liabilities?.secured?.education_loan || 0,
        personal_loan: financial_profile.liabilities?.unsecured?.personal_loan || 0,
        credit_card_debt: financial_profile.liabilities?.unsecured?.credit_card_debt || 0
      },
      insurance: {
        life_insurance: financial_profile.insurance?.life_insurance || 0,
        health_insurance: financial_profile.insurance?.health_insurance || 0,
        term_insurance: financial_profile.insurance?.term_insurance || 0
      },
      credit_score: financial_profile.metrics?.credit_score || 0,
      age: financial_profile.demographics?.age || 0,
      dependents: financial_profile.demographics?.dependents || 0,
      risk_profile: financial_profile.demographics?.risk_profile || 'moderate',
      lastUpdated: Date.now()
    };

    const profile = await FinancialProfile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'MCP data imported successfully',
      data: { profile }
    });

  } catch (err) {
    console.error('MCP Import Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to import MCP data'
    });
  }
};

// Helper functions
function calculateTotalAssets(investments) {
  if (!investments) return 0;
  return Object.values(investments).reduce((sum, val) => sum + (val || 0), 0);
}

function calculateTotalLiabilities(loans) {
  if (!loans) return 0;
  return Object.values(loans).reduce((sum, val) => sum + (val || 0), 0);
}

function calculateSavingsRate(income, expenses) {
  if (!income || income <= 0) return 0;
  const savings = Math.max(0, income - expenses);
  return (savings / income) * 100;
}

function calculateDebtRatio(totalAssets, totalDebt) {
  if (!totalAssets || totalAssets <= 0) return totalDebt > 0 ? 100 : 0;
  return (totalDebt / totalAssets) * 100;
}

module.exports = exports;
