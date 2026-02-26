"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Shield, User, Building2, CreditCard, FileText, CheckCircle2, ChevronRight, ChevronLeft, Upload } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function EditPolicyPage({ params }: { params: any }) {
    const resolvedParams: any = use(params)
    const policyId = resolvedParams?.id
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Catalogos
    const [clients, setClients] = useState<any[]>([])
    const [insurers, setInsurers] = useState<any[]>([])
    const [lines, setLines] = useState<any[]>([])
    const [agentCodes, setAgentCodes] = useState<any[]>([])

    // Form State
    const [formData, setFormData] = useState<any>({
        client_id: '',
        insurer_id: '',
        agent_code_id: '',
        policy_number: '',
        status: 'Vigente',
        branch_id: '',
        sub_branch: '',
        start_date: '',
        end_date: '',
        issue_date: '',
        currency: 'MXN',
        premium_net: '',
        tax: '',
        premium_total: '',
        payment_method: 'Contado',
        notes: '',
        total_installments: '1',
        current_installment: '1',
        payment_link: '',
        is_domiciled: false,
        policy_fee: '0',
        surcharge_percentage: '0',
        surcharge_amount: '0',
        discount_percentage: '0',
        discount_amount: '0',
        extra_premium: '0',
        tax_percentage: '16',
        vat_amount: '0',
        commission_percentage: '0',
        commission_amount: '0',
        fees_percentage: '0',
        fees_amount: '0',
        adjustment_amount: '0',
        premium_subtotal: '0',
        description: ''
    })

    const formatCurrency = (val: any) => {
        const n = parseFloat(val) || 0
        return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const [installments, setInstallments] = useState<any[]>([])

    useEffect(() => {
        if (policyId) fetchInitialData()
    }, [policyId])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            setError(null)
            // 1. Fetch Catalogs
            const [clientsRes, insurersRes, linesRes] = await Promise.all([
                supabase.from('clients').select('id, first_name, last_name').order('first_name'),
                supabase.from('insurers').select('id, name, alias').eq('active', true).order('name'),
                supabase.from('insurance_lines').select('id, name, category').eq('active', true).order('name')
            ])

            setClients(clientsRes.data || [])
            setInsurers(insurersRes.data || [])
            setLines(linesRes.data || [])

            // 2. Fetch Policy Data
            const { data: policy, error: pError } = await supabase
                .from('policies')
                .select('*')
                .eq('id', policyId)
                .single()

            if (pError) throw pError

            if (policy) {
                const p: any = policy;
                setFormData({
                    ...p,
                    premium_net: p.premium_net?.toString() || '',
                    policy_fee: p.policy_fee?.toString() || '0',
                    surcharge_percentage: p.surcharge_percentage?.toString() || '0',
                    discount_percentage: p.discount_percentage?.toString() || '0',
                    extra_premium: p.extra_premium?.toString() || '0',
                    tax_percentage: p.tax_percentage?.toString() || '16',
                    commission_percentage: p.commission_percentage?.toString() || '0',
                    fees_percentage: p.fees_percentage?.toString() || '0',
                    total_installments: p.total_installments?.toString() || '1',
                    current_installment: p.current_installment?.toString() || '1'
                })

                if (p.insurer_id) fetchAgentCodes(p.insurer_id)
            }

            // 3. Fetch Installments
            const { data: instData } = await supabase
                .from('policy_installments')
                .select('*')
                .eq('policy_id', policyId)
                .order('installment_number', { ascending: true })

            if (instData && instData.length > 0) {
                setInstallments(instData.map(i => ({
                    ...(i as any),
                    premium_net: i.premium_net?.toString() || '0',
                    policy_fee: i.policy_fee?.toString() || '0',
                    surcharges: i.surcharges?.toString() || '0',
                    vat_amount: i.vat_amount?.toString() || '0',
                    total_amount: i.total_amount?.toString() || '0'
                })))
            }

        } catch (err: any) {
            console.error("Error loading data:", err)
            setError(err.message || "Error al cargar los datos de la póliza")
        } finally {
            setLoading(false)
        }
    }

    const fetchAgentCodes = async (insurerId: string) => {
        const { data } = await supabase
            .from('agent_codes')
            .select('id, code, description')
            .eq('insurer_id', insurerId)
        setAgentCodes(data || [])
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Cálculos Automáticos
    useEffect(() => {
        const net = parseFloat(formData.premium_net) || 0
        const fee = parseFloat(formData.policy_fee) || 0
        const surchPct = parseFloat(formData.surcharge_percentage) || 0
        const discPct = parseFloat(formData.discount_percentage) || 0
        const extra = parseFloat(formData.extra_premium) || 0
        const taxPct = parseFloat(formData.tax_percentage) || 0

        const surchAmt = net * (surchPct / 100)
        const discAmt = net * (discPct / 100)
        const baseForTax = net + fee + surchAmt - discAmt + extra
        const vat = baseForTax * (taxPct / 100)
        const total = baseForTax + vat

        setFormData(prev => ({
            ...prev,
            surcharge_amount: surchAmt.toFixed(2),
            discount_amount: discAmt.toFixed(2),
            vat_amount: vat.toFixed(2),
            premium_total: total.toFixed(2),
            tax: vat.toFixed(2)
        }))
    }, [formData.premium_net, formData.policy_fee, formData.surcharge_percentage, formData.discount_percentage, formData.extra_premium, formData.tax_percentage])

    const handleInstallmentChange = (index: number, field: string, value: string) => {
        const updated = [...installments]
        updated[index][field] = value
        if (['premium_net', 'policy_fee', 'surcharges', 'vat_amount'].includes(field)) {
            const net = parseFloat(updated[index].premium_net) || 0
            const fee = parseFloat(updated[index].policy_fee) || 0
            const surch = parseFloat(updated[index].surcharges) || 0
            const vat = parseFloat(updated[index].vat_amount) || 0
            updated[index].total_amount = (net + fee + surch + vat).toFixed(2)
        }
        setInstallments(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                ...formData,
                premium_net: parseFloat(formData.premium_net) || 0,
                tax: parseFloat(formData.tax) || 0,
                premium_total: parseFloat(formData.premium_total) || 0,
                policy_fee: parseFloat(formData.policy_fee) || 0,
                surcharge_percentage: parseFloat(formData.surcharge_percentage) || 0,
                surcharge_amount: parseFloat(formData.surcharge_amount) || 0,
                discount_percentage: parseFloat(formData.discount_percentage) || 0,
                discount_amount: parseFloat(formData.discount_amount) || 0,
                extra_premium: parseFloat(formData.extra_premium) || 0,
                tax_percentage: parseFloat(formData.tax_percentage) || 16,
                vat_amount: parseFloat(formData.vat_amount) || 0,
                commission_percentage: parseFloat(formData.commission_percentage) || 0,
                fees_percentage: parseFloat(formData.fees_percentage) || 0,
                adjustment_amount: parseFloat(formData.adjustment_amount) || 0,
                total_installments: parseInt(formData.total_installments) || 1
            }

            const { error: pError } = await supabase
                .from('policies')
                .update(payload)
                .eq('id', policyId)

            if (pError) throw pError

            // Actualizar Recibos: Borrar y re-insertar para simplicidad en edición masiva
            await supabase.from('policy_installments').delete().eq('policy_id', policyId)

            if (installments.length > 0) {
                const instPayload = installments.map(inst => ({
                    policy_id: policyId,
                    installment_number: inst.installment_number,
                    due_date: inst.due_date,
                    premium_net: parseFloat(inst.premium_net) || 0,
                    policy_fee: parseFloat(inst.policy_fee) || 0,
                    surcharges: parseFloat(inst.surcharges) || 0,
                    vat_amount: parseFloat(inst.vat_amount) || 0,
                    total_amount: parseFloat(inst.total_amount) || 0,
                    status: inst.status || 'Pendiente'
                }))

                const { error: iError } = await supabase.from('policy_installments').insert(instPayload)
                if (iError) throw iError
            }

            router.push('/dashboard/policies')
        } catch (err) {
            console.error("Error saving policy:", err)
            alert("Error al guardar cambios")
        } finally {
            setSaving(false)
        }
    }

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-rose-100 shadow-xl shadow-rose-200/20 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Algo salió mal</h3>
                <p className="text-slate-500 text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
                    Reintentar
                </button>
            </div>
            <Link href="/dashboard/policies" className="text-slate-400 hover:text-emerald-600 font-bold uppercase text-[10px] tracking-widest transition-colors flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                Volver a la lista
            </Link>
        </div>
    )

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

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
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">Editando Póliza</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
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
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => setStep(s.id)}>
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

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Asignación de Póliza</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Cliente Asegurado</label>
                                    <select disabled className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-60" value={formData.client_id}>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Compañía Aseguradora</label>
                                    <select disabled className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-60" value={formData.insurer_id}>
                                        {insurers.map(i => <option key={i.id} value={i.id}>{i.alias || i.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Especificaciones y Recibos</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Número de Póliza</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 uppercase font-bold"
                                        value={formData.policy_number}
                                        onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Descripción del Bien</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600">
                                    GESTIÓN DE RECIBOS EDITABLE
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-100 text-slate-500 font-bold">
                                            <tr>
                                                <th className="p-3">#</th>
                                                <th className="p-3">Vencimiento</th>
                                                <th className="p-3">Prima Neta</th>
                                                <th className="p-3">Derecho</th>
                                                <th className="p-3">IVA</th>
                                                <th className="p-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 italic">
                                            {installments.map((inst, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="p-3 font-bold text-slate-400">{inst.installment_number}</td>
                                                    <td className="p-2 italic text-slate-400">{inst.due_date}</td>
                                                    <td className="p-2">
                                                        <input type="number" value={inst.premium_net} onChange={(e) => handleInstallmentChange(idx, 'premium_net', e.target.value)} className="bg-transparent border-none p-1 w-20 text-right" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" value={inst.policy_fee} onChange={(e) => handleInstallmentChange(idx, 'policy_fee', e.target.value)} className="bg-transparent border-none p-1 w-16 text-right" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" value={inst.vat_amount} onChange={(e) => handleInstallmentChange(idx, 'vat_amount', e.target.value)} className="bg-transparent border-none p-1 w-20 text-right" />
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-slate-900 bg-slate-50/30">
                                                        ${formatCurrency(inst.total_amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Vigencia</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Inicio de Vigencia</label>
                                    <input type="date" value={formData.start_date} className="w-full p-3 rounded-xl border border-slate-200" onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Fin de Vigencia</label>
                                    <input type="date" value={formData.end_date} className="w-full p-3 rounded-xl border border-slate-200" onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Datos Económicos</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Prima Neta</label>
                                        <input type="number" name="premium_net" value={formData.premium_net} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Derecho de Póliza</label>
                                        <input type="number" name="policy_fee" value={formData.policy_fee} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Recargo %</label>
                                            <input type="number" name="surcharge_percentage" value={formData.surcharge_percentage} onChange={handleChange} className="w-full p-2 border-b border-slate-200 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Descuento %</label>
                                            <input type="number" name="discount_percentage" value={formData.discount_percentage} onChange={handleChange} className="w-full p-2 border-b border-slate-200 outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-slate-400 text-xs font-bold uppercase"><span>Subtotal s/IVA</span><span>{formData.currency}</span></div>
                                        <div className="flex justify-between items-baseline text-2xl font-bold">
                                            <span>TOTAL</span>
                                            <span className="text-emerald-400">${formatCurrency(formData.premium_total)}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                                        * Los cambios aquí se reflejan en el total pero no regeneran los recibos automáticamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 px-8 py-6 flex items-center justify-between border-t border-slate-100">
                    <button type="button" onClick={() => setStep(step - 1)} disabled={step === 1} className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600'}`}>
                        <ChevronLeft /> Anterior
                    </button>
                    {step < 4 ? (
                        <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
                            Siguiente <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button type="submit" disabled={saving} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50">
                            {saving ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Cambios</>}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
