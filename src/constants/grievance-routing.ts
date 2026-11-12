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

export interface VerifiedPortalDestination {
  authorityName: string;
  portalName: string;
  portalUrl: string;
  trackingUrl: string;
  helpline: string;
  expectedTimelineDays: number;
  whyAppropriate: string;
  isDistrictSpecific: boolean;
  jurisdictionLevel: 'District Authority' | 'State Alternative' | 'Central Authority';
}

/**
 * Deterministic district & category-based government portal router.
 * Identifies verified official portals based on State, District, and Complaint Category.
 * Strictly adheres to verified government URLs.
 */
export function resolvePortalDestination(
  state?: string,
  district?: string,
  category?: string,
  city?: string,
  exactLocation?: string
): VerifiedPortalDestination {
  const normState = (state || '').toLowerCase().trim();
  const normDistrict = (district || '').toLowerCase().trim();
  const normCity = (city || '').toLowerCase().trim();
  const normCat = (category || '').toLowerCase().trim();
  const normLoc = `${normDistrict} ${normCity} ${(exactLocation || '').toLowerCase()}`.trim();

  // Central / All-India subjects
  if (
    normState.includes('central') ||
    normCat.includes('central') ||
    normCat.includes('bank') ||
    normCat.includes('telecom') ||
    normCat.includes('passport') ||
    normCat.includes('railway') ||
    normCat.includes('epfo')
  ) {
    return {
      authorityName: 'Government of India – Department of Administrative Reforms & Public Grievances (DARPG)',
      portalName: 'CPGRAMS (Centralised Public Grievance Redress and Monitoring System)',
      portalUrl: 'https://pgportal.gov.in',
      trackingUrl: 'https://pgportal.gov.in/Status',
      helpline: '1800-11-4000',
      expectedTimelineDays: 30,
      whyAppropriate: 'CPGRAMS is the apex single-window grievance redressal portal connecting all 90+ Central Ministries, Departments, Public Sector Banks, Railways, and Telecom utilities.',
      isDistrictSpecific: false,
      jurisdictionLevel: 'Central Authority',
    };
  }

  // Karnataka State & Districts
  if (normState.includes('karnataka')) {
    // Mysuru District
    if (normLoc.includes('mysuru') || normLoc.includes('mysore')) {
      if (normCat.includes('electric') || normCat.includes('power')) {
        return {
          authorityName: 'Chamundeshwari Electricity Supply Corporation (CHESCOM)',
          portalName: 'CHESCOM Online Consumer Grievance Services',
          portalUrl: 'https://chescom.karnataka.gov.in',
          trackingUrl: 'https://chescom.karnataka.gov.in',
          helpline: '1912 / 1800-425-1912',
          expectedTimelineDays: 7,
          whyAppropriate: 'CHESCOM is the designated state power utility responsible for electricity distribution and consumer faults in Mysuru district.',
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
        };
      }
      if (normCat.includes('water')) {
        return {
          authorityName: 'Vani Vilas Water Works (VVWW) / Mysuru City Corporation',
          portalName: 'Mysuru City Corporation Water Supply Division',
          portalUrl: 'https://mysurucitycorporation.co.in',
          trackingUrl: 'https://mysurucitycorporation.co.in',
          helpline: '0821-2441155 / 0821-2418800',
          expectedTimelineDays: 7,
          whyAppropriate: 'Drinking water distribution, pipeline maintenance, and sewer lines in Mysuru are operated by Vani Vilas Water Works under MCC.',
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
        };
      }
      return {
        authorityName: 'Mysuru City Corporation (MCC) & Urban Development Department',
        portalName: 'Mysuru City Corporation Citizen Grievance Portal',
        portalUrl: 'https://mysurucitycorporation.co.in',
        trackingUrl: 'https://mysurucitycorporation.co.in',
        helpline: '0821-2418800 / 0821-2440890',
        expectedTimelineDays: 15,
        whyAppropriate: 'Mysuru City Corporation (MCC) is the statutory urban local body responsible for road maintenance, pothole repairs, solid waste collection, and street lighting in Mysuru.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }

    // Bengaluru Urban / Rural
    if (normLoc.includes('bengaluru') || normLoc.includes('bangalore')) {
      if (normCat.includes('water')) {
        return {
          authorityName: 'Bangalore Water Supply and Sewerage Board (BWSSB)',
          portalName: 'BWSSB Citizen Grievance Portal',
          portalUrl: 'https://bwssb.karnataka.gov.in',
          trackingUrl: 'https://bwssb.karnataka.gov.in',
          helpline: '1916 / WhatsApp 8762228888',
          expectedTimelineDays: 7,
          whyAppropriate: 'BWSSB has exclusive statutory jurisdiction over drinking water supply, pipeline infrastructure, and underground sewerage in the Bengaluru metropolitan area.',
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
        };
      }
      if (normCat.includes('electric') || normCat.includes('power')) {
        return {
          authorityName: 'Bangalore Electricity Supply Company (BESCOM)',
          portalName: 'BESCOM Online Consumer Services',
          portalUrl: 'https://bescom.karnataka.gov.in',
          trackingUrl: 'https://bescom.karnataka.gov.in',
          helpline: '1912 / WhatsApp 9449844640',
          expectedTimelineDays: 7,
          whyAppropriate: 'Power distribution, line disruptions, transformer repairs, and billing disputes in Bengaluru are managed by BESCOM.',
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
        };
      }
      return {
        authorityName: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
        portalName: 'BBMP Sahaaya Citizen Redressal Portal',
        portalUrl: 'https://bbmp.gov.in',
        trackingUrl: 'https://bbmp.gov.in',
        helpline: '1533 / 080-22660000',
        expectedTimelineDays: 15,
        whyAppropriate: 'BBMP is the statutory municipal corporation responsible for city roads, pothole repairs, streetlights, garbage collection, and civil amenities across Bengaluru.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }

    // Other Karnataka Districts -> State-level Janaspandana
    return {
      authorityName: 'Government of Karnataka – Department of Personnel & Administrative Reforms (e-Gov)',
      portalName: 'Janaspandana (Integrated Grievance Redressal System Karnataka)',
      portalUrl: 'https://janaspandana.karnataka.gov.in',
      trackingUrl: 'https://janaspandana.karnataka.gov.in',
      helpline: '1902',
      expectedTimelineDays: 21,
      whyAppropriate: `Janaspandana is Karnataka's apex citizen grievance redressal platform with statutory monitoring by the District Deputy Commissioner under the Sakala Services Act.`,
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative',
    };
  }

  // Tamil Nadu State & Districts
  if (normState.includes('tamil')) {
    // Chennai
    if (normLoc.includes('chennai')) {
      if (normCat.includes('water')) {
        return {
          authorityName: 'Chennai Metropolitan Water Supply and Sewerage Board (CMWSSB)',
          portalName: 'CMWSSB Metro Water Citizen Grievance Portal',
          portalUrl: 'https://chennaimetrowater.tn.gov.in',
          trackingUrl: 'https://chennaimetrowater.tn.gov.in',
          helpline: '044-45674567 / 1916',
          expectedTimelineDays: 7,
          whyAppropriate: 'CMWSSB Metro Water is responsible for potable water supply and sewer maintenance in Chennai.',
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
        };
      }
      if (normCat.includes('electric') || normCat.includes('power')) {
        return {
          authorityName: 'Tamil Nadu Generation and Distribution Corporation (TANGEDCO)',
          portalName: 'TANGEDCO Minnagam Consumer Grievance Portal',
          portalUrl: 'https://www.tangedco.gov.in',
          trackingUrl: 'https://www.tangedco.gov.in',
          helpline: '94987 94987',
          expectedTimelineDays: 7,
          whyAppropriate: 'TANGEDCO Minnagam is the statewide power distribution utility covering all districts of Tamil Nadu.',
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
        };
      }
      return {
        authorityName: 'Greater Chennai Corporation (GCC)',
        portalName: 'Greater Chennai Corporation Citizen Grievance Portal (Namma Chennai)',
        portalUrl: 'https://chennaicorporation.gov.in',
        trackingUrl: 'https://chennaicorporation.gov.in',
        helpline: '1913',
        expectedTimelineDays: 14,
        whyAppropriate: 'Greater Chennai Corporation (GCC) is the civic body administering all 15 zones, roads, streetlights, and sanitation across Chennai.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }

    // Coimbatore
    if (normLoc.includes('coimbatore')) {
      if (normCat.includes('electric') || normCat.includes('power')) {
        return {
          authorityName: 'TANGEDCO – Coimbatore Region',
          portalName: 'TANGEDCO Minnagam Consumer Portal',
          portalUrl: 'https://www.tangedco.gov.in',
          trackingUrl: 'https://www.tangedco.gov.in',
          helpline: '94987 94987',
          expectedTimelineDays: 7,
          whyAppropriate: 'TANGEDCO is the sole electric utility for Coimbatore district.',
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
        };
      }
      return {
        authorityName: 'Coimbatore City Municipal Corporation (CCMC)',
        portalName: 'Coimbatore City Municipal Corporation Grievance Portal',
        portalUrl: 'https://ccmc.gov.in',
        trackingUrl: 'https://ccmc.gov.in',
        helpline: '0422-2302323 / 1800-425-4555',
        expectedTimelineDays: 15,
        whyAppropriate: 'CCMC has statutory jurisdiction over roads, solid waste, and municipal infrastructure across Coimbatore municipal zones.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }

    // Madurai
    if (normLoc.includes('madurai')) {
      return {
        authorityName: 'Madurai Corporation (MMC)',
        portalName: 'Madurai Corporation Citizen Grievance Portal',
        portalUrl: 'https://maduraicorporation.co.in',
        trackingUrl: 'https://maduraicorporation.co.in',
        helpline: '0452-2566601 / 1800-425-4567',
        expectedTimelineDays: 15,
        whyAppropriate: 'Madurai Corporation administers public roads, waste, water, and sanitation across Madurai city zones.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }

    // Other TN Districts -> State-level Mudhalvarin Mugavari
    if (normCat.includes('electric') || normCat.includes('power')) {
      return {
        authorityName: 'Tamil Nadu Generation and Distribution Corporation (TANGEDCO)',
        portalName: 'TANGEDCO Minnagam Consumer Grievance Portal',
        portalUrl: 'https://www.tangedco.gov.in',
        trackingUrl: 'https://www.tangedco.gov.in',
        helpline: '94987 94987',
        expectedTimelineDays: 7,
        whyAppropriate: 'TANGEDCO Minnagam manages statewide electricity distribution in Tamil Nadu.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }
    return {
      authorityName: 'Government of Tamil Nadu – Chief Minister\'s Special Cell',
      portalName: 'Mudhalvarin Mugavari (Chief Minister Helpline Portal)',
      portalUrl: 'https://cmhelpline.tnega.org',
      trackingUrl: 'https://cmhelpline.tnega.org',
      helpline: '1100',
      expectedTimelineDays: 30,
      whyAppropriate: `Mudhalvarin Mugavari is Tamil Nadu's apex grievance redressal portal connecting all departments and District Collectors.`,
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative',
    };
  }

  // Maharashtra
  if (normState.includes('maharashtra')) {
    if (normLoc.includes('mumbai')) {
      return {
        authorityName: 'Brihanmumbai Municipal Corporation (BMC)',
        portalName: 'BMC Citizen Portal',
        portalUrl: 'https://portal.mcgm.gov.in',
        trackingUrl: 'https://portal.mcgm.gov.in',
        helpline: '1916',
        expectedTimelineDays: 15,
        whyAppropriate: 'BMC has statutory jurisdiction over roads, solid waste, and municipal amenities in Mumbai City and Suburban districts.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }
    if (normLoc.includes('pune')) {
      return {
        authorityName: 'Pune Municipal Corporation (PMC)',
        portalName: 'PMC Care Grievance Portal',
        portalUrl: 'https://pmc.gov.in',
        trackingUrl: 'https://pmc.gov.in',
        helpline: '1800-1030-222',
        expectedTimelineDays: 15,
        whyAppropriate: 'Pune Municipal Corporation is the urban local body administering Pune municipal wards.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }
    return {
      authorityName: 'Government of Maharashtra – General Administration Department',
      portalName: 'Aaple Sarkar Public Grievance Redressal Portal',
      portalUrl: 'https://grievances.maharashtra.gov.in',
      trackingUrl: 'https://grievances.maharashtra.gov.in',
      helpline: '1800-120-8040',
      expectedTimelineDays: 21,
      whyAppropriate: `Aaple Sarkar is the unified public grievance portal of Maharashtra connecting all departments and District Collectors.`,
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative',
    };
  }

  // Delhi (NCT)
  if (normState.includes('delhi')) {
    if (normCat.includes('water')) {
      return {
        authorityName: 'Delhi Jal Board (DJB)',
        portalName: 'Delhi Jal Board Grievance Portal',
        portalUrl: 'https://delhijalboard.nic.in',
        trackingUrl: 'https://delhijalboard.nic.in',
        helpline: '1916',
        expectedTimelineDays: 7,
        whyAppropriate: 'Delhi Jal Board is responsible for potable water supply and sewer maintenance across Delhi.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }
    if (normCat.includes('road') || normCat.includes('pothole') || normCat.includes('waste') || normCat.includes('garbage') || normCat.includes('sanitation') || normCat.includes('civic')) {
      return {
        authorityName: 'Municipal Corporation of Delhi (MCD)',
        portalName: 'MCD 311 Citizen App / Portal',
        portalUrl: 'https://mcdonline.nic.in',
        trackingUrl: 'https://mcdonline.nic.in',
        helpline: '155305',
        expectedTimelineDays: 14,
        whyAppropriate: 'MCD is responsible for municipal roads, sanitation, and waste collection across Delhi zones.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }
    return {
      authorityName: 'Public Grievance Commission (PGC) – Government of NCT of Delhi',
      portalName: 'Delhi Government Public Grievance Monitoring System (PGMS)',
      portalUrl: 'https://pgms.delhi.gov.in',
      trackingUrl: 'https://pgms.delhi.gov.in',
      helpline: '1031',
      expectedTimelineDays: 30,
      whyAppropriate: 'PGMS is Delhi Government\'s unified platform connecting all state departments and district magistrates.',
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative',
    };
  }

  // Uttar Pradesh
  if (normState.includes('uttar pradesh') || normState.includes('up')) {
    return {
      authorityName: 'Government of Uttar Pradesh – Chief Minister Office & IGRS',
      portalName: 'Jansunwai (Integrated Grievance Redressal System UP)',
      portalUrl: 'https://jansunwai.up.nic.in',
      trackingUrl: 'https://jansunwai.up.nic.in',
      helpline: '1076',
      expectedTimelineDays: 30,
      whyAppropriate: 'Jansunwai is the unified grievance redressal portal of Uttar Pradesh connecting all state departments and District Magistrates.',
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative',
    };
  }

  // Telangana
  if (normState.includes('telangana')) {
    if (normLoc.includes('hyderabad') && (normCat.includes('road') || normCat.includes('waste') || normCat.includes('garbage') || normCat.includes('sanitation') || normCat.includes('civic'))) {
      return {
        authorityName: 'Greater Hyderabad Municipal Corporation (GHMC)',
        portalName: 'GHMC Citizen Grievance Portal',
        portalUrl: 'https://ghmc.gov.in',
        trackingUrl: 'https://ghmc.gov.in',
        helpline: '040-21111111',
        expectedTimelineDays: 15,
        whyAppropriate: 'GHMC has statutory jurisdiction over roads, sanitation, solid waste, and municipal services across Hyderabad.',
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
      };
    }
    return {
      authorityName: 'Government of Telangana – Planning Department & CMO',
      portalName: 'Prajavani Public Grievance Redressal Portal',
      portalUrl: 'https://prajavani.telangana.gov.in',
      trackingUrl: 'https://prajavani.telangana.gov.in',
      helpline: '1100',
      expectedTimelineDays: 30,
      whyAppropriate: 'Prajavani is the single-window grievance platform for Telangana state connecting citizens to district administration.',
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative',
    };
  }

  // Andhra Pradesh
  if (normState.includes('andhra')) {
    return {
      authorityName: 'Government of Andhra Pradesh – Public Grievance Redressal System',
      portalName: 'Spandana Public Grievance Portal',
      portalUrl: 'https://spandana.ap.gov.in',
      trackingUrl: 'https://spandana.ap.gov.in',
      helpline: '1902',
      expectedTimelineDays: 30,
      whyAppropriate: 'Spandana is the apex public grievance portal for Andhra Pradesh covering all departments and districts.',
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative',
    };
  }

  // Kerala
  if (normState.includes('kerala')) {
    return {
      authorityName: 'Government of Kerala – Chief Minister\'s Office',
      portalName: 'CMO Public Grievance Redressal Cell',
      portalUrl: 'https://cmo.kerala.gov.in',
      trackingUrl: 'https://cmo.kerala.gov.in',
      helpline: '1076',
      expectedTimelineDays: 30,
      whyAppropriate: 'Chief Minister\'s Public Grievance Redressal Cell is Kerala\'s apex platform for citizen complaints.',
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative',
    };
  }

  // All-India Fallback
  return {
    authorityName: 'Government of India – Department of Administrative Reforms & Public Grievances (DARPG)',
    portalName: 'CPGRAMS National Portal & State Grievance Directorate',
    portalUrl: 'https://pgportal.gov.in',
    trackingUrl: 'https://pgportal.gov.in/Status',
    helpline: '1800-11-4000',
    expectedTimelineDays: 30,
    whyAppropriate: `Verified national CPGRAMS portal interoperating with state nodal grievance officers across India.`,
    isDistrictSpecific: false,
    jurisdictionLevel: 'State Alternative',
  };
}

