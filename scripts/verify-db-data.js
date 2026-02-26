const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking DB connection...");
    const { count: clientCount, error: cErr } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    if (cErr) console.error("Client Error:", cErr);

    const { count: policyCount, error: pErr } = await supabase.from('policies').select('*', { count: 'exact', head: true });
    if (pErr) console.error("Policy Error:", pErr);

    console.log(`Clients count: ${clientCount}`);
    console.log(`Policies count: ${policyCount}`);
}

checkData();
