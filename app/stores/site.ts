import { defineStore } from 'pinia';
import type { Site } from '~/types';

export const useSiteStore = defineStore('site', {
    state: () => ({
        site: null as Site | null,
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async fetchSite(domain: string) {
            if (this.site && this.site.domain === domain) return;

            this.loading = true;
            try {
                const client = useSupabaseClient();

                // Remove port from domain if present (for local testing)
                // e.g. localhost:3000 -> localhost
                const cleanDomain = domain.split(':')[0];

                const { data, error } = await client
                    .from('sites')
                    .select('*')
                    .eq('domain', cleanDomain)
                    .single();

                if (error) throw error;

                this.site = data as Site;
            } catch (e: any) {
                this.error = e.message;
                console.error('Failed to fetch site config:', e);
                // Fallback for development/testing if not found?
                // For now, we leave it null and handle in UI
            } finally {
                this.loading = false;
            }
        }
    }
});
