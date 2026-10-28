'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductForm } from '../../../../components/store/ProductForm';
import { apiClient } from '../../../../lib/api';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/admin/products/${id}`);
        setProduct(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-gn-muted uppercase">
        LOADING PRODUCT DATA...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono">
        [ERROR]: {error || 'Product not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gn-border">
        <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory uppercase">
          EDIT: {product.name}
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
          SKU: {product.sku} / CATEGORY: {product.category?.name}
        </p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
