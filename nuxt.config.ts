// Shim for deprecated SUPABASE_SERVICE_KEY warning
if (process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_SECRET_KEY) {
  process.env.SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_KEY;
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app',
  serverDir: 'app/server',
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/google-fonts'
  ],

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
      Merriweather: [300, 400, 700],
    },
    display: 'swap'
  },
  supabase: {
    redirect: false
  },
  runtimeConfig: {
    // Expose keys to server-side
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY, // Keep for backward compat code
    openaiApiKey: process.env.OPENAI_API_KEY,
    falKey: process.env.FAL_KEY,
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareToken: process.env.CLOUDFLARE_TOKEN,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },
  routeRules: {
    '/': { prerender: true },
    '/**': { prerender: true }, // Prerender everything
    '/api/**': { isr: false }   // Ensure APIs remain as functions
  }
})
