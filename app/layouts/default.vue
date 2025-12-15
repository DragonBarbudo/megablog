<script setup lang="ts">
import { useSiteStore } from '~/stores/site';
import { Twitter, Facebook, Instagram, Github, Mail } from 'lucide-vue-next';

const siteStore = useSiteStore();
const currentYear = new Date().getFullYear();

// Simple icon mapping
const getIcon = (network: string) => {
    switch(network.toLowerCase()) {
        case 'twitter': return Twitter;
        case 'facebook': return Facebook;
        case 'instagram': return Instagram;
        case 'github': return Github;
        default: return Mail; 
    }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50 font-sans selection:bg-primary selection:text-white dark:bg-gray-950 dark:text-gray-100">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl transition-all supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:border-gray-800 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div class="container mx-auto px-6 h-24 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <img v-if="siteStore.site?.theme_config?.logoUrl" :src="siteStore.site.theme_config.logoUrl" :alt="siteStore.site?.name" class="h-20 w-auto" />
          <span v-else class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent group-hover:opacity-80 transition">
            {{ siteStore.site?.name || 'My Blog' }}
          </span>
        </NuxtLink>
        
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink to="/" class="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-200 dark:hover:text-primary-300">Inicio</NuxtLink>
          <NuxtLink to="/nosotros" class="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-200 dark:hover:text-primary-300">Nosotros</NuxtLink>
          <NuxtLink to="/experiencias" class="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-200 dark:hover:text-primary-300">Experiencias</NuxtLink>
          <NuxtLink to="/contacto" class="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-200 dark:hover:text-primary-300">Contacto</NuxtLink>
          <ThemeToggle />
        </nav>
        
        <!-- Mobile Menu Button (Placeholder for now) -->
        <div class="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button class="text-gray-700 dark:text-gray-200">
                <span class="sr-only">Menu</span>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div class="container mx-auto px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <!-- Brand Info -->
          <div class="text-center md:text-left">
             <img v-if="siteStore.site?.theme_config?.logoUrl" :src="siteStore.site.theme_config.logoUrl" :alt="siteStore.site?.name" class="h-32 w-auto mx-auto md:mx-0 mb-6" />
             <h3 class="font-bold text-lg text-gray-900 dark:text-white" v-else>{{ siteStore.site?.name }}</h3>
             <p class="text-sm text-gray-500 mt-1 mb-4 dark:text-gray-400">{{ siteStore.site?.description }}</p>
             
             <!-- Social Icons -->
             <div class="flex justify-center md:justify-start space-x-4 mb-6" v-if="siteStore.site?.socials">
                <template v-for="(url, network) in siteStore.site.socials" :key="network">
                    <a v-if="['twitter', 'facebook', 'instagram', 'github'].includes(network)" 
                       :href="url" target="_blank" rel="noopener" 
                       class="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                        <component :is="getIcon(network)" class="w-4 h-4" />
                    </a>
                </template>
             </div>
          </div>

          <!-- Quick Links -->
          <div class="text-center md:text-left">
                <h4 class="font-semibold text-gray-900 mb-4">Explorar</h4>
                <div class="flex flex-col space-y-2 text-sm text-gray-500">
                    <NuxtLink to="/" class="hover:text-primary">Inicio</NuxtLink>
                    <NuxtLink to="/nosotros" class="hover:text-primary">Nosotros</NuxtLink>
                    <NuxtLink to="/experiencias" class="hover:text-primary">Experiencias</NuxtLink>
                    <NuxtLink to="/contacto" class="hover:text-primary">Contacto</NuxtLink>
                </div>
          </div>
          
          <!-- Contact Info -->
          <div class="text-center md:text-left">
             <h4 class="font-semibold text-gray-900 mb-4">Contacto</h4>
             <div class="flex flex-col space-y-3 text-sm text-gray-500" v-if="siteStore.site?.socials">
                 <a v-if="siteStore.site.socials.email" :href="`mailto:${siteStore.site.socials.email}`" class="flex items-center justify-center md:justify-start gap-2 hover:text-primary">
                     <Mail class="w-4 h-4" /> {{ siteStore.site.socials.email }}
                 </a>
                 <a v-if="siteStore.site.socials.phone" :href="`tel:${siteStore.site.socials.phone}`" class="flex items-center justify-center md:justify-start gap-2 hover:text-primary">
                     <span>📞</span> {{ siteStore.site.socials.phone }}
                 </a>
                 <a v-if="siteStore.site.socials.whatsapp" :href="siteStore.site.socials.whatsapp" target="_blank" class="flex items-center justify-center md:justify-start gap-2 hover:text-green-600">
                     <span class="text-green-500 font-bold">WA</span> WhatsApp
                 </a>
             </div>
          </div>
        </div>
        
        <div class="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            <p>&copy; {{ currentYear }} {{ siteStore.site?.name }}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
