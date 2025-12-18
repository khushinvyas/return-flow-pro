import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PrintAutoTrigger from '@/components/PrintAutoTrigger';

export default async function PrintBatchPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session?.userId) redirect('/login');

    const id = parseInt((await params).id);
    if (isNaN(id)) notFound();

    const batch = await prisma.companyBatch.findUnique({
        where: { id },
        include: {
            company: true,
            organization: true,
            items: {
                include: { product: true }
            }
        }
    });

    if (!batch) notFound();

    // Fallback: If batch.organizationId is null (legacy/bug), fetch via company's orgId
    let organization = batch.organization;
    if (!organization && batch.company.organizationId) {
        organization = await prisma.organization.findUnique({
            where: { id: batch.company.organizationId }
        });
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid black', paddingBottom: '1rem' }}>
                <h1 style={{ fontSize: '2rem', margin: '0' }}>DISPATCH CHALLAN</h1>
                <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{organization?.name}</h2>
                {organization?.address && <p style={{ margin: '0' }}>{organization.address}</p>}
                {organization?.phone && <p style={{ margin: '0' }}>Ph: {organization.phone}</p>}
                {batch.dateSent && <p style={{ marginTop: '0.5rem' }}>Date: {new Date(batch.dateSent).toLocaleDateString()}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>From</h3>
                    <p><strong>{organization?.name || session.email}</strong></p>
                    {organization?.address && <p>{organization.address}</p>}
                    {organization?.phone && <p>{organization.phone}</p>}
                    <p>{session.email}</p>
                    {organization?.gstNumber && <p><strong>GSTIN:</strong> {organization.gstNumber}</p>}
                </div>
                <div>
                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>To (Vendor)</h3>
                    <p><strong>{batch.company.name}</strong></p>
                    <p>{batch.company.address}</p>
                    <p>{batch.company.phone}</p>
                    <p>{batch.company.email}</p>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                {(batch.dispatchNote || batch.courierName) && (
                    <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', background: '#f9f9f9' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>Dispatch Information</h3>
                        {batch.dispatchNote && (
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Note:</strong> <span style={{ whiteSpace: 'pre-wrap' }}>{batch.dispatchNote}</span>
                            </div>
                        )}
                        {batch.courierName && (
                            <div>
                                <strong>Courier:</strong> {batch.courierName}
                                {batch.trackingNumber && <span style={{ marginLeft: '1.5rem' }}><strong>Tracking #:</strong> {batch.trackingNumber}</span>}
                            </div>
                        )}
                    </div>
                )}
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>Items to Dispatch ({batch.items.length})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #999' }}>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Product</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Serial No.</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Description/Issue</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Warranty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batch.items.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}>
                                    <strong>{item.product.brand}</strong> {item.product.name}
                                    <br />
                                    <small>{item.product.modelNumber}</small>
                                </td>
                                <td style={{ padding: '0.5rem' }}>{item.serialNumber}</td>
                                <td style={{ padding: '0.5rem' }}>{item.issueDescription}</td>
                                <td style={{ padding: '0.5rem' }}>{item.isUnderWarranty ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '200px', borderTop: '1px solid black', paddingTop: '0.5rem' }}>Authorized Signature</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '200px', borderTop: '1px solid black', paddingTop: '0.5rem' }}>Receiver Signature</div>
                </div>
            </div>

            <PrintAutoTrigger />
        </div>
    );
}
