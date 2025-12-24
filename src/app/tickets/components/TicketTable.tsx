'use client';

import * as React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import TicketDetailsSheet from './TicketDetailsSheet';
import { ArrowUpDown, Search, Maximize2, Minimize2, Filter, ChevronRight } from 'lucide-react';

interface TicketTableProps {
    data: any[];
}

export default function TicketTable({ data }: TicketTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [selectedTicket, setSelectedTicket] = React.useState<any>(null);
    const [isCompact, setIsCompact] = React.useState(true);

    const columns: ColumnDef<any>[] = React.useMemo(() => [
        {
            accessorKey: 'ticketNumber',
            header: ({ column }) => (
                <button
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ticket # <ArrowUpDown className="h-3 w-3" />
                </button>
            ),
            cell: ({ row }) => (
                <span className="font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    #{row.getValue('ticketNumber') || row.original.id}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <button
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date <ArrowUpDown className="h-3 w-3" />
                </button>
            ),
            cell: ({ row }) => (
                <span className="text-slate-600 text-sm">
                    {new Date(row.getValue('createdAt')).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'customer.name',
            header: () => <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</span>,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{row.original.customer.name}</span>
                    <span className="text-xs text-slate-400">{row.original.customer.phone}</span>
                </div>
            ),
        },
        {
            accessorKey: 'items',
            id: 'model',
            header: () => <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product</span>,
            cell: ({ row }) => {
                const items = row.original.items || [];
                return (
                    <div className="flex flex-col gap-0.5">
                        {items.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <span className="text-sm text-slate-700 truncate max-w-[140px]" title={item.product.name}>
                                    {item.product.name}
                                </span>
                            </div>
                        ))}
                        {items.length > 2 && (
                            <span className="text-xs text-slate-400 pl-3.5">+{items.length - 2} more</span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'items',
            id: 'serialNumber',
            header: () => <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Serial No.</span>,
            cell: ({ row }) => {
                const items = row.original.items || [];
                return (
                    <div className="flex flex-col gap-1">
                        {items.slice(0, 2).map((item: any, idx: number) => (
                            <code key={idx} className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-fit">
                                {item.serialNumber}
                            </code>
                        ))}
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: () => <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                let variant: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'blue' | 'purple' = 'default';

                if (status === 'COMPLETED' || status === 'RETURNED_TO_CUSTOMER') {
                    variant = 'success';
                } else if (status === 'RECEIVED' || status === 'RECEIVED_FROM_COMPANY' || status === 'OPEN') {
                    variant = 'warning';
                } else if (status === 'SENT_TO_COMPANY') {
                    variant = 'blue';
                }

                return (
                    <Badge variant={variant} glow className="text-[10px]">
                        {status.replace(/_/g, ' ')}
                    </Badge>
                );
            },
        },
        {
            id: 'daysOpen',
            header: ({ column }) => (
                <button
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Age <ArrowUpDown className="h-3 w-3" />
                </button>
            ),
            accessorFn: (row) => {
                const created = new Date(row.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - created.getTime());
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            },
            cell: ({ row }) => {
                const days = row.getValue('daysOpen') as number;
                return (
                    <span className={`font-mono text-sm font-medium ${days > 7 ? 'text-rose-600' : days > 3 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                        {days}d
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: () => (
                <ChevronRight className="h-4 w-4 text-slate-300" />
            ),
        },
    ], []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        globalFilterFn: (row, columnId, filterValue) => {
            const value = row.getValue(columnId);
            if (typeof value === 'string') return value.toLowerCase().includes(filterValue.toLowerCase());
            if (typeof value === 'number') return value.toString().includes(filterValue);
            if (row.original.customer?.name?.toLowerCase().includes(filterValue.toLowerCase())) return true;
            if (row.original.items?.some((i: any) => i.product.name.toLowerCase().includes(filterValue.toLowerCase()) || i.serialNumber.toLowerCase().includes(filterValue.toLowerCase()) || i.newSerialNumber?.toLowerCase().includes(filterValue.toLowerCase()))) return true;
            return false;
        }
    });

    return (
        <div className="flex flex-col">
            {/* Premium Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tickets, customers, serial numbers..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="w-full pl-10 pr-4 h-10 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 h-9 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <button
                        onClick={() => setIsCompact(!isCompact)}
                        className="hidden sm:flex items-center gap-2 px-3 h-9 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        {isCompact ? 'Expand' : 'Compact'}
                    </button>
                </div>
            </div>

            {/* Premium Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-11 px-4">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => setSelectedTicket(row.original)}
                                    className={`
                                        cursor-pointer 
                                        transition-all duration-150
                                        hover:bg-indigo-50/50
                                        border-b border-slate-100 last:border-0
                                        ${isCompact ? 'h-12' : 'h-16'}
                                    `}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={`px-4 ${isCompact ? 'py-2' : 'py-3'}`}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Search className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="font-medium">No tickets found</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
                <div className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-700">{table.getRowModel().rows.length}</span> of <span className="font-medium text-slate-700">{data.length}</span> tickets
                </div>
            </div>

            <TicketDetailsSheet
                open={!!selectedTicket}
                onOpenChange={(open) => !open && setSelectedTicket(null)}
                ticket={selectedTicket}
            />
        </div>
    );
}
