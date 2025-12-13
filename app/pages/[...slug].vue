<script setup lang="ts">
import { useSiteStore } from '~/stores/site';

const route = useRoute();
const siteStore = useSiteStore();
const slug = route.params.slug instanceof Array ? route.params.slug.join('/') : route.params.slug;

const { data: page } = await useAsyncData(`page-${slug}`, async () => {
    if (!siteStore.site) return null;
     // Mock fetch
    // const client = useSupabaseClient();
    // const { data } = await client.from('pages').select('*').eq('site_id', siteStore.site.id).eq('slug', slug).single();
    // return data;
    
    // Mock data for verification
    if (slug === 'about') {
        return {
            title: 'About Us',
            content: '<p>This is the about page content.</p>'
        }
    }
    return null;
});

if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}
</script>

<template>
  <div class="prose max-w-none mx-auto py-12">
    <h1 class="text-4xl font-bold mb-6 text-primary">{{ page.title }}</h1>
    <div v-html="page.content" class="bg-surface p-8 rounded-lg shadow-sm"></div>
  </div>
</template>
