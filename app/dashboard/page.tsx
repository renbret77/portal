"use client"

import { useEffect, useState } from "react"
import { Users, FileText, DollarSign, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"
import RenewalAlerts from "@/components/dashboard/overview/renewal-alerts"
import BranchDistribution from "@/components/dashboard/overview/branch-distribution"
import CollectionTimeline from "@/components/dashboard/overview/collection-timeline"

export default function DashboardPage() {
    const [stats, setStats] = useState({
        clients: 0,
        policies: 0,
        premiums: 0,
        claims: 0
    })
    const [policiesData, setPoliciesData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Get Clients Count
                const { count: clientCount, error: clientError } = await supabase
                    .from('clients')
                    .select('*', { count: 'exact', head: true })

                // 2. Get Policies with joined data
                const { data: policies, error: policyError } = await supabase
                    .from('policies')
                    .select(`
                        id, 
                        policy_number, 
                        status, 
                        premium_net, 
                        premium_total, 
                        payment_method,
                        start_date, 
                        end_date,
                        sub_branch,
                        notes,
                        clients (first_name, last_name, phone, email),
                        insurers (alias, name),
                        insurance_lines (name)
                    `)

                if (clientError) throw clientError
                if (policyError) throw policyError

                const allPolicies = (policies as any[]) || []

                // Calculate "Vigentes"
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                let activePoliciesCount = 0
                let totalPremiumsCurrentMonth = 0

                const currentMonth = today.getMonth()
                const currentYear = today.getFullYear()

                allPolicies.forEach((p: any) => {
                    const endDate = new Date(p.end_date)
                    endDate.setHours(0, 0, 0, 0)
                    const startDate = new Date(p.start_date)

                    if (endDate >= today && p.status !== 'Cancelada') {
                        activePoliciesCount++
                    }

                    // Sum premiums for policies starting THIS month
                    if (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
                        totalPremiumsCurrentMonth += (Number(p.premium_net) || 0)
                    }
                })

                setStats({
                    clients: clientCount || 0,
                    policies: activePoliciesCount,
                    premiums: totalPremiumsCurrentMonth,
                    claims: 0
                })

                setPoliciesData(allPolicies)

            } catch (error: any) {
                console.error('Error fetching dashboard data:', error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Resumen General</h1>
                <p className="text-slate-500 mt-2">Bienvenido a la vista de inteligencia de tu portafolio.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Clientes Registrados", value: loading ? "..." : stats.clients.toLocaleString(), icon: Users, color: "bg-blue-500" },
                    { label: "Pólizas Vigentes", value: loading ? "..." : stats.policies.toLocaleString(), icon: FileText, color: "bg-emerald-500" },
                    { label: "Primas Nuevas (Mes)", value: loading ? "..." : `$${stats.premiums.toLocaleString()}`, icon: DollarSign, color: "bg-amber-500" },
                    { label: "Siniestros Activos", value: "0", icon: Activity, color: "bg-rose-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl ${stat.color}/10`}>
                            <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Business Intelligence Area */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 min-h-[400px] flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-24"></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 min-h-[400px] flex items-center justify-center">
                        <div className="animate-pulse w-32 h-32 bg-slate-200 rounded-full"></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-h-[400px]">
                        {/* Alertas Tempranas (2 Columnas) */}
                        <div className="lg:col-span-2 h-full">
                            <RenewalAlerts policies={policiesData} />
                        </div>

                        {/* Distribución (1 Columna) */}
                        <div className="h-full">
                            <BranchDistribution policies={policiesData} />
                        </div>
                    </div>

                    {/* Agenda de Cobranza y Notificaciones */}
                    <div>
                        <CollectionTimeline policies={policiesData} />
                    </div>
                </div>
            )}
        </div>
    )
}
