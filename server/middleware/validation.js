/**
 * Input Validation Middleware
 */

// Validate financial profile data
exports.validateFinanceProfile = (req, res, next) => {
  const { income, expenses, investments, loans, credit_score, age, dependents } = req.body;

  // Validate numeric fields
  if (income !== undefined && (typeof income !== 'number' || income < 0)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Income must be a positive number'
    });
  }

  if (expenses !== undefined && (typeof expenses !== 'number' || expenses < 0)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Expenses must be a positive number'
    });
  }

  if (credit_score !== undefined && (typeof credit_score !== 'number' || credit_score < 300 || credit_score > 900)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Credit score must be between 300 and 900'
    });
  }

  if (age !== undefined && (typeof age !== 'number' || age < 18 || age > 120)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Age must be between 18 and 120'
    });
  }

  if (dependents !== undefined && (typeof dependents !== 'number' || dependents < 0)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Dependents must be a non-negative number'
    });
  }

  // Validate nested objects
  if (investments && typeof investments !== 'object') {
    return res.status(400).json({
      status: 'fail',
      message: 'Investments must be an object'
    });
  }

  if (loans && typeof loans !== 'object') {
    return res.status(400).json({
      status: 'fail',
      message: 'Loans must be an object'
    });
  }

  next();
};

// Validate AI query
exports.validateAIQuery = (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      status: 'fail',
      message: 'Query is required and must be a string'
    });
  }

  if (query.trim().length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Query cannot be empty'
    });
  }

  if (query.length > 1000) {
    return res.status(400).json({
      status: 'fail',
      message: 'Query is too long (max 1000 characters)'
    });
  }

  next();
};

// Validate simulation parameters
exports.validateSimulation = (req, res, next) => {
  const { monthlyInvestment, years, returnRate } = req.body;

  if (!monthlyInvestment || typeof monthlyInvestment !== 'number' || monthlyInvestment <= 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Monthly investment must be a positive number'
    });
  }

  if (!years || typeof years !== 'number' || years <= 0 || years > 50) {
    return res.status(400).json({
      status: 'fail',
      message: 'Years must be between 1 and 50'
    });
  }

  if (returnRate !== undefined && (typeof returnRate !== 'number' || returnRate < -50 || returnRate > 100)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Return rate must be between -50% and 100%'
    });
  }

  next();
};

module.exports = exports;
