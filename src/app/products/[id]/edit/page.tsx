
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { updateProduct } from '@/app/actions/inventory'; // Need to ensure updateProduct exists
import { getSession } from '@/lib/auth';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session?.userId) redirect('/login');

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const { id } = await params;
    const product = await prisma.product.findFirst({
        where: {
            id: Number(id),
            ...orgFilter
        }
    });

    if (!product) {
        notFound();
    }

    const initialData = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        modelNumber: product.modelNumber,
    };

    return <ProductForm action={updateProduct} initialData={initialData} title="Edit Product" />;
}
