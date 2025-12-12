<script setup lang="ts">
import { useSiteStore } from '~/app/stores/site';

const siteStore = useSiteStore();
const { data: posts } = await useAsyncData('latest-posts', async () => {
    if (!siteStore.site) return [];
    
    // In a real implementation this would fetch from Supabase filter by site_id
    // For now we mock or return empty
    // const client = useSupabaseClient();
    // const { data } = await client.from('posts').select('*').eq('site_id', siteStore.site.id).limit(6);
    // return data;
    return []; 
});
</script>

<template>
  <div>
    <section class="text-center py-20 bg-gradient-to-r from-primary to-accent text-white rounded-3xl mb-12">
      <h1 class="text-5xl font-bold mb-4">{{ siteStore.site?.name || 'Welcome' }}</h1>
      <p class="text-xl opacity-90">{{ siteStore.site?.description || 'Your content goes here.' }}</p>
    </section>

    <!-- Latest Posts / Content -->
    <section>
       <h2 class="text-3xl font-bold mb-8 text-primary">Latest Stories</h2>
       <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div v-for="i in 3" :key="i" class="bg-surface p-6 rounded-lg shadow border border-gray-100 animate-pulse" v-if="!posts?.length">
             <div class="h-48 bg-gray-200 rounded mb-4"></div>
             <div class="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
             <div class="h-4 bg-gray-200 rounded w-1/2"></div>
         </div>
       </div>
    </section>
  </div>
</template>
