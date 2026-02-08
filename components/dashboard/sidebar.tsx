"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    Settings,
    ShieldCheck,
    LogOut,
    Menu,
    Shield
} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const menuItems = [
    { icon: LayoutDashboard, label: "Resumen", href: "/dashboard" },
    { icon: Users, label: "Clientes", href: "/dashboard/clients" },
    { icon: Shield, label: "Aseguradoras", href: "/dashboard/insurers" },
    { icon: FileText, label: "Pólizas", href: "/dashboard/policies" },
    { icon: CreditCard, label: "Cobranza", href: "/dashboard/billing" },
    { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden p-4 flex items-center justify-between bg-white border-b">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <ShieldCheck className="h-6 w-6" />
                    <span>Seguros RB</span>
                </div>
                <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
                    <Menu className="h-6 w-6 text-slate-600" />
                </button>
            </div>

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>

                {/* Logo Area */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                    <span className="text-xl font-bold tracking-tight">Seguros RB</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-emerald-600/10 text-emerald-400 font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white")} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User / Footer */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                            RB
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Rene Breton</p>
                            <p className="text-xs text-slate-400 truncate">Admin</p>
                        </div>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}
