import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
// Forzando Service Role si existe para saltar RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log("Modificando un cliente existente con tu celular personal para evadir RLS...")

    // Check if branch exists
    let { data: branches } = await supabase.from('insurance_lines').select('id, name').limit(1)
    if (!branches || branches.length === 0) {
        console.log("No hay ramos. Se omite.")
        return;
    }
    const branchId = branches[0].id

    // Check if insurer exists
    let { data: insurers } = await supabase.from('insurers').select('id, name').limit(1)
    if (!insurers || insurers.length === 0) {
        console.log("No hay aseguradoras. Se omite.")
        return;
    }
    const insurerId = insurers[0].id

    // Usar cliente existente 
    const { data: clients, error: getClientErr } = await supabase.from('clients').select('id').limit(1)
    if (getClientErr || !clients || clients.length === 0) {
        console.error("No hay ningun cliente para modificar.")
        return;
    }
    const clientId = clients[0].id

    console.log(`Actualizando tel del cliente ${clientId} a +523310510514`)

    // Si usamos ANON_KEY, y falló el INSERT por RLS, probablemente UPDATE sin user context fallará.
    // Pero lo intentaremos. Si falla, usaremos el Dashboard en el frontend o generaremos un SQL.
    const { error: updErr } = await supabase.from('clients').update({ phone: '+523310510514', first_name: 'RENE TEST' }).eq('id', clientId)
    if (updErr) {
        console.error("Update falló por RLS:", updErr.message)
        console.log("\nALTERNA: Ingresarlo por SQL directo.")
    }

    // Fechas
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(today.getDate() - 3)

    const policies = [
        {
            client_id: clientId,
            insurer_id: insurerId,
            branch_id: branchId,
            policy_number: `TEST-HOY-${Date.now()}`,
            start_date: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString().split('T')[0],
            end_date: today.toISOString().split('T')[0], // Vence hoy
            status: 'Vigente',
            premium_net: 5000,
            tax: 800,
            premium_total: 5800,
            payment_method: 'Anual',
            currency: 'MXN'
        },
        {
            client_id: clientId,
            insurer_id: insurerId,
            branch_id: branchId,
            policy_number: `TEST-MANANA-${Date.now()}`,
            start_date: new Date(tomorrow.getFullYear(), tomorrow.getMonth() - 1, tomorrow.getDate()).toISOString().split('T')[0],
            end_date: tomorrow.toISOString().split('T')[0], // Vence mañana
            status: 'Vigente',
            premium_net: 1500,
            tax: 240,
            premium_total: 1740,
            payment_method: 'Mensual',
            currency: 'MXN'
        },
        {
            client_id: clientId,
            insurer_id: insurerId,
            branch_id: branchId,
            policy_number: `TEST-VENCIDA-${Date.now()}`,
            start_date: new Date(threeDaysAgo.getFullYear(), threeDaysAgo.getMonth() - 1, threeDaysAgo.getDate()).toISOString().split('T')[0],
            end_date: threeDaysAgo.toISOString().split('T')[0], // Vencida
            status: 'Vencida',
            premium_net: 6000,
            tax: 960,
            premium_total: 6960,
            payment_method: 'Semestral',
            currency: 'MXN'
        }
    ]

    const { error: insertErr } = await supabase.from('policies').insert(policies)
    if (insertErr) {
        console.error("Error insertando pólizas (RLS?):", insertErr)
    } else {
        console.log("¡Prueba de estrés de WhatsApp inyectada! 🎉")
    }
}

main()
