'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import {
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  UserCheck,
  ArrowRight,
  Clock,
  Sparkle,
} from 'lucide-react';
import { toast } from 'sonner';
import { saveVendorDossierToStorage, INITIAL_EMPTY_DOSSIER } from '@/config/initialVendorDossier';

export function Step1QuickRegisterForm() {
  const router = useRouter();
  const { registerStep1 } = useAuth();

  const [formData, setFormData] = useState({
    authorizedName: '',
    designation: '',
    companyName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    emailOtp: '',
    mobileOtp: '',
    emailVerified: false,
    mobileVerified: false,
    acceptTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otpsDispatched, setOtpsDispatched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fill demo sample data for zero-friction evaluation
  function handleFillSample() {
    setFormData({
      authorizedName: 'Kavita Rao',
      designation: 'Managing Partner & Authorized Signatory',
      companyName: 'GreenLeaf Herbal Extracts & Organics LLP',
      email: 'kavita@greenleafextracts.in',
      mobile: '+91 98450 12345',
      password: 'SecurePassword2026@',
      confirmPassword: 'SecurePassword2026@',
      emailOtp: '4921',
      mobileOtp: '8142',
      emailVerified: true,
      mobileVerified: true,
      acceptTerms: true,
    });
    setOtpsDispatched(true);
    toast.success('Sample Enterprise Profile Loaded', {
      description: 'Prefilled with GreenLeaf Herbal Extracts & Organics LLP.',
    });
  }

  function handleSendDualOtps() {
    if (!formData.authorizedName || !formData.email || !formData.mobile || !formData.companyName) {
      toast.error('Missing Required Fields', {
        description: 'Please enter your company name, full name, email, and mobile number.',
      });
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      toast.error('Password Requirements', {
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords Do Not Match', {
        description: 'Please confirm password carefully.',
      });
      return;
    }

    setOtpsDispatched(true);
    toast.success('Verification Codes Sent', {
      description: `Security OTPs dispatched to ${formData.email} and ${formData.mobile}`,
    });
  }

  function handleAutoVerify() {
    setFormData((prev) => ({
      ...prev,
      emailOtp: '4921',
      mobileOtp: '8142',
      emailVerified: true,
      mobileVerified: true,
    }));
    toast.success('Dual Channel OTPs Verified', {
      description: 'Email and Mobile security verified for authorized signatory.',
    });
  }

  function handleSubmitAccount(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      toast.error('Please enter your Registered Legal Company Name.');
      return;
    }
    if (!formData.authorizedName.trim()) {
      toast.error('Please enter Authorized Signatory Name.');
      return;
    }
    if (!formData.designation.trim()) {
      toast.error('Please enter your Corporate Designation.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid Corporate Email.');
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      toast.error('Please enter a valid Signatory Mobile Number.');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!formData.acceptTerms) {
      toast.error('You must accept the Terms of Service to register.');
      return;
    }

    setIsSubmitting(true);

    // Register user in AuthContext with role: 'unverified'
    registerStep1({
      authorizedName: formData.authorizedName,
      designation: formData.designation,
      email: formData.email,
      mobile: formData.mobile,
      companyName: formData.companyName,
    });

    // Save initial dossier with Step 1 and company name pre-populated
    const initialDossier = {
      ...INITIAL_EMPTY_DOSSIER,
      step1: {
        authorizedName: formData.authorizedName,
        designation: formData.designation,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        emailOtp: formData.emailOtp || '4921',
        mobileOtp: formData.mobileOtp || '8142',
        emailVerified: true,
        mobileVerified: true,
        acceptTerms: true,
      },
      step2: {
        ...INITIAL_EMPTY_DOSSIER.step2,
        legalName: formData.companyName,
        tradeName: formData.companyName,
      },
      completionPercentage: 25,
      lastUpdated: new Date().toISOString(),
    };
    saveVendorDossierToStorage(initialDossier);

    toast.success('Account Created Successfully!', {
      description: `Welcome to BITAINTEL, ${formData.authorizedName}. Redirecting to your Vendor Dashboard...`,
    });

    setTimeout(() => {
      router.push('/demo/dashboard/vendor?welcome=true');
    }, 900);
  }

  return (
    <Card className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-9 shadow-xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Create Your Vendor Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register your enterprise to establish verified credibility and connect directly with corporate buyers.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFillSample}
          className="text-xs shrink-0 border-primary-300 text-primary-700 hover:bg-primary-50 h-8 font-bold"
        >
          <Sparkles className="size-3.5 mr-1.5 text-primary-600" />
          Fill Sample Data
        </Button>
      </div>

      <form onSubmit={handleSubmitAccount} className="space-y-5">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Registered Company / Entity Legal Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. GreenLeaf Herbal Extracts & Organics LLP"
              className="pl-9 text-sm font-semibold text-slate-900"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            As registered with MCA or State Commercial Tax Authority
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Authorized Person */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Authorized Representative Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={formData.authorizedName}
              onChange={(e) => setFormData({ ...formData, authorizedName: e.target.value })}
              placeholder="e.g. Kavita Rao"
              className="text-sm font-medium"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Corporate Designation <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Managing Partner / Director"
              className="text-sm font-medium"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Corporate Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value, emailVerified: false })}
                placeholder="e.g. kavita@greenleafextracts.in"
                className="pl-9 text-sm font-medium"
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Signatory Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value, mobileVerified: false })}
                placeholder="e.g. +91 98450 12345"
                className="pl-9 text-sm font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Create Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="pl-9 pr-9 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-type password"
                className="pl-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* In-Place Dual OTP Verification Block */}
        <div className="rounded-2xl border border-primary-200/80 bg-primary-50/50 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Signatory Identity Verification
              </h3>
            </div>
            {!otpsDispatched ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendDualOtps}
                className="text-xs bg-white text-primary-700 border-primary-300 hover:bg-primary-50 shadow-2xs h-7"
              >
                Send Verification OTPs
              </Button>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Codes Dispatched
              </span>
            )}
          </div>

          {otpsDispatched ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5 text-primary-600" /> Email OTP
                    </span>
                    {formData.emailVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <Input
                    value={formData.emailOtp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailOtp: e.target.value,
                        emailVerified: e.target.value === '4921' || e.target.value.length === 6,
                      })
                    }
                    placeholder="Enter 4-digit code (e.g. 4921)"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="size-3.5 text-primary-600" /> Mobile SMS OTP
                    </span>
                    {formData.mobileVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <Input
                    value={formData.mobileOtp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobileOtp: e.target.value,
                        mobileVerified: e.target.value === '8142' || e.target.value.length === 6,
                      })
                    }
                    placeholder="Enter SMS code (e.g. 8142)"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleSendDualOtps}
                  className="text-xs text-primary-700 font-semibold hover:underline"
                >
                  Resend codes
                </button>
                {(!formData.emailVerified || !formData.mobileVerified) && (
                  <button
                    type="button"
                    onClick={handleAutoVerify}
                    className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <UserCheck className="size-3.5" /> Auto-Verify for Demo
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              Click &quot;Send Verification OTPs&quot; or &quot;Fill Sample Data&quot; to verify your business email and mobile in seconds.
            </p>
          )}
        </div>

        {/* Terms acceptance */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              I certify that I am an authorized signatory representing{' '}
              <strong className="text-slate-900">{formData.companyName || 'this corporate entity'}</strong>.
              I agree to the BITAINTEL Terms of Service and electronic verification protocols.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 text-sm shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Creating Vendor Workspace...</span>
            ) : (
              <>
                <span>Create Vendor Account</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
          <p className="text-center text-xs text-slate-500 mt-3">
            Already registered on BITAINTEL?{' '}
            <a href="/demo/login" className="font-bold text-primary-700 hover:underline">
              Sign in to your dashboard
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}
