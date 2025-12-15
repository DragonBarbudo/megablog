import OpenAI from 'openai';
import { fal } from '@fal-ai/client';

// We need to read env vars directly if running in script
const config = {
    openaiKey: process.env.OPENAI_API_KEY,
    falKey: process.env.FAL_KEY,
};

const openai = new OpenAI({
    apiKey: config.openaiKey,
});

export const generateText = async (prompt: string, model = 'gpt-4o') => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: model,
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI Error:', error);
        throw error;
    }
};

export const generateImage = async (prompt: string, options?: { image_size?: string }) => {
    try {
        // Using 'fal-ai/z-image/turbo' as requested
        const result: any = await fal.subscribe('fal-ai/z-image/turbo', {
            input: {
                prompt: prompt,
                image_size: options?.image_size || 'landscape_16_9',
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === 'IN_PROGRESS') {
                    // console.log(update.logs.map((log) => log.message).join('\n'));
                }
            },
        });

        const images = result.data?.images || result.images;

        if (images && images.length > 0) {
            return images[0].url;
        }
        return null;
    } catch (error) {
        console.error('Fal.ai Error:', error);
        throw error;
    }
}

export const removeBackground = async (imageUrl: string) => {
    try {
        console.log('... Removing Background from Logo');
        const result: any = await fal.subscribe('fal-ai/imageutils/rembg', {
            input: {
                image_url: imageUrl
            },
            logs: true,
        });

        // rembg usually returns { image: { url: ... } }
        const outputImage = result.data?.image || result.image;
        if (outputImage && outputImage.url) {
            return outputImage.url;
        }
        return null;
    } catch (error) {
        console.error('Fal.ai Rembg Error:', error);
        return null;
    }
}
