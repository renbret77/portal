"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Shield, Calendar, Building2, User, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database.types"

type Policy = Database['public']['Tables']['policies']['Row'] & {
    clients: { first_name: string, last_name: string },
    insurers: { name: string, alias: string },
    insurance_lines: { name: string }
}

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchPolicies()
    }, [])

    const fetchPolicies = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('policies')
                .select(`
                    *,
                    clients (first_name, last_name, phone),
                    insurers (name, alias),
                    insurance_lines (name),
                    policy_installments (whatsapp_sent, whatsapp_status, due_date)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPolicies(data || [])
        } catch (error) {
            console.error('Error loading policies:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredPolicies = policies.filter(policy =>
        (policy.policy_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (policy.clients?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (policy.clients?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const getComputedStatus = (policy: any) => {
        if (policy.status === 'Cancelada') return { text: 'Cancelada', color: 'bg-slate-100 text-slate-800' }

        const endDate = new Date(policy.end_date)
        endDate.setHours(0, 0, 0, 0)

        const diffTime = endDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return { text: 'Vencida', color: 'bg-rose-100 text-rose-800' }
        if (diffDays <= 30) return { text: 'Por Vencer', color: 'bg-amber-100 text-amber-800' }
        return { text: 'Vigente', color: 'bg-emerald-100 text-emerald-800' }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Pólizas</h1>
                    <p className="text-slate-500 mt-1">Administra el inventario de riesgos y vigencias.</p>
                </div>
                <Link href="/dashboard/policies/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-emerald-200 active:scale-95">
                    <Plus className="w-5 h-5" />
                    Nueva Póliza
                </Link>
            </div>

            {/* Stats Overview (Mini) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Vigentes</p>
                        <p className="text-2xl font-bold text-slate-900">{policies.filter(p => getComputedStatus(p).text === 'Vigente').length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Por Vencer / Vencidas</p>
                        <p className="text-2xl font-bold text-slate-900">{policies.filter(p => ['Por Vencer', 'Vencida'].includes(getComputedStatus(p).text)).length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aseguradoras</p>
                        <p className="text-2xl font-bold text-slate-900">{new Set(policies.map(p => p.insurer_id)).size}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por número o cliente..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Policies Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-medium">Cargando catálogo de pólizas...</p>
                    </div>
                ) : filteredPolicies.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="bg-slate-50 mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <Shield className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No hay pólizas registradas</h3>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto">Comienza agregando tu primera póliza para gestionar las vigencias y siniestros.</p>
                        <Link href="/dashboard/policies/new" className="mt-6 inline-flex items-center text-emerald-600 font-semibold hover:underline">
                            Registrar nueva póliza →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-slate-600 border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-widest font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Póliza / Ramo</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Aseguradora</th>
                                    <th className="px-6 py-4">Vigencia</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Comunicaciones</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPolicies.map((policy) => (
                                    <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{policy.policy_number}</span>
                                                <span className="text-xs text-slate-400 font-medium">{policy.insurance_lines?.name || 'Varios'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    {policy.clients?.first_name?.[0]}{policy.clients?.last_name?.[0]}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {policy.clients?.first_name} {policy.clients?.last_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">{policy.insurers?.alias || policy.insurers?.name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{policy.payment_method}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col text-xs">
                                                <span className="text-slate-500 font-medium">Ini: {new Date(policy.start_date).toLocaleDateString()}</span>
                                                <span className="text-slate-900 font-bold whitespace-nowrap italic">Fin: {new Date(policy.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm
                                                ${getComputedStatus(policy).color}`}>
                                                {getComputedStatus(policy).text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                {/* WhatsApp */}
                                                <div className={`p-1.5 rounded-lg border ${policy.policy_installments?.some((i: any) => i.whatsapp_sent) ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`} title="WhatsApp">
                                                    <MessageCircle className="w-4 h-4" />
                                                </div>
                                                {/* Email (Mockup for now) */}
                                                <div className="p-1.5 rounded-lg border bg-slate-50 border-slate-100 text-slate-300 opacity-50" title="Correo (Próximamente)">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                                </div>
                                                {/* Telegram (Mockup for now) */}
                                                <div className="p-1.5 rounded-lg border bg-slate-50 border-slate-100 text-slate-300 opacity-50" title="Telegram (Próximamente)">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.112l3.363 1.054 1.258 3.93a2.25 2.25 0 0 0 4.177.3l2.847-4.21 4.584 3.493a2.25 2.25 0 0 0 3.52-1.22l3.75-15a2.25 2.25 0 0 0-2.25-2.25c-.297 0-.585.056-.854.16z" /></svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        const message = encodeURIComponent(`Hola ${policy.clients?.first_name} 👋, te recordamos el pago de tu póliza ${policy.policy_number} de ${policy.insurers?.alias || policy.insurers?.name} 📄. ¡Saludos! ✅`)
                                                        window.open(`https://wa.me/${policy.clients?.phone?.replace(/\D/g, '')}?text=${message}`, '_blank')
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                    title="Enviar recordatorio WhatsApp"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                                <Link href={`/dashboard/policies/${policy.id}`} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
