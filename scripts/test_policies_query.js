const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase
        .from('policy_installments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log(`Success! Retrieved ${data.length} policies.`);
        if (data.length > 0) {
            console.log(JSON.stringify(data[0], null, 2));
        }
    }
}

test();
