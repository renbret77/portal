"use client"

import { Clock, AlertTriangle, ShieldCheck } from "lucide-react"

export default function RenewalAlerts({ policies }: { policies: any[] }) {
    // 1. Calculate dates and filter
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingRenewals = policies.map(policy => {
        const endDate = new Date(policy.end_date)
        endDate.setHours(0, 0, 0, 0)

        // Difference in days
        const diffTime = endDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
            ...policy,
            daysRemaining: diffDays
        }
    }).filter(p => p.daysRemaining <= 30) // Only show policies expiring in 30 days or already expired

    // Sort: Expired first (negative days), then by closest to expire
    upcomingRenewals.sort((a, b) => a.daysRemaining - b.daysRemaining)

    // Slice to show max 5 on the dashboard overview
    const displayRenewals = upcomingRenewals.slice(0, 5)

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Próximas Renovaciones</h3>
                    <p className="text-sm text-slate-500">Pólizas a vencer en los próximos 30 días</p>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                    <Clock className="w-5 h-5" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {displayRenewals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Todo en orden</p>
                            <p className="text-sm text-slate-500">No hay pólizas por vencer pronto.</p>
                        </div>
                    </div>
                ) : (
                    displayRenewals.map((policy) => {
                        const isExpired = policy.daysRemaining < 0
                        const isUrgent = policy.daysRemaining === 0

                        let statusColor = "bg-amber-50 text-amber-700 border-amber-200"
                        let statusDot = "bg-amber-500"
                        let statusText = `En ${policy.daysRemaining} días`

                        if (isExpired) {
                            statusColor = "bg-rose-50 text-rose-700 border-rose-200"
                            statusDot = "bg-rose-500"
                            statusText = `Venció hace ${Math.abs(policy.daysRemaining)} días`
                        } else if (isUrgent) {
                            statusColor = "bg-rose-50 text-rose-700 border-rose-200"
                            statusDot = "bg-rose-500"
                            statusText = "Vence HOY"
                        }

                        // We join the client data in the main query
                        const clientName = policy.clients ? `${policy.clients.first_name} ${policy.clients.last_name}` : 'Cliente Desconocido'

                        return (
                            <div key={policy.id} className={`p-4 rounded-xl border ${statusColor} relative overflow-hidden group transition-all hover:shadow-md`}>
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-20"></div>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{clientName}</p>
                                        <p className="text-sm opacity-80 truncate">{policy.policy_number} • {policy.insurance_lines?.name || 'Seguro'}</p>
                                    </div>
                                    <div className="flex flex-col items-end whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 font-bold text-sm">
                                            {isExpired && <AlertTriangle className="w-4 h-4" />}
                                            {statusText}
                                        </div>
                                        <p className="text-xs font-medium opacity-70 mt-1 uppercase tracking-wider">
                                            {new Date(policy.end_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {upcomingRenewals.length > 5 && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <button className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                        Ver {upcomingRenewals.length - 5} más...
                    </button>
                </div>
            )}
        </div>
    )
}
