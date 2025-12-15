
import { generateText, generateImage } from '~/server/utils/ai';
import { sanitizeContent, processContentImages } from '~/server/utils/content-processor';
import { processAndUploadImage } from '~/server/utils/storage';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    // Auth Check
    if (query.token !== config.cloudflareToken) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const domain = query.domain as string;
    const topic = query.topic as string;

    if (!domain || !topic) {
        throw createError({ statusCode: 400, statusMessage: 'Missing domain or topic' });
    }

    // Initialize Supabase Service Client
    const serviceClient = await serverSupabaseServiceRole(event);

    // 1. Get Site
    const { data: site, error: siteError } = await serviceClient
        .from('sites')
        .select('id, name, description')
        .eq('domain', domain)
        .single();

    if (siteError || !site) {
        throw createError({ statusCode: 404, statusMessage: `Site '${domain}' not found` });
    }

    // 2. Generate Title/Idea
    const ideaPrompt = `Generate a catchy blog post title and slug for the topic "${topic}" for a blog named "${site.name}". 
    Return JSON: { title, slug, excerpt }. Return ONLY valid JSON.`;

    const ideaRaw = await generateText(ideaPrompt);
    const idea = JSON.parse(ideaRaw?.replace(/```json|```/g, '').trim() || '{}');

    if (!idea.title) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to generate post idea' });
    }

    // 3. Generate Content
    const contentPrompt = `Write a comprehensive blog post in Markdown format for the title: "${idea.title}". 
    Context: Blog is about "${site.description}". 
    Make it SEO optimized, at least 800 words in mexican spanish. Use ## and ### for headers.
    
    IMPORTANT: Include at least 3 images. To include an image, write a placeholder on its own line like this:
    [IMAGE: description of the image scene]
    
    Place these image placeholders naturally between paragraphs where relevant.`;

    const rawContent = await generateText(contentPrompt);

    // Sanitize
    const sanitizedContent = sanitizeContent(rawContent || '');

    // 4. Generate Main Cover Image
    // Using negative prompts as requested
    const falImageUrl = await generateImage(`Hyper-realistic photography, ${idea.title}, ${site.name}, high quality, 8k, cinematic lighting, no text, no letters, no sign, no watermark, clean image`);
    let finalCoverUrl = falImageUrl;

    if (falImageUrl) {
        const filename = `${Date.now()}-${idea.slug}-cover`;
        const uploadedUrl = await processAndUploadImage(falImageUrl, filename);
        if (uploadedUrl) {
            finalCoverUrl = uploadedUrl;
        }
    }

    // 5. Process Inline Images
    const finalContent = await processContentImages(sanitizedContent, site.name);

    // 6. Insert Post
    const { error: postError } = await serviceClient.from('posts').upsert({
        site_id: site.id,
        slug: idea.slug,
        title: idea.title,
        excerpt: idea.excerpt,
        content: finalContent,
        cover_image_url: finalCoverUrl,
        published_at: new Date().toISOString(),
        seo_tags: { title: idea.title, description: idea.excerpt }
    }, { onConflict: 'site_id, slug' });

    if (postError) {
        throw createError({ statusCode: 500, statusMessage: postError.message });
    }

    return {
        success: true,
        site: domain,
        post_url: `/blog/${idea.slug}`,
        title: idea.title
    };
});
