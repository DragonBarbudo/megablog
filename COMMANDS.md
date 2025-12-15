# MegaBlog Management Commands

Here is a quick reference for all the administrative scripts and commands available in the project.

## 🚀 1. Build a New Site
Generates a complete site configuration, "Home", "About" (Nosotros), and initial blog posts.
It automatically generates:
- Theme colors & fonts
- SEO Descriptions & Contact Info
- "About" Team Image
- 4 Initial Blog Posts with images

```bash
npx tsx scripts/builder.ts <domain> "<Site Name>" "<Niche/Topic>"
```

**Example:**
```bash
npx tsx scripts/builder.ts tech-blog.com "TechNova" "Latest Artificial Intelligence and Gadgets"
```

---

## 🗑️ 2. Delete a Site
**WARNING**: This permanently removes the site, all its pages, posts, and **deletes all associated images** from Supabase Storage.

```bash
npx tsx scripts/delete-site.ts <site_id>
```

**Tip**: You can find the `site_id` in your Supabase `sites` table or by checking the logs after running the builder.

---

## 📝 3. Add a Single Article
Generates and publishes a single new article to an existing site. It uses AI to write the content and generate a cover image.

```bash
npx tsx scripts/add-post.ts <site_id> "<Article Title>" "<Niche/Topic>"
```

**Example:**
```bash
npx tsx scripts/add-post.ts 123e4567-e89b-12d3 "The Future of Quantum Computing" "Technology"
```

---

## 📧 4. Newsletter Migration
Run this *once* to generate the SQL needed to create the `subscribers` table if you haven't already.

```bash
npx tsx scripts/migrate-subscribers.ts
```

---

## 💻 5. Development Server
Starts the local Nuxt development server.

```bash
npm run dev
```

---

## 🌐 6. Remote API Control (Cron)
You can trigger article generation remotely using a GET request (e.g. from a cron job or browser).

**Add a specific post:**
```
https://your-site.netlify.app/api/cron/add-post?token=YOUR_CLOUDFLARE_TOKEN&domain=example.com&topic=Your_Topic_Here
```
*Requires `CLOUDFLARE_TOKEN` to be set in your Netlify environment variables.*

---

## 🎨 7. Generate/Update Logo
Generates a new minimalist logo for an existing site using AI and updates the configuration.

```bash
npx tsx scripts/update-logo.ts <domain> "[optional prompt]"
```

**Example:**
```bash
npx tsx scripts/update-logo.ts tech-blog.com "Abstract blue geometric shape, modern, flat"
```

