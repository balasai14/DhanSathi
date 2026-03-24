const mongoose = require('mongoose');

const FinancialProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  investments: {
    stocks: { type: Number, default: 0 },
    mutual_funds: { type: Number, default: 0 },
    bonds: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    real_estate: { type: Number, default: 0 },
    epf: { type: Number, default: 0 }, // Employee Provident Fund
    ppf: { type: Number, default: 0 }, // Public Provident Fund
    nps: { type: Number, default: 0 }, // National Pension System
    fd: { type: Number, default: 0 }, // Fixed Deposits
    crypto: { type: Number, default: 0 }
  },
  loans: {
    home_loan: { type: Number, default: 0 },
    car_loan: { type: Number, default: 0 },
    personal_loan: { type: Number, default: 0 },
    education_loan: { type: Number, default: 0 },
    credit_card_debt: { type: Number, default: 0 }
  },
  insurance: {
    life_insurance: { type: Number, default: 0 },
    health_insurance: { type: Number, default: 0 },
    term_insurance: { type: Number, default: 0 }
  },
  credit_score: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  dependents: { type: Number, default: 0 },
  risk_profile: { 
    type: String, 
    enum: ['conservative', 'moderate', 'aggressive'], 
    default: 'moderate' 
  },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FinancialProfile', FinancialProfileSchema);
