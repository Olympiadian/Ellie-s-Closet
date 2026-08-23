create extension if not exists "pgcrypto";

create type public.clothing_category as enum (
  'tops',
  'bottoms',
  'dresses',
  'outerwear',
  'shoes',
  'bags',
  'accessories',
  'jewelry',
  'activewear',
  'swimwear',
  'loungewear',
  'other'
);

create type public.processing_status as enum (
  'uploading',
  'processing',
  'ready',
  'needs_review',
  'failed'
);

create type public.image_role as enum ('front', 'back', 'detail', 'outfit');
create type public.outfit_photo_type as enum ('worn', 'laid_out', 'hanging');

create table public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  category public.clothing_category not null,
  subcategory text,
  primary_color text not null,
  secondary_color text,
  pattern text,
  material text,
  seasons text[] not null default '{}',
  occasions text[] not null default '{}',
  fit text,
  formality text,
  favorite boolean not null default false,
  archived boolean not null default false,
  ai_confidence numeric(4, 3) check (ai_confidence between 0 and 1),
  processing_status public.processing_status not null default 'uploading',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.item_images (
  id uuid primary key default gen_random_uuid(),
  clothing_item_id uuid not null references public.clothing_items(id) on delete cascade,
  role public.image_role not null default 'front',
  original_path text not null,
  thumbnail_path text,
  background_removed_path text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  created_at timestamptz not null default now()
);

create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  occasion text,
  group_name text,
  notes text,
  favorite boolean not null default false,
  real_photo_path text,
  photo_type public.outfit_photo_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  clothing_item_id uuid not null references public.clothing_items(id) on delete cascade,
  slot text not null,
  display_order smallint not null default 0,
  primary key (outfit_id, clothing_item_id)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  kind text not null default 'custom',
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.clothing_item_tags (
  clothing_item_id uuid not null references public.clothing_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (clothing_item_id, tag_id)
);

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  clothing_item_id uuid references public.clothing_items(id) on delete cascade,
  job_type text not null check (job_type in ('item_index', 'background_removal', 'outfit_match')),
  source_image_path text not null,
  status public.processing_status not null default 'uploading',
  confidence numeric(4, 3) check (confidence between 0 and 1),
  error_message text,
  review_reason text,
  retry_count smallint not null default 0 check (retry_count >= 0),
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clothing_items_owner_category_idx
  on public.clothing_items (owner_id, category)
  where archived = false;
create index clothing_items_owner_created_idx
  on public.clothing_items (owner_id, created_at desc);
create index outfits_owner_created_idx
  on public.outfits (owner_id, created_at desc);
create index processing_jobs_owner_status_idx
  on public.processing_jobs (owner_id, status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_clothing_items_updated_at
before update on public.clothing_items
for each row execute function public.set_updated_at();

create trigger set_outfits_updated_at
before update on public.outfits
for each row execute function public.set_updated_at();

create trigger set_processing_jobs_updated_at
before update on public.processing_jobs
for each row execute function public.set_updated_at();

alter table public.clothing_items enable row level security;
alter table public.item_images enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.tags enable row level security;
alter table public.clothing_item_tags enable row level security;
alter table public.processing_jobs enable row level security;

create policy "owners manage clothing items"
on public.clothing_items for all to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "owners manage item images"
on public.item_images for all to authenticated
using (
  exists (
    select 1 from public.clothing_items
    where clothing_items.id = item_images.clothing_item_id
      and clothing_items.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.clothing_items
    where clothing_items.id = item_images.clothing_item_id
      and clothing_items.owner_id = auth.uid()
  )
);

create policy "owners manage outfits"
on public.outfits for all to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "owners manage outfit items"
on public.outfit_items for all to authenticated
using (
  exists (
    select 1 from public.outfits
    where outfits.id = outfit_items.outfit_id
      and outfits.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.outfits
    where outfits.id = outfit_items.outfit_id
      and outfits.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.clothing_items
    where clothing_items.id = outfit_items.clothing_item_id
      and clothing_items.owner_id = auth.uid()
  )
);

create policy "owners manage tags"
on public.tags for all to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "owners manage item tags"
on public.clothing_item_tags for all to authenticated
using (
  exists (
    select 1 from public.clothing_items
    where clothing_items.id = clothing_item_tags.clothing_item_id
      and clothing_items.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.clothing_items
    where clothing_items.id = clothing_item_tags.clothing_item_id
      and clothing_items.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = clothing_item_tags.tag_id
      and tags.owner_id = auth.uid()
  )
);

create policy "owners manage processing jobs"
on public.processing_jobs for all to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('wardrobe-originals', 'wardrobe-originals', false, 12582912, array['image/jpeg', 'image/png', 'image/webp']),
  ('wardrobe-processed', 'wardrobe-processed', false, 12582912, array['image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "owners read wardrobe images"
on storage.objects for select to authenticated
using (
  bucket_id in ('wardrobe-originals', 'wardrobe-processed')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "owners upload wardrobe images"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('wardrobe-originals', 'wardrobe-processed')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "owners update wardrobe images"
on storage.objects for update to authenticated
using (
  bucket_id in ('wardrobe-originals', 'wardrobe-processed')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('wardrobe-originals', 'wardrobe-processed')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "owners delete wardrobe images"
on storage.objects for delete to authenticated
using (
  bucket_id in ('wardrobe-originals', 'wardrobe-processed')
  and (storage.foldername(name))[1] = auth.uid()::text
);
