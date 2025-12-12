export interface Site {
    id: string;
    domain: string;
    name: string;
    description: string | null;
    theme_config: ThemeConfig;
    socials: Record<string, string>;
    created_at: string;
}

export interface ThemeConfig {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    logoUrl?: string;
    // Add other theme properties as needed
}

export interface Page {
    id: string;
    site_id: string;
    slug: string;
    title: string;
    content: string;
    seo_tags: Record<string, any>;
    created_at: string;
}

export interface Post {
    id: string;
    site_id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    cover_image_url: string | null;
    published_at: string;
    seo_tags: Record<string, any>;
    created_at: string;
}
