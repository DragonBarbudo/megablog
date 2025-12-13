
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
    if (args.length < 2) {
        console.log('Usage: npx tsx scripts/add-post.ts <domain> <topic/title>');
        process.exit(1);
    }

    const [domain, topic] = args;
    console.log(`🚀 Adding post to: ${domain} - Topic: ${topic}`);

    // 1. Get Site
    const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('id, name, description')
        .eq('domain', domain)
        .single();

    if (siteError || !site) {
        console.error(`Site '${domain}' not found.`);
        process.exit(1);
    }

    // 2. Generate Title/Idea
    // If the input looks like a full title, use it. If it's a topic, generate a title.
    console.log('... Generating Title & Idea');
    const ideaPrompt = `Generate a catchy blog post title and slug for the topic "${topic}" for a blog named "${site.name}". 
    Return JSON: { title, slug, excerpt }. Return ONLY valid JSON.`;

    const ideaRaw = await generateText(ideaPrompt);
    const idea = JSON.parse(ideaRaw?.replace(/```json|```/g, '').trim() || '{}');

    if (!idea.title) {
        console.error('Failed to generate post idea.');
        process.exit(1);
    }

    console.log(`... Generated: "${idea.title}"`);

    // 3. Generate Content
    console.log('... Generating Content');
    // We request specific structure for images
    const contentPrompt = `Write a comprehensive blog post in Markdown format for the title: "${idea.title}". 
    Context: Blog is about "${site.description}". 
    Make it SEO optimized, at least 800 words in mexican spanish. Use ## and ### for headers.
    
    IMPORTANT: Include at least 3 images. To include an image, write a placeholder on its own line like this:
    [IMAGE: description of the image scene]
    
    Place these image placeholders naturally between paragraphs where relevant.`;

    const rawContent = await generateText(contentPrompt);

    // Sanitize (remove code blocks)
    const sanitizedContent = sanitizeContent(rawContent || '');

    // 4. Generate Main Cover Image
    console.log('... Generating Main Cover Image');
    const falImageUrl = await generateImage(`Hyper-realistic photography, ${idea.title}, ${site.name}, high quality, 8k, cinematic lighting`);
    let finalCoverUrl = falImageUrl;

    if (falImageUrl) {
        // Fal.ai z-image/turbo returns a URL.
        const filename = `${Date.now()}-${idea.slug}-cover`;
        const uploadedUrl = await processAndUploadImage(falImageUrl, filename);
        if (uploadedUrl) {
            finalCoverUrl = uploadedUrl;
        }
    }

    // 5. Process Inline Images
    console.log('... Processing Inline Images');
    const finalContent = await processContentImages(sanitizedContent, site.name);

    // 6. Insert Post
    const { error: postError } = await supabase.from('posts').upsert({
        site_id: site.id,
        slug: idea.slug,
        title: idea.title,
        excerpt: idea.excerpt,
        content: finalContent, // Content now has inline images, but NO duplicate cover image at top
        cover_image_url: finalCoverUrl,
        published_at: new Date().toISOString(),
        seo_tags: { title: idea.title, description: idea.excerpt }
    }, { onConflict: 'site_id, slug' });

    if (postError) {
        console.error('Error saving post:', postError);
    } else {
        console.log(`✅ Post added successfully: /blog/${idea.slug}`);
    }
}

main().catch(console.error);
