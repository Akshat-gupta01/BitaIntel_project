'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type UserRole =
  | 'visitor' // Unregistered visitor: Minimal public business information
  | 'unverified' // Logged-in, unverified user: Limited info & own registration dashboard
  | 'pending_approval' // GST-verified business awaiting approval: Limited access until review
  | 'approved_business' // Approved B2B business: Detailed permitted company & product info
  | 'premium_subscriber'; // Premium B2B subscriber: Additional analytics, comparison & intelligence

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  designation?: string;
  businessName: string;
  cin: string;
  gstin: string;
  score: number;
  avatarInitials: string;
  role: UserRole;
  registrationProgress: number; // 25, 50, 75, 100%
  completedSteps: number[]; // [1], [1, 2], etc.
  submissionDate?: string;
  tierPlan?: 'Standard' | 'Premium';
}

// 5 Pre-configured personas matching each tier
export const PERSONA_PROFILES: Record<UserRole, AuthUser | null> = {
  visitor: null,

  unverified: {
    id: 'usr_unverified_01',
    name: 'Kavita Rao',
    email: 'kavita@greenleafextracts.in',
    mobile: '+91 98450 12345',
    designation: 'Founder & Managing Partner',
    businessName: 'GreenLeaf Herbal Extracts LLP',
    cin: 'AAK-8921-LLP',
    gstin: 'Pending GSTIN Entry',
    score: 42,
    avatarInitials: 'KR',
    role: 'unverified',
    registrationProgress: 25,
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
    cin: 'U72900MH2018PTC309821',
    gstin: '27AABCN9812M1ZF',
    score: 68,
    avatarInitials: 'VS',
    role: 'pending_approval',
    registrationProgress: 85,
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
    cin: 'U27100PN2003PTC148921',
    gstin: '27AABCM8291Q1Z4',
    score: 89,
    avatarInitials: 'RM',
    role: 'approved_business',
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
    cin: 'L60200MH1998PLC112345',
    gstin: '27AAACA4512N1ZQ',
    score: 96,
    avatarInitials: 'AD',
    role: 'premium_subscriber',
    registrationProgress: 100,
    completedSteps: [1, 2, 3, 4, 5, 6],
    tierPlan: 'Premium',
  },
};

export const DEMO_VENDOR: AuthUser = PERSONA_PROFILES.approved_business!;

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isMounted: boolean;
  login: (email: string, businessName?: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  registerStep1: (data: {
    authorizedName: string;
    designation: string;
    email: string;
    mobile: string;
    companyName: string;
  }) => void;
  updateRegistrationProgress: (progress: number, completedStep?: number, newRole?: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bitaintel_vendor_auth_v2';
const ROLE_STORAGE_KEY = 'bitaintel_active_role_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(PERSONA_PROFILES.approved_business);
  const [role, setRoleState] = useState<UserRole>('approved_business');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedRole) {
      setRoleState(storedRole);
      if (storedRole === 'visitor') {
        setUser(null);
        return;
      }
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.role) setRoleState(parsed.role);
      } catch (e) {
        console.error('Failed to parse auth stored user', e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } else {
      // Default to approved_business persona for seamless first-load inspection
      setUser(PERSONA_PROFILES.approved_business);
      setRoleState('approved_business');
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    }

    const persona = PERSONA_PROFILES[newRole];
    setUser(persona);
    if (typeof window !== 'undefined') {
      if (persona) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persona));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    const roleLabels: Record<UserRole, string> = {
      visitor: 'Unregistered Visitor (Minimal Info)',
      unverified: 'Logged-in, Unverified User (Step 1 Complete)',
      pending_approval: 'GST-Verified Awaiting Approval',
      approved_business: 'Approved B2B Business',
      premium_subscriber: 'Premium B2B Subscriber',
    };

    toast.info(`Switched Active Persona: ${roleLabels[newRole]}`, {
      description: 'Permissions and views across the platform have updated.',
    });
  };

  const login = (email: string, businessName?: string) => {
    const newUser: AuthUser = {
      ...PERSONA_PROFILES.approved_business!,
      email: email || PERSONA_PROFILES.approved_business!.email,
      businessName: businessName || PERSONA_PROFILES.approved_business!.businessName,
      name:
        email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
        PERSONA_PROFILES.approved_business!.name,
      avatarInitials: (email.charAt(0) + 'V').toUpperCase(),
      role: 'approved_business',
    };
    setUser(newUser);
    setRoleState('approved_business');
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(ROLE_STORAGE_KEY, 'approved_business');
    }
  };

  // Instant 1-step sign up
  const registerStep1 = (data: {
    authorizedName: string;
    designation: string;
    email: string;
    mobile: string;
    companyName: string;
  }) => {
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(ROLE_STORAGE_KEY, 'unverified');
    }
  };

  const updateRegistrationProgress = (progress: number, completedStep?: number, newRole?: UserRole) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedSteps = completedStep && !prev.completedSteps.includes(completedStep)
        ? [...prev.completedSteps, completedStep]
        : prev.completedSteps;
      const updated: AuthUser = {
        ...prev,
        registrationProgress: Math.max(prev.registrationProgress, progress),
        completedSteps: updatedSteps,
        role: newRole || prev.role,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        if (newRole) {
          localStorage.setItem(ROLE_STORAGE_KEY, newRole);
          setRoleState(newRole);
        }
      }
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setRoleState('visitor');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.setItem(ROLE_STORAGE_KEY, 'visitor');
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
        isMounted: mounted,
        login,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
