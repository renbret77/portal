export type PaymentMethod = 'Contado' | 'Semestral' | 'Trimestral' | 'Mensual' | 'Anual' | 'Domiciliado'

// Helper para formatear fechas
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Helper para generar el link de WhatsApp
export const generateWhatsAppLink = (phone: string, text: string) => {
    // Limpiar el teléfono para que solo tenga números
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedText = encodeURIComponent(text)
    return `https://wa.me/${cleanPhone}?text=${encodedText}`
}

/**
 * Genera el copy de WhatsApp basado en las reglas de negocio (v14 - Formato Rico)
 */
export const getCollectionMessage = (
    clientName: string,
    policyType: string,
    insurerName: string,
    policyNumber: string,
    amount: number,
    paymentMethod: PaymentMethod,
    daysRemaining: number,
    startDate: string,
    targetDate: string,
    subBranch?: string,
    notes?: string
) => {
    const isAnual = paymentMethod === 'Contado' || paymentMethod === 'Anual'
    const isDomiciliado = paymentMethod === 'Domiciliado' || paymentMethod?.toLowerCase().includes('tarjeta')

    // Configuración de Iconos y Estados
    let statusIcon = '📅'
    let alertTitle = 'Recordatorio de Pago'
    let footerMessage = '¿Te comparto la línea de captura para pago?'

    if (daysRemaining <= 0) {
        statusIcon = '🚨'
        alertTitle = 'AVISO DE COBRO URGENTE'
        footerMessage = 'Favor de confirmar su pago a la brevedad para evitar la cancelación. 🙏'
    } else if (daysRemaining <= 7) {
        statusIcon = '🕒'
        alertTitle = 'PENDIENTE DE PAGO'
    }

    // Cabecera Común
    const header = `${statusIcon} *${alertTitle}*\n\nHola *${clientName}*, espero que estés teniendo un excelente día. Te envío la información de tu próximo recibo a liquidar:\n\n`

    // Cuerpo de Datos (Ficha Técnica)
    const body = [
        `👤 *Asegurado:* ${clientName}`,
        `🛡️ *Ramo:* ${policyType}`,
        `📄 *Descripción:* ${subBranch || 'Cobertura Original'}`,
        `🔢 *Póliza/Recibo:* \`${policyNumber}\``,
        `📆 *Periodo:* ${formatDate(startDate)} al ${formatDate(targetDate)}`,
        `💳 *Método:* ${paymentMethod}`,
        `💰 *Total a Pagar:* *$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}*`
    ].join('\n')

    // Lógica de Semáforo / Días de Gracia
    let graceInfo = ''
    if (isAnual) {
        const cancelDate = new Date(targetDate)
        cancelDate.setDate(cancelDate.getDate() + 30)

        graceInfo = `\n\n📌 *Días de Gracia:* 30 días naturales\n⏳ *Límite de gracia:* ${formatDate(cancelDate.toISOString())}`

        // Filtrado por reglas de negocio
        if (daysRemaining > 21) return null // Muy temprano para avisar
        if (daysRemaining < -30) return null // Ya pasó el periodo de gracia, probablemente cancelada
    } else {
        graceInfo = `\n\n⚠️ *Nota:* Los recibos fraccionados no cuentan con periodo de gracia institucional.`

        if (daysRemaining > 10) return null // Muy temprano para fraccionados
    }

    const finalSection = `\n\n${footerMessage}`

    return header + body + graceInfo + finalSection
}

