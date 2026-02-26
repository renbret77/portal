"use client"

import { MessageCircle, CheckCircle2, PhoneIcon } from "lucide-react"
import { getCollectionMessage, generateWhatsAppLink, PaymentMethod } from "@/lib/whatsapp-templates"

export default function CollectionTimeline({ policies }: { policies: any[] }) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Evaluar todas las pólizas para ver cuáles arrojan mensaje hoy
    const pendingNotifications = policies.map(policy => {
        // En un MVP usamos end_date como proxy de "targetDate" para recibos anuales
        // Idealmente, se cruza con una tabla de recibos reales
        const targetDate = new Date(policy.end_date)
        targetDate.setHours(0, 0, 0, 0)

        const diffTime = targetDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const clientName = policy.clients?.first_name || 'Cliente'
        const clientPhone = policy.clients?.phone || ''
        const policyType = policy.insurance_lines?.name || 'Seguro'
        const insurerName = policy.insurers?.name || 'Aseguradora'
        const amount = Number(policy.premium_net) || 0
        const paymentMethod = (policy.payment_method || 'Anual') as PaymentMethod

        // Obtener el mensaje si aplica según reglas de negocio
        const messageStr = getCollectionMessage(
            clientName,
            policyType,
            insurerName,
            amount,
            paymentMethod,
            diffDays,
            targetDate.toISOString()
        )

        return {
            ...policy,
            clientName,
            clientPhone,
            messageText: messageStr,
            daysRemaining: diffDays,
            paymentMethod
        }
    }).filter(item => item.messageText !== null)

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Agenda de Cobranza (Hoy)</h3>
                    <p className="text-sm text-slate-500">Avisos automáticos detectados por el sistema.</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <MessageCircle className="w-5 h-5" />
                </div>
            </div>

            <div className="space-y-4">
                {pendingNotifications.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                        <p className="text-slate-900 font-bold">Día Despejado</p>
                        <p className="text-sm text-slate-500">No hay notificaciones de cobranza pendientes para enviar hoy.</p>
                    </div>
                ) : (
                    pendingNotifications.map(notification => {
                        const hasPhone = Boolean(notification.clientPhone)

                        // Evaluar Urgencia para el Color UI
                        let uiColor = "bg-blue-50 border-blue-200"
                        if (notification.daysRemaining <= 2 && notification.daysRemaining >= 0 && notification.paymentMethod !== 'Domiciliado') {
                            uiColor = "bg-rose-50 border-rose-200"
                        } else if (notification.daysRemaining <= 21 && notification.paymentMethod === 'Contado') {
                            uiColor = "bg-amber-50 border-amber-200"
                        }

                        return (
                            <div key={notification.id} className={`p-4 rounded-xl border ${uiColor} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between`}>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        {notification.clientName}
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                                            {notification.paymentMethod}
                                        </span>
                                    </h4>
                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2 italic">
                                        "{notification.messageText}"
                                    </p>
                                </div>
                                <div className="flex-shrink-0 w-full md:w-auto">
                                    {hasPhone ? (
                                        <a
                                            href={generateWhatsAppLink(notification.clientPhone, notification.messageText)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                                        >
                                            <PhoneIcon className="w-4 h-4" />
                                            Enviar WhatsApp
                                        </a>
                                    ) : (
                                        <button disabled className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-100 text-slate-400 px-5 py-2.5 rounded-xl font-bold cursor-not-allowed">
                                            Sin Teléfono
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
