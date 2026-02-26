import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getCollectionMessage, PaymentMethod } from "@/lib/whatsapp-templates"

// Utiliza la llave secreta en lugar de la anónima si las políticas RLS son estrictas, 
// pero por fallback usa la anónima para desarrollo rápido
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
    try {
        // 1. Verificación de Seguridad M2M (Machine to Machine)
        const authHeader = request.headers.get("authorization")
        // La llave debe ser configurada en Vercel. Si no está en .env, permitimos paso localmente, 
        // pero en producción exigiremos 'Bearer <N8N_API_KEY>'
        const expectedKey = process.env.N8N_API_KEY

        if (expectedKey) {
            // Check for case-insensitive 'bearer' handling
            const authPrefix = authHeader?.substring(0, 6)?.toLowerCase()
            const authToken = authHeader?.substring(7)?.trim()

            if (!authHeader || authPrefix !== 'bearer' || authToken !== expectedKey) {
                return NextResponse.json({ error: "Unauthorized access. Invalid N8N_API_KEY." }, { status: 401 })
            }
        } else {
            console.warn("N8N_API_KEY no detectada en entorno. Abriendo endpoint sin seguridad para pruebas.")
        }

        // 2. Extraccción de la información base
        const { data: policies, error } = await supabase
            .from('policies')
            .select(`
                id, 
                premium_net, 
                end_date,
                payment_method,
                status,
                clients (first_name, phone),
                insurers (name),
                insurance_lines (name)
            `)

        if (error) {
            throw error
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 3. Procesamiento y Lógica Inteligente
        const notificationsToSent = (policies || []).map((policy: any) => {
            if (policy.status === 'Cancelada') return null

            const targetDate = new Date(policy.end_date)
            targetDate.setHours(0, 0, 0, 0)

            const diffTime = targetDate.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            const clientName = policy.clients?.first_name || 'Cliente'
            let clientPhone = (policy.clients?.phone || '').replace(/\D/g, '')

            // Caso especial México: Forzar formato WhatsApp 52 1 [10 dígitos]
            if (clientPhone.startsWith('52') && clientPhone.length === 12) {
                clientPhone = '521' + clientPhone.substring(2)
            }

            // Si el cliente no tiene teléfono, no perdemos tiempo regresándolo a N8N
            if (!clientPhone || clientPhone === '') return null

            const policyType = policy.insurance_lines?.name || 'Seguro'
            const insurerName = policy.insurers?.name || 'Aseguradora'
            const amount = Number(policy.premium_net) || 0
            const paymentMethod = (policy.payment_method || 'Anual') as PaymentMethod

            const messageStr = getCollectionMessage(
                clientName,
                policyType,
                insurerName,
                amount,
                paymentMethod,
                diffDays,
                targetDate.toISOString()
            )

            if (!messageStr) return null

            return {
                policy_id: policy.id,
                client_name: clientName,
                phone: clientPhone,
                message: messageStr,
                urgency_days: diffDays,
                payment_method: paymentMethod
            }
        }).filter(item => item !== null)

        // 4. Retornar el volumen limpio a N8N
        return NextResponse.json({
            success: true,
            total_notifications: notificationsToSent.length,
            timestamp: new Date().toISOString(),
            data: notificationsToSent
        })

    } catch (err: any) {
        console.error("Error en Webhook Collections:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
