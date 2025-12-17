import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#000',
        paddingBottom: 15,
    },
    logoSection: {
        width: '40%',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'extrabold',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    orgDetails: {
        width: '50%',
        textAlign: 'right',
        fontSize: 9,
        lineHeight: 1.4,
    },
    titleSection: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    docTitle: {
        fontSize: 24,
        fontWeight: 'extrabold',
        textTransform: 'uppercase',
        color: '#000',
        letterSpacing: 1,
    },
    docMeta: {
        fontSize: 10,
        textAlign: 'right',
    },
    gridTwo: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 20,
    },
    col: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 9,
        color: '#64748b',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    addressText: {
        fontSize: 10,
        lineHeight: 1.5,
    },
    bold: {
        fontWeight: 'bold',
        color: '#000',
    },
    table: {
        width: '100%',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#94a3b8',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderBottomWidth: 1,
        borderBottomColor: '#94a3b8',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        backgroundColor: '#fff',
    },
    th: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#000',
        borderRightWidth: 1,
        borderRightColor: '#94a3b8',
        padding: 8,
    },
    td: {
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#cbd5e1',
        padding: 8,
    },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 2,
        borderTopColor: '#000',
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    terms: {
        width: '55%',
        fontSize: 8,
        color: '#475569',
        lineHeight: 1.3,
    },
    signature: {
        width: '30%',
        textAlign: 'center',
    },
    sigLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        height: 40,
        marginBottom: 8,
    },
    sigText: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});

interface TicketDocumentProps {
    ticket: any;
    type: 'INWARD' | 'OUTWARD' | 'CHALLAN';
    targetCompanyId?: number;
}

export function TicketDocument({ ticket, type, targetCompanyId }: TicketDocumentProps) {
    const isOutward = type === 'OUTWARD'; // Return Receipt
    const isChallan = type === 'CHALLAN';

    let title = 'Inward Receipt';
    let docPrefix = 'REC';

    if (isOutward) {
        title = 'Return Receipt';
        docPrefix = 'RET';
    } else if (isChallan) {
        title = 'Dispatch Challan';
        docPrefix = 'DC';
    }

    const docNumber = `${docPrefix}-${ticket.ticketNumber || ticket.id}`;

    // Filter Logic
    let items = ticket.items;
    let vendor = null;

    if (isOutward) {
        // Show Returned items
        const returnedItems = items.filter((i: any) => i.status === 'RETURNED_TO_CUSTOMER');
        if (returnedItems.length > 0) items = returnedItems;
    } else if (isChallan) {
        // Show Sent items, filtered by Target Company if provided
        const sentItems = items.filter((i: any) => {
            const isSent = i.status === 'SENT_TO_COMPANY' || (i.companyBatchId && i.status !== 'RECEIVED');
            const matchesCompany = targetCompanyId ? i.companyBatch?.companyId === targetCompanyId : true;
            return isSent && matchesCompany;
        });

        if (sentItems.length > 0) {
            items = sentItems;
            if (items[0].companyBatch?.company) {
                vendor = items[0].companyBatch.company;
            }
        } else if (targetCompanyId) {
            // If target company provided but no items match, show empty list or handle gracefully.
            // But we should likely look for the vendor details from the full list if possible (edge case)
            // For now, if filtered list is empty, it will show empty table.
            items = [];
        }
    }

    const fixedDate = type === 'INWARD'
        ? new Date(ticket.createdAt)
        : new Date(ticket.updatedAt || ticket.createdAt); // Use updated or created for others

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        {ticket.organization?.logoUrl ? (
                            <Image
                                src={ticket.organization.logoUrl}
                                style={{ height: 40, objectFit: 'contain', objectPosition: 'left' }}
                            />
                        ) : (
                            <Text style={styles.logoText}>{ticket.organization?.name || 'ORGANIZATION'}</Text>
                        )}
                    </View>
                    <View style={styles.orgDetails}>
                        <Text style={styles.bold}>{ticket.organization?.name}</Text>
                        <Text>{ticket.organization?.address}</Text>
                        <Text>Phone: {ticket.organization?.phone}</Text>
                        {ticket.organization?.gstNumber && <Text>GSTIN: {ticket.organization.gstNumber}</Text>}
                        {ticket.organization?.email && <Text>Email: {ticket.organization?.email}</Text>}
                    </View>
                </View>

                {/* Title & Meta */}
                <View style={styles.titleSection}>
                    <Text style={styles.docTitle}>{title}</Text>
                    <View style={styles.docMeta}>
                        <Text style={styles.bold}>#{docNumber}</Text>
                        <Text>Date: {fixedDate.toLocaleDateString('en-GB')}</Text>
                        {isChallan && vendor && (
                            <Text>Vendor Ref: {items[0].companyBatch?.trackingNumber || 'N/A'}</Text>
                        )}
                    </View>
                </View>

                {/* Addresses Grid */}
                <View style={styles.gridTwo}>
                    {/* FROM SECTION */}
                    <View style={styles.col}>
                        <Text style={styles.sectionTitle}>{isOutward || isChallan ? 'From' : 'Received From'}</Text>
                        {isOutward || isChallan ? (
                            <View style={styles.addressText}>
                                <Text style={styles.bold}>{ticket.organization?.name}</Text>
                                <Text>{ticket.organization?.address}</Text>
                                <Text>Ph: {ticket.organization?.phone}</Text>
                                {ticket.organization?.gstNumber && <Text>GSTIN: {ticket.organization?.gstNumber}</Text>}
                            </View>
                        ) : (
                            <View style={styles.addressText}>
                                <Text style={styles.bold}>{ticket.customer.name}</Text>
                                <Text>{ticket.customer.address}</Text>
                                <Text>Ph: {ticket.customer.phone}</Text>
                            </View>
                        )}
                    </View>

                    {/* TO SECTION */}
                    <View style={styles.col}>
                        <Text style={styles.sectionTitle}>
                            {isOutward ? 'Returned To' : (isChallan ? 'Ship To' : 'Received By')}
                        </Text>
                        {isOutward ? (
                            <View style={styles.addressText}>
                                <Text style={styles.bold}>{ticket.customer.name}</Text>
                                <Text>{ticket.customer.address}</Text>
                                <Text>Ph: {ticket.customer.phone}</Text>
                            </View>
                        ) : isChallan ? (
                            <View style={styles.addressText}>
                                <Text style={styles.bold}>{vendor?.name || 'Service Center'}</Text>
                                <Text>{vendor?.address || 'Address Not Available'}</Text>
                                <Text>Ph: {vendor?.phone}</Text>
                                {vendor?.email && <Text>Email: {vendor?.email}</Text>}
                            </View>
                        ) : (
                            <View style={styles.addressText}>
                                <Text style={styles.bold}>{ticket.organization?.name}</Text>
                                <Text>{ticket.organization?.address}</Text>
                                <Text>Ph: {ticket.organization?.phone}</Text>
                                {ticket.organization?.gstNumber && <Text>GSTIN: {ticket.organization?.gstNumber}</Text>}
                            </View>
                        )}
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        {isOutward ? (
                            <>
                                <Text style={[styles.th, { width: '25%' }]}>Item / Problem</Text>
                                <Text style={[styles.th, { width: '20%' }]}>Resolution</Text>
                                <Text style={[styles.th, { width: '20%' }]}>Serial No.</Text>
                                <Text style={[styles.th, { width: '20%' }]}>Docket No.</Text>
                                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Amount</Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.th, { width: '40%' }]}>Item Details</Text>
                                <Text style={[styles.th, { width: '25%' }]}>Serial No.</Text>
                                <Text style={[styles.th, { width: '20%' }]}>Problem</Text>
                                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Warranty</Text>
                            </>
                        )}
                    </View>

                    {/* Table Rows */}
                    {items.map((item: any, idx: number) => (
                        <View key={item.id} style={styles.tableRow}>
                            {isOutward ? (
                                <>
                                    <View style={[styles.td, { width: '25%' }]}>
                                        <Text style={[styles.bold, { fontSize: 9 }]}>{item.product.name}</Text>
                                        <Text style={{ fontSize: 8, color: '#475569', marginBottom: 2 }}>{item.product.brand} - {item.product.modelNumber}</Text>
                                        <Text style={{ fontSize: 8 }}>{item.issueDescription}</Text>
                                        {item.customerReturnDescription && (
                                            <Text style={{ fontSize: 8, color: '#475569', marginTop: 2, fontStyle: 'italic' }}>Note: {item.customerReturnDescription}</Text>
                                        )}
                                    </View>
                                    <View style={[styles.td, { width: '20%' }]}>
                                        <Text>{item.resolution || item.status}</Text>
                                        {item.resolution === 'REJECTED' && (
                                            <Text style={{ color: '#ef4444', fontSize: 8, fontWeight: 'bold' }}>NOT REPAIRABLE</Text>
                                        )}
                                    </View>
                                    <View style={[styles.td, { width: '20%' }]}>
                                        <Text>Old: {item.serialNumber}</Text>
                                        {item.newSerialNumber && (
                                            <Text style={styles.bold}>New: {item.newSerialNumber}</Text>
                                        )}
                                    </View>
                                    <View style={[styles.td, { width: '20%' }]}>
                                        <Text>{item.returnMethod === 'COURIER' ? item.returnTrackingNumber : 'Hand Delivered'}</Text>
                                    </View>
                                    <View style={[styles.td, { width: '15%', textAlign: 'right' }]}>
                                        <Text>{item.finalCost ? item.finalCost.toFixed(2) : '0.00'}</Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={[styles.td, { width: '40%' }]}>
                                        <Text style={[styles.bold, { fontSize: 9 }]}>{item.product.name}</Text>
                                        <Text style={{ fontSize: 8, color: '#64748b' }}>{item.product.brand} • {item.product.modelNumber}</Text>
                                    </View>
                                    <Text style={[styles.td, { width: '25%' }]}>{item.serialNumber}</Text>
                                    <Text style={[styles.td, { width: '20%' }]}>{item.issueDescription}</Text>
                                    <Text style={[styles.td, { width: '15%', textAlign: 'right' }]}>{item.isUnderWarranty ? 'Yes' : 'No'}</Text>
                                </>
                            )}
                        </View>
                    ))}
                </View>

                {/* Total Section for Return Receipt */}
                {isOutward && (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <View style={{ width: '40%', flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#000', paddingTop: 8 }}>
                            <Text style={[styles.bold, { fontSize: 12 }]}>TOTAL AMOUNT:</Text>
                            <Text style={[styles.bold, { fontSize: 12 }]}>
                                {items.reduce((sum: number, item: any) => sum + (item.finalCost || 0), 0).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.terms}>
                        <Text style={[styles.bold, { marginBottom: 4 }]}>{isChallan ? 'DECLARATION:' : 'TERMS & CONDITIONS:'}</Text>
                        {isChallan ? (
                            <>
                                <Text>1. Material sent for repair/replacement.</Text>
                                <Text>2. Please return with reference to this challan number.</Text>
                                <Text>3. Not for sale.</Text>
                            </>
                        ) : (
                            <>
                                <Text>1. Goods once sold/repaired will not be taken back.</Text>
                                <Text>2. Warranty valid only with this original receipt.</Text>
                                <Text>3. Subject to local jurisdiction.</Text>
                            </>
                        )}
                    </View>
                    <View style={styles.signature}>
                        <View style={styles.sigLine}></View>
                        <Text style={styles.sigText}>Authorized Signatory</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}
