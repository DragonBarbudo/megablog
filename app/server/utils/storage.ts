import { createClient } from '@supabase/supabase-js';

// Re-create client if needed inside utils or pass it in. 
// For Utils in Nuxt/Nitro, we might need a generic way. 
// But since this runs in Node (server/scripts), we can use standard fetch.

export const processAndUploadImage = async (imageUrl: string, fileName: string): Promise<string | null> => {
    try {
        console.log(`[Image] Processing: ${fileName}`);

        // 1. Download Image
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const buffer = await response.arrayBuffer();

        // 2. Convert to AVIF
        // curl -X POST https://webp.abrir.xyz/api/convert-image -F "image=@photo.jpg" -F "format=avif"
        // Use native FormData (Node 18+)
        const form = new FormData();
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        form.append('image', blob, 'image.jpg');
        form.append('format', 'avif'); // User requested AVIF convert, but output extension in curl usage was .webp in example? 
        // User example: -F "format=avif" -o result.webp. 
        // I will assume the output format requested is AVIF but maybe container is webp or just extension?
        // Let's settle on .avif extension if format is avif.

        // Note: The conversion service might return binary data directly.
        // We need to fetch from the conversion service.
        // Node fetch with FormData

        // Getting headers from form-data is tricky in some fetch polyfills, but Node 18 fetch + form-data package might need:
        // form.getHeaders().

        // We will use 'undici' or native fetch. 
        // Native fetch in Node 22 should handle FormData if it matches the spec, but 'form-data' package is for streams.
        // Let's try constructing a Request with the formData.

        // Actually, for simplicity/robustness in Node scripts:
        const convertResponse = await fetch('https://webp.abrir.xyz/api/convert-image', {
            method: 'POST',
            body: form,
        });

        if (!convertResponse.ok) {
            console.error('Convert failed:', await convertResponse.text());
            throw new Error('Image conversion failed');
        }

        const convertedBuffer = await convertResponse.arrayBuffer();

        // 3. Upload to Supabase Storage
        // We need env vars.
        const supabaseUrl = process.env.SUPABASE_URL || useRuntimeConfig().public.supabaseUrl;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || useRuntimeConfig().supabaseServiceKey;

        if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials for upload');

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Ensure bucket exists? We can't easily. Assume 'images' bucket exists. The user said "Store the images in supabase storage".
        // Filename should have .avif
        const finalFileName = `${fileName.replace(/\.[^/.]+$/, "")}.avif`;
        const filePath = `covers/${finalFileName}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, convertedBuffer, {
                contentType: 'image/avif',
                upsert: true
            });

        if (error) {
            // Check if bucket not found?
            console.error('Upload error:', error);
            throw error;
        }

        // 4. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        console.log(`[Image] Uploaded to: ${publicUrlData.publicUrl}`);
        return publicUrlData.publicUrl;

    } catch (e) {
        console.error('[Image] Process Error:', e);
        return null;
    }
}
