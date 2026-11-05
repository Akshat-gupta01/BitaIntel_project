'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Smartphone,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'mobile'>('email');
  const [contactValue, setContactValue] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(45);

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (!contactValue) {
      const msg =
        recoveryMethod === 'email'
          ? 'Please enter your registered corporate email.'
          : 'Please enter your registered 10-digit mobile number.';
      setErrorMsg(msg);
      toast.error('Missing Contact Information', { description: msg });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setTimer(45);
      toast.success('Security Token Dispatched', {
        description: `A 4-digit verification code has been dispatched to ${contactValue}.`,
      });
    }, 600);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (otpCode.length < 4) {
      const msg = 'Please enter the 4-digit verification code.';
      setErrorMsg(msg);
      toast.error('Incomplete Code', { description: msg });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      toast.success('Token Verified Successfully', {
        description: 'Identity confirmed. Please choose a strong new password.',
      });
    }, 600);
  }

  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (!newPassword || newPassword.length < 8) {
      const msg = 'Password must be at least 8 characters with letters, numbers, and symbols.';
      setErrorMsg(msg);
      toast.error('Invalid Password', { description: msg });
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match. Please re-enter.';
      setErrorMsg(msg);
      toast.error('Password Mismatch', { description: msg });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setFinished(true);
      toast.success('Password Reset Successful', {
        description: 'Your enterprise credentials have been updated securely.',
      });
    }, 700);
  }

  const [finished, setFinished] = useState(false);

  if (finished) {
    return (
      <Card variant="bento" className="p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="mx-auto size-16 rounded-full bg-primary-100 text-primary-600 grid place-items-center shadow-inner">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Password Reset Successful
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Your enterprise credentials have been updated securely. You can now log into your designated business or auditor workspace with your new password.
        </p>

        <div className="pt-4">
          <Button
            variant="primary"
            href="/demo/login"
            className="w-full justify-center"
            rightIcon={<ArrowRight className="size-4" />}
          >
            Return to Sign In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="bento" className="p-6 sm:p-8 max-w-md mx-auto shadow-xl">
      {/* Step Indicators */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>STEP {step} OF 3</span>
          <span className="text-primary-700">
            {step === 1 && 'Identify Account'}
            {step === 2 && 'Enter 4-Digit OTP'}
            {step === 3 && 'Set New Password'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Input email/mobile */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Reset Your Password</h2>
            <p className="text-xs text-slate-500">
              Select recovery channel to receive your time-sensitive authentication token.
            </p>
          </div>

          {/* Toggle between Email and Mobile */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setRecoveryMethod('email');
                setContactValue('');
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                recoveryMethod === 'email'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="size-3.5" />
              <span>Official Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRecoveryMethod('mobile');
                setContactValue('');
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                recoveryMethod === 'mobile'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="size-3.5" />
              <span>Registered Mobile</span>
            </button>
          </div>

          {recoveryMethod === 'email' ? (
            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="e.g. rajesh@meridiansteel.com"
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              icon={<Mail className="size-4 text-slate-400" />}
              required
            />
          ) : (
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              icon={<Smartphone className="size-4 text-slate-400" />}
              required
            />
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              disabled={isLoading}
              rightIcon={<ArrowRight className="size-4" />}
            >
              {isLoading ? 'Transmitting OTP...' : 'Send Recovery OTP'}
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Verify Authorization Token</h2>
            <p className="text-xs text-slate-500">
              We dispatched a 4-digit security code to <strong className="text-slate-800">{contactValue}</strong>.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">One-Time Security Code</label>
            <input
              type="text"
              maxLength={4}
              placeholder="• • • •"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl border border-slate-200 bg-white shadow-2xs focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              autoFocus
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-primary-600" />
                Code expires in {timer}s
              </span>
              <button
                type="button"
                onClick={() => setTimer(45)}
                className="text-primary-700 font-bold hover:underline"
              >
                Resend Code
              </button>
            </div>
          </div>

          <div className="p-3 bg-primary-50/70 border border-primary-100 rounded-xl text-xs text-primary-800 flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-primary-600" />
            <span>Demo Mode: You can enter any 4 digits (e.g. <strong>4921</strong>) to test.</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              icon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 justify-center"
              disabled={isLoading}
              rightIcon={<ArrowRight className="size-4" />}
            >
              {isLoading ? 'Verifying...' : 'Verify Token'}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Set New Password</h2>
            <p className="text-xs text-slate-500">
              Choose a strong passphrase conforming to enterprise security standards.
            </p>
          </div>

          <Input
            label="New Corporate Password"
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock className="size-4 text-slate-400" />}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-type password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<KeyRound className="size-4 text-slate-400" />}
            required
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Complexity Policy:</p>
            <p>✓ Minimum 8 alphanumeric characters with mixed capitalization</p>
            <p>✓ At least 1 numerical digit and 1 special symbol (@, #, $, %)</p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              disabled={isLoading}
              rightIcon={<CheckCircle2 className="size-4" />}
            >
              {isLoading ? 'Updating Credentials...' : 'Save New Password & Sign In'}
            </Button>
          </div>
        </form>
      )}

      {/* Footer Link */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Remembered your password?{' '}
        <Link href="/demo/login" className="font-bold text-primary-700 hover:text-primary-900">
          Sign in here
        </Link>
      </div>
    </Card>
  );
}
