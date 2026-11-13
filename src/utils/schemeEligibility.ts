import { GOVERNMENT_SCHEMES_CATALOG, SchemeItem } from '@/constants/mock-schemes';

export interface CitizenProfile {
  age?: number | string;
  state?: string;
  district?: string;
  gender?: string;
  occupation?: string;
  income?: number | string;
  student?: string; // 'yes' | 'no'
  farmer?: string;  // 'yes' | 'no'
  senior?: string;  // 'yes' | 'no'
  disabled?: string;// 'yes' | 'no'
  caste?: string;
}

export interface EvaluatedScheme extends SchemeItem {
  isEligible: boolean;
  matchReason?: string;
  unmetCriteria?: string[];
}

export interface EligibilityResult {
  hasProfile: boolean;
  missingFields: string[];
  eligibleSchemes: EvaluatedScheme[];
  ineligibleSchemes: EvaluatedScheme[];
  totalEvaluated: number;
}

/**
 * Pure evaluation engine: compares citizen answers against actual verified scheme eligibility.
 * Never invents eligibility rules or assumes missing data.
 */
export function evaluateSchemeEligibility(
  profile?: CitizenProfile | null,
  schemes: SchemeItem[] = GOVERNMENT_SCHEMES_CATALOG
): EligibilityResult {
  if (!profile) {
    return {
      hasProfile: false,
      missingFields: ['state', 'age', 'occupation', 'income', 'student', 'farmer'],
      eligibleSchemes: [],
      ineligibleSchemes: schemes.map((s) => ({ ...s, isEligible: false })),
      totalEvaluated: schemes.length,
    };
  }

  const missingFields: string[] = [];
  if (!profile.state) missingFields.push('State');
  if (profile.age === undefined || profile.age === '' || isNaN(Number(profile.age))) missingFields.push('Age');
  if (!profile.occupation) missingFields.push('Occupation');
  if (profile.income === undefined || profile.income === '' || isNaN(Number(profile.income))) missingFields.push('Income');

  if (missingFields.length > 0) {
    return {
      hasProfile: false,
      missingFields,
      eligibleSchemes: [],
      ineligibleSchemes: schemes.map((s) => ({ ...s, isEligible: false })),
      totalEvaluated: schemes.length,
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

  const eligibleSchemes: EvaluatedScheme[] = [];
  const ineligibleSchemes: EvaluatedScheme[] = [];

  for (const scheme of schemes) {
    let eligible = false;
    let matchReason = '';
    const unmet: string[] = [];

    switch (scheme.id) {
      case 'pm-kisan': {
        // Mandatory: Must be landholding farmer family & not high corporate income tax payer
        if (!isFarmer) {
          unmet.push('Requires applicant to be a landholding farmer family.');
        } else if (occ === 'Salaried Employee' && income > 300000) {
          unmet.push('Excludes regular high-salaried income-tax payers.');
        } else if (income > 500000) {
          unmet.push('Income exceeds small & marginal farmer assistance guidelines.');
        } else {
          eligible = true;
          matchReason = `Matches your profile as an Agriculturist / Farmer with family income (₹${income.toLocaleString('en-IN')}) eligible for direct ₹6,000/year DBT income support.`;
        }
        break;
      }

      case 'pm-scholarship': {
        // Mandatory: Must be enrolled in higher technical/professional education
        if (!isStudent) {
          unmet.push('Requires applicant to be a currently enrolled student pursuing higher education.');
        } else if (age < 16 || age > 30) {
          unmet.push('Applicant age must be between 16 and 30 years for higher education scholarship.');
        } else if (isSenior || occ === 'Retired / Pensioner') {
          unmet.push('Not applicable for senior citizens or retired pensioners.');
        } else {
          eligible = true;
          matchReason = `Matches your student status pursuing higher education within the eligible age limit (${age} years) for ₹2,500–₹3,000/month scholarship.`;
        }
        break;
      }

      case 'ayushman-bharat': {
        // Mandatory: Low-income priority family (income <= 2.5L / 3L for laborers) OR Universal Senior Citizen 70+
        if (age >= 70) {
          eligible = true;
          matchReason = `Eligible under universal PM-JAY expanded health coverage for senior citizens aged 70+ regardless of family income.`;
        } else if (income <= 250000 || (income <= 300000 && (occ === 'Daily Wage Labourer' || occ === 'Unemployed'))) {
          eligible = true;
          matchReason = `Matches your annual family income (₹${income.toLocaleString('en-IN')}) under priority household limit for ₹5,00,000 annual cashless health cover.`;
        } else if (isDisabled && income <= 400000) {
          eligible = true;
          matchReason = `Matches healthcare assurance criteria under priority welfare provisions.`;
        } else {
          unmet.push('Annual family income exceeds the priority threshold (₹2,50,000) for general applicants under 70 years.');
        }
        break;
      }

      case 'startup-india': {
        // Mandatory: Age 18+ and Self-Employed / Business Owner
        if (age < 18) {
          unmet.push('Minimum age requirement is 18 years to incorporate an enterprise.');
        } else if (occ !== 'Self-Employed / Business Owner') {
          unmet.push('Exclusively intended for business proprietors, entrepreneurs, and registered entity founders.');
        } else if (age > 65) {
          unmet.push('Applicant age exceeds maximum upper limit (65 years) for active venture incubation.');
        } else {
          eligible = true;
          matchReason = `Matches your profile as a Self-Employed / Business Owner for DPIIT tax exemptions, fast-track IP, and government procurement benefits.`;
        }
        break;
      }

      case 'naps': {
        // Mandatory: Youth skill training (Age 14 - 35), not retired/senior
        if (age < 14 || age > 35) {
          unmet.push('National Apprenticeship guidelines require youth age between 14 and 35 years.');
        } else if (isSenior || occ === 'Retired / Pensioner') {
          unmet.push('Excludes senior citizens and retired pensioners.');
        } else if (occ === 'Salaried Employee') {
          unmet.push('Excludes already established regular salaried personnel.');
        } else {
          eligible = true;
          matchReason = `Matches your youth age (${age} years) and skill development profile for industry apprenticeship and government stipend sharing.`;
        }
        break;
      }

      case 'pm-svanidhi': {
        // Mandatory: Micro-entrepreneurs / Vendors / Labourers, Age 18+, Income <= 3L
        if (age < 18) {
          unmet.push('Minimum age requirement is 18 years for credit facilities.');
        } else if (occ !== 'Daily Wage Labourer' && occ !== 'Self-Employed / Business Owner') {
          unmet.push('Exclusively designed for urban/rural street vendors and daily livelihood micro-workers.');
        } else if (income > 300000) {
          unmet.push('Income exceeds the urban micro-credit threshold (₹3,00,000).');
        } else {
          eligible = true;
          matchReason = `Matches your livelihood profile with family income under ₹3 Lakh for collateral-free working capital micro-loans up to ₹50,000.`;
        }
        break;
      }

      case 'pm-mudra': {
        // Mandatory: Age 18-65, Self-Employed / Business / Micro-enterprise
        if (age < 18 || age > 65) {
          unmet.push('Applicant age must be between 18 and 65 years at time of loan sanction.');
        } else if (occ === 'Student') {
          unmet.push('Students without a commercial business project are not eligible for Mudra loans.');
        } else if (occ !== 'Self-Employed / Business Owner' && occ !== 'Daily Wage Labourer' && occ !== 'Agriculturist / Farmer') {
          unmet.push('Designed for micro-enterprises, small shopkeepers, traders, and small business owners.');
        } else {
          eligible = true;
          matchReason = `Matches your business profile and age (${age} years) for collateral-free Mudra credit up to ₹10 Lakh across Shishu, Kishor, and Tarun categories.`;
        }
        break;
      }

      case 'sukanya-samriddhi': {
        // Mandatory: Must be a girl child resident of India aged 10 years or younger
        if (gender === 'Female' && age <= 10) {
          eligible = true;
          matchReason = `Eligible directly in the name of the girl child (age ${age} years) for 8.2% tax-free compound savings.`;
        } else {
          unmet.push('Reserved for girl children below 10 years of age (or parents/legal guardians applying exclusively on behalf of a daughter under 10).');
        }
        break;
      }

      default: {
        eligible = false;
        unmet.push('Does not match mandatory profile criteria.');
      }
    }

    const evaluated: EvaluatedScheme = {
      ...scheme,
      isEligible: eligible,
      matchReason: eligible ? matchReason : undefined,
      unmetCriteria: unmet.length > 0 ? unmet : undefined,
      status: eligible ? 'Eligible' : 'Partially Eligible',
    };

    if (eligible) {
      eligibleSchemes.push(evaluated);
    } else {
      ineligibleSchemes.push(evaluated);
    }
  }

  return {
    hasProfile: true,
    missingFields: [],
    eligibleSchemes,
    ineligibleSchemes,
    totalEvaluated: schemes.length,
  };
}
