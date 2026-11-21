-- Read-only note sharing: a revocable link per note, an access level, and an
-- invite list. Run once in the Supabase dashboard after 0001_notes.sql.

alter table public.notes
  add column if not exists share_token uuid not null default gen_random_uuid(),
  add column if not exists share_access text not null default 'private';

alter table public.notes
  drop constraint if exists notes_share_access_check;
alter table public.notes
  add constraint notes_share_access_check
  check (share_access in ('private', 'public', 'invited'));

create unique index if not exists notes_share_token_idx on public.notes (share_token);

create table if not exists public.note_share_invites (
  note_id uuid not null references public.notes (id) on delete cascade,
  email text not null check (email = lower(email) and position('@' in email) > 1),
  created_at timestamptz not null default now(),
  primary key (note_id, email)
);

alter table public.note_share_invites enable row level security;

drop policy if exists "Owners can read invites" on public.note_share_invites;
create policy "Owners can read invites"
  on public.note_share_invites for select
  to authenticated
  using (exists (
    select 1 from public.notes n
    where n.id = note_id and n.user_id = (select auth.uid())
  ));

drop policy if exists "Owners can add invites" on public.note_share_invites;
create policy "Owners can add invites"
  on public.note_share_invites for insert
  to authenticated
  with check (exists (
    select 1 from public.notes n
    where n.id = note_id and n.user_id = (select auth.uid())
  ));

drop policy if exists "Owners can remove invites" on public.note_share_invites;
create policy "Owners can remove invites"
  on public.note_share_invites for delete
  to authenticated
  using (exists (
    select 1 from public.notes n
    where n.id = note_id and n.user_id = (select auth.uid())
  ));

-- Notes RLS stays owner-only. Shared reads go through this function, which
-- returns a single note by token only when the caller is allowed to see it.
-- Invitees are matched against their *confirmed* account email, so signing up
-- with someone else's address without verifying it grants nothing.
create or replace function public.get_shared_note(token uuid)
returns table (
  id uuid,
  title text,
  icon text,
  content jsonb,
  share_access text,
  updated_at timestamptz,
  is_owner boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select n.id, n.title, n.icon, n.content, n.share_access, n.updated_at,
         n.user_id = auth.uid() as is_owner
  from public.notes n
  where n.share_token = token
    and (
      n.user_id = auth.uid()
      or n.share_access = 'public'
      or (
        n.share_access = 'invited'
        and exists (
          select 1
          from public.note_share_invites i
          join auth.users u on lower(u.email) = i.email
          where i.note_id = n.id
            and u.id = auth.uid()
            and u.email_confirmed_at is not null
        )
      )
    );
$$;

revoke all on function public.get_shared_note(uuid) from public;
grant execute on function public.get_shared_note(uuid) to anon, authenticated;
