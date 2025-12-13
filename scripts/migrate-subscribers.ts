
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('Running migration: Create Subscribers Table...');

    const sql = `
    create table if not exists public.subscribers (
      id uuid default uuid_generate_v4() primary key,
      site_id uuid references public.sites(id) on delete cascade not null,
      email text not null,
      created_at timestamp with time zone default now(),
      unique(site_id, email)
    );

    alter table public.subscribers enable row level security;
    
    do $$
    begin
      if not exists (
        select from pg_policies where policyname = 'Allow anon insert to subscribers'
      ) then
        create policy "Allow anon insert to subscribers" on public.subscribers for insert with check (true);
      end if;
    end
    $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql });
    // Note: 'exec_sql' is a common pattern but requires a specific function in DB. 
    // If not present, we can't run DDL via client easily without that function.
    // Alternatively, we prompt user or usage of pg library.
    // Given the environment, maybe we assume the user has to run it or we use a "rpc" if we created one before.
    // We did not create an exec_sql rpc. 

    // Fallback: We can't easily run DDL from JS client without a specific helper function in Postgres.
    // I will log instructions instead, OR if I can use the postgres connection string if available?
    // The user provided supabase URL/Key.

    console.log("NOTE: Supabase JS Client cannot execute DDL (CREATE TABLE) directly without a helper function.");
    console.log("Please run the SQL found in 'supabase/schema.sql' in your Supabase SQL Editor to create the 'subscribers' table.");
}

main().catch(console.error);
