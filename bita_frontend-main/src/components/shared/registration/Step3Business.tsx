'use client';

import React, { useMemo } from 'react';
import { Step3BusinessData } from '@/types/vendorRegistration';
import {
  BUSINESS_TYPES,
  VENDOR_CATEGORIES,
  BUSINESS_ACTIVITIES,
} from '@/config/vendorMasterData';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Layers,
  Factory,
  Briefcase,
  Check,
  UploadCloud,
  FileCheck2,
  Cpu,
  Flame,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface Step3BusinessProps {
  data: Step3BusinessData;
  onChange: (updated: Partial<Step3BusinessData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3Business({ data, onChange, onNext, onPrev }: Step3BusinessProps) {
  // Check if manufacturing capability should conditionally render
  const isManufacturingSelected = useMemo(() => {
    return (
      data.businessTypeCodes.some((code) => ['BT01', 'BT02', 'BT03'].includes(code)) ||
      data.businessActivities.some((act) =>
        ['Manufacturing', 'Contract Manufacturing', 'Private Label'].includes(act)
      )
    );
  }, [data.businessTypeCodes, data.businessActivities]);

  // Check if service capability should conditionally render
  const isServiceSelected = useMemo(() => {
    return (
      data.businessTypeCodes.some((code) => ['BT11', 'BT12', 'BT13'].includes(code)) ||
      data.businessActivities.includes('Services')
    );
  }, [data.businessTypeCodes, data.businessActivities]);

  // Dynamically compute available subcategories based on selected category IDs
  const availableSubcategories = useMemo(() => {
    if (!data.selectedCategoryIds.length) return [];
    return VENDOR_CATEGORIES.filter((cat) => data.selectedCategoryIds.includes(cat.id)).flatMap(
      (cat) =>
        cat.subcategories.map((sub) => ({
          ...sub,
          parentCategoryName: cat.name,
        }))
    );
  }, [data.selectedCategoryIds]);

  // Toggle Business Type (BT01 - BT14)
  function toggleBusinessType(code: string) {
    const exists = data.businessTypeCodes.includes(code);
    const updated = exists
      ? data.businessTypeCodes.filter((c) => c !== code)
      : [...data.businessTypeCodes, code];
    onChange({ businessTypeCodes: updated });
  }

  // Toggle Category (CAT001 - CAT020)
  function toggleCategory(catId: string) {
    const exists = data.selectedCategoryIds.includes(catId);
    let updatedCats: string[];
    let updatedSubcats = [...data.selectedSubcategoryIds];

    if (exists) {
      updatedCats = data.selectedCategoryIds.filter((c) => c !== catId);
      // Remove subcategories belonging to this removed category
      const removedCat = VENDOR_CATEGORIES.find((c) => c.id === catId);
      if (removedCat) {
        const removedSubIds = removedCat.subcategories.map((s) => s.id);
        updatedSubcats = updatedSubcats.filter((subId) => !removedSubIds.includes(subId));
      }
    } else {
      updatedCats = [...data.selectedCategoryIds, catId];
    }

    onChange({
      selectedCategoryIds: updatedCats,
      selectedSubcategoryIds: updatedSubcats,
    });
  }

  // Toggle Subcategory
  function toggleSubcategory(subId: string) {
    const exists = data.selectedSubcategoryIds.includes(subId);
    const updated = exists
      ? data.selectedSubcategoryIds.filter((s) => s !== subId)
      : [...data.selectedSubcategoryIds, subId];
    onChange({ selectedSubcategoryIds: updated });
  }

  // Toggle Business Activity
  function toggleActivity(act: string) {
    const exists = data.businessActivities.includes(act);
    const updated = exists
      ? data.businessActivities.filter((a) => a !== act)
      : [...data.businessActivities, act];
    onChange({ businessActivities: updated });
  }

  function handleProceed() {
    if (!data.businessTypeCodes.length) {
      toast.error('Please select at least one Business Type (e.g. Manufacturer, Trader).');
      return;
    }
    if (!data.selectedCategoryIds.length) {
      toast.error('Please select at least one BITAINTEL Industry Category.');
      return;
    }
    if (!data.selectedSubcategoryIds.length) {
      toast.error('Please select at least one relevant Subcategory.');
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
          Step 3 of 6
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          Business Classification & Capabilities
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Select your business model, primary categories, dynamically filtered subcategories, and operational capacities.
        </p>
      </div>

      {/* 1. Business Type Selection (BT01 - BT14) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Business Type Master Selection (Select All That Apply) <span className="text-rose-500">*</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {data.businessTypeCodes.length} selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {BUSINESS_TYPES.map((bt) => {
            const isSelected = data.businessTypeCodes.includes(bt.code);
            return (
              <button
                key={bt.code}
                type="button"
                onClick={() => toggleBusinessType(bt.code)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all text-xs font-semibold ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/80 text-primary-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <span className="text-[10px] font-mono text-slate-400 block">{bt.code}</span>
                  <span className="truncate">{bt.name}</span>
                </div>
                {isSelected && <Check className="size-4 text-primary-600 shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 20 Main Vendor Categories Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Factory className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              2. BITAINTEL 20 Main Categories <span className="text-rose-500">*</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {data.selectedCategoryIds.length} categories chosen
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {VENDOR_CATEGORIES.map((cat) => {
            const isSelected = data.selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all text-xs font-semibold ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/90 text-primary-950 ring-1 ring-primary-500 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{cat.id}</span>
                  <span>{cat.name}</span>
                </div>
                {isSelected && <Check className="size-4 text-primary-600 shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dynamically Filtered Subcategories (from the 240 master entries) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              3. Dynamic Subcategory Specializations <span className="text-rose-500">*</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {data.selectedSubcategoryIds.length} subcategories active
          </span>
        </div>

        {availableSubcategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs">
            Please select at least one main category above to populate dynamic subcategories.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-4">
            {data.selectedCategoryIds.map((catId) => {
              const cat = VENDOR_CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <div key={cat.id} className="space-y-2">
                  <h4 className="text-xs font-black text-primary-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary-600"></span>
                    {cat.name} ({cat.id})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {cat.subcategories.map((sub) => {
                      const isSubSelected = data.selectedSubcategoryIds.includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer text-xs transition-colors ${
                            isSubSelected
                              ? 'bg-white border-primary-400 text-primary-950 font-bold shadow-2xs'
                              : 'bg-white/80 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Checkbox
                            checked={isSubSelected}
                            onChange={() => toggleSubcategory(sub.id)}
                            className="mt-0.5"
                          />
                          <span className="leading-tight text-[11px]">
                            <span className="font-mono text-[9px] text-slate-400 mr-1">{sub.id}</span>
                            {sub.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Business Activities */}
      <div className="space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">4. Business Activities</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BUSINESS_ACTIVITIES.map((act) => {
            const isAct = data.businessActivities.includes(act);
            return (
              <label
                key={act}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer font-semibold ${
                  isAct ? 'bg-primary-50/80 border-primary-400 text-primary-900' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Checkbox checked={isAct} onChange={() => toggleActivity(act)} />
                <span>{act}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Conditional Capabilities: Manufacturing vs Service */}
      {isManufacturingSelected && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Factory className="size-4 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-950">
              Manufacturing Capabilities & Technical Infrastructure
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Core Production Processes & Technology
              </label>
              <textarea
                rows={2}
                value={data.manufacturingProcesses || ''}
                onChange={(e) => onChange({ manufacturingProcesses: e.target.value })}
                placeholder="e.g. 5-Axis CNC Milling, Robotic MIG/TIG Welding, Heat Treatment, Clean Room Packing..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Major Machinery & Installed Equipment
              </label>
              <textarea
                rows={2}
                value={data.machineryEquipment || ''}
                onChange={(e) => onChange({ machineryEquipment: e.target.value })}
                placeholder="e.g. Mazak CNCs, KUKA Robots, 1500T Stamping Press, Laser Cutters..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Installed Capacity</label>
              <Input
                value={data.installedCapacity || ''}
                onChange={(e) => onChange({ installedCapacity: e.target.value })}
                placeholder="e.g. 5,000 MT / Month or 25,000 Units / Month"
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Available / Spare Capacity</label>
              <Input
                value={data.availableCapacity || ''}
                onChange={(e) => onChange({ availableCapacity: e.target.value })}
                placeholder="e.g. 1,500 MT / Month available for new contracts"
                className="text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <Checkbox
                  checked={!!data.hasRdLab}
                  onChange={(e) => onChange({ hasRdLab: e.target.checked })}
                />
                In-house R&D / Laboratory
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <Checkbox
                  checked={!!data.hasQcLab}
                  onChange={(e) => onChange({ hasQcLab: e.target.checked })}
                />
                QC / QA Metrology Lab
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <Checkbox
                  checked={!!data.offersCustomDevelopment}
                  onChange={(e) => onChange({ offersCustomDevelopment: e.target.checked })}
                />
                Custom Product Engineering & Prototyping
              </label>
            </div>
          </div>
        </div>
      )}

      {isServiceSelected && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-indigo-700" />
            <h3 className="text-sm font-bold text-indigo-950">
              Service Capabilities & Geographic Delivery
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Expertise</label>
              <Input
                value={data.serviceExpertise || ''}
                onChange={(e) => onChange({ serviceExpertise: e.target.value })}
                placeholder="e.g. Industrial Automation Consulting & Calibration"
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Geographic Coverage</label>
              <Input
                value={data.geographicCoverage || ''}
                onChange={(e) => onChange({ geographicCoverage: e.target.value })}
                placeholder="e.g. Pan-India, Middle East, Southeast Asia"
                className="text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Capacity & SLA</label>
              <Input
                value={data.deliveryCapacity || ''}
                onChange={(e) => onChange({ deliveryCapacity: e.target.value })}
                placeholder="e.g. 50+ on-site deployment engineers, 24/7 SLA"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Operating Profile & Turnover */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">6. Operating Profile & Turnover</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Years in Business</label>
            <Input
              value={data.yearsInBusiness}
              onChange={(e) => onChange({ yearsInBusiness: e.target.value })}
              placeholder="e.g. 15"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Number of Facilities</label>
            <Input
              value={data.numberOfFacilities}
              onChange={(e) => onChange({ numberOfFacilities: e.target.value })}
              placeholder="e.g. 3"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Annual Turnover Range</label>
            <Select
              value={data.annualTurnoverRange}
              onChange={(e) => onChange({ annualTurnoverRange: e.target.value })}
              options={[
                { value: 'Under ₹5 crore', label: 'Under ₹5 crore' },
                { value: '₹5–25 crore', label: '₹5–25 crore' },
                { value: '₹25–50 crore', label: '₹25–50 crore' },
                { value: '₹50–100 crore', label: '₹50–100 crore' },
                { value: '₹100–500 crore', label: '₹100–500 crore' },
                { value: '₹500+ crore', label: '₹500+ crore' },
              ]}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Workforce</label>
            <Input
              value={data.totalWorkforce}
              onChange={(e) => onChange({ totalWorkforce: e.target.value })}
              placeholder="e.g. 240"
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="text-xs font-bold text-slate-700"
        >
          Previous Step
        </Button>
        <Button
          type="button"
          onClick={handleProceed}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 shadow-sm text-xs"
        >
          Save & Continue to Products & Quality
        </Button>
      </div>
    </div>
  );
}
