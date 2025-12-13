import { useSiteStore } from '~/stores/site';

export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) {
        const siteStore = useSiteStore();
        const event = useRequestEvent();
        let host = event?.node.req.headers.host || 'localhost';

        // Developer Experience: Map localhost to example.com for checking generated site
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            // Optionally allow overriding via query param ?site=domain.com? No, simple is best.
            // We will pretend we are on example.com if no site is found for localhost
            // But better: Just hardcode the fallthrough.
            // Or check if localhost exists in DB?
            // User requested: "Lets use example.com as the default site."
            host = 'example.com';
        }

        await siteStore.fetchSite(host);

        if (!siteStore.site && to.path !== '/404') {
            // Redirect to a 404 or maintenance page if site not found
            // But for now we just let it pass, UI will show "Site Not Configured"
            console.warn(`No site found for host: ${host}`);
        }
    }
});
