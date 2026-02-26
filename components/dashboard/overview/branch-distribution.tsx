"use client"

import { PieChart, Activity } from "lucide-react"

export default function BranchDistribution({ policies }: { policies: any[] }) {
    // Group policies by branch manually for the MVP graph
    const branchCounts: Record<string, number> = {}
    let totalActive = 0

    policies.forEach(policy => {
        // Only count active/future policies
        const endDate = new Date(policy.end_date)
        const today = new Date()
        endDate.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)

        if (endDate >= today && policy.status !== 'Cancelada') {
            const branchName = policy.insurance_lines?.name || 'Sin Ramo'
            branchCounts[branchName] = (branchCounts[branchName] || 0) + 1
            totalActive++
        }
    })

    const sortedBranches = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Distribución de Cartera</h3>
                    <p className="text-sm text-slate-500">Pólizas vigentes por ramo</p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <PieChart className="w-5 h-5" />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                {totalActive === 0 ? (
                    <div className="text-center text-slate-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No hay datos suficientes</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-slate-900">{totalActive}</span>
                            <span className="text-slate-500 font-medium mb-1">pólizas activas</span>
                        </div>

                        <div className="space-y-4">
                            {sortedBranches.slice(0, 4).map(([branch, count], index) => {
                                const percentage = Math.round((count / totalActive) * 100)
                                // Assign colors conditionally or round robin
                                const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-500']
                                const colorClass = colors[index % colors.length]

                                return (
                                    <div key={branch}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700">{branch}</span>
                                            <span className="text-slate-500 font-bold">{percentage}% ({count})</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                                            <div className={`${colorClass} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
