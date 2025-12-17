import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

// Maps status values to Badge variants and display labels
const statusConfig: Record<string, { variant: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'blue' | 'purple'; label: string }> = {
    // Item statuses
    'RECEIVED': { variant: 'warning', label: 'Received' },
    'SENT_TO_COMPANY': { variant: 'blue', label: 'Sent to Company' },
    'RECEIVED_FROM_COMPANY': { variant: 'purple', label: 'Received from Company' },
    'RETURNED_TO_CUSTOMER': { variant: 'success', label: 'Returned to Customer' },

    // Ticket statuses
    'OPEN': { variant: 'warning', label: 'Open' },
    'IN_PROGRESS': { variant: 'blue', label: 'In Progress' },
    'PENDING': { variant: 'purple', label: 'Pending' },
    'RESOLVED': { variant: 'success', label: 'Resolved' },
    'CLOSED': { variant: 'default', label: 'Closed' },
    'CANCELLED': { variant: 'error', label: 'Cancelled' },

    // Resolution statuses
    'REPAIRED': { variant: 'success', label: 'Repaired' },
    'REPLACED': { variant: 'blue', label: 'Replaced' },
    'REJECTED': { variant: 'error', label: 'Rejected' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const config = statusConfig[status] || { variant: 'default' as const, label: formatStatus(status) };

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
}

function formatStatus(status: string): string {
    if (!status) return 'Unknown';
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
