
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateText, generateImage } from '../app/server/utils/ai';
import { processAndUploadImage } from '../app/server/utils/storage';
import { sanitizeContent, processContentImages } from '../app/server/utils/content-processor';

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
    if (args.length < 3) {
        console.log('Usage: npx tsx scripts/builder.ts <domain> <name> <niche/topic>');
        process.exit(1);
    }

    const [domain, name, niche] = args;
    console.log(`🚀 Starting builder for: ${name} (${domain}) - Topic: ${niche}`);

    // 1. Generate Site Configuration
    console.log('... Generating Theme & Config');
    const configPrompt = `Generate a JSON configuration for a blog about "${niche}". 
    The JSON should have:
    - description: A short SEO description in Mexican Spanish (max 160 chars).
    - theme_config: { 
        primaryColor, secondaryColor, accentColor, fontFamily (Google Font name),
        contact_info: {
            why_us: ["reason 1", "reason 2", "reason 3"],
            hours: ["Lunes - Viernes: 9am - 6pm", "Sábado: 10am - 2pm"],
            coverage: { 
                center: { lat: 19.4326, lng: -99.1332 }, 
                places: ["CDMX", "Polanco", "Condesa"] 
            },
            faqs: [ { question: "Q1", answer: "A1" } ] (10 questions in Spanish)
        },
        testimonials: [
             { text: "Great service...", author: "Name", role: "CEO" },
             { text: "Amazing...", author: "Name", role: "Manager" },
             { text: "Recommended...", author: "Name", role: "Client" }
        ] (3 realistic testimonials in Mexican Spanish)
    }.
    - socials: { twitter, facebook, instagram, email, phone, whatsapp } (use placeholder URLs/numbers).
    Return ONLY valid JSON.`;

    const configRaw = await generateText(configPrompt);
    const config = JSON.parse(configRaw?.replace(/```json|```/g, '').trim() || '{}');

    // ... Generate About/Team Image
    console.log('... Generating Brand/About Image');
    const aboutImageUrl = await generateImage(`Professional team photo or modern office for ${name}, ${niche}, warm lighting, photorealistic, high resolution`);
    let finalAboutImageUrl = aboutImageUrl;

    if (aboutImageUrl) {
        const uploaded = await processAndUploadImage(aboutImageUrl, `${Date.now()}-about-image`);
        if (uploaded) finalAboutImageUrl = uploaded;
    }

    config.theme_config.about_image_url = finalAboutImageUrl;

    // 2. Insert Site
    console.log('... Creating Site in DB');
    const { data: site, error: siteError } = await supabase.from('sites').upsert({
        domain,
        name,
        description: config.description,
        theme_config: config.theme_config,
        socials: config.socials
    }, { onConflict: 'domain' }).select().single();

    if (siteError) throw siteError;
    console.log(`✅ Site created: ${site.id}`);

    // 3. Generate "Inicio" (Home)
    console.log('... Generating Inicio Page');
    const homeContent = await generateText(`Write content in Markdown format for the 'Inicio' page of a business/blog about ${niche}. Use ## for headers. Tone: Professional, welcoming, Mexican Spanish. Cover the main value proposition.`);

    const { error: pageError } = await supabase.from('pages').upsert({
        site_id: site.id,
        slug: 'home', // Keeping 'home' slug internally for index
        title: 'Inicio',
        content: homeContent,
        seo_tags: { title: `Inicio - ${name}`, description: config.description }
    }, { onConflict: 'site_id, slug' });

    if (pageError) console.error('Error creating home page:', pageError);

    // 4. Generate "Nosotros" (About)
    console.log('... Generating Nosotros Page');
    const aboutContent = await generateText(`Write a compelling 'History of Creation' story for a business named "${name}" in the "${niche}" industry. 
    Format: Markdown. 
    Tone: Inspiring, professional, Mexican Spanish.
    Structure:
    - Our Origins (Nuestros Orígenes)
    - The Mission (La Misión)
    - The Team (El Equipo)
    `);

    await supabase.from('pages').upsert({
        site_id: site.id,
        slug: 'nosotros',
        title: 'Nosotros',
        content: aboutContent,
        seo_tags: { title: `Nosotros - ${name}` }
    }, { onConflict: 'site_id, slug' });

    // 5. Generate Blog Posts (Experiencias)
    console.log('... Generating 4 Blog Post Ideas in Spanish');
    const ideasRaw = await generateText(`Generate 4 blog post ideas in mexican spanish for the niche "${niche}". Return a JSON array of objects with keys: title, slug, excerpt. Return ONLY valid JSON.`);
    const ideas = JSON.parse(ideasRaw?.replace(/```json|```/g, '').trim() || '[]');

    for (const [index, post] of ideas.entries()) {
        console.log(`[${index + 1}/4] Generating Post: ${post.title}`);

        // Generate Content with Placeholders
        const contentPrompt = `Write a comprehensive blog post in Markdown format for the title: "${post.title}". 
        logic: Niche is ${niche}. Make it SEO optimized, at least 800 words in mexican spanish. Use ## and ### for headers.
        
        IMPORTANT: Include at least 3 images. To include an image, write a placeholder on its own line like this:
        [IMAGE: description of the image scene]
        
        Place these image placeholders naturally between paragraphs where relevant.`;

        const rawContent = await generateText(contentPrompt);

        // Sanitize
        const sanitizedContent = sanitizeContent(rawContent || '');

        // Generate Cover Image
        console.log(`   - Generating Cover Image...`);
        const falImageUrl = await generateImage(`Hyper-realistic photography, ${niche}, ${post.title}, high quality, 8k, cinematic lighting`);
        console.log(`   - Fal Image URL: ${falImageUrl}`);
        let finalCoverUrl = falImageUrl;

        if (falImageUrl) {
            // Process Image (Convert & Upload)
            const filename = `${Date.now()}-${post.slug}-cover`;
            const uploadedUrl = await processAndUploadImage(falImageUrl, filename);
            if (uploadedUrl) {
                finalCoverUrl = uploadedUrl;
            }
        }

        // Process Inline Images
        console.log('   - Processing Inline Images...');
        const finalContent = await processContentImages(sanitizedContent, niche);

        // Insert Post
        const { error: postError } = await supabase.from('posts').upsert({
            site_id: site.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: finalContent, // No duplicate cover
            cover_image_url: finalCoverUrl,
            published_at: new Date().toISOString(),
            seo_tags: { title: post.title, description: post.excerpt }
        }, { onConflict: 'site_id, slug' });

        if (postError) console.error('Error saving post:', postError);
    }

    console.log('🎉 Builder verification complete! Site is ready.');
}

main().catch(console.error);
