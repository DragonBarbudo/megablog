<script setup lang="ts">
import { useSiteStore } from '~/stores/site';
import { Calendar } from 'lucide-vue-next';

const siteStore = useSiteStore();

const { data: posts } = await useAsyncData('experiencias-posts', async () => {
    if (!siteStore.site) return [];
    const client = useSupabaseClient();
    const { data } = await client.from('posts').select('*').eq('site_id', siteStore.site.id).order('published_at', { ascending: false });
    return data || [];
});

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-20">
      <div class="container mx-auto px-6">
          <div class="text-center mb-16">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Experiencias</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">Explora todas nuestras historias, consejos y artículos.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <NuxtLink v-for="post in posts" :key="post.id" :to="`/blog/${post.slug}`" 
                    class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col hover:-translate-y-1">
                    
                    <div class="relative h-56 overflow-hidden">
                        <img v-if="post.cover_image_url" :src="post.cover_image_url" :alt="post.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                             <span class="text-4xl font-black opacity-20">IMG</span>
                        </div>
                    </div>
                    
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex items-center gap-2 text-xs font-semibold text-primary mb-3">
                             <Calendar class="w-3 h-3" />
                             {{ formatDate(post.published_at) }}
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-primary transition-colors">
                            {{ post.title }}
                        </h3>
                        <p class="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow font-serif">
                            {{ post.excerpt }}
                        </p>
                        <div class="mt-auto pt-4 border-t border-gray-50 text-sm font-medium text-primary">
                            Leer más &rarr;
                        </div>
                    </div>
                </NuxtLink>
            </div>
      </div>
  </div>
</template>
