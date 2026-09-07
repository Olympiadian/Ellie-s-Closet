-- Additive single-household app storage. Existing wardrobe tables are untouched.
create table if not exists public.closet_records (
  kind text not null check (kind in ('item','build','plan','message','request','activity','settings','scan','session','invite')),
  id text not null,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  primary key (kind, id)
);
alter table public.closet_records enable row level security;
revoke all on public.closet_records from anon, authenticated;
grant all on public.closet_records to service_role;
create index if not exists closet_records_created on public.closet_records(kind, created_at desc);

create or replace function public.closet_patch(record_kind text, record_id text, patch jsonb)
returns jsonb language sql set search_path = public as $$
  update closet_records set data = data || patch
  where kind = record_kind and id = record_id returning data;
$$;
revoke all on function public.closet_patch(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.closet_patch(text,text,jsonb) to service_role;

create or replace function public.closet_consume_invite(invite_id text)
returns jsonb language sql set search_path = public as $$
  delete from closet_records where kind = 'invite' and id = invite_id
  and (data->>'expiresAt')::timestamptz > now() returning data;
$$;
revoke all on function public.closet_consume_invite(text) from public, anon, authenticated;
grant execute on function public.closet_consume_invite(text) to service_role;

create table if not exists public.closet_rate_limits (
  key text primary key, attempts integer not null default 1,
  expires_at timestamptz not null
);
alter table public.closet_rate_limits enable row level security;
revoke all on public.closet_rate_limits from anon, authenticated;
grant all on public.closet_rate_limits to service_role;
create or replace function public.closet_rate_limit(bucket text, max_attempts integer, window_seconds integer)
returns boolean language plpgsql set search_path = public as $$
declare total integer;
begin
  insert into closet_rate_limits(key, attempts, expires_at)
  values(bucket, 1, now() + make_interval(secs => window_seconds))
  on conflict(key) do update set
    attempts = case when closet_rate_limits.expires_at <= now() then 1 else closet_rate_limits.attempts + 1 end,
    expires_at = case when closet_rate_limits.expires_at <= now() then now() + make_interval(secs => window_seconds) else closet_rate_limits.expires_at end
  returning attempts into total;
  return total <= max_attempts;
end;
$$;
revoke all on function public.closet_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.closet_rate_limit(text,integer,integer) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('closet-private','closet-private',false,20971520,
array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'])
on conflict(id) do nothing;
-- No public bucket policy: signed URLs are issued only by authenticated server routes.
