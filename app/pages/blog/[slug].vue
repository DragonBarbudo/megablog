<script setup lang="ts">
import { useSiteStore } from '~/app/stores/site';

const route = useRoute();
const siteStore = useSiteStore();
const slug = route.params.slug as string;

const { data: post } = await useAsyncData(`post-${slug}`, async () => {
    if (!siteStore.site) return null;
    // Mock fetch
    return {
        title: 'Sample Blog Post',
        published_at: new Date().toISOString(),
        content: '<p>Content of the blog post goes here...</p>',
        cover_image_url: 'https://via.placeholder.com/1200x600'
    };
});

if (!post.value) {
    throw createError({ statusCode: 404, statusMessage: 'Post Not Found' });
}
</script>

<template>
  <article class="max-w-4xl mx-auto py-12">
    <div class="mb-8 text-center">
       <span class="text-primary font-medium">{{ new Date(post.published_at).toLocaleDateString() }}</span>
       <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">{{ post.title }}</h1>
    </div>
    
    <div v-if="post.cover_image_url" class="mb-10">
        <img :src="post.cover_image_url" :alt="post.title" class="w-full h-auto rounded-xl shadow-md" />
    </div>

    <div v-html="post.content" class="prose prose-lg mx-auto bg-surface p-8 rounded-xl shadow-sm"></div>
  </article>
</template>
