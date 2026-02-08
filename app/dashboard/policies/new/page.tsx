"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Shield, User, Building2, CreditCard, FileText, CheckCircle2, ChevronRight, ChevronLeft, Upload } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function NewPolicyPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Catalogos
    const [clients, setClients] = useState<any[]>([])
    const [insurers, setInsurers] = useState<any[]>([])
    const [lines, setLines] = useState<any[]>([])
    const [agentCodes, setAgentCodes] = useState<any[]>([])

    // Form State
    const [formData, setFormData] = useState({
        client_id: '',
        insurer_id: '',
        agent_code_id: '',
        policy_number: '',
        status: 'Vigente',
        branch_id: '',
        sub_branch: '',
        start_date: '',
        end_date: '',
        currency: 'MXN',
        premium_net: '',
        tax: '',
        premium_total: '',
        payment_method: 'Contado',
        notes: ''
    })

    useEffect(() => {
        fetchCatalogs()
    }, [])

    const fetchCatalogs = async () => {
        const [clientsRes, insurersRes, linesRes] = await Promise.all([
            supabase.from('clients').select('id, first_name, last_name').order('first_name'),
            supabase.from('insurers').select('id, name, alias').eq('active', true).order('name'),
            supabase.from('insurance_lines').select('id, name, category').eq('active', true).order('name')
        ])

        setClients(clientsRes.data || [])
        setInsurers(insurersRes.data || [])
        setLines(linesRes.data || [])
    }

    const fetchAgentCodes = async (insurerId: string) => {
        const { data } = await supabase
            .from('agent_codes')
            .select('id, code, description')
            .eq('insurer_id', insurerId)
        setAgentCodes(data || [])
    }

    const handleInsurerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value
        setFormData({ ...formData, insurer_id: id, agent_code_id: '' })
        if (id) fetchAgentCodes(id)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await supabase
                .from('policies')
                .insert([{
                    ...formData,
                    premium_net: parseFloat(formData.premium_net) || 0,
                    tax: parseFloat(formData.tax) || 0,
                    premium_total: parseFloat(formData.premium_total) || 0,
                }])

            if (error) throw error
            router.push('/dashboard/policies')
        } catch (error) {
            console.error('Error saving policy:', error)
            alert('Error al guardar la póliza')
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { id: 1, name: 'Asignación', icon: User },
        { id: 2, name: 'Detalles', icon: Shield },
        { id: 3, name: 'Vigencia', icon: CreditCard },
        { id: 4, name: 'Económicos', icon: FileText },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard/policies" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Pólizas
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">Nueva Póliza</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((s) => {
                        const Icon = s.icon
                        const isActive = step >= s.id
                        const isCurrent = step === s.id
                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCurrent ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 border-2 border-emerald-400' :
                                        isActive ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200' : 'bg-white text-slate-300 border-2 border-slate-100'
                                    }`}>
                                    {isActive && !isCurrent && step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {s.name}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8">
                    {/* Step 1: Client & Insurer */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Asignación de Póliza</h3>
                                <p className="text-slate-500 text-sm italic">Vincule la póliza con un cliente y su respectiva aseguradora.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Cliente Asegurado</label>
                                    <select
                                        required
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.client_id}
                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    >
                                        <option value="">Seleccionar Cliente...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Compañía Aseguradora</label>
                                    <select
                                        required
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.insurer_id}
                                        onChange={handleInsurerChange}
                                    >
                                        <option value="">Seleccionar Aseguradora...</option>
                                        {insurers.map(i => (
                                            <option key={i.id} value={i.id}>{i.alias || i.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Clave de Agente / Conducto</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.agent_code_id}
                                        onChange={(e) => setFormData({ ...formData, agent_code_id: e.target.value })}
                                        disabled={!formData.insurer_id}
                                    >
                                        <option value="">Seleccionar Clave...</option>
                                        {agentCodes.map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.description}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Policy Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Especificaciones Técnicas</h3>
                                <p className="text-slate-500 text-sm italic">Defina el ramo y número de identificación oficial.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Número de Póliza</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej. AX-55667788"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all uppercase"
                                        value={formData.policy_number}
                                        onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Ramo del Seguro</label>
                                    <select
                                        required
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.branch_id}
                                        onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                    >
                                        <option value="">Seleccionar Ramo...</option>
                                        {lines.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Sub-Ramo / Plan</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Cobertura Amplia / GMM Premium"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.sub_branch}
                                        onChange={(e) => setFormData({ ...formData, sub_branch: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Estado Operativo</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Vigente">Vigente</option>
                                        <option value="Pendiente">Pendiente de Emisión</option>
                                        <option value="Vencida">Vencida</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Dates */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Vigencia y Control</h3>
                                <p className="text-slate-500 text-sm italic">Establezca los periodos de protección legal.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Inicio de Vigencia</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Fin de Vigencia</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Fecha Emisión (Opcional)</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.issue_date}
                                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-emerald-800 uppercase tracking-tight">Recordatorio de Renovación</p>
                                    <p className="text-emerald-700/80 leading-snug">El sistema generará una alerta automática 30 días antes del vencimiento para asegurar la continuidad de la protección.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Economics */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Información Financiera</h3>
                                <p className="text-slate-500 text-sm italic">Detalle de primas y métodos de recaudación.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 block ml-1">Moneda</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        >
                                            <option value="MXN">Pesos (MXN)</option>
                                            <option value="USD">Dólares (USD)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 block ml-1">Forma de Pago</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                            value={formData.payment_method}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        >
                                            <option value="Contado">Anual / Contado</option>
                                            <option value="Semestral">Semestral</option>
                                            <option value="Trimestral">Trimestral</option>
                                            <option value="Mensual">Mensual</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between font-medium">
                                        <span className="text-slate-500">Prima Neta:</span>
                                        <input
                                            type="number"
                                            className="bg-transparent border-b border-slate-300 w-24 text-right focus:border-emerald-500 outline-none"
                                            placeholder="0.00"
                                            value={formData.premium_net}
                                            onChange={(e) => setFormData({ ...formData, premium_net: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between font-medium">
                                        <span className="text-slate-500">IVA / Impuestos:</span>
                                        <input
                                            type="number"
                                            className="bg-transparent border-b border-slate-300 w-24 text-right focus:border-emerald-500 outline-none"
                                            placeholder="0.00"
                                            value={formData.tax}
                                            onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                                        />
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-lg text-slate-900">
                                        <span>Total:</span>
                                        <input
                                            type="number"
                                            className="bg-transparent border-b-2 border-emerald-500 w-32 text-right outline-none"
                                            placeholder="0.00"
                                            value={formData.premium_total}
                                            onChange={(e) => setFormData({ ...formData, premium_total: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block ml-1">Observaciones Internas</label>
                                <textarea
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all h-24"
                                    placeholder="Detalles adicionales, número de serie de autos, asegurados adicionales, etc..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-8 py-6 flex items-center justify-between border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => step > 1 && setStep(step - 1)}
                        disabled={step === 1}
                        className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Anterior
                    </button>

                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={() => setStep(step + 1)}
                            className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 translate-x-1"
                        >
                            Siguiente
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-emerald-200 active:scale-95"
                        >
                            {loading ? 'Guardando...' : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Finalizar Registro
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>

            {/* Hint Box */}
            <div className="flex justify-center">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm text-xs text-slate-400 font-medium italic">
                    <Upload className="w-3.5 h-3.5" />
                    Consejo: Podrá cargar el PDF de la carátula una vez guardada la base de la póliza.
                </div>
            </div>
        </div>
    )
}
