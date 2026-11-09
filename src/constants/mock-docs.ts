export interface DocumentItem {
  id: string;
  name: string;
  icon: string;
  authority: string;
  status: string;
  lastUpdated: string;
  number: string;
  issueDate: string;
  color: string;
  holderName: string;
}

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    icon: '🆔',
    authority: 'Unique Identification Authority of India (UIDAI)',
    status: 'Verified',
    lastUpdated: '12-May-2026',
    number: '4829 3982 8294',
    issueDate: '24-Apr-2015',
    color: '#FF9933', // Saffron
    holderName: 'Rajesh Kumar',
  },
  {
    id: 'pan',
    name: 'PAN Card',
    icon: '💳',
    authority: 'Income Tax Department',
    status: 'Verified',
    lastUpdated: '04-Feb-2026',
    number: 'ABCDE1234F',
    issueDate: '10-Sep-2018',
    color: '#0B66C3', // Blue
    holderName: 'RAJESH KUMAR',
  },
  {
    id: 'dl',
    name: 'Driving Licence',
    icon: '🚗',
    authority: 'Ministry of Road Transport and Highways (MoRTH)',
    status: 'Verified',
    lastUpdated: '22-Mar-2026',
    number: 'DL-1420190001234',
    issueDate: '15-Mar-2019',
    color: '#138808', // Green
    holderName: 'Rajesh Kumar',
  },
  {
    id: 'passport',
    name: 'Passport',
    icon: '✈️',
    authority: 'Ministry of External Affairs',
    status: 'Verified',
    lastUpdated: '10-Jan-2026',
    number: 'Z9876543',
    issueDate: '20-Nov-2021',
    color: '#0F172A', // Navy/Dark Slate
    holderName: 'RAJESH KUMAR',
  },
  {
    id: 'voter',
    name: 'Voter ID',
    icon: '🗳️',
    authority: 'Election Commission of India',
    status: 'Verified',
    lastUpdated: '30-Jun-2025',
    number: 'EPIC98765432',
    issueDate: '05-May-2019',
    color: '#7C3AED', // Purple
    holderName: 'Rajesh Kumar',
  },
  {
    id: 'birth',
    name: 'Birth Certificate',
    icon: '👶',
    authority: 'Municipal Corporation of Delhi (MCD)',
    status: 'Verified',
    lastUpdated: '15-Aug-2025',
    number: 'MCD-B-2026-987654',
    issueDate: '01-Jun-1996',
    color: '#EC4899', // Pink
    holderName: 'Rajesh Kumar',
  },
  {
    id: 'income',
    name: 'Income Certificate',
    icon: '💰',
    authority: 'Revenue Department, Govt of NCT Delhi',
    status: 'Verified',
    lastUpdated: '01-Dec-2025',
    number: 'INC/2025/1102987',
    issueDate: '14-Nov-2025',
    color: '#EAB308', // Gold
    holderName: 'Rajesh Kumar',
  },
  {
    id: 'degree',
    name: 'Degree Certificate',
    icon: '🎓',
    authority: 'Delhi University (DU)',
    status: 'Verified',
    lastUpdated: '28-Oct-2025',
    number: 'DU/DEG/2018/88921',
    issueDate: '18-Jun-2018',
    color: '#8B5CF6', // Violet
    holderName: 'Rajesh Kumar',
  },
];
