/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { ProductCatalogItem } from '@/types/vendorRegistration';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  HelpCircle,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkProductImportModalProps {
  open: boolean;
  onClose: () => void;
  currentProducts: ProductCatalogItem[];
  onApplyProducts: (mergedProducts: ProductCatalogItem[]) => void;
}

interface ParsedProductRow {
  rowNumber: number;
  status: 'update' | 'new' | 'error';
  statusMessage: string;
  matchedProductId?: string;
  item: ProductCatalogItem;
}

// 2 Pre-populated sample rows showing proper formatting for both industrial & commercial products
const SAMPLE_TEMPLATE_DATA = [
  {
    'Product ID': '', // Leave empty to add a new product, or put existing ID (e.g. PRD-01) to update
    'Product Name': 'High-Tensile Precision Structural Steel Flanges',
    'Type': 'Product',
    'Brand': 'Meridian AeroGrade',
    'Category ID': 'CAT017',
    'Subcategory ID': 'SUB187',
    'HSN Code': '73072100',
    'Grade': 'SS316L / ASTM A105',
    'Standards': 'ASME B16.5, ASTM A182, EN 10204 3.1 Certified',
    'MOQ': '50 Pieces',
    'Standard Order Qty': '500 Pieces',
    'Lead Time': '14 Days',
    'Indicative Price': '8450',
    'Currency': 'INR',
    'Price Validity': '90 Days',
    'Monthly Capacity': '25,000 Pieces',
    'Available Stock': '3,200 Pieces',
    'Sample Availability': 'Available Free',
    'Specifications': 'Sizes 1/2" to 24", Pressure Class 150# to 2500#, Tolerance +/- 0.02mm',
    'Country Of Origin': 'India',
    'Target Markets': 'India, Germany, USA, Saudi Arabia, Singapore',
    'Technical Data Sheet Doc': 'TDS_Flanges_ASTM_A105_SS316L.pdf',
    'COA Doc': 'COA_Batch_2026_Meridian_EN10204.pdf',
  },
  {
    'Product ID': '', // Leave empty to add a new product
    'Product Name': '5-Axis CNC Precision Aeroframe Bracket',
    'Type': 'Product',
    'Brand': 'Meridian Precision',
    'Category ID': 'CAT004',
    'Subcategory ID': 'SUB042',
    'HSN Code': '88033000',
    'Grade': 'Al 7075-T651 / Ti-6Al-4V',
    'Standards': 'AS9100D, ISO 9001:2015',
    'MOQ': '10 Sets',
    'Standard Order Qty': '50 Sets',
    'Lead Time': '28 Days',
    'Indicative Price': '1450',
    'Currency': 'USD',
    'Price Validity': '60 Days',
    'Monthly Capacity': '300 Sets',
    'Available Stock': '25 Sets',
    'Sample Availability': 'Available Paid',
    'Specifications': 'Surface anodized MIL-A-8625 Type II, ultrasonic test inspected',
    'Country Of Origin': 'India',
    'Target Markets': 'North America, European Union, APAC',
    'Technical Data Sheet Doc': 'TDS_AeroFrame_MilSpec_7075.pdf',
    'COA Doc': '',
  },
];

function buildCatalogExportFilename(ext: 'xlsx' | 'csv'): string {
  return `bitaintel_current_catalog_export_${Date.now()}.${ext}`;
}

export function BulkProductImportModal({
  open,
  onClose,
  currentProducts,
  onApplyProducts,
}: BulkProductImportModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'templates' | 'guide'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract values case-insensitively with alias support
  function getField(row: Record<string, any>, ...keys: string[]): string {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return String(row[k]).trim();
      }
      const targetNormalized = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [rKey, val] of Object.entries(row)) {
        if (rKey.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNormalized) {
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return String(val).trim();
          }
        }
      }
    }
    return '';
  }

  // --- DOWNLOAD HELPERS ---

  function downloadSampleExcel() {
    try {
      const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_DATA);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Product_Catalog_Template');
      XLSX.writeFile(wb, 'bitaintel_product_catalog_sample_template.xlsx');
      toast.success('Sample Excel Sheet Downloaded', {
        description: 'Edit or add your products and upload the file back here.',
      });
    } catch (err: any) {
      toast.error('Failed to download Excel template: ' + (err?.message || ''));
    }
  }

  function downloadSampleCSV() {
    try {
      const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_DATA);
      const csvContent = XLSX.utils.sheet_to_csv(ws);
      downloadBlob(csvContent, 'bitaintel_product_catalog_sample_template.csv', 'text/csv;charset=utf-8;');
      toast.success('Sample CSV Sheet Downloaded');
    } catch (err: any) {
      toast.error('Failed to download CSV template: ' + (err?.message || ''));
    }
  }

  function buildCurrentCatalogExportRows() {
    return currentProducts.map((p) => ({
      'Product ID': p.id !== undefined && p.id !== null ? String(p.id) : '',
      'Product Name': p.name,
      'Type': p.type || 'Product',
      'Brand': p.brand || '',
      'Category ID': p.categoryId || 'CAT001',
      'Subcategory ID': p.subcategoryId || '',
      'HSN Code': p.hsnCode || '',
      'Grade': p.grade || '',
      'Standards': p.standards || '',
      'MOQ': p.moq || '',
      'Standard Order Qty': p.standardOrderQty || '',
      'Lead Time': p.leadTimeDays || '',
      'Indicative Price': p.indicativePrice || '',
      'Currency': p.currency || 'INR',
      'Price Validity': p.priceValidity || '60 Days',
      'Monthly Capacity': p.monthlyCapacity || '',
      'Available Stock': p.availableStock || '',
      'Sample Availability': p.sampleAvailability || 'Available Free',
      'Specifications': p.specifications || p.description || '',
      'Country Of Origin': p.countryOfOrigin || 'India',
      'Target Markets': p.targetMarkets || 'India, Global',
      'Technical Data Sheet Doc': p.technicalDataSheetDoc || '',
      'COA Doc': p.coaDoc || '',
    }));
  }

  function exportCurrentExcel() {
    if (currentProducts.length === 0) {
      toast.info('No active products to export', {
        description: 'Add a product first or download the Standard Blank Template.',
      });
      return;
    }
    try {
      const exportRows = buildCurrentCatalogExportRows();
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Current_Catalog');
      XLSX.writeFile(wb, buildCatalogExportFilename('xlsx'));
      toast.success('Current Catalog Exported to Excel', {
        description: `${exportRows.length} active products exported for bulk editing.`,
      });
    } catch (err: any) {
      toast.error('Failed to export catalog: ' + (err?.message || ''));
    }
  }

  function exportCurrentCSV() {
    if (currentProducts.length === 0) {
      toast.info('No active products to export', {
        description: 'Add a product first or download the Standard Blank Template.',
      });
      return;
    }
    try {
      const exportRows = buildCurrentCatalogExportRows();
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const csvContent = XLSX.utils.sheet_to_csv(ws);
      downloadBlob(csvContent, buildCatalogExportFilename('csv'), 'text/csv;charset=utf-8;');
      toast.success('Current Catalog Exported to CSV');
    } catch (err: any) {
      toast.error('Failed to export CSV: ' + (err?.message || ''));
    }
  }

  function downloadBlob(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- FILE PARSING & VALIDATION ---

  function handleFileSelected(file: File) {
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          toast.error('No sheets found in workbook.');
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          toast.error('The selected file contains no data rows.');
          return;
        }

        // Process rows & detect updates vs adds
        const analyzed: ParsedProductRow[] = rawJson.map((row, idx) => {
          const rowNumber = idx + 2; // +1 for 0-index, +1 for header row
          const productId = getField(row, 'Product ID', 'id', 'productId', 'ID');
          const productName = getField(row, 'Product Name', 'name', 'product_name', 'Title');

          if (!productName) {
            return {
              rowNumber,
              status: 'error',
              statusMessage: 'Product Name is missing (Required)',
              item: {
                id: productId || `PRD-ERR-${idx}`,
                name: '[Unnamed Product]',
                type: 'Product',
                categoryId: 'CAT001',
                subcategoryId: '',
                brand: '',
                description: '',
                specifications: '',
                grade: '',
                standards: '',
                hsnCode: '',
                countryOfOrigin: 'India',
                moq: '50 Units',
                standardOrderQty: '200 Units',
                monthlyCapacity: '',
                availableStock: '',
                leadTimeDays: '14 Days',
                sampleAvailability: 'Available Free',
                currency: 'INR',
                priceValidity: '60 Days',
                targetMarkets: 'India',
              },
            };
          }

          // Check if product ID matches an existing product in the catalog
          const existing = productId
            ? currentProducts.find((p) => String(p.id) === productId)
            : undefined;

          const item: ProductCatalogItem = {
            ...(existing ? existing : {}),
            id: existing ? String(existing.id) : productId ? productId : `PRD-${Date.now()}-${idx}`,
            name: productName,
            type: (getField(row, 'Type', 'type') as 'Product' | 'Service') || (existing ? existing.type : 'Product'),
            brand: getField(row, 'Brand', 'brand') || (existing ? existing.brand : 'Proprietary'),
            categoryId: getField(row, 'Category ID', 'categoryId') || (existing ? existing.categoryId : 'CAT001'),
            subcategoryId: getField(row, 'Subcategory ID', 'subcategoryId') || (existing ? existing.subcategoryId : 'SUB187'),
            hsnCode: getField(row, 'HSN Code', 'hsnCode', 'hsn') || (existing ? existing.hsnCode : '73072100'),
            grade: getField(row, 'Grade', 'grade') || (existing ? existing.grade : 'Standard'),
            standards: getField(row, 'Standards', 'standards') || (existing ? existing.standards : 'ISO / ASME Compliant'),
            moq: getField(row, 'MOQ', 'moq') || (existing ? existing.moq : '50 Units'),
            standardOrderQty: getField(row, 'Standard Order Qty', 'standardOrderQty') || (existing ? existing.standardOrderQty : '200 Units'),
            leadTimeDays: getField(row, 'Lead Time', 'leadTimeDays') || (existing ? existing.leadTimeDays : '14 Days'),
            indicativePrice: getField(row, 'Indicative Price', 'indicativePrice', 'price'),
            currency: getField(row, 'Currency', 'currency') || (existing ? existing.currency : 'INR'),
            priceValidity: getField(row, 'Price Validity', 'priceValidity') || (existing ? existing.priceValidity : '60 Days'),
            monthlyCapacity: getField(row, 'Monthly Capacity', 'monthlyCapacity') || (existing ? existing.monthlyCapacity : '10,000 Units'),
            availableStock: getField(row, 'Available Stock', 'availableStock') || (existing ? existing.availableStock : '500 Units'),
            sampleAvailability: (getField(row, 'Sample Availability', 'sampleAvailability') as any) || (existing ? existing.sampleAvailability : 'Available Free'),
            specifications: getField(row, 'Specifications', 'specifications', 'description') || (existing ? existing.specifications : ''),
            description: getField(row, 'Specifications', 'specifications', 'description') || (existing ? existing.description : ''),
            countryOfOrigin: getField(row, 'Country Of Origin', 'countryOfOrigin') || (existing ? existing.countryOfOrigin : 'India'),
            targetMarkets: getField(row, 'Target Markets', 'targetMarkets') || (existing ? existing.targetMarkets : 'India, Global'),
            technicalDataSheetDoc: getField(row, 'Technical Data Sheet Doc', 'technicalDataSheetDoc', 'tds') || (existing ? existing.technicalDataSheetDoc : undefined),
            coaDoc: getField(row, 'COA Doc', 'coaDoc', 'coa') || (existing ? existing.coaDoc : undefined),
          };

          if (existing) {
            return {
              rowNumber,
              status: 'update',
              statusMessage: `Matches existing product ID (${existing.id})`,
              matchedProductId: existing.id,
              item,
            };
          } else {
            return {
              rowNumber,
              status: 'new',
              statusMessage: productId ? `New product with specified ID (${productId})` : 'New product to add',
              item,
            };
          }
        });

        setParsedRows(analyzed);

        const updates = analyzed.filter((r) => r.status === 'update').length;
        const news = analyzed.filter((r) => r.status === 'new').length;
        const errors = analyzed.filter((r) => r.status === 'error').length;

        toast.success(`Sheet Parsed: ${analyzed.length} Row(s)`, {
          description: `${updates} existing product(s) to update, ${news} new product(s) to add${errors > 0 ? `, ${errors} invalid row(s)` : ''}.`,
        });
      } catch (err: any) {
        toast.error('File parsing error', {
          description: err?.message || 'Unsupported format or corrupted file.',
        });
      }
    };

    reader.readAsArrayBuffer(file);
  }

  // --- MERGE & COMMIT CHANGES ---

  function handleCommitImport() {
    const validRows = parsedRows.filter((r) => r.status !== 'error');
    if (validRows.length === 0) {
      toast.error('No valid products to import.');
      return;
    }

    const updates = validRows.filter((r) => r.status === 'update');
    const news = validRows.filter((r) => r.status === 'new');

    // Build map of updated items
    const updateMap = new Map<string, ProductCatalogItem>();
    updates.forEach((u) => {
      updateMap.set(String(u.item.id), u.item);
    });

    // 1. Update existing products in place
    const updatedExistingList = currentProducts.map((p) => {
      const key = String(p.id);
      if (updateMap.has(key)) {
        return updateMap.get(key)!;
      }
      return p;
    });

    // 2. Append new products
    const finalMergedList = [...updatedExistingList, ...news.map((n) => n.item)];

    onApplyProducts(finalMergedList);
    toast.success('Bulk Import Applied Successfully', {
      description: `Updated ${updates.length} product(s) and added ${news.length} new product(s). Catalog now has ${finalMergedList.length} items.`,
    });

    // Reset and close
    setSelectedFile(null);
    setParsedRows([]);
    onClose();
  }

  function handleResetUpload() {
    setSelectedFile(null);
    setParsedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const updatesCount = parsedRows.filter((r) => r.status === 'update').length;
  const newsCount = parsedRows.filter((r) => r.status === 'new').length;
  const errorsCount = parsedRows.filter((r) => r.status === 'error').length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title="Bulk Product Upload & Catalog Management"
      description="Upload CSV or Excel spreadsheets to import new products or update existing catalog items in bulk."
    >
      <div className="space-y-5 text-xs">
        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2 text-xs ${
              activeTab === 'upload'
                ? 'bg-white text-primary-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="size-4" />
            <span>Upload &amp; Bulk Update</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2 text-xs ${
              activeTab === 'templates'
                ? 'bg-white text-primary-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="size-4" />
            <span>Download Sample Sheets &amp; Export</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2 text-xs ${
              activeTab === 'guide'
                ? 'bg-white text-primary-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="size-4" />
            <span>Format Guide</span>
          </button>
        </div>

        {/* ── TAB 1: UPLOAD & BULK UPDATE ── */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelected(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-primary-400 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelected(f);
                  }}
                />

                <div className="size-14 rounded-2xl bg-white border border-slate-200 text-primary-700 shadow-xs grid place-items-center mx-auto mb-3.5">
                  <UploadCloud className="size-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Click to select or drag and drop your spreadsheet here
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Supports Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) and standard Comma Separated (<strong>.csv</strong>) up to 10MB.
                </p>

                <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">
                    {currentProducts.length > 0
                      ? `Download your catalog (${currentProducts.length} live ${currentProducts.length === 1 ? 'product' : 'products'}):`
                      : 'Need a starter template?'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentProducts.length > 0) {
                        exportCurrentExcel();
                      } else {
                        downloadSampleExcel();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-300 font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs"
                  >
                    <FileSpreadsheet className="size-3.5 text-emerald-600" />
                    <span>Download Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentProducts.length > 0) {
                        exportCurrentCSV();
                      } else {
                        downloadSampleCSV();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <Download className="size-3.5 text-slate-500" />
                    <span>Download CSV (.csv)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Header Bar */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-11 rounded-xl bg-primary-100 text-primary-800 grid place-items-center shrink-0 border border-primary-200">
                      <FileSpreadsheet className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {selectedFile.name}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB · {parsedRows.length} Row(s) parsed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetUpload}
                      className="text-xs"
                    >
                      <X className="size-3.5 mr-1" /> Choose Other File
                    </Button>
                  </div>
                </div>

                {/* Analysis Metrics Cards */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-2xl border border-primary-200 bg-primary-50/70 p-3">
                    <span className="text-[10px] uppercase font-bold text-primary-700 block">
                      To Update
                    </span>
                    <span className="text-xl font-extrabold text-primary-900 block mt-0.5">
                      {updatesCount}
                    </span>
                    <span className="text-[10px] text-primary-600 block">Existing IDs matched</span>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                      New Products
                    </span>
                    <span className="text-xl font-extrabold text-emerald-900 block mt-0.5">
                      {newsCount}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">Will be added</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Validation Issues
                    </span>
                    <span className="text-xl font-extrabold text-slate-800 block mt-0.5">
                      {errorsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {errorsCount === 0 ? 'All rows valid' : 'Missing required title'}
                    </span>
                  </div>
                </div>

                {/* Live Parsed Preview Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Spreadsheet Rows Preview ({parsedRows.length})
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Scroll to review detected changes before applying
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-2.5">Action / Status</th>
                          <th className="p-2.5">Product Name</th>
                          <th className="p-2.5">Brand / Grade</th>
                          <th className="p-2.5">Price &amp; Currency</th>
                          <th className="p-2.5">MOQ</th>
                          <th className="p-2.5">Docs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {parsedRows.map((r, idx) => (
                          <tr
                            key={idx}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              r.status === 'error' ? 'bg-rose-50/50' : ''
                            }`}
                          >
                            <td className="p-2.5 whitespace-nowrap">
                              {r.status === 'update' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800 border border-primary-200">
                                  <RefreshCw className="size-2.5" />
                                  Update ({r.matchedProductId})
                                </span>
                              )}
                              {r.status === 'new' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Check className="size-2.5" />
                                  New Item
                                </span>
                              )}
                              {r.status === 'error' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <AlertTriangle className="size-2.5" />
                                  Missing Name
                                </span>
                              )}
                            </td>

                            <td className="p-2.5 font-semibold text-slate-900 max-w-[220px] truncate">
                              {r.item.name}
                            </td>

                            <td className="p-2.5 text-slate-600 max-w-[150px] truncate">
                              {r.item.brand} {r.item.grade ? `(${r.item.grade})` : ''}
                            </td>

                            <td className="p-2.5 font-bold text-slate-800 whitespace-nowrap">
                              {r.item.indicativePrice &&
                              r.item.indicativePrice !== '0' &&
                              r.item.indicativePrice.toLowerCase() !== 'on request'
                                ? `${r.item.currency} ${r.item.indicativePrice}`
                                : 'On Request'}
                            </td>

                            <td className="p-2.5 text-slate-600 whitespace-nowrap">
                              {r.item.moq}
                            </td>

                            <td className="p-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                {r.item.technicalDataSheetDoc && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    TDS
                                  </span>
                                )}
                                {r.item.coaDoc && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    COA
                                  </span>
                                )}
                                {!r.item.technicalDataSheetDoc && !r.item.coaDoc && (
                                  <span className="text-[10px] text-slate-400">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Commit Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-slate-500 text-[11px]">
                    Applying this will update {updatesCount} existing item(s) and append {newsCount} new item(s).
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCommitImport}
                      disabled={updatesCount + newsCount === 0}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#1e3a8a] hover:bg-[#172554] disabled:opacity-50 text-white px-6 py-2 text-xs font-bold shadow-sm transition-all"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Apply Bulk Changes ({updatesCount + newsCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: DOWNLOAD TEMPLATES & EXPORT ── */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {/* 2-Column Responsive Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Sample Blank Template */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0 border border-emerald-100">
                      <FileSpreadsheet className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Standard Blank Template
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        For Adding New Products
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    Pre-formatted template with all commercial and technical columns, including sample reference rows ready for your items.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-5">
                  <button
                    type="button"
                    onClick={downloadSampleExcel}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="size-4" />
                    <span>Download Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadSampleCSV}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
                  >
                    <Download className="size-4 text-slate-500" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Export Current Catalog for Bulk Editing */}
              <div className="rounded-2xl border border-primary-200 bg-primary-50/30 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-xl bg-primary-700 text-white grid place-items-center shrink-0 shadow-xs">
                      <RefreshCw className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Export Active Catalog
                      </h4>
                      <span className="text-[10px] font-semibold text-primary-800 bg-primary-100/70 px-2 py-0.5 rounded-full border border-primary-200">
                        For Bulk Editing ({currentProducts.length} items)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Exports your current catalog items with their unique <strong>Product IDs</strong> so you can bulk-modify pricing, lead times, or MOQs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-5">
                  <button
                    type="button"
                    onClick={exportCurrentExcel}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="size-4" />
                    <span>Export Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportCurrentCSV}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-colors"
                  >
                    <Download className="size-4 text-slate-500" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3-Step Walkthrough Guide */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <HelpCircle className="size-4 text-primary-700" />
                <span>How Bulk Spreadsheet Editing Works</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="size-5 rounded-full bg-primary-100 text-primary-800 text-[11px] grid place-items-center font-bold">1</span>
                    Download or Export
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Download a blank template to register new items, or export your active catalog.
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="size-5 rounded-full bg-primary-100 text-primary-800 text-[11px] grid place-items-center font-bold">2</span>
                    Edit in Excel or Sheets
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Rows with existing <strong>Product ID</strong> will update in place. Leave blank to add new.
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="size-5 rounded-full bg-primary-100 text-primary-800 text-[11px] grid place-items-center font-bold">3</span>
                    Upload &amp; Apply
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Upload the spreadsheet back here. The system previews and validates all changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: FORMAT GUIDE ── */}
        {activeTab === 'guide' && (
          <div className="space-y-3">
            <p className="text-slate-600 leading-relaxed text-xs">
              The spreadsheet parser automatically handles variations in header naming (such as <code>Product Name</code> vs <code>name</code>). Price, TDS, and COA are completely optional.
            </p>

            <div className="rounded-2xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">Column Header</th>
                    <th className="p-2.5">Requirement</th>
                    <th className="p-2.5">Description &amp; Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">Product ID</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">Leave blank for new products. Enter existing ID (e.g. <code>PRD-01</code>) to update.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">Product Name</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Required</span></td>
                    <td className="p-2.5 text-slate-600">The commercial title of the product or service.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">Brand</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">Brand name (e.g. <code>Meridian AeroGrade</code>). Defaults to Proprietary.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">Indicative Price</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">Unit price (e.g. <code>8450</code>). Leave blank for &quot;On Request&quot;.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">Currency</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">ISO Currency code: <code>INR</code>, <code>USD</code>, <code>EUR</code>. Defaults to INR.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">MOQ</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">Minimum Order Quantity (e.g. <code>50 Units</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">Lead Time</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">Manufacturing/dispatch lead time (e.g. <code>14 Days</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">HSN Code</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">8-digit HSN/ITC code (e.g. <code>73072100</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">Technical Data Sheet Doc</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">Filename of certified TDS (e.g. <code>TDS_Flanges_SS316L.pdf</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-slate-900">COA Doc</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Optional</span></td>
                    <td className="p-2.5 text-slate-600">Filename of Certificate of Analysis (e.g. <code>COA_Batch_2026.pdf</code>).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="primary" size="sm" onClick={() => setActiveTab('upload')}>
                Go to Upload &rarr;
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

