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
 * Genera el copy de WhatsApp basado en las reglas de negocio (v10)
 */
export const getCollectionMessage = (
    clientName: string,
    policyType: string,
    insurerName: string,
    amount: number,
    paymentMethod: PaymentMethod,
    daysRemaining: number,
    targetDate: string
) => {

    // CASO C: DOMICILIADA (Aviso -7 días)
    if (paymentMethod === 'Domiciliado' || paymentMethod?.toLowerCase().includes('tarjeta')) {
        if (daysRemaining <= 7 && daysRemaining > 0) {
            return `¡Hola *${clientName}*! 💳 Espero estés teniendo una gran semana.\n\nEste es un aviso amigable de que el próximo *${formatDate(targetDate)}* la aseguradora ${insurerName} intentará el cargo automático de tu seguro por *$${amount.toLocaleString()}*.\n\n✅ *El Tip*: Solo asegúrate de tener los fondos disponibles o en tu límite de crédito para que pase a la primera y no te quedes sin protección ni un segundo. ¡Abrazo!`
        }
    }

    // CASO A: ANUAL / CONTADO (Con Periodo de Gracia)
    if (paymentMethod === 'Contado' || paymentMethod === 'Anual') {
        if (daysRemaining <= 21 && daysRemaining > 0) {
            // Alerta 1: Aviso preventivo de gracia
            return `¡Hola *${clientName}*! 👋 Soy Rene Breton.\n\nMe adelanto un poco para que planees con calma: el próximo *${formatDate(targetDate)}* inicia el recibo de tu seguro de ${policyType} con ${insurerName}.\n\n💳 *Monto:* $${amount.toLocaleString()}\n\nCuentas con un periodo de gracia de 30 días, pero *nuestra recomendación profesional es liquidarlo antes del ${formatDate(targetDate)}*.\n\nℹ️ *¿Por qué?* Si llegas a tener una emergencia durante el periodo de gracia, la aseguradora te exigirá pagar el 100% de la póliza antes de enviarte la grúa o aprobarte la atención médica (y puede operar solo por reembolso en algunos casos). ¡Evitemos ese estrés!\n\n¿Te comparto de una vez tu línea de captura?`
        }

        if (daysRemaining <= -20 && daysRemaining > -30) {
            // Alerta 2: Pleno periodo de gracia (Faltan 10 días para cancelar)
            const absoluteCancelDate = new Date(targetDate)
            absoluteCancelDate.setDate(absoluteCancelDate.getDate() + 30)

            return `⚠️ ¡Hola *${clientName}*! Te escribo rápido sobre tu seguro de ${policyType}.\n\nActualmente te encuentras en *Periodo de Gracia* y estamos a días de la cancelación definitiva del contrato.\n\nTu fecha máxima para evitar perder tu inversión y coberturas es el *${formatDate(absoluteCancelDate.toISOString())}*. Recuerda que un siniestro hoy retrasaría mucho tu atención y tendrías que pagar el deducible y la prima de golpe.\n\n🔗 ¿Necesitas que te reenvíe el link de pago o los datos?\n\nMándame tu comprobante en cuanto quede listo para validarlo en sistema. 🙏`
        }
    }

    // CASO B: SUBSECUENTES (Fraccionados, Sin Gracia Real)
    if (paymentMethod === 'Semestral' || paymentMethod === 'Trimestral' || paymentMethod === 'Mensual') {
        if (daysRemaining <= 10 && daysRemaining > 0) {
            // Alerta preventiva fraccionado
            return `¡Hola *${clientName}*! 👋 Excelente día.\n\nYa se acerca la fecha de pago de la fracción de tu seguro de ${policyType}.\n\n⏳ *Fecha estricta de corte:* ${formatDate(targetDate)}\n💳 *Importe:* $${amount.toLocaleString()}\n\n👉 *Notita importante*: Al ser un pago fraccionado, *la aseguradora no otorga días de gracia para esta exhibición*. Si el pago no cruza ese día, la protección se pausa en automático.\n\n¡Échame un grito si necesitas las cuentas de nuevo!`
        }

        if (daysRemaining <= 2 && daysRemaining >= 0) {
            // Urgencia fraccionado
            return `🚨 ¡Hola *${clientName}*! Aviso súper rápido sobre tu seguro de ${policyType}.\n\nMañana es el último día para que cruce el pago de tu recibo por *$${amount.toLocaleString()}*.\n\nSi no entra a tiempo, el sistema pausa la cobertura y tendríamos que pasar por un proceso de rehabilitación tedioso. ¡Avisame en cuanto quede porfa para dormir tranquilos! 🏁`
        }
    }

    return null // No hay mensaje configurado para este día/método
}
