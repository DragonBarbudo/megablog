<script setup lang="ts">
import { useSiteStore } from '~/stores/site';
import { md } from '~/utils/markdown';
import { ArrowRight, Calendar, Clock, CheckCircle, Mail, MessageCircle } from 'lucide-vue-next';

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

// Newsletter
const email = ref('');
const subscribeStatus = ref('');
const subscribe = async () => {
    if (!email.value) return;
    try {
        const { data, error } = await useFetch('/api/newsletter', {
            method: 'POST',
            body: { email: email.value, site_id: siteStore.site?.id }
        });
        
        if (error.value) {
            console.error(error.value);
            subscribeStatus.value = 'Ocurrió un error. Intenta de nuevo.';
            return;
        }

        if (data.value) {
             subscribeStatus.value = data.value.message || '¡Gracias por suscribirte!';
             email.value = '';
        }
    } catch (e) {
        subscribeStatus.value = 'Ocurrió un error. Intenta de nuevo.';
    }
}

// Mock Testimonials (Ideally from DB or Config)
const testimonials = [
    { text: "Excelente servicio y atención. Totalmente recomendado.", author: "Maria Gonzalez" },
    { text: "El contenido es de primera calidad y muy útil.", author: "Juan Perez" },
    { text: "Una experiencia única, volveré sin duda.", author: "Sofia Rodriguez" }
];
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-24 px-6 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 -z-10"></div>
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div class="max-w-4xl mx-auto text-center" v-if="page">
            <span class="inline-block py-1 px-3 rounded-full bg-white border border-gray-200 text-xs font-semibold text-primary uppercase tracking-wider mb-6 shadow-sm">
                {{ siteStore.site?.name }}
            </span>
            <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900 leading-tight">
                {{ siteStore.site?.description || 'Bienvenido' }}
            </h1>
            
            <div class="prose prose-lg mx-auto text-gray-600 mb-10">
                 <!-- Render Home Page Content from DB, ensuring we strip markdown code blocks -->
                 <div v-html="md.render(page.content.replace(/^```(markdown|md)?\s*/i, '').replace(/\s*```$/, ''))"></div>
            </div>

            <div class="flex flex-col sm:flex-row justify-center gap-4">
                <NuxtLink to="/experiencias" class="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-600 transition shadow-lg shadow-primary/25">
                    Explorar Experiencias
                </NuxtLink>
                <NuxtLink to="/contacto" class="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition">
                    Contáctanos
                </NuxtLink>
            </div>
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

        <!-- Mini Nosotros -->
        <section class="mb-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-gray-50 p-8 rounded-3xl">
             <div>
                 <h2 class="text-3xl font-bold text-gray-900 mb-6">Sobre Nosotros</h2>
                 <p class="text-gray-600 mb-6 leading-relaxed">
                     Somos un equipo apasionado dedicado a explorar y compartir lo mejor del mundo de {{ siteStore.site?.name }}. 
                     Nuestra misión es informar, inspirar y conectar.
                 </p>
                 <NuxtLink to="/nosotros" class="inline-flex items-center text-primary font-bold hover:underline">
                     Conocer más <ArrowRight class="ml-2 w-4 h-4" />
                 </NuxtLink>
             </div>
             <div class="h-64 bg-gray-200 rounded-2xl overflow-hidden relative group">
                 <img v-if="siteStore.site?.theme_config?.about_image_url" :src="siteStore.site.theme_config.about_image_url" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Nosotros" />
                 <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-xl">
                     Imagen Nosotros
                 </div>
             </div>
        </section>

        <!-- Grid Posts -->
        <section class="mb-24">
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

        <!-- Testimonials -->
        <section class="mb-24 py-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-10 text-center">Clientes Satisfechos</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div v-for="(t, i) in (siteStore.site?.theme_config?.testimonials || testimonials)" :key="i" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition hover:shadow-lg">
                    <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
                        ★★★★★
                    </div>
                    <p class="text-gray-600 italic mb-6 leading-relaxed">"{{ t.text }}"</p>
                    <h4 class="font-bold text-gray-900">{{ t.author }}</h4>
                    <span class="text-xs text-xs text-gray-400" v-if="t.role">{{ t.role }}</span>
                </div>
            </div>
        </section>

        <!-- Newsletter & CTAs -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <!-- Newsletter -->
            <div class="bg-gray-900 text-white p-10 rounded-3xl">
                <h3 class="text-2xl font-bold mb-4">Suscríbete a nuestro newsletter</h3>
                <p class="text-gray-400 mb-6">Recibe las últimas noticias y actualizaciones directamente en tu correo.</p>
                <form @submit.prevent="subscribe" class="flex flex-col gap-3">
                    <input v-model="email" type="email" name="email" id="email-subscribe" autocomplete="email" placeholder="Tu correo electrónico" class="px-4 py-3 rounded-xl bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-primary focus:border-primary" required />
                    <button type="submit" class="bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-600 transition">
                        Suscribirse
                    </button>
                    <p v-if="subscribeStatus" class="text-sm text-green-400 mt-2">{{ subscribeStatus }}</p>
                </form>
            </div>

            <!-- WhatsApp CTA -->
            <div class="bg-green-600 text-white p-10 rounded-3xl flex flex-col justify-center items-center text-center">
                <h3 class="text-2xl font-bold mb-4">¿Tienes dudas?</h3>
                <p class="text-white/90 mb-8">Contáctanos directamente por WhatsApp para una atención personalizada.</p>
                 <a v-if="siteStore.site?.socials?.whatsapp" :href="siteStore.site.socials.whatsapp" target="_blank" 
                  class="inline-flex items-center gap-3 bg-white text-green-600 text-lg font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition shadow-xl transform hover:-translate-y-1">
                   <span class="text-2xl">💬</span> Chat en WhatsApp
               </a>
               <NuxtLink v-else to="/contacto" class="underline hover:text-white/80">Ir a contacto</NuxtLink>
            </div>
        </section>

    </div>
  </div>
</template>
