'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  ShieldCheck,
  User,
  Clock,
  Sparkles,
  ChevronDown,
  Check,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PersonaSwitcher() {
  const { role, user, setRole } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesConfig: {
    id: UserRole;
    label: string;
    sublabel: string;
    badge: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      id: 'visitor',
      label: 'Unregistered Visitor',
      sublabel: 'Minimal public business information · Statutory data gated',
      badge: 'Public Tier',
      icon: Globe,
      color: 'text-slate-600 bg-slate-100 border-slate-200',
    },
    {
      id: 'unverified',
      label: 'Logged-in, Unverified User',
      sublabel: 'Limited info · Instant Step 1 sign-up · Own registration dashboard',
      badge: 'Step 1 Complete',
      icon: User,
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      id: 'pending_approval',
      label: 'GST-Verified Awaiting Approval',
      sublabel: 'GST validated · Awaiting authorization desk review',
      badge: 'Audit Pending',
      icon: Clock,
      color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    },
    {
      id: 'approved_business',
      label: 'Approved B2B Business',
      sublabel: 'Detailed permitted company & product info · Live RFIs',
      badge: 'Verified B2B',
      icon: ShieldCheck,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'premium_subscriber',
      label: 'Premium B2B Subscriber',
      sublabel: 'Additional analytics, competitor comparison & intelligence dossier',
      badge: 'Enterprise Intelligence',
      icon: Sparkles,
      color: 'text-primary-800 bg-primary-50 border-primary-200',
    },
  ];

  const currentRole = rolesConfig.find((r) => r.id === role) || rolesConfig[0];
  const CurrentIcon = currentRole.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border transition-all shadow-2xs',
          currentRole.color,
          'hover:shadow-sm'
        )}
        title="Switch user tier for demonstration"
        aria-label="Switch User Persona / Tier"
      >
        <span className="flex items-center gap-1.5">
          <CurrentIcon className="size-3.5" />
          <span className="hidden sm:inline font-bold">Tier:</span>
          <span className="font-bold">{currentRole.label.split(' ')[0]} {currentRole.label.split(' ')[1] || ''}</span>
        </span>
        <ChevronDown className={cn('size-3 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="size-3.5 text-primary-600" />
                Select Role / Access Tier
              </p>
              <p className="text-[11px] text-slate-500">
                Experience the platform across all 5 user permission states
              </p>
            </div>
            {user && (
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {user.avatarInitials}
              </span>
            )}
          </div>

          <div className="space-y-1.5 py-2 max-h-[360px] overflow-y-auto">
            {rolesConfig.map((item) => {
              const Icon = item.icon;
              const isSelected = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRole(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3',
                    isSelected
                      ? 'border-primary-300 bg-primary-50/70 shadow-2xs font-bold'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <div
                    className={cn(
                      'size-8 rounded-lg grid place-items-center shrink-0 text-xs mt-0.5',
                      isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.label}</span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.sublabel}</p>
                  </div>
                  {isSelected && (
                    <Check className="size-4 text-primary-600 shrink-0 self-center" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50/70 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            💡 <em>Switching tiers updates navigation, data visibility, and workflow rules dynamically.</em>
          </div>
        </div>
      )}
    </div>
  );
}
