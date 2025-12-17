"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

const SheetContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null)

export function Sheet({ open, onOpenChange, children }: SheetProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const actualOpen = open !== undefined ? open : isOpen
    const actualOnOpenChange = onOpenChange || setIsOpen

    // Handle escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && actualOpen) {
                actualOnOpenChange(false)
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [actualOpen, actualOnOpenChange])

    // Prevent body scroll when open
    React.useEffect(() => {
        if (actualOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [actualOpen])

    return (
        <SheetContext.Provider value={{ open: actualOpen, onOpenChange: actualOnOpenChange }}>
            {children}
        </SheetContext.Provider>
    )
}

export function SheetContent({ side = "right", className, children }: { side?: "right" | "left", className?: string, children: React.ReactNode }) {
    const context = React.useContext(SheetContext)

    if (!context?.open) return null

    return (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
            {/* Backdrop - covers entire screen including sidebar */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => context.onOpenChange(false)}
                aria-hidden="true"
            />

            {/* Panel Container */}
            <div
                className={cn(
                    "fixed inset-y-0 z-[101] flex flex-col",
                    "bg-white dark:bg-slate-900",
                    "shadow-2xl border-l border-slate-200 dark:border-slate-700",
                    "transition-transform duration-300 ease-out",
                    side === "right" && "right-0",
                    side === "left" && "left-0 border-l-0 border-r",
                    className
                )}
                style={{
                    width: 'min(40rem, 90vw)',
                }}
            >
                {/* Close Button */}
                <button
                    onClick={() => context.onOpenChange(false)}
                    className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    )
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
            {...props}
        />
    )
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cn("text-lg font-semibold text-foreground", className)}
            {...props}
        />
    )
}
