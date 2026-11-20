'use client';

import React, { useState } from 'react';
import { Phone, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/layout/Container';

export interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  standalone?: boolean;
}

export function ComingSoon({
  title = 'Coming Soon',
  subtitle = 'BITAINTEL is India’s premier B2B verification and business intelligence platform. Governed by our core principle "Verify Before You Trust", we empower enterprises and procurement teams to discover, evaluate, and partner with authentic businesses through government-backed statutory validation and transparent trust scoring.',
  badge = 'Coming Soon',
  standalone = false,
}: ComingSoonProps) {
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | null>(null);

  const handleCopy = async (text: string, field: 'phone' | 'email', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-x-hidden ${
        standalone ? 'fixed inset-0 z-50 overflow-y-auto' : ''
      }`}
    >
      {/* Background Ambient Lighting */}
      <div className="pointer-events-none absolute left-1/4 top-0 -translate-y-1/2 size-[650px] rounded-full bg-gradient-to-tr from-primary-400/20 via-primary-200/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-1/4 size-[550px] rounded-full bg-gradient-to-bl from-primary-400/20 via-primary-300/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 bottom-0 size-[500px] rounded-full bg-gradient-to-t from-primary-200/15 via-primary-100/10 to-transparent blur-3xl" />

      {/* Top Header with Logo & Tagline */}
      <header className="w-full pt-10 sm:pt-14 relative z-10">
        <Container className="flex items-center justify-center">
          <Logo variant="default" size="lg" showTagline />
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-8 sm:pt-12 pb-4 sm:pb-6 relative z-10 my-auto">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            {badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-300/80 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-900 shadow-2xs backdrop-blur-md">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary-600" />
                </span>
                <span>{badge}</span>
              </div>
            )}

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.08]">
              Verify Before You Trust. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>
        </Container>
      </main>

      {/* Footer with Contact Info */}
      <footer className="w-full py-6 sm:py-8 text-center text-xs text-slate-500 relative z-10 border-t border-slate-200/60 bg-white/30 backdrop-blur-xs">
        <Container className="flex flex-col items-center justify-center gap-5">
          {/* Contact Title & Short Quote */}
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              Get in Touch
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 italic">
              “Building verified partnerships starts with a single conversation.”
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            {/* Phone Pill */}
            <div className="group inline-flex items-center rounded-full border border-slate-200 bg-white/90 shadow-xs hover:border-primary-300 hover:bg-primary-50/40 transition-all backdrop-blur-xs pl-3.5 pr-1.5 py-1.5">
              <a
                href="tel:9409191988"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-primary-700 transition-colors mr-2.5"
                title="Call 9409191988"
              >
                <Phone className="size-3.5 text-primary-600" />
                <span>9409191988</span>
              </a>
              <button
                type="button"
                onClick={(e) => handleCopy('9409191988', 'phone', e)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-primary-100 text-slate-600 hover:text-primary-700 px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer"
                title="Copy phone number"
                aria-label="Copy phone number"
              >
                {copiedField === 'phone' ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Email Pill (Direct to Gmail + Copy) */}
            <div className="group inline-flex items-center rounded-full border border-slate-200 bg-white/90 shadow-xs hover:border-primary-300 hover:bg-primary-50/40 transition-all backdrop-blur-xs pl-3.5 pr-1.5 py-1.5">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=Info@bitaintel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-primary-700 transition-colors mr-2.5"
                title="Send email via Gmail directly"
              >
                <Mail className="size-3.5 text-primary-600" />
                <span>Info@bitaintel.com</span>
                <ExternalLink className="size-3 text-slate-400 group-hover:text-primary-600 transition-colors" />
              </a>
              <button
                type="button"
                onClick={(e) => handleCopy('Info@bitaintel.com', 'email', e)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-primary-100 text-slate-600 hover:text-primary-700 px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer"
                title="Copy email address"
                aria-label="Copy email address"
              >
                {copiedField === 'email' ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-slate-400">
            © {new Date().getFullYear()} BITAINTEL Technologies · Coming Soon
          </p>
        </Container>
      </footer>
    </div>
  );
}