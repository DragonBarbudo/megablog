import { generateText, generateImage } from '~/server/utils/ai';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    // Auth check using a shared token (reuse Supabase key or specific token)
    // Here we check against CLOUDFLARE_TOKEN or a dedicated CRON_SECRET if we had one.
    // We'll require a 'token' query param matching CLOUDFLARE_TOKEN for simplicity.
    if (query.token !== config.cloudflareToken) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // 1. Find a site that needs a post
    // We need to use Supabase Service Key to query all sites
    // NOTE: If using the implicit parsed client in server routes, it uses cookies.
    // We need a Service Role client here.
    const serviceClient = await serverSupabaseServiceRole(event);

    // Logic: Find sites, order by last post?
    // Supabase doesn't easily support "last post" query without a join or a redundant column on sites.
    // We will assume 'sites' has many 'posts'.
    // Complex query: Select site where NOT EXISTS post where created_at > 3 days ago?
    // For simplicity: Fetch all sites, random pick one? Or just pick first one that needs it.

    const { data: sites } = await serviceClient.from('sites').select('id, name, description, domain');
    if (!sites || sites.length === 0) return { message: 'No sites found' };

    // We'll pick a RANDOM site to distribute load if run hourly
    const site = sites[Math.floor(Math.random() * sites.length)];

    // Check last post
    const { data: lastPost } = await serviceClient
        .from('posts')
        .select('published_at')
        .eq('site_id', site.id)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

    const lastPostDate = lastPost ? new Date(lastPost.published_at) : new Date(0);
    const daysSinceLastPost = (new Date().getTime() - lastPostDate.getTime()) / (1000 * 3600 * 24);

    // If posted recently (e.g. within 24 hours), skip.
    // User said "every X day".
    if (daysSinceLastPost < 1) {
        return { message: `Site ${site.domain} has recent post`, daysSinceLastPost };
    }

    // GENERATE NEW POST
    // 1. Idea
    const nichePrompt = `For the blog "${site.name}" (Description: ${site.description}), generate ONE unique blog post idea. Return JSON: { title, slug, excerpt }.`;
    const ideaRaw = await generateText(nichePrompt);
    const idea = JSON.parse(ideaRaw?.replace(/```json|```/g, '').trim() || '{}');

    if (!idea.title) throw new Error('Failed to generate idea');

    // 2. Content
    // We request specific structure for images
    const contentPrompt = `Write a comprehensive blog post in Markdown format for the title: "${idea.title}". 
    Context: Blog is about "${site.description}". 
    Make it SEO optimized, at least 800 words in mexican spanish. Use ## and ### for headers.
    
    IMPORTANT: Include at least 3 images. To include an image, write a placeholder on its own line like this:
    [IMAGE: description of the image scene]
    
    Place these image placeholders naturally between paragraphs where relevant.`;

    const rawContent = await generateText(contentPrompt);

    // Sanitize and Process
    // In server/api (Nitro), we can import from #imports or relative
    // But since content-processor is in server/utils, it should be auto-imported as 'sanitizeContent' etc.
    // Let's try auto-import first. If fails, we add import.
    // Actually, utils are auto-imported.

    // Sanitize
    // @ts-ignore
    const finalSanitizedContent = typeof sanitizeContent === 'function' ? sanitizeContent(rawContent || '') : (rawContent || '');

    // 3. Image (Cover)
    const imageUrl = await generateImage(`Review, ${idea.title}, ${site.name}, high quality`);
    let finalCoverUrl = imageUrl;

    // Process Cover Image
    if (imageUrl) {
        try {
            const filename = `${Date.now()}-${idea.slug}-cover`;
            // @ts-ignore
            if (typeof processAndUploadImage === 'function') {
                // @ts-ignore
                const uploaded = await processAndUploadImage(imageUrl, filename);
                if (uploaded) finalCoverUrl = uploaded;
            }
        } catch (e) {
            console.error('Failed to process image in cron:', e);
        }
    }

    // Process Inline Images
    // @ts-ignore
    let finalContent = finalSanitizedContent;
    // @ts-ignore
    if (typeof processContentImages === 'function') {
        // @ts-ignore
        finalContent = await processContentImages(finalSanitizedContent, site.name);
    }

    // 4. Insert
    const { error } = await serviceClient.from('posts').insert({
        site_id: site.id,
        slug: idea.slug,
        title: idea.title,
        excerpt: idea.excerpt,
        content: finalContent,
        cover_image_url: finalCoverUrl,
        published_at: new Date().toISOString(),
        seo_tags: { title: idea.title }
    });

    if (error) throw createError({ statusCode: 500, statusMessage: error.message });

    return {
        success: true,
        site: site.domain,
        post: idea.title
    };
});
