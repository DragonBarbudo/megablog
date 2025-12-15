
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Environment Variables: URL or SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🔍 Checking `contacts` table...');

    // Try to select (even if empty, it should not error if table exists)
    const { data, error } = await supabase.from('contacts').select('*').limit(1);

    if (error) {
        console.error('❌ Error Accessing Table:', error.message);
        if (error.code === '42P01') {
            console.error('👉 CAUSE: The table `contacts` does NOT exist.');
            console.error('👉 SOLUTION: You must run the SQL migration provided precisely.');
        }
        return;
    }

    console.log('✅ Table `contacts` exists.');

    // Try to insert a dummy record (optional, but good to check RLS/ServiceRole)
    // We need a valid site_id. Let's get one.
    const { data: sites } = await supabase.from('sites').select('id').limit(1);

    if (!sites || sites.length === 0) {
        console.log('⚠️ No sites found to test insert.');
        return;
    }

    const testSiteId = sites[0].id;

    console.log('📝 Attempting test insert...');
    const { error: insertError } = await supabase.from('contacts').insert({
        site_id: testSiteId,
        name: 'Debug Script',
        email: 'debug@example.com',
        message: 'Test message from debug script'
    });

    if (insertError) {
        console.error('❌ Insert Failed:', insertError.message);
    } else {
        console.log('✅ Insert Successful!');
    }
}

main();
