create extension if not exists pgcrypto;

do $$ begin
  create type public.submission_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.memes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  image_url text not null,
  user_id uuid references auth.users(id) on delete set null,
  author_credit text,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  image_url text not null,
  submitter_name text,
  submitter_handle text,
  status public.submission_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  meme_id uuid not null references public.memes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  meme_id uuid not null references public.memes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (meme_id, user_id)
);

alter table public.memes enable row level security;
alter table public.submissions enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

create policy "Published memes are public" on public.memes for select using (true);
create policy "Authenticated users submit" on public.submissions for insert to authenticated with check (true);
create policy "Admins review submissions" on public.submissions for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Comments are public" on public.comments for select using (true);
create policy "Users add their comments" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "Likes are public" on public.likes for select using (true);
create policy "Users add their likes" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users remove their likes" on public.likes for delete to authenticated using (auth.uid() = user_id);

create index if not exists memes_created_at_idx on public.memes(created_at desc);
create index if not exists submissions_status_idx on public.submissions(status, created_at desc);
create index if not exists comments_meme_idx on public.comments(meme_id, created_at desc);
create index if not exists likes_meme_idx on public.likes(meme_id);

create or replace function public.approve_submission(submission_id uuid)
returns public.memes
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.submissions;
  published_meme public.memes;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Only admins can approve submissions';
  end if;

  select * into submission from public.submissions
  where id = submission_id and status = 'pending' for update;
  if not found then raise exception 'Pending submission not found'; end if;

  insert into public.memes (title, image_url, user_id, author_credit)
  values (submission.title, submission.image_url, null, coalesce(submission.submitter_handle, submission.submitter_name))
  returning * into published_meme;

  update public.submissions set status = 'approved' where id = submission.id;
  return published_meme;
end;
$$;

create or replace function public.reject_submission(submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Only admins can reject submissions';
  end if;
  update public.submissions set status = 'rejected'
  where id = submission_id and status = 'pending';
  if not found then raise exception 'Pending submission not found'; end if;
end;
$$;
