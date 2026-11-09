export interface StateOption {
  label: string;
  value: string;
  popularDistricts: string[];
}

export const INDIAN_STATES: StateOption[] = [
  {
    label: 'Karnataka',
    value: 'Karnataka',
    popularDistricts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi'],
  },
  {
    label: 'Tamil Nadu',
    value: 'Tamil Nadu',
    popularDistricts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Kanchipuram'],
  },
  {
    label: 'Delhi (NCT)',
    value: 'Delhi',
    popularDistricts: ['Central Delhi', 'New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'],
  },
  {
    label: 'Maharashtra',
    value: 'Maharashtra',
    popularDistricts: ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  },
  {
    label: 'Uttar Pradesh',
    value: 'Uttar Pradesh',
    popularDistricts: ['Lucknow', 'Kanpur', 'Varanasi', 'Noida / GB Nagar', 'Ghaziabad', 'Agra', 'Prayagraj'],
  },
  {
    label: 'Telangana',
    value: 'Telangana',
    popularDistricts: ['Hyderabad', 'Ranga Reddy', 'Warangal', 'Medchal-Malkajgiri', 'Karimnagar'],
  },
  {
    label: 'Kerala',
    value: 'Kerala',
    popularDistricts: ['Thiruvananthapuram', 'Ernakulam / Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  },
  {
    label: 'Andhra Pradesh',
    value: 'Andhra Pradesh',
    popularDistricts: ['Visakhapatnam', 'Vijayawada / Krishna', 'Guntur', 'Tirupati', 'Kurnool'],
  },
  {
    label: 'Central / All India Subject',
    value: 'Central / All India',
    popularDistricts: ['Banking & Financial Services', 'Railways & IRCTC', 'Passport & Consular', 'Telecom & Postal', 'EPFO & Labour'],
  },
];

export const COMPLAINT_CATEGORIES = [
  { id: 'roads', label: 'Roads, Potholes & Streetlights', icon: '🛣️' },
  { id: 'water', label: 'Water Supply & Sewage Lines', icon: '💧' },
  { id: 'sanitation', label: 'Solid Waste, Garbage & Hygiene', icon: '🗑️' },
  { id: 'electricity', label: 'Electricity, Voltage & Metering', icon: '⚡' },
  { id: 'central', label: 'Central Govt, Banking & Passports', icon: '🏛️' },
  { id: 'revenue', label: 'Revenue, Land & Property Records', icon: '📑' },
  { id: 'transport', label: 'Public Transport & Traffic Issues', icon: '🚌' },
  { id: 'health', label: 'Public Health, Clinics & Pollution', icon: '🏥' },
  { id: 'other', label: 'Other Civic & Administrative Issues', icon: '📢' },
];

