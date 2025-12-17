import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
    ExternalLink, ShoppingBag, User, Smartphone, AlertCircle,
    Phone, MapPin, Mail, Calendar, Clock, ArrowRight
} from "lucide-react";

interface TicketDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: any;
}

export default function TicketDetailsSheet({ open, onOpenChange, ticket }: TicketDetailsSheetProps) {
    if (!ticket) return null;

    const getStatusVariant = (status: string) => {
        if (status === 'COMPLETED' || status === 'RETURNED_TO_CUSTOMER') return 'success';
        if (status === 'OPEN' || status === 'RECEIVED') return 'warning';
        if (status === 'SENT_TO_COMPANY') return 'blue';
        return 'default';
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:w-[560px] p-0 flex flex-col">
                {/* Premium Header with Gradient */}
                <div className="relative overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

                    <div className="relative p-6 pt-12">
                        <div className="flex items-start justify-between mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                        #{ticket.ticketNumber || ticket.id}
                                    </span>
                                    <Badge variant={getStatusVariant(ticket.status)} glow className="text-[10px]">
                                        {ticket.status?.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Service Request</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                Created {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={12} />
                                Updated {new Date(ticket.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">

                        {/* Customer Card */}
                        <section>
                            <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                                <div className="p-1.5 rounded-md bg-indigo-100">
                                    <User size={12} className="text-indigo-600" />
                                </div>
                                Customer Details
                            </h3>
                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/80 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-semibold text-slate-900 text-lg">{ticket.customer.name}</div>
                                        {ticket.customer.email && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <Mail size={12} />
                                                {ticket.customer.email}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                        ID: {ticket.customer.id}
                                    </span>
                                </div>
                                <Separator className="my-3" />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                                            <Phone size={10} />
                                            Phone
                                        </div>
                                        <div className="text-slate-700 font-medium">{ticket.customer.phone || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                                            <MapPin size={10} />
                                            Address
                                        </div>
                                        <div className="text-slate-700 truncate" title={ticket.customer.address}>
                                            {ticket.customer.address || '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Items Section */}
                        <section>
                            <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                                <div className="p-1.5 rounded-md bg-purple-100">
                                    <ShoppingBag size={12} className="text-purple-600" />
                                </div>
                                Items ({ticket.items?.length || 0})
                            </h3>
                            <div className="space-y-3">
                                {ticket.items?.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="group relative bg-white border border-slate-200/80 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                                    >
                                        {/* Status Bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${item.status === 'RETURNED_TO_CUSTOMER' ? 'bg-emerald-500' :
                                                item.status === 'SENT_TO_COMPANY' ? 'bg-blue-500' :
                                                    item.status === 'RECEIVED_FROM_COMPANY' ? 'bg-purple-500' :
                                                        'bg-amber-500'
                                            }`} />

                                        <div className="flex justify-between items-start mb-3 pl-2">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200">
                                                    <Smartphone size={18} className="text-slate-400" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{item.product.name}</div>
                                                    <code className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                        S/N: {item.serialNumber}
                                                    </code>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusVariant(item.status)} className="text-[9px]">
                                                {item.status?.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>

                                        {/* Issue Description */}
                                        <div className="ml-2 bg-rose-50/50 rounded-lg p-3 border border-rose-100/50">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-xs font-semibold text-rose-700 block mb-1">Reported Issue</span>
                                                    <p className="text-xs text-slate-600 leading-relaxed">{item.issueDescription}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Premium Footer */}
                <div className="p-5 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <Link
                        href={`/tickets/${ticket.id}`}
                        className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 group"
                    >
                        View Full Details
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}
