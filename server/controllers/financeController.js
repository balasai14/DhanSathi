const FinancialProfile = require('../models/FinancialProfile');

exports.saveProfile = async (req, res) => {
  try {
    const { 
      income, 
      expenses, 
      investments, 
      loans, 
      insurance,
      credit_score,
      age,
      dependents,
      risk_profile
    } = req.body;
    
    const updateData = {
      lastUpdated: Date.now()
    };

    // Only update provided fields
    if (income !== undefined) updateData.income = income;
    if (expenses !== undefined) updateData.expenses = expenses;
    if (credit_score !== undefined) updateData.credit_score = credit_score;
    if (age !== undefined) updateData.age = age;
    if (dependents !== undefined) updateData.dependents = dependents;
    if (risk_profile !== undefined) updateData.risk_profile = risk_profile;

    // Handle nested objects
    if (investments) {
      updateData.investments = {
        stocks: investments.stocks || 0,
        mutual_funds: investments.mutual_funds || 0,
        bonds: investments.bonds || 0,
        gold: investments.gold || 0,
        real_estate: investments.real_estate || 0,
        epf: investments.epf || 0,
        ppf: investments.ppf || 0,
        nps: investments.nps || 0,
        fd: investments.fd || 0,
        crypto: investments.crypto || 0
      };
    }

    if (loans) {
      updateData.loans = {
        home_loan: loans.home_loan || 0,
        car_loan: loans.car_loan || 0,
        personal_loan: loans.personal_loan || 0,
        education_loan: loans.education_loan || 0,
        credit_card_debt: loans.credit_card_debt || 0
      };
    }

    if (insurance) {
      updateData.insurance = {
        life_insurance: insurance.life_insurance || 0,
        health_insurance: insurance.health_insurance || 0,
        term_insurance: insurance.term_insurance || 0
      };
    }

    const profile = await FinancialProfile.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true, upsert: true }
    );

    res.status(200).json({ status: 'success', data: { profile } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    let profile = await FinancialProfile.findOne({ userId: req.user.id });
    
    // Return default structure if no profile exists
    if (!profile) {
      return res.status(200).json({
        status: 'success',
        data: {
          profile: {
            income: 0,
            expenses: 0,
            investments: {
              stocks: 0,
              mutual_funds: 0,
              bonds: 0,
              gold: 0,
              real_estate: 0,
              epf: 0,
              ppf: 0,
              nps: 0,
              fd: 0,
              crypto: 0
            },
            loans: {
              home_loan: 0,
              car_loan: 0,
              personal_loan: 0,
              education_loan: 0,
              credit_card_debt: 0
            },
            insurance: {
              life_insurance: 0,
              health_insurance: 0,
              term_insurance: 0
            },
            credit_score: 0,
            age: 0,
            dependents: 0,
            risk_profile: 'moderate'
          }
        }
      });
    }

    // Ensure all nested structures exist
    const sanitizedProfile = {
      income: profile.income || 0,
      expenses: profile.expenses || 0,
      investments: {
        stocks: profile.investments?.stocks || 0,
        mutual_funds: profile.investments?.mutual_funds || 0,
        bonds: profile.investments?.bonds || 0,
        gold: profile.investments?.gold || 0,
        real_estate: profile.investments?.real_estate || 0,
        epf: profile.investments?.epf || 0,
        ppf: profile.investments?.ppf || 0,
        nps: profile.investments?.nps || 0,
        fd: profile.investments?.fd || 0,
        crypto: profile.investments?.crypto || 0
      },
      loans: {
        home_loan: profile.loans?.home_loan || 0,
        car_loan: profile.loans?.car_loan || 0,
        personal_loan: profile.loans?.personal_loan || 0,
        education_loan: profile.loans?.education_loan || 0,
        credit_card_debt: profile.loans?.credit_card_debt || 0
      },
      insurance: {
        life_insurance: profile.insurance?.life_insurance || 0,
        health_insurance: profile.insurance?.health_insurance || 0,
        term_insurance: profile.insurance?.term_insurance || 0
      },
      credit_score: profile.credit_score || 0,
      age: profile.age || 0,
      dependents: profile.dependents || 0,
      risk_profile: profile.risk_profile || 'moderate'
    };

    res.status(200).json({ status: 'success', data: { profile: sanitizedProfile } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
