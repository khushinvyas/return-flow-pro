'use client';

import CustomerForm from '@/components/CustomerForm';
import { createCustomer } from '@/app/actions/customer';

export default function AddCustomerPage() {
    return <CustomerForm action={createCustomer} />;
}
