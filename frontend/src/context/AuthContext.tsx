/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as authService from '@services/auth.service';
import { clearVendorDossierStorage } from '@/config/initialVendorDossier';
import { setAuthToken } from '@utils/axios';

export type UserRole =
  | 'visitor' // Unregistered visitor: Minimal public business information
  | 'unverified' // Logged-in, unverified user: Limited info & own registration dashboard
  | 'pending_approval' // GST-verified business awaiting approval: Limited access until review
  | 'approved_business' // Approved B2B business: Detailed permitted company & product info
  | 'premium_subscriber' // Premium B2B subscriber: Additional analytics, comparison & intelligence
  | 'admin' // Admin / Verification Officer
  | 'super_admin'; // Super Administrator

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  designation?: string;
  businessName: string;
  businessSlug?: string;
  cin: string;
  gstin: string;
  score: number;
  avatarInitials: string;
  role: UserRole;
  systemRole?: string;
  registrationProgress: number; // 25, 50, 75, 100%
  completedSteps: number[]; // [1], [1, 2], etc.
  submissionDate?: string;
  tierPlan?: 'Standard' | 'Premium';
}

// Pre-configured personas matching each tier
export const PERSONA_PROFILES: Record<UserRole, AuthUser | null> = {
  visitor: null,

  unverified: {
    id: 'usr_unverified_01',
    name: 'Kavita Rao',
    email: 'kavita@greenleafextracts.in',
    mobile: '+91 98450 12345',
    designation: 'Founder & Managing Partner',
    businessName: 'GreenLeaf Herbal Extracts LLP',
    businessSlug: 'greenleaf-herbal-extracts',
    cin: 'AAK-8921-LLP',
    gstin: 'Pending GSTIN Entry',
    score: 42,
    avatarInitials: 'KR',
    role: 'unverified',
    systemRole: 'vendor',
    registrationProgress: 17,
    completedSteps: [1],
    tierPlan: 'Standard',
  },

  pending_approval: {
    id: 'usr_pending_02',
    name: 'Vikram Shah',
    email: 'vikram@nexoracloud.com',
    mobile: '+91 97123 45678',
    designation: 'Director — Statutory Compliance',
    businessName: 'Nexora Cloud & Precision Systems Ltd',
    businessSlug: 'nexora-cloud-systems',
    cin: 'U72900MH2018PTC309821',
    gstin: '27AABCN9812M1ZF',
    score: 68,
    avatarInitials: 'VS',
    role: 'pending_approval',
    systemRole: 'vendor',
    registrationProgress: 83,  // 5 completed steps out of 6 ≈ 83%
    completedSteps: [1, 2, 3, 4, 5],
    submissionDate: '28 Oct 2026',
    tierPlan: 'Standard',
  },

  approved_business: {
    id: 'usr_meridian_01',
    name: 'Rajesh Mehta',
    email: 'vendor@meridiansteel.com',
    mobile: '+91 98201 44521',
    designation: 'Managing Director & Authorized Signatory',
    businessName: 'Meridian Steel Works Ltd',
    businessSlug: 'meridian-steel-works',
    cin: 'U27100PN2003PTC148921',
    gstin: '27AABCM8291Q1Z4',
    score: 89,
    avatarInitials: 'RM',
    role: 'approved_business',
    systemRole: 'vendor',
    registrationProgress: 100,
    completedSteps: [1, 2, 3, 4, 5, 6],
    tierPlan: 'Standard',
  },

  premium_subscriber: {
    id: 'usr_apex_premium_03',
    name: 'Anita Desai',
    email: 'a.desai@apexlogistics.in',
    mobile: '+91 98330 98765',
    designation: 'Chief Procurement & Commercial Officer',
    businessName: 'Apex Global Logistics & Infra Ltd',
    businessSlug: 'apex-global-logistics',
    cin: 'L60200MH1998PLC112345',
    gstin: '27AAACA4512N1ZQ',
    score: 96,
    avatarInitials: 'AD',
    role: 'premium_subscriber',
    systemRole: 'vendor',
    registrationProgress: 100,
    completedSteps: [1, 2, 3, 4, 5, 6],
    tierPlan: 'Premium',
  },

  admin: {
    id: 'usr_admin_01',
    name: 'Admin Verification Officer',
    email: 'admin@bitaintel.com',
    mobile: '+91 98000 00001',
    designation: 'Verification Officer & Auditor',
    businessName: 'BITAINTEL Verification Operations',
    cin: 'BITAINTEL-SYS',
    gstin: '27AAACB0000A1Z5',
    score: 100,
    avatarInitials: 'AO',
    role: 'admin',
    systemRole: 'admin',
    registrationProgress: 100,
    completedSteps: [1, 2, 3, 4, 5, 6],
    tierPlan: 'Premium',
  },

  super_admin: {
    id: 'usr_superadmin_01',
    name: 'Chief Compliance Director',
    email: 'superadmin@bitaintel.com',
    mobile: '+91 98000 00000',
    designation: 'Super Administrator',
    businessName: 'BITAINTEL Operations Headquarters',
    cin: 'BITAINTEL-HQ',
    gstin: '27AAACB0000A1Z5',
    score: 100,
    avatarInitials: 'SA',
    role: 'super_admin',
    systemRole: 'super_admin',
    registrationProgress: 100,
    completedSteps: [1, 2, 3, 4, 5, 6],
    tierPlan: 'Premium',
  },
};

export function mapBackendUser(bUser: any): AuthUser {
  const isSuperAdmin = bUser?.role === 'super_admin';
  const isAdmin = bUser?.role === 'admin' || bUser?.role === 'verification_officer';

  // Backend emits mixed-case statuses ("Verified", "registered", "Under Review"),
  // so normalize before mapping the lifecycle role.
  const verificationStatus = String(bUser?.business?.verificationStatus || '')
    .trim()
    .toLowerCase();
  const isApproved = verificationStatus === 'approved' || verificationStatus === 'verified';
  const isPendingApproval =
    verificationStatus === 'pending_verification' ||
    verificationStatus === 'pending' ||
    verificationStatus === 'under review';

  let mappedRole: UserRole = 'unverified';
  if (isSuperAdmin) {
    mappedRole = 'super_admin';
  } else if (isAdmin) {
    mappedRole = 'admin';
  } else if (isApproved) {
    mappedRole = 'approved_business';
  } else if (isPendingApproval) {
    mappedRole = 'pending_approval';
  } else {
    mappedRole = 'unverified';
  }

  // Determine progress and completed steps based on verification status
  let registrationProgress: number;
  let completedSteps: number[];

  if (isSuperAdmin || isAdmin || isApproved || isPendingApproval) {
    // Admins and any submitted vendor (pending / under review / approved) have a complete dossier.
    registrationProgress = 100;
    completedSteps = [1, 2, 3, 4, 5, 6];
  } else if (verificationStatus === 'registered') {
    registrationProgress = 25;
    completedSteps = [1];
  } else {
    // Unknown/new account: minimal progress
    registrationProgress = 17;
    completedSteps = [1];
  }

  return {
    id: String(bUser?.id || Date.now()),
    name: bUser?.fullName || 'User',
    email: bUser?.email || '',
    mobile: bUser?.mobile || '',
    designation:
      bUser?.designation ||
      (isAdmin || isSuperAdmin ? 'Verification Officer & Auditor' : 'Authorized Signatory'),
    businessName:
      bUser?.business?.legalName ||
      bUser?.business?.name ||
      bUser?.companyName ||
      (isAdmin || isSuperAdmin ? 'BITAINTEL Operations' : 'Business Entity'),
    businessSlug: bUser?.business?.slug || undefined,
    cin: bUser?.business?.cin || 'Pending Registration',
    gstin: bUser?.business?.gstin || 'Pending GSTIN',
    score: Number(bUser?.business?.score || (isAdmin || isSuperAdmin ? 100 : 0)),
    avatarInitials:
      (bUser?.fullName?.charAt(0) || 'U').toUpperCase() +
      (bUser?.companyName?.charAt(0) || 'B').toUpperCase(),
    role: mappedRole,
    systemRole: bUser?.role || 'vendor',
    registrationProgress,
    completedSteps,
    tierPlan: isAdmin || isSuperAdmin ? 'Premium' : 'Standard',
  };
}

export const DEMO_VENDOR: AuthUser = PERSONA_PROFILES.approved_business!;

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMounted: boolean;
  login: (email: string, password?: string) => Promise<AuthUser | null>;
  loginWithOtp: (identifier: string, otp: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  registerStep1: (data: {
    authorizedName: string;
    designation: string;
    email: string;
    mobile: string;
    companyName: string;
    password?: string;
  }) => Promise<void>;
  updateRegistrationProgress: (progress: number, completedStep?: number, newRole?: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRoleState] = useState<UserRole>('visitor');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Bootstrap user session from Express Backend (HttpOnly JWT Cookie / Session Token)
    authService
      .getMe()
      .then((res: any) => {
        if (res?.data?.isAuthenticated && res?.data?.user) {
          const mappedUser = mapBackendUser(res.data.user);
          setUser(mappedUser);
          setRoleState(mappedUser.role);
        } else {
          setUser(null);
          setRoleState('visitor');
        }
      })
      .catch(() => {
        // Backend not reachable or unauthorized (401)
        setUser(null);
        setRoleState('visitor');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    const persona = PERSONA_PROFILES[newRole];
    setUser(persona);

    const roleLabels: Record<UserRole, string> = {
      visitor: 'Unregistered Visitor (Minimal Info)',
      unverified: 'Logged-in, Unverified User (Step 1 Complete)',
      pending_approval: 'GST-Verified Awaiting Approval',
      approved_business: 'Approved B2B Business',
      premium_subscriber: 'Premium B2B Subscriber',
      admin: 'BITAINTEL Verification Officer',
      super_admin: 'Super Administrator',
    };

    toast.info(`Switched Active Persona: ${roleLabels[newRole]}`, {
      description: 'Permissions and views across the platform have updated.',
    });
  };

  const login = async (email: string, password?: string): Promise<AuthUser | null> => {
    if (password) {
      // Real backend authentication (Sets HttpOnly JWT Cookie in browser + returns Bearer token)
      const res: any = await authService.login({ email, password });
      const bUser = res?.data?.user || res?.user;
      const token = res?.data?.token || res?.token;
      if (token) setAuthToken(token);

      const authUser = mapBackendUser(bUser);
      setUser(authUser);
      setRoleState(authUser.role);
      return authUser;
    }

    // Password is mandatory for the password-grant flow. OTP sign-in is handled by loginWithOtp().
    return null;
  };

  // OTP-based sign in: verify the code server-side, then create the same
  // HttpOnly-cookie + Bearer session used by password login.
  const loginWithOtp = async (identifier: string, otp: string): Promise<AuthUser | null> => {
    const res = await authService.loginWithOtp({ identifier, otp });
    const bUser = res?.data?.user || res?.user;
    const token = res?.data?.token || res?.token;
    if (token) setAuthToken(token);

    if (!bUser) {
      return null;
    }

    const authUser = mapBackendUser(bUser);
    setUser(authUser);
    setRoleState(authUser.role);
    return authUser;
  };

  // 1-step sign up & backend account creation
  const registerStep1 = async (data: {
    authorizedName: string;
    designation: string;
    email: string;
    mobile: string;
    companyName: string;
    password?: string;
  }) => {
    if (data.password) {
      // Real backend registration
      const res: any = await authService.register({
        companyName: data.companyName,
        fullName: data.authorizedName,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        designation: data.designation,
      });

      const token = res?.data?.token || res?.token;
      if (token) setAuthToken(token);

      // ✅ Backend se aaye business entity data ko properly read karo
      const bUser = res?.data?.user || res?.user;
      const bBusiness = bUser?.business;
      const newUser: AuthUser = {
        id: String(bUser?.id || Date.now()),
        name: bUser?.fullName || data.authorizedName,
        designation: bUser?.designation || data.designation,
        email: bUser?.email || data.email,
        mobile: bUser?.mobile || data.mobile,
        // ✅ DB mein jo businessName save hua woh show hoga (legalName → name → fallback)
        businessName: bBusiness?.legalName || bBusiness?.name || data.companyName,
        businessSlug: bBusiness?.slug || undefined,
        cin: bBusiness?.cin || 'Pending Registration',
        gstin: bBusiness?.gstin || 'Pending GSTIN',
        score: Number(bBusiness?.score || 0),
        avatarInitials: (data.authorizedName.charAt(0) + (data.companyName.charAt(0) || 'B')).toUpperCase(),
        // ✅ Backend response ke business.verificationStatus se role decide hoga
        role: bBusiness?.verificationStatus === 'registered' ? 'unverified' : 'unverified',
        systemRole: bUser?.role || 'vendor',
        registrationProgress: 25,
        completedSteps: [1],
        tierPlan: 'Standard',
      };

      setUser(newUser);
      setRoleState('unverified');
      return;
    }

    // Local state fallback
    const newUser: AuthUser = {
      id: `usr_new_${Date.now().toString().slice(-6)}`,
      name: data.authorizedName,
      designation: data.designation,
      email: data.email,
      mobile: data.mobile,
      businessName: data.companyName,
      cin: 'Pending Registration',
      gstin: 'Pending GSTIN',
      score: 40,
      avatarInitials: (data.authorizedName.charAt(0) + (data.companyName.charAt(0) || 'B')).toUpperCase(),
      role: 'unverified',
      registrationProgress: 25,
      completedSteps: [1],
      tierPlan: 'Standard',
    };

    setUser(newUser);
    setRoleState('unverified');
  };

  const updateRegistrationProgress = (progress: number, completedStep?: number, newRole?: UserRole) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedSteps = completedStep && !prev.completedSteps.includes(completedStep)
        ? [...prev.completedSteps, completedStep]
        : prev.completedSteps;
      const updated: AuthUser = {
        ...prev,
        registrationProgress: progress,
        completedSteps: updatedSteps,
        role: newRole || prev.role,
      };
      if (newRole) {
        setRoleState(newRole);
      }
      return updated;
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if network fails, clear local credentials
    }
    setAuthToken(null);
    setUser(null);
    setRoleState('visitor');
    if (typeof window !== 'undefined') {
      clearVendorDossierStorage();
    }
    toast.info('Signed Out', {
      description: 'You are now browsing as an Unregistered Visitor.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user && role !== 'visitor',
        isLoading,
        isMounted: mounted,
        login,
        loginWithOtp,
        logout,
        setRole,
        registerStep1,
        updateRegistrationProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
