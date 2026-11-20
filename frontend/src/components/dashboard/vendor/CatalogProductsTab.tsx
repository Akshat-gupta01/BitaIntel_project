'use client';

import React, { useState, useRef } from 'react';
import { ProductCatalogItem } from '@/types/vendorRegistration';
import * as vendorService from '../../../../services/vendor.service';
import { VENDOR_CATEGORIES, CURRENCIES } from '@/config/vendorMasterData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Package,
  Plus,
  Trash2,
  FileText,
  Download,
  Eye,
  Search,
  ExternalLink,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
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
    indicativePrice: '5,000',
    currency: 'INR',
    sampleAvailability: 'Available Free',
  });

  const [itemImages, setItemImages] = useState<string[]>([]);
  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  const itemImageInputRef = useRef<HTMLInputElement | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductCatalogItem | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsnCode.includes(searchQuery)
  );

  function handleStartEditProduct(p: ProductCatalogItem) {
    setEditingProduct(p);
    setNewItem({
      name: p.name || '',
      brand: p.brand || '',
      type: p.type || 'Product',
      categoryId: p.categoryId || 'CAT017',
      specifications: p.specifications || '',
      grade: p.grade || 'SS316L',
      hsnCode: p.hsnCode || '',
      moq: p.moq || '50 Units',
      standardOrderQty: p.standardOrderQty || '200 Units',
      leadTimeDays: p.leadTimeDays || '14 Days',
      indicativePrice: p.indicativePrice || '5,000',
      currency: p.currency || 'INR',
      sampleAvailability: p.sampleAvailability || 'Available Free',
    });
    setItemImages(p.images || []);
    setShowAddModal(true);
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setEditingProduct(null);
    setItemImages([]);
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
      indicativePrice: '5,000',
      currency: 'INR',
      sampleAvailability: 'Available Free',
    });
  }

  async function handleItemImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10 MB limit`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not a valid image`);
        continue;
      }
      fileList.push(file);
    }

    if (fileList.length === 0) return;

    setUploadingItemImage(true);
    try {
      const res = await vendorService.uploadProductImages(fileList);
      const newPaths: string[] = res?.data?.paths || (res?.data?.path ? [res.data.path] : []);
      if (newPaths.length > 0) {
        setItemImages((prev) => [...prev, ...newPaths]);
        toast.success(`${newPaths.length} Image(s) uploaded successfully`);
      }
    } catch (err: any) {
      toast.error('Failed to upload image', { description: err.message });
    } finally {
      setUploadingItemImage(false);
      if (itemImageInputRef.current) itemImageInputRef.current.value = '';
    }
  }

  function handleRemoveItemImage(index: number) {
    setItemImages((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSaveProduct() {
    if (!newItem.name) {
      toast.error('Please enter product name.');
      return;
    }

    const payload: vendorService.ProductPayload = {
      name: newItem.name.trim(),
      type: newItem.type || 'Product',
      categoryId: newItem.categoryId || 'CAT001',
      subcategoryId: 'SUB187',
      brand: newItem.brand?.trim() || 'Proprietary',
      description: newItem.specifications || '',
      specifications: newItem.specifications || '',
      grade: newItem.grade || 'Standard',
      standards: 'ISO / ASME Compliant',
      hsnCode: newItem.hsnCode?.trim() || '73072100',
      countryOfOrigin: 'India',
      moq: newItem.moq || '50 Units',
      standardOrderQty: newItem.standardOrderQty || '200 Units',
      monthlyCapacity: '10,000 Units',
      availableStock: '500 Units',
      leadTimeDays: newItem.leadTimeDays || '14 Days',
      sampleAvailability: newItem.sampleAvailability || 'Available Free',
      indicativePrice: newItem.indicativePrice || '0',
      currency: newItem.currency || 'INR',
      priceValidity: '60 Days',
      targetMarkets: 'India, Global',
      images: itemImages,
    };

    // If Editing Existing Product
    if (editingProduct) {
      if (/^\d+$/.test(editingProduct.id)) {
        try {
          await vendorService.updateProduct(Number(editingProduct.id), payload);
          toast.success('Product Updated in Database', {
            description: `${payload.name} updated in business_products table.`,
          });
        } catch (err: any) {
          console.error('Update error:', err);
          toast.error('Failed to update product in database', { description: err.message });
        }
      } else {
        toast.info('Product Updated Locally', { description: payload.name });
      }

      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...payload,
              id: editingProduct.id,
              images: itemImages,
            }
          : p
      );
      onUpdateProducts(updated as ProductCatalogItem[]);
      handleCloseModal();
      return;
    }

    let assignedId = `PRD-${Date.now()}`;
    try {
      const res = await vendorService.addProduct(payload);
      if (res?.data?.product?.id) {
        assignedId = String(res.data.product.id);
      }
      toast.success('Product Saved to Database', {
        description: `${payload.name} stored in business_products table.`,
      });
    } catch (err: any) {
      console.warn('Backend product save note:', err.message);
      toast.info('Product added locally.');
    }

    const item: ProductCatalogItem = {
      id: assignedId,
      name: newItem.name || '',
      type: newItem.type || 'Product',
      categoryId: newItem.categoryId || 'CAT001',
      subcategoryId: 'SUB187',
      brand: newItem.brand || 'Proprietary',
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
      indicativePrice: newItem.indicativePrice || '0',
      currency: newItem.currency || 'INR',
      priceValidity: '60 Days',
      targetMarkets: 'India, Global',
      images: itemImages,
    };
    onUpdateProducts([...products, item]);
    handleCloseModal();
  }

  async function handleRemoveProduct(id: string) {
    onUpdateProducts(products.filter((p) => p.id !== id));
    if (/^\d+$/.test(id)) {
      try {
        await vendorService.deleteProduct(Number(id));
        toast.success('Product removed from database.');
        return;
      } catch (err: any) {
        console.warn('Backend product delete note:', err.message);
      }
    }
    toast.info('Product removed from catalog.');
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-primary-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Commercial Products & Services Catalog ({products.length})
              </h3>
              <p className="text-xs text-slate-500">
                Items visible to empanelled corporate buyers with MOQ and specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or HSN..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 w-48 sm:w-64"
              />
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold shrink-0"
            >
              <Plus className="size-3.5 mr-1" /> Add Product
            </Button>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Product / Service</th>
                <th className="p-3">HSN Code</th>
                <th className="p-3">MOQ & Batch</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3">Price / Currency</th>
                <th className="p-3">Technical Docs</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const primaryImage = p.images && p.images.length > 0 ? p.images[0] : null;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="p-3 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-md border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                          {primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={vendorService.getFullImageUrl(primaryImage)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="size-5 text-slate-300" />
                          )}
                        </div>
                        <div className="truncate min-w-0">
                          <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-200 inline-block mb-0.5">
                            {p.brand || 'Proprietary'}
                          </span>
                          <strong className="text-slate-900 block truncate text-xs">{p.name}</strong>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {p.specifications || p.grade}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{p.hsnCode}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 block">{p.moq}</span>
                      <span className="text-[10px] text-slate-400">Batch: {p.standardOrderQty}</span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{p.leadTimeDays}</td>
                    <td className="p-3">
                      <span className="font-black text-slate-900">
                        {p.currency} {p.indicativePrice || 'On Request'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{p.sampleAvailability}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toast.info(`Viewing TDS for ${p.name}`)}
                          className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 hover:bg-primary-50 hover:text-primary-700 border border-slate-200 flex items-center gap-1"
                        >
                          <FileText className="size-3" /> TDS
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.info(`Viewing COA for ${p.name}`)}
                          className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 hover:bg-primary-50 hover:text-primary-700 border border-slate-200 flex items-center gap-1"
                        >
                          <Download className="size-3" /> COA
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditProduct(p)}
                          className="text-slate-400 hover:text-primary-700 hover:bg-primary-50 p-1 rounded cursor-pointer transition-colors"
                          title="Edit Product"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(p.id)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded cursor-pointer transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {editingProduct ? (
                  <>
                    <Pencil className="size-3.5 text-primary-700" />
                    Edit Catalog Product
                  </>
                ) : (
                  'Add Product to Catalog'
                )}
              </h4>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Product Name</label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. 5-Axis Precision Alloy Bracket"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Brand</label>
                <Input
                  value={newItem.brand}
                  onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                  placeholder="e.g. Meridian AeroGrade"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">HSN Code</label>
                <Input
                  value={newItem.hsnCode}
                  onChange={(e) => setNewItem({ ...newItem, hsnCode: e.target.value })}
                  placeholder="e.g. 88033000"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">MOQ</label>
                <Input
                  value={newItem.moq}
                  onChange={(e) => setNewItem({ ...newItem, moq: e.target.value })}
                  placeholder="e.g. 50 Units"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Lead Time</label>
                <Input
                  value={newItem.leadTimeDays}
                  onChange={(e) => setNewItem({ ...newItem, leadTimeDays: e.target.value })}
                  placeholder="e.g. 14 Days"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Indicative Price</label>
                <Input
                  value={newItem.indicativePrice}
                  onChange={(e) => setNewItem({ ...newItem, indicativePrice: e.target.value })}
                  placeholder="e.g. 8,450"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Currency</label>
                <select
                  value={newItem.currency}
                  onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
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
                  placeholder="Material grade, tolerances, ASTM standards..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              {/* Product Photos Upload in Modal */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-primary-600" />
                    Product Images ({itemImages.length})
                  </label>
                  <button
                    type="button"
                    disabled={uploadingItemImage}
                    onClick={() => itemImageInputRef.current?.click()}
                    className="text-[11px] font-bold text-primary-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {uploadingItemImage ? (
                      <>
                        <Loader2 className="size-3 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-3.5" /> Upload Photos
                      </>
                    )}
                  </button>
                </div>

                <input
                  ref={itemImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleItemImageSelect}
                />

                {itemImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {itemImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg border border-slate-200 overflow-hidden aspect-square bg-slate-50 flex items-center justify-center"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={vendorService.getFullImageUrl(imgUrl)}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-primary-700/90 text-white text-[8px] font-bold px-1 rounded">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItemImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600/90 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => itemImageInputRef.current?.click()}
                    className="border border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-[11px] text-slate-500 font-medium">Click to upload product photos (JPG, PNG, WEBP)</p>
                    <span className="text-[10px] text-slate-400">First photo will be set as primary thumbnail</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveProduct} className="font-bold">
                {editingProduct ? 'Update Product' : 'Save to Catalog'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
