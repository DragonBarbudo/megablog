
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { email } = body;
    const siteId = event.context.site?.id;

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: 'Email is required' });
    }

    const config = useRuntimeConfig();
    const supabaseUrl = config.public.supabaseUrl;
    // Prefer Secret Key (new) -> Service Key (old)
    const supabaseServiceKey = config.supabaseSecretKey || config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseServiceKey) {
        throw createError({ statusCode: 500, statusMessage: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If we don't have site_id in body, try to find it via origin header
    let targetSiteId = body.site_id;
    if (!targetSiteId) {
        const host = getRequestHeader(event, 'host');
        if (host) {
            const domain = host.split(':')[0]; // remove port
            const { data: site } = await supabase.from('sites').select('id').eq('domain', domain).single();
            if (site) targetSiteId = site.id;
        }
    }

    if (!targetSiteId) {
        throw createError({ statusCode: 400, statusMessage: 'Site context missing' });
    }

    // 1. Check for duplicates
    const { data: existing } = await supabase
        .from('subscribers')
        .select('id')
        .eq('site_id', targetSiteId)
        .eq('email', email)
        .single();

    if (existing) {
        return { success: true, message: 'Already subscribed!' };
    }

    // 2. Insert
    const { error } = await supabase.from('subscribers').insert({
        site_id: targetSiteId,
        email
    });

    if (error) {
        console.error('[Subscribe API] Insert Error:', error);
        throw createError({ statusCode: 500, statusMessage: error.message });
    }

    console.log(`[Email Mock] Sending 'Thank You for Subscribing' to ${email} for site ${targetSiteId}`);

    return { success: true, message: '¡Gracias por suscribirte!' };
});
