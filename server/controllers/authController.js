const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token signing
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_finova', {
    expiresIn: '7d',
  });
};

// Response with cookie
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  // Hide password
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token, // Optional: for non-cookie backends, but nice for local state
    data: { user },
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const newUser = await User.create({ name, email, password });
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error('Provide email and password');

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Incorrect email or password');
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.loginDemo = async (req, res) => {
  try {
    const FinancialProfile = require('../models/FinancialProfile');
    let user = await User.findOne({ email: 'demo@finova.ai' });
    
    if (!user) {
      user = await User.create({
        name: 'Demo Architect',
        email: 'demo@finova.ai',
        password: 'demopassword123'
      });

      // Preload with comprehensive profile
      await FinancialProfile.create({
        userId: user._id,
        income: 120000,
        expenses: 55000,
        investments: { 
          stocks: 350000, 
          mutual_funds: 280000,
          bonds: 100000,
          gold: 180000,
          real_estate: 2500000,
          epf: 450000,
          ppf: 200000,
          nps: 150000,
          fd: 300000,
          crypto: 50000
        },
        loans: { 
          home_loan: 1800000,
          car_loan: 250000,
          personal_loan: 0,
          education_loan: 0,
          credit_card_debt: 35000
        },
        insurance: {
          life_insurance: 5000000,
          health_insurance: 1000000,
          term_insurance: 10000000
        },
        credit_score: 780,
        age: 32,
        dependents: 2,
        risk_profile: 'moderate'
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
