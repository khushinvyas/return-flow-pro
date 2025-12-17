'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateOrganizationSettings(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.organizationId) {
        return { message: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const gstNumber = formData.get('gstNumber') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;

    const logo = formData.get('logo') as string;

    if (!name) {
        return { message: 'Organization name is required' };
    }

    try {
        await prisma.organization.update({
            where: { id: session.organizationId },
            data: {
                name,
                gstNumber,
                address,
                phone,
                ...(logo && logo.length > 0 ? { logoUrl: logo } : {})
            }
        });

        revalidatePath('/settings');
        return { message: 'Settings updated successfully', success: true };
    } catch (error) {
        console.error('Error updating organization:', error);
        return { message: 'Failed to update settings' };
    }
}
