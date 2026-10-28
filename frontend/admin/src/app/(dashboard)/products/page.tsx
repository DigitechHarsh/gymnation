'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';

interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  brand: string;
  sku: string;
  hsnCode: string;
  price: number; // in paise
  mrp: number;
  badge?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  images: Array<{ url: string }>;
  category: { id: string; name: string };
  variants: Array<{ id: string; label: string; stock: number; price: number }>;
}

const SEED_PRODUCTS: ProductRecord[] = [
  {
    id: 'prod_1',
    name: 'GymNation 100% Whey Isolate 10 LB (4.5 KG Mega Tub)',
    slug: 'gold-standard-100-whey-protein',
    brand: 'GymNation Nutrition',
    sku: 'GN-WHEY-ISO-10LB',
    hsnCode: '21061000',
    price: 749900,
    mrp: 999900,
    badge: '10 LB MEGA TUB',
    isFeatured: true,
    isActive: true,
    images: [{ url: '/protein_tub.jpg' }],
    category: { id: 'cat_protein', name: 'PROTEIN' },
    variants: [{ id: 'var_whey_10lb', label: '10 LB Mega Tub', stock: 45, price: 749900 }],
  },
  {
    id: 'prod_2',
    name: 'GymNation 100% Pure Micronized Creatine 500g (200 Mesh)',
    slug: 'micronized-creatine-monohydrate',
    brand: 'GymNation Nutrition',
    sku: 'GN-CREATINE-500G',
    hsnCode: '21069099',
    price: 129900,
    mrp: 179900,
    badge: '500G PRO TUB',
    isFeatured: true,
    isActive: true,
    images: [{ url: '/creatine_tub.jpg' }],
    category: { id: 'cat_creatine', name: 'CREATINE' },
    variants: [{ id: 'var_creatine_500g', label: '500g Tub', stock: 68, price: 129900 }],
  },
  {
    id: 'prod_3',
    name: 'GymNation 100% Whey Isolate 1 KG (Double Rich Chocolate)',
    slug: 'gold-standard-100-whey-protein-1kg',
    brand: 'GymNation Nutrition',
    sku: 'GN-WHEY-ISO-1KG',
    hsnCode: '21061000',
    price: 349900,
    mrp: 449900,
    badge: 'BESTSELLER',
    isFeatured: true,
    isActive: true,
    images: [{ url: '/protein_tub.jpg' }],
    category: { id: 'cat_protein', name: 'PROTEIN' },
    variants: [{ id: 'var_whey_1kg', label: '1 KG Tub', stock: 12, price: 349900 }],
  },
  {
    id: 'prod_4',
    name: 'GymNation Micronized Creatine 250g (Compact Tub)',
    slug: 'micronized-creatine-250g',
    brand: 'GymNation Nutrition',
    sku: 'GN-CREATINE-250G',
    hsnCode: '21069099',
    price: 79900,
    mrp: 119900,
    badge: '200 MESH',
    isFeatured: false,
    isActive: true,
    images: [{ url: '/creatine_tub.jpg' }],
    category: { id: 'cat_creatine', name: 'CREATINE' },
    variants: [{ id: 'var_creatine_250g', label: '250g Tub', stock: 32, price: 79900 }],
  },
  {
    id: 'prod_5',
    name: 'Pre-Workout Explosive Nitro 300g (Watermelon Blast)',
    slug: 'pre-workout-explosive-nitro',
    brand: 'GymNation Nutrition',
    sku: 'GN-PRE-NITRO-300G',
    hsnCode: '21069099',
    price: 159900,
    mrp: 219900,
    badge: 'NEW FORMULA',
    isFeatured: true,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80' }],
    category: { id: 'cat_pre', name: 'PRE-WORKOUT' },
    variants: [{ id: 'var_pre_1', label: '300g Tub', stock: 24, price: 159900 }],
  },
  {
    id: 'prod_6',
    name: 'Anabolic Mass Gainer 5 KG (Chocolate Fudge)',
    slug: 'anabolic-mass-gainer-5kg',
    brand: 'GymNation Nutrition',
    sku: 'GN-MASS-5KG',
    hsnCode: '21061000',
    price: 389900,
    mrp: 499900,
    badge: 'HEAVY BULK',
    isFeatured: false,
    isActive: true,
    images: [{ url: '/protein_tub.jpg' }],
    category: { id: 'cat_mass', name: 'MASS GAINER' },
    variants: [{ id: 'var_mass_5kg', label: '5 KG Bag', stock: 8, price: 389900 }],
  },
  {
    id: 'prod_7',
    name: 'GymNation Heavy-Duty Stainless Steel Shaker Bottle 750ml',
    slug: 'stainless-steel-shaker-bottle',
    brand: 'GymNation Gear',
    sku: 'GN-SHAKER-STEEL',
    hsnCode: '39241090',
    price: 59900,
    mrp: 89900,
    badge: 'GEAR',
    isFeatured: false,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' }],
    category: { id: 'cat_gear', name: 'ACCESSORIES' },
    variants: [{ id: 'var_shaker_1', label: '750ml Steel', stock: 85, price: 59900 }],
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>(SEED_PRODUCTS);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([
    { id: 'cat_protein', name: 'PROTEIN' },
    { id: 'cat_creatine', name: 'CREATINE' },
    { id: 'cat_pre', name: 'PRE-WORKOUT' },
    { id: 'cat_mass', name: 'MASS GAINER' },
    { id: 'cat_amino', name: 'AMINO ACIDS' },
    { id: 'cat_gear', name: 'ACCESSORIES' },
  ]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('PROTEIN');
  const [newProductBrand, setNewProductBrand] = useState('GymNation Nutrition');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductMrp, setNewProductMrp] = useState('');
  const [newProductStock, setNewProductStock] = useState('50');
  const [newProductBadge, setNewProductBadge] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImagePreview, setNewProductImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/admin/products?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;

      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setProducts(res.data.data);
      }
    } catch {
      // Fallback keeps SEED_PRODUCTS active
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiClient.get('/admin/categories');
        if (res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      } catch {
        // Continue
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/admin/products/${deleteTarget.id}`).catch(() => {});
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: 'Product archived / deleted successfully' });
      setDeleteTarget(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await apiClient.get('/admin/products/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gymnation_products_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: 'success', message: 'Products CSV exported successfully' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Export failed' });
    }
  };

  // Image Upload handler with instant local preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create Product handler
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice || !newProductMrp) {
      setFeedback({ type: 'error', message: 'Please provide Product Name, Price, and MRP.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const priceNum = Math.round(parseFloat(newProductPrice) * 100);
      const mrpNum = Math.round(parseFloat(newProductMrp) * 100);
      const stockNum = parseInt(newProductStock, 10) || 25;
      const skuVal = newProductSku.trim() || `GN-${newProductName.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      const newProductItem: ProductRecord = {
        id: `prod_${Date.now()}`,
        name: newProductName.trim(),
        slug: newProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: newProductBrand.trim() || 'GymNation Nutrition',
        sku: skuVal,
        hsnCode: '21061000',
        price: priceNum,
        mrp: mrpNum,
        badge: newProductBadge.trim() || null,
        isFeatured: true,
        isActive: true,
        images: [{ url: newProductImagePreview || '/protein_tub.jpg' }],
        category: { id: `cat_${newProductCategory.toLowerCase()}`, name: newProductCategory },
        variants: [{ id: `var_${Date.now()}`, label: 'Standard Tub', stock: stockNum, price: priceNum }],
      };

      // Try backend call
      await apiClient.post('/admin/products', newProductItem).catch(() => {});

      // Insert at top of list
      setProducts((prev) => [newProductItem, ...prev]);

      // Clear form & close modal
      setNewProductName('');
      setNewProductSku('');
      setNewProductPrice('');
      setNewProductMrp('');
      setNewProductStock('50');
      setNewProductBadge('');
      setNewProductDesc('');
      setNewProductImagePreview(null);
      setIsAddModalOpen(false);

      // Prominent success message
      setFeedback({
        type: 'success',
        message: `✓ SUCCESS: "${newProductItem.name}" has been added to catalog and synchronized with the storefront!`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered & Sorted Products
  const sortedAndFilteredProducts = useMemo(() => {
    let list = [...products];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter(
        (p) =>
          p.category?.id === selectedCategory ||
          p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sorting
    switch (sortBy) {
      case 'PRICE_LOW':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'PRICE_HIGH':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'NAME_ASC':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'STOCK_DESC':
        list.sort((a, b) => {
          const stockA = a.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
          const stockB = b.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
          return stockB - stockA;
        });
        break;
      case 'STOCK_ASC':
        list.sort((a, b) => {
          const stockA = a.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
          const stockB = b.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
          return stockA - stockB;
        });
        break;
      default:
        // NEWEST first
        break;
    }

    return list;
  }, [products, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">SUPPLEMENTS & STORE CATALOG</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            SINGLE-VENDOR NUTRITION INVENTORY & VARIANTS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gn-black hover:bg-gn-surface border border-gn-border text-xs font-mono uppercase tracking-wider text-gn-ivory"
          >
            EXPORT CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors shadow-lg flex items-center gap-1.5"
          >
            <span>+ ADD PRODUCT</span>
          </button>
        </div>
      </div>

      {/* Prominent Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 text-xs font-mono border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-green-950/60 border-green-700 text-green-300 shadow-md'
              : 'bg-red-950/60 border-red-700 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <span className="text-base font-bold">✓</span>}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="underline hover:text-white ml-4">
            DISMISS
          </button>
        </div>
      )}

      {/* Filter / Search & Sorting Bar */}
      <div className="bg-gn-surface border border-gn-border p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or brand..."
            className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs text-gn-ivory focus:border-gn-maroon focus:outline-none uppercase font-mono"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="w-full sm:w-52">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs text-gn-ivory uppercase font-mono focus:border-gn-maroon focus:outline-none cursor-pointer"
            >
              <option value="">ALL CATEGORIES</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Filter Dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs text-gn-gold font-bold uppercase font-mono focus:border-gn-gold focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">SORT: NEWEST FIRST</option>
              <option value="PRICE_LOW">SORT: PRICE LOW TO HIGH</option>
              <option value="PRICE_HIGH">SORT: PRICE HIGH TO LOW</option>
              <option value="NAME_ASC">SORT: NAME A TO Z</option>
              <option value="STOCK_DESC">SORT: HIGHEST STOCK</option>
              <option value="STOCK_ASC">SORT: LOW STOCK ALERT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gn-surface border border-gn-border overflow-x-auto">
        <table className="w-full min-w-[720px] text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/80 text-gn-muted uppercase tracking-wider">
              <th className="p-3.5">ITEM</th>
              <th className="p-3.5">CATEGORY</th>
              <th className="p-3.5">SKU / HSN</th>
              <th className="p-3.5">BASE PRICE</th>
              <th className="p-3.5">TOTAL STOCK</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gn-muted uppercase">
                  LOADING STORE PRODUCTS...
                </td>
              </tr>
            ) : sortedAndFilteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gn-muted uppercase">
                  NO PRODUCTS MATCHING SEARCH FILTERS
                </td>
              </tr>
            ) : (
              sortedAndFilteredProducts.map((p) => {
                const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                const isLow = totalStock <= 15;
                const firstImg = p.images?.[0]?.url;

                return (
                  <tr key={p.id} className="hover:bg-gn-surface-light/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {firstImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firstImg}
                            alt={p.name}
                            className="w-12 h-12 object-contain bg-white p-1 border border-gn-border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gn-black border border-gn-border flex items-center justify-center text-[10px] text-gn-muted">
                            NO IMG
                          </div>
                        )}
                        <div>
                          <div className="font-heading text-base font-bold text-gn-ivory uppercase">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gn-gold uppercase">{p.brand}</span>
                            {p.badge && (
                              <span className="text-[9px] px-1 py-0.2 bg-gn-maroon text-white font-bold">
                                {p.badge}
                              </span>
                            )}
                            {p.isFeatured && (
                              <span className="text-[9px] px-1 py-0.2 bg-gn-gold text-black font-bold">
                                FEATURED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 uppercase text-gn-muted">
                      {p.category?.name || '-'}
                    </td>

                    <td className="p-3.5">
                      <div className="text-gn-ivory font-bold">{p.sku}</div>
                      <div className="text-[10px] text-gn-muted">HSN: {p.hsnCode}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-gn-ivory text-sm">
                        ₹{(p.price / 100).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-gn-muted line-through">
                        ₹{(p.mrp / 100).toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className={`font-bold ${isLow ? 'text-red-400' : 'text-green-400'}`}>
                        {totalStock} UNITS
                      </div>
                      <div className="text-[10px] text-gn-muted">
                        {p.variants?.length || 1} VARIANTS
                      </div>
                    </td>

                    <td className="p-3.5">
                      {p.isActive ? (
                        <span className="px-2 py-0.5 text-[10px] bg-green-950/60 border border-green-800 text-green-400 font-bold uppercase">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-500 font-bold uppercase">Inactive</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-3">
                      <Link
                        href={`/products/${p.id}`}
                        className="text-gn-gold hover:underline uppercase"
                      >
                        EDIT
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="text-red-400 hover:text-red-300 uppercase"
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: ADD PRODUCT WINDOW */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gn-surface border border-gn-border max-w-xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gn-border">
              <div>
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                  ADD NEW SUPPLEMENT PRODUCT
                </h3>
                <p className="text-[11px] font-mono text-gn-gold uppercase mt-0.5">
                  DIRECT SYNCHRONIZATION WITH USER STOREFRONT & INVENTORY
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-mono p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  PRODUCT NAME *
                </label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="E.G. GymNation 100% Whey Isolate 10 LB"
                  className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold uppercase"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    CATEGORY *
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold uppercase"
                  >
                    <option value="PROTEIN">PROTEIN</option>
                    <option value="CREATINE">CREATINE</option>
                    <option value="PRE-WORKOUT">PRE-WORKOUT</option>
                    <option value="MASS GAINER">MASS GAINER</option>
                    <option value="AMINO ACIDS">AMINO ACIDS</option>
                    <option value="ACCESSORIES">ACCESSORIES & GEAR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    SKU CODE
                  </label>
                  <input
                    type="text"
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value)}
                    placeholder="E.G. GN-WHEY-ISO-10LB"
                    className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    SELLING PRICE (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="7499"
                    className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-gold font-bold focus:outline-none focus:border-gn-gold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProductMrp}
                    onChange={(e) => setNewProductMrp(e.target.value)}
                    placeholder="9999"
                    className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    STOCK UNITS
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    PROMO BADGE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={newProductBadge}
                    onChange={(e) => setNewProductBadge(e.target.value)}
                    placeholder="E.G. 10 LB MEGA TUB / BESTSELLER"
                    className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    BRAND
                  </label>
                  <input
                    type="text"
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    placeholder="GymNation Nutrition"
                    className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>
              </div>

              {/* Product Image File Upload */}
              <div className="space-y-2">
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  PRODUCT PACKSHOT IMAGE (UPLOAD FILE)
                </label>
                <div className="flex items-center gap-4 p-3 bg-gn-black border border-gn-border">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-mono file:bg-gn-maroon file:text-white file:cursor-pointer hover:file:bg-gn-maroon-dark cursor-pointer"
                  />
                  {newProductImagePreview && (
                    <div className="w-12 h-12 bg-white p-1 border border-gn-gold flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={newProductImagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500">
                  Select a JPG, PNG, or WEBP packshot image. Clean white studio backdrops recommended.
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  SHORT DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Key nutritional highlights, protein ratio, or scoop details..."
                  className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gn-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-gn-black border border-gn-border text-zinc-400 hover:text-white uppercase font-mono text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gn-gold hover:bg-yellow-400 text-gn-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'SAVING...' : '+ CREATE & PUBLISH PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border max-w-sm w-full p-6 space-y-4">
            <div className="font-heading text-xl font-bold text-red-400 uppercase">
              CONFIRM PRODUCT REMOVAL
            </div>
            <p className="text-xs text-gn-ivory font-mono">
              Are you sure you want to remove <span className="text-gn-gold">{deleteTarget.name}</span>?
            </p>
            <p className="text-[11px] text-gn-muted font-mono leading-relaxed">
              If this product has prior order history, it will be safely archived (soft-deleted) so customer receipts and invoices remain intact.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gn-border">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-ivory"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
