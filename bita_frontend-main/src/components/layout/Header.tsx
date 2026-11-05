'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  Search,
  LogIn,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { Container } from './Container';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

import { PersonaSwitcher } from '@/components/shared/PersonaSwitcher';

const navLinks = [
  { label: 'Home', href: '/demo' },
  { label: 'Home-2', href: '/demo/home' },
  { label: 'Directory', href: '/demo/directory' },
  { label: 'Compare', href: '/demo/compare' },
  { label: 'How It Works', href: '/demo/how-it-works' },
  { label: 'About', href: '/demo/about' },
  { label: 'FAQ', href: '/demo/faq' },
  { label: 'Contact', href: '/demo/contact' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Do not render website public header on dashboard or coming-soon pages
  if (
    pathname &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/demo/dashboard') ||
      pathname.startsWith('/coming-soon') ||
      pathname.startsWith('/demo/coming-soon'))
  ) {
    return null;
  }

  return (
    <>
      {/* Top Banner Strip with Persona Switcher */}
      <div className="relative z-50 hidden border-b border-slate-200/60 bg-white/60 backdrop-blur-md py-1 text-xs text-slate-500 lg:block">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary-800 border border-primary-200/80">
              <span className="size-1.5 animate-pulse rounded-full bg-primary-500" />
              LIVE REGISTRY SYNTHESIS
            </span>
            <span className="text-slate-400">·</span>
            <span className="whitespace-nowrap">MCA, GSTN, ISO 9001, & MSME verified enterprise database</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Access Tier Demo:</span>
              <PersonaSwitcher />
            </div>
            <span className="text-slate-300">|</span>
            <Link
              href="/demo/directory"
              className="text-primary-700 font-semibold hover:text-primary-900 transition-colors whitespace-nowrap"
            >
              14,200+ Audited Businesses →
            </Link>
          </div>
        </Container>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-200',
          scrolled
            ? 'border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] py-2'
            : 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-2.5'
        )}
      >
        <Container className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/demo"
            className="flex items-center group shrink-0"
            onClick={() => setMobileOpen(false)}
            aria-label="BITAINTEL Home"
          >
            <Logo variant="default" size="md" showTagline />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-2xs backdrop-blur-md md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-full px-4 py-1 text-xs font-semibold transition-all duration-150 whitespace-nowrap',
                    active
                      ? 'bg-slate-900 !text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Persona Switcher visible on medium screens */}
            <div className="lg:hidden">
              <PersonaSwitcher />
            </div>

            <Link
              href="/demo/directory"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 transition-colors whitespace-nowrap"
            >
              <Search className="size-3.5 text-slate-400" />
              <span>Explore Directory</span>
            </Link>

            {!isAuthenticated || !user ? (
              <>
                <Link
                  href="/demo/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-primary-700 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 transition-all shadow-2xs whitespace-nowrap"
                >
                  <LogIn className="size-3.5 text-primary-600" />
                  <span>Vendor Sign In</span>
                </Link>
                <Button
                  size="sm"
                  variant="primary"
                  href="/demo/register"
                  className="py-1.5 px-3 text-xs whitespace-nowrap"
                  rightIcon={<ArrowRight className="size-3" />}
                >
                  Register Business
                </Button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/demo/dashboard/vendor"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-full shadow-2xs transition-all whitespace-nowrap"
                  >
                    <LayoutDashboard className="size-3.5 text-primary-400" />
                    <span>Vendor Dashboard</span>
                  </Link>

                  {/* Refined Compact Profile Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-label="User Account Menu"
                    className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all text-xs"
                  >
                    <span className="font-bold text-slate-800 max-w-[90px] truncate leading-none whitespace-nowrap">
                      {user.businessName.split(' ')[0]}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-primary-700 bg-primary-50 px-1 py-0.5 rounded leading-none border border-primary-200/50">
                      {user.score}
                    </span>
                    <div className="size-5.5 rounded-full bg-primary-600 text-white font-bold text-[10px] grid place-items-center shrink-0">
                      {user.avatarInitials}
                    </div>
                    <ChevronDown className={cn("size-3 text-slate-400 transition-transform duration-150", userDropdownOpen && "rotate-180")} />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                    <div className="p-2.5 bg-slate-50 rounded-xl mb-1 space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.businessName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                        <span>Score: <strong className="text-primary-700 font-bold">{user.score}/100</strong></span>
                        <span className="truncate max-w-[100px]">{user.cin}</span>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <Link
                        href="/demo/dashboard/vendor"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <LayoutDashboard className="size-4 text-primary-600" />
                        <span>Vendor Dashboard</span>
                      </Link>

                      <div className="pt-1.5 mt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="size-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid size-10 place-items-center rounded-2xl border border-slate-200 bg-white/80 text-slate-700 backdrop-blur-md md:hidden hover:bg-white"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </Container>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur-2xl px-4 py-6 md:hidden animate-in slide-in-from-top-2 duration-200">
            <Container className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600">Simulate Access Tier:</span>
                <PersonaSwitcher />
              </div>

              {isAuthenticated && user && (
                <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200 mb-2 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary-600 text-white font-bold text-sm grid place-items-center">
                      {user.avatarInitials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.businessName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-primary-800">
                      Score: {user.score}/100
                    </span>
                    <Link
                      href="/demo/dashboard/vendor"
                      onClick={() => setMobileOpen(false)}
                      className="text-xs font-bold text-primary-700 hover:underline"
                    >
                      Vendor Dashboard →
                    </Link>
                  </div>
                </div>
              )}

              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-2xl px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap',
                      active
                        ? 'bg-primary-50 text-primary-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                {isAuthenticated && user ? (
                  <>
                    <Button
                      href="/demo/dashboard/vendor"
                      variant="primary"
                      className="w-full justify-center whitespace-nowrap"
                      onClick={() => setMobileOpen(false)}
                      icon={<LayoutDashboard className="size-4" />}
                    >
                      Vendor Dashboard
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-center text-rose-600"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      icon={<LogOut className="size-4" />}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      href="/demo/login"
                      variant="secondary"
                      className="w-full justify-center whitespace-nowrap"
                      onClick={() => setMobileOpen(false)}
                      icon={<LogIn className="size-4" />}
                    >
                      Vendor Sign In
                    </Button>
                    <Button
                      href="/demo/register"
                      variant="primary"
                      className="w-full justify-center whitespace-nowrap"
                      onClick={() => setMobileOpen(false)}
                      rightIcon={<ArrowRight className="size-4" />}
                    >
                      Register Business
                    </Button>
                  </>
                )}
              </div>
            </Container>
          </div>
        )}
      </header>
    </>
  );
}
