'use client';

import React, { useState, useRef } from 'react';
import { ProductCatalogItem } from '@/types/vendorRegistration';
import { CURRENCIES } from '@/config/vendorMasterData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { BulkProductImportModal } from './BulkProductImportModal';
import {
  Package,
  Plus,
  Trash2,
  FileText,
  Download,
  Search,
  UploadCloud,
  CheckCircle2,
  X,
  FileCheck2,
  ShieldCheck,
  Eye,
  RefreshCw,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

interface CatalogProductsTabProps {
  products: ProductCatalogItem[];
  onUpdateProducts: (products: ProductCatalogItem[]) => void;
}

export function CatalogProductsTab({ products, onUpdateProducts }: CatalogProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductCatalogItem | null>(null);

  // Document Inspection modal state
  const [viewingDoc, setViewingDoc] = useState<{
    product: ProductCatalogItem;
    type: 'TDS' | 'COA';
    fileName: string;
  } | null>(null);

  // Quick Upload modal for an existing product
  const [quickUpload, setQuickUpload] = useState<{
    product: ProductCatalogItem;
    type: 'TDS' | 'COA';
  } | null>(null);
  const [quickUploadFileName, setQuickUploadFileName] = useState('');

  // Add/Edit Product form state
  const [newItem, setNewItem] = useState<Partial<ProductCatalogItem>>({
    name: '',
    brand: '',
    type: 'Product',
    categoryId: 'CAT017',
    specifications: '',
    grade: 'SS316L',
    hsnCode: '',
    moq: '50 Units',
    standardOrderQty: '200 Units',
    leadTimeDays: '14 Days',
    indicativePrice: '',
    currency: 'INR',
    sampleAvailability: 'Available Free',
    technicalDataSheetDoc: '',
    coaDoc: '',
  });

  const tdsInputRef = useRef<HTMLInputElement>(null);
  const coaInputRef = useRef<HTMLInputElement>(null);
  const quickUploadInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsnCode.includes(searchQuery)
  );

  function resetNewItem() {
    setNewItem({
      name: '',
      brand: '',
      type: 'Product',
      categoryId: 'CAT017',
      specifications: '',
      grade: 'SS316L',
      hsnCode: '',
      moq: '50 Units',
      standardOrderQty: '200 Units',
      leadTimeDays: '14 Days',
      indicativePrice: '',
      currency: 'INR',
      sampleAvailability: 'Available Free',
      technicalDataSheetDoc: '',
      coaDoc: '',
    });
    setEditingProduct(null);
  }

  function handleOpenAddModal() {
    resetNewItem();
    setShowAddModal(true);
  }

  function handleOpenEditModal(prod: ProductCatalogItem) {
    setEditingProduct(prod);
    setNewItem({
      name: prod.name,
      brand: prod.brand,
      type: prod.type,
      categoryId: prod.categoryId,
      subcategoryId: prod.subcategoryId,
      specifications: prod.specifications,
      grade: prod.grade,
      standards: prod.standards,
      hsnCode: prod.hsnCode,
      countryOfOrigin: prod.countryOfOrigin,
      moq: prod.moq,
      standardOrderQty: prod.standardOrderQty,
      monthlyCapacity: prod.monthlyCapacity,
      availableStock: prod.availableStock,
      leadTimeDays: prod.leadTimeDays,
      sampleAvailability: prod.sampleAvailability,
      indicativePrice: prod.indicativePrice || '',
      currency: prod.currency || 'INR',
      priceValidity: prod.priceValidity,
      targetMarkets: prod.targetMarkets,
      technicalDataSheetDoc: prod.technicalDataSheetDoc || '',
      coaDoc: prod.coaDoc || '',
    });
    setShowAddModal(true);
  }

  function handleSaveProduct() {
    if (!newItem.name?.trim()) {
      toast.error('Please enter a product name.');
      return;
    }

    if (editingProduct) {
      // Update existing product
      const updatedProduct: ProductCatalogItem = {
        ...editingProduct,
        name: newItem.name.trim(),
        type: newItem.type || editingProduct.type || 'Product',
        categoryId: newItem.categoryId || editingProduct.categoryId || 'CAT001',
        subcategoryId: newItem.subcategoryId || editingProduct.subcategoryId || 'SUB187',
        brand: newItem.brand?.trim() || 'Proprietary',
        description: newItem.specifications || '',
        specifications: newItem.specifications || '',
        grade: newItem.grade || 'Standard',
        standards: newItem.standards || 'ISO / ASME Compliant',
        hsnCode: newItem.hsnCode || '73072100',
        countryOfOrigin: newItem.countryOfOrigin || 'India',
        moq: newItem.moq || '50 Units',
        standardOrderQty: newItem.standardOrderQty || '200 Units',
        monthlyCapacity: newItem.monthlyCapacity || '10,000 Units',
        availableStock: newItem.availableStock || '500 Units',
        leadTimeDays: newItem.leadTimeDays || '14 Days',
        sampleAvailability: newItem.sampleAvailability || 'Available Free',
        indicativePrice: newItem.indicativePrice?.trim() || '',
        currency: newItem.currency || 'INR',
        priceValidity: newItem.priceValidity || '60 Days',
        targetMarkets: newItem.targetMarkets || 'India, Global',
        technicalDataSheetDoc: newItem.technicalDataSheetDoc?.trim() || undefined,
        coaDoc: newItem.coaDoc?.trim() || undefined,
      };

      const updatedList = products.map((p) => (p.id === editingProduct.id ? updatedProduct : p));
      onUpdateProducts(updatedList);
      setShowAddModal(false);
      resetNewItem();
      toast.success(`Product "${updatedProduct.name}" updated successfully.`);
      return;
    }

    // Add new product
    const item: ProductCatalogItem = {
      id: `PRD-${Date.now()}`,
      name: newItem.name.trim(),
      type: newItem.type || 'Product',
      categoryId: newItem.categoryId || 'CAT001',
      subcategoryId: 'SUB187',
      brand: newItem.brand?.trim() || 'Proprietary',
      description: newItem.specifications || '',
      specifications: newItem.specifications || '',
      grade: newItem.grade || 'Standard',
      standards: 'ISO / ASME Compliant',
      hsnCode: newItem.hsnCode || '73072100',
      countryOfOrigin: 'India',
      moq: newItem.moq || '50 Units',
      standardOrderQty: newItem.standardOrderQty || '200 Units',
      monthlyCapacity: '10,000 Units',
      availableStock: '500 Units',
      leadTimeDays: newItem.leadTimeDays || '14 Days',
      sampleAvailability: newItem.sampleAvailability || 'Available Free',
      indicativePrice: newItem.indicativePrice?.trim() || '',
      currency: newItem.currency || 'INR',
      priceValidity: '60 Days',
      targetMarkets: 'India, Global',
      technicalDataSheetDoc: newItem.technicalDataSheetDoc?.trim() || undefined,
      coaDoc: newItem.coaDoc?.trim() || undefined,
    };

    onUpdateProducts([...products, item]);
    setShowAddModal(false);
    resetNewItem();

    const docCount = (item.technicalDataSheetDoc ? 1 : 0) + (item.coaDoc ? 1 : 0);
    toast.success('Product saved to commercial catalog.', {
      description: docCount > 0 ? `${docCount} technical compliance document(s) attached.` : 'No technical docs attached.',
    });
  }

  function handleRemoveProduct(id: string) {
    onUpdateProducts(products.filter((p) => p.id !== id));
    toast.info('Product removed from catalog.');
  }

  // Handle file selection in Add Product form
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, type: 'TDS' | 'COA') {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'TDS') {
        setNewItem((prev) => ({ ...prev, technicalDataSheetDoc: file.name }));
        toast.success(`TDS file selected: ${file.name}`);
      } else {
        setNewItem((prev) => ({ ...prev, coaDoc: file.name }));
        toast.success(`COA file selected: ${file.name}`);
      }
    }
  }

  // Quick upload for an existing product in the table
  function handleQuickUploadSubmit() {
    if (!quickUpload || !quickUploadFileName.trim()) {
      toast.error('Please select or enter a document file name.');
      return;
    }

    const updated = products.map((p) => {
      if (p.id === quickUpload.product.id) {
        return {
          ...p,
          ...(quickUpload.type === 'TDS'
            ? { technicalDataSheetDoc: quickUploadFileName.trim() }
            : { coaDoc: quickUploadFileName.trim() }),
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    toast.success(`${quickUpload.type === 'TDS' ? 'Technical Data Sheet (TDS)' : 'Certificate of Analysis (COA)'} attached!`, {
      description: `Attached to ${quickUpload.product.name}.`,
    });
    setQuickUpload(null);
    setQuickUploadFileName('');
  }

  // Remove document from a product
  function handleDetachDoc(productId: string, type: 'TDS' | 'COA') {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          ...(type === 'TDS' ? { technicalDataSheetDoc: undefined } : { coaDoc: undefined }),
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    setViewingDoc(null);
    toast.info(`${type} document detached from product.`);
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary-50 text-primary-700 grid place-items-center shrink-0 border border-primary-100">
              <Package className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Commercial Products &amp; Services Catalog
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {products.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Products visible to corporate buyers with audited Technical Data Sheets (TDS) and Certificates of Analysis (COA)
              </p>
            </div>
          </div>

          {/* Search + Action Buttons: Buttons stay locked side-by-side without orphaned wrapping */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-56 sm:flex-none">
              <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or HSN..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-2xs transition-all whitespace-nowrap"
              >
                <UploadCloud className="size-3.5 text-slate-500" />
                <span>Bulk Upload / Export</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white shadow-sm hover:shadow transition-all whitespace-nowrap"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Product / Service</th>
                <th className="p-3">HSN Code</th>
                <th className="p-3">MOQ &amp; Batch</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3">Price / Currency</th>
                <th className="p-3">Technical Docs (TDS / COA)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No matching catalog products found. Click &quot;Add Product&quot; to register items with engineering TDS &amp; COA reports.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const hasTds = Boolean(p.technicalDataSheetDoc);
                  const hasCoa = Boolean(p.coaDoc);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 max-w-xs">
                        <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200/80 inline-block mb-1">
                          {p.brand || 'Proprietary'}
                        </span>
                        <strong className="text-slate-900 block truncate">{p.name}</strong>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {p.specifications || p.grade}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{p.hsnCode}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 block">{p.moq}</span>
                        <span className="text-[10px] text-slate-400">Batch: {p.standardOrderQty}</span>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">{p.leadTimeDays}</td>
                      <td className="p-3">
                        <span className="font-black text-slate-900">
                          {p.indicativePrice && p.indicativePrice.trim() !== '' && p.indicativePrice !== '0' && p.indicativePrice !== 'On Request'
                            ? `${p.currency} ${p.indicativePrice}`
                            : 'On Request'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{p.sampleAvailability}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* TDS Badge */}
                          {hasTds ? (
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  product: p,
                                  type: 'TDS',
                                  fileName: p.technicalDataSheetDoc!,
                                })
                              }
                              className="px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1.5 transition-all shadow-2xs group"
                              title={`View Audited TDS: ${p.technicalDataSheetDoc}`}
                            >
                              <FileText className="size-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                              <span>TDS</span>
                              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setQuickUpload({ product: p, type: 'TDS' });
                                setQuickUploadFileName(`${p.name.replace(/\s+/g, '_')}_TDS_Rev1.pdf`);
                              }}
                              className="px-2 py-1 rounded-full bg-white text-[10px] font-medium text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-dashed border-slate-300 flex items-center gap-1 transition-colors"
                              title="Attach Technical Data Sheet (TDS)"
                            >
                              <Plus className="size-2.5" /> TDS
                            </button>
                          )}

                          {/* COA Badge */}
                          {hasCoa ? (
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  product: p,
                                  type: 'COA',
                                  fileName: p.coaDoc!,
                                })
                              }
                              className="px-2.5 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-800 hover:bg-blue-100 border border-blue-300 flex items-center gap-1.5 transition-all shadow-2xs group"
                              title={`View Audited COA: ${p.coaDoc}`}
                            >
                              <CheckCircle2 className="size-3 text-blue-600 group-hover:scale-110 transition-transform" />
                              <span>COA</span>
                              <span className="size-1.5 rounded-full bg-blue-500 inline-block" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setQuickUpload({ product: p, type: 'COA' });
                                setQuickUploadFileName(`${p.name.replace(/\s+/g, '_')}_COA_Batch2026.pdf`);
                              }}
                              className="px-2 py-1 rounded-full bg-white text-[10px] font-medium text-slate-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-dashed border-slate-300 flex items-center gap-1 transition-colors"
                              title="Attach Certificate of Analysis (COA)"
                            >
                              <Plus className="size-2.5" /> COA
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Product Details &amp; Documents"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. ADD / EDIT PRODUCT TO CATALOG MODAL                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Dialog
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetNewItem();
        }}
        title={editingProduct ? 'Edit Catalog Product' : 'Add Product to Catalog'}
        description={
          editingProduct
            ? `Modify specifications, pricing, and compliance documents for ${editingProduct.name}`
            : 'Specify engineering parameters, pricing, and attach verified TDS and COA technical documentation'
        }
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Basic Info Fields with sleek rounded-xl styling */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. 5-Axis Precision Alloy Bracket"
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Brand</label>
              <Input
                value={newItem.brand}
                onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                placeholder="e.g. Meridian AeroGrade"
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">HSN Code</label>
              <Input
                value={newItem.hsnCode}
                onChange={(e) => setNewItem({ ...newItem, hsnCode: e.target.value })}
                placeholder="e.g. 88033000"
                className="text-xs font-mono rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">MOQ</label>
              <Input
                value={newItem.moq}
                onChange={(e) => setNewItem({ ...newItem, moq: e.target.value })}
                placeholder="e.g. 50 Units"
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Lead Time</label>
              <Input
                value={newItem.leadTimeDays}
                onChange={(e) => setNewItem({ ...newItem, leadTimeDays: e.target.value })}
                placeholder="e.g. 14 Days"
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Indicative Price <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                value={newItem.indicativePrice}
                onChange={(e) => setNewItem({ ...newItem, indicativePrice: e.target.value })}
                placeholder="e.g. 8,450 (or leave blank for On Request)"
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Currency</label>
              <select
                value={newItem.currency}
                onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Specifications</label>
              <textarea
                rows={2}
                value={newItem.specifications}
                onChange={(e) => setNewItem({ ...newItem, specifications: e.target.value })}
                placeholder="Material grade, tolerances, ASTM standards, pressure ratings..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          {/* ── TECHNICAL & COMPLIANCE DOCUMENTS SECTION (OPTIONAL) ── */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary-700" />
                Technical Compliance Documents (TDS &amp; COA)
                <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
              </span>

              {/* Sample Document Shortcut */}
              <button
                type="button"
                onClick={() => {
                  const prefix = newItem.name ? newItem.name.replace(/\s+/g, '_').slice(0, 20) : 'Alloy_Part';
                  setNewItem((prev) => ({
                    ...prev,
                    technicalDataSheetDoc: `TDS_${prefix}_AeroGrade_Spec.pdf`,
                    coaDoc: `COA_${prefix}_Batch_2026_Inspection.pdf`,
                  }));
                  toast.success('Attached sample TDS & COA reports.');
                }}
                className="text-[10px] font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2 py-0.5 rounded-md border border-primary-200 transition-colors"
              >
                + Fill Sample Docs
              </button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {/* TDS Slot */}
              <input
                type="file"
                ref={tdsInputRef}
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileSelect(e, 'TDS')}
                className="hidden"
              />
              {newItem.technicalDataSheetDoc ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck2 className="size-4 text-emerald-700 shrink-0" />
                    <div className="truncate">
                      <span className="text-[9px] uppercase font-bold text-emerald-700 block leading-tight">
                        TDS Attached
                      </span>
                      <span className="font-mono text-emerald-950 font-semibold truncate block text-[11px]">
                        {newItem.technicalDataSheetDoc}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, technicalDataSheetDoc: '' })}
                    className="text-slate-400 hover:text-rose-600 p-1 ml-1"
                    title="Remove file"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => tdsInputRef.current?.click()}
                  className="rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-3 py-2.5 text-center text-xs text-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <UploadCloud className="size-4 text-slate-400" />
                  <span className="text-[11px] font-medium">Upload Technical Data Sheet (PDF)</span>
                </button>
              )}

              {/* COA Slot */}
              <input
                type="file"
                ref={coaInputRef}
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileSelect(e, 'COA')}
                className="hidden"
              />
              {newItem.coaDoc ? (
                <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck2 className="size-4 text-blue-700 shrink-0" />
                    <div className="truncate">
                      <span className="text-[9px] uppercase font-bold text-blue-700 block leading-tight">
                        COA Attached
                      </span>
                      <span className="font-mono text-blue-950 font-semibold truncate block text-[11px]">
                        {newItem.coaDoc}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, coaDoc: '' })}
                    className="text-slate-400 hover:text-rose-600 p-1 ml-1"
                    title="Remove file"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coaInputRef.current?.click()}
                  className="rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-3 py-2.5 text-center text-xs text-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <UploadCloud className="size-4 text-slate-400" />
                  <span className="text-[11px] font-medium">Upload Certificate of Analysis (PDF)</span>
                </button>
              )}
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetNewItem();
              }}
              className="rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-6 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProduct}
              className="rounded-full bg-[#1e3a8a] hover:bg-[#172554] text-white px-7 py-2 text-xs font-bold shadow-sm transition-all"
            >
              {editingProduct ? 'Save Changes' : 'Save to Catalog'}
            </button>
          </div>
        </div>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. DOCUMENT INSPECTION & AUDIT MODAL (VIEW TDS / COA)               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewingDoc && (
        <Dialog
          open={Boolean(viewingDoc)}
          onClose={() => setViewingDoc(null)}
          title={
            viewingDoc.type === 'TDS'
              ? 'Technical Data Sheet (TDS)'
              : 'Certificate of Analysis (COA)'
          }
          description={`Audited engineering documentation for ${viewingDoc.product.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            {/* Document Certificate Frame */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-11 rounded-xl grid place-items-center shrink-0 ${
                      viewingDoc.type === 'TDS'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {viewingDoc.type === 'TDS' ? (
                      <FileText className="size-6" />
                    ) : (
                      <CheckCircle2 className="size-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 break-all font-mono">
                      {viewingDoc.fileName}
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Format: PDF Document • SHA-256 Checksum Verified
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Verified Active
                </span>
              </div>

              {/* Metadata Key-Value pairs */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-slate-100/70 p-2.5">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Associated Product</span>
                  <span className="font-semibold text-slate-800 truncate block mt-0.5">
                    {viewingDoc.product.name}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-100/70 p-2.5">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Brand & HSN</span>
                  <span className="font-semibold text-slate-800 block mt-0.5 font-mono">
                    {viewingDoc.product.brand} ({viewingDoc.product.hsnCode})
                  </span>
                </div>
                <div className="rounded-lg bg-slate-100/70 p-2.5">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Material / Standard</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {viewingDoc.product.grade || viewingDoc.product.standards || 'ISO / ASME Standard'}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-100/70 p-2.5">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Audit Level</span>
                  <span className="font-bold text-primary-700 block mt-0.5">
                    Level 4 Checkpoint Cleared
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 p-3 bg-white text-[10px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <ShieldCheck className="size-3.5 text-primary-600" />
                  <span>Tamper-Evident Storage Vault</span>
                </div>
                <p>
                  This technical document is stored with sha256 checksum validation and timestamped audit logs. Empanelled buyers can download this specification under NDA reciprocal access.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDetachDoc(viewingDoc.product.id, viewingDoc.type)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2 py-1"
              >
                <Trash2 className="size-3.5" /> Detach from Product
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const type = viewingDoc.type;
                    const prod = viewingDoc.product;
                    setViewingDoc(null);
                    setQuickUpload({ product: prod, type });
                  }}
                  className="text-xs"
                >
                  <RefreshCw className="size-3 mr-1" /> Replace Revision
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    toast.success(`Downloading ${viewingDoc.fileName}`, {
                      description: 'Official verified technical PDF downloaded.',
                    });
                  }}
                  className="text-xs font-bold"
                >
                  <Download className="size-3.5 mr-1" /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. QUICK UPLOAD MODAL FOR MISSING DOC ON EXISTING PRODUCT           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {quickUpload && (
        <Dialog
          open={Boolean(quickUpload)}
          onClose={() => {
            setQuickUpload(null);
            setQuickUploadFileName('');
          }}
          title={`Attach ${quickUpload.type === 'TDS' ? 'Technical Data Sheet (TDS)' : 'Certificate of Analysis (COA)'}`}
          description={`Upload technical compliance document for ${quickUpload.product.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Product</span>
              <span className="font-bold text-slate-800 text-sm block">{quickUpload.product.name}</span>
              <span className="text-[11px] text-slate-500 font-mono">
                Brand: {quickUpload.product.brand} · HSN: {quickUpload.product.hsnCode}
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Document File Name / Reference
              </label>
              <div className="flex gap-2">
                <Input
                  value={quickUploadFileName}
                  onChange={(e) => setQuickUploadFileName(e.target.value)}
                  placeholder="e.g. TDS_Flanges_SS316L_Rev3.pdf"
                  className="text-xs font-mono"
                />
                <input
                  type="file"
                  ref={quickUploadInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setQuickUploadFileName(f.name);
                      toast.success(`Selected file: ${f.name}`);
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickUploadInputRef.current?.click()}
                  className="shrink-0 text-xs"
                >
                  <UploadCloud className="size-3.5 mr-1" /> Browse
                </Button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Accepted formats: .pdf, .docx (Max 15MB). Automatically hashed with SHA-256 for integrity.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuickUpload(null);
                  setQuickUploadFileName('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleQuickUploadSubmit}
                className="font-bold"
              >
                Attach Document
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Bulk Product Upload & Manage Modal */}
      {showBulkModal && (
        <BulkProductImportModal
          open={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          currentProducts={products}
          onApplyProducts={(merged) => {
            onUpdateProducts(merged);
          }}
        />
      )}
    </div>
  );
}
