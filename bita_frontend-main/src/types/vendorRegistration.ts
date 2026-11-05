export type VendorRegistrationStatus =
  | 'Draft'
  | 'Verification Pending'
  | 'Submitted'
  | 'Under Review'
  | 'Additional Information Required'
  | 'Verified'
  | 'Rejected'
  | 'Suspended'
  | 'Renewal Required';

// Key Executive / Management Profile (Step 2)
export interface KeyPersonnel {
  id: string;
  name: string;
  designation: string; // e.g. Director, Marketing Head, Purchase Head, Accounts Head
  email: string;
  mobile: string;
  photoUrl?: string;
  isAuthorizedSignatory?: boolean;
}

// Additional Plant / Branch / Office Address (Step 2)
export interface FacilityAddress {
  id: string;
  type: 'Manufacturing Plant' | 'Branch Office' | 'Warehouse / R&D Unit' | 'Corporate Office';
  facilityName: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isOwned: boolean; // owned vs leased
}

// Step 1: Account Creation & Login
export interface Step1AccountData {
  authorizedName: string;
  designation: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  emailOtp: string;
  mobileOtp: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  acceptTerms: boolean;
}

// Step 2: Account & Company Profile
export interface Step2CompanyData {
  legalName: string;
  tradeName: string;
  constitution: string;
  incorporationDate: string;
  website: string;
  companyDescription: string;
  employeeCount: string;
  logoUrl?: string;
  brochureUrl?: string;

  // Registered & Billing Addresses
  registeredAddress: string;
  corporateAddress: string;
  billingAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  // Repeating Facilities/Plants
  facilities: FacilityAddress[];

  // Statutory Business Identity
  gstin: string;
  pan: string;
  cin: string;
  llpin: string;
  udyam: string;
  iec: string;
  tan: string;
  duns: string;
  lei: string;

  // Management & Key Personnel
  keyPersonnel: KeyPersonnel[];

  // Basic Documents
  incorporationDoc?: string;
  addressProofDoc?: string;
  taxRegistrationDoc?: string;
  signatoryAuthorizationDoc?: string;
}

// Step 3: Business Classification & Capabilities
export interface Step3BusinessData {
  businessTypeCodes: string[]; // BT01 - BT14
  selectedCategoryIds: string[]; // CAT001 - CAT020
  selectedSubcategoryIds: string[]; // SUB001 - SUB240
  businessActivities: string[]; // Manufacturing, Trading, etc.

  // Manufacturing Capabilities (Conditional)
  manufacturingProcesses?: string;
  machineryEquipment?: string;
  installedCapacity?: string;
  availableCapacity?: string;
  hasRdLab?: boolean;
  hasQcLab?: boolean;
  offersCustomDevelopment?: boolean;

  // Service Capabilities (Conditional)
  serviceTypes?: string;
  serviceExpertise?: string;
  geographicCoverage?: string;
  deliveryCapacity?: string;

  // Operating Profile
  yearsInBusiness: string;
  numberOfFacilities: string;
  annualTurnoverRange: string;
  totalWorkforce: string;

  // Facility Info
  manufacturingLicenceDoc?: string;
  facilityPhotos?: string[];
  technicalAuditDoc?: string;
}

// Product/Service Item in Step 4
export interface ProductCatalogItem {
  id: string;
  name: string;
  type: 'Product' | 'Service';
  categoryId: string;
  subcategoryId: string;
  brand: string;
  description: string;
  specifications: string;
  grade: string;
  standards: string;
  hsnCode: string;
  countryOfOrigin: string;

  // Supply & Commercial info
  moq: string;
  standardOrderQty: string;
  monthlyCapacity: string;
  availableStock: string;
  leadTimeDays: string;
  sampleAvailability: 'Available Free' | 'Available Paid' | 'Not Available';

  indicativePrice: string;
  currency: string;
  priceValidity: string;
  targetMarkets: string;

  // Files
  images?: string[];
  catalogueDoc?: string;
  technicalDataSheetDoc?: string;
  coaDoc?: string;
  sdsDoc?: string;
}

// Quality & Certification Records (Step 4)
export interface QualityCertificateRecord {
  id: string;
  certificateType: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  scope: string;
  applicableFacility: string;
  evidenceDoc?: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

// Regulatory Filing Details (e.g. Pharma)
export interface RegulatoryApproval {
  id: string;
  type: 'Manufacturing Licence (Form 25/28)' | 'DMF / USDMF' | 'CEP' | 'WHO Pre-qualification' | 'Other';
  filingNumber: string;
  authority: string;
  validUntil: string;
  documentFile?: string;
}

// Step 4: Products, Services & Quality
export interface Step4ProductsData {
  products: ProductCatalogItem[];
  certifications: QualityCertificateRecord[];
  regulatoryApprovals: RegulatoryApproval[];
  testingCapabilities: string;
  calibrationStandards: string;
  qualityAssuranceProcedures: string;
}

// Departmental Business Contact
export interface DepartmentContact {
  department: 'Sales & Inquiries' | 'Procurement' | 'Accounts & Billing' | 'Customer Support';
  name: string;
  designation: string;
  email: string;
  phone: string;
}

// Step 5: Commercial, Trade & Payment Details
export interface Step5CommercialData {
  departmentContacts: DepartmentContact[];

  // Commercial Terms
  acceptedCurrencies: string[];
  paymentMethods: string[];
  advancePaymentPercentage: string;
  creditTermsDays: string;
  moqPolicy: string;
  samplePolicy: string;
  warrantyTerms: string;
  returnPolicy: string;

  // Trade Operations
  importerExporterStatus: 'Exporter Only' | 'Importer Only' | 'Both Importer & Exporter' | 'Domestic Only';
  iecNumber: string;
  sourcingCountries: string;
  exportMarkets: string;
  annualTradeTurnover: string;

  // Logistics
  preferredIncoterms: string[];
  freightArrangements: string;
  customsClearanceAssistance: boolean;
  exportPackagingStandards: string;
  coldChainCapability: boolean;

  // References
  tradeReferences: string;

  // Banking Details
  accountHolderName: string;
  bankName: string;
  accountType: 'Current Account' | 'Cash Credit / Overdraft' | 'Foreign Currency Account';
  accountNumber: string;
  ifscCode: string;
  swiftBicCode: string;
  bankBranch: string;
  bankCountry: string;
  bankProofDoc?: string;

  // Due Diligence & Compliance
  lawfullyScreened: boolean;
  noConflictOfInterest: boolean;
  sanctionsFreeDeclaration: boolean;
  authorityConsent: boolean;
}

// Document Checklist Item (Step 6)
export interface DocumentVaultItem {
  id: string;
  name: string;
  category: 'Legal & Tax' | 'Facility & Licences' | 'Quality & Standards' | 'Banking & Identity';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  issueDate?: string;
  expiryDate?: string;
  applicableFacility?: string;
  verificationStatus: 'Verified' | 'Under Review' | 'Correction Required' | 'Pending Upload';
  reviewerComments?: string;
  downloadUrl?: string;
}

// Step 6: Review & Submission State
export interface Step6SubmissionData {
  declarationsAccepted: boolean;
  accuracyConfirmed: boolean;
  verificationAuthorized: boolean;
  submissionDate?: string;
  vendorId?: string;
  referenceNumber?: string;
  status: VendorRegistrationStatus;
  adminRemarks?: string;
  completionPercentage?: number;
}

// Complete Full Dossier
export interface FullVendorRegistrationDossier {
  step1: Step1AccountData;
  step2: Step2CompanyData;
  step3: Step3BusinessData;
  step4: Step4ProductsData;
  step5: Step5CommercialData;
  step6: Step6SubmissionData;
  documentVault: DocumentVaultItem[];
  completionPercentage: number;
  lastUpdated: string;
}
