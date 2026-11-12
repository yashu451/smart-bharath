/**
 * Official Government Gazetted Public Holidays Directory
 * 
 * Verified Official Sources:
 * 1. Central Government: Ministry of Personnel, Public Grievances and Pensions
 *    Department of Personnel and Training (DoPT), Government of India
 *    Office Memorandum on Gazetted Holidays for Central Government Administrative Offices.
 * 2. Karnataka: Government of Karnataka, Department of Personnel and Administrative Reforms (DPAR)
 *    Official Gazetted Holidays Notification.
 * 3. Tamil Nadu: Government of Tamil Nadu, Public (Miscellaneous) Department
 *    Notification under Section 25 of the Negotiable Instruments Act, 1881.
 * 4. Maharashtra: General Administration Department (GAD), Government of Maharashtra
 *    Annual Public Holidays Gazette.
 * 5. Delhi (NCT): General Administration Department, Government of National Capital Territory of Delhi
 *    Gazetted Holidays for Delhi Government & Public Utility Offices.
 * 6. Uttar Pradesh: General Administration Department, Government of Uttar Pradesh
 *    Public Holidays Notification under N.I. Act.
 */

const OFFICIAL_HOLIDAYS = [
  // ==========================================
  // CENTRAL GOVERNMENT GAZETTED HOLIDAYS (2026)
  // Source: DoPT, Government of India
  // ==========================================
  {
    date: '2026-01-26',
    name: 'Republic Day',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'National Public Holiday celebrating the Constitution of India',
  },
  {
    date: '2026-03-04',
    name: 'Holi',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Festival of Colours - Gazetted Central Public Holiday',
  },
  {
    date: '2026-03-21',
    name: 'Id-ul-Fitr (Ramzan Id)',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Islamic festival marking the end of Ramadan',
  },
  {
    date: '2026-03-27',
    name: 'Ram Navami',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Celebration of the birth of Lord Rama',
  },
  {
    date: '2026-03-31',
    name: 'Mahavir Jayanti',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Birth anniversary of Bhagwan Mahavira',
  },
  {
    date: '2026-04-03',
    name: 'Good Friday',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Christian commemoration of the Passion of Jesus Christ',
  },
  {
    date: '2026-04-14',
    name: 'Dr. B.R. Ambedkar Jayanti',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Birth anniversary of the chief architect of the Constitution',
  },
  {
    date: '2026-05-01',
    name: 'Buddha Purnima / May Day',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Birth anniversary of Gautama Buddha and International Workers Day',
  },
  {
    date: '2026-05-27',
    name: 'Id-ul-Zuha (Bakrid)',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Islamic festival of sacrifice',
  },
  {
    date: '2026-06-26',
    name: 'Muharram',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'First month of Islamic calendar',
  },
  {
    date: '2026-08-15',
    name: 'Independence Day',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'National Public Holiday celebrating India\'s Independence',
  },
  {
    date: '2026-08-26',
    name: 'Milad-un-Nabi (Id-e-Milad)',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Birthday of Prophet Muhammad',
  },
  {
    date: '2026-10-02',
    name: 'Mahatma Gandhi Jayanti',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'National Public Holiday honoring the Father of the Nation',
  },
  {
    date: '2026-10-20',
    name: 'Dussehra (Vijaya Dashami)',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Celebration of victory of good over evil',
  },
  {
    date: '2026-11-08',
    name: 'Diwali (Deepavali)',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Festival of Lights - National Gazetted Holiday',
  },
  {
    date: '2026-11-24',
    name: 'Guru Nanak Jayanti',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Birth anniversary of Guru Nanak Dev Ji',
  },
  {
    date: '2026-12-25',
    name: 'Christmas Day',
    type: 'national',
    state: 'ALL',
    year: 2026,
    source: 'DoPT Central Government Gazette (2026)',
    description: 'Christian celebration of the Nativity of Jesus',
  },

  // ==========================================
  // KARNATAKA STATE GAZETTED HOLIDAYS (2026)
  // Source: Government of Karnataka, DPAR
  // ==========================================
  {
    date: '2026-01-14',
    name: 'Makara Sankranti',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'Harvest festival celebrated across Karnataka',
  },
  {
    date: '2026-03-19',
    name: 'Ugadi (Kannada New Year)',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'New Year day for the people of the Deccan region',
  },
  {
    date: '2026-04-21',
    name: 'Basava Jayanti',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'Birth anniversary of philosopher-statesman Lord Basaveshwara',
  },
  {
    date: '2026-09-14',
    name: 'Varasiddhi Vinayaka Vrata (Ganesh Chaturthi)',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'Statewide festival celebrating Lord Ganesha',
  },
  {
    date: '2026-10-19',
    name: 'Mahanavami / Ayudha Pooja',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'Worship of instruments and tools',
  },
  {
    date: '2026-10-26',
    name: 'Maharshi Valmiki Jayanti',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'Honoring author of the Ramayana',
  },
  {
    date: '2026-11-01',
    name: 'Kannada Rajyotsava',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'Karnataka State Formation Day - All offices closed',
  },
  {
    date: '2026-11-10',
    name: 'Balipadyami / Deepavali Extension',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'Fourth day of Diwali festival',
  },
  {
    date: '2026-11-28',
    name: 'Kanakadasa Jayanti',
    type: 'state',
    state: 'KA',
    year: 2026,
    source: 'Govt of Karnataka DPAR Notification',
    description: 'Celebration of saint-poet Kanakadasa',
  },

  // ==========================================
  // TAMIL NADU STATE GAZETTED HOLIDAYS (2026)
  // Source: Government of Tamil Nadu, Public Dept
  // ==========================================
  {
    date: '2026-01-14',
    name: 'Pongal',
    type: 'state',
    state: 'TN',
    year: 2026,
    source: 'Govt of Tamil Nadu Gazette Notification',
    description: 'Harvest festival celebrated across Tamil Nadu',
  },
  {
    date: '2026-01-15',
    name: 'Thiruvalluvar Day',
    type: 'state',
    state: 'TN',
    year: 2026,
    source: 'Govt of Tamil Nadu Gazette Notification',
    description: 'Honoring Tamil poet and philosopher Thiruvalluvar',
  },
  {
    date: '2026-01-16',
    name: 'Uzhavar Thirunal (Farmers Day)',
    type: 'state',
    state: 'TN',
    year: 2026,
    source: 'Govt of Tamil Nadu Gazette Notification',
    description: 'Day honoring farmers and agriculture in Tamil Nadu',
  },
  {
    date: '2026-02-01',
    name: 'Thai Poosam',
    type: 'state',
    state: 'TN',
    year: 2026,
    source: 'Govt of Tamil Nadu Gazette Notification',
    description: 'Festival celebrated by Tamil Hindu community',
  },
  {
    date: '2026-04-14',
    name: 'Tamil New Year (Puthandu)',
    type: 'state',
    state: 'TN',
    year: 2026,
    source: 'Govt of Tamil Nadu Gazette Notification',
    description: 'First day of the traditional Tamil calendar',
  },
  {
    date: '2026-09-14',
    name: 'Vinayakar Chathurthi',
    type: 'state',
    state: 'TN',
    year: 2026,
    source: 'Govt of Tamil Nadu Gazette Notification',
    description: 'State holiday for Vinayakar Chathurthi',
  },
  {
    date: '2026-10-19',
    name: 'Ayutha Pooja',
    type: 'state',
    state: 'TN',
    year: 2026,
    source: 'Govt of Tamil Nadu Gazette Notification',
    description: 'Worship of weapons, books and tools',
  },

  // ==========================================
  // MAHARASHTRA STATE GAZETTED HOLIDAYS (2026)
  // Source: Government of Maharashtra, GAD
  // ==========================================
  {
    date: '2026-02-19',
    name: 'Chhatrapati Shivaji Maharaj Jayanti',
    type: 'state',
    state: 'MH',
    year: 2026,
    source: 'Govt of Maharashtra GAD Notification',
    description: 'Birth anniversary of Maratha Empire founder',
  },
  {
    date: '2026-03-19',
    name: 'Gudi Padwa (Marathi New Year)',
    type: 'state',
    state: 'MH',
    year: 2026,
    source: 'Govt of Maharashtra GAD Notification',
    description: 'Traditional new year for Marathi Hindus',
  },
  {
    date: '2026-05-01',
    name: 'Maharashtra Din (State Formation Day)',
    type: 'state',
    state: 'MH',
    year: 2026,
    source: 'Govt of Maharashtra GAD Notification',
    description: 'Commemorating the formation of the state of Maharashtra',
  },
  {
    date: '2026-09-14',
    name: 'Ganesh Chaturthi',
    type: 'state',
    state: 'MH',
    year: 2026,
    source: 'Govt of Maharashtra GAD Notification',
    description: 'Premier festival of Maharashtra - 1st day of Ganeshotsav',
  },
  {
    date: '2026-09-24',
    name: 'Anant Chaturdashi (Ganesh Visarjan)',
    type: 'state',
    state: 'MH',
    year: 2026,
    districts: ['Mumbai', 'Pune', 'Thane'],
    source: 'Govt of Maharashtra GAD Notification',
    description: 'Ganesh immersion day - local office closure in Mumbai & Pune',
  },
  {
    date: '2026-11-10',
    name: 'Diwali (Bali Pratipada)',
    type: 'state',
    state: 'MH',
    year: 2026,
    source: 'Govt of Maharashtra GAD Notification',
    description: 'Day celebrated in honor of King Bali',
  },

  // ==========================================
  // DELHI (NCT) GAZETTED HOLIDAYS (2026)
  // Source: Govt of NCT of Delhi, GAD
  // ==========================================
  {
    date: '2026-11-15',
    name: 'Chhath Puja',
    type: 'state',
    state: 'DL',
    year: 2026,
    source: 'Govt of NCT of Delhi Notification',
    description: 'Ancient Hindu Vedic festival dedicated to Surya Dev',
  },

  // ==========================================
  // UTTAR PRADESH GAZETTED HOLIDAYS (2026)
  // Source: Govt of Uttar Pradesh, GAD
  // ==========================================
  {
    date: '2026-01-14',
    name: 'Makar Sankranti',
    type: 'state',
    state: 'UP',
    year: 2026,
    source: 'Govt of Uttar Pradesh GAD Notification',
    description: 'Solar transition festival celebrated statewide',
  },
  {
    date: '2026-02-15',
    name: 'Maha Shivratri',
    type: 'state',
    state: 'UP',
    year: 2026,
    source: 'Govt of Uttar Pradesh GAD Notification',
    description: 'Great Night of Shiva celebrated across UP pilgrimage centers',
  },
  {
    date: '2026-09-04',
    name: 'Janmashtami',
    type: 'state',
    state: 'UP',
    year: 2026,
    source: 'Govt of Uttar Pradesh GAD Notification',
    description: 'Birth anniversary of Lord Krishna - major Mathura/Vrindavan holiday',
  },
  {
    date: '2026-11-09',
    name: 'Govardhan Puja',
    type: 'state',
    state: 'UP',
    year: 2026,
    source: 'Govt of Uttar Pradesh GAD Notification',
    description: 'Puja celebrating the lifting of Govardhan hill',
  },
  {
    date: '2026-11-10',
    name: 'Bhai Dooj',
    type: 'state',
    state: 'UP',
    year: 2026,
    source: 'Govt of Uttar Pradesh GAD Notification',
    description: 'Festival of brother-sister bond',
  },
  {
    date: '2026-11-15',
    name: 'Chhath Puja',
    type: 'state',
    state: 'UP',
    year: 2026,
    source: 'Govt of Uttar Pradesh GAD Notification',
    description: 'Surya Shashthi festival public holiday',
  },
];

/**
 * Checks if a given date string is the 2nd or 4th Saturday of the month.
 * Government administrative offices, Passport Seva Kendras and civic counters
 * are officially closed on 2nd and 4th Saturdays across India.
 */
function isSecondOrFourthSaturday(dateStr) {
  if (!dateStr) return false;
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
    
    // Day of week: 0 = Sun, 6 = Sat
    if (d.getUTCDay() !== 6) return false;

    // 2nd Saturday occurs strictly between day 8 and 14
    // 4th Saturday occurs strictly between day 22 and 28
    return (day >= 8 && day <= 14) || (day >= 22 && day <= 28);
  } catch {
    return false;
  }
}

/**
 * Checks if a date is a Sunday (Weekly Off)
 */
function isSunday(dateStr) {
  if (!dateStr) return false;
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
    return d.getUTCDay() === 0;
  } catch {
    return false;
  }
}

/**
 * Comprehensive verification of whether an office appointment date is available
 * under official government working day schedules, gazetted public holidays,
 * state gazette notices, and weekend rules.
 */
function checkAppointmentDateAvailability(dateStr, stateCode = 'ALL', districtName = '') {
  if (!dateStr) {
    return { available: false, reason: 'Date string is required.' };
  }

  // 1. Weekly Sunday Closure
  if (isSunday(dateStr)) {
    return {
      available: false,
      reason: 'Sunday Weekly Off: Public government offices are closed on Sundays.',
      isSunday: true,
      dayType: 'Sunday Weekly Off',
    };
  }

  // 2. 2nd & 4th Saturday Closure
  if (isSecondOrFourthSaturday(dateStr)) {
    const day = parseInt(dateStr.split('-')[2], 10);
    const satLabel = day <= 14 ? '2nd Saturday' : '4th Saturday';
    return {
      available: false,
      reason: `${satLabel} Closure: Central and State Government administrative offices are closed on 2nd and 4th Saturdays.`,
      isSecondFourthSaturday: true,
      dayType: `${satLabel} Closed`,
    };
  }

  // 3. National Gazetted Public Holidays
  const nationalHoliday = OFFICIAL_HOLIDAYS.find(
    (h) => h.date === dateStr && (h.state === 'ALL' || h.type === 'national')
  );
  if (nationalHoliday) {
    return {
      available: false,
      reason: `Gazetted Public Holiday (${nationalHoliday.name}): Official government offices closed under DoPT Central Government Gazette.`,
      holiday: nationalHoliday,
      holidayName: nationalHoliday.name,
      source: nationalHoliday.source,
    };
  }

  // 4. State-specific Gazetted Holidays
  if (stateCode && stateCode !== 'ALL') {
    const stateHoliday = OFFICIAL_HOLIDAYS.find((h) => {
      if (h.date !== dateStr) return false;
      if (h.state !== stateCode) return false;
      // If holiday has district restrictions, check match
      if (h.districts && h.districts.length > 0 && districtName) {
        return h.districts.some((d) => d.toLowerCase() === districtName.toLowerCase());
      }
      return true;
    });

    if (stateHoliday) {
      return {
        available: false,
        reason: `State Gazetted Holiday (${stateHoliday.name}): Government offices in this state/district are closed per ${stateHoliday.source}.`,
        holiday: stateHoliday,
        holidayName: stateHoliday.name,
        source: stateHoliday.source,
      };
    }
  }

  return {
    available: true,
    dayType: 'Official Working Day',
    operatingHours: '09:00 AM - 05:00 PM (Public booking slots: 09:00 AM - 04:00 PM IST)',
  };
}

/**
 * Checks whether an appointment time slot is within permissible public working hours
 */
function checkAppointmentTimeAvailability(timeStr) {
  if (!timeStr) return { available: false, reason: 'Time slot is required.' };
  
  const VALID_SLOTS = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
  ];

  if (!VALID_SLOTS.includes(timeStr)) {
    return {
      available: false,
      reason: `Invalid office slot: "${timeStr}". Official public appointment hours are 09:00 AM to 04:00 PM IST (excluding 01:00 PM - 02:00 PM lunch recess).`,
    };
  }

  return { available: true };
}

module.exports = {
  OFFICIAL_HOLIDAYS,
  isSecondOrFourthSaturday,
  isSunday,
  checkAppointmentDateAvailability,
  checkAppointmentTimeAvailability,
};

