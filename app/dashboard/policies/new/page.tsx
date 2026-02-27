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
    const [isParsingPolicy, setIsParsingPolicy] = useState(false)

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
        // Campos Económicos Extendidos (v18)
        policy_fee: '0',
        surcharge_percentage: '0',
        surcharge_amount: '0',
        discount_percentage: '0',
        discount_amount: '0',
        extra_premium: '0',
        tax_percentage: '16',
        vat_amount: '0',
        // Comisiones y Honorarios (v19 SICAS)
        commission_percentage: '0',
        commission_amount: '0',
        fees_percentage: '0',
        fees_amount: '0',
        adjustment_amount: '0',
        premium_subtotal: '0',
        description: '' // v19.1
    })

    const parseNum = (val: any) => {
        try {
            if (val === null || val === undefined) return 0;
            const strVal = String(val).trim();
            if (strVal === '') return 0;
            const parsed = parseFloat(strVal.replace(/,/g, ''));
            return isNaN(parsed) ? 0 : parsed;
        } catch { return 0; }
    };

    const formatInputCurrency = (val: string | number) => {
        try {
            if (val === '' || val === null || val === undefined) return '';
            const clean = String(val).replace(/[^0-9.-]/g, '');
            if (!clean) return '';
            const parts = clean.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            if (parts.length > 2) parts.pop();
            return parts.join('.');
        } catch { return String(val || ''); }
    };

    const formatCurrency = (val: any) => {
        try {
            return parseNum(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } catch { return "0.00"; }
    };

    const [installments, setInstallments] = useState<any[]>([])

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            alert('Por favor, selecciona un archivo PDF válido.')
            return
        }

        setIsParsingPolicy(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/policies/parse', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al analizar la póliza')
            }

            // Mapeo automático de resultados
            setFormData(prev => {
                const updated = { ...prev }

                if (data.policy_number) updated.policy_number = data.policy_number
                if (data.start_date) updated.start_date = data.start_date
                if (data.end_date) updated.end_date = data.end_date
                if (data.currency) updated.currency = data.currency
                if (data.payment_method) updated.payment_method = data.payment_method
                if (data.premium_net) updated.premium_net = data.premium_net.toString()
                if (data.policy_fee) updated.policy_fee = data.policy_fee.toString()
                if (data.surcharge_amount) updated.surcharge_amount = data.surcharge_amount.toString()
                if (data.vat_amount) updated.vat_amount = data.vat_amount.toString()
                if (data.premium_total) updated.premium_total = data.premium_total.toString()

                // Intentar empatar aseguradora si viene en el texto
                if (data.insurer_name && insurers.length > 0) {
                    const foundInsurer = insurers.find(i =>
                        i.name.toLowerCase().includes(data.insurer_name.toLowerCase()) ||
                        data.insurer_name.toLowerCase().includes(i.name.toLowerCase()) ||
                        (i.alias && data.insurer_name.toLowerCase().includes(i.alias.toLowerCase()))
                    )
                    if (foundInsurer) {
                        updated.insurer_id = foundInsurer.id
                        fetchAgentCodes(foundInsurer.id)
                    }
                }

                return updated
            })

            // Notificamos al usuario del éxito
            alert('¡Póliza analizada con éxito! Por favor verifica los datos en cada paso.')

            // Si encontró los datos básicos, saltamos al paso 2
            if (data.policy_number) setStep(2)

        } catch (error: any) {
            console.error('OCR Error:', error)
            alert(error.message || 'Ocurrió un error leyendo el PDF con IA')
        } finally {
            setIsParsingPolicy(false)
            // Reset input
            e.target.value = ''
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!value) return;
        const num = parseNum(value);
        setFormData(prev => ({ ...prev, [name]: formatInputCurrency(num.toFixed(2)) }));
    }

    const handlePercentageBlur = (pctField: string, amountField: string) => {
        const pct = parseNum(formData[pctField as keyof typeof formData]);
        const net = parseNum(formData.premium_net);
        const calcAmt = net * (pct / 100);
        setFormData(prev => ({ ...prev, [amountField]: formatInputCurrency(calcAmt.toFixed(2)) }));
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
        setFormData(prev => ({ ...prev, vat_amount: formatInputCurrency(vat.toFixed(2)), tax: vat.toFixed(2) }));
    }

    // Lógica de Cálculos Automáticos
    useEffect(() => {
        try {
            const net = parseNum(formData.premium_net);
            const fee = parseNum(formData.policy_fee);
            const surch = parseNum(formData.surcharge_amount);
            const disc = parseNum(formData.discount_amount);
            const extra = parseNum(formData.extra_premium);
            const vat = parseNum(formData.vat_amount);

            const total = net + fee + surch - disc + extra + vat;

            setFormData(prev => {
                const formattedTotal = total.toFixed(2);
                if (prev.premium_total === formattedTotal) return prev;
                return {
                    ...prev,
                    premium_total: formattedTotal
                }
            })
        } catch (e) {
            console.error("Calculation effect error safe catch", e)
        }
    }, [formData.premium_net, formData.policy_fee, formData.surcharge_amount, formData.discount_amount, formData.extra_premium, formData.vat_amount])

    // Lógica de Vigencia Automática (v19.1)
    useEffect(() => {
        if (formData.start_date) {
            const start = new Date(formData.start_date)
            const end = new Date(start)
            end.setFullYear(start.getFullYear() + 1)

            // Formatear como YYYY-MM-DD para el input date
            const endStr = end.toISOString().split('T')[0]
            setFormData(prev => ({ ...prev, end_date: endStr }))
        }
    }, [formData.start_date])

    // Lógica de Reglas por Aseguradora / Forma Pago + Generación de Recibos (v19)
    useEffect(() => {
        const isQualitas = formData.insurer_id === '801ef4de-0485-4eba-977b-7b8f121e4f53'

        // Ajustar Cuotas Automáticas
        let count = 1
        let surcharge = '0'

        switch (formData.payment_method) {
            case 'Semestral': count = 2; if (isQualitas) surcharge = '5'; break;
            case 'Trimestral': count = 4; if (isQualitas) surcharge = '7'; break;
            case 'Mensual': count = 12; if (isQualitas) surcharge = '9'; break;
            default: count = 1; surcharge = '0';
        }

        setFormData(prev => ({
            ...prev,
            total_installments: count.toString(),
            surcharge_percentage: surcharge,
            policy_fee: isQualitas ? '650' : prev.policy_fee
        }))

        // Generar estructura base de recibos (v19)
        generateInstallments(count)
    }, [formData.payment_method, formData.insurer_id])

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

        // Si cambia algún monto parcial, recalcular total de esa fila
        if (['premium_net', 'policy_fee', 'surcharges', 'vat_amount'].includes(field)) {
            const net = parseFloat(updated[index].premium_net) || 0
            const fee = parseFloat(updated[index].policy_fee) || 0
            const surch = parseFloat(updated[index].surcharges) || 0
            const vat = parseFloat(updated[index].vat_amount) || 0
            updated[index].total_amount = (net + fee + surch + vat).toFixed(2)
        }

        setInstallments(updated)
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
            // Clean empty strings to null for UUID foreign keys
            const payload = {
                ...formData,
                premium_net: parseNum(formData.premium_net),
                tax: parseNum(formData.tax),
                premium_total: parseNum(formData.premium_total),
                issue_date: formData.issue_date || null,
                agent_code_id: formData.agent_code_id || null,
                branch_id: formData.branch_id || null,
                total_installments: parseInt(formData.total_installments) || 1,
                current_installment: parseInt(formData.current_installment) || 1,
                payment_link: formData.payment_link || null,
                is_domiciled: formData.is_domiciled,
                // Nuevos campos financieros (v18)
                policy_fee: parseNum(formData.policy_fee),
                surcharge_percentage: parseNum(formData.surcharge_percentage),
                surcharge_amount: parseNum(formData.surcharge_amount),
                discount_percentage: parseNum(formData.discount_percentage),
                discount_amount: parseNum(formData.discount_amount),
                extra_premium: parseNum(formData.extra_premium),
                tax_percentage: parseFloat(formData.tax_percentage) || 16,
                vat_amount: parseFloat(formData.vat_amount) || 0,
                // v19 SICAS fields
                commission_percentage: parseFloat(formData.commission_percentage) || 0,
                fees_percentage: parseFloat(formData.fees_percentage) || 0,
                adjustment_amount: parseFloat(formData.adjustment_amount) || 0,
                description: formData.description || null
            }

            console.log("PAYLOAD a insertar:", payload)
            const { error, data: policyData } = await (supabase.from('policies') as any).insert([payload]).select().single()

            if (error) {
                console.error("Supabase returned error", error)
                throw error
            }

            // INSERTAR RECIBOS (INSTALLMENTS) v19
            if (policyData && installments.length > 0) {
                const installmentsPayload = installments.map(inst => ({
                    policy_id: policyData.id,
                    installment_number: inst.installment_number,
                    due_date: inst.due_date,
                    premium_net: parseFloat(inst.premium_net),
                    policy_fee: parseFloat(inst.policy_fee),
                    surcharges: parseFloat(inst.surcharges),
                    vat_amount: parseFloat(inst.vat_amount),
                    total_amount: parseFloat(inst.total_amount),
                    status: 'Pendiente'
                }))

                const { error: instError } = await (supabase.from('policy_installments') as any)
                    .insert(installmentsPayload)

                if (instError) console.error("Error guardando recibos:", instError)
            }

            router.push('/dashboard/policies')
        } catch (error: any) {
            console.error('Error saving policy complete:', error)
            alert('Error detallado de Base de Datos:\n' + JSON.stringify(error, null, 2))
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
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">v.27-02-26 11:40 AM</span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">Nueva Póliza</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
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

                            {/* Zona de Lectura Inteligente IA */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/30 border-2 border-dashed border-indigo-200 rounded-3xl p-8 relative overflow-hidden group transition-all hover:border-indigo-400">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl -ml-12 -mb-12 pointer-events-none"></div>

                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileUpload}
                                    disabled={isParsingPolicy}
                                />

                                <div className="relative z-0 flex flex-col items-center justify-center text-center space-y-4">
                                    {isParsingPolicy ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <h4 className="font-bold text-indigo-900">IA Analizando la Póliza...</h4>
                                            <p className="text-sm text-indigo-600/80 max-w-sm">Extrayendo números, fechas, primas e impuestos. Esto tardará unos segundos.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-bold text-indigo-900">Auto-llenado Mágico con IA 🪄</h4>
                                                <p className="text-sm text-indigo-600/80">Arrastra aquí el <b className="font-black">PDF</b> de la carátula o haz clic para subirlo.</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
                                        type="text"
                                        required
                                        name="policy_number"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-mono font-bold uppercase"
                                        placeholder="EJ. POL-123456"
                                        value={formData.policy_number}
                                        onChange={handleChange}
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Descripción del Bien (Auto, Inmueble, etc.)</label>
                                    <input
                                        type="text"
                                        name="description"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all capitalize"
                                        placeholder="Ej. Jetta 2024 GL"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Link de Pago / Línea de Captura</label>
                                    <input
                                        type="text"
                                        name="payment_link"
                                        value={formData.payment_link}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-xs"
                                        placeholder="https://pagos.aseguradora.com/..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 py-2">
                                <input
                                    type="checkbox"
                                    id="is_domiciled"
                                    name="is_domiciled"
                                    checked={formData.is_domiciled}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                />
                                <label htmlFor="is_domiciled" className="text-sm font-bold text-slate-700">
                                    Esta póliza está domiciliada (Cargo automático)
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Dates */}
                    {
                        step === 3 && (
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
                        )
                    }

                    {/* Step 4: Economics */}
                    {
                        step === 4 && (
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
                                        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Gestión de Recibos</span>
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
                                                                    className="bg-transparent border-none focus:ring-0 p-1 font-medium w-full"
                                                                />
                                                            </td>
                                                            <td className="p-2">
                                                                <input
                                                                    type="text"
                                                                    value={inst.premium_net}
                                                                    onBlur={(e) => handleInstallmentChange(idx, 'premium_net', formatInputCurrency(String(e.target.value || '').replace(/,/g, '')))}
                                                                    onChange={(e) => handleInstallmentChange(idx, 'premium_net', e.target.value)}
                                                                    className="bg-transparent border-none focus:ring-0 p-1 w-20 text-right"
                                                                />
                                                            </td>
                                                            <td className="p-2">
                                                                <input
                                                                    type="text"
                                                                    value={inst.policy_fee}
                                                                    onBlur={(e) => handleInstallmentChange(idx, 'policy_fee', formatInputCurrency(String(e.target.value || '').replace(/,/g, '')))}
                                                                    onChange={(e) => handleInstallmentChange(idx, 'policy_fee', e.target.value)}
                                                                    className="bg-transparent border-none focus:ring-0 p-1 w-16 text-right"
                                                                />
                                                            </td>
                                                            <td className="p-2">
                                                                <input
                                                                    type="text"
                                                                    value={inst.surcharges}
                                                                    onBlur={(e) => handleInstallmentChange(idx, 'surcharges', formatInputCurrency(String(e.target.value || '').replace(/,/g, '')))}
                                                                    onChange={(e) => handleInstallmentChange(idx, 'surcharges', e.target.value)}
                                                                    className="bg-transparent border-none focus:ring-0 p-1 w-16 text-right"
                                                                />
                                                            </td>
                                                            <td className="p-2">
                                                                <input
                                                                    type="text"
                                                                    value={inst.vat_amount}
                                                                    onBlur={(e) => handleInstallmentChange(idx, 'vat_amount', formatInputCurrency(String(e.target.value || '').replace(/,/g, '')))}
                                                                    onChange={(e) => handleInstallmentChange(idx, 'vat_amount', e.target.value)}
                                                                    className="bg-transparent border-none focus:ring-0 p-1 w-20 text-right"
                                                                />
                                                            </td>
                                                            <td className="p-3 text-right font-bold text-slate-900 bg-slate-50/30 border-l border-slate-100">
                                                                ${formatCurrency(inst.total_amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <hr className="border-slate-100 my-8" />

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
            </form >

            {/* Hint Box */}
            < div className="flex justify-center mt-6" >
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm text-xs text-slate-400 font-medium italic">
                    <Upload className="w-3.5 h-3.5" />
                    Consejo: Podrá cargar el PDF de la carátula una vez guardada la base de la póliza.
                </div>
            </div >
        </div >
    )
}
