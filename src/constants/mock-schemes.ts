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
  applicationUrl?: string | null;
  hasOnlineApplication: boolean;
  applicationNotice?: string;
}

export const GOVERNMENT_SCHEMES_CATALOG: SchemeItem[] = [
  {
    id: 'pm-scholarship',
    name: 'PM Scholarship Scheme (PMSS)',
    category: 'Education',
    description: 'Provides financial assistance to dependent wards and widows of deceased/ex-servicemen of Armed Forces and Paramilitary personnel pursuing technical and professional higher education.',
    benefits: '₹3,000 per month for female students, ₹2,500 per month for male students (paid annually via DBT).',
    status: 'Eligible',
    color: '#3B82F6', // Blue
    authority: 'Department of Ex-Servicemen Welfare, Ministry of Defence',
    dateLaunched: '15-Aug-2006',
    eligibilityCriteria: [
      'Citizen of India.',
      'Wards/widows of deceased/ex-servicemen of Armed Forces & Coast Guard.',
      'Minimum 60% marks in Class 12 or equivalent qualification.',
      'Must be enrolled in first year of recognized professional degree courses (Engineering, Medical, MBA, etc.).'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Ex-Servicemen Certificate / KSB Discharge Book',
      'Class 12 Marksheet & Passing Certificate',
      'Bank Account Passbook with Aadhaar seeding',
      'College Bonafide Student Certificate'
    ],
    applicationProcess: [
      '1. Open the verified National Scholarship Portal (NSP).',
      '2. Register as a fresh student applicant using Aadhaar.',
      '3. Select Prime Minister\'s Scholarship Scheme under Ministry of Defence.',
      '4. Complete the online application and upload verified certificates.'
    ],
    importantDates: 'Fresh Applications: Open for 2026 Academic Year',
    officialWebsite: 'https://desw.gov.in',
    applicationUrl: 'https://scholarships.gov.in',
    hasOnlineApplication: true,
  },
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Agriculture',
    description: 'A central sector welfare scheme that provides income support of ₹6,000 per year in three equal four-monthly installments directly to small and marginal farmer families across India.',
    benefits: 'Direct financial transfer of ₹6,000 per annum (in three installments of ₹2,000 each).',
    status: 'Partially Eligible',
    color: '#10B981', // Green
    authority: 'Ministry of Agriculture and Farmers Welfare',
    dateLaunched: '24-Feb-2019',
    eligibilityCriteria: [
      'Citizen of India.',
      'Must be a landholding farmer family with cultivable land listed in state revenue records.',
      'Aadhaar seeded bank account with e-KYC completed.',
      'Excludes institutional landholders, constitutional post holders, or income-tax payers.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Landholding Revenue Record (Khatauni / Jamabandi)',
      'Active Bank Account Passbook with IFSC',
      'Aadhaar-linked Mobile Number for OTP'
    ],
    applicationProcess: [
      '1. Open the official PM-KISAN New Farmer Registration portal.',
      '2. Enter Aadhaar Number and select your State/District.',
      '3. Fill in land record details (Khasra/Khata number) and personal profile.',
      '4. Submit for online district verification and automated DBT linkage.'
    ],
    importantDates: '18th Installment: Rolling distribution active',
    officialWebsite: 'https://pmkisan.gov.in',
    applicationUrl: 'https://pmkisan.gov.in/RegistrationFormNew.aspx',
    hasOnlineApplication: true,
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat (PM-JAY)',
    category: 'Healthcare',
    description: 'The world\'s largest government-funded health assurance scheme, offering cashless secondary and tertiary hospitalization care to vulnerable and low-income families.',
    benefits: 'Free health insurance cover up to ₹5,00,000 per family per year across 27,000+ empaneled hospitals.',
    status: 'Eligible',
    color: '#EF4444', // Red
    authority: 'National Health Authority (NHA), Ministry of Health & Family Welfare',
    dateLaunched: '23-Sep-2018',
    eligibilityCriteria: [
      'Citizen of India.',
      'Belonging to eligible occupational/deprivation categories as per SECC database.',
      'All senior citizens aged 70+ now eligible under PM-JAY expanded cover.',
      'No restriction on family size, age, or gender.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Ration Card / NFSA Priority Household Card',
      'Mobile Number linked with Aadhaar for OTP',
      'Family composite ID (where applicable)'
    ],
    applicationProcess: [
      '1. Access the official NHA Beneficiary Portal.',
      '2. Authenticate using your Aadhaar number and OTP.',
      '3. Verify family member records and complete biometric/facial e-KYC.',
      '4. Download your official digital Ayushman PVC Card instantly.'
    ],
    importantDates: 'Registration: Open & Active Year-Round',
    officialWebsite: 'https://pmjay.gov.in',
    applicationUrl: 'https://beneficiary.nha.gov.in',
    hasOnlineApplication: true,
  },
  {
    id: 'startup-india',
    name: 'Startup India Initiative (DPIIT Recognition)',
    category: 'Business & Entrepreneurship',
    description: 'Flagship initiative empowering entrepreneurs with government recognition, 3-year income tax exemptions, patent fast-tracking, and priority public procurement benefits.',
    benefits: 'Section 80-IAC tax holiday, 80% rebate in patent filing fees, access to ₹10,000 Cr Fund of Funds.',
    status: 'Eligible',
    color: '#8B5CF6', // Purple
    authority: 'Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce',
    dateLaunched: '16-Jan-2016',
    eligibilityCriteria: [
      'Entity incorporated as Private Limited Company, Registered Partnership, or LLP in India.',
      'Period of incorporation must be less than 10 years from the date of registration.',
      'Turnover has not exceeded ₹100 Crore in any preceding financial year.',
      'Working towards innovation, development, or commercialization of new products/services.'
    ],
    requiredDocuments: [
      'Certificate of Incorporation / Registration from MCA',
      'Brief write-up and pitch deck on the innovative nature of business',
      'PAN Card of the Entity and Director details',
      'Patent / Trademark registration (if applicable)'
    ],
    applicationProcess: [
      '1. Open the official Startup India DPIIT Recognition portal.',
      '2. Register your business profile and director credentials.',
      '3. Complete the online recognition application form with supporting pitch deck.',
      '4. Receive digitally signed DPIIT Certificate of Recognition upon approval.'
    ],
    importantDates: 'Application Window: Continuous & Open Year-Round',
    officialWebsite: 'https://www.startupindia.gov.in',
    applicationUrl: 'https://www.startupindia.gov.in/content/sih/en/startupgov/dpiit-recognition.html',
    hasOnlineApplication: true,
  },
  {
    id: 'naps',
    name: 'National Apprenticeship Promotion Scheme (NAPS)',
    category: 'Skill Development',
    description: 'Promotes industry apprenticeship training for Indian youth, providing direct government-funded stipend support and hands-on skill certification with recognized establishments.',
    benefits: 'Direct government stipend sharing of 25% of prescribed monthly stipend up to ₹1,500/month.',
    status: 'Eligible',
    color: '#06B6D4', // Cyan
    authority: 'Ministry of Skill Development & Entrepreneurship',
    dateLaunched: '19-Aug-2016',
    eligibilityCriteria: [
      'Citizen of India aged 14 years or above (18+ for hazardous industries).',
      'Minimum educational qualifications: Class 5 to Graduate/ITI based on chosen trade.',
      'Must not have previously completed apprenticeship in the same trade.',
      'Must fulfill physical fitness standards prescribed by the designated trade.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Educational Marksheets / ITI Diploma Certificates',
      'Active Bank Account Details (for DBT stipend transfer)',
      'Passport size digital photograph'
    ],
    applicationProcess: [
      '1. Open the official Apprenticeship India Candidate Portal.',
      '2. Complete your Candidate Registration with basic details and trade interests.',
      '3. Complete Aadhaar e-KYC and upload education credentials.',
      '4. Search published apprentice opportunities and apply directly to establishments.'
    ],
    importantDates: 'Apprentice Listings: Updated Daily by Registered Employers',
    officialWebsite: 'https://www.apprenticeshipindia.gov.in',
    applicationUrl: 'https://www.apprenticeshipindia.gov.in/candidate-registration',
    hasOnlineApplication: true,
  },
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    category: 'Finance & Urban Livelihood',
    description: 'Micro-credit facility empowering urban, peri-urban, and rural street vendors with affordable collateral-free working capital loans and cashback rewards for digital transactions.',
    benefits: 'Initial working capital loan of ₹10,000, progressing to ₹20,000 and ₹50,000 with 7% interest subsidy.',
    status: 'Eligible',
    color: '#F97316', // Orange
    authority: 'Ministry of Housing and Urban Affairs (MoHUA)',
    dateLaunched: '01-Jun-2020',
    eligibilityCriteria: [
      'Urban street vendors holding a Certificate of Vending / ID Card issued by Urban Local Bodies (ULBs).',
      'Vendors identified in the municipal survey or holding Letter of Recommendation (LoR).',
      'Vendors from surrounding peri-urban and rural areas vending in geographical limits of ULBs.',
      'Aadhaar-linked mobile number for instant e-KYC.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Linked in DigiLocker)',
      'Vending Certificate / Municipal Identity Card or LoR',
      'Active Bank Account Passbook Details',
      'UPI QR Code for digital cashback linkage'
    ],
    applicationProcess: [
      '1. Open the official PM SVANidhi Portal.',
      '2. Log in using your Aadhaar-linked mobile number and OTP.',
      '3. Verify your Certificate of Vending (CoV) / LoR number.',
      '4. Select your preferred lending bank and submit your loan application online.'
    ],
    importantDates: 'Facility Extended: Active & Open through 2026',
    officialWebsite: 'https://pmsvanidhi.mohua.gov.in',
    applicationUrl: 'https://pmsvanidhi.mohua.gov.in',
    hasOnlineApplication: true,
  },
  {
    id: 'pm-mudra',
    name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    category: 'Finance & Loans',
    description: 'Provides low-interest microfinance loans up to ₹10 Lakh to non-corporate, non-farm small and micro enterprises across manufacturing, trading, and services sectors.',
    benefits: 'Collateral-free loans up to ₹10 Lakh under Shishu (up to ₹50k), Kishor (₹50k to ₹5L), and Tarun (₹5L to ₹10L).',
    status: 'Partially Eligible',
    color: '#F59E0B', // Amber
    authority: 'Department of Financial Services, Ministry of Finance',
    dateLaunched: '08-Apr-2015',
    eligibilityCriteria: [
      'Non-corporate small business owners, micro enterprises, shopkeepers, fruit/vegetable vendors, artisans.',
      'Proprietors or partners in small manufacturing units or service businesses.',
      'Indian citizens with a viable business plan and no past credit defaults.',
      'Age between 18 and 65 years.'
    ],
    requiredDocuments: [
      'KYC Identification (Aadhaar / PAN Card / Voter ID)',
      'Proof of business enterprise address & registration certificates',
      'Detailed business project report / machine purchase quotations',
      'Bank statement for the last 6 months'
    ],
    applicationProcess: [
      '1. Prepare your business project report and requisite KYC documents.',
      '2. Visit any commercial bank, cooperative bank, RRB, or MFI branch in person.',
      '3. Complete the physical Mudra Loan application form matching your stage (Shishu/Kishor/Tarun).',
      '4. The lending institution reviews your business plan and sanctions loan disbursement directly.'
    ],
    importantDates: 'Sanctions: Ongoing year-round at all commercial bank branches',
    officialWebsite: 'https://mudra.org.in',
    applicationUrl: null,
    hasOnlineApplication: false,
    applicationNotice: 'Online application link unavailable. Pradhan Mantri Mudra Yojana (PMMY) loans are sanctioned directly through physical application at commercial banks, Regional Rural Banks (RRBs), Small Finance Banks, and approved Microfinance Institutions (MFIs). Please visit your nearest bank branch with your business proposal.',
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    category: 'Women & Child Welfare',
    description: 'A government-backed savings scheme for parents of girl children under the Beti Bachao Beti Padhao campaign, offering high compound interest and complete triple-tax exemption.',
    benefits: 'High government-guaranteed interest rate of 8.2% per annum with 100% tax exemption under Section 80C and EEE tax-free status on maturity.',
    status: 'Eligible',
    color: '#EC4899', // Pink
    authority: 'Ministry of Finance & Department of Posts',
    dateLaunched: '22-Jan-2015',
    eligibilityCriteria: [
      'Account can be opened by natural or legal guardians in the name of a girl child.',
      'Girl child must be an Indian resident aged below 10 years at the time of account opening.',
      'Only one account allowed per girl child, and maximum two accounts per family (with exception for twins/triplets).',
      'Minimum annual deposit of ₹250 and maximum of ₹1,50,000 per financial year.'
    ],
    requiredDocuments: [
      'Birth Certificate of the girl child (Linked in DigiLocker)',
      'Identity and Address Proof of the Parent / Guardian (Aadhaar / PAN)',
      'Photographs of the child and guardian',
      'Medical certificate in case of twin/triplet daughters'
    ],
    applicationProcess: [
      '1. Obtain the physical Sukanya Samriddhi Account Opening Form (Form-1).',
      '2. Attach copies of the child\'s birth certificate and guardian\'s KYC documents.',
      '3. Submit the form in person at any authorized Post Office or commercial bank branch.',
      '4. Receive the official physical SSY passbook with account number.'
    ],
    importantDates: 'Account Opening: Open at all Post Offices and bank branches',
    officialWebsite: 'https://www.indiapost.gov.in',
    applicationUrl: null,
    hasOnlineApplication: false,
    applicationNotice: 'Online application link unavailable. Fresh Sukanya Samriddhi Yojana (SSY) accounts must be opened in person by the parent or legal guardian at any authorized Post Office or designated commercial bank branch. Online direct submission for fresh account creation is not supported by Department of Posts.',
  },
];

// Compatibility export
export const MOCK_SCHEMES_DB = GOVERNMENT_SCHEMES_CATALOG;
