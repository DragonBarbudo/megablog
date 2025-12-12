<script setup lang="ts">
import { useSiteStore } from '~/app/stores/site';

const siteStore = useSiteStore();
const currentYear = new Date().getFullYear();
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-surface border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-bold text-primary">
          <img v-if="siteStore.site?.theme_config?.logoUrl" :src="siteStore.site.theme_config.logoUrl" :alt="siteStore.site?.name" class="h-10" />
          <span v-else>{{ siteStore.site?.name || 'My Blog' }}</span>
        </NuxtLink>
        <nav class="space-x-4">
          <NuxtLink to="/" class="text-text hover:text-primary transition">Home</NuxtLink>
          <NuxtLink to="/about" class="text-text hover:text-primary transition">About</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-white py-8">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; {{ currentYear }} {{ siteStore.site?.name || 'Company Name' }}. All rights reserved.</p>
        <div class="mt-4 flex justify-center space-x-4" v-if="siteStore.site?.socials">
          <a v-for="(url, network) in siteStore.site.socials" :key="network" :href="url" target="_blank" rel="noopener" class="capitalize hover:text-primary">
            {{ network }}
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
