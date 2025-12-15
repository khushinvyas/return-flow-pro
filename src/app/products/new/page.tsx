'use client';

import ProductForm from '@/components/ProductForm';
import { createProduct } from '@/app/actions/inventory';

export default function AddProductPage() {
    return <ProductForm action={createProduct} />;
}
