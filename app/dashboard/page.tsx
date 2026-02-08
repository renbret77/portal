"use client"

import { useEffect, useState } from "react"
import { Users, FileText, DollarSign, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
    const [stats, setStats] = useState({
        clients: 0,
        policies: 0,
        premiums: 0,
        claims: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Get Clients Count
                const { count: clientCount, error: clientError } = await supabase
                    .from('clients')
                    .select('*', { count: 'exact', head: true })

                // 2. Get Policies Count & Sum Premiums
                const { data: policies, error: policyError } = await supabase
                    .from('policies')
                    .select('premium_amount, status')

                if (clientError) throw clientError
                if (policyError) throw policyError

                const activePolicies = policies?.length || 0
                const totalPremiums = policies?.reduce((sum: number, p: any) => sum + (Number(p.premium_amount) || 0), 0) || 0

                setStats({
                    clients: clientCount || 0,
                    policies: activePolicies,
                    premiums: totalPremiums,
                    claims: 0 // Placeholder for now as we don't have claims table yet
                })
            } catch (error: any) {
                console.error('Error fetching dashboard data:', error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Resumen General</h1>
                <p className="text-slate-500 mt-2">Bienvenido a tu panel de control.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Clientes Activos", value: loading ? "..." : stats.clients.toLocaleString(), icon: Users, color: "bg-blue-500" },
                    { label: "Pólizas Vigentes", value: loading ? "..." : stats.policies.toLocaleString(), icon: FileText, color: "bg-emerald-500" },
                    { label: "Primas del Mes", value: loading ? "..." : `$${stats.premiums.toLocaleString()}`, icon: DollarSign, color: "bg-amber-500" },
                    { label: "Siniestros", value: "0", icon: Activity, color: "bg-rose-500" },
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

            {/* Placeholder Content Area */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8 min-h-[400px] flex items-center justify-center border-dashed border-2">
                <p className="text-slate-400 text-center">
                    Próximamente: Gráficas de rendimiento y tabla de últimas renovaciones.
                </p>
            </div>
        </div>
    )
}
