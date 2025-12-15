
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import CompanyForm from '@/components/CompanyForm';
import { updateCompany } from '@/app/actions/inventory'; // Need to ensure updateCompany exists
import { getSession } from '@/lib/auth';

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session?.userId) redirect('/login');

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const { id } = await params;
    const company = await prisma.company.findFirst({
        where: {
            id: Number(id),
            ...orgFilter
        }
    });

    if (!company) {
        notFound();
    }

    const initialData = {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
    };

    return <CompanyForm action={updateCompany} initialData={initialData} title="Edit Company" />;
}
