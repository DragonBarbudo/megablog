
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateImage, removeBackground } from '../app/server/utils/ai';
import { processAndUploadImage } from '../app/server/utils/storage';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: npx tsx scripts/update-logo.ts <domain> [optional: prompt]');
        process.exit(1);
    }

    const [domain, promptArg] = args;
    console.log(`🚀 Generating Logo for: ${domain}`);

    // 1. Get Site
    const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('domain', domain)
        .single();

    if (siteError || !site) {
        console.error(`Site '${domain}' not found.`);
        process.exit(1);
    }

    // 2. Generate Logo
    const logoPrompt = promptArg || `Minimalist vector logo for a brand named ${site.name}, ${site.description}, white background, flat design, icon only, high quality, no text`;
    console.log(`... Generating with prompt: "${logoPrompt}"`);

    const rawLogoUrl = await generateImage(logoPrompt, { image_size: 'landscape_16_9' });

    if (!rawLogoUrl) {
        console.error('Failed to generate logo.');
        process.exit(1);
    }

    // New Step: Remove Background
    const transparentLogoUrl = await removeBackground(rawLogoUrl);

    // Fail gracefully: if removal fails, use raw (though user requested transparent)
    // But ideally we want transparent.
    const urlToUpload = transparentLogoUrl || rawLogoUrl;
    if (!transparentLogoUrl) console.warn('Warning: Background removal failed, using raw image.');

    console.log(`... Uploading Logo`);
    const filename = `logo-${site.domain}-${Date.now()}`;
    const finalLogoUrl = await processAndUploadImage(urlToUpload, filename);

    if (!finalLogoUrl) {
        console.error('Failed to upload logo.');
        process.exit(1);
    }

    // 3. Update Site Config
    console.log(`... Updating Site Configuration`);

    const newConfig = {
        ...site.theme_config,
        logoUrl: finalLogoUrl
    };

    const { error: updateError } = await supabase
        .from('sites')
        .update({ theme_config: newConfig })
        .eq('id', site.id);

    if (updateError) {
        console.error('Error updating site config:', updateError);
        process.exit(1);
    }

    console.log(`✅ Logo updated successfully!`);
    console.log(`URL: ${finalLogoUrl}`);
}

main().catch(console.error);
