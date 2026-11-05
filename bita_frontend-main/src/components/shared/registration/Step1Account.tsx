'use client';

import React, { useState } from 'react';
import { Step1AccountData } from '@/types/vendorRegistration';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Mail, Smartphone, Lock, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Step1AccountProps {
  data: Step1AccountData;
  onChange: (updated: Partial<Step1AccountData>) => void;
  onNext: () => void;
  onQuickFillDemo?: () => void;
}

export function Step1Account({ data, onChange, onNext, onQuickFillDemo }: Step1AccountProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [otpsDispatched, setOtpsDispatched] = useState(false);

  function handleSendDualOtps() {
    if (!data.authorizedName || !data.email || !data.mobile || !data.password) {
      toast.error('Missing Required Information', {
        description: 'Please complete your name, email, mobile number, and password first.',
      });
      return;
    }
    if (data.password.length < 8) {
      toast.error('Weak Password', {
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast.error('Password Mismatch', {
        description: 'Passwords do not match. Please re-enter carefully.',
      });
      return;
    }

    setOtpsDispatched(true);
    toast.success('Dual Verification Codes Dispatched', {
      description: `6-digit security codes sent to ${data.email} and SMS to ${data.mobile}`,
    });
  }

  function handleQuickVerify() {
    onChange({
      emailOtp: '4921',
      mobileOtp: '8142',
      emailVerified: true,
      mobileVerified: true,
    });
    toast.success('Dual Verification Successful', {
      description: 'Authorized corporate email & phone number verified.',
    });
  }

  function handleProceed() {
    if (!data.authorizedName.trim()) {
      toast.error('Please enter authorized person’s name.');
      return;
    }
    if (!data.designation.trim()) {
      toast.error('Please enter your official designation.');
      return;
    }
    if (!data.email.trim() || !data.email.includes('@')) {
      toast.error('Please enter a valid corporate email address.');
      return;
    }
    if (!data.mobile.trim() || data.mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!data.emailVerified || !data.mobileVerified) {
      toast.error('Verification Required', {
        description: 'Please verify both Email and Mobile OTPs before proceeding.',
      });
      return;
    }
    if (!data.acceptTerms) {
      toast.error('Terms Acceptance Required', {
        description: 'You must accept the BITAINTEL Terms of Service and Privacy Policy to register.',
      });
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
            Step 1 of 6
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Authorized Account Creation & Dual OTP
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create your primary signatory credentials. Both business email and phone are verified in-place.
          </p>
        </div>
        {onQuickFillDemo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onQuickFillDemo}
            className="text-xs shrink-0 border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <Sparkles className="size-3.5 mr-1.5 text-primary-600" />
            Fill Demo Data
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Authorized Person Name <span className="text-rose-500">*</span>
          </label>
          <Input
            value={data.authorizedName}
            onChange={(e) => onChange({ authorizedName: e.target.value })}
            placeholder="e.g. Vikramaditya Shinde"
            className="text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Official Designation <span className="text-rose-500">*</span>
          </label>
          <Input
            value={data.designation}
            onChange={(e) => onChange({ designation: e.target.value })}
            placeholder="e.g. Managing Director / Authorized Signatory"
            className="text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Official Corporate Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value, emailVerified: false })}
              placeholder="e.g. vikram@meridiansteel.com"
              className="pl-9 text-sm font-medium"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Used for official statutory notices and tender invitations
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Signatory Mobile Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              value={data.mobile}
              onChange={(e) => onChange({ mobile: e.target.value, mobileVerified: false })}
              placeholder="e.g. +91 98201 44820"
              className="pl-9 text-sm font-medium"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Direct SMS verification required for security
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Account Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
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

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={data.confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              placeholder="Re-type password"
              className="pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* In-Place Dual OTP Section */}
      <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">Signatory Multi-Channel Verification</h3>
          </div>
          {!otpsDispatched && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendDualOtps}
              className="text-xs bg-white text-primary-700 border-primary-300 hover:bg-primary-50 shadow-xs"
            >
              Send Verification OTPs
            </Button>
          )}
        </div>

        {otpsDispatched ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Codes dispatched to <strong className="text-slate-800">{data.email || 'corporate email'}</strong> and{' '}
              <strong className="text-slate-800">{data.mobile || 'mobile phone'}</strong>.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-primary-600" /> Email OTP
                  </span>
                  {data.emailVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="size-3" /> Verified
                    </span>
                  )}
                </div>
                <Input
                  value={data.emailOtp}
                  disabled={data.emailVerified}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({
                      emailOtp: val,
                      emailVerified: val === '4921' || val.length === 6,
                    });
                  }}
                  placeholder="Enter 4 or 6-digit code (e.g. 4921)"
                  className="text-xs font-mono"
                />
              </div>

              <div className="rounded-lg bg-white p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Smartphone className="size-3.5 text-primary-600" /> Mobile SMS OTP
                  </span>
                  {data.mobileVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="size-3" /> Verified
                    </span>
                  )}
                </div>
                <Input
                  value={data.mobileOtp}
                  disabled={data.mobileVerified}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({
                      mobileOtp: val,
                      mobileVerified: val === '8142' || val.length === 6,
                    });
                  }}
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
              {(!data.emailVerified || !data.mobileVerified) && (
                <button
                  type="button"
                  onClick={handleQuickVerify}
                  className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <UserCheck className="size-3.5" /> Auto-Verify for Testing
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Click &quot;Send Verification OTPs&quot; to authenticate your email and phone before moving to Stage 2.
          </p>
        )}
      </div>

      {/* Acceptance of Terms */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={data.acceptTerms}
            onChange={(e) => onChange({ acceptTerms: e.target.checked })}
            className="mt-0.5"
          />
          <div className="text-xs text-slate-600 leading-relaxed">
            I confirm that I am an authorized signatory with lawful authority to represent and bind this business
            entity. I accept the{' '}
            <a href="/demo/terms" target="_blank" className="font-semibold text-primary-700 hover:underline">
              BITAINTEL Terms of Service
            </a>
            ,{' '}
            <a href="/demo/privacy" target="_blank" className="font-semibold text-primary-700 hover:underline">
              Privacy Consent
            </a>
            , and agree to electronic verification of company statutory filings.
          </div>
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={handleProceed}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 shadow-sm"
        >
          Save & Continue to Company Profile
        </Button>
      </div>
    </div>
  );
}
