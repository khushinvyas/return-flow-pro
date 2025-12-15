
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import CustomerForm from '@/components/CustomerForm';
import { updateCustomer } from '@/app/actions/customer';
import { getSession } from '@/lib/auth';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session?.userId) redirect('/login');

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const { id } = await params;
    const customer = await prisma.customer.findFirst({
        where: {
            id: Number(id),
            ...orgFilter
        }
    });

    if (!customer) {
        notFound();
    }

    // Transform nulls to undefined to match optional props if needed, or let component handle it
    const initialData = {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
    };

    return <CustomerForm action={updateCustomer} initialData={initialData} title="Edit Customer" />;
}
