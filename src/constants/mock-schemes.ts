export interface SchemeItem {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string;
  status: 'Eligible' | 'Partially Eligible';
  color: string;
  authority: string;
  dateLaunched: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  importantDates: string;
  officialWebsite: string;
}

export const MOCK_SCHEMES_DB: SchemeItem[] = [
  {
    id: 'pm-scholarship',
    name: 'PM Scholarship Scheme',
    category: 'Education',
    description: 'Provides financial assistance to children of deceased/ex-servicemen of Armed Forces for pursuing technical/professional higher education.',
    benefits: '₹3,000 per month for girls, ₹2,500 per month for boys.',
    status: 'Eligible',
    color: '#3B82F6', // Blue
    authority: 'Department of Ex-Servicemen Welfare, Ministry of Defence',
    dateLaunched: '15-Aug-2006',
    eligibilityCriteria: [
      'Citizen of India.',
      'Wards/widows of deceased/ex-servicemen of Armed Forces.',
      'Minimum 60% marks in Class 12 or equivalent qualification.',
      'Must be pursuing recognized professional degree courses.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Ex-Servicemen Certificate / Identity Card',
      'Class 12 Marksheet & Passing Certificate',
      'Bank Account Passbook (for DBT transfer)'
    ],
    applicationProcess: [
      '1. Login to the National Scholarship Portal (NSP).',
      '2. Select PM Scholarship Scheme from the Central Schemes list.',
      '3. Complete the form and upload Ex-servicemen ID and marksheet credentials.',
      '4. Submit and track verification status on the portal.'
    ],
    importantDates: 'Application Deadline: 31-Dec-2026',
    officialWebsite: 'https://desw.gov.in',
  },
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Agriculture',
    description: 'An initiative by the government of India that provides up to ₹6,000 per year in three equal installments to small and marginal farmers.',
    benefits: '₹6,000 per annum (in three direct transfer installments).',
    status: 'Partially Eligible',
    color: '#10B981', // Green
    authority: 'Ministry of Agriculture and Farmers Welfare',
    dateLaunched: '24-Feb-2019',
    eligibilityCriteria: [
      'Citizen of India.',
      'Must be a small/marginal landholder farmer family.',
      'Cultivable landholdings must be listed in state revenue records.',
      'Excludes institutional landholders or income-tax payers.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Landholding Revenue Certificate (Fard/Khatauni)',
      'Active Bank Account Passbook',
      'Aadhaar-seeded mobile number'
    ],
    applicationProcess: [
      '1. Visit the PM-Kisan official portal or nearest CSC.',
      '2. Complete the Farmer Registration form.',
      '3. Input land details and upload verified revenue documents.',
      '4. Local revenue authority (Patwari) completes field audit verification.'
    ],
    importantDates: '18th Installment: Late August 2026',
    officialWebsite: 'https://pmkisan.gov.in',
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat (PM-JAY)',
    category: 'Healthcare',
    description: 'National health protection scheme that aims to provide free access to health insurance coverage for low-income families.',
    benefits: 'Free health cover up to ₹5 Lakh per family per year for secondary/tertiary hospitalizations.',
    status: 'Eligible',
    color: '#EF4444', // Red
    authority: 'National Health Authority (NHA)',
    dateLaunched: '23-Sep-2018',
    eligibilityCriteria: [
      'Citizen of India.',
      'Must belong to designated low-income categories.',
      'Families must be listed in SECC-2011 database records.',
      'Excludes families owning motorized vehicles or permanent houses.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Ration Card / Family Declaration Letter',
      'Income Certificate (Linked in DigiLocker)',
      'Registered Mobile number'
    ],
    applicationProcess: [
      '1. Check eligibility status on the PM-JAY website using mobile number.',
      '2. Visit nearest Empaneled Hospital or CSC card kiosk.',
      '3. Complete biometric e-KYC using Aadhaar.',
      '4. Receive Ayushman card for cashless hospitalization treatments.'
    ],
    importantDates: 'Registration: Open & Ongoing',
    officialWebsite: 'https://pmjay.gov.in',
  },
  {
    id: 'startup-india',
    name: 'Startup India Initiative',
    category: 'Business & Entrepreneurship',
    description: 'Promotes entrepreneurship by providing tax exemptions, financial support, and compliance ease to budding startups.',
    benefits: 'Tax holiday for 3 years, ₹10,000 Crore fund of funds, fast-tracked patent examination.',
    status: 'Eligible',
    color: '#8B5CF6', // Purple
    authority: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    dateLaunched: '16-Jan-2016',
    eligibilityCriteria: [
      'Entity incorporated as Private Limited, LLP, or Registered Partnership.',
      'Incorporation age must be less than 10 years.',
      'Annual turnover must not exceed ₹100 Crore in any financial year.',
      'Must focus on innovation, development or improvement of products.'
    ],
    requiredDocuments: [
      'Certificate of Incorporation / Registration',
      'Brief write-up describing the innovative nature of business',
      'Co-founders profiles & PAN Cards',
      'Patent details (if filed/registered)'
    ],
    applicationProcess: [
      '1. Register on the Startup India online portal.',
      '2. Complete the Application for DPIIT recognition.',
      '3. Submit business profile details and incorporation files.',
      '4. Board reviews the innovation criteria and issues digital certificates.'
    ],
    importantDates: 'Filing: Open year-round',
    officialWebsite: 'https://startupindia.gov.in',
  },
  {
    id: 'naps',
    name: 'National Apprenticeship Promotion Scheme (NAPS)',
    category: 'Skill Development',
    description: 'Promotes apprenticeship training and increases engagement of apprentices by sharing stipends with employers.',
    benefits: 'Sharing of 25% of prescribed stipend subject to a max of ₹1,500 per month per apprentice.',
    status: 'Eligible',
    color: '#06B6D4', // Cyan
    authority: 'Ministry of Skill Development & Entrepreneurship',
    dateLaunched: '19-Aug-2016',
    eligibilityCriteria: [
      'Age must be 15 years or above.',
      'Minimum educational qualifications: Class 5 pass depending on trade.',
      'Must undergo apprenticeship training in a registered establishment.',
      'Must sign digital contract of apprenticeship with employer.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Educational Marksheets & Certificates',
      'Active Bank Account details',
      'Passport size photograph'
    ],
    applicationProcess: [
      '1. Register as a Candidate on the Apprenticeship portal.',
      '2. Complete candidate profile details (marks, resume).',
      '3. Search opportunities and click Apply on matching positions.',
      '4. Sign apprenticeship contract forwarded by the establishment.'
    ],
    importantDates: 'Job Listings: Updated Daily',
    officialWebsite: 'https://apprenticeshipindia.gov.in',
  },
  {
    id: 'pm-mudra',
    name: 'PM Mudra Yojana (PMMY)',
    category: 'Finance & Loans',
    description: 'Provides low-interest microfinance loans up to ₹10 Lakh to non-corporate, non-farm small/micro enterprises.',
    benefits: 'Loans up to ₹10 Lakh under Shishu (₹50k), Kishor (₹5L), and Tarun (₹10L) categories without collateral.',
    status: 'Partially Eligible',
    color: '#F59E0B', // Amber
    authority: 'Micro Units Development & Refinance Agency Ltd (PMMY)',
    dateLaunched: '08-Apr-2015',
    eligibilityCriteria: [
      'Non-corporate, non-farm small business owners.',
      'Proprietors, partners, or small MSME units in manufacturing/services.',
      'Age between 18 and 65 years.',
      'No past defaults on loans or credit facilities.'
    ],
    requiredDocuments: [
      'KYC Identification (Aadhaar / Voter / PAN Card)',
      'Proof of business address & registration certificates',
      'Detailed project proposal & machine quotations',
      '2 Passport size photographs'
    ],
    applicationProcess: [
      '1. Visit any commercial, cooperative, or rural bank branch.',
      '2. Ask for the Mudra loan application form matching bracket.',
      '3. Submit business proposal details along with KYC identity files.',
      '4. Credit officer completes review and sanctions loan disbursement.'
    ],
    importantDates: 'Sanctions: Ongoing year-round',
    officialWebsite: 'https://mudra.org.in',
  },
];
