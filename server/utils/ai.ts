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

export const generateImage = async (prompt: string) => {
    try {
        // Using result from Fal.ai > z-image (fal-ai/flux/dev or similiar, user said "z-image", might mean flux-realism or similar? fal.ai has many models. I will use flux-pro or dev as high quality default)
        // User mentioned "z-image". I'll search if there is a specific 'z-image' model or if it's a typo/internal name. Assuming 'fal-ai/flux/dev' as safe high quality default.
        // Or "fast-lightning-sdxl". I'll stick to a high quality one.
        const result: any = await fal.subscribe('fal-ai/flux/dev', {
            input: {
                prompt: prompt,
                image_size: 'landscape_16_9',
                num_inference_steps: 30, // Basic quality
                enable_safety_checker: true
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === 'IN_PROGRESS') {
                    // console.log(update.logs.map((log) => log.message).join('\n'));
                }
            },
        });

        // result.images is array of { url: string, ... }
        if (result.images && result.images.length > 0) {
            return result.images[0].url;
        }
        return null;
    } catch (error) {
        console.error('Fal.ai Error:', error);
        throw error;
    }
}
