
import { generateImage } from './ai';
import { processAndUploadImage } from './storage';

/**
 * Clean AI output that might be wrapped in ```markdown ... ```
 */
export function sanitizeContent(content: string): string {
    // Remove wrapping ```markdown ... ``` or ``` ... ```
    // Case insensitive, matching start/end of string with lenient whitespace
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(markdown|md)?\s*/i, '');
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/\s*```$/, '');
    }
    return cleaned;
}

/**
 * Parse content for [IMAGE: phrase] placeholders, generate images, 
 * upload them, and replace placeholders with markdown images.
 */
export async function processContentImages(content: string, context: string): Promise<string> {
    let finalContent = content;

    // Regex to find [IMAGE: description]
    // We use a global regex to find all matches
    const regex = /\[IMAGE:\s*(.*?)\]/g;
    const matches = [...content.matchAll(regex)];

    console.log(`... Found ${matches.length} image placeholders to process.`);

    // Process sequentially to be safe (or parallel if we want speed, but API limits?)
    // Sequential better for logging clarity.
    for (const match of matches) {
        const placeholder = match[0];
        const promptDescription = match[1] || 'scene';

        console.log(`   - Processing placeholder: "${promptDescription}"`);

        // Enhance prompt
        const fullPrompt = `Hyper-realistic photography, ${promptDescription}, ${context}, high quality, 8k, cinematic lighting`;

        try {
            const falUrl = await generateImage(fullPrompt);
            let finalUrl = falUrl;

            if (falUrl) {
                const filename = `${Date.now()}-${promptDescription.slice(0, 10).replace(/[^a-z0-9]/gi, '_')}`;
                const uploaded = await processAndUploadImage(falUrl, filename);
                if (uploaded) finalUrl = uploaded;
            }

            if (finalUrl) {
                // Replace in content
                finalContent = finalContent.replace(placeholder, `![${promptDescription}](${finalUrl})`);
            } else {
                // Remove placeholder if failed
                finalContent = finalContent.replace(placeholder, '');
            }

        } catch (e) {
            console.error(`Failed to generate image for "${promptDescription}":`, e);
            finalContent = finalContent.replace(placeholder, '');
        }
    }

    return finalContent;
}
