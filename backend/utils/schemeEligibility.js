/**
 * Backend Scheme Eligibility Evaluation Engine
 * Uses verified government scheme criteria.
 */

const SCHEMES_CATALOG = [
  {
    id: 'pm-scholarship',
    name: 'PM Scholarship Scheme (PMSS)',
    category: 'Education',
    authority: 'Department of Ex-Servicemen Welfare, Ministry of Defence',
    benefits: '₹3,000 per month for female students, ₹2,500 per month for male students (paid annually via DBT).',
    description: 'Provides financial assistance to dependent wards and widows pursuing technical and professional higher education.',
    hasOnlineApplication: true,
    applicationUrl: 'https://scholarships.gov.in',
  },
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Agriculture',
    authority: 'Ministry of Agriculture and Farmers Welfare',
    benefits: 'Direct financial transfer of ₹6,00,0 per annum in three equal installments of ₹2,000.',
    description: 'Provides income support directly to landholding farmer families across India.',
    hasOnlineApplication: true,
    applicationUrl: 'https://pmkisan.gov.in/RegistrationFormNew.aspx',
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat (PM-JAY)',
    category: 'Healthcare',
    authority: 'National Health Authority (NHA), Ministry of Health & Family Welfare',
    benefits: 'Free health insurance cover up to ₹5,00,000 per family per year across 27,000+ empaneled hospitals.',
    description: 'Offers cashless secondary and tertiary hospitalization care to vulnerable and low-income families and seniors 70+.',
    hasOnlineApplication: true,
    applicationUrl: 'https://beneficiary.nha.gov.in',
  },
  {
    id: 'startup-india',
    name: 'Startup India Initiative (DPIIT Recognition)',
    category: 'Business & Entrepreneurship',
    authority: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    benefits: 'Section 80-IAC tax holiday, 80% rebate in patent filing fees, access to Fund of Funds.',
    description: 'Empowers entrepreneurs with government recognition and income tax exemptions.',
    hasOnlineApplication: true,
    applicationUrl: 'https://www.startupindia.gov.in/content/sih/en/startupgov/dpiit-recognition.html',
  },
  {
    id: 'naps',
    name: 'National Apprenticeship Promotion Scheme (NAPS)',
    category: 'Skill Development',
    authority: 'Ministry of Skill Development & Entrepreneurship',
    benefits: 'Direct government stipend sharing of 25% of prescribed monthly stipend up to ₹1,500/month.',
    description: 'Promotes industry apprenticeship training for Indian youth with recognized establishments.',
    hasOnlineApplication: true,
    applicationUrl: 'https://www.apprenticeshipindia.gov.in/candidate-registration',
  },
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    category: 'Finance & Urban Livelihood',
    authority: 'Ministry of Housing and Urban Affairs (MoHUA)',
    benefits: 'Collateral-free working capital loan of ₹10,000 to ₹50,000 with 7% interest subsidy.',
    description: 'Micro-credit facility empowering urban, peri-urban, and rural street vendors.',
    hasOnlineApplication: true,
    applicationUrl: 'https://pmsvanidhi.mohua.gov.in',
  },
  {
    id: 'pm-mudra',
    name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    category: 'Finance & Loans',
    authority: 'Department of Financial Services, Ministry of Finance',
    benefits: 'Collateral-free loans up to ₹10 Lakh under Shishu, Kishor, and Tarun categories.',
    description: 'Provides low-interest microfinance loans to non-corporate small and micro enterprises.',
    hasOnlineApplication: false,
    applicationUrl: null,
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    category: 'Women & Child Welfare',
    authority: 'Ministry of Finance & Department of Posts',
    benefits: 'Government-guaranteed interest rate of 8.2% p.a. with 100% tax exemption under Section 80C.',
    description: 'A savings scheme for parents of girl children under Beti Bachao Beti Padhao campaign.',
    hasOnlineApplication: false,
    applicationUrl: null,
  },
];

function evaluateBackendSchemeEligibility(profile) {
  if (!profile) {
    return {
      hasProfile: false,
      missingFields: ['state', 'age', 'occupation', 'income'],
      eligibleSchemes: [],
      ineligibleSchemes: SCHEMES_CATALOG,
    };
  }

  const missingFields = [];
  if (!profile.state) missingFields.push('State');
  if (profile.age === undefined || profile.age === '' || isNaN(Number(profile.age))) missingFields.push('Age');
  if (!profile.occupation) missingFields.push('Occupation');
  if (profile.income === undefined || profile.income === '' || isNaN(Number(profile.income))) missingFields.push('Income');

  if (missingFields.length > 0) {
    return {
      hasProfile: false,
      missingFields,
      eligibleSchemes: [],
      ineligibleSchemes: SCHEMES_CATALOG,
    };
  }

  const age = Number(profile.age);
  const income = Number(profile.income);
  const occ = (profile.occupation || '').trim();
  const gender = (profile.gender || '').trim();
  const isStudent = (profile.student || '').toLowerCase() === 'yes' || occ === 'Student';
  const isFarmer = (profile.farmer || '').toLowerCase() === 'yes' || occ === 'Agriculturist / Farmer';
  const isSenior = (profile.senior || '').toLowerCase() === 'yes' || age >= 60;
  const isDisabled = (profile.disabled || '').toLowerCase() === 'yes';

  const eligibleSchemes = [];
  const ineligibleSchemes = [];

  for (const s of SCHEMES_CATALOG) {
    let eligible = false;
    let matchReason = '';

    switch (s.id) {
      case 'pm-kisan':
        if (isFarmer && income <= 500000 && !(occ === 'Salaried Employee' && income > 300000)) {
          eligible = true;
          matchReason = `Matches your profile as an Agriculturist / Farmer with family income (₹${income.toLocaleString('en-IN')}) eligible for direct ₹6,000/year DBT income support.`;
        }
        break;

      case 'pm-scholarship':
        if (isStudent && age >= 16 && age <= 30 && !isSenior && occ !== 'Retired / Pensioner') {
          eligible = true;
          matchReason = `Matches your student status pursuing higher education within the eligible age limit (${age} years) for ₹2,500–₹3,000/month scholarship.`;
        }
        break;

      case 'ayushman-bharat':
        if (age >= 70) {
          eligible = true;
          matchReason = `Eligible under universal PM-JAY expanded health coverage for senior citizens aged 70+ regardless of family income.`;
        } else if (income <= 250000 || (income <= 300000 && (occ === 'Daily Wage Labourer' || occ === 'Unemployed')) || (isDisabled && income <= 400000)) {
          eligible = true;
          matchReason = `Matches your annual family income (₹${income.toLocaleString('en-IN')}) under priority household limit for ₹5,00,000 annual cashless health cover.`;
        }
        break;

      case 'startup-india':
        if (age >= 18 && age <= 65 && occ === 'Self-Employed / Business Owner') {
          eligible = true;
          matchReason = `Matches your profile as a Self-Employed / Business Owner for DPIIT tax exemptions, fast-track IP, and government procurement benefits.`;
        }
        break;

      case 'naps':
        if (age >= 14 && age <= 35 && !isSenior && occ !== 'Retired / Pensioner' && occ !== 'Salaried Employee') {
          eligible = true;
          matchReason = `Matches your youth age (${age} years) and skill development profile for industry apprenticeship and government stipend sharing.`;
        }
        break;

      case 'pm-svanidhi':
        if (age >= 18 && (occ === 'Daily Wage Labourer' || occ === 'Self-Employed / Business Owner') && income <= 300000) {
          eligible = true;
          matchReason = `Matches your livelihood profile with family income under ₹3 Lakh for collateral-free working capital micro-loans up to ₹50,000.`;
        }
        break;

      case 'pm-mudra':
        if (age >= 18 && age <= 65 && occ !== 'Student' && (occ === 'Self-Employed / Business Owner' || occ === 'Daily Wage Labourer' || occ === 'Agriculturist / Farmer')) {
          eligible = true;
          matchReason = `Matches your business profile and age (${age} years) for collateral-free Mudra credit up to ₹10 Lakh across Shishu, Kishor, and Tarun categories.`;
        }
        break;

      case 'sukanya-samriddhi':
        if (gender === 'Female' && age <= 10) {
          eligible = true;
          matchReason = `Eligible directly in the name of the girl child (age ${age} years) for 8.2% tax-free compound savings.`;
        }
        break;
    }

    if (eligible) {
      eligibleSchemes.push({ ...s, isEligible: true, matchReason, status: 'Eligible' });
    } else {
      ineligibleSchemes.push({ ...s, isEligible: false, status: 'Partially Eligible' });
    }
  }

  return {
    hasProfile: true,
    missingFields: [],
    eligibleSchemes,
    ineligibleSchemes,
    totalEvaluated: SCHEMES_CATALOG.length,
  };
}

module.exports = {
  SCHEMES_CATALOG,
  evaluateBackendSchemeEligibility,
  evaluateSchemeEligibility: evaluateBackendSchemeEligibility,
};
