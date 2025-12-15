<script setup lang="ts">
import { useSiteStore } from '~/stores/site';
import { Mail, Phone, MapPin, CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-vue-next';
import { z } from 'zod';

const siteStore = useSiteStore();
const config = computed(() => siteStore.site?.theme_config?.contact_info || {});
const openFaq = ref<number | null>(null);

const toggleFaq = (index: number) => {
    openFaq.value = openFaq.value === index ? null : index;
}

// Form State
const form = ref({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
});

const errors = ref<Record<string, string>>({});
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const statusMessage = ref('');

// Schema (Client-side validation matching server)
const schema = z.object({
  name: z.string().min(2, 'El nombre es muy corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

const submitForm = async () => {
    status.value = 'loading';
    errors.value = {};
    statusMessage.value = '';

    // Client Validation
    const result = schema.safeParse(form.value);
    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        for (const key in fieldErrors) {
            errors.value[key] = fieldErrors[key]?.[0] || 'Error';
        }
        status.value = 'idle';
        return;
    }

    try {
        await $fetch('/api/contact', {
            method: 'POST',
            body: {
                ...form.value,
                site_id: siteStore.site?.id
            }
        });
        
        status.value = 'success';
        statusMessage.value = '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.';
        form.value = { name: '', company: '', email: '', phone: '', message: '' }; // Reset
    } catch (e: any) {
        status.value = 'error';
        statusMessage.value = 'Ocurrió un error al enviar. Por favor intenta de nuevo.';
        console.error(e);
    }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
      
      <!-- Hero -->
      <section class="bg-primary py-20 text-white text-center rounded-b-3xl mb-16">
          <h1 class="text-5xl font-bold mb-4">Contáctanos</h1>
          <p class="text-xl opacity-90 max-w-2xl mx-auto">Estamos listos para escucharte. Envíanos un mensaje o visítanos.</p>
      </section>

      <div class="container mx-auto px-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              
              <!-- Contact Form & Info -->
              <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <img v-if="siteStore.site?.theme_config?.logoUrl" :src="siteStore.site.theme_config.logoUrl" :alt="siteStore.site?.name" class="h-24 w-auto mb-8" />
                  <h2 class="text-2xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h2>
                  
                  <form class="space-y-4" @submit.prevent="submitForm">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                              <input id="name" name="name" v-model="form.name" type="text" autocomplete="name" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary" :class="{'border-red-500': errors.name}" placeholder="Tu nombre" />
                              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
                          </div>
                          <div>
                              <label for="company" class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                              <input id="company" name="company" v-model="form.company" type="text" autocomplete="organization" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary" placeholder="Nombre de empresa" />
                          </div>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input id="email" name="email" v-model="form.email" type="email" autocomplete="email" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary" :class="{'border-red-500': errors.email}" placeholder="correo@ejemplo.com" />
                              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
                          </div>
                          <div>
                              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
                              <input id="phone" name="phone" v-model="form.phone" type="tel" autocomplete="tel" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary" placeholder="+52 55..." />
                          </div>
                      </div>
                      <div>
                           <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                           <textarea id="message" name="message" v-model="form.message" rows="4" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary" :class="{'border-red-500': errors.message}" placeholder="¿En qué podemos ayudarte?"></textarea>
                           <p v-if="errors.message" class="text-red-500 text-xs mt-1">{{ errors.message }}</p>
                      </div>
                      
                      <button :disabled="status === 'loading'" class="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition shadow-lg shadow-primary/30 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
                          <Loader2 v-if="status === 'loading'" class="w-5 h-5 animate-spin mr-2" />
                          {{ status === 'loading' ? 'Enviando...' : 'Enviar Mensaje' }}
                      </button>

                      <div v-if="status === 'success'" class="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
                          <CheckCircle class="w-5 h-5" /> {{ statusMessage }}
                      </div>
                      <div v-if="status === 'error'" class="p-4 bg-red-50 text-red-700 rounded-xl">
                          {{ statusMessage }}
                      </div>
                  </form>

                  <div class="mt-10 pt-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div v-if="siteStore.site?.socials?.email" class="flex items-start gap-3">
                          <div class="bg-primary/10 p-2 rounded-lg text-primary"><Mail class="w-5 h-5" /></div>
                          <div>
                              <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</p>
                              <a :href="`mailto:${siteStore.site.socials.email}`" class="text-gray-900 font-medium hover:text-primary">{{ siteStore.site.socials.email }}</a>
                          </div>
                      </div>
                      <div v-if="siteStore.site?.socials?.phone" class="flex items-start gap-3">
                          <div class="bg-primary/10 p-2 rounded-lg text-primary"><Phone class="w-5 h-5" /></div>
                          <div>
                              <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Teléfono</p>
                              <a :href="`tel:${siteStore.site.socials.phone}`" class="text-gray-900 font-medium hover:text-primary">{{ siteStore.site.socials.phone }}</a>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Why Us & Coverage -->
              <div class="space-y-8">
                  <!-- Por qué nosotros -->
                  <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                      <h2 class="text-2xl font-bold text-gray-900 mb-6">¿Por qué nosotros?</h2>
                      <ul class="space-y-4" v-if="config.why_us && config.why_us.length">
                          <li v-for="(reason, i) in config.why_us" :key="i" class="flex items-start gap-3">
                              <CheckCircle class="w-6 h-6 text-secondary flex-shrink-0" />
                              <span class="text-gray-700">{{ reason }}</span>
                          </li>
                      </ul>
                      <p v-else class="text-gray-500 italic">Información de la empresa.</p>
                  </div>

                  <!-- Horarios -->
                   <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100" v-if="config.hours">
                      <h2 class="text-xl font-bold text-gray-900 mb-4">Horarios de Atención</h2>
                      <ul class="space-y-2">
                           <li v-for="(hour, i) in config.hours" :key="i" class="text-gray-600 border-b border-gray-50 last:border-0 pb-2 flex justify-between">
                               <span>{{ hour.split(':')[0] }}</span>
                               <span class="font-medium text-gray-900">{{ hour.split(':')[1] }}</span>
                           </li>
                      </ul>
                  </div>
              </div>
          </div>
          
          <!-- Coverage Layout (Map + List) -->
          <section class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-20" v-if="config.coverage">
               <div class="grid grid-cols-1 lg:grid-cols-3">
                   <div class="p-8 lg:p-12">
                       <h2 class="text-2xl font-bold text-gray-900 mb-6">Nuestra Cobertura</h2>
                       <p class="text-gray-600 mb-6">Tenemos presencia en las siguientes ubicaciones estratégicas:</p>
                       <ul class="space-y-2 mb-8">
                           <li v-for="(place, i) in config.coverage.places" :key="i" class="flex items-center gap-2 text-gray-700">
                               <MapPin class="w-4 h-4 text-primary" /> {{ place }}
                           </li>
                       </ul>
                   </div>
                   <!-- Simple Map Embed Fallback since no API key provided for mapping lib -->
                   <div class="col-span-2 bg-gray-200 min-h-[400px] relative">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameborder="0" 
                            scrolling="no" 
                            marginheight="0" 
                            marginwidth="0" 
                            style="border:0; min-height: 400px;"
                            :src="`https://www.openstreetmap.org/export/embed.html?bbox=${(config.coverage.center?.lng || -99.13) - 0.1},${(config.coverage.center?.lat || 19.43) - 0.1},${(config.coverage.center?.lng || -99.13) + 0.1},${(config.coverage.center?.lat || 19.43) + 0.1}&layer=mapnik&marker=${config.coverage.center?.lat || 19.43},${config.coverage.center?.lng || -99.13}`">
                        </iframe>
                   </div>
               </div>
          </section>

          <!-- FAQs -->
          <section class="max-w-3xl mx-auto mb-24" v-if="config.faqs">
               <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
               <div class="space-y-4">
                   <div v-for="(faq, i) in config.faqs" :key="i" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                       <button @click="toggleFaq(i)" class="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition">
                           <span class="font-bold text-gray-900">{{ faq.question }}</span>
                           <component :is="openFaq === i ? ChevronUp : ChevronDown" class="w-5 h-5 text-gray-400" />
                       </button>
                       <div v-show="openFaq === i" class="px-6 pb-6 text-gray-600 border-t border-gray-50 pt-4 leading-relaxed">
                           {{ faq.answer }}
                       </div>
                   </div>
               </div>
          </section>

          <!-- Big CTA -->
          <section class="text-center py-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl text-white shadow-2xl shadow-green-500/30">
               <h2 class="text-4xl font-bold mb-6">¿Listo para empezar?</h2>
               <p class="text-lg opacity-90 mb-10 max-w-xl mx-auto">Contáctanos directamente por WhatsApp para una atención inmediata y personalizada.</p>
               <a v-if="siteStore.site?.socials?.whatsapp" :href="siteStore.site.socials.whatsapp" target="_blank" 
                  class="inline-flex items-center gap-3 bg-white text-green-600 text-lg font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition shadow-xl transform hover:-translate-y-1">
                   <span class="text-2xl">💬</span> Contactar por WhatsApp
               </a>
          </section>

      </div>
  </div>
</template>
