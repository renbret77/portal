export type PaymentMethod = 'Contado' | 'Semestral' | 'Trimestral' | 'Mensual' | 'Anual' | 'Domiciliado'

// Helper para formatear fechas (v16 - Formato numérico ordenado)
const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    const day = String(d.getUTCDate()).padStart(2, '0')
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const year = d.getUTCFullYear()
    return `${day}-${month}-${year}`
}

// Helper para generar el link de WhatsApp
export const generateWhatsAppLink = (phone: string, text: string) => {
    // Limpiar el teléfono para que solo tenga números
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedText = encodeURIComponent(text)
    return `https://wa.me/${cleanPhone}?text=${encodedText}`
}

/**
 * Genera el copy de WhatsApp basado en las reglas de negocio (v16 - Formato Rico + Recibos)
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
    notes?: string,
    currentInstallment?: number,
    totalInstallments?: number,
    paymentLink?: string,
    currencySymbol: string = '$',
    financials?: {
        policyFee: number;
        surchargeAmount: number;
        discountAmount: number;
        vatAmount: number;
    }
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

    if (isDomiciliado) {
        statusIcon = '💳'
        alertTitle = 'AVISO DE CARGO AUTOMÁTICO'
        footerMessage = 'Solo asegúrate de contar con los fondos disponibles en tu cuenta. ¡Saludos!'
    }

    // Cabecera Común
    const header = `${statusIcon} *${alertTitle}*\n\nHola *${clientName}*, espero que estés teniendo un excelente día. Te envío la información de tu próximo recibo a liquidar:\n\n`

    // Cuerpo de Datos (Ficha Técnica)
    const bodyItems = [
        `👤 *Asegurado:* ${clientName}`,
        `🏢 *Aseguradora:* ${insurerName}`,
        `🛡️ *Ramo:* ${policyType}`,
        `📄 *Descripción:* ${subBranch || 'Cobertura Original'}`,
        `🔢 *Póliza:* \`${policyNumber}\``
    ]

    if (totalInstallments && totalInstallments > 1) {
        bodyItems.push(`🧾 *Recibo:* ${currentInstallment || 1} de ${totalInstallments}`)
    }

    bodyItems.push(
        `📆 *Periodo:* ${formatDate(startDate)} al ${formatDate(targetDate)}`,
        `💳 *Método:* ${paymentMethod}`
    )

    bodyItems.push(`\n💵 *TOTAL A PAGAR:* *${currencySymbol}${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}*`)

    const body = bodyItems.join('\n')

    // Lógica de Semáforo / Días de Gracia
    let graceInfo = ''
    if (isAnual && !isDomiciliado) {
        const cancelDate = new Date(targetDate)
        cancelDate.setDate(cancelDate.getDate() + 30)

        graceInfo = `\n\n📌 *Días de Gracia:* 30 días naturales\n⏳ *Límite de gracia:* ${formatDate(cancelDate.toISOString())}`
    } else if (!isDomiciliado) {
        graceInfo = `\n\n⚠️ *Nota:* Los recibos fraccionados no cuentan con periodo de gracia institucional.`
    }

    // Link de Pago si existe
    const paymentInfo = paymentLink ? `\n\n🔗 *Pagar Ahora:* ${paymentLink}` : ''

    const finalSection = `\n\n${footerMessage}`

    return header + body + graceInfo + paymentInfo + finalSection
}
