'use client';

import React from 'react';
import { Step3BusinessData } from '@/types/vendorRegistration';
import {
  BUSINESS_TYPES,
  VENDOR_CATEGORIES,
  BUSINESS_ACTIVITIES,
} from '@/config/vendorMasterData';
import { Card } from '@/components/ui/Card';
import {
  Layers,
  Factory,
  Cpu,
  Flame,
  CheckCircle2,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

interface BusinessCapabilitiesTabProps {
  data: Step3BusinessData;
}

export function BusinessCapabilitiesTab({ data }: BusinessCapabilitiesTabProps) {
  // Map selected BT codes to full objects
  const activeBusinessTypes = BUSINESS_TYPES.filter((bt) =>
    data.businessTypeCodes.includes(bt.code)
  );

  // Map selected Category IDs to objects
  const activeCategories = VENDOR_CATEGORIES.filter((cat) =>
    data.selectedCategoryIds.includes(cat.id)
  );

  return (
    <div className="space-y-6">
      {/* 1. Business Type Master List (BT01 - BT14) */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="size-5 text-primary-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Registered Business Types ({activeBusinessTypes.length})
            </h3>
            <p className="text-xs text-slate-500">
              Official classification under BITAINTEL vendor taxonomy (BT01–BT14)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BUSINESS_TYPES.map((bt) => {
            const isSelected = data.businessTypeCodes.includes(bt.code);
            return (
              <div
                key={bt.code}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'border-primary-400 bg-primary-50/80 text-primary-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500">{bt.code}</span>
                  {isSelected && <CheckCircle2 className="size-3.5 text-primary-600" />}
                </div>
                <span className="mt-1 block truncate">{bt.name}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. 20 Main Categories & 240 Subcategories */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="size-5 text-primary-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              BITAINTEL 20 Main Categories & 240 Dynamic Subcategories
            </h3>
            <p className="text-xs text-slate-500">
              Primary industries and specific capability subcategory nodes
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {activeCategories.map((cat) => {
            const activeSubs = cat.subcategories.filter((s) =>
              data.selectedSubcategoryIds.includes(s.id)
            );

            return (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-700 bg-white px-2 py-0.5 rounded border border-primary-200">
                      {cat.id}
                    </span>
                    <h4 className="text-xs font-black text-slate-900">{cat.name}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {activeSubs.length} of {cat.subcategories.length} subcategories active
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeSubs.map((sub) => (
                    <span
                      key={sub.id}
                      className="px-2.5 py-1 rounded-lg bg-white border border-primary-300 text-primary-950 font-bold text-[11px] shadow-2xs flex items-center gap-1"
                    >
                      <span className="font-mono text-[9px] text-slate-400">{sub.id}</span>
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Manufacturing Infrastructure & Operational Profile */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bento" className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Factory className="size-5 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">Manufacturing Capabilities</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Processes & Technology</span>
              <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">
                {data.manufacturingProcesses || '5-Axis CNC Milling, Precision Welding, Heat Treatment'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Machinery & Installed Units</span>
              <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">
                {data.machineryEquipment || 'Mazak Variaxis 5-Axis (4 units), KUKA Welding Robots, 1500T Stamping'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold">Installed Capacity</span>
                <span className="font-bold text-slate-900">{data.installedCapacity || '4,500 MT / Month'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold">Available Spare Capacity</span>
                <span className="font-bold text-emerald-700">{data.availableCapacity || '1,200 MT / Month'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-semibold">
              {data.hasRdLab && (
                <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
                  ✓ In-House R&D Laboratory
                </span>
              )}
              {data.hasQcLab && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ Metrology & QC Inspection Lab
                </span>
              )}
              {data.offersCustomDevelopment && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                  ✓ Custom Engineering & Prototyping
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card variant="bento" className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="size-5 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">Operating Profile & Scale</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Years in Business</span>
              <span className="text-xl font-black text-slate-900">{data.yearsInBusiness} Years</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Annual Turnover Range</span>
              <span className="text-sm font-black text-slate-900">{data.annualTurnoverRange}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Operating Facilities</span>
              <span className="text-xl font-black text-slate-900">{data.numberOfFacilities} Units</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Total Workforce</span>
              <span className="text-xl font-black text-slate-900">{data.totalWorkforce} Staff</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-semibold mb-1">
              Permitted Business Activities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.businessActivities.map((act) => (
                <span
                  key={act}
                  className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
