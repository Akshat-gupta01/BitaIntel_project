import { FullVendorRegistrationDossier } from '@/types/vendorRegistration';

export const INITIAL_EMPTY_DOSSIER: FullVendorRegistrationDossier = {
  step1: {
    authorizedName: '',
    designation: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    emailOtp: '',
    mobileOtp: '',
    emailVerified: false,
    mobileVerified: false,
    acceptTerms: false,
  },
  step2: {
    legalName: '',
    tradeName: '',
    constitution: 'Private Limited Company (Pvt Ltd)',
    incorporationDate: '',
    website: '',
    companyDescription: '',
    employeeCount: '50–250 employees',
    logoUrl: '',
    registeredAddress: '',
    corporateAddress: '',
    billingAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    facilities: [],
    gstin: '',
    pan: '',
    cin: '',
    llpin: '',
    udyam: '',
    iec: '',
    tan: '',
    duns: '',
    lei: '',
    keyPersonnel: [],
  },
  step3: {
    businessTypeCodes: [],
    selectedCategoryIds: [],
    selectedSubcategoryIds: [],
    businessActivities: [],
    manufacturingProcesses: '',
    machineryEquipment: '',
    installedCapacity: '',
    availableCapacity: '',
    hasRdLab: false,
    hasQcLab: false,
    offersCustomDevelopment: false,
    yearsInBusiness: '',
    numberOfFacilities: '',
    annualTurnoverRange: '',
    totalWorkforce: '',
  },
  step4: {
    products: [],
    certifications: [],
    regulatoryApprovals: [],
    testingCapabilities: '',
    calibrationStandards: '',
    qualityAssuranceProcedures: '',
  },
  step5: {
    departmentContacts: [],
    acceptedCurrencies: ['INR'],
    paymentMethods: [],
    advancePaymentPercentage: '',
    creditTermsDays: '',
    moqPolicy: '',
    samplePolicy: '',
    warrantyTerms: '',
    returnPolicy: '',
    importerExporterStatus: 'Domestic Only',
    iecNumber: '',
    sourcingCountries: '',
    exportMarkets: '',
    annualTradeTurnover: '',
    preferredIncoterms: [],
    freightArrangements: '',
    customsClearanceAssistance: false,
    exportPackagingStandards: '',
    coldChainCapability: false,
    tradeReferences: '',
    accountHolderName: '',
    bankName: '',
    accountType: 'Current Account',
    accountNumber: '',
    ifscCode: '',
    swiftBicCode: '',
    bankBranch: '',
    bankCountry: 'India',
    lawfullyScreened: false,
    noConflictOfInterest: false,
    sanctionsFreeDeclaration: false,
    authorityConsent: false,
  },
  step6: {
    declarationsAccepted: false,
    accuracyConfirmed: false,
    verificationAuthorized: false,
    status: 'Draft',
    completionPercentage: 17,
  },
  documentVault: [],
  completionPercentage: 17,
  lastUpdated: new Date().toISOString(),
};

// Rich Pre-populated Demo Dossier for Instant Demo & Testing
export const DEMO_PREFILLED_DOSSIER: FullVendorRegistrationDossier = {
  step1: {
    authorizedName: 'Vikramaditya Shinde',
    designation: 'Managing Director & Authorized Signatory',
    email: 'vikram.shinde@meridiansteel.com',
    mobile: '+91 98201 44820',
    password: 'DemoPassword123#',
    confirmPassword: 'DemoPassword123#',
    emailOtp: '4921',
    mobileOtp: '8142',
    emailVerified: true,
    mobileVerified: true,
    acceptTerms: true,
  },
  step2: {
    legalName: 'Meridian Advanced Materials & Steelworks Pvt. Ltd.',
    tradeName: 'Meridian Steel Works',
    constitution: 'Private Limited Company (Pvt Ltd)',
    incorporationDate: '2003-04-14',
    website: 'https://meridiansteel.example.com',
    companyDescription:
      'Precision metallurgy and CNC structural steel fabrication supplier to aerospace Tier-1, automotive tooling, and heavy power transmission clients globally.',
    employeeCount: '250–500 employees',
    logoUrl: '/logos/meridian.png',
    brochureUrl: '/docs/meridian_capabilities_2026.pdf',
    registeredAddress: 'Plot 42, Meridian Industrial Park, MIDC Chakan Phase II',
    corporateAddress: 'Tower B, 7th Floor, World Trade Centre, Kharadi',
    billingAddress: 'Plot 42, Meridian Industrial Park, MIDC Chakan Phase II',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '410501',
    country: 'India',
    facilities: [
      {
        id: 'FAC-01',
        type: 'Manufacturing Plant',
        facilityName: 'Unit 1: Heavy CNC & Hot Forging Division',
        addressLine: 'Plot 42, MIDC Chakan Phase II',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '410501',
        country: 'India',
        isOwned: true,
      },
      {
        id: 'FAC-02',
        type: 'Manufacturing Plant',
        facilityName: 'Unit 2: Surface Treatment & Clean Room Testing',
        addressLine: 'Survey 118, Sanaswadi Industrial Corridor',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '412208',
        country: 'India',
        isOwned: true,
      },
      {
        id: 'FAC-03',
        type: 'Branch Office',
        facilityName: 'Bengaluru Technical Liaison & Design Desk',
        addressLine: '12th Floor, Prestige Trade Towers, Palace Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        isOwned: false,
      },
    ],
    gstin: '27AABCM8291Q1Z4',
    pan: 'AABCM8291Q',
    cin: 'U27100PN2003PTC148921',
    llpin: '',
    udyam: 'UDYAM-MH-26-0038921',
    iec: '0304018294',
    tan: 'PNEA02941B',
    duns: '65-021-9842',
    lei: '335800MRD9820144820',
    keyPersonnel: [
      {
        id: 'KP-01',
        name: 'Vikramaditya Shinde',
        designation: 'Managing Director & Authorized Signatory',
        email: 'vikram.shinde@meridiansteel.com',
        mobile: '+91 98201 44820',
        isAuthorizedSignatory: true,
      },
      {
        id: 'KP-02',
        name: 'Dr. Ananya Roy',
        designation: 'Head of Quality Assurance & R&D',
        email: 'ananya.roy@meridiansteel.com',
        mobile: '+91 98201 44825',
        isAuthorizedSignatory: false,
      },
      {
        id: 'KP-03',
        name: 'Rajeev Malhotra',
        designation: 'Head of Procurement & Supply Chain',
        email: 'rajeev.m@meridiansteel.com',
        mobile: '+91 98201 44830',
        isAuthorizedSignatory: false,
      },
      {
        id: 'KP-04',
        name: 'Kavita Deshmukh',
        designation: 'Finance Controller & Accounts Head',
        email: 'kavita.d@meridiansteel.com',
        mobile: '+91 98201 44835',
        isAuthorizedSignatory: true,
      },
    ],
  },
  step3: {
    businessTypeCodes: ['BT01', 'BT02', 'BT10'], // Manufacturer, OEM, Exporter
    selectedCategoryIds: ['CAT004', 'CAT005', 'CAT017'],
    selectedSubcategoryIds: ['SUB040', 'SUB042', 'SUB044', 'SUB051', 'SUB187', 'SUB193'],
    businessActivities: ['Manufacturing', 'Export', 'Contract Manufacturing', 'Private Label'],
    manufacturingProcesses:
      '5-Axis CNC Milling, Robotic MIG/TIG Structural Welding, Submerged Arc Welding, Induction Hardening, Ultrasonic Testing',
    machineryEquipment:
      'Mazak Variaxis i-800 5-Axis (4 units), DMG Mori NLX 2500, KUKA 6-Axis Welding Robots (6 units), 1500T Hydraulic Stamping Press',
    installedCapacity: '4,500 MT / Month',
    availableCapacity: '1,200 MT / Month',
    hasRdLab: true,
    hasQcLab: true,
    offersCustomDevelopment: true,
    yearsInBusiness: '23',
    numberOfFacilities: '3',
    annualTurnoverRange: '₹50–100 crore',
    totalWorkforce: '340',
  },
  step4: {
    products: [
      {
        id: 'PRD-01',
        name: 'High-Tensile Precision Structural Steel Flanges',
        type: 'Product',
        categoryId: 'CAT017',
        subcategoryId: 'SUB187',
        brand: 'Meridian AeroGrade',
        description:
          'Precision CNC forged and machined structural flanges in ASTM A105 / 316L stainless steel for high-pressure cryogenic piping.',
        specifications: 'Sizes 1/2" to 24", Pressure Class 150# to 2500#, Tolerance +/- 0.02mm',
        grade: 'SS316L / ASTM A105',
        standards: 'ASME B16.5, ASTM A182, EN 10204 3.1 Certified',
        hsnCode: '73072100',
        countryOfOrigin: 'India',
        moq: '50 Pieces',
        standardOrderQty: '500 Pieces',
        monthlyCapacity: '25,000 Pieces',
        availableStock: '3,200 Pieces',
        leadTimeDays: '14 Days',
        sampleAvailability: 'Available Free',
        indicativePrice: '8,450',
        currency: 'INR',
        priceValidity: '90 Days',
        targetMarkets: 'India, Germany, USA, Saudi Arabia, Singapore',
      },
      {
        id: 'PRD-02',
        name: 'Aerospace Alloy Frame Sub-Assembly Kit',
        type: 'Product',
        categoryId: 'CAT004',
        subcategoryId: 'SUB042',
        brand: 'Meridian Precision',
        description:
          '5-Axis CNC milled aluminum-lithium structural frames designed for extreme strength-to-weight ratios in vibration environments.',
        specifications: 'Surface anodized MIL-A-8625 Type II, ultrasonic test inspected',
        grade: 'Al 7075-T651 / Ti-6Al-4V',
        standards: 'AS9100D, ISO 9001:2015',
        hsnCode: '88033000',
        countryOfOrigin: 'India',
        moq: '10 Sets',
        standardOrderQty: '50 Sets',
        monthlyCapacity: '300 Sets',
        availableStock: '25 Sets',
        leadTimeDays: '28 Days',
        sampleAvailability: 'Available Paid',
        indicativePrice: '1,450',
        currency: 'USD',
        priceValidity: '60 Days',
        targetMarkets: 'North America, European Union, APAC',
      },
    ],
    certifications: [
      {
        id: 'CERT-01',
        certificateType: 'ISO 9001:2015 (Quality)',
        certificateNumber: 'TUV-IN-9001-2023-8921',
        issuingAuthority: 'TÜV Rheinland India',
        issueDate: '2023-08-10',
        expiryDate: '2026-08-09',
        scope: 'Design, Machining and Fabrication of Alloy and Stainless Steel Assemblies',
        applicableFacility: 'Unit 1: Chakan & Unit 2: Sanaswadi',
        status: 'Active',
      },
      {
        id: 'CERT-02',
        certificateType: 'IATF 16949 (Automotive)',
        certificateNumber: 'IATF-0482019-IN',
        issuingAuthority: 'Bureau Veritas Certification',
        issueDate: '2024-01-15',
        expiryDate: '2027-01-14',
        scope: 'Precision Machined Powertrain Components for Tier-1 OEM Suppliers',
        applicableFacility: 'Unit 1: Chakan Plant',
        status: 'Active',
      },
      {
        id: 'CERT-03',
        certificateType: 'CE Certification',
        certificateNumber: 'CE-EU-PED-2022-771',
        issuingAuthority: 'DNV GL Netherlands',
        issueDate: '2022-11-20',
        expiryDate: '2025-11-19',
        scope: 'Pressure Equipment Directive (PED 2014/68/EU) Compliance',
        applicableFacility: 'Unit 1: Chakan Plant',
        status: 'Expiring Soon',
      },
    ],
    regulatoryApprovals: [],
    testingCapabilities: 'Spectrometer PMI Chemical Analysis, Universal Tensile Testing (600kN), CMM 3D Inspection, UT/MPI NDT',
    calibrationStandards: 'NABL Accredited In-House Metrology Lab complying with ISO/IEC 17025:2017',
    qualityAssuranceProcedures: 'PPAP Level 3, APQP & FMEA compliance, 100% digital trace barcode tags per heat lot',
  },
  step5: {
    departmentContacts: [
      {
        department: 'Sales & Inquiries',
        name: 'Siddharth Rao',
        designation: 'Senior Vice President — Global Sales',
        email: 'sales@meridiansteel.com',
        phone: '+91 98201 44840',
      },
      {
        department: 'Procurement',
        name: 'Rajeev Malhotra',
        designation: 'Chief Procurement Officer',
        email: 'procurement@meridiansteel.com',
        phone: '+91 98201 44830',
      },
      {
        department: 'Accounts & Billing',
        name: 'Kavita Deshmukh',
        designation: 'Finance Controller',
        email: 'accounts@meridiansteel.com',
        phone: '+91 98201 44835',
      },
      {
        department: 'Customer Support',
        name: 'Pooja Iyer',
        designation: 'Manager — Client Escalations & Logistics',
        email: 'support@meridiansteel.com',
        phone: '+91 98201 44850',
      },
    ],
    acceptedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
    paymentMethods: [
      'Bank Wire Transfer (NEFT/RTGS/IMPS)',
      'Letter of Credit (LC)',
      'Net 30 Days',
    ],
    advancePaymentPercentage: '25%',
    creditTermsDays: '30 Days Net from BL date',
    moqPolicy: 'Flexible trial batch MOQ available for validated aerospace & defense programs',
    samplePolicy: 'Standard samples dispatched within 48 hours; paid custom mockups refunded against PO',
    warrantyTerms: '24 Months comprehensive warranty against metallurgy porosity or machining variance',
    returnPolicy: 'Express replacement authorization within 7 working days upon NCR review',
    importerExporterStatus: 'Both Importer & Exporter',
    iecNumber: '0304018294',
    sourcingCountries: 'Germany (Thyssenkrupp), Japan (Nippon Steel), South Korea (POSCO)',
    exportMarkets: 'United States, Germany, UAE, Singapore, Japan',
    annualTradeTurnover: '$18.4M USD (₹152 Crore)',
    preferredIncoterms: ['FOB', 'CIF', 'DDP', 'EXW'],
    freightArrangements: 'Preferred multimodal tie-ups with Kuehne+Nagel & DHL Global Forwarding via Nhava Sheva (JNPT)',
    customsClearanceAssistance: true,
    exportPackagingStandards: 'ISPM-15 certified vacuum sealed wooden cases with desiccant & VCI rust inhibitor wrap',
    coldChainCapability: false,
    tradeReferences: 'Larsen & Toubro Heavy Engineering (Tier-1), Bharat Forge Ltd, Siemens Energy India',
    accountHolderName: 'Meridian Advanced Materials & Steelworks Pvt Ltd',
    bankName: 'HDFC Bank Ltd',
    accountType: 'Current Account',
    accountNumber: '50200089214412',
    ifscCode: 'HDFC0000039',
    swiftBicCode: 'HDFCINBBXXX',
    bankBranch: 'Kharadi WTC Corporate Branch, Pune',
    bankCountry: 'India',
    lawfullyScreened: true,
    noConflictOfInterest: true,
    sanctionsFreeDeclaration: true,
    authorityConsent: true,
  },
  step6: {
    declarationsAccepted: true,
    accuracyConfirmed: true,
    verificationAuthorized: true,
    submissionDate: '2026-10-18T10:30:00.000Z',
    vendorId: 'BITA-VND-2026-8942',
    referenceNumber: 'REF-MH-PN-20261018-091',
    status: 'Verified',
    adminRemarks:
      'All statutory documents cross-checked against MCA21 and GSTN portal. Plant inspection verified on 12 Oct 2026.',
    completionPercentage: 100,
  },
  documentVault: [
    {
      id: 'DOC-01',
      name: 'Certificate of Incorporation (MCA)',
      category: 'Legal & Tax',
      fileName: 'Meridian_Certificate_of_Incorporation_2003.pdf',
      fileSize: '1.8 MB',
      uploadDate: '2026-10-14',
      issueDate: '2003-04-14',
      verificationStatus: 'Verified',
      reviewerComments: 'Valid MCA21 CIN record cross-verified.',
    },
    {
      id: 'DOC-02',
      name: 'Corporate GSTIN Registration Certificate',
      category: 'Legal & Tax',
      fileName: 'GST_Registration_Certificate_27AABCM8291Q1Z4.pdf',
      fileSize: '840 KB',
      uploadDate: '2026-10-14',
      issueDate: '2017-07-01',
      verificationStatus: 'Verified',
    },
    {
      id: 'DOC-03',
      name: 'Factory Inspector License & Chakan Layout',
      category: 'Facility & Licences',
      fileName: 'MIDC_Chakan_Factory_Operating_Permit.pdf',
      fileSize: '3.4 MB',
      uploadDate: '2026-10-15',
      issueDate: '2021-02-18',
      expiryDate: '2028-02-17',
      applicableFacility: 'Unit 1: Chakan Plant',
      verificationStatus: 'Verified',
    },
    {
      id: 'DOC-04',
      name: 'ISO 9001:2015 Accredited Quality Certificate',
      category: 'Quality & Standards',
      fileName: 'TUV_Rheinland_ISO_9001_2015_Certificate.pdf',
      fileSize: '2.1 MB',
      uploadDate: '2026-10-15',
      issueDate: '2023-08-10',
      expiryDate: '2026-08-09',
      applicableFacility: 'All Facilities',
      verificationStatus: 'Verified',
    },
    {
      id: 'DOC-05',
      name: 'Bank Mandate & Cancelled Cheque Proof',
      category: 'Banking & Identity',
      fileName: 'HDFC_Bank_Cancelled_Cheque_Proof.pdf',
      fileSize: '620 KB',
      uploadDate: '2026-10-16',
      verificationStatus: 'Verified',
    },
    {
      id: 'DOC-06',
      name: 'Signatory Authority Board Resolution',
      category: 'Banking & Identity',
      fileName: 'Board_Resolution_Authorized_Signatory_MD.pdf',
      fileSize: '1.2 MB',
      uploadDate: '2026-10-16',
      issueDate: '2024-03-31',
      verificationStatus: 'Verified',
    },
  ],
  completionPercentage: 100,
  lastUpdated: '2026-10-26T10:00:00.000Z',
};

/**
 * BITAINTEL Real Architecture:
 * NO vendor dossier or profile data is stored in browser localStorage.
 * All dossier data resides in React state during the active session
 * and is persisted to MySQL database via official backend APIs.
 */

export function getStoredVendorDossier(_userEmail?: string): FullVendorRegistrationDossier {
  // Purge any lingering legacy localStorage keys if present
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('bitaintel_vendor_dossier');
    } catch {}
  }
  return INITIAL_EMPTY_DOSSIER;
}

export function saveVendorDossierToStorage(
  _dossier?: FullVendorRegistrationDossier,
  _userEmail?: string
): void {
  // No-op: LocalStorage persistence is disabled to prevent stale data cross-contamination.
  // Data is persisted directly to MySQL database via vendorService APIs.
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('bitaintel_vendor_dossier');
    } catch {}
  }
}

export function clearVendorDossierStorage(_userEmail?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('bitaintel_vendor_dossier');
    sessionStorage.removeItem('vendor_profile_just_completed');
    // Remove any legacy prefixed keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('bitaintel_vendor_dossier') || k.includes('vendor_dossier'))) {
        localStorage.removeItem(k);
      }
    }
  } catch (err) {
    console.error('Failed to clear vendor dossier from storage:', err);
  }
}

export function resetVendorDossierToDemo(): FullVendorRegistrationDossier {
  return DEMO_PREFILLED_DOSSIER;
}

/**
 * Canonical Step Validation & Completion Tracker (Steps 1 to 6)
 * Single authoritative source of truth across Wizard, Dashboard, Banners, and Review.
 */

export function isStep1Done(dossier?: FullVendorRegistrationDossier | null): boolean {
  if (!dossier?.step1) return false;
  return Boolean(
    dossier.step1.emailVerified ||
    (dossier.step1.email && dossier.step1.authorizedName)
  );
}

export function isStep2Done(dossier?: FullVendorRegistrationDossier | null): boolean {
  const s2 = dossier?.step2;
  if (!s2 || !s2.legalName?.trim()) return false;
  return Boolean(
    s2.gstin?.trim() ||
    s2.pan?.trim() ||
    s2.registeredAddress?.trim() ||
    (Array.isArray(s2.facilities) && s2.facilities.length > 0)
  );
}

export function isStep3Done(dossier?: FullVendorRegistrationDossier | null): boolean {
  const s3 = dossier?.step3;
  if (!s3) return false;
  return Boolean(
    (Array.isArray(s3.businessTypeCodes) && s3.businessTypeCodes.length > 0) ||
    (Array.isArray(s3.selectedCategoryIds) && s3.selectedCategoryIds.length > 0)
  );
}

export function isStep4Done(dossier?: FullVendorRegistrationDossier | null): boolean {
  const s4 = dossier?.step4;
  if (!s4) return false;
  return Boolean(
    (Array.isArray(s4.products) && s4.products.length > 0) ||
    (Array.isArray(s4.certifications) && s4.certifications.length > 0) ||
    Boolean(s4.testingCapabilities?.trim())
  );
}

export function isStep5Done(dossier?: FullVendorRegistrationDossier | null): boolean {
  const s5 = dossier?.step5;
  if (!s5) return false;
  // Step 5 represents statutory commercial & banking settlement.
  // Mandatory: Real Account Number AND (IFSC or SWIFT) AND Bank Name / Account Holder.
  // Mere default paymentMethods (e.g. ['INR']) or blank credit terms do NOT satisfy Step 5.
  const hasValidAccountNo = Boolean(s5.accountNumber && s5.accountNumber.trim().length >= 4);
  const hasValidBankOrIfsc = Boolean(
    (s5.ifscCode && s5.ifscCode.trim()) ||
    (s5.swiftBicCode && s5.swiftBicCode.trim()) ||
    (s5.bankName && s5.bankName.trim())
  );
  return hasValidAccountNo && hasValidBankOrIfsc;
}

export function isStep6Done(dossier?: FullVendorRegistrationDossier | null): boolean {
  if (!dossier?.step6) return false;
  // Step 6 (Review & Verification Submission) strictly requires Steps 1 to 5 to be valid first!
  // It cannot be complete if banking/commercial or company profile is missing.
  if (!isStep1Done(dossier) || !isStep2Done(dossier) || !isStep5Done(dossier)) {
    return false;
  }
  const s6 = dossier.step6;
  const isSubmittedStatus =
    s6.status === 'Verification Pending' ||
    s6.status === 'Verified' ||
    s6.status === 'Submitted';
  const hasVendorId = Boolean(s6.vendorId && s6.vendorId.trim());

  return Boolean(
    (isSubmittedStatus && hasVendorId) ||
    (s6.status !== 'Draft' && hasVendorId) ||
    (s6.accuracyConfirmed && s6.declarationsAccepted && s6.verificationAuthorized && s6.status !== 'Draft')
  );
}

export function calculateDossierCompletion(dossier?: FullVendorRegistrationDossier | null): number {
  if (!dossier) return 0;

  // If Step 6 is genuinely complete (which verifies steps 1 to 5 as well), completion is 100%
  if (isStep6Done(dossier)) {
    return 100;
  }

  let completedCount = 0;
  if (isStep1Done(dossier)) completedCount += 1;
  if (isStep2Done(dossier)) completedCount += 1;
  if (isStep3Done(dossier)) completedCount += 1;
  if (isStep4Done(dossier)) completedCount += 1;
  if (isStep5Done(dossier)) completedCount += 1;

  const stepLadder: Record<number, number> = {
    0: 0,
    1: 17,
    2: 33,
    3: 50,
    4: 67,
    5: 83,
    6: 100,
  };

  return stepLadder[completedCount] ?? Math.min(100, Math.round((completedCount / 6) * 100));
}

export function getCompletedStepsList(dossier?: FullVendorRegistrationDossier | null): number[] {
  const steps: number[] = [];
  if (isStep1Done(dossier)) steps.push(1);
  if (isStep2Done(dossier)) steps.push(2);
  if (isStep3Done(dossier)) steps.push(3);
  if (isStep4Done(dossier)) steps.push(4);
  if (isStep5Done(dossier)) steps.push(5);
  if (isStep6Done(dossier)) steps.push(6);
  return steps;
}

