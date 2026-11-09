export interface GrievanceCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
}

export const GRIEVANCE_CATEGORIES: GrievanceCategory[] = [
  {
    id: 'roads',
    title: 'Roads & Potholes',
    icon: '🛣️',
    description: 'Potholes, broken roads, or pavement issues.',
    color: '#FF9933', // Saffron
  },
  {
    id: 'garbage',
    title: 'Garbage & Sanitation',
    icon: '🗑️',
    description: 'Dumping spots, overflowing public bins, or sanitation.',
    color: '#138808', // Green
  },
  {
    id: 'water',
    title: 'Water Supply',
    icon: '🚰',
    description: 'Water outages, pipeline leakages, or contamination.',
    color: '#4A90E2', // Blue
  },
  {
    id: 'electricity',
    title: 'Electricity',
    icon: '⚡',
    description: 'Power cuts, dangerous low-hanging wires, or transformers.',
    color: '#EAB308', // Yellow
  },
  {
    id: 'streetlights',
    title: 'Street Lights',
    icon: '💡',
    description: 'Broken street lamps, dark zones, or blinking lights.',
    color: '#F59E0B', // Amber
  },
  {
    id: 'sewage',
    title: 'Sewage & Drainage',
    icon: '🌊',
    description: 'Overflowing sewers, open manholes, or waterlogging.',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'transport',
    title: 'Public Transport',
    icon: '🚌',
    description: 'Bus delays, terminal sanitation, or transit assistance.',
    color: '#06B6D4', // Cyan
  },
  {
    id: 'environment',
    title: 'Environment',
    icon: '🌳',
    description: 'Tree felling violations, noise levels, or air quality.',
    color: '#10B981', // Emerald
  },
  {
    id: 'safety',
    title: 'Public Safety',
    icon: '🛡️',
    description: 'Dark alleys, lack of security, or fire safety hazards.',
    color: '#EF4444', // Red
  },
  {
    id: 'other',
    title: 'Other',
    icon: '📁',
    description: 'Miscellaneous civic complaints or local issues.',
    color: '#64748B', // Slate
  },
];
