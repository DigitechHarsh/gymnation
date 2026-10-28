'use client';

import React from 'react';
import { ProductForm } from '../../../../components/store/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gn-border">
        <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">ADD NEW PRODUCT</h1>
        <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
          PUBLISH NEW SUPPLEMENT / ACCESSORY ITEM TO STORE
        </p>
      </div>

      <ProductForm isEdit={false} />
    </div>
  );
}
