'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../lib/api';

interface VariantInput {
  id?: string;
  label: string;
  flavour?: string;
  size?: string;
  sku: string;
  price: string; // in ₹ in form
  mrp: string;
  stock: number;
  weightGrams: number;
  isActive: boolean;
}

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit }) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [images, setImages] = useState<Array<{ url: string; publicId: string }>>(
    initialData?.images || [
      {
        url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800',
        publicId: 'prod_' + Date.now(),
      },
    ]
  );
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData?.variants
      ? initialData.variants.map((v: any) => ({
          id: v.id,
          label: v.label,
          flavour: v.flavour || '',
          size: v.size || '',
          sku: v.sku,
          price: (v.price / 100).toString(),
          mrp: (v.mrp / 100).toString(),
          stock: v.stock,
          weightGrams: v.weightGrams,
          isActive: v.isActive,
        }))
      : [
          {
            label: 'Default / Standard',
            flavour: 'Standard',
            size: 'Standard',
            sku: 'GN-PROD-STD',
            price: '2999',
            mrp: '3499',
            stock: 50,
            weightGrams: 1000,
            isActive: true,
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, setValue, watch } = useForm<any>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          brand: initialData.brand,
          shortDescription: initialData.shortDescription,
          description: initialData.description,
          categoryId: initialData.categoryId,
          price: (initialData.price / 100).toString(),
          mrp: (initialData.mrp / 100).toString(),
          sku: initialData.sku,
          hsnCode: initialData.hsnCode,
          gstRate: initialData.gstRate,
          weightGrams: initialData.weightGrams,
          lengthCm: initialData.lengthCm,
          breadthCm: initialData.breadthCm,
          heightCm: initialData.heightCm,
          badge: initialData.badge || '',
          isFeatured: initialData.isFeatured,
          isActive: initialData.isActive,
          seoTitle: initialData.seoTitle || '',
          seoDescription: initialData.seoDescription || '',
        }
      : {
          name: '',
          slug: '',
          brand: 'GymNation Nutrition',
          shortDescription: '',
          description: '',
          categoryId: '',
          price: '2999',
          mrp: '3499',
          sku: 'GN-',
          hsnCode: '21069099',
          gstRate: 18,
          weightGrams: 1000,
          lengthCm: 15,
          breadthCm: 15,
          heightCm: 25,
          badge: '-15%',
          isFeatured: false,
          isActive: true,
          seoTitle: '',
          seoDescription: '',
        },
  });

  const watchName = watch('name');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiClient.get('/admin/categories');
        setCategories(res.data.data);
        if (!initialData && res.data.data.length > 0) {
          setValue('categoryId', res.data.data[0].id);
        }
      } catch {
        // Continue
      }
    };
    fetchCats();
  }, [initialData, setValue]);

  // Auto-generate slug from name if not editing an existing slug
  useEffect(() => {
    if (!isEdit && watchName) {
      const generated = watchName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', generated);
    }
  }, [watchName, isEdit, setValue]);

  const addImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, { url: imageUrlInput.trim(), publicId: 'img_' + Date.now() }]);
    setImageUrlInput('');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        label: 'New Flavour / Size',
        flavour: '',
        size: '',
        sku: `GN-VAR-${Date.now().toString().slice(-4)}`,
        price: '2999',
        mrp: '3499',
        stock: 25,
        weightGrams: 1000,
        isActive: true,
      },
    ]);
  };

  const updateVariantField = (index: number, field: keyof VariantInput, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('Product must have at least one variant.');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      setFeedback(null);

      if (images.length === 0) {
        throw new Error('Please add at least one product image');
      }

      const payload = {
        name: data.name,
        slug: data.slug,
        brand: data.brand,
        shortDescription: data.shortDescription,
        description: data.description,
        categoryId: data.categoryId,
        price: Math.round(Number(data.price) * 100),
        mrp: Math.round(Number(data.mrp) * 100),
        sku: data.sku,
        hsnCode: data.hsnCode,
        gstRate: Number(data.gstRate),
        weightGrams: Number(data.weightGrams),
        lengthCm: Number(data.lengthCm),
        breadthCm: Number(data.breadthCm),
        heightCm: Number(data.heightCm),
        images,
        badge: data.badge || null,
        isFeatured: Boolean(data.isFeatured),
        isActive: Boolean(data.isActive),
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        variants: variants.map((v) => ({
          ...(v.id && { id: v.id }),
          label: v.label,
          flavour: v.flavour || null,
          size: v.size || null,
          sku: v.sku,
          price: Math.round(Number(v.price) * 100),
          mrp: Math.round(Number(v.mrp) * 100),
          stock: Number(v.stock),
          weightGrams: Number(v.weightGrams),
          isActive: Boolean(v.isActive),
        })),
      };

      if (isEdit) {
        await apiClient.put(`/admin/products/${initialData.id}`, payload);
        setFeedback({ type: 'success', message: 'Product updated successfully' });
      } else {
        await apiClient.post('/admin/products', payload);
        setFeedback({ type: 'success', message: 'Product created successfully' });
        setTimeout(() => router.push('/products'), 1000);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Operation failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {feedback && (
        <div
          className={`p-3 text-xs font-mono border ${
            feedback.type === 'success'
              ? 'bg-green-950/40 border-green-800 text-green-300'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          [{feedback.type.toUpperCase()}]: {feedback.message}
        </div>
      )}

      {/* 01. Basic Info */}
      <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
          01. GENERAL PRODUCT IDENTITY
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              PRODUCT NAME
            </label>
            <input
              type="text"
              required
              {...register('name')}
              placeholder="GymNation 100% Gold Whey Protein"
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-heading text-lg focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              BRAND / LINE
            </label>
            <input
              type="text"
              required
              {...register('brand')}
              placeholder="GymNation Nutrition"
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              SLUG (URL KEY)
            </label>
            <input
              type="text"
              required
              {...register('slug')}
              placeholder="gymnation-gold-whey-protein"
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold font-mono focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              CATEGORY
            </label>
            <select
              {...register('categoryId')}
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-mono focus:border-gn-maroon focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              SHORT HOOK DESCRIPTION (LISTINGS & CART)
            </label>
            <input
              type="text"
              required
              {...register('shortDescription')}
              placeholder="25g Protein, 5.5g BCAAs per scoop with digestive enzymes for zero bloating."
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              FULL PRODUCT DETAILS & NUTRITION TABLE (RICH TEXT / HTML)
            </label>
            <textarea
              rows={6}
              required
              {...register('description')}
              placeholder="<h3>Engineered for Pure Muscle Growth</h3><p>...</p>"
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 02. Pricing, Tax & Shipping Spec */}
      <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
          02. PRICING, TAX (GST) & SHIPROCKET LOGISTICS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              BASE DISPLAY PRICE (₹)
            </label>
            <input
              type="number"
              required
              step="1"
              {...register('price')}
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold font-bold focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              BASE MRP (₹)
            </label>
            <input
              type="number"
              required
              step="1"
              {...register('mrp')}
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-muted line-through focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              BASE SKU
            </label>
            <input
              type="text"
              required
              {...register('sku')}
              placeholder="GN-WHEY-GOLD"
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono uppercase focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              PROMO BADGE
            </label>
            <input
              type="text"
              {...register('badge')}
              placeholder="-17% or HOT"
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              HSN CODE
            </label>
            <input
              type="text"
              required
              {...register('hsnCode')}
              placeholder="21069099"
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              GST RATE (%)
            </label>
            <input
              type="number"
              step="0.5"
              required
              {...register('gstRate')}
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
            />
            <span className="text-[10px] text-gn-muted font-mono">Standard supplements: 18%</span>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              PACKAGE WEIGHT (GRAMS)
            </label>
            <input
              type="number"
              required
              {...register('weightGrams')}
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              DIMENSIONS L×B×H (CM)
            </label>
            <div className="grid grid-cols-3 gap-1">
              <input
                type="number"
                placeholder="L"
                {...register('lengthCm')}
                className="bg-gn-black border border-gn-border px-2 py-2 text-xs text-gn-ivory font-mono text-center"
              />
              <input
                type="number"
                placeholder="B"
                {...register('breadthCm')}
                className="bg-gn-black border border-gn-border px-2 py-2 text-xs text-gn-ivory font-mono text-center"
              />
              <input
                type="number"
                placeholder="H"
                {...register('heightCm')}
                className="bg-gn-black border border-gn-border px-2 py-2 text-xs text-gn-ivory font-mono text-center"
              />
            </div>
          </div>

          <div className="md:col-span-4 flex items-center gap-6 p-3 bg-gn-black border border-gn-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="w-4 h-4 accent-gn-maroon"
              />
              <span className="text-xs font-mono uppercase text-gn-gold font-bold">
                FEATURE ON HOMEPAGE
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 accent-gn-maroon"
              />
              <span className="text-xs font-mono uppercase text-gn-ivory">ACTIVE IN STORE</span>
            </label>
          </div>
        </div>
      </div>

      {/* 03. Product Images Gallery */}
      <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
          03. PRODUCT IMAGE GALLERY (DRAG / REORDER)
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Add image URL e.g. https://images.unsplash.com/..."
            className="flex-1 bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
          />
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono text-gn-gold uppercase hover:border-gn-gold"
          >
            + ADD IMAGE
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
          {images.map((img, i) => (
            <div key={i} className="relative group aspect-square bg-gn-black border border-gn-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-red-900/90 text-white text-[10px] font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity"
              >
                REMOVE
              </button>
              {i === 0 && (
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-gn-gold text-black font-mono text-[9px] font-bold uppercase">
                  PRIMARY
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 04. Flavour & Size Variants Table */}
      <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gn-border pb-2">
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold">
            04. PRODUCT VARIANTS (FLAVOUR, SIZE, SKU & STOCK)
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-1 bg-gn-maroon hover:bg-gn-maroon-dark text-white text-xs font-mono uppercase tracking-wider"
          >
            + ADD VARIANT
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-gn-border bg-gn-black/80 text-gn-muted uppercase">
                <th className="p-2.5">LABEL (NAME)</th>
                <th className="p-2.5">FLAVOUR</th>
                <th className="p-2.5">SIZE</th>
                <th className="p-2.5">VARIANT SKU</th>
                <th className="p-2.5 w-24">PRICE (₹)</th>
                <th className="p-2.5 w-24">MRP (₹)</th>
                <th className="p-2.5 w-20">STOCK</th>
                <th className="p-2.5 w-20">WEIGHT (G)</th>
                <th className="p-2.5 w-16 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gn-border">
              {variants.map((v, i) => (
                <tr key={i} className="hover:bg-gn-surface-light/40">
                  <td className="p-2">
                    <input
                      type="text"
                      required
                      value={v.label}
                      onChange={(e) => updateVariantField(i, 'label', e.target.value)}
                      placeholder="Chocolate / 1 kg"
                      className="w-full bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-ivory"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={v.flavour || ''}
                      onChange={(e) => updateVariantField(i, 'flavour', e.target.value)}
                      placeholder="Chocolate"
                      className="w-24 bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-ivory"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={v.size || ''}
                      onChange={(e) => updateVariantField(i, 'size', e.target.value)}
                      placeholder="1 kg"
                      className="w-20 bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-ivory"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      required
                      value={v.sku}
                      onChange={(e) => updateVariantField(i, 'sku', e.target.value)}
                      placeholder="GN-WHEY-CHOC-1KG"
                      className="w-36 bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-ivory font-mono uppercase"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      required
                      step="1"
                      value={v.price}
                      onChange={(e) => updateVariantField(i, 'price', e.target.value)}
                      className="w-24 bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-gold font-bold"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      required
                      step="1"
                      value={v.mrp}
                      onChange={(e) => updateVariantField(i, 'mrp', e.target.value)}
                      className="w-24 bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-muted"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      required
                      min="0"
                      value={v.stock}
                      onChange={(e) => updateVariantField(i, 'stock', Number(e.target.value))}
                      className={`w-20 bg-gn-black border px-2 py-1 text-xs font-bold ${
                        v.stock <= 15 ? 'border-red-600 text-red-400' : 'border-gn-border text-green-400'
                      }`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      required
                      min="1"
                      value={v.weightGrams}
                      onChange={(e) => updateVariantField(i, 'weightGrams', Number(e.target.value))}
                      className="w-20 bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-ivory"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 05. SEO Metadata */}
      <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
          05. SEARCH ENGINE OPTIMIZATION (SEO)
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              CUSTOM META TITLE
            </label>
            <input
              type="text"
              {...register('seoTitle')}
              placeholder="GymNation 100% Gold Whey Protein | Buy in Surat"
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
              META DESCRIPTION
            </label>
            <textarea
              rows={2}
              {...register('seoDescription')}
              placeholder="Order authentic GymNation Gold Whey Protein with same-day store pickup in Surat or pan-India delivery."
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/products')}
          className="px-6 py-3 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-ivory hover:border-gn-muted"
        >
          BACK TO PRODUCTS
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-heading font-bold text-base tracking-wider uppercase border border-gn-maroon transition-colors disabled:opacity-50"
        >
          {saving ? 'SAVING PRODUCT...' : isEdit ? 'UPDATE PRODUCT' : 'PUBLISH PRODUCT'}
        </button>
      </div>
    </form>
  );
};
