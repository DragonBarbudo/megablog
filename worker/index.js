/**
 * Cloudflare Worker to trigger content generation
 * Schedule this using Cron Triggers in Cloudflare Dashboard.
 */

export default {
  async scheduled(event, env, ctx) {
    // The Netlify Site URL (Main site)
    // Replace with your actual Netlify URL
    const API_URL = 'https://YOUR-SITE.netlify.app/api/cron/generate';
    // Use the CLOUDFLARE_TOKEN you set in Netlify env
    const TOKEN = 'X940Axz82JGFlYyOd0vWluKqyS5qksaxy7fMpDiY'; 

    console.log('Triggering content generation...');
    
    try {
      const response = await fetch(`${API_URL}?token=${TOKEN}`, {
          method: 'GET'
      });
      const data = await response.json();
      console.log('Result:', JSON.stringify(data));
    } catch (e) {
      console.error('Error triggering generation:', e);
    }
  }
};
