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

    const parseNum = (val: any) => parseFloat(val?.toString().replace(/,/g, '')) || 0;

    const formatInputCurrency = (val: string | number) => {
        if (val === '' || val === null || val === undefined) return '';
        const clean = val.toString().replace(/[^0-9.]/g, '');
        const parts = clean.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (parts.length > 2) parts.pop();
        return parts.join('.');
    }

    const formatCurrency = (val: any) => {
        return parseNum(val).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
                setInstallments(instData.map((i: any) => ({
                    ...i,
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
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!value) return;
        const num = parseNum(value);
        setFormData((prev: any) => ({ ...prev, [name]: formatInputCurrency(num.toFixed(2)) }));
    }

    const handlePercentageBlur = (pctField: string, amountField: string) => {
        const pct = parseNum(formData[pctField as keyof typeof formData]);
        const net = parseNum(formData.premium_net);
        const calcAmt = net * (pct / 100);
        setFormData((prev: any) => ({ ...prev, [amountField]: formatInputCurrency(calcAmt.toFixed(2)) }));
    }

    const handleVatPercentageBlur = () => {
        const pct = parseNum(formData.tax_percentage);
        const net = parseNum(formData.premium_net);
        const fee = parseNum(formData.policy_fee);
        const surch = parseNum(formData.surcharge_amount);
        const disc = parseNum(formData.discount_amount);
        const extra = parseNum(formData.extra_premium);
        const base = net + fee + surch - disc + extra;
        const vat = base * (pct / 100);
        setFormData((prev: any) => ({ ...prev, vat_amount: formatInputCurrency(vat.toFixed(2)), tax: vat.toFixed(2) }));
    }

    // Cálculos Automáticos
    useEffect(() => {
        const net = parseNum(formData.premium_net);
        const fee = parseNum(formData.policy_fee);
        const surch = parseNum(formData.surcharge_amount);
        const disc = parseNum(formData.discount_amount);
        const extra = parseNum(formData.extra_premium);
        const vat = parseNum(formData.vat_amount);

        const total = net + fee + surch - disc + extra + vat;

        setFormData((prev: any) => {
            const formattedTotal = total.toFixed(2);
            if (prev.premium_total === formattedTotal) return prev;
            return {
                ...prev,
                premium_total: formattedTotal
            }
        })
    }, [formData.premium_net, formData.policy_fee, formData.surcharge_amount, formData.discount_amount, formData.extra_premium, formData.vat_amount])

    const generateInstallments = (count: number) => {
        const netTotal = parseNum(formData.premium_net) || 0
        const feeTotal = parseNum(formData.policy_fee) || 0
        const surchPct = parseNum(formData.surcharge_percentage) || 0
        const taxPct = parseNum(formData.tax_percentage) || 16

        const surchTotal = parseNum(formData.surcharge_amount) || 0
        const vatTotal = parseNum(formData.vat_amount) || 0

        const newInstallments = []
        const startDate = new Date(formData.start_date || new Date())

        for (let i = 1; i <= count; i++) {
            // Dividir montos (simétrico por defecto)
            const net = netTotal / count
            const surch = surchTotal / count
            const fee = i === 1 ? feeTotal : 0 // El derecho suele cobrarse en el 1er recibo
            const vat = vatTotal / count
            const total = net + surch + fee + vat

            // Calcular fechas (cada 12/count meses)
            const dueDate = new Date(startDate)
            dueDate.setMonth(startDate.getMonth() + (i - 1) * (12 / count))

            newInstallments.push({
                installment_number: i,
                due_date: dueDate.toISOString().split('T')[0],
                premium_net: net.toFixed(2),
                policy_fee: fee.toFixed(2),
                surcharges: surch.toFixed(2),
                vat_amount: vat.toFixed(2),
                total_amount: total.toFixed(2),
                status: 'Pendiente'
            })
        }
        setInstallments(newInstallments)
    }

    const handleInstallmentChange = (index: number, field: string, value: string) => {
        const updated = [...installments]
        updated[index][field] = value
        if (['premium_net', 'policy_fee', 'surcharges', 'vat_amount'].includes(field)) {
            const net = parseNum(updated[index].premium_net) || 0
            const fee = parseNum(updated[index].policy_fee) || 0
            const surch = parseNum(updated[index].surcharges) || 0
            const vat = parseNum(updated[index].vat_amount) || 0
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
                premium_net: parseNum(formData.premium_net),
                tax: parseNum(formData.tax),
                premium_total: parseNum(formData.premium_total),
                policy_fee: parseNum(formData.policy_fee),
                surcharge_percentage: parseNum(formData.surcharge_percentage),
                surcharge_amount: parseNum(formData.surcharge_amount),
                discount_percentage: parseNum(formData.discount_percentage),
                discount_amount: parseNum(formData.discount_amount),
                extra_premium: parseNum(formData.extra_premium),
                tax_percentage: parseNum(formData.tax_percentage) || 16,
                vat_amount: parseNum(formData.vat_amount),
                commission_percentage: parseNum(formData.commission_percentage),
                fees_percentage: parseNum(formData.fees_percentage),
                adjustment_amount: parseNum(formData.adjustment_amount),
                total_installments: parseInt(formData.total_installments) || 1
            }

            const { error: pError } = await supabase
                .from('policies')
                // @ts-ignore
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

                // @ts-ignore
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
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 capitalize"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
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
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="border-b border-slate-100 pb-4 mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Configuración Financiera</h3>
                                <p className="text-slate-500 text-sm italic">Defina la moneda, forma de pago y los montos exactos de su carátula.</p>
                            </div>


                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between group">
                                            <span className="text-sm text-slate-500 font-medium">Prima Neta</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-300 font-bold">$</span>
                                                <input
                                                    type="text"
                                                    name="premium_net"
                                                    className="w-32 p-2 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                    placeholder="0.00"
                                                    value={formData.premium_net}
                                                    onChange={handleChange}
                                                    onBlur={handleAmountBlur}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between group">
                                            <span className="text-sm text-slate-500 font-medium">Derecho de Póliza</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-300 font-bold">$</span>
                                                <input
                                                    type="text"
                                                    name="policy_fee"
                                                    className="w-32 p-2 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                    value={formData.policy_fee}
                                                    onChange={handleChange}
                                                    onBlur={handleAmountBlur}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between group">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-500 font-medium">Recargo Financiero</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        name="surcharge_percentage"
                                                        value={formData.surcharge_percentage}
                                                        onChange={handleChange}
                                                        onBlur={() => handlePercentageBlur('surcharge_percentage', 'surcharge_amount')}
                                                        className="w-12 text-xs p-1 border-b border-slate-200 outline-none focus:border-emerald-500"
                                                    />
                                                    <span className="text-[10px] text-slate-400 font-bold">%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-emerald-600 font-bold text-sm">+ $</span>
                                                <input
                                                    type="text"
                                                    name="surcharge_amount"
                                                    value={formData.surcharge_amount}
                                                    onChange={handleChange}
                                                    onBlur={handleAmountBlur}
                                                    className="w-24 font-bold text-emerald-600 text-sm bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 outline-none text-right"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between group">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-500 font-medium">Descuento</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        name="discount_percentage"
                                                        value={formData.discount_percentage}
                                                        onChange={handleChange}
                                                        onBlur={() => handlePercentageBlur('discount_percentage', 'discount_amount')}
                                                        className="w-12 text-xs p-1 border-b border-slate-200 outline-none focus:border-rose-500"
                                                    />
                                                    <span className="text-[10px] text-slate-400 font-bold">%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-rose-500 font-bold text-sm">- $</span>
                                                <input
                                                    type="text"
                                                    name="discount_amount"
                                                    value={formData.discount_amount}
                                                    onChange={handleChange}
                                                    onBlur={handleAmountBlur}
                                                    className="w-24 font-bold text-rose-500 text-sm bg-transparent border-b border-transparent hover:border-slate-200 focus:border-rose-500 outline-none text-right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16"></div>

                                        <div className="space-y-3 relative z-10">
                                            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                <span>Subtotal antes de IVA</span>
                                                <span className="text-sm text-slate-300">
                                                    {formData.currency} ${formatCurrency((parseNum(formData.premium_net) + parseNum(formData.policy_fee) + parseNum(formData.surcharge_amount) - parseNum(formData.discount_amount)).toFixed(2))}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-baseline group">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-400">Total Impuestos (IVA)</span>
                                                    <input
                                                        type="number"
                                                        name="tax_percentage"
                                                        value={formData.tax_percentage}
                                                        onChange={handleChange}
                                                        onBlur={handleVatPercentageBlur}
                                                        className="w-12 bg-transparent border-b border-slate-600 outline-none focus:border-emerald-400 text-center text-lg font-black text-white"
                                                    /> <span className="text-lg font-black text-white">%</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-emerald-400 font-bold">+ $</span>
                                                    <input
                                                        type="text"
                                                        name="vat_amount"
                                                        value={formData.vat_amount}
                                                        onChange={handleChange}
                                                        onBlur={handleAmountBlur}
                                                        className="w-24 bg-transparent border-b border-transparent hover:border-slate-600 outline-none focus:border-emerald-400 text-right font-bold text-emerald-400 text-lg"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 font-bold uppercase">Prima Total a Cobrar</span>
                                                    <span className="text-3xl font-black text-white">
                                                        ${formatCurrency(formData.premium_total)}
                                                    </span>
                                                </div>
                                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                    <CreditCard className="w-6 h-6 text-emerald-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Moneda</label>
                                    <select
                                        name="currency"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                                        value={formData.currency}
                                        onChange={handleChange}
                                    >
                                        <option value="MXN">Pesos (MXN)</option>
                                        <option value="USD">Dólares (USD)</option>
                                        <option value="UDI">UDIS</option>
                                        <option value="EUR">Euros (EUR)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Forma de Pago</label>
                                    <select
                                        name="payment_method"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-emerald-700"
                                        value={formData.payment_method}
                                        onChange={handleChange}
                                    >
                                        <option value="Contado">Anual / Contado</option>
                                        <option value="Semestral">Semestral</option>
                                        <option value="Trimestral">Trimestral</option>
                                        <option value="Mensual">Mensual</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Generación de Recibos</label>
                                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-emerald-800">{formData.total_installments} recibos</p>
                                            <p className="text-[10px] text-slate-500">Calculados auto.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => generateInstallments(parseInt(formData.total_installments || '1'))}
                                            className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                        >
                                            Generar Grid
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* TABLA DE RECIBOS EDITABLES (v19) */}
                            {installments.length > 0 && (
                                <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600 uppercase">
                                        Gestión de Recibos
                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">Editable</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 text-slate-500 font-bold">
                                                <tr>
                                                    <th className="p-3">#</th>
                                                    <th className="p-3">Vencimiento</th>
                                                    <th className="p-3">Prima Neta</th>
                                                    <th className="p-3">Derecho</th>
                                                    <th className="p-3">Recargo</th>
                                                    <th className="p-3">IVA</th>
                                                    <th className="p-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 italic">
                                                {installments.map((inst, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="p-3 font-bold text-slate-400">{inst.installment_number}</td>
                                                        <td className="p-2">
                                                            <input
                                                                type="date"
                                                                value={inst.due_date}
                                                                onChange={(e) => handleInstallmentChange(idx, 'due_date', e.target.value)}
                                                                className="bg-transparent border-none p-1 font-medium w-full text-slate-600 focus:ring-0"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input type="text" value={inst.premium_net} onBlur={(e) => handleInstallmentChange(idx, 'premium_net', formatInputCurrency(e.target.value.replace(/,/g, '')))} onChange={(e) => handleInstallmentChange(idx, 'premium_net', e.target.value)} className="bg-transparent border-none focus:ring-0 p-1 w-20 text-right" />
                                                        </td>
                                                        <td className="p-2">
                                                            <input type="text" value={inst.policy_fee} onBlur={(e) => handleInstallmentChange(idx, 'policy_fee', formatInputCurrency(e.target.value.replace(/,/g, '')))} onChange={(e) => handleInstallmentChange(idx, 'policy_fee', e.target.value)} className="bg-transparent border-none focus:ring-0 p-1 w-16 text-right" />
                                                        </td>
                                                        <td className="p-2">
                                                            <input type="text" value={inst.surcharges} onBlur={(e) => handleInstallmentChange(idx, 'surcharges', formatInputCurrency(e.target.value.replace(/,/g, '')))} onChange={(e) => handleInstallmentChange(idx, 'surcharges', e.target.value)} className="bg-transparent border-none focus:ring-0 p-1 w-16 text-right" />
                                                        </td>
                                                        <td className="p-2">
                                                            <input type="text" value={inst.vat_amount} onBlur={(e) => handleInstallmentChange(idx, 'vat_amount', formatInputCurrency(e.target.value.replace(/,/g, '')))} onChange={(e) => handleInstallmentChange(idx, 'vat_amount', e.target.value)} className="bg-transparent border-none focus:ring-0 p-1 w-20 text-right" />
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-slate-900 bg-slate-50/30">
                                                            ${parseFloat(inst.total_amount?.replace(/,/g, '') || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

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
            </form >
        </div >
    )
}
