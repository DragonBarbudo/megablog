<script setup lang="ts">
import { useSiteStore } from '~/stores/site';

const siteStore = useSiteStore();

// Watch for site changes and update CSS variables
watchEffect(() => {
  if (import.meta.client && siteStore.site?.theme_config) {
    const theme = siteStore.site.theme_config;
    const root = document.documentElement;
    
    // Set colors
    if (theme.primaryColor) root.style.setProperty('--color-primary', theme.primaryColor);
    else root.style.setProperty('--color-primary', '#3B82F6'); // Default Blue

    if (theme.secondaryColor) root.style.setProperty('--color-secondary', theme.secondaryColor);
    else root.style.setProperty('--color-secondary', '#10B981'); // Default Green

    if (theme.accentColor) root.style.setProperty('--color-accent', theme.accentColor);
    else root.style.setProperty('--color-accent', '#F59E0B'); // Default Amber
    
    // Default surface/text if not provided
    root.style.setProperty('--color-surface', '#FFFFFF');
    root.style.setProperty('--color-text', '#1F2937');

    // Set font (could import from Google Fonts dynamically if we want, but simplistic for now)
    if (theme.fontFamily) root.style.setProperty('--font-family', theme.fontFamily);
    else root.style.setProperty('--font-family', 'Inter');
  }
});

useHead({
  title: computed(() => siteStore.site?.name || 'Loading...'),
  meta: [
    { name: 'description', content: computed(() => siteStore.site?.description || '') }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-surface text-text font-sans dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
