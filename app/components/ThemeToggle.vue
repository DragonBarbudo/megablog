
<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';

const { isDark, toggleTheme, initTheme } = useTheme();

onMounted(() => {
    initTheme();
});
</script>

<template>
  <button 
    @click="toggleTheme" 
    class="p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
    :class="isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
    aria-label="Toggle Theme"
  >
    <Moon v-if="isDark" class="w-5 h-5" />
    <Sun v-else class="w-5 h-5 text-amber-500" />
  </button>
</template>
