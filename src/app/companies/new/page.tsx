'use client';

import CompanyForm from '@/components/CompanyForm';
import { createCompany } from '@/app/actions/inventory';

export default function AddCompanyPage() {
    return <CompanyForm action={createCompany} />;
}
