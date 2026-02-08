
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY/ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySepomex() {
    console.log('--- Verificando Datos SEPOMEX ---');

    // 1. Contar total de registros
    const { count, error: countError } = await supabase
        .from('postal_codes_catalog')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error al contar registros:', countError.message);
    } else {
        console.log(`Total de Códigos Postales: ${count}`);
        if (count && count > 30000) {
            console.log('✅ Cantidad de registros correcta (esperado > 32k).');
        } else {
            console.warn('⚠️ Cantidad de registros sospechosamente baja.');
        }
    }

    // 2. Verificar un CP específico (ej. Polanco 11560 o Roma 06700)
    const testCp = '11560';
    console.log(`\nVerificando CP: ${testCp}...`);

    const { data, error } = await supabase
        .from('postal_codes_catalog')
        .select('*')
        .eq('zip_code', testCp)
        .single();

    if (error) {
        console.error('Error al consultar CP:', error.message);
    } else {
        console.log('Datos recuperados:', data);
        console.log('Colonias (JSON):', data.colonies);

        // Verificar si es un array válido
        if (Array.isArray(data.colonies)) {
            console.log('✅ El campo colonies es un Array JSON válido.');
            console.log(`   Contiene ${data.colonies.length} colonias.`);
        } else {
            console.error('❌ El campo colonies NO es un array (posible error de formato string).Type:', typeof data.colonies);
        }

        // Verificar encoding
        const specialCharCp = '06700'; // Roma Norte
        console.log(`\nVerificando CP con acentos (${specialCharCp} - Roma Norte)...`);
        const { data: dataRom, error: errorRom } = await supabase
            .from('postal_codes_catalog')
            .select('*')
            .eq('zip_code', specialCharCp)
            .single();

        if (dataRom) {
            console.log('Colonias:', dataRom.colonies);
            const jsonStr = JSON.stringify(dataRom.colonies);
            if (jsonStr.includes('México') || jsonStr.includes('Roma Norte')) {
                console.log('✅ Caracteres especiales correctos.');
            } else {
                console.log('ℹ️ Revisar visualmente acentos en consola.');
            }
        }
    }
}

verifySepomex();
