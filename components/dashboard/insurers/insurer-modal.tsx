"use client"

import { useState, useEffect } from "react"
import { X, Save, User, Settings, Shield, Plus, Trash2, Building2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Insurer {
    id?: string
    name: string
    alias: string
    rfc: string
    website: string
}

interface InsurerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    insurerToEdit?: Insurer | null
}

const TABS = [
    { id: 'generales', label: 'Datos Generales', icon: Shield },
    { id: 'agentes', label: 'Claves de Agente', icon: User },
    { id: 'configuraciones', label: 'Configuraciones', icon: Settings },
]

export function InsurerModal({ isOpen, onClose, onSuccess, insurerToEdit }: InsurerModalProps) {
    const [activeTab, setActiveTab] = useState('generales')
    const [loading, setLoading] = useState(false)

    // Form States
    const [formData, setFormData] = useState<Insurer>({
        name: "",
        alias: "",
        rfc: "",
        website: ""
    })

    // Load data on edit
    useEffect(() => {
        if (insurerToEdit) {
            setFormData({
                id: insurerToEdit.id,
                name: insurerToEdit.name,
                alias: insurerToEdit.alias || "",
                rfc: insurerToEdit.rfc || "",
                website: insurerToEdit.website || ""
            })
        } else {
            // Reset on new
            setFormData({ name: "", alias: "", rfc: "", website: "" })
        }
        setActiveTab('generales')
    }, [insurerToEdit, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No autenticado")

            if (formData.id) {
                // Update
                const { error } = await (supabase.from('insurers') as any)
                    .update({
                        name: formData.name,
                        alias: formData.alias,
                        rfc: formData.rfc,
                        website: formData.website
                    })
                    .eq('id', formData.id)
                if (error) throw error
            } else {
                // Insert
                const { error } = await (supabase.from('insurers') as any)
                    .insert([{
                        name: formData.name,
                        alias: formData.alias,
                        rfc: formData.rfc,
                        website: formData.website
                    }])
                if (error) throw error
            }

            alert("Aseguradora guardada correctamente")
            onSuccess()
            onClose()

        } catch (error: any) {
            console.error(error)
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {insurerToEdit ? 'Editar Aseguradora' : 'Nueva Aseguradora'}
                            </h2>
                            <p className="text-sm text-slate-500">Gestión de compañía y reglas de negocio</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 pt-4 border-b border-slate-100 overflow-x-auto bg-white">
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                    ${isActive
                                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    <form id="insurer-form" onSubmit={handleSubmit}>

                        {/* 1. GENERALES */}
                        {activeTab === 'generales' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Razón Social *</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        placeholder="Ej. AXA Seguros, S.A. de C.V."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Alias (Nombre Corto)</label>
                                    <input
                                        value={formData.alias}
                                        onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        placeholder="Ej. AXA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">RFC</label>
                                    <input
                                        value={formData.rfc}
                                        onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 uppercase focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        placeholder="GNP9211244P0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Sitio Web</label>
                                    <input
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* 2. AGENTES (Placeholder for now) */}
                        {activeTab === 'agentes' && (
                            <div className="text-center py-12 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 inline-block">
                                    <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 text-sm mb-4">Guarda la aseguradora para gestionar las claves de agente.</p>
                                    {!formData.id && (
                                        <button
                                            type="submit"
                                            className="text-emerald-600 font-medium hover:text-emerald-700"
                                        >
                                            Guardar y Continuar
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. CONFIGURACIONES (Placeholder for now) */}
                        {activeTab === 'configuraciones' && (
                            <div className="text-center py-12 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 inline-block">
                                    <Settings className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 text-sm mb-4">Guarda la aseguradora para configurar ramos y derechos.</p>
                                    {!formData.id && (
                                        <button
                                            type="submit"
                                            className="text-emerald-600 font-medium hover:text-emerald-700"
                                        >
                                            Guardar y Continuar
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="insurer-form"
                        disabled={loading}
                        className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Guardar Aseguradora
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
