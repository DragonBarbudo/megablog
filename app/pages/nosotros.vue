<script setup lang="ts">
import { useSiteStore } from '~/stores/site';
import { md } from '~/utils/markdown';

const siteStore = useSiteStore();
const { data: page } = await useAsyncData('page-nosotros', async () => {
    if (!siteStore.site) return null;
    const client = useSupabaseClient();
    const { data } = await client.from('pages').select('*').eq('site_id', siteStore.site.id).eq('slug', 'nosotros').single();
    return data;
});

useHead({
  title: computed(() => page.value?.title || 'Nosotros')
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-20">
      <div v-if="page" class="container mx-auto px-6 max-w-4xl">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">{{ page.title }}</h1>
          
          <div class="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg prose-slate mx-auto
               prose-headings:font-bold prose-a:text-primary">
              <img v-if="siteStore.site?.theme_config?.logoUrl" :src="siteStore.site.theme_config.logoUrl" :alt="siteStore.site?.name" class="h-40 w-auto mx-auto mb-10 not-prose" />
              <div v-html="md.render(page.content)"></div>
          </div>
      </div>
      <div v-else class="text-center py-20">
          <p class="text-gray-500">Cargando...</p>
      </div>
  </div>
</template>
