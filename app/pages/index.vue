

<script setup lang="ts">
import { useSiteStore } from '~/stores/site';
import { md } from '~/utils/markdown';
import { ArrowRight, Calendar, Clock } from 'lucide-vue-next';

const siteStore = useSiteStore();
const { data: page } = await useAsyncData('home-page', async () => {
    if (!siteStore.site) return null;
    const client = useSupabaseClient();
    const { data } = await client.from('pages').select('*').eq('site_id', siteStore.site.id).eq('slug', 'home').single();
    return data;
});

const { data: posts } = await useAsyncData('latest-posts', async () => {
    if (!siteStore.site) return [];
    const client = useSupabaseClient();
    const { data } = await client.from('posts').select('*').eq('site_id', siteStore.site.id).order('published_at', { ascending: false }).limit(7);
    return data || [];
});

const featuredPost = computed(() => posts.value?.[0]);
const gridPosts = computed(() => posts.value?.slice(1) || []);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-24 px-6 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 -z-10"></div>
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div class="max-w-4xl mx-auto text-center">
            <span class="inline-block py-1 px-3 rounded-full bg-white border border-gray-200 text-xs font-semibold text-primary uppercase tracking-wider mb-6 shadow-sm">
                {{ siteStore.site?.name }}
            </span>
            <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900 leading-tight">
                {{ siteStore.site?.description || 'Discover amazing stories.' }}
            </h1>
            <p v-if="page" class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
               <!-- Extracting text from markdown effectively is hard without rendering, so we just put a generic invite or render small part if needed. 
                    For now, forcing a clean subheader. -->
               Explora lo último en tendencias, análisis y opiniones.
            </p>
             <!-- <div v-html="md.render(page.content)" class="prose prose-lg mx-auto text-gray-600"></div> -->
        </div>
    </section>

    <div class="container mx-auto px-6 py-12">
        <!-- Featured Post (Bento Large) -->
        <section v-if="featuredPost" class="mb-20">
            <NuxtLink :to="`/blog/${featuredPost.slug}`" class="group relative block rounded-3xl overflow-hidden shadow-xl aspect-[21/9] bg-gray-900">
                <img v-if="featuredPost.cover_image_url" :src="featuredPost.cover_image_url" :alt="featuredPost.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                
                <div class="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                    <div class="flex items-center gap-3 text-white/80 text-sm mb-3">
                        <Calendar class="w-4 h-4" />
                        {{ formatDate(featuredPost.published_at) }}
                    </div>
                    <h2 class="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary-300 transition-colors">
                        {{ featuredPost.title }}
                    </h2>
                    <p class="text-lg text-white/90 line-clamp-2 mb-6">
                        {{ featuredPost.excerpt }}
                    </p>
                    <span class="inline-flex items-center text-white font-medium group-hover:underline">
                        Leer artículo <ArrowRight class="ml-2 w-4 h-4" />
                    </span>
                </div>
            </NuxtLink>
        </section>

        <!-- Grid Posts -->
        <section>
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock class="w-6 h-6 text-primary" />
                    Últimas Publicaciones
                </h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <NuxtLink v-for="post in gridPosts" :key="post.id" :to="`/blog/${post.slug}`" 
                    class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1">
                    
                    <div class="relative h-48 overflow-hidden">
                        <img v-if="post.cover_image_url" :src="post.cover_image_url" :alt="post.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                             <span class="text-4xl font-black opacity-20">IMG</span>
                        </div>
                    </div>
                    
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="text-xs font-semibold text-primary mb-3 uppercase tracking-wide">Article</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-primary transition-colors">
                            {{ post.title }}
                        </h3>
                        <p class="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow font-serif">
                            {{ post.excerpt }}
                        </p>
                        
                        <div class="flex items-center justify-between text-sm text-gray-400 mt-auto pt-4 border-t border-gray-50">
                            <span>{{ formatDate(post.published_at) }}</span>
                            <span class="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </section>
    </div>
  </div>
</template>
