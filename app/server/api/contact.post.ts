
import { z } from 'zod';

const contactSchema = z.object({
    site_id: z.string().uuid(),
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    company: z.string().optional(),
    message: z.string().min(10, 'Message is too short'),
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const result = contactSchema.safeParse(body);

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation Error',
            data: result.error.flatten().fieldErrors,
        });
    }

    const config = useRuntimeConfig();
    const supabaseUrl = config.public.supabaseUrl;
    const supabaseKey = config.supabaseServiceKey || config.supabaseSecretKey || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('SERVER ERROR: Missing Supabase credentials');
        console.error('URL:', supabaseUrl ? 'Set' : 'Missing');
        console.error('Key:', supabaseKey ? 'Set' : 'Missing');

        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error: Missing Credentials'
        });
    }

    // Use manual client creation to ensure we use the Service Key
    // serverSupabaseServiceRole can sometimes fail if env vars aren't perfectly aligned with module expectations
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const { error } = await client.from('contacts').insert({
        site_id: body.site_id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        message: body.message,
    });

    if (error) {
        console.error('Contact insert error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: `Database Error: ${error.message}`,
            data: error
        });
    }

    return { success: true, message: 'Message sent successfully' };
});
