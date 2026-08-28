create table if not exists public.activities (
  id text primary key,
  title text not null,
  slug text not null,
  description text not null default '',
  category text not null default '',
  date timestamptz not null,
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_images (
  id text primary key,
  activity_id text not null references public.activities(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  event text not null,
  description text not null default '',
  level text not null default '',
  year integer not null,
  winner text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id text primary key,
  name text not null,
  position text not null default '',
  category text not null default '',
  gender text not null default '',
  photo_url text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'default',
  site_name text not null default 'RohisWeb',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);