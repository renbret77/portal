
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wctezsysrmaoamtuzzts.supabase.co';
const supabaseKey = 'sb_publishable_kFlL4DRVepXpf1uIaYrl2g_hHivsek4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount() {
    const { count, error } = await supabase
        .from('postal_codes_catalog')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`TOTAL_REGISTROS: ${count}`);
    }
}

checkCount();
