import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PrintAutoTrigger from '@/components/PrintAutoTrigger';

// ... imports
export default async function PrintTicketPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ type?: string }> }) {
    const session = await getSession();
    if (!session?.userId) redirect('/login');

    const id = parseInt((await params).id);
    const type = (await searchParams).type || 'INWARD'; // INWARD or OUTWARD

    if (isNaN(id)) notFound();

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            customer: true,
            organization: true,
            items: {
                include: { product: true }
            }
        }
    });

    if (!ticket) notFound();

    const isOutward = type === 'OUTWARD';
    const itemsToShow = isOutward
        ? ticket.items.filter(i => i.status === 'RETURNED_TO_CUSTOMER')
        : ticket.items;

    const title = isOutward ? 'RETURN INVOICE' : 'INWARD RECEIPT';

    // GST only required on Outward
    const showGst = isOutward && ticket.organization?.gstNumber;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid black', paddingBottom: '1rem' }}>
                <h1 style={{ fontSize: '2rem', margin: '0' }}>{title}</h1>
                <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{ticket.organization?.name || 'ReturnFlow Pro System'}</h2>
                {ticket.organization?.address && <p style={{ margin: '0' }}>{ticket.organization.address}</p>}
                {ticket.organization?.phone && <p style={{ margin: '0' }}>Ph: {ticket.organization.phone}</p>}
                {showGst && <p style={{ margin: '0', fontWeight: 'bold' }}>GSTIN: {ticket.organization?.gstNumber}</p>}
                <p style={{ marginTop: '0.5rem' }}>Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>From</h3>
                    {isOutward ? (
                        <>
                            {/* OUTWARD: From User/Org */}
                            <p><strong>{ticket.organization?.name}</strong></p>
                            <p>{ticket.organization?.address}</p>
                            <p>{ticket.organization?.phone}</p>
                            <p>{session.email}</p>
                        </>
                    ) : (
                        <>
                            {/* INWARD: From Customer */}
                            <p><strong>{ticket.customer.name}</strong></p>
                            <p>{ticket.customer.address || 'N/A'}</p>
                            <p>{ticket.customer.phone}</p>
                            <p>{ticket.customer.email || 'N/A'}</p>
                        </>
                    )}
                </div>
                <div>
                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>To</h3>
                    {isOutward ? (
                        <>
                            {/* OUTWARD: To Customer */}
                            <p><strong>{ticket.customer.name}</strong></p>
                            <p>{ticket.customer.address || 'N/A'}</p>
                            <p>{ticket.customer.phone}</p>
                            <p>{ticket.customer.email || 'N/A'}</p>
                        </>
                    ) : (
                        <>
                            {/* INWARD: To User/Org */}
                            <p><strong>{ticket.organization?.name}</strong></p>
                            <p>{ticket.organization?.address}</p>
                            <p>{ticket.organization?.phone}</p>
                            <p>{session.email}</p>
                        </>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>Products ({itemsToShow.length})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #999' }}>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Product</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Serial No</th>
                            {isOutward ? (
                                <>
                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>New Serial No</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Warranty</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Docket No</th>
                                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Charges</th>
                                </>
                            ) : (
                                <>
                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Issue</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Warranty</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {itemsToShow.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}>
                                    <strong>{item.product.brand}</strong> {item.product.name}
                                    <br />
                                    <small>{item.product.modelNumber}</small>
                                </td>
                                <td style={{ padding: '0.5rem' }}>{item.serialNumber}</td>
                                {isOutward ? (
                                    <>
                                        <td style={{ padding: '0.5rem' }}>{item.newSerialNumber || '-'}</td>
                                        <td style={{ padding: '0.5rem' }}>{item.isUnderWarranty ? 'In-Warranty' : 'Out-Warranty'}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {item.resolution || 'Returned'}
                                            {/* Display fixed date if available */}
                                            {item.dateReturnedToCustomer && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Date: {new Date(item.dateReturnedToCustomer).toLocaleDateString()}</div>}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {item.returnMethod === 'COURIER' ? item.returnTrackingNumber : '-'}
                                        </td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                            {item.finalCost ? `₹${item.finalCost}` : '0'}
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ padding: '0.5rem' }}>{item.issueDescription}</td>
                                        <td style={{ padding: '0.5rem' }}>{item.isUnderWarranty ? 'Yes' : 'No'}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isOutward && itemsToShow.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                        No items have been marked as returned to customer yet.
                    </div>
                )}
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '200px', borderTop: '1px solid black', paddingTop: '0.5rem' }}>Customer Signature</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '200px', borderTop: '1px solid black', paddingTop: '0.5rem' }}>Authorized Signature</div>
                </div>
            </div>

            <PrintAutoTrigger />
        </div>
    );
}
