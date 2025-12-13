<script setup lang="ts">
import { useSiteStore } from '~/stores/site';
import { md } from '~/utils/markdown';

const route = useRoute();
const siteStore = useSiteStore();
const slug = route.params.slug as string;

const { data: post } = await useAsyncData(`post-${slug}`, async () => {
    if (!siteStore.site) return null;
    const client = useSupabaseClient();
    const { data } = await client.from('posts').select('*').eq('site_id', siteStore.site.id).eq('slug', slug).single();
    return data;
});

if (!post.value) {
    throw createError({ statusCode: 404, statusMessage: 'Post Not Found' });
}
</script>

<template>
  <div class="bg-white">
      <!-- Immersive Header -->
      <div class="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <img v-if="post.cover_image_url" :src="post.cover_image_url" :alt="post.title" class="absolute inset-0 w-full h-full object-cover" />
          <div v-else class="absolute inset-0 bg-gray-900"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
          
          <div class="absolute bottom-0 left-0 w-full p-6 pb-12 md:pb-20">
              <div class="container mx-auto max-w-4xl">
                  <NuxtLink to="/" class="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors">
                      ← Volver al inicio
                  </NuxtLink>
                  <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
                      {{ post.title }}
                  </h1>
                  <div class="flex items-center gap-6 text-white/90 text-sm font-medium">
                       <span>{{ new Date(post.published_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
                       <span class="w-1 h-1 bg-white rounded-full"></span>
                       <span>Líctura de 5 min</span>
                  </div>
              </div>
          </div>
      </div>

      <article class="relative -mt-10 z-10">
          <div class="container mx-auto px-4">
              <div class="max-w-3xl mx-auto bg-white rounded-t-3xl shadow-sm border border-gray-100 p-8 md:p-16">
                  <!-- Content Render -->
                  <div class="prose prose-lg prose-slate md:prose-xl mx-auto
                        prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 
                        prose-p:font-serif prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                        prose-strong:text-primary 
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-10 prose-img:w-full
                        first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-2">
                    <div v-html="md.render(post.content)"></div>
                  </div>
                  
                  <!-- Share / Tags Placeholder -->
                  <div class="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
                      <div class="text-sm text-gray-500">
                          Etiquetas: <span class="text-primary font-medium">Blog, Tecnología</span>
                      </div>
                  </div>
              </div>
          </div>
      </article>
      
      <!-- Spacing -->
      <div class="h-24"></div>
  </div>
</template>
