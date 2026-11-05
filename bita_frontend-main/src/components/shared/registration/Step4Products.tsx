'use client';

import React, { useState } from 'react';
import {
  Step4ProductsData,
  ProductCatalogItem,
  QualityCertificateRecord,
  RegulatoryApproval,
} from '@/types/vendorRegistration';
import {
  VENDOR_CATEGORIES,
  CURRENCIES,
  STANDARD_CERTIFICATIONS,
} from '@/config/vendorMasterData';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  Package,
  Award,
  Plus,
  Trash2,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface Step4ProductsProps {
  data: Step4ProductsData;
  onChange: (updated: Partial<Step4ProductsData>) => void;
  onNext: () => void;
  onPrev: () => void;
  selectedCategoryIds?: string[];
}

export function Step4Products({
  data,
  onChange,
  onNext,
  onPrev,
  selectedCategoryIds = [],
}: Step4ProductsProps) {
  // Add Product modal / form drawer
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductCatalogItem>>({
    type: 'Product',
    name: '',
    brand: '',
    categoryId: selectedCategoryIds[0] || 'CAT001',
    subcategoryId: '',
    description: '',
    specifications: '',
    grade: '',
    standards: '',
    hsnCode: '',
    countryOfOrigin: 'India',
    moq: '100 Units',
    standardOrderQty: '500 Units',
    monthlyCapacity: '10,000 Units',
    availableStock: '500 Units',
    leadTimeDays: '15 Days',
    sampleAvailability: 'Available Free',
    indicativePrice: '',
    currency: 'INR',
    priceValidity: '60 Days',
    targetMarkets: 'India, Global',
  });

  // Add Certificate modal / form
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState<Partial<QualityCertificateRecord>>({
    certificateType: STANDARD_CERTIFICATIONS[0],
    certificateNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    scope: '',
    applicableFacility: 'All Facilities',
    status: 'Active',
  });

  // Add Product
  function handleAddProduct() {
    if (!newProduct.name || !newProduct.categoryId) {
      toast.error('Please enter product name and select a category.');
      return;
    }
    const item: ProductCatalogItem = {
      id: `PRD-${Date.now()}`,
      name: newProduct.name || '',
      type: newProduct.type || 'Product',
      categoryId: newProduct.categoryId || 'CAT001',
      subcategoryId: newProduct.subcategoryId || '',
      brand: newProduct.brand || '',
      description: newProduct.description || '',
      specifications: newProduct.specifications || '',
      grade: newProduct.grade || '',
      standards: newProduct.standards || '',
      hsnCode: newProduct.hsnCode || '',
      countryOfOrigin: newProduct.countryOfOrigin || 'India',
      moq: newProduct.moq || '50 Units',
      standardOrderQty: newProduct.standardOrderQty || '200 Units',
      monthlyCapacity: newProduct.monthlyCapacity || '5,000 Units',
      availableStock: newProduct.availableStock || '100 Units',
      leadTimeDays: newProduct.leadTimeDays || '14 Days',
      sampleAvailability: newProduct.sampleAvailability || 'Available Free',
      indicativePrice: newProduct.indicativePrice || '0',
      currency: newProduct.currency || 'INR',
      priceValidity: newProduct.priceValidity || '60 Days',
      targetMarkets: newProduct.targetMarkets || 'Global',
    };
    onChange({ products: [...data.products, item] });
    setShowAddProduct(false);
    setNewProduct({
      type: 'Product',
      name: '',
      brand: '',
      categoryId: selectedCategoryIds[0] || 'CAT001',
      subcategoryId: '',
      description: '',
      specifications: '',
      grade: '',
      standards: '',
      hsnCode: '',
      countryOfOrigin: 'India',
      moq: '100 Units',
      standardOrderQty: '500 Units',
      monthlyCapacity: '10,000 Units',
      availableStock: '500 Units',
      leadTimeDays: '15 Days',
      sampleAvailability: 'Available Free',
      indicativePrice: '',
      currency: 'INR',
      priceValidity: '60 Days',
      targetMarkets: 'India, Global',
    });
    toast.success('Catalog Item Added', { description: item.name });
  }

  function handleRemoveProduct(id: string) {
    onChange({ products: data.products.filter((p) => p.id !== id) });
    toast.info('Item removed from catalog.');
  }

  // Add Certificate
  function handleAddCert() {
    if (!newCert.certificateNumber || !newCert.issuingAuthority || !newCert.expiryDate) {
      toast.error('Please enter certificate number, issuing body, and expiry date.');
      return;
    }
    const item: QualityCertificateRecord = {
      id: `CERT-${Date.now()}`,
      certificateType: newCert.certificateType || STANDARD_CERTIFICATIONS[0],
      certificateNumber: newCert.certificateNumber || '',
      issuingAuthority: newCert.issuingAuthority || '',
      issueDate: newCert.issueDate || '',
      expiryDate: newCert.expiryDate || '',
      scope: newCert.scope || '',
      applicableFacility: newCert.applicableFacility || 'All Facilities',
      status: 'Active',
    };
    onChange({ certifications: [...data.certifications, item] });
    setShowAddCert(false);
    setNewCert({
      certificateType: STANDARD_CERTIFICATIONS[0],
      certificateNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      scope: '',
      applicableFacility: 'All Facilities',
      status: 'Active',
    });
    toast.success('Quality Certificate Added', { description: item.certificateNumber });
  }

  function handleRemoveCert(id: string) {
    onChange({ certifications: data.certifications.filter((c) => c.id !== id) });
    toast.info('Certificate removed.');
  }

  function handleProceed() {
    if (!data.products.length) {
      toast.error('Catalog Required', {
        description: 'Please add at least one product or service to your portfolio.',
      });
      return;
    }
    if (!data.certifications.length) {
      toast.error('Certification / Quality Proof Required', {
        description: 'Please add at least one quality certification or standards compliance record.',
      });
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
          Step 4 of 6
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          Products, Services & Quality Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Define product portfolio, supply batches, pricing validity, ISO certifications, and regulatory accreditations.
        </p>
      </div>

      {/* 1. Products & Services Portfolio */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Commercial Catalog & Specifications ({data.products.length}) <span className="text-rose-500">*</span>
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <Plus className="size-3.5 mr-1" /> Add Product / Service
          </Button>
        </div>

        {/* Dynamic Add Product Form */}
        {showAddProduct && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary-950 uppercase tracking-wide">
                New Catalog Item Specifications
              </h4>
              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Item Type</label>
                <Select
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as any })}
                  options={[
                    { value: 'Product', label: 'Physical Product / Material' },
                    { value: 'Service', label: 'Contract Service / Engineering' },
                  ]}
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Item / Product Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Precision CNC Forged SS316L Flanges"
                  className="text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Main Category</label>
                <Select
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  options={VENDOR_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Brand Name</label>
                <Input
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="e.g. Meridian AeroGrade"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">HSN / HS Code</label>
                <Input
                  value={newProduct.hsnCode}
                  onChange={(e) => setNewProduct({ ...newProduct, hsnCode: e.target.value })}
                  placeholder="e.g. 73072100"
                  className="text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Technical Specifications & Metallurgy Grade
                </label>
                <Input
                  value={newProduct.specifications}
                  onChange={(e) => setNewProduct({ ...newProduct, specifications: e.target.value })}
                  placeholder="e.g. ASTM A182 / SS316L, 150# to 2500#, tolerance +/- 0.02mm"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Minimum Order Qty (MOQ)</label>
                <Input
                  value={newProduct.moq}
                  onChange={(e) => setNewProduct({ ...newProduct, moq: e.target.value })}
                  placeholder="e.g. 50 Units"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Production Lead Time</label>
                <Input
                  value={newProduct.leadTimeDays}
                  onChange={(e) => setNewProduct({ ...newProduct, leadTimeDays: e.target.value })}
                  placeholder="e.g. 14 Days"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sample Policy</label>
                <Select
                  value={newProduct.sampleAvailability}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, sampleAvailability: e.target.value as any })
                  }
                  options={[
                    { value: 'Available Free', label: 'Available Free of Cost' },
                    { value: 'Available Paid', label: 'Available Paid (Refundable)' },
                    { value: 'Not Available', label: 'Not Available' },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Indicative Price</label>
                <Input
                  value={newProduct.indicativePrice}
                  onChange={(e) => setNewProduct({ ...newProduct, indicativePrice: e.target.value })}
                  placeholder="e.g. 8,450"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Currency</label>
                <Select
                  value={newProduct.currency}
                  onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                  options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} (${c.symbol})` }))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Price Validity</label>
                <Input
                  value={newProduct.priceValidity}
                  onChange={(e) => setNewProduct({ ...newProduct, priceValidity: e.target.value })}
                  placeholder="e.g. 60 Days"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Document Attachments row for product */}
            <div className="rounded-lg bg-white p-3 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Technical Documents (TDS, COA, SDS, Catalog)
              </span>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {['TDS (Technical Data Sheet)', 'COA (Certificate of Analysis)', 'SDS (Safety Data Sheet)', 'Catalog PDF'].map(
                  (f, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 cursor-pointer hover:bg-primary-50 hover:text-primary-700"
                    >
                      <UploadCloud className="size-3" /> {f}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddProduct}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                Save Product to Catalog
              </Button>
            </div>
          </div>
        )}

        {/* Existing Products List */}
        {data.products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs">
            No products or services added yet. Click &quot;Add Product / Service&quot; above to build your commercial catalog.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.products.map((prd) => (
              <div
                key={prd.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                      {prd.brand || 'Proprietary'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{prd.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(prd.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2">{prd.specifications || prd.description}</p>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-600 font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[9px]">MOQ</span>
                    {prd.moq}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Lead Time</span>
                    {prd.leadTimeDays}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Indicative</span>
                    {prd.currency} {prd.indicativePrice || 'On Request'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Quality & Industry Certifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Quality, Safety & Standards Certifications ({data.certifications.length}) <span className="text-rose-500">*</span>
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddCert(!showAddCert)}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <Plus className="size-3.5 mr-1" /> Add Certificate
          </Button>
        </div>

        {/* Dynamic Add Certificate Form */}
        {showAddCert && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary-950">Add Accredited Certificate Record</h4>
              <button
                type="button"
                onClick={() => setShowAddCert(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Certificate Standard</label>
                <Select
                  value={newCert.certificateType}
                  onChange={(e) => setNewCert({ ...newCert, certificateType: e.target.value })}
                  options={STANDARD_CERTIFICATIONS.map((c) => ({ value: c, label: c }))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Certificate Number</label>
                <Input
                  value={newCert.certificateNumber}
                  onChange={(e) => setNewCert({ ...newCert, certificateNumber: e.target.value })}
                  placeholder="e.g. TUV-IN-9001-2023-8921"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Issuing Authority / Registrar</label>
                <Input
                  value={newCert.issuingAuthority}
                  onChange={(e) => setNewCert({ ...newCert, issuingAuthority: e.target.value })}
                  placeholder="e.g. TÜV Rheinland / Bureau Veritas"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Applicable Facility / Scope</label>
                <Input
                  value={newCert.applicableFacility}
                  onChange={(e) => setNewCert({ ...newCert, applicableFacility: e.target.value })}
                  placeholder="e.g. Unit 1: Chakan Plant & Design Center"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Issue Date</label>
                <Input
                  type="date"
                  value={newCert.issueDate}
                  onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={newCert.expiryDate}
                  onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddCert}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                Save Certificate Record
              </Button>
            </div>
          </div>
        )}

        {/* Existing Added Certifications List */}
        {data.certifications.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.certifications.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-start justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {c.certificateType}
                    </span>
                    {c.status === 'Expiring Soon' && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="size-3" /> Expiring Soon
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-mono font-bold text-slate-900">{c.certificateNumber}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Issued by {c.issuingAuthority} • Valid until {c.expiryDate}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCert(c.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Testing Capabilities & QA Procedures */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">3. Quality Systems, Calibration & Inspection</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              In-House Testing & Calibration Capabilities
            </label>
            <textarea
              rows={2}
              value={data.testingCapabilities}
              onChange={(e) => onChange({ testingCapabilities: e.target.value })}
              placeholder="e.g. Spectrometer PMI analysis, CMM 3D inspection, Tensile strength testing, NDT..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quality Assurance & Traceability Procedures
            </label>
            <textarea
              rows={2}
              value={data.qualityAssuranceProcedures}
              onChange={(e) => onChange({ qualityAssuranceProcedures: e.target.value })}
              placeholder="e.g. PPAP Level 3, 100% digital heat code traceability, incoming raw material QA SOP..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
          Save & Continue to Commercial & Trade
        </Button>
      </div>
    </div>
  );
}
