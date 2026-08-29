# Glowing Carnival

Minimalist meme sharing app built with React, Vite, Tailwind CSS, `lucide-react`, and Supabase.

## 1. Recommended Folder Structure

```text
glowing-carnival/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── routes.jsx
│   │   └── providers.jsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthModal.jsx
│   │   │   └── AuthForm.jsx
│   │   ├── feed/
│   │   │   ├── MemeCard.jsx
│   │   │   ├── MemeGrid.jsx
│   │   │   ├── FeedToolbar.jsx
│   │   │   └── MemeSkeleton.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── PageContainer.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Dialog.jsx
│   │       └── EmptyState.jsx
│   ├── features/
│   │   ├── auth/
│   │   │   └── useAuth.js
│   │   ├── memes/
│   │   │   ├── memeApi.js
│   │   │   └── useMemes.js
│   │   ├── comments/
│   │   │   └── commentApi.js
│   │   └── submissions/
│   │       ├── submissionApi.js
│   │       └── useSubmissionUpload.js
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── SubmitMemePage.jsx
│   │   ├── AdminPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── share.js
│   ├── styles/
│   │   └── index.css
│   └── main.jsx
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

Keep database access in `features/*/*Api.js`, UI state in hooks, and reusable presentation components free of Supabase-specific code. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` belong in the frontend environment. Never expose a service-role key in Vite.

## 2. Supabase Schema

Run the following in the Supabase SQL editor or save it as `supabase/migrations/0001_initial_schema.sql`.

The admin check reads the authenticated user's Supabase `app_metadata.role`. Set that claim to `admin` for the owner account using a trusted server or the Supabase dashboard. Do not use user-editable `user_metadata` for authorization.

```sql
create extension if not exists pgcrypto;

create type public.submission_status as enum ('pending', 'approved', 'rejected');

create table public.memes (
	id uuid primary key default gen_random_uuid(),
	title text not null check (char_length(trim(title)) between 1 and 160),
	image_url text not null,
	credit_name text,
	credit_handle text,
	submitted_by uuid references auth.users(id) on delete set null,
	created_at timestamptz not null default now()
);

create table public.submissions (
	id uuid primary key default gen_random_uuid(),
	submitted_by uuid not null references auth.users(id) on delete cascade,
	title text not null check (char_length(trim(title)) between 1 and 160),
	image_path text not null,
	credit_name text,
	credit_handle text,
	status public.submission_status not null default 'pending',
	rejection_reason text,
	reviewed_by uuid references auth.users(id) on delete set null,
	reviewed_at timestamptz,
	created_at timestamptz not null default now()
);

create table public.comments (
	id uuid primary key default gen_random_uuid(),
	meme_id uuid not null references public.memes(id) on delete cascade,
	user_id uuid not null references auth.users(id) on delete cascade,
	body text not null check (char_length(trim(body)) between 1 and 1000),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table public.likes (
	meme_id uuid not null references public.memes(id) on delete cascade,
	user_id uuid not null references auth.users(id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (meme_id, user_id)
);

create index memes_created_at_idx on public.memes (created_at desc);
create index comments_meme_id_created_at_idx on public.comments (meme_id, created_at desc);
create index likes_meme_id_idx on public.likes (meme_id);
create index submissions_status_created_at_idx on public.submissions (status, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

alter table public.memes enable row level security;
alter table public.submissions enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

create policy "Anyone can view published memes"
	on public.memes for select using (true);
create policy "Admins can manage memes"
	on public.memes for all using (public.is_admin()) with check (public.is_admin());

create policy "Submitters can create submissions"
	on public.submissions for insert to authenticated
	with check (auth.uid() = submitted_by);
create policy "Submitters can view their submissions"
	on public.submissions for select to authenticated
	using (auth.uid() = submitted_by or public.is_admin());
create policy "Admins can manage submissions"
	on public.submissions for update to authenticated
	using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can view comments"
	on public.comments for select using (true);
create policy "Users can create their own comments"
	on public.comments for insert to authenticated
	with check (auth.uid() = user_id);
create policy "Users can edit their own comments"
	on public.comments for update to authenticated
	using (auth.uid() = user_id or public.is_admin())
	with check (auth.uid() = user_id or public.is_admin());
create policy "Users can delete their own comments"
	on public.comments for delete to authenticated
	using (auth.uid() = user_id or public.is_admin());

create policy "Anyone can view likes"
	on public.likes for select using (true);
create policy "Users can like as themselves"
	on public.likes for insert to authenticated
	with check (auth.uid() = user_id);
create policy "Users can remove their own likes"
	on public.likes for delete to authenticated
	using (auth.uid() = user_id);

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
	if not public.is_admin() then
		raise exception 'Only admins can approve submissions';
	end if;

	select * into submission
	from public.submissions
	where id = submission_id and status = 'pending'
	for update;

	if not found then
		raise exception 'Pending submission not found';
	end if;

	insert into public.memes (title, image_url, credit_name, credit_handle, submitted_by)
	values (
		submission.title,
		storage.get_public_url('memes', submission.image_path),
		submission.credit_name,
		submission.credit_handle,
		submission.submitted_by
	)
	returning * into published_meme;

	update public.submissions
	set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
	where id = submission.id;

	return published_meme;
end;
$$;

create or replace function public.reject_submission(submission_id uuid, reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	if not public.is_admin() then
		raise exception 'Only admins can reject submissions';
	end if;

	update public.submissions
	set status = 'rejected', rejection_reason = reason,
			reviewed_by = auth.uid(), reviewed_at = now()
	where id = submission_id and status = 'pending';

	if not found then
		raise exception 'Pending submission not found';
	end if;
end;
$$;
```

### Storage setup

Create a **private** Storage bucket named `memes`. Store the uploaded object path in `submissions.image_path`. Add Storage policies that allow authenticated users to insert objects under their own user ID prefix, and admins to read/delete review objects. The approval function should be called with `supabase.rpc('approve_submission', { submission_id })`; it publishes only after the admin check and row lock succeed.

For a public feed, either make the bucket public and use `storage.get_public_url('memes', path)`, or replace that expression with a signed-URL strategy in the API layer. Keep the bucket private when submissions may contain unreleased content.