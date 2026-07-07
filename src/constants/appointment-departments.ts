export interface DepartmentItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const DEPARTMENTS_DB: DepartmentItem[] = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Services',
    icon: '🪪',
    description: 'Enrolment, demographics/biometrics correction, and profile linkage.',
  },
  {
    id: 'passport',
    name: 'Passport Office',
    icon: '🛂',
    description: 'Fresh passport applications, renewals, and police verification reports.',
  },
  {
    id: 'rto',
    name: 'Transport Department (RTO)',
    icon: '🚗',
    description: 'Driving licence tests, duplicate copies, and vehicle registration certificates.',
  },
  {
    id: 'revenue',
    name: 'Revenue Department',
    icon: '📄',
    description: 'Land records, income/caste certificates verification, and property registries.',
  },
  {
    id: 'municipal',
    name: 'Municipal Corporation',
    icon: '🏢',
    description: 'Birth and death certificates registry, property tax, and trade licences.',
  },
  {
    id: 'electricity',
    name: 'Electricity Board',
    icon: '⚡',
    description: 'New meter connection requests, billing disputes, and line load modifications.',
  },
  {
    id: 'water',
    name: 'Water Supply Department',
    icon: '💧',
    description: 'Water connection requests, sewage pipeline approvals, and leakage reports.',
  },
  {
    id: 'police',
    name: 'Police Department',
    icon: '👮',
    description: 'Character certificate check, police clearance reports, and public clearances.',
  },
  {
    id: 'social-welfare',
    name: 'Social Welfare Office',
    icon: '🤝',
    description: 'State pensions schemes setup, welfare allowances, and disability documentation.',
  },
  {
    id: 'agriculture',
    name: 'Agriculture Department',
    icon: '🌾',
    description: 'Seeds and fertilizers subsidies, soil health cards, and equipment allotments.',
  },
];
