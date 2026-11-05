# Vendor Registration Journey

This document describes the vendor registration flow currently implemented in the BITAINTEL demo website, from account creation through dossier submission and the displayed verification states.

## Website Entry Points

- **Create an account:** `/demo/register`
- **Continue or resume vendor registration:** `/demo/dashboard/vendor`
- **Sign in to an existing account:** `/demo/login`

After creating an account, the vendor dashboard presents **Complete Profile Steps (Step 2 - 6)**. Selecting it opens the in-dashboard registration wizard. The dashboard is protected by the vendor role guard.

## Registration Steps

### Step 1: Authorized account and contact verification

The signup form collects the registered company or entity name, authorized representative, corporate designation and email, mobile number, password, and acceptance of the Terms of Service. It presents email and mobile OTP fields.

**Where:** `/demo/register`, implemented by [the registration page](../src/app/demo/register/page.tsx) and [the quick registration form](../src/components/shared/registration/Step1QuickRegisterForm.tsx).

**Result:** An account is created in an unverified state, with initial registration progress, and the user is directed to `/demo/dashboard/vendor`.

### Step 2: Company profile and statutory identity

The vendor supplies the legal and trade names, company constitution, statutory registration details such as GSTIN and PAN, registered office and facilities, key personnel, and foundational company documents.

**Where:** The dashboard wizard, labeled **Company Profile & GST**. Implemented in [Step 2](../src/components/shared/registration/Step2Company.tsx).

### Step 3: Business classification and capabilities

The vendor selects business types and industry categories/subcategories, describes business activities and operational capabilities, and provides scale information such as turnover. Some capability fields depend on the selected business classification.

**Where:** The dashboard wizard, labeled **Classification & Scope**. Implemented in [Step 3](../src/components/shared/registration/Step3Business.tsx).

### Step 4: Products, services, and quality

The vendor builds a product or service catalog with relevant specifications and commercial details, and records applicable quality certifications, ISO standards, and regulatory accreditations.

**Where:** The dashboard wizard, labeled **Products & ISO Standards**. Implemented in [Step 4](../src/components/shared/registration/Step4Products.tsx).

### Step 5: Commercial terms, trade, and banking

The vendor enters departmental contacts, payment and currency terms, trade information such as Incoterms, bank settlement details, and due-diligence declarations. Required bank fields and compliance declarations must be provided to continue.

**Where:** The dashboard wizard, labeled **Commercial & Banking**. Implemented in [Step 5](../src/components/shared/registration/Step5Commercial.tsx).

### Step 6: Review and submit

The vendor reviews the dossier and document checklist, confirms the required accuracy, authority, and privacy declarations, and submits the dossier for verification.

**Where:** The dashboard wizard, labeled **Review & Submit**. Implemented in [Step 6](../src/components/shared/registration/Step6Review.tsx).

**Result:** The submission handler generates a vendor ID and reference number, marks dossier completion as 100%, sets the dossier status to **Verification Pending**, changes the account to `pending_approval`, and returns to the dashboard. See [the onboarding wizard submission handler](../src/components/dashboard/vendor/OnboardingWizardModal.tsx).

## After Submission: Compliance Review

Compliance review is a status lifecycle after the six registration steps, not an additional registration form step. On `/demo/dashboard/vendor`, a pending vendor sees the dossier reference and a **Review Submitted Dossier** action. The status UI represents states including **Verification Pending**, **Submitted for Review**, **Under Compliance Review**, **Action Required**, **Verified & Active**, and rejected or suspended states.

The displayed verified state describes the business profile as active and visible to buyers. The related UI is implemented in [the vendor status banner](../src/components/dashboard/vendor/VendorStatusBanner.tsx) and [the onboarding banner](../src/components/dashboard/vendor/OnboardingBanner.tsx).

## Demo Behavior and Limitations

- OTP entry is a demo interaction; the website does not deliver or validate real email or SMS OTPs.
- Registration and dossier data are stored in browser `localStorage`; submission does not call a live verification service.
- Submitting the dossier makes it **complete and pending review**, not verified or approved.
- Dashboard controls can simulate approval and other states. The displayed GST, company, audit, and approval outcomes should not be treated as results from live government or compliance checks.