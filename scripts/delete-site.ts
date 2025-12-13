
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    const domain = process.argv[2];

    if (!domain) {
        console.log('Usage: npx tsx scripts/delete-site.ts <domain>');
        process.exit(1);
    }

    // 1. Check if site exists
    const { data: site, error: findError } = await supabase
        .from('sites')
        .select('id, name')
        .eq('domain', domain)
        .single();

    if (findError || !site) {
        console.error(`Site '${domain}' not found.`);
        process.exit(1);
    }

    console.log(`WARNING: You are about to DELETE the site "${site.name}" (${domain}) and ALL its pages and posts.`);

    const PROJECT_URL = supabaseUrl; // Just for reference if parsing needed, but we use storage client

    // 2. Fetch all posts to find images
    console.log('Fetching posts and collecting images...');
    const { data: posts } = await supabase
        .from('posts')
        .select('content, cover_image_url')
        .eq('site_id', site.id);

    const imagesToDelete: string[] = [];

    if (posts && posts.length > 0) {
        for (const post of posts) {
            // A. Cover Image
            if (post.cover_image_url) {
                // Assuming URL format: .../storage/v1/object/public/images/filename
                // We need just the 'filename' (path in bucket)
                // Or if it's the full URL, we extract the part after /images/
                const urlParts = post.cover_image_url.split('/images/');
                if (urlParts.length > 1) {
                    imagesToDelete.push(urlParts[1]);
                }
            }

            // B. Inline Images in Content
            // Regex to find ![alt](url)
            const regex = /!\[.*?\]\((.*?)\)/g;
            const matches = [...post.content.matchAll(regex)];
            for (const match of matches) {
                const url = match[1];
                if (url && url.includes('/images/')) {
                    const urlParts = url.split('/images/');
                    if (urlParts.length > 1) {
                        imagesToDelete.push(urlParts[1]);
                    }
                }
            }
        }
    }

    const uniqueImages = [...new Set(imagesToDelete)];
    console.log(`Found ${uniqueImages.length} images to delete.`);

    rl.question(`Are you sure you want to delete site "${site.name}" and ${uniqueImages.length} images? Type "delete" to confirm: `, async (answer) => {
        if (answer !== 'delete') {
            console.log('Aborted.');
            process.exit(0);
        }

        console.log('Deleting images...');
        if (uniqueImages.length > 0) {
            // Delete in chunks of 50 to be safe
            const chunkSize = 50;
            for (let i = 0; i < uniqueImages.length; i += chunkSize) {
                const chunk = uniqueImages.slice(i, i + chunkSize);
                const { error: storageError } = await supabase
                    .storage
                    .from('images')
                    .remove(chunk);
                if (storageError) {
                    console.error('Error deleting chunk of images:', storageError);
                } else {
                    console.log(`Deleted ${chunk.length} images...`);
                }
            }
        }

        console.log('Deleting site record...');

        const { error: deleteError } = await supabase
            .from('sites')
            .delete()
            .eq('id', site.id);

        if (deleteError) {
            console.error('Error deleting site:', deleteError);
        } else {
            console.log(`✅ Site '${domain}' and associated data deleted successfully.`);
        }

        rl.close();
    });
}

main().catch(console.error);
