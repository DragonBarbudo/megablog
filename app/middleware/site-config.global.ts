import { useSiteStore } from '~/app/stores/site';

export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) {
        const siteStore = useSiteStore();
        const event = useRequestEvent();
        const host = event?.node.req.headers.host || 'localhost';

        await siteStore.fetchSite(host);

        if (!siteStore.site && to.path !== '/404') {
            // Redirect to a 404 or maintenance page if site not found
            // But for now we just let it pass, UI will show "Site Not Configured"
            console.warn(`No site found for host: ${host}`);
        }
    }
});
