"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Shield, Edit2, Settings, Users, Phone, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { InsurerModal } from "@/components/dashboard/insurers/insurer-modal"

// Types (Temporary until DB types regeneration)
interface Insurer {
    id: string
    name: string
    alias: string
    rfc: string
    logo_url: string
    website: string
    active: boolean
}

export default function InsurersPage() {
    const [insurers, setInsurers] = useState<Insurer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedInsurer, setSelectedInsurer] = useState<Insurer | null>(null)

    useEffect(() => {
        fetchInsurers()
    }, [])

    const fetchInsurers = async () => {
        console.log("Iniciando fetch de aseguradoras...")
        setLoading(true)
        try {
            const query = supabase.from('insurers').select('*').order('name')
            console.log("Query construido, ejecutando...")

            const { data, error } = await query
            console.log("Respuesta Supabase:", { data, error })

            if (error) throw error
            setInsurers(data || [])
        } catch (error) {
            console.error('Error loading insurers:', error)
            alert("Error cargando aseguradoras: " + (error as any).message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setSelectedInsurer(null)
        setIsModalOpen(true)
    }

    const handleEdit = (insurer: Insurer) => {
        setSelectedInsurer(insurer)
        setIsModalOpen(true)
    }

    // ... rest of the component

    const filteredInsurers = insurers.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        (i.alias && i.alias.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Catálogo de Aseguradoras</h1>
                    <p className="text-slate-500">Gestiona las compañías, claves de agente y configuraciones.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Nueva Aseguradora
                </button>
            </div>

            {/* Config & Modal */}
            <InsurerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchInsurers}
                insurerToEdit={selectedInsurer}
            />

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o alias..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : filteredInsurers.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No hay aseguradoras registradas</h3>
                    <p className="text-slate-500 mb-4">Agrega la primera manualmente.</p>
                    <button
                        onClick={handleCreate}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        + Crear Aseguradora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInsurers.map(insurer => (
                        <div key={insurer.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                            {insurer.logo_url ? (
                                                <img src={insurer.logo_url} alt={insurer.name} className="w-10 h-10 object-contain" />
                                            ) : (
                                                <Shield className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 line-clamp-1" title={insurer.name}>
                                                {insurer.alias || insurer.name}
                                            </h3>
                                            <p className="text-sm text-slate-500">{insurer.rfc || 'Sin RFC'}</p>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${insurer.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    {/* Stats placeholders - To be real later */}
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> Claves</span>
                                        <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700">0</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleEdit(insurer)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium">
                                        <Edit2 className="w-4 h-4" /> Editar
                                    </button>
                                    <button className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors" title="Configuraciones">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
