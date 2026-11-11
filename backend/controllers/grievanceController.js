const mongoose = require('mongoose');
const Grievance = require('../models/Grievance');
const Activity = require('../models/Activity');
const { memoryGrievances, memoryActivities, saveToDisk } = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Intelligent District-Based Portal Guidance Engine
 * Uses State, District, and Complaint Category to identify verified official government portals.
 * Never invents URLs. Clearly indicates when district-specific vs state-level alternative is provided.
 */
const evaluateGuidance = ({ state, district, city, category, description, exactLocation }) => {
  const normState = (state || '').toLowerCase().trim();
  const normDistrict = (district || '').toLowerCase().trim();
  const normCity = (city || '').toLowerCase().trim();
  const normCat = (category || '').toLowerCase().trim();
  const normDesc = (description || '').toLowerCase().trim();
  const normLoc = `${normDistrict} ${normCity} ${(exactLocation || '').toLowerCase()}`.trim();

  // Helper for Central Subject detection
  const isCentralSubject =
    normState.includes('central') ||
    normCat.includes('central') ||
    normCat.includes('bank') ||
    normCat.includes('telecom') ||
    normCat.includes('passport') ||
    normCat.includes('railway') ||
    normCat.includes('epfo') ||
    normCat.includes('income tax') ||
    normDesc.includes('passport') ||
    normDesc.includes('bank') ||
    normDesc.includes('pension') ||
    normDesc.includes('train') ||
    normDesc.includes('railway') ||
    normDesc.includes('post office') ||
    normDesc.includes('epfo');

  if (isCentralSubject) {
    return {
      authorityName: 'Government of India – Department of Administrative Reforms & Public Grievances (DARPG)',
      portalName: 'CPGRAMS (Centralised Public Grievance Redress and Monitoring System)',
      portalUrl: 'https://pgportal.gov.in',
      trackingUrl: 'https://pgportal.gov.in/Status',
      helpline: '1800-11-4000 (Toll-Free National Grievance Call Centre)',
      expectedTimelineDays: 30,
      officialTimelineNotice: 'Resolution is mandated within a maximum of 30 days under Government of India Citizen Charter guidelines.',
      whyAppropriate: 'CPGRAMS is the apex single-window grievance redressal portal connecting all 90+ Central Ministries, Departments, Public Sector Banks, Railways, and Telecom utilities under DARPG.',
      filingInstructions: [
        '1. Open pgportal.gov.in and click "Grievance -> Lodge Public Grievance".',
        '2. Log in using your mobile number and OTP or create a citizen account.',
        '3. Select the relevant Central Ministry (e.g., Financial Services for Banks, External Affairs for Passports, Railways).',
        '4. Submit your grievance with relevant details and note down the official Registration Number (e.g., DARPG/E/2026/XXXXX).',
        '5. Return to Smart Bharat to save your reference number for automatic waiting period tracking.'
      ],
      requiredDocuments: [
        'Applicant Contact Details (Mobile & Email)',
        'Copy of prior communication or transaction reference (if applicable)',
        'Photographic evidence or documents in PDF format (under 5MB)'
      ],
      isDistrictSpecific: false,
      jurisdictionLevel: 'Central Authority'
    };
  }

  // =========================================================================
  // 1. KARNATAKA STATE & DISTRICTS
  // =========================================================================
  if (normState.includes('karnataka')) {
    // 1A. MYSURU DISTRICT
    if (normLoc.includes('mysuru') || normLoc.includes('mysore')) {
      // Mysuru Roads / Waste / Sanitation / Civic
      if (
        normCat.includes('road') ||
        normCat.includes('pothole') ||
        normCat.includes('waste') ||
        normCat.includes('garbage') ||
        normCat.includes('sanitation') ||
        normCat.includes('streetlight') ||
        normCat.includes('civic')
      ) {
        return {
          authorityName: 'Mysuru City Corporation (MCC) & Urban Development Department',
          portalName: 'Mysuru City Corporation Citizen Grievance Portal',
          portalUrl: 'https://mysurucitycorporation.co.in',
          trackingUrl: 'https://mysurucitycorporation.co.in',
          helpline: '0821-2418800 / 0821-2440890 (MCC 24x7 Control Room)',
          expectedTimelineDays: 15,
          officialTimelineNotice: 'Civic amenities and road maintenance in Mysuru are governed under the Karnataka Sakala Services Act with a 15-day service guarantee.',
          whyAppropriate: 'Mysuru City Corporation (MCC) is the statutory urban local body responsible for road resurfacing, pothole repairs, solid waste collection, street lighting, and conservancy across Mysuru city zones.',
          filingInstructions: [
            '1. Visit mysurucitycorporation.co.in.',
            '2. Navigate to "Citizen Services" -> "Grievance Redressal".',
            '3. Specify your Mysuru Ward number and street landmark.',
            '4. Upload on-site photo and submit to receive your MCC Ticket Reference.'
          ],
          requiredDocuments: ['Mysuru Ward / Zone details', 'Site photograph', 'Mobile number for SMS alerts'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Karnataka – Janaspandana (State Portal)',
            portalName: 'Janaspandana (IGRS Karnataka)',
            portalUrl: 'https://janaspandana.karnataka.gov.in',
            trackingUrl: 'https://janaspandana.karnataka.gov.in',
            helpline: '1902 (Janaspandana Citizen Call Center)',
            expectedTimelineDays: 21,
            whyAppropriate: 'Use this state-level portal if MCC does not take action within the 15-day Sakala timeline. It escalates directly to the District Deputy Commissioner (DC).'
          }
        };
      }

      // Mysuru Electricity
      if (normCat.includes('electric') || normCat.includes('power') || normDesc.includes('power') || normDesc.includes('voltage')) {
        return {
          authorityName: 'Chamundeshwari Electricity Supply Corporation (CHESCOM)',
          portalName: 'CHESCOM Online Consumer Grievance Services',
          portalUrl: 'https://chescom.karnataka.gov.in',
          trackingUrl: 'https://chescom.karnataka.gov.in',
          helpline: '1912 (24x7 CHESCOM Helpline) / 1800-425-1912',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'CHESCOM standards specify transformer and line repair within 24 to 72 hours.',
          whyAppropriate: 'CHESCOM is the designated state power utility responsible for electricity distribution, transformer maintenance, and billing in Mysuru district.',
          filingInstructions: [
            '1. Call 1912 or access chescom.karnataka.gov.in.',
            '2. Provide your 10-digit Electricity Account ID printed on your Mysuru power bill.',
            '3. Log your outage or voltage complaint and obtain the official docket number.'
          ],
          requiredDocuments: ['10-digit CHESCOM Account ID', 'Address of substation or meter pole'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Karnataka – Janaspandana',
            portalName: 'Janaspandana (IGRS)',
            portalUrl: 'https://janaspandana.karnataka.gov.in',
            trackingUrl: 'https://janaspandana.karnataka.gov.in',
            helpline: '1902',
            expectedTimelineDays: 21,
            whyAppropriate: 'State-level escalation if CHESCOM fails to resolve the power fault within statutory timelines.'
          }
        };
      }

      // Mysuru Water Supply
      if (normCat.includes('water') || normCat.includes('drainage') || normDesc.includes('water supply') || normDesc.includes('pipe')) {
        return {
          authorityName: 'Vani Vilas Water Works (VVWW) / Mysuru City Corporation',
          portalName: 'Mysuru City Corporation Water Supply Division',
          portalUrl: 'https://mysurucitycorporation.co.in',
          trackingUrl: 'https://mysurucitycorporation.co.in',
          helpline: '0821-2441155 (VVWW Water Helpdesk) / 0821-2418800',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'Water supply disruptions and pipeline leaks are prioritized under Sakala for 7-day resolution.',
          whyAppropriate: 'Drinking water distribution, pipeline leakages, and valve operations in Mysuru city are managed by Vani Vilas Water Works (VVWW) under the City Corporation.',
          filingInstructions: [
            '1. Call the VVWW Helpdesk at 0821-2441155 or log into mysurucitycorporation.co.in.',
            '2. Mention your water connection RR number and locality.',
            '3. Record the complaint reference number.'
          ],
          requiredDocuments: ['Water connection RR number', 'Exact locality / valve point in Mysuru'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Janaspandana (Karnataka IGRS)',
            portalName: 'Janaspandana Portal',
            portalUrl: 'https://janaspandana.karnataka.gov.in',
            trackingUrl: 'https://janaspandana.karnataka.gov.in',
            helpline: '1902',
            expectedTimelineDays: 21,
            whyAppropriate: 'State portal for escalation to the Mysuru District Deputy Commissioner.'
          }
        };
      }
    }

    // 1B. BENGALURU URBAN & RURAL DISTRICTS
    if (normLoc.includes('bengaluru') || normLoc.includes('bangalore')) {
      // Bengaluru Water Supply (BWSSB)
      if (normCat.includes('water') || normDesc.includes('sewage') || normDesc.includes('drain') || normDesc.includes('water supply')) {
        return {
          authorityName: 'Bangalore Water Supply and Sewerage Board (BWSSB)',
          portalName: 'BWSSB Citizen Grievance Portal',
          portalUrl: 'https://bwssb.karnataka.gov.in',
          trackingUrl: 'https://bwssb.karnataka.gov.in',
          helpline: '1916 (24x7 BWSSB Water Call Center) / WhatsApp 8762228888',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'BWSSB Citizen Charter mandates drinking water contamination and sewer bursts resolution within 24 to 72 hours.',
          whyAppropriate: 'BWSSB has exclusive statutory jurisdiction over drinking water supply, pipeline infrastructure, and underground sewerage in the Bengaluru metropolitan area.',
          filingInstructions: [
            '1. Dial 1916 or access bwssb.karnataka.gov.in.',
            '2. Provide your Consumer ID / RR Number (printed on your water bill).',
            '3. Report pipe breakage, low pressure, or contaminated water and note your complaint token.'
          ],
          requiredDocuments: ['BWSSB Consumer RR Number', 'Address / nearest water valve landmark'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
            portalName: 'BBMP Sahaaya',
            portalUrl: 'https://bbmp.gov.in',
            trackingUrl: 'https://bbmp.gov.in',
            helpline: '1533',
            expectedTimelineDays: 15,
            whyAppropriate: 'If the water issue is due to surface road flooding or storm-water drain overflow rather than piped supply.'
          }
        };
      }

      // Bengaluru Electricity (BESCOM)
      if (normCat.includes('electric') || normCat.includes('power') || normDesc.includes('power') || normDesc.includes('voltage')) {
        return {
          authorityName: 'Bangalore Electricity Supply Company (BESCOM)',
          portalName: 'BESCOM Online Consumer Services',
          portalUrl: 'https://bescom.karnataka.gov.in',
          trackingUrl: 'https://bescom.karnataka.gov.in',
          helpline: '1912 (24x7 BESCOM Helpline) / WhatsApp: 9449844640',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'BESCOM service standard specifies electrical faults resolution within 24 to 72 hours.',
          whyAppropriate: 'Power distribution, line disruptions, transformer repairs, and billing disputes in Bengaluru Urban and Rural districts are managed by BESCOM.',
          filingInstructions: [
            '1. Call 1912 or access the BESCOM portal.',
            '2. Enter your 10-digit Account ID printed on electricity bills.',
            '3. Register the supply failure or transformer issue.',
            '4. Note the docket number sent to your mobile phone.'
          ],
          requiredDocuments: ['10-digit Electricity Account ID', 'Address of the substation/pole'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Karnataka – Janaspandana',
            portalName: 'Janaspandana (IGRS)',
            portalUrl: 'https://janaspandana.karnataka.gov.in',
            trackingUrl: 'https://janaspandana.karnataka.gov.in',
            helpline: '1902',
            expectedTimelineDays: 21,
            whyAppropriate: 'State-level grievance redressal system if the utility fails to respond within the Sakala timeline.'
          }
        };
      }

      // Bengaluru Civic / Roads / Garbage (BBMP)
      if (
        normCat.includes('road') ||
        normCat.includes('pothole') ||
        normCat.includes('waste') ||
        normCat.includes('garbage') ||
        normCat.includes('sanitation') ||
        normCat.includes('streetlight') ||
        normCat.includes('civic')
      ) {
        return {
          authorityName: 'Bruhat Bengaluru Mahanagara Palike (BBMP) & Urban Development Dept',
          portalName: 'BBMP Sahaaya Citizen Portal',
          portalUrl: 'https://bbmp.gov.in',
          trackingUrl: 'https://janaspandana.karnataka.gov.in',
          helpline: '1533 (BBMP 24x7 Control Room) / 080-22221188',
          expectedTimelineDays: 15,
          officialTimelineNotice: 'Municipal road and sanitation repairs are governed under Karnataka Sakala Services Act with 15-day service guarantee.',
          whyAppropriate: 'Street maintenance, potholes, solid waste management, and storm-water drains in the Bengaluru metropolitan area are legally administered by BBMP ward engineers.',
          filingInstructions: [
            '1. Visit bbmp.gov.in or the BBMP Sahaaya portal.',
            '2. Select your Ward / Zone (East, West, South, Mahadevapura, etc.).',
            '3. Choose the exact sub-category (Road Pothole, Streetlight, Garbage Clearance).',
            '4. Pinpoint the street location and attach on-site photographs.',
            '5. Save your official BBMP grievance ticket number in Smart Bharat.'
          ],
          requiredDocuments: [
            'Exact street address or landmark in Bengaluru',
            'Photo of the pothole or damaged public amenity',
            'Citizen registered mobile number'
          ],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Karnataka – Janaspandana',
            portalName: 'Janaspandana (IGRS)',
            portalUrl: 'https://janaspandana.karnataka.gov.in',
            trackingUrl: 'https://janaspandana.karnataka.gov.in',
            helpline: '1902',
            expectedTimelineDays: 21,
            whyAppropriate: 'State-level escalation portal for Karnataka under the Sakala 21-day service mission.'
          }
        };
      }
    }

    // 1C. HUBBALLI-DHARWAD
    if (normLoc.includes('hubballi') || normLoc.includes('dharwad')) {
      if (normCat.includes('electric') || normCat.includes('power')) {
        return {
          authorityName: 'Hubli Electricity Supply Company (HESCOM)',
          portalName: 'HESCOM Consumer Portal',
          portalUrl: 'https://hescom.karnataka.gov.in',
          trackingUrl: 'https://hescom.karnataka.gov.in',
          helpline: '1912 (HESCOM 24x7)',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'HESCOM electrical fault resolution within 72 hours.',
          whyAppropriate: 'Power supply and metering in Dharwad and Hubballi are managed by HESCOM.',
          filingInstructions: ['1. Call 1912 or access hescom.karnataka.gov.in.', '2. Provide your HESCOM Account ID.'],
          requiredDocuments: ['Electricity Account ID', 'Address'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority'
        };
      }
      return {
        authorityName: 'Hubballi-Dharwad Municipal Corporation (HDMC)',
        portalName: 'HDMC Citizen Grievance Portal',
        portalUrl: 'https://hdmc.mrc.gov.in',
        trackingUrl: 'https://hdmc.mrc.gov.in',
        helpline: '0836-2213888 (HDMC Control Room)',
        expectedTimelineDays: 15,
        officialTimelineNotice: 'Civic repairs under Karnataka Sakala Mission (15 days).',
        whyAppropriate: 'HDMC is the municipal corporation for the twin cities of Hubballi and Dharwad.',
        filingInstructions: ['1. Visit hdmc.mrc.gov.in.', '2. Lodge complaint with Ward number and site photo.'],
        requiredDocuments: ['Ward details', 'Site photograph'],
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
        alternative: {
          authorityName: 'Janaspandana (State Portal)',
          portalName: 'Janaspandana (IGRS)',
          portalUrl: 'https://janaspandana.karnataka.gov.in',
          trackingUrl: 'https://janaspandana.karnataka.gov.in',
          helpline: '1902',
          expectedTimelineDays: 21,
          whyAppropriate: 'State portal for escalation to Dharwad District Administration.'
        }
      };
    }

    // 1D. MANGALURU / DAKSHINA KANNADA
    if (normLoc.includes('mangaluru') || normLoc.includes('mangalore') || normLoc.includes('dakshina kannada')) {
      if (normCat.includes('electric') || normCat.includes('power')) {
        return {
          authorityName: 'Mangalore Electricity Supply Company (MESCOM)',
          portalName: 'MESCOM Consumer Portal',
          portalUrl: 'https://mescom.karnataka.gov.in',
          trackingUrl: 'https://mescom.karnataka.gov.in',
          helpline: '1912 (MESCOM 24x7)',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'MESCOM power resolution standard: 72 hours.',
          whyAppropriate: 'MESCOM handles power supply across Dakshina Kannada and coastal Karnataka.',
          filingInstructions: ['1. Dial 1912.', '2. Give MESCOM Account Number.'],
          requiredDocuments: ['MESCOM Account ID'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority'
        };
      }
      return {
        authorityName: 'Mangaluru City Corporation (MCC)',
        portalName: 'Mangaluru City Corporation Grievance Portal',
        portalUrl: 'https://mangalorerevenue.com',
        trackingUrl: 'https://mangalorerevenue.com',
        helpline: '0824-2220306 (MCC Control Room)',
        expectedTimelineDays: 15,
        officialTimelineNotice: '15-day resolution standard under Karnataka Sakala Services Act.',
        whyAppropriate: 'Mangaluru City Corporation administers roads, solid waste, and public health in Mangaluru.',
        filingInstructions: ['1. Access mangalorerevenue.com.', '2. Submit civic grievance with ward and photo.'],
        requiredDocuments: ['Ward details in Mangaluru', 'Site photo'],
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
        alternative: {
          authorityName: 'Janaspandana (State Portal)',
          portalName: 'Janaspandana (IGRS)',
          portalUrl: 'https://janaspandana.karnataka.gov.in',
          trackingUrl: 'https://janaspandana.karnataka.gov.in',
          helpline: '1902',
          expectedTimelineDays: 21,
          whyAppropriate: 'State portal for escalation to the Dakshina Kannada Deputy Commissioner.'
        }
      };
    }

    // 1E. OTHER KARNATAKA DISTRICTS (FALLBACK WITH CLEAR EXPLANATION)
    return {
      authorityName: 'Government of Karnataka – Department of Personnel & Administrative Reforms',
      portalName: 'Janaspandana (Integrated Public Grievance Redressal System - IGRS)',
      portalUrl: 'https://janaspandana.karnataka.gov.in',
      trackingUrl: 'https://janaspandana.karnataka.gov.in',
      helpline: '1902 (Janaspandana Integrated Citizen Call Center)',
      expectedTimelineDays: 21,
      officialTimelineNotice: 'Karnataka Sakala Mission stipulates 21-day timeline for departmental grievance redressal.',
      whyAppropriate: `A dedicated municipal online portal is not independently verified for ${district || 'this district'}; official grievance routing is provided through Government of Karnataka's centralized Janaspandana portal, which routes complaints directly to the District Deputy Commissioner and Taluk administration under Sakala guarantee.`,
      filingInstructions: [
        '1. Go to janaspandana.karnataka.gov.in.',
        '2. Log in with your Aadhaar-linked or verified mobile number.',
        '3. Select District, Taluk, and Department (Revenue, Police, Health, Transport).',
        '4. Submit the petition and record the official Janaspandana ID.'
      ],
      requiredDocuments: ['Citizen Contact Details', 'Supporting documents in PDF/JPG'],
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative'
    };
  }

  // =========================================================================
  // 2. TAMIL NADU STATE & DISTRICTS
  // =========================================================================
  if (normState.includes('tamil nadu') || normState.includes('tamilnadu')) {
    // 2A. CHENNAI DISTRICT
    if (normLoc.includes('chennai')) {
      // Chennai Water Supply (CMWSSB)
      if (normCat.includes('water') || normDesc.includes('sewage') || normDesc.includes('drain')) {
        return {
          authorityName: 'Chennai Metro Water Supply & Sewerage Board (CMWSSB)',
          portalName: 'CMWSSB Citizen Portal',
          portalUrl: 'https://chennaimetrowater.tn.gov.in',
          trackingUrl: 'https://chennaimetrowater.tn.gov.in',
          helpline: '044-45674567 (24x7 CMWSSB Call Center)',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'CMWSSB Citizen Charter mandates drinking water contamination and sewer blockages resolution within 7 days.',
          whyAppropriate: 'CMWSSB has statutory responsibility for drinking water distribution and underground sewer line maintenance across the Chennai metropolitan area.',
          filingInstructions: [
            '1. Call 044-45674567 or access chennaimetrowater.tn.gov.in.',
            '2. Provide your Consumer Service Number (CMC Number).',
            '3. File your grievance and note the generated docket token.'
          ],
          requiredDocuments: ['CMC Water connection number', 'Locality / street address in Chennai'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Greater Chennai Corporation (GCC)',
            portalName: 'Namma Chennai Portal',
            portalUrl: 'https://chennaicorporation.gov.in',
            trackingUrl: 'https://chennaicorporation.gov.in',
            helpline: '1913',
            expectedTimelineDays: 14,
            whyAppropriate: 'If the issue involves surface road flooding or storm-water drain desilting rather than water supply mains.'
          }
        };
      }

      // Chennai Electricity (TANGEDCO)
      if (normCat.includes('electric') || normCat.includes('power') || normDesc.includes('power') || normDesc.includes('voltage')) {
        return {
          authorityName: 'Tamil Nadu Generation and Distribution Corporation (TANGEDCO - Chennai Region)',
          portalName: 'TANGEDCO Minnagam Consumer Grievance Portal',
          portalUrl: 'https://www.tangedco.gov.in',
          trackingUrl: 'https://www.tangedco.gov.in',
          helpline: '94987 94987 (Minnagam 24x7 Toll-Free Call Centre)',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'TANGEDCO service standards mandate resolution of electrical faults and feeder breakdowns within 24 to 72 hours.',
          whyAppropriate: 'TANGEDCO Minnagam is the dedicated electricity grievance redressal system for consumer power issues across Chennai.',
          filingInstructions: [
            '1. Dial Minnagam at 94987 94987 or access tangedco.gov.in.',
            '2. Enter your 10-digit Consumer Number (printed on electricity receipt).',
            '3. Register the complaint and collect the Minnagam SMS reference number.'
          ],
          requiredDocuments: ['10-digit TANGEDCO Consumer Number', 'Address / Distribution transformer details'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Tamil Nadu – Chief Minister\'s Special Cell',
            portalName: 'Mudhalvarin Mugavari (CM Helpline)',
            portalUrl: 'https://cmhelpline.tnega.org',
            trackingUrl: 'https://cmhelpline.tnega.org',
            helpline: '1100',
            expectedTimelineDays: 30,
            whyAppropriate: 'State-level apex escalation portal monitored directly by the Chief Minister\'s Special Cell.'
          }
        };
      }

      // Chennai Civic / Roads / Garbage (GCC)
      if (
        normCat.includes('road') ||
        normCat.includes('pothole') ||
        normCat.includes('waste') ||
        normCat.includes('garbage') ||
        normCat.includes('sanitation') ||
        normCat.includes('streetlight') ||
        normCat.includes('civic')
      ) {
        return {
          authorityName: 'Greater Chennai Corporation (GCC) & Municipal Administration',
          portalName: 'Namma Chennai Citizen Grievance Portal',
          portalUrl: 'https://chennaicorporation.gov.in',
          trackingUrl: 'https://chennaicorporation.gov.in',
          helpline: '1913 (GCC 24x7 Control Room)',
          expectedTimelineDays: 14,
          officialTimelineNotice: 'GCC Citizen Charter mandates ward-level redressal within 7 to 14 days.',
          whyAppropriate: 'Roads, streetlights, public health, and storm water drainage within Chennai Corporation limits are directly handled by GCC zonal offices.',
          filingInstructions: [
            '1. Open chennaicorporation.gov.in or dial 1913 toll-free.',
            '2. Select Zone and Ward number.',
            '3. Provide exact street location and upload photograph.',
            '4. Collect your GCC Complaint Reference number.'
          ],
          requiredDocuments: ['Zone & Division number', 'Contact Mobile Number', 'Site Photo'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Tamil Nadu – Chief Minister\'s Special Cell',
            portalName: 'Mudhalvarin Mugavari',
            portalUrl: 'https://cmhelpline.tnega.org',
            trackingUrl: 'https://cmhelpline.tnega.org',
            helpline: '1100',
            expectedTimelineDays: 30,
            whyAppropriate: 'State-level apex escalation portal monitored directly by the CM Secretariat.'
          }
        };
      }
    }

    // 2B. COIMBATORE DISTRICT
    if (normLoc.includes('coimbatore')) {
      // Coimbatore Electricity
      if (normCat.includes('electric') || normCat.includes('power') || normDesc.includes('power') || normDesc.includes('voltage')) {
        return {
          authorityName: 'Tamil Nadu Generation and Distribution Corporation (TANGEDCO - Coimbatore Region)',
          portalName: 'TANGEDCO Minnagam Consumer Grievance Portal',
          portalUrl: 'https://www.tangedco.gov.in',
          trackingUrl: 'https://www.tangedco.gov.in',
          helpline: '94987 94987 (Minnagam 24x7 Helpline)',
          expectedTimelineDays: 7,
          officialTimelineNotice: 'TANGEDCO service standards specify power outage resolution within 24 to 72 hours.',
          whyAppropriate: 'Electricity distribution, line disruptions, transformer repairs, and meter issues across Coimbatore district are managed by TANGEDCO Minnagam.',
          filingInstructions: [
            '1. Dial 94987 94987 (Minnagam Call Center) or visit tangedco.gov.in.',
            '2. Provide your 10-digit TANGEDCO Consumer Number.',
            '3. Register the complaint and note down your Minnagam docket ID.'
          ],
          requiredDocuments: ['TANGEDCO Consumer Number', 'Address / Substation landmark in Coimbatore'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Tamil Nadu – Chief Minister\'s Special Cell',
            portalName: 'Mudhalvarin Mugavari',
            portalUrl: 'https://cmhelpline.tnega.org',
            trackingUrl: 'https://cmhelpline.tnega.org',
            helpline: '1100',
            expectedTimelineDays: 30,
            whyAppropriate: 'State escalation portal with direct Collectorate monitoring if the local utility does not respond.'
          }
        };
      }

      // Coimbatore Civic / Roads / Garbage (CCMC)
      if (
        normCat.includes('road') ||
        normCat.includes('pothole') ||
        normCat.includes('waste') ||
        normCat.includes('garbage') ||
        normCat.includes('sanitation') ||
        normCat.includes('streetlight') ||
        normCat.includes('civic')
      ) {
        return {
          authorityName: 'Coimbatore City Municipal Corporation (CCMC)',
          portalName: 'Coimbatore City Municipal Corporation Citizen Portal',
          portalUrl: 'https://ccmc.gov.in',
          trackingUrl: 'https://ccmc.gov.in',
          helpline: '0422-2302323 (CCMC Control Room) / WhatsApp: 8190000200',
          expectedTimelineDays: 15,
          officialTimelineNotice: 'CCMC service charter mandates municipal road, garbage, and drainage repairs within 15 days.',
          whyAppropriate: 'Coimbatore City Municipal Corporation is the local governing body directly responsible for street maintenance, garbage collection, and civic amenities across Coimbatore corporation zones.',
          filingInstructions: [
            '1. Visit ccmc.gov.in or message CCMC WhatsApp helpline at 8190000200.',
            '2. Select your Zone (East, West, North, South, Central) and Ward number.',
            '3. Upload on-site photograph and describe the issue.',
            '4. Receive your official CCMC Complaint Reference Number.'
          ],
          requiredDocuments: ['Coimbatore Zone & Ward number', 'Street landmark', 'Site photograph'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Tamil Nadu – Chief Minister\'s Special Cell',
            portalName: 'Mudhalvarin Mugavari (CM Helpline)',
            portalUrl: 'https://cmhelpline.tnega.org',
            trackingUrl: 'https://cmhelpline.tnega.org',
            helpline: '1100',
            expectedTimelineDays: 30,
            whyAppropriate: 'State-level unified grievance redressal system monitored directly by the District Collector and CM Secretariat.'
          }
        };
      }
    }

    // 2C. MADURAI DISTRICT
    if (normLoc.includes('madurai')) {
      if (
        normCat.includes('road') ||
        normCat.includes('waste') ||
        normCat.includes('garbage') ||
        normCat.includes('sanitation') ||
        normCat.includes('civic')
      ) {
        return {
          authorityName: 'Madurai City Municipal Corporation',
          portalName: 'Madurai Corporation Citizen Portal',
          portalUrl: 'https://maduraicorporation.co.in',
          trackingUrl: 'https://maduraicorporation.co.in',
          helpline: '0452-2533030 / WhatsApp 9443733030',
          expectedTimelineDays: 15,
          officialTimelineNotice: '15-day resolution standard under Madurai Corporation Charter.',
          whyAppropriate: 'Madurai City Municipal Corporation administers civic roads, sanitation, and streetlights within Madurai.',
          filingInstructions: ['1. Access maduraicorporation.co.in.', '2. File grievance with Ward details and photo.'],
          requiredDocuments: ['Ward details in Madurai', 'Site photo'],
          isDistrictSpecific: true,
          jurisdictionLevel: 'District Authority',
          alternative: {
            authorityName: 'Government of Tamil Nadu – Mudhalvarin Mugavari',
            portalName: 'Mudhalvarin Mugavari (CM Helpline)',
            portalUrl: 'https://cmhelpline.tnega.org',
            trackingUrl: 'https://cmhelpline.tnega.org',
            helpline: '1100',
            expectedTimelineDays: 30,
            whyAppropriate: 'State escalation portal with direct monitoring by the Madurai District Collector.'
          }
        };
      }
    }

    // 2D. OTHER TAMIL NADU DISTRICTS (FALLBACK WITH CLEAR EXPLANATION)
    // Electricity across TN
    if (normCat.includes('electric') || normCat.includes('power')) {
      return {
        authorityName: 'Tamil Nadu Generation and Distribution Corporation (TANGEDCO)',
        portalName: 'TANGEDCO Minnagam Consumer Grievance Portal',
        portalUrl: 'https://www.tangedco.gov.in',
        trackingUrl: 'https://www.tangedco.gov.in',
        helpline: '94987 94987 (Minnagam 24x7 Helpline)',
        expectedTimelineDays: 7,
        officialTimelineNotice: 'TANGEDCO electricity resolution standard: 72 hours.',
        whyAppropriate: 'TANGEDCO Minnagam is the statewide power distribution utility covering all districts of Tamil Nadu.',
        filingInstructions: ['1. Dial 94987 94987.', '2. Quote your Consumer Number.'],
        requiredDocuments: ['TANGEDCO Consumer ID'],
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority'
      };
    }

    return {
      authorityName: 'Government of Tamil Nadu – Chief Minister\'s Special Cell',
      portalName: 'Mudhalvarin Mugavari (Chief Minister Helpline Portal)',
      portalUrl: 'https://cmhelpline.tnega.org',
      trackingUrl: 'https://cmhelpline.tnega.org',
      helpline: '1100 (CM Helpline Toll-Free Call Centre)',
      expectedTimelineDays: 30,
      officialTimelineNotice: 'Tamil Nadu CM Helpline petitions are monitored with a standard 30-day resolution mandate.',
      whyAppropriate: `A dedicated municipal online portal is not independently verified for ${district || 'this district'}; complaints are officially routed via Tamil Nadu's apex Mudhalvarin Mugavari portal directly to the District Collector and Taluk officers with departmental monitoring.`,
      filingInstructions: [
        '1. Access cmhelpline.tnega.org or call 1100.',
        '2. Register your grievance with your mobile number.',
        '3. Choose the appropriate department (Revenue, Rural Development, Police).',
        '4. Receive your official 12-digit CM Helpline petition ID.'
      ],
      requiredDocuments: ['Mobile number', 'Aadhaar / Ration card reference (optional)', 'Grievance description'],
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative'
    };
  }

  // =========================================================================
  // 3. MAHARASHTRA STATE & DISTRICTS
  // =========================================================================
  if (normState.includes('maharashtra')) {
    if (normLoc.includes('mumbai')) {
      return {
        authorityName: 'Brihanmumbai Municipal Corporation (BMC)',
        portalName: 'BMC Citizen Portal',
        portalUrl: 'https://portal.mcgm.gov.in',
        trackingUrl: 'https://portal.mcgm.gov.in',
        helpline: '1916 (BMC 24x7 Disaster Management & Helpline)',
        expectedTimelineDays: 15,
        officialTimelineNotice: 'BMC Citizen Charter specifies 15-day timeline for municipal repair works.',
        whyAppropriate: 'BMC has jurisdiction over roads, solid waste, and civic amenities within Mumbai City and Suburban districts.',
        filingInstructions: ['1. Access portal.mcgm.gov.in.', '2. Select Ward and upload photographic proof.'],
        requiredDocuments: ['Mumbai Ward details', 'Site photograph'],
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority',
        alternative: {
          authorityName: 'Government of Maharashtra – Aaple Sarkar',
          portalName: 'Aaple Sarkar Grievance Portal',
          portalUrl: 'https://grievances.maharashtra.gov.in',
          trackingUrl: 'https://grievances.maharashtra.gov.in',
          helpline: '1800-120-8040',
          expectedTimelineDays: 21,
          whyAppropriate: 'State-level portal for Maharashtra citizen grievances.'
        }
      };
    }

    if (normLoc.includes('pune')) {
      return {
        authorityName: 'Pune Municipal Corporation (PMC)',
        portalName: 'PMC Care Grievance Portal',
        portalUrl: 'https://pmc.gov.in',
        trackingUrl: 'https://pmc.gov.in',
        helpline: '1800-1030-222 (PMC Care Toll-Free)',
        expectedTimelineDays: 15,
        officialTimelineNotice: 'PMC service charter stipulates 15-day resolution for civic infrastructure.',
        whyAppropriate: 'Pune Municipal Corporation is the urban local body administering Pune municipal wards.',
        filingInstructions: ['1. Visit pmc.gov.in.', '2. Select Ward and lodge grievance.'],
        requiredDocuments: ['PMC Ward details', 'Site proof'],
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority'
      };
    }

    return {
      authorityName: 'Government of Maharashtra – General Administration Department',
      portalName: 'Aaple Sarkar Public Grievance Redressal Portal',
      portalUrl: 'https://grievances.maharashtra.gov.in',
      trackingUrl: 'https://grievances.maharashtra.gov.in',
      helpline: '1800-120-8040 (Toll-Free Call Centre)',
      expectedTimelineDays: 21,
      officialTimelineNotice: 'Maharashtra Right to Public Services Act mandates 21-day service resolution.',
      whyAppropriate: `A dedicated municipal portal is not independently verified for ${district || 'this district'}; complaints are officially routed via Government of Maharashtra's centralized Aaple Sarkar portal to District Collectors.`,
      filingInstructions: ['1. Visit grievances.maharashtra.gov.in.', '2. Register citizen profile and submit grievance.'],
      requiredDocuments: ['Mobile number', 'Aadhaar / Address proof'],
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative'
    };
  }

  // =========================================================================
  // 4. DELHI (NCT)
  // =========================================================================
  if (normState.includes('delhi')) {
    if (normCat.includes('water') || normDesc.includes('water') || normDesc.includes('drain')) {
      return {
        authorityName: 'Delhi Jal Board (DJB)',
        portalName: 'Delhi Jal Board Grievance Portal',
        portalUrl: 'https://delhijalboard.nic.in',
        trackingUrl: 'https://delhijalboard.nic.in',
        helpline: '1916 (DJB 24x7 Water Helpline)',
        expectedTimelineDays: 7,
        officialTimelineNotice: 'DJB Citizen Charter specifies water disruption resolution within 7 days.',
        whyAppropriate: 'Delhi Jal Board is responsible for potable water supply and sewer maintenance across Delhi.',
        filingInstructions: ['1. Dial 1916.', '2. Quote K No. / Water connection number.'],
        requiredDocuments: ['DJB K Number'],
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority'
      };
    }

    if (
      normCat.includes('road') ||
      normCat.includes('pothole') ||
      normCat.includes('waste') ||
      normCat.includes('garbage') ||
      normCat.includes('sanitation') ||
      normCat.includes('civic')
    ) {
      return {
        authorityName: 'Municipal Corporation of Delhi (MCD)',
        portalName: 'MCD 311 Citizen App / Portal',
        portalUrl: 'https://mcdonline.nic.in',
        trackingUrl: 'https://mcdonline.nic.in',
        helpline: '155305 (MCD Central Control Room)',
        expectedTimelineDays: 14,
        officialTimelineNotice: 'MCD Citizen Charter mandates 14-day timeline for civic grievances.',
        whyAppropriate: 'MCD is responsible for municipal roads, sanitation, and waste collection across Delhi zones.',
        filingInstructions: ['1. Access mcdonline.nic.in or dial 155305.', '2. Provide zone and ward details.'],
        requiredDocuments: ['Delhi Zone details', 'Site photo'],
        isDistrictSpecific: true,
        jurisdictionLevel: 'District Authority'
      };
    }

    return {
      authorityName: 'Public Grievance Commission (PGC) – Government of NCT of Delhi',
      portalName: 'Delhi Government Public Grievance Monitoring System (PGMS)',
      portalUrl: 'https://pgms.delhi.gov.in',
      trackingUrl: 'https://pgms.delhi.gov.in',
      helpline: '1031 (Delhi Govt Anti-Corruption & Public Grievance Helpline)',
      expectedTimelineDays: 30,
      officialTimelineNotice: 'Resolution is monitored by the Public Grievance Commission within 30 days.',
      whyAppropriate: 'PGMS is Delhi Government\'s unified platform connecting all state departments and district magistrates.',
      filingInstructions: ['1. Visit pgms.delhi.gov.in.', '2. Submit petition with mobile OTP.'],
      requiredDocuments: ['Mobile number', 'Supporting document'],
      isDistrictSpecific: false,
      jurisdictionLevel: 'State Alternative'
    };
  }

  // =========================================================================
  // 5. DEFAULT STATE / CENTRAL FALLBACK (ALL-INDIA)
  // =========================================================================
  return {
    authorityName: 'Government of India – Department of Administrative Reforms & Public Grievances (DARPG)',
    portalName: 'CPGRAMS National Portal & State Grievance Directorate',
    portalUrl: 'https://pgportal.gov.in',
    trackingUrl: 'https://pgportal.gov.in/Status',
    helpline: '1800-11-4000 (Toll-Free National Grievance Call Centre)',
    expectedTimelineDays: 30,
    officialTimelineNotice: 'Citizen Charter guidelines mandate resolution within a maximum of 30 days.',
    whyAppropriate: `A verified local municipal portal is not independently listed for ${district || 'this area'}; complaints are officially routed via Government of India's apex CPGRAMS portal, which interoperates with state nodal grievance officers across India.`,
    filingInstructions: [
      '1. Access pgportal.gov.in.',
      '2. Register your account using your mobile number.',
      '3. Select the state or central administrative ministry.',
      '4. Upload your complaint and note the generated registration token.'
    ],
    requiredDocuments: ['Mobile number', 'Supporting description & proof'],
    isDistrictSpecific: false,
    jurisdictionLevel: 'State Alternative'
  };
};

// @desc    Get portal guidance based on state & category
// @route   POST /api/grievances/guide
// @access  Public / Private
const getGuidance = async (req, res) => {
  try {
    const { state, district, city, category, description, exactLocation } = req.body;
    const guidance = evaluateGuidance({ state, district, city, category, description, exactLocation });
    res.json({
      success: true,
      guidance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all saved complaints for the authenticated citizen
// @route   GET /api/grievances
// @access  Private (Derived strictly from verified JWT)
const getGrievances = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    let records = [];

    if (isDbConnected()) {
      try {
        records = await Grievance.find({ userId }).sort({ createdAt: -1 });
        records = records.map((r) => (r.toObject ? r.toObject() : r));
      } catch (dbErr) {
        console.warn('[Grievance] Mongo fallback:', dbErr.message);
        records = memoryGrievances.filter((g) => (g.userId?.toString() || g.userId) === userId);
      }
    } else {
      records = memoryGrievances.filter((g) => (g.userId?.toString() || g.userId) === userId);
    }

    // Enhance records with calculated days elapsed and timeline analysis
    const enhanced = records.map((g) => {
      const subDate = new Date(g.submissionDate || g.createdAt || Date.now());
      const now = new Date();
      const diffMs = Math.max(0, now - subDate);
      const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const expectedDays = Number(g.expectedTimelineDays) || 30;
      const isOverdue = daysElapsed > expectedDays && g.citizenStatus !== 'Resolved by Dept' && g.citizenStatus !== 'Closed';
      const daysOverdue = isOverdue ? daysElapsed - expectedDays : 0;
      const daysRemaining = Math.max(0, expectedDays - daysElapsed);

      return {
        ...g,
        daysElapsed,
        expectedTimelineDays: expectedDays,
        isOverdue,
        daysOverdue,
        daysRemaining,
      };
    });

    res.json({
      success: true,
      count: enhanced.length,
      grievances: enhanced,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregated citizen insights & charts calculated purely from user records
// @route   GET /api/grievances/insights
// @access  Private (Derived strictly from verified JWT)
const getGrievanceInsights = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    let records = [];

    if (isDbConnected()) {
      try {
        records = await Grievance.find({ userId });
        records = records.map((r) => (r.toObject ? r.toObject() : r));
      } catch (dbErr) {
        records = memoryGrievances.filter((g) => (g.userId?.toString() || g.userId) === userId);
      }
    } else {
      records = memoryGrievances.filter((g) => (g.userId?.toString() || g.userId) === userId);
    }

    if (records.length === 0) {
      return res.json({
        success: true,
        hasData: false,
        stats: {
          total: 0,
          awaitingUpdates: 0,
          markedResolved: 0,
          averageWaitingDays: 0,
          overdueCount: 0,
          longestWaitingDays: 0,
        },
        longestWaiting: null,
        byCategory: [],
        byMonth: [],
        waitingBuckets: { under15: 0, days15to30: 0, over30: 0 },
        aiRecommendations: [],
      });
    }

    const now = new Date();
    let totalWaitingDays = 0;
    let awaitingUpdatesCount = 0;
    let markedResolvedCount = 0;
    let overdueCount = 0;

    let longestWaiting = null;
    let maxDays = -1;

    const categoryMap = {};
    const monthMap = {};
    const buckets = { under15: 0, days15to30: 0, over30: 0 };
    const aiRecommendations = [];

    records.forEach((g) => {
      const subDate = new Date(g.submissionDate || g.createdAt || now);
      const daysElapsed = Math.floor(Math.max(0, now - subDate) / (1000 * 60 * 60 * 24));
      const expectedDays = Number(g.expectedTimelineDays) || 30;

      const isResolved = g.citizenStatus === 'Resolved by Dept' || g.citizenStatus === 'Closed';
      if (isResolved) {
        markedResolvedCount++;
      } else {
        awaitingUpdatesCount++;
        totalWaitingDays += daysElapsed;

        if (daysElapsed > expectedDays) {
          overdueCount++;
          aiRecommendations.push({
            id: g._id,
            title: g.title,
            referenceNumber: g.referenceNumber,
            portalName: g.portalName,
            daysElapsed,
            daysOverdue: daysElapsed - expectedDays,
            expectedTimelineDays: expectedDays,
            recommendation: `This complaint has been pending for ${daysElapsed} days, which exceeds the published ${expectedDays}-day timeline of ${g.portalName}. You can file an official First Appeal or contact helpline ${g.portalUrl ? 'on their official portal' : '1800-11-4000'}.`,
            actionUrl: g.trackingUrl || g.portalUrl,
          });
        }

        if (daysElapsed > maxDays) {
          maxDays = daysElapsed;
          longestWaiting = {
            id: g._id,
            title: g.title,
            referenceNumber: g.referenceNumber,
            portalName: g.portalName,
            category: g.category,
            daysElapsed,
            expectedTimelineDays: expectedDays,
            status: g.citizenStatus,
          };
        }

        if (daysElapsed <= 15) buckets.under15++;
        else if (daysElapsed <= 30) buckets.days15to30++;
        else buckets.over30++;
      }

      // Group by Category
      const cat = g.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;

      // Group by Month
      const monthYear = subDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthMap[monthYear] = (monthMap[monthYear] || 0) + 1;
    });

    const activeCount = awaitingUpdatesCount;
    const averageWaitingDays = activeCount > 0 ? Math.round(totalWaitingDays / activeCount) : 0;

    // Format Category list with colors
    const categoryColors = ['#F97316', '#10B981', '#6366F1', '#0284C7', '#EC4899', '#8B5CF6'];
    const byCategory = Object.keys(categoryMap).map((cat, idx) => ({
      name: cat,
      count: categoryMap[cat],
      color: categoryColors[idx % categoryColors.length],
      percentage: Math.round((categoryMap[cat] / records.length) * 100),
    }));

    const byMonth = Object.keys(monthMap).map((m) => ({
      month: m,
      count: monthMap[m],
    }));

    res.json({
      success: true,
      hasData: true,
      stats: {
        total: records.length,
        awaitingUpdates: awaitingUpdatesCount,
        markedResolved: markedResolvedCount,
        averageWaitingDays,
        overdueCount,
        longestWaitingDays: maxDays > -1 ? maxDays : 0,
      },
      longestWaiting,
      byCategory,
      byMonth,
      waitingBuckets: buckets,
      aiRecommendations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save a complaint details after official submission
// @route   POST /api/grievances
// @access  Private
const createGrievance = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const {
      title,
      category,
      state,
      district,
      city,
      exactLocation,
      description,
      authorityName,
      portalName,
      portalUrl,
      trackingUrl,
      referenceNumber,
      submissionDate,
      expectedTimelineDays,
      officialTimelineNotice,
      citizenStatus,
      initialNote,
    } = req.body;

    if (!title || !referenceNumber || !portalName || !state) {
      return res.status(400).json({
        success: false,
        message: 'Title, Official Reference Number, Government Portal, and State are required.',
      });
    }

    const notes = [];
    if (initialNote && initialNote.trim()) {
      notes.push({ text: initialNote.trim(), createdAt: new Date() });
    }

    const cleanRef = referenceNumber.trim();

    const grievanceData = {
      userId,
      title: title.trim(),
      category: category ? category.trim() : 'Civic Grievance',
      state: state.trim(),
      district: district ? district.trim() : '',
      city: city ? city.trim() : '',
      exactLocation: exactLocation ? exactLocation.trim() : '',
      description: description ? description.trim() : title.trim(),
      authorityName: authorityName || 'Designated Government Authority',
      portalName: portalName.trim(),
      portalUrl: portalUrl ? portalUrl.trim() : 'https://pgportal.gov.in',
      trackingUrl: trackingUrl ? trackingUrl.trim() : portalUrl || 'https://pgportal.gov.in',
      referenceNumber: cleanRef,
      submissionDate: submissionDate ? new Date(submissionDate) : new Date(),
      expectedTimelineDays: Number(expectedTimelineDays) || 30,
      officialTimelineNotice: officialTimelineNotice || 'Standard official timeline is 30 days under Citizen Charter.',
      citizenStatus: citizenStatus || 'Awaiting Updates',
      notes,
      reminders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let grievance = null;

    if (isDbConnected()) {
      try {
        grievance = await Grievance.create(grievanceData);
        memoryGrievances.unshift(grievance.toObject ? grievance.toObject() : grievance);
      } catch (dbErr) {
        console.warn('[Grievance Create] Mongo fallback:', dbErr.message);
        grievance = { _id: new mongoose.Types.ObjectId().toString(), ...grievanceData };
        memoryGrievances.unshift(grievance);
      }
    } else {
      grievance = { _id: new mongoose.Types.ObjectId().toString(), ...grievanceData };
      memoryGrievances.unshift(grievance);
    }
    saveToDisk('grievances');

    // Also record in centralized Activity history
    try {
      const actData = {
        userId,
        type: 'grievance',
        title: grievance.title,
        subtitle: `${grievance.portalName} • Ref: ${grievance.referenceNumber}`,
        token: `Token: ${grievance.referenceNumber}`,
        status: grievance.citizenStatus,
        statusColor: '#D97706',
        statusBg: '#FEF3C7',
        icon: '📢',
        route: '/grievances/track',
        metadata: {
          grievanceId: grievance._id,
          referenceNumber: grievance.referenceNumber,
          portalName: grievance.portalName,
          category: grievance.category,
          state: grievance.state,
          submissionDate: grievance.submissionDate,
        },
      };

      if (isDbConnected()) {
        try {
          await Activity.create(actData);
        } catch (actErr) {
          memoryActivities.unshift({ _id: new mongoose.Types.ObjectId().toString(), ...actData });
        }
      } else {
        memoryActivities.unshift({ _id: new mongoose.Types.ObjectId().toString(), ...actData });
      }
      saveToDisk('activities');
    } catch (e) {
      console.warn('Activity sync note:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Complaint reference recorded successfully.',
      grievance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint citizen notes, status, details, reminder or feedback
// @route   PATCH /api/grievances/:id
// @access  Private
const updateGrievance = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { id } = req.params;
    const {
      title,
      category,
      referenceNumber,
      description,
      exactLocation,
      citizenStatus,
      newNote,
      newReminder,
      citizenFeedback,
    } = req.body;

    let grievance = null;

    if (isDbConnected()) {
      try {
        grievance = await Grievance.findOne({ _id: id, userId });
      } catch (e) {
        grievance = null;
      }
    }

    if (!grievance) {
      const idx = memoryGrievances.findIndex(
        (g) => (g._id?.toString() || g.id?.toString()) === id.toString() && (g.userId?.toString() || g.userId) === userId
      );
      if (idx !== -1) grievance = memoryGrievances[idx];
    }

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance record not found or not owned by you.',
      });
    }

    const oldRefNum = grievance.referenceNumber;

    // Editable complaint details (preserves submissionDate and official authority)
    if (title && title.trim()) grievance.title = title.trim();
    if (category && category.trim()) grievance.category = category.trim();
    if (referenceNumber && referenceNumber.trim()) grievance.referenceNumber = referenceNumber.trim();
    if (description && description.trim()) grievance.description = description.trim();
    if (exactLocation !== undefined) grievance.exactLocation = (exactLocation || '').trim();

    if (citizenStatus) grievance.citizenStatus = citizenStatus;
    if (newNote && newNote.trim()) {
      grievance.notes = grievance.notes || [];
      grievance.notes.unshift({ text: newNote.trim(), createdAt: new Date() });
    }
    if (newReminder && newReminder.date) {
      grievance.reminders = grievance.reminders || [];
      grievance.reminders.push({
        date: new Date(newReminder.date),
        note: newReminder.note || 'Follow-up on official portal',
        isDone: false,
      });
    }
    if (citizenFeedback) {
      grievance.citizenFeedback = {
        rating: Number(citizenFeedback.rating) || 5,
        experienceNotes: (citizenFeedback.experienceNotes || '').trim(),
        recordedAt: new Date(),
      };
    }

    if (isDbConnected() && grievance.save) {
      await grievance.save();
    }

    // Sync with corresponding Activity status & details in MongoDB
    try {
      const statusMap = {
        'Awaiting Updates': { status: 'Awaiting Updates', statusColor: '#D97706', statusBg: '#FEF3C7' },
        'In Review': { status: 'In Review', statusColor: '#0284C7', statusBg: '#E0F2FE' },
        'Action Taken': { status: 'Action Taken', statusColor: '#7C3AED', statusBg: '#EDE9FE' },
        'Resolved by Dept': { status: 'Resolved by Dept', statusColor: '#16A34A', statusBg: '#DCFCE7' },
        'Closed': { status: 'Closed', statusColor: '#475569', statusBg: '#F1F5F9' },
      };

      const s = statusMap[grievance.citizenStatus] || { status: grievance.citizenStatus };
      if (isDbConnected()) {
        await Activity.findOneAndUpdate(
          { userId, 'metadata.referenceNumber': oldRefNum },
          {
            title: grievance.title,
            subtitle: `${grievance.portalName} • Ref #${grievance.referenceNumber}`,
            token: `Ref: ${grievance.referenceNumber}`,
            status: s.status,
            statusColor: s.statusColor,
            statusBg: s.statusBg,
            'metadata.referenceNumber': grievance.referenceNumber,
            'metadata.category': grievance.category,
          }
        );
      }

      // Memory activity sync
      const act = memoryActivities.find(
        (a) => (a.userId?.toString() || a.userId) === userId && a.metadata?.referenceNumber === oldRefNum
      );
      if (act) {
        act.title = grievance.title;
        act.subtitle = `${grievance.portalName} • Ref #${grievance.referenceNumber}`;
        act.token = `Ref: ${grievance.referenceNumber}`;
        act.status = s.status;
        act.statusColor = s.statusColor;
        act.statusBg = s.statusBg;
        if (act.metadata) {
          act.metadata.referenceNumber = grievance.referenceNumber;
          act.metadata.category = grievance.category;
        }
      }
      saveToDisk('activities');
    } catch (e) {
      console.warn('Activity status sync note:', e.message);
    }

    saveToDisk('grievances');

    res.json({
      success: true,
      message: 'Complaint record updated successfully.',
      grievance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a complaint record
// @route   DELETE /api/grievances/:id
// @access  Private
const deleteGrievance = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { id } = req.params;

    let deleted = false;
    let refNum = '';

    if (isDbConnected()) {
      try {
        const found = await Grievance.findOneAndDelete({ _id: id, userId });
        if (found) {
          deleted = true;
          refNum = found.referenceNumber;
        }
      } catch (e) {
        deleted = false;
      }
    }

    const idx = memoryGrievances.findIndex(
      (g) => (g._id?.toString() || g.id?.toString()) === id.toString() && (g.userId?.toString() || g.userId) === userId
    );
    if (idx !== -1) {
      refNum = memoryGrievances[idx].referenceNumber;
      memoryGrievances.splice(idx, 1);
      deleted = true;
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found or not owned by you.',
      });
    }

    // Clean up activity entry
    if (refNum) {
      if (isDbConnected()) {
        try {
          await Activity.findOneAndDelete({ userId, 'metadata.referenceNumber': refNum });
        } catch (e) {}
      }
      const actIdx = memoryActivities.findIndex(
        (a) => (a.userId?.toString() || a.userId) === userId && a.metadata?.referenceNumber === refNum
      );
      if (actIdx !== -1) {
        memoryActivities.splice(actIdx, 1);
        saveToDisk('activities');
      }
    }

    saveToDisk('grievances');

    res.json({
      success: true,
      message: 'Grievance record removed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  evaluateGuidance,
  getGuidance,
  getGrievances,
  getGrievanceInsights,
  createGrievance,
  updateGrievance,
  deleteGrievance,
};

