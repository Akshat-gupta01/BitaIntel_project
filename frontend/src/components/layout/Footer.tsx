'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { Container } from './Container';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'sonner';

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Do not render website public footer on dashboard or coming-soon pages
  if (pathname && (pathname.startsWith('/demo/dashboard') || pathname.startsWith('/demo/coming-soon'))) {
    return null;
  }

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Invalid Email Address', {
        description: 'Please provide a valid corporate email address to receive briefings.',
      });
      return;
    }
    setSubscribed(true);
    toast.success('Subscribed Successfully', {
      description: `You will receive the quarterly B2B Risk & Trust Briefing at ${email}.`,
    });
    setEmail('');
  }

  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950 text-slate-300 transition-colors">
      {/* Top Pre-Footer Intelligence Bulletin */}
      <div className="border-b border-slate-800/60 py-12 bg-slate-950">
        <Container>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-16 -top-16 size-72 rounded-full bg-primary-900/20 blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-20 size-64 rounded-full bg-primary-800/15 blur-2xl pointer-events-none" />

            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/20 px-3 py-1 text-xs font-bold text-primary-300">
                  <ShieldCheck className="size-3.5" />
                  Quarterly B2B Risk & Trust Briefing
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Stay ahead of regulatory compliance and corporate due diligence.
                </h3>
                <p className="mt-3 text-sm text-slate-300 max-w-xl leading-relaxed">
                  Get synthesized intelligence on MCA policy amendments, GSTN fraud detection patterns, and industry verification standards.
                </p>
              </div>

              <div>
                {subscribed ? (
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-slate-300 flex items-center gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary-400" />
                    <p className="text-xs font-medium">
                      You are now subscribed to the BITAINTEL Intelligence Briefing!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your corporate email"
                      required
                      className="min-h-12 flex-1 rounded-full border border-slate-700 bg-slate-800/60 px-5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary-400 focus:bg-slate-800 focus:ring-2 focus:ring-primary-400/20 transition-all"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight className="size-4" />}
                    >
                      Subscribe
                    </Button>
                  </form>
                )}
                <p className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="size-3 text-slate-500" />
                  No spam. Unsubscribe anytime. Strict corporate privacy.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Links */}
      <div className="py-16">
        <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/demo" className="inline-flex items-center group py-1" aria-label="BITAINTEL Home">
              <Logo variant="default" size="lg" showTagline />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier B2B trust intelligence platform. We synthesize statutory government filings, documented ISO quality systems, and operational verification to empower risk-free business relationships.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-primary-900/30 px-3 py-1 font-semibold text-primary-300 border border-primary-800/50">
                MCA Registered
              </span>
              <span className="rounded-full bg-primary-900/30 px-3 py-1 font-semibold text-primary-300 border border-primary-800/50">
                ISO 27001 Pipeline
              </span>
              <span className="rounded-full bg-primary-900/30 px-3 py-1 font-semibold text-primary-300 border border-primary-800/50">
                GSTN Cross-Check
              </span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Directory & Intel
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Verified Directory', '/demo/directory'],
                ['Compare Businesses', '/demo/compare'],
                ['Manufacturing Entities', '/demo/directory?industry=Manufacturing'],
                ['Healthcare & Pharma', '/demo/directory?industry=Healthcare+%26+Pharma'],
                ['IT & Tech Services', '/demo/directory?industry=IT+Services'],
              ].map(([title, url]) => (
                <li key={url}>
                  <Link
                    href={url}
                    className="text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Methodology */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Methodology
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['How It Works', '/demo/how-it-works'],
                ['Verification Tiers', '/demo/how-it-works#tiers'],
                ['Scoring Algorithm', '/demo/how-it-works#scoring'],
                ['Document Audit Vault', '/demo/how-it-works#audit'],
                ['Frequently Asked Questions', '/demo/faq'],
              ].map(([title, url]) => (
                <li key={url}>
                  <Link
                    href={url}
                    className="text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Corporate & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Enterprise
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['For Vendors & Suppliers', '/demo/vendor'],
                ['Register Business', '/demo/register'],
                ['About BITAINTEL', '/demo/about'],
                ['Contact Team', '/demo/contact'],
                ['Privacy Policy', '/demo/privacy'],
                ['Terms of Service', '/demo/terms'],
              ].map(([title, url]) => (
                <li key={url}>
                  <Link
                    href={url}
                    className="text-slate-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{title}</span>
                    {title === 'Register Business' && <ExternalLink className="size-3 text-slate-500" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>

      {/* Bottom Sub-Footer */}
      <div className="border-t border-slate-800/60 py-6 text-xs text-slate-500 relative z-10">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BITAINTEL Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/demo/privacy" className="text-slate-400 hover:text-primary-400 transition-colors">
              Privacy Framework
            </Link>
            <Link href="/demo/terms" className="text-slate-400 hover:text-primary-400 transition-colors">
              Terms of Use
            </Link>
            <Link href="/demo/faq" className="text-slate-400 hover:text-primary-400 transition-colors">
              Help Center
            </Link>
          </div>
        </Container>
      </div>

      {/* Giant Watermark Logo at the bottom constrained to page Container */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none -mt-4 sm:-mt-8 pb-0 flex justify-center items-end opacity-[0.06]">
        <Container className="flex justify-center items-end">
          <img
            src="/logo.svg"
            alt=""
            aria-hidden="true"
            className="w-full h-auto object-contain translate-y-[20%] filter grayscale contrast-50 invert"
          />
        </Container>
      </div>
    </footer>
  );
}
