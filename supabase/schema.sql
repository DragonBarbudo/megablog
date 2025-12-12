-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Sites Table
create table public.sites (
  id uuid default uuid_generate_v4() primary key,
  domain text not null unique,
  name text not null,
  description text,
  theme_config jsonb default '{}'::jsonb,
  socials jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Pages Table
create table public.pages (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade not null,
  slug text not null,
  title text not null,
  content text,
  seo_tags jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  unique(site_id, slug)
);

-- Posts Table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade not null,
  slug text not null,
  title text not null,
  excerpt text,
  content text,
  cover_image_url text,
  published_at timestamp with time zone default now(),
  seo_tags jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  unique(site_id, slug)
);

-- RLS Policies (Enable RLS but allow public read for now, write restricted or via service role)
alter table public.sites enable row level security;
alter table public.pages enable row level security;
alter table public.posts enable row level security;

-- Public read access
create policy "Allow public read access on sites" on public.sites for select using (true);
create policy "Allow public read access on pages" on public.pages for select using (true);
create policy "Allow public read access on posts" on public.posts for select using (true);

-- (Optional) Write access for service role is implicit, but we can be explicit if using anon key with specific logic. 
-- For the "builder" script, we will use the Service Key, which bypasses RLS.
