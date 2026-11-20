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
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import * as authService from '@services/auth.service';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export interface LoginFormProps {
  portal?: 'vendor' | 'admin';
  onPortalChange?: (portal: 'vendor' | 'admin') => void;
}

export function LoginForm({ portal = 'vendor', onPortalChange }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login, loginWithOtp } = useAuth();

  const isAdminPortal = portal === 'admin';

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

  // Resend countdown for the OTP login method
  useEffect(() => {
    if (!otpSent || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Centralized smart role-aware post-login router
  const navigateAfterLogin = (authUserObj: any) => {
    const userRole = String(authUserObj?.role || authUserObj?.systemRole || '').toLowerCase();
    const isAdmin =
      userRole === 'admin' ||
      userRole === 'super_admin' ||
      userRole === 'verification_officer' ||
      userRole === 'quality_auditor';

    if (isAdmin) {
      // If user is Admin/SuperAdmin, always direct to Admin Dashboard unless redirectUrl explicitly points to an admin route
      if (
        redirectUrl &&
        (redirectUrl.startsWith('/demo/dashboard/admin') || redirectUrl.startsWith('/dashboard/admin'))
      ) {
        router.push(redirectUrl);
      } else {
        router.push('/demo/dashboard/admin');
      }
    } else {
      // For Vendor/Regular User, direct to Vendor Dashboard unless redirectUrl is a safe non-admin route
      if (redirectUrl && !redirectUrl.includes('/admin')) {
        router.push(redirectUrl);
      } else {
        router.push('/demo/dashboard/vendor');
      }
    }
  };

  // Handle Password Sign In (Using either email or phone number)
  async function handlePasswordLogin(e: React.FormEvent) {
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
    try {
      const authUser: any = await login(identifier, password);
      setIsLoading(false);
      toast.success('Welcome back!', {
        description: 'Successfully authenticated to BITAINTEL workspace.',
      });

      navigateAfterLogin(authUser);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Invalid email or password.';
      setErrorMsg(msg);
      toast.error('Login Failed', { description: msg });
    }
  }

// Handle Send OTP (Can dispatch OTP to either email or phone)
async function handleSendOtp(e?: React.FormEvent) {
if (e) e.preventDefault();
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

if (identifierType === 'phone' && identifier.replace(/\D/g, '').length < 10) {
const msg = 'Please enter a valid 10-digit registered mobile number.';
setErrorMsg(msg);
toast.error('Invalid Mobile Number', { description: msg });
return;
}

setIsLoading(true);
try {
const targetChannel = identifierType;
await authService.sendOtp({
  identifier,
  email: targetChannel === 'email' ? identifier : '',
  mobile: targetChannel === 'phone' ? identifier : '',
  purpose: 'login',
});
setOtpSent(true);
setOtpTargetChannel(targetChannel);
setTimer(45);
toast.success('Security OTP Dispatched', {
description: `A 4-digit verification code was sent to ${identifier}.`,
});
} catch (err: any) {
const msg = err.message || 'Could not send the verification code. Please try again.';
setErrorMsg(msg);
toast.error('OTP Dispatch Failed', { description: msg });
} finally {
setIsLoading(false);
}
}

// Handle Verify OTP
async function handleVerifyOtp(e: React.FormEvent) {
e.preventDefault();
setErrorMsg('');

if (otpCode.length < 4) {
const msg = 'Please enter the 4-digit verification code.';
setErrorMsg(msg);
toast.error('Invalid OTP', { description: msg });
return;
}

setIsLoading(true);
try {
  const authUser: any = await loginWithOtp(identifier, otpCode);
  setIsLoading(false);
  toast.success('Verification Successful', {
    description: 'Logged into your corporate workspace.',
  });
  navigateAfterLogin(authUser);
} catch (err: any) {
  setIsLoading(false);
  setErrorMsg(err.message || 'Verification failed');
  toast.error('Verification Failed', { description: err.message });
}
}

  return (
    <div className="space-y-6">
      {/* 1. Identifier Switcher (Email vs Phone Number) */}
      <div className="space-y-1.5">
        <label
          className={`text-[11px] font-bold uppercase tracking-wider ${
            isAdminPortal ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Sign In Using
        </label>
        <div
          className={`grid grid-cols-2 p-1.5 rounded-2xl gap-1.5 transition-colors ${
            isAdminPortal
              ? 'bg-slate-900/60 border border-slate-700/80'
              : 'bg-slate-100 border border-slate-200/80'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setIdentifierType('email');
              setIdentifier('');
              setOtpSent(false);
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
              identifierType === 'email'
                ? isAdminPortal
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/30'
                  : 'bg-white text-slate-900 shadow-sm'
                : isAdminPortal
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Mail className="size-3.5" />
            <span>{isAdminPortal ? 'Official Email' : 'Corporate Email'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifierType('phone');
              setIdentifier('');
              setOtpSent(false);
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
              identifierType === 'phone'
                ? isAdminPortal
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/30'
                  : 'bg-white text-slate-900 shadow-sm'
                : isAdminPortal
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Smartphone className="size-3.5" />
            <span>Phone Number</span>
          </button>
        </div>
      </div>

      {/* 2. Authentication Method (Password vs OTP) */}
      <div
        className={`flex items-center justify-center gap-1.5 p-1 rounded-full border max-w-xs mx-auto transition-colors ${
          isAdminPortal
            ? 'bg-slate-900/60 border-slate-700/80'
            : 'bg-slate-100/90 border-slate-200/80'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setAuthMethod('password');
            setOtpSent(false);
            setErrorMsg('');
          }}
          className={`flex-1 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all ${
            authMethod === 'password'
              ? isAdminPortal
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/30'
                : 'bg-slate-900 text-white shadow-xs'
              : isAdminPortal
              ? 'text-slate-400 hover:text-white'
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
          className={`flex-1 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all ${
            authMethod === 'otp'
              ? isAdminPortal
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/30'
                : 'bg-slate-900 text-white shadow-xs'
              : isAdminPortal
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          OTP Verification
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className={`p-3.5 rounded-2xl border text-xs font-medium animate-in fade-in flex items-start gap-2.5 ${
            isAdminPortal
              ? 'border-rose-500/30 bg-rose-950/40 text-rose-300'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* METHOD A: PASSWORD AUTHENTICATION (Using Email or Phone)                  */}
      {/* ========================================================================= */}
      {authMethod === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in">
          <div className="space-y-1.5">
            <label
              htmlFor="auth-identifier"
              className={`text-xs font-bold uppercase tracking-wider block ${
                isAdminPortal ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              {identifierType === 'email'
                ? isAdminPortal
                  ? 'Official Administrative Email'
                  : 'Registered Corporate Email'
                : isAdminPortal
                ? 'Registered Officer Mobile Phone'
                : 'Registered Mobile Phone Number'}
            </label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3.5 text-slate-400">
                {identifierType === 'email' ? <Mail className="size-4" /> : <Smartphone className="size-4" />}
              </span>
              <input
                id="auth-identifier"
                type={identifierType === 'email' ? 'email' : 'tel'}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  identifierType === 'email'
                    ? isAdminPortal
                      ? 'e.g. auditor@bitaintel.com'
                      : 'e.g. rajesh@meridiansteel.com'
                    : '+91 98201 44521'
                }
                autoComplete={identifierType === 'email' ? 'email' : 'tel'}
                className={`w-full min-h-12 rounded-2xl pl-10 pr-4 text-sm outline-none transition-all ${
                  isAdminPortal
                    ? 'border border-slate-600 bg-slate-700/60 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-slate-700/90 focus:ring-4 focus:ring-indigo-500/20 [color-scheme:dark] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#334155_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]'
                    : 'border border-slate-200/90 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="auth-password"
                className={`text-xs font-bold uppercase tracking-wider ${
                  isAdminPortal ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Password
              </label>
              <Link
                href="/demo/forgot-password"
                className={`text-xs font-semibold transition-colors ${
                  isAdminPortal
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : 'text-primary-700 hover:text-primary-900'
                }`}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3.5 text-slate-400">
                <Lock className="size-4" />
              </span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className={`w-full min-h-12 rounded-2xl pl-10 pr-11 text-sm outline-none transition-all ${
                  isAdminPortal
                    ? 'border border-slate-600 bg-slate-700/60 text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-slate-700/90 focus:ring-4 focus:ring-indigo-500/20 [color-scheme:dark] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#334155_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]'
                    : 'border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            className={`w-full justify-center mt-6 transition-all duration-200 active:scale-[0.99] font-bold ${
              isAdminPortal
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/40 hover:shadow-indigo-600/50'
                : 'shadow-md shadow-primary-600/20'
            }`}
            rightIcon={isAdminPortal ? <ShieldCheck className="size-4" /> : <ArrowRight className="size-4" />}
          >
            {isAdminPortal ? 'Sign In to Admin Console' : 'Sign In with Password'}
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
              <div className="space-y-1.5">
                <label
                  htmlFor="otp-identifier"
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    isAdminPortal ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {identifierType === 'email'
                    ? isAdminPortal
                      ? 'Enter Officer Email for OTP'
                      : 'Enter Registered Email for OTP'
                    : isAdminPortal
                    ? 'Enter Officer Mobile for SMS OTP'
                    : 'Enter Registered Mobile Number for SMS OTP'}
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-slate-400">
                    {identifierType === 'email' ? <Mail className="size-4" /> : <Smartphone className="size-4" />}
                  </span>
                  <input
                    id="otp-identifier"
                    type={identifierType === 'email' ? 'email' : 'tel'}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      identifierType === 'email'
                        ? isAdminPortal
                          ? 'e.g. auditor@bitaintel.com'
                          : 'e.g. rajesh@meridiansteel.com'
                        : '+91 98201 44521'
                    }
                    autoComplete={identifierType === 'email' ? 'email' : 'tel'}
                    className={`w-full min-h-12 rounded-2xl pl-10 pr-4 text-sm outline-none transition-all ${
                      isAdminPortal
                        ? 'border border-slate-600 bg-slate-700/60 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-slate-700/90 focus:ring-4 focus:ring-indigo-500/20 [color-scheme:dark] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#334155_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]'
                        : 'border border-slate-200/90 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100'
                    }`}
                  />
                </div>
              </div>

              <p className={`text-xs ${isAdminPortal ? 'text-slate-400' : 'text-slate-500'}`}>
                A 4-digit one-time passcode will be delivered to your{' '}
                <strong>{identifierType === 'email' ? 'official inbox' : 'mobile phone via SMS'}</strong>.
              </p>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className={`w-full justify-center transition-all duration-200 active:scale-[0.99] font-bold ${
                  isAdminPortal
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/40 hover:shadow-indigo-600/50'
                    : 'shadow-md shadow-primary-600/20'
                }`}
                rightIcon={<ArrowRight className="size-4" />}
              >
                Send OTP to {identifierType === 'email' ? 'Email' : 'Phone'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
                  isAdminPortal
                    ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                    : 'bg-primary-50 border-primary-200 text-primary-900'
                }`}
              >
                <div>
                  <span className="block font-bold">OTP Dispatched</span>
                  <span className={`text-[11px] ${isAdminPortal ? 'text-indigo-300' : 'text-primary-700'}`}>
                    Sent to: {identifier}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className={`font-bold underline transition-colors ${
                    isAdminPortal ? 'text-indigo-300 hover:text-white' : 'text-primary-800 hover:text-primary-950'
                  }`}
                >
                  Change
                </button>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-otp-code"
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    isAdminPortal ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Enter 4-Digit Passcode
                </label>
                <input
                  id="auth-otp-code"
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className={`w-full text-center tracking-[0.5em] font-mono text-2xl font-bold min-h-12 rounded-2xl px-4 outline-none transition-all ${
                    isAdminPortal
                      ? 'border border-slate-600 bg-slate-700/60 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-700/90 focus:ring-4 focus:ring-indigo-500/20 [color-scheme:dark]'
                      : 'border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100'
                  }`}
                  autoFocus
                />
                <span className="text-[11px] text-slate-400 mt-1 block text-center">
                  Enter the code sent to your {otpTargetChannel === 'email' ? 'email' : 'mobile'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className={`size-3 ${isAdminPortal ? 'text-indigo-400' : 'text-primary-600'}`} />
                  Code expires in {timer}s
                </span>
                <button
                  type="button"
                  disabled={timer > 0 || isLoading}
                  onClick={() => handleSendOtp()}
                  className={`font-bold transition-colors ${
                    timer > 0
                      ? 'text-slate-500 cursor-not-allowed'
                      : isAdminPortal
                      ? 'text-indigo-400 hover:underline cursor-pointer'
                      : 'text-primary-700 hover:underline cursor-pointer'
                  }`}
                >
                  Resend Code
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className={`w-full justify-center transition-all duration-200 active:scale-[0.99] font-bold ${
                  isAdminPortal
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/40 hover:shadow-indigo-600/50'
                    : 'shadow-md shadow-primary-600/20'
                }`}
                rightIcon={isAdminPortal ? <ShieldCheck className="size-4" /> : <ArrowRight className="size-4" />}
              >
                {isAdminPortal ? 'Verify Code & Enter Audit Desk' : 'Verify Code & Enter Dashboard'}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Footer Switcher */}
      {isAdminPortal ? (
        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-700/80 flex items-center justify-center gap-2">
          <span>Are you an enterprise vendor?</span>
          <Link
            href="/demo/login"
            className="font-bold text-indigo-400 hover:underline"
          >
            Go to Vendor Workspace
          </Link>
        </div>
      ) : (
        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-200">
          Don&apos;t have an account yet?{' '}
          <Link href="/demo/register" className="font-bold text-primary-700 hover:underline">
            Register your business
          </Link>
        </div>
      )}
    </div>
  );
}