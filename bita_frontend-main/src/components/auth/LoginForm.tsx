'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Smartphone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth, DEMO_VENDOR } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login } = useAuth();

  // Identifier type: 'email' or 'phone'
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  // Login method: 'password' or 'otp'
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTargetChannel, setOtpTargetChannel] = useState<'email' | 'phone'>('email');
  const [timer, setTimer] = useState(45);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Password Sign In (Using either email or phone number)
  function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier) {
      const msg =
        identifierType === 'email'
          ? 'Please enter your registered corporate email.'
          : 'Please enter your registered 10-digit mobile number.';
      setErrorMsg(msg);
      toast.error('Missing Identifier', { description: msg });
      return;
    }

    if (!password) {
      const msg = 'Please enter your account password.';
      setErrorMsg(msg);
      toast.error('Missing Password', { description: msg });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(identifierType === 'email' ? identifier : 'vendor@meridiansteel.com');
      setIsLoading(false);
      toast.success('Welcome back!', {
        description: 'Successfully authenticated to BITAINTEL vendor workspace.',
      });
      router.push(redirectUrl || '/demo/dashboard/vendor');
    }, 500);
  }

  // Handle Send OTP (Can dispatch OTP to either email or phone)
  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier) {
      const msg =
        identifierType === 'email'
          ? 'Please enter your registered corporate email to receive OTP.'
          : 'Please enter your registered mobile number to receive OTP.';
      setErrorMsg(msg);
      toast.error('Missing Contact Details', { description: msg });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setOtpTargetChannel(identifierType);
      setTimer(45);
      toast.success('Security OTP Dispatched', {
        description: `A 4-digit verification code was sent to ${identifier}.`,
      });
    }, 500);
  }

  // Handle Verify OTP
  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode.length < 4) {
      const msg = 'Please enter the 4-digit verification code.';
      setErrorMsg(msg);
      toast.error('Invalid OTP', { description: msg });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(identifierType === 'email' ? identifier : DEMO_VENDOR.email);
      setIsLoading(false);
      toast.success('Verification Successful', {
        description: 'Logged into your corporate workspace.',
      });
      router.push(redirectUrl || '/demo/dashboard/vendor');
    }, 500);
  }

  // 1-Click Demo Login
  function handleQuickDemo(type: 'email' | 'phone') {
    if (type === 'email') {
      setIdentifierType('email');
      setIdentifier(DEMO_VENDOR.email);
    } else {
      setIdentifierType('phone');
      setIdentifier(DEMO_VENDOR.mobile);
    }
    setPassword('DemoPassword2026!');
    setIsLoading(true);
    setTimeout(() => {
      login(DEMO_VENDOR.email, DEMO_VENDOR.businessName);
      setIsLoading(false);
      toast.success('Demo Vendor Signed In', {
        description: 'Authenticated as Meridian Steel Works Ltd.',
      });
      router.push(redirectUrl || '/demo/dashboard/vendor');
    }, 400);
  }

  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bitaintel_vendor_dossier');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.step6?.status === 'Draft' || parsed.completionPercentage < 100) {
          setHasSavedDraft(true);
        }
      }
    } catch {}
  }, []);

  return (
    <div className="space-y-6">
      {hasSavedDraft && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/80 p-3 text-xs text-primary-900 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary-600 shrink-0" />
            <span>You have an in-progress vendor registration draft saved.</span>
          </div>
          <Link
            href="/demo/register"
            className="font-bold underline text-primary-700 hover:text-primary-900 shrink-0"
          >
            Resume Draft →
          </Link>
        </div>
      )}

      {/* 1. Identifier Switcher (Email vs Phone Number) */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Sign In Using
        </label>
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setIdentifierType('email');
              setIdentifier('');
              setOtpSent(false);
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              identifierType === 'email'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail className="size-3.5" />
            <span>Corporate Email</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifierType('phone');
              setIdentifier('');
              setOtpSent(false);
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              identifierType === 'phone'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="size-3.5" />
            <span>Phone Number</span>
          </button>
        </div>
      </div>

      {/* 2. Authentication Method (Password vs OTP) */}
      <div className="flex items-center justify-center gap-2 p-1 rounded-full bg-slate-100/80 border border-slate-200/80 max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => {
            setAuthMethod('password');
            setOtpSent(false);
            setErrorMsg('');
          }}
          className={`flex-1 py-1 px-3 rounded-full text-xs font-bold transition-all ${
            authMethod === 'password'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod('otp');
            setErrorMsg('');
          }}
          className={`flex-1 py-1 px-3 rounded-full text-xs font-bold transition-all ${
            authMethod === 'otp'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          OTP Verification
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* ========================================================================= */}
      {/* METHOD A: PASSWORD AUTHENTICATION (Using Email or Phone)                  */}
      {/* ========================================================================= */}
      {authMethod === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in">
          {identifierType === 'email' ? (
            <Input
              label="Registered Corporate Email"
              type="email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. rajesh@meridiansteel.com"
              icon={<Mail className="size-4 text-slate-400" />}
            />
          ) : (
            <Input
              label="Registered Mobile Phone Number"
              type="tel"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+91 98201 44521"
              icon={<Smartphone className="size-4 text-slate-400" />}
            />
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                href="/demo/forgot-password"
                className="text-xs font-semibold text-primary-700 hover:text-primary-900"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-12 rounded-2xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-900 outline-none transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center mt-6"
            rightIcon={<ArrowRight className="size-4" />}
          >
            Sign In with Password
          </Button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* METHOD B: OTP AUTHENTICATION (Sent to Email or Phone)                     */}
      {/* ========================================================================= */}
      {authMethod === 'otp' && (
        <div className="space-y-4 animate-in fade-in">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {identifierType === 'email' ? (
                <Input
                  label="Enter Registered Email for OTP"
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. rajesh@meridiansteel.com"
                  icon={<Mail className="size-4 text-slate-400" />}
                />
              ) : (
                <Input
                  label="Enter Registered Mobile Number for SMS OTP"
                  type="tel"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+91 98201 44521"
                  icon={<Smartphone className="size-4 text-slate-400" />}
                />
              )}

              <p className="text-xs text-slate-500">
                A 4-digit one-time passcode will be delivered to your{' '}
                <strong>{identifierType === 'email' ? 'corporate inbox' : 'mobile phone via SMS'}</strong>.
              </p>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full justify-center"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Send OTP to {identifierType === 'email' ? 'Email' : 'Phone'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-primary-50 border border-primary-200 text-xs text-primary-900 flex items-center justify-between">
                <div>
                  <span className="block font-bold">OTP Dispatched</span>
                  <span className="text-[11px] text-primary-700">Sent to: {identifier}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="font-bold underline text-primary-800 hover:text-primary-950"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Enter 4-Digit Passcode
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
                  autoFocus
                />
                <span className="text-[11px] text-slate-400 mt-1 block text-center">
                  Demo hint: Type any 4 digits (e.g. 1234)
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full justify-center"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Verify Code & Enter Dashboard
              </Button>
            </form>
          )}
        </div>
      )}

      {/* 1-Click Demo Login Options */}
      <div className="pt-4 border-t border-slate-200">
        <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary-600" />
          <span>Quick 1-Click Demo Vendor Login:</span>
        </p>

        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickDemo('email')}
            className="p-2.5 rounded-xl border border-primary-200 bg-primary-50/70 hover:bg-primary-100/70 text-left transition-all"
          >
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Mail className="size-3 text-primary-700" />
              <span>Login via Email</span>
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{DEMO_VENDOR.email}</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('phone')}
            className="p-2.5 rounded-xl border border-primary-200 bg-primary-50/70 hover:bg-primary-100/70 text-left transition-all"
          >
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Smartphone className="size-3 text-primary-700" />
              <span>Login via Phone</span>
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{DEMO_VENDOR.mobile}</p>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-1">
        Don&apos;t have an account yet?{' '}
        <Link href="/demo/register" className="font-bold text-primary-700 hover:underline">
          Register your business
        </Link>
      </div>
    </div>
  );
}
