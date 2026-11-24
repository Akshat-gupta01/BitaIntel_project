'use client';

import React, { useState, useRef } from 'react';
import {
  Step4ProductsData,
  ProductCatalogItem,
  QualityCertificateRecord,
  RegulatoryApproval,
} from '@/types/vendorRegistration';
import * as vendorService from '../../../../services/vendor.service';
import { ProductThumbnail } from '@/components/shared/ProductThumbnail';
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
  Image as ImageIcon,
  Loader2,
  Pencil,
  FileCheck,
  ExternalLink,
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
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [attachedDocs, setAttachedDocs] = useState<{
    tds?: { name: string; url: string };
    coa?: { name: string; url: string };
    sds?: { name: string; url: string };
    catalog?: { name: string; url: string };
  }>({});

  const tdsInputRef = useRef<HTMLInputElement | null>(null);
  const coaInputRef = useRef<HTMLInputElement | null>(null);
  const sdsInputRef = useRef<HTMLInputElement | null>(null);
  const catalogInputRef = useRef<HTMLInputElement | null>(null);

  // Product Image Upload State
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlToFileMapRef = useRef<Map<string, File>>(new Map());

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      for (const url of previewUrlToFileMapRef.current.keys()) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
      previewUrlToFileMapRef.current.clear();
    };
  }, []);

  // Edit Product State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

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

  // Handle Technical Document Upload (TDS, COA, SDS, Catalog)
  async function handleProductDocSelect(
    type: 'tds' | 'coa' | 'sds' | 'catalog',
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15 MB limit');
      return;
    }

    setUploadingDoc(type);
    try {
      const res = await vendorService.uploadProductDocument(file, type);
      const docPath = res?.data?.path || res?.data?.url;

      if (type === 'tds') {
        setNewProduct((prev) => ({ ...prev, technicalDataSheetDoc: docPath }));
      } else if (type === 'coa') {
        setNewProduct((prev) => ({ ...prev, coaDoc: docPath }));
      } else if (type === 'sds') {
        setNewProduct((prev) => ({ ...prev, sdsDoc: docPath }));
      } else if (type === 'catalog') {
        setNewProduct((prev) => ({ ...prev, catalogueDoc: docPath }));
      }

      setAttachedDocs((prev) => ({
        ...prev,
        [type]: { name: file.name, url: docPath },
      }));

      toast.success(`${type.toUpperCase()} Attached`, {
        description: `${file.name} uploaded successfully.`,
      });
    } catch (err: any) {
      console.error('Doc upload error:', err);
      toast.error(`Failed to upload ${type.toUpperCase()}`, {
        description: err.message || 'Please check backend server.',
      });
    } finally {
      setUploadingDoc(null);
    }
  }

  function handleRemoveAttachedDoc(type: 'tds' | 'coa' | 'sds' | 'catalog') {
    if (type === 'tds') {
      setNewProduct((prev) => ({ ...prev, technicalDataSheetDoc: undefined }));
      if (tdsInputRef.current) tdsInputRef.current.value = '';
    } else if (type === 'coa') {
      setNewProduct((prev) => ({ ...prev, coaDoc: undefined }));
      if (coaInputRef.current) coaInputRef.current.value = '';
    } else if (type === 'sds') {
      setNewProduct((prev) => ({ ...prev, sdsDoc: undefined }));
      if (sdsInputRef.current) sdsInputRef.current.value = '';
    } else if (type === 'catalog') {
      setNewProduct((prev) => ({ ...prev, catalogueDoc: undefined }));
      if (catalogInputRef.current) catalogInputRef.current.value = '';
    }

    setAttachedDocs((prev) => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });
    toast.info(`${type.toUpperCase()} removed`);
  }

  // Product Image Files State (raw File objects, uploaded on save)
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);

  // Handle Product Images Selection (creates instant local previews, uploads to server on save)
  function handleProductImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
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
        toast.error(`"${file.name}" is not a valid image format`);
        continue;
      }
      fileList.push(file);
    }

    if (fileList.length === 0) return;

    const existingKeys = new Set(
      Array.from(previewUrlToFileMapRef.current.values()).map((f) => `${f.name}-${f.size}`)
    );
    const uniqueFiles = fileList.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));

    if (uniqueFiles.length === 0) {
      toast.info('Selected image(s) already added');
      if (e.target) e.target.value = '';
      return;
    }

    const newPreviewUrls: string[] = [];
    for (const file of uniqueFiles) {
      const previewUrl = URL.createObjectURL(file);
      previewUrlToFileMapRef.current.set(previewUrl, file);
      newPreviewUrls.push(previewUrl);
    }

    setProductImageFiles(Array.from(previewUrlToFileMapRef.current.values()));
    setProductImages((prev) => [...prev, ...newPreviewUrls]);
    setNewProduct((p) => ({
      ...p,
      images: [...(p.images || []), ...newPreviewUrls],
    }));

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    toast.success(`${uniqueFiles.length} photo(s) selected`, {
      description: 'Preview is visible below. Click "Save Product to Catalog" to save.',
    });
  }

  function handleRemoveProductImage(indexToRemove: number) {
    const urlToRemove = productImages[indexToRemove];
    if (urlToRemove) {
      if (previewUrlToFileMapRef.current.has(urlToRemove)) {
        previewUrlToFileMapRef.current.delete(urlToRemove);
        setProductImageFiles(Array.from(previewUrlToFileMapRef.current.values()));
      }
      if (urlToRemove.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(urlToRemove);
        } catch {}
      }
    }

    setProductImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      setNewProduct((p) => ({ ...p, images: updated }));
      return updated;
    });
    toast.info('Image removed');
  }

  // Start Editing an existing product
  function handleStartEditProduct(prd: ProductCatalogItem) {
    // Clear any previous previews
    for (const url of previewUrlToFileMapRef.current.keys()) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    previewUrlToFileMapRef.current.clear();
    setProductImageFiles([]);
    setUploadingItemImage(false);

    setEditingProductId(prd.id);
    setNewProduct({
      type: prd.type || 'Product',
      name: prd.name || '',
      brand: prd.brand || '',
      categoryId: prd.categoryId || selectedCategoryIds[0] || 'CAT001',
      subcategoryId: prd.subcategoryId || '',
      description: prd.description || '',
      specifications: prd.specifications || '',
      grade: prd.grade || '',
      standards: prd.standards || '',
      hsnCode: prd.hsnCode || '',
      countryOfOrigin: prd.countryOfOrigin || 'India',
      moq: prd.moq || '100 Units',
      standardOrderQty: prd.standardOrderQty || '500 Units',
      monthlyCapacity: prd.monthlyCapacity || '10,000 Units',
      availableStock: prd.availableStock || '500 Units',
      leadTimeDays: prd.leadTimeDays || '15 Days',
      sampleAvailability: prd.sampleAvailability || 'Available Free',
      indicativePrice: prd.indicativePrice || '',
      currency: prd.currency || 'INR',
      priceValidity: prd.priceValidity || '60 Days',
      targetMarkets: prd.targetMarkets || 'India, Global',
      images: vendorService.normalizeImageArray(prd.images),
      catalogueDoc: prd.catalogueDoc,
      technicalDataSheetDoc: prd.technicalDataSheetDoc,
      coaDoc: prd.coaDoc,
      sdsDoc: prd.sdsDoc,
    });
    setProductImages(vendorService.normalizeImageArray(prd.images));

    const docs: typeof attachedDocs = {};
    if (prd.technicalDataSheetDoc) {
      docs.tds = { name: 'Technical Data Sheet (TDS)', url: prd.technicalDataSheetDoc };
    }
    if (prd.coaDoc) {
      docs.coa = { name: 'Certificate of Analysis (COA)', url: prd.coaDoc };
    }
    if (prd.sdsDoc) {
      docs.sds = { name: 'Safety Data Sheet (SDS)', url: prd.sdsDoc };
    }
    if (prd.catalogueDoc) {
      docs.catalog = { name: 'Product Catalogue', url: prd.catalogueDoc };
    }
    setAttachedDocs(docs);

    setShowAddProduct(true);
  }

  // Cancel Add / Edit Product
  function handleCancelProductForm() {
    for (const url of previewUrlToFileMapRef.current.keys()) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    previewUrlToFileMapRef.current.clear();
    setProductImageFiles([]);
    setUploadingItemImage(false);

    setEditingProductId(null);
    setShowAddProduct(false);
    setAttachedDocs({});
    setProductImages([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
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
      images: [],
    });
  }

  // Add Certificate modal / form
  const [showAddCert, setShowAddCert] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [uploadingCertDoc, setUploadingCertDoc] = useState(false);
  const certDocInputRef = useRef<HTMLInputElement | null>(null);
  const [certDocFileName, setCertDocFileName] = useState<string | null>(null);

  const [newCert, setNewCert] = useState<Partial<QualityCertificateRecord>>({
    certificateType: STANDARD_CERTIFICATIONS[0],
    certificateNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    scope: '',
    applicableFacility: 'All Facilities',
    evidenceDoc: undefined,
    status: 'Active',
  });

  // Handle Certificate Evidence Document Upload (PDF / JPG / PNG)
  async function handleCertDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15 MB limit');
      return;
    }

    setUploadingCertDoc(true);
    try {
      const res = await vendorService.uploadCertificationDocument(
        file,
        editingCertId && /^\d+$/.test(editingCertId) ? Number(editingCertId) : undefined
      );
      const docPath = res?.data?.path || res?.data?.url;
      setNewCert((prev) => ({ ...prev, evidenceDoc: docPath }));
      setCertDocFileName(file.name);
      toast.success('Certificate Document Attached', {
        description: `${file.name} uploaded successfully.`,
      });
    } catch (err: any) {
      console.error('Cert document upload error:', err);
      toast.error('Failed to upload certificate document', {
        description: err.message || 'Please check backend server connection.',
      });
    } finally {
      setUploadingCertDoc(false);
      if (certDocInputRef.current) certDocInputRef.current.value = '';
    }
  }

  function handleRemoveCertDoc() {
    setNewCert((prev) => ({ ...prev, evidenceDoc: undefined }));
    setCertDocFileName(null);
    if (certDocInputRef.current) certDocInputRef.current.value = '';
    toast.info('Certificate document removed');
  }

  function handleStartEditCert(cert: QualityCertificateRecord) {
    setEditingCertId(cert.id);
    setNewCert({
      certificateType: cert.certificateType,
      certificateNumber: cert.certificateNumber,
      issuingAuthority: cert.issuingAuthority,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      scope: cert.scope,
      applicableFacility: cert.applicableFacility,
      evidenceDoc: cert.evidenceDoc,
      status: cert.status,
    });
    setCertDocFileName(cert.evidenceDoc ? cert.evidenceDoc.split('/').pop() || 'Attached Document' : null);
    setShowAddCert(true);
  }

  function handleCancelCertForm() {
    setEditingCertId(null);
    setShowAddCert(false);
    setCertDocFileName(null);
    setNewCert({
      certificateType: STANDARD_CERTIFICATIONS[0],
      certificateNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      scope: '',
      applicableFacility: 'All Facilities',
      evidenceDoc: undefined,
      status: 'Active',
    });
  }

  // Add/Update Product & save to MySQL business_products
  async function handleAddProduct() {
    if (!newProduct.name || !newProduct.categoryId) {
      toast.error('Please enter product name and select a category.');
      return;
    }

    // Collect pending files to upload
    const pendingEntries: { url: string; file: File }[] = [];
    for (const url of productImages) {
      const file = previewUrlToFileMapRef.current.get(url);
      if (file) {
        pendingEntries.push({ url, file });
      }
    }

    let finalImages: string[] = [];

    if (pendingEntries.length > 0) {
      setUploadingItemImage(true);
      try {
        const filesToUpload = pendingEntries.map((e) => e.file);
        const uploadRes = await vendorService.uploadProductImages(filesToUpload);
        const returnedPaths: string[] =
          uploadRes?.data?.paths ||
          uploadRes?.data?.urls ||
          (uploadRes?.data?.path ? [uploadRes.data.path] : []) ||
          (uploadRes?.data?.url ? [uploadRes.data.url] : []) ||
          (uploadRes?.paths ? uploadRes.paths : []) ||
          (uploadRes?.path ? [uploadRes.path] : []) ||
          [];

        if (returnedPaths.length > 0) {
          let pathIdx = 0;
          finalImages = productImages
            .map((imgUrl) => {
              if (previewUrlToFileMapRef.current.has(imgUrl)) {
                if (pathIdx < returnedPaths.length) {
                  return returnedPaths[pathIdx++];
                }
              }
              return imgUrl;
            })
            .filter((img) => !img.startsWith('blob:') || !returnedPaths.length);
        } else {
          finalImages = productImages.filter((img) => !img.startsWith('blob:'));
        }

        // Clean up preview object URLs
        for (const { url } of pendingEntries) {
          try {
            URL.revokeObjectURL(url);
          } catch {}
          previewUrlToFileMapRef.current.delete(url);
        }
        setProductImageFiles([]);
      } catch (err: any) {
        console.error('Product image upload error:', err);
        toast.error('Failed to upload product images to server', {
          description: err.message || 'Please check backend server connection.',
        });
        // Fallback: keep productImages
        finalImages = [...productImages];
      } finally {
        setUploadingItemImage(false);
      }
    } else {
      finalImages = productImages.filter((img) => !img.startsWith('blob:'));
      if (finalImages.length === 0 && newProduct.images) {
        finalImages = newProduct.images.filter((img) => !img.startsWith('blob:'));
      }
    }

    const payload: vendorService.ProductPayload = {
      name: newProduct.name.trim(),
      type: newProduct.type || 'Product',
      categoryId: newProduct.categoryId || selectedCategoryIds[0] || 'CAT001',
      subcategoryId: newProduct.subcategoryId || null,
      brand: newProduct.brand?.trim() || null,
      description: newProduct.description?.trim() || null,
      specifications: newProduct.specifications?.trim() || null,
      grade: newProduct.grade?.trim() || null,
      standards: newProduct.standards?.trim() || null,
      hsnCode: newProduct.hsnCode?.trim() || null,
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
      images: finalImages,
      catalogueDoc: newProduct.catalogueDoc || null,
      technicalDataSheetDoc: newProduct.technicalDataSheetDoc || null,
      coaDoc: newProduct.coaDoc || null,
      sdsDoc: newProduct.sdsDoc || null,
    };

    // If Editing Existing Product
    if (editingProductId) {
      if (/^\d+$/.test(editingProductId)) {
        try {
          await vendorService.updateProduct(Number(editingProductId), payload);
          toast.success('Product Updated in Database', {
            description: `${payload.name} updated in business_products table.`,
          });
        } catch (err: any) {
          console.error('Update product error:', err);
          toast.error('Failed to update product in database', {
            description: err.message,
          });
        }
      } else {
        toast.info('Product Updated Locally', { description: payload.name });
      }

      const updatedList = data.products.map((p) =>
        p.id === editingProductId
          ? {
              ...p,
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
              images: finalImages,
              catalogueDoc: newProduct.catalogueDoc || undefined,
              technicalDataSheetDoc: newProduct.technicalDataSheetDoc || undefined,
              coaDoc: newProduct.coaDoc || undefined,
              sdsDoc: newProduct.sdsDoc || undefined,
            }
          : p
      );
      onChange({ products: updatedList });
      handleCancelProductForm();
      return;
    }

    // Creating new product
    let assignedId = `PRD-${Date.now()}`;
    try {
      const res = await vendorService.addProduct(payload);
      if (res?.data?.product?.id) {
        assignedId = String(res.data.product.id);
      } else if (res?.data?.id) {
        assignedId = String(res.data.id);
      }
      toast.success('Product Saved to Database', {
        description: `${payload.name} stored in business_products table.`,
      });
    } catch (err: any) {
      console.warn('Backend product save note:', err.message);
      toast.info('Product Added Locally', { description: payload.name });
    }

    const item: ProductCatalogItem = {
      id: assignedId,
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
      images: finalImages,
      catalogueDoc: newProduct.catalogueDoc || undefined,
      technicalDataSheetDoc: newProduct.technicalDataSheetDoc || undefined,
      coaDoc: newProduct.coaDoc || undefined,
      sdsDoc: newProduct.sdsDoc || undefined,
    };
    onChange({ products: [...data.products, item] });
    handleCancelProductForm();
  }

  async function handleRemoveProduct(id: string) {
    onChange({ products: data.products.filter((p) => p.id !== id) });
    if (/^\d+$/.test(id)) {
      try {
        await vendorService.deleteProduct(Number(id));
        toast.success('Product removed from database.');
        return;
      } catch (err: any) {
        console.warn('Backend product delete note:', err.message);
      }
    }
    toast.info('Item removed from catalog.');
  }

  // Add Certificate & save to MySQL certifications table
  async function handleAddCert() {
    if (!newCert.certificateNumber || !newCert.issuingAuthority || !newCert.expiryDate) {
      toast.error('Please enter certificate number, issuing body, and expiry date.');
      return;
    }

    const payload: vendorService.CertificationPayload = {
      certificateType: newCert.certificateType || STANDARD_CERTIFICATIONS[0],
      certificateNumber: newCert.certificateNumber || '',
      issuingAuthority: newCert.issuingAuthority || '',
      issueDate: newCert.issueDate || null,
      expiryDate: newCert.expiryDate || null,
      scope: newCert.scope || null,
      applicableFacility: newCert.applicableFacility || 'All Facilities',
      evidenceDoc: newCert.evidenceDoc || null,
      status: (newCert.status as any) || 'Active',
    };

    // If Editing Existing Certificate
    if (editingCertId) {
      if (/^\d+$/.test(editingCertId)) {
        try {
          await vendorService.updateCertification(Number(editingCertId), payload);
          toast.success('Certificate Updated in Database', {
            description: `${payload.certificateType} updated in certifications table.`,
          });
        } catch (err: any) {
          console.error('Update cert error:', err);
          toast.error('Failed to update certificate in database', {
            description: err.message,
          });
        }
      } else {
        toast.info('Certificate Updated Locally', { description: payload.certificateNumber });
      }

      const updatedList = data.certifications.map((c) =>
        c.id === editingCertId
          ? {
              ...c,
              certificateType: newCert.certificateType || STANDARD_CERTIFICATIONS[0],
              certificateNumber: newCert.certificateNumber || '',
              issuingAuthority: newCert.issuingAuthority || '',
              issueDate: newCert.issueDate || '',
              expiryDate: newCert.expiryDate || '',
              scope: newCert.scope || '',
              applicableFacility: newCert.applicableFacility || 'All Facilities',
              evidenceDoc: newCert.evidenceDoc,
              status: (newCert.status as any) || 'Active',
            }
          : c
      );
      onChange({ certifications: updatedList });
      handleCancelCertForm();
      return;
    }

    let assignedId = `CERT-${Date.now()}`;
    try {
      const res = await vendorService.addCertification(payload);
      if (res?.data?.certification?.id) {
        assignedId = String(res.data.certification.id);
      }
      toast.success('Quality Certificate Saved to Database', {
        description: `${payload.certificateType} stored in certifications table.`,
      });
    } catch (err: any) {
      console.warn('Backend certification save note:', err.message);
      toast.info('Quality Certificate Added Locally', { description: payload.certificateNumber });
    }

    const item: QualityCertificateRecord = {
      id: assignedId,
      certificateType: newCert.certificateType || STANDARD_CERTIFICATIONS[0],
      certificateNumber: newCert.certificateNumber || '',
      issuingAuthority: newCert.issuingAuthority || '',
      issueDate: newCert.issueDate || '',
      expiryDate: newCert.expiryDate || '',
      scope: newCert.scope || '',
      applicableFacility: newCert.applicableFacility || 'All Facilities',
      evidenceDoc: newCert.evidenceDoc,
      status: (newCert.status as any) || 'Active',
    };
    onChange({ certifications: [...data.certifications, item] });
    handleCancelCertForm();
  }

  async function handleRemoveCert(id: string) {
    onChange({ certifications: data.certifications.filter((c) => c.id !== id) });
    if (/^\d+$/.test(id)) {
      try {
        await vendorService.deleteCertification(Number(id));
        toast.success('Certificate removed from database.');
        return;
      } catch (err: any) {
        console.warn('Backend certification delete note:', err.message);
      }
    }
    toast.info('Certificate removed.');
  }

  async function handleProceed() {
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

    // Sync any pending products that haven't been stored in business_products table
    for (let prd of data.products) {
      if (prd.id && prd.id.startsWith('PRD-')) {
        try {
          const res = await vendorService.addProduct({
            name: prd.name,
            type: prd.type,
            categoryId: prd.categoryId,
            subcategoryId: prd.subcategoryId || null,
            brand: prd.brand || null,
            description: prd.description || null,
            specifications: prd.specifications || null,
            grade: prd.grade || null,
            standards: prd.standards || null,
            hsnCode: prd.hsnCode || null,
            countryOfOrigin: prd.countryOfOrigin || 'India',
            moq: prd.moq || null,
            standardOrderQty: prd.standardOrderQty || null,
            monthlyCapacity: prd.monthlyCapacity || null,
            availableStock: prd.availableStock || null,
            leadTimeDays: prd.leadTimeDays || null,
            sampleAvailability: prd.sampleAvailability,
            indicativePrice: prd.indicativePrice || null,
            currency: prd.currency || 'INR',
            priceValidity: prd.priceValidity || null,
            targetMarkets: prd.targetMarkets || null,
            images: prd.images || [],
            catalogueDoc: prd.catalogueDoc || null,
            technicalDataSheetDoc: prd.technicalDataSheetDoc || null,
            coaDoc: prd.coaDoc || null,
            sdsDoc: prd.sdsDoc || null,
          });
          if (res?.data?.product?.id) {
            prd.id = String(res.data.product.id);
          }
        } catch (_) {}
      }
    }

    // Sync any pending certifications
    for (const cert of data.certifications) {
      if (cert.id && cert.id.startsWith('CERT-')) {
        try {
          const res = await vendorService.addCertification({
            certificateType: cert.certificateType,
            certificateNumber: cert.certificateNumber,
            issuingAuthority: cert.issuingAuthority,
            issueDate: cert.issueDate || null,
            expiryDate: cert.expiryDate || null,
            scope: cert.scope || null,
            applicableFacility: cert.applicableFacility || 'All Facilities',
            status: cert.status,
          });
          if (res?.data?.certification?.id) {
            cert.id = String(res.data.certification.id);
          }
        } catch (_) {}
      }
    }

    // 3. Sync Quality Systems, Testing Capabilities & QA Procedures (Section 3)
    if (data.testingCapabilities || data.qualityAssuranceProcedures) {
      try {
        await vendorService.updateQualitySystems({
          testingCapabilities: data.testingCapabilities?.trim() || null,
          qualityAssuranceProcedures: data.qualityAssuranceProcedures?.trim() || null,
        });
      } catch (err) {
        console.error('Failed to save quality systems:', err);
      }
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
              <h4 className="text-xs font-bold text-primary-950 uppercase tracking-wide flex items-center gap-1.5">
                {editingProductId ? (
                  <>
                    <Pencil className="size-3.5 text-primary-700" />
                    Edit Catalog Item Specifications
                  </>
                ) : (
                  'New Catalog Item Specifications'
                )}
              </h4>
              <button
                type="button"
                onClick={handleCancelProductForm}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
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

            {/* Product Photos & Visual Gallery */}
            <div className="rounded-lg bg-white p-3.5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-primary-600" />
                    Product Photos & Visual Gallery ({productImages.length})
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Upload product images (JPG, PNG, WEBP, up to 10 MB each). Primary photo will be shown in search results and catalogs.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={uploadingItemImage}
                  onClick={() => imageInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-md cursor-pointer transition-colors shadow-xs shrink-0 disabled:opacity-50"
                >
                  <UploadCloud className="size-3.5 text-primary-600" /> Select Photos
                </button>
              </div>

              {/* Hidden file input for images */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleProductImageSelect}
              />

              {/* Image Preview Grid or Empty Dropzone */}
              {productImages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {productImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg border border-slate-200 bg-slate-50 overflow-hidden aspect-square flex items-center justify-center shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vendorService.getFullImageUrl(imgUrl)}
                        alt={`Product Preview ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          if (imgUrl.startsWith('blob:') || imgUrl.startsWith('data:')) return;
                          const target = e.currentTarget;
                          const fallbackUrl = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
                          if (!target.src.endsWith(fallbackUrl)) {
                            target.src = fallbackUrl;
                          }
                        }}
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-primary-700/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Remove Photo"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  <button
                    type="button"
                    disabled={uploadingItemImage}
                    onClick={() => imageInputRef.current?.click()}
                    className="rounded-lg border border-dashed border-slate-300 hover:border-primary-400 bg-slate-50/50 hover:bg-primary-50/40 aspect-square flex flex-col items-center justify-center text-slate-500 hover:text-primary-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="size-4" />
                    <span className="text-[10px] font-semibold mt-1">Add More</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="border border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50/80 hover:border-primary-400 transition-colors"
                >
                  <UploadCloud className="size-6 text-slate-300 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-primary-700 hover:underline">
                    Click to select product photos
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP, GIF up to 10 MB (You can select multiple photos)
                  </p>
                </div>
              )}
            </div>

            {/* Document Attachments row for product */}
            <div className="rounded-lg bg-white p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800">
                  Technical Compliance Documents (TDS, COA, SDS, Catalog)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Accepted: PDF, JPG, PNG (Max 15 MB)
                </span>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={tdsInputRef}
                type="file"
                accept=".pdf,application/pdf,image/*"
                className="hidden"
                onChange={(e) => handleProductDocSelect('tds', e)}
              />
              <input
                ref={coaInputRef}
                type="file"
                accept=".pdf,application/pdf,image/*"
                className="hidden"
                onChange={(e) => handleProductDocSelect('coa', e)}
              />
              <input
                ref={sdsInputRef}
                type="file"
                accept=".pdf,application/pdf,image/*"
                className="hidden"
                onChange={(e) => handleProductDocSelect('sds', e)}
              />
              <input
                ref={catalogInputRef}
                type="file"
                accept=".pdf,application/pdf,image/*"
                className="hidden"
                onChange={(e) => handleProductDocSelect('catalog', e)}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {/* 1. TDS */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${
                    attachedDocs.tds
                      ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TDS</span>
                    {attachedDocs.tds ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachedDoc('tds')}
                        className="text-emerald-700 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    ) : (
                      <UploadCloud className="size-3.5 text-slate-400" />
                    )}
                  </div>
                  {attachedDocs.tds ? (
                    <div className="flex items-center gap-1 text-[10px] truncate text-emerald-800">
                      <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                      <span className="truncate" title={attachedDocs.tds.name}>
                        {attachedDocs.tds.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploadingDoc === 'tds'}
                      onClick={() => tdsInputRef.current?.click()}
                      className="w-full text-left text-[11px] font-medium text-primary-700 hover:underline cursor-pointer"
                    >
                      {uploadingDoc === 'tds' ? 'Uploading...' : 'Attach TDS PDF'}
                    </button>
                  )}
                </div>

                {/* 2. COA */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${
                    attachedDocs.coa
                      ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">COA</span>
                    {attachedDocs.coa ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachedDoc('coa')}
                        className="text-emerald-700 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    ) : (
                      <UploadCloud className="size-3.5 text-slate-400" />
                    )}
                  </div>
                  {attachedDocs.coa ? (
                    <div className="flex items-center gap-1 text-[10px] truncate text-emerald-800">
                      <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                      <span className="truncate" title={attachedDocs.coa.name}>
                        {attachedDocs.coa.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploadingDoc === 'coa'}
                      onClick={() => coaInputRef.current?.click()}
                      className="w-full text-left text-[11px] font-medium text-primary-700 hover:underline cursor-pointer"
                    >
                      {uploadingDoc === 'coa' ? 'Uploading...' : 'Attach COA PDF'}
                    </button>
                  )}
                </div>

                {/* 3. SDS */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${
                    attachedDocs.sds
                      ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">SDS</span>
                    {attachedDocs.sds ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachedDoc('sds')}
                        className="text-emerald-700 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    ) : (
                      <UploadCloud className="size-3.5 text-slate-400" />
                    )}
                  </div>
                  {attachedDocs.sds ? (
                    <div className="flex items-center gap-1 text-[10px] truncate text-emerald-800">
                      <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                      <span className="truncate" title={attachedDocs.sds.name}>
                        {attachedDocs.sds.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploadingDoc === 'sds'}
                      onClick={() => sdsInputRef.current?.click()}
                      className="w-full text-left text-[11px] font-medium text-primary-700 hover:underline cursor-pointer"
                    >
                      {uploadingDoc === 'sds' ? 'Uploading...' : 'Attach SDS PDF'}
                    </button>
                  )}
                </div>

                {/* 4. Catalog PDF */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${
                    attachedDocs.catalog
                      ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Catalog PDF
                    </span>
                    {attachedDocs.catalog ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachedDoc('catalog')}
                        className="text-emerald-700 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    ) : (
                      <UploadCloud className="size-3.5 text-slate-400" />
                    )}
                  </div>
                  {attachedDocs.catalog ? (
                    <div className="flex items-center gap-1 text-[10px] truncate text-emerald-800">
                      <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                      <span className="truncate" title={attachedDocs.catalog.name}>
                        {attachedDocs.catalog.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploadingDoc === 'catalog'}
                      onClick={() => catalogInputRef.current?.click()}
                      className="w-full text-left text-[11px] font-medium text-primary-700 hover:underline cursor-pointer"
                    >
                      {uploadingDoc === 'catalog' ? 'Uploading...' : 'Attach Catalog PDF'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelProductForm}
                className="text-xs"
              >
                {editingProductId ? 'Cancel Edit' : 'Cancel'}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={uploadingItemImage}
                onClick={handleAddProduct}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                {uploadingItemImage ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    {editingProductId ? 'Updating Product...' : 'Saving Product & Photos...'}
                  </>
                ) : (
                  editingProductId ? 'Update Product in Catalog' : 'Save Product to Catalog'
                )}
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
            {data.products.map((prd) => {
              const primaryImage = prd.images && prd.images.length > 0 ? prd.images[0] : null;
              return (
                <div
                  key={prd.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex gap-3 items-start">
                    {/* Product Photo Thumbnail */}
                    <ProductThumbnail
                      images={prd.images}
                      alt={prd.name}
                      size="md"
                      showCountBadge
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 inline-block">
                            {prd.brand || 'Proprietary'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1 truncate" title={prd.name}>
                            {prd.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditProduct(prd)}
                            className="text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-colors p-1 rounded cursor-pointer"
                            title="Edit Product"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(prd.id)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1 rounded cursor-pointer"
                            title="Remove Product"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2">{prd.specifications || prd.description}</p>

                  {/* Attached technical document badges */}
                  {(prd.technicalDataSheetDoc || prd.coaDoc || prd.sdsDoc || prd.catalogueDoc) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prd.technicalDataSheetDoc && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-2.5" /> TDS
                        </span>
                      )}
                      {prd.coaDoc && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <CheckCircle2 className="size-2.5" /> COA
                        </span>
                      )}
                      {prd.sdsDoc && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          <CheckCircle2 className="size-2.5" /> SDS
                        </span>
                      )}
                      {prd.catalogueDoc && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          <CheckCircle2 className="size-2.5" /> Catalog
                        </span>
                      )}
                    </div>
                  )}

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
              );
            })}
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
              <h4 className="text-xs font-bold text-primary-950 flex items-center gap-1.5">
                {editingCertId ? (
                  <>
                    <Pencil className="size-3.5 text-primary-700" />
                    Edit Accredited Certificate Record
                  </>
                ) : (
                  'Add Accredited Certificate Record'
                )}
              </h4>
              <button
                type="button"
                onClick={handleCancelCertForm}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
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

              {/* Certificate Evidence Upload (PDF / JPG) */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Accreditation / Certificate Evidence Document (PDF / JPG)
                </label>
                <input
                  ref={certDocInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                  className="hidden"
                  onChange={handleCertDocSelect}
                />
                {newCert.evidenceDoc ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="size-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-900 truncate">
                        {certDocFileName || 'Certificate Document Attached'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={vendorService.getFullImageUrl(newCert.evidenceDoc)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="size-3" /> View
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveCertDoc}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploadingCertDoc}
                    onClick={() => certDocInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 hover:border-primary-400 bg-white hover:bg-primary-50/40 text-xs font-medium text-slate-600 hover:text-primary-700 transition-colors cursor-pointer"
                  >
                    {uploadingCertDoc ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin text-primary-700" />
                        <span>Uploading Certificate Document...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-4 text-primary-600" />
                        <span>Upload Certificate Proof (PDF / JPG / PNG, Max 15 MB)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editingCertId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelCertForm}
                  className="text-xs"
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleAddCert}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                {editingCertId ? 'Update Certificate Record' : 'Save Certificate Record'}
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
                className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-start justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
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
                  {c.evidenceDoc && (
                    <div className="pt-1.5">
                      <a
                        href={vendorService.getFullImageUrl(c.evidenceDoc)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 hover:underline bg-primary-50 px-2 py-0.5 rounded border border-primary-200"
                      >
                        <FileCheck className="size-3" /> Certificate PDF <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEditCert(c)}
                    className="text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-colors p-1 rounded cursor-pointer"
                    title="Edit Certificate"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(c.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1 rounded cursor-pointer"
                    title="Remove Certificate"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
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
