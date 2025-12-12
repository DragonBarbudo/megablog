
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateText, generateImage } from '../server/utils/ai';

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
    - description: A short SEO description (max 160 chars).
    - theme_config: { primaryColor, secondaryColor, accentColor, fontFamily (Google Font name) }.
    - socials: { twitter, facebook, instagram } (use placeholder URLs).
    Return ONLY valid JSON.`;

    const configRaw = await generateText(configPrompt);
    const config = JSON.parse(configRaw?.replace(/```json|```/g, '').trim() || '{}');

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

    // 3. Generate Home Page Content
    console.log('... Generating Home Page');
    const homeContent = await generateText(`Write HTML content for the home page welcome section of a blog about ${niche}. Use <h2> and <p> tags. Keep it welcoming and engaging.`);

    const { error: pageError } = await supabase.from('pages').upsert({
        site_id: site.id,
        slug: 'home', // or just use index logic in frontend
        title: 'Home',
        content: homeContent,
        seo_tags: { title: name, description: config.description }
    }, { onConflict: 'site_id, slug' });

    if (pageError) console.error('Error creating home page:', pageError);

    // 4. Generate About Page
    console.log('... Generating About Page');
    const aboutContent = await generateText(`Write HTML content for an 'About Us' page for a blog named "${name}" about ${niche}. Professional and trustworthy tone.`);

    await supabase.from('pages').upsert({
        site_id: site.id,
        slug: 'about',
        title: 'About Us',
        content: aboutContent,
        seo_tags: { title: `About - ${name}` }
    }, { onConflict: 'site_id, slug' });

    // 5. Generate Blog Posts
    console.log('... Generating 10 Blog Post Ideas');
    const ideasRaw = await generateText(`Generate 10 blog post ideas for the niche "${niche}". Return a JSON array of objects with keys: title, slug, excerpt. Return ONLY valid JSON.`);
    const ideas = JSON.parse(ideasRaw?.replace(/```json|```/g, '').trim() || '[]');

    for (const [index, post] of ideas.entries()) {
        console.log(`[${index + 1}/10] Generating Post: ${post.title}`);

        // Generate Content
        const content = await generateText(`Write a comprehensive blog post (HTML format, use <h2>, <h3>, <p>, <ul>) for the title: "${post.title}". logic: Niche is ${niche}. Make it SEO optimized, at least 800 words.`);

        // Generate Image
        console.log(`   - Generating Image...`);
        const imageUrl = await generateImage(`Hyper-realistic photography, ${niche}, ${post.title}, high quality, 8k, cinematic lighting`);

        // Insert Post
        const { error: postError } = await supabase.from('posts').upsert({
            site_id: site.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: content,
            cover_image_url: imageUrl,
            published_at: new Date().toISOString(),
            seo_tags: { title: post.title, description: post.excerpt }
        }, { onConflict: 'site_id, slug' });

        if (postError) console.error('Error saving post:', postError);
    }

    console.log('🎉 Builder verification complete! Site is ready.');
}

main().catch(console.error);
