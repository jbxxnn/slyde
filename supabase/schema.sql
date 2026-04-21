create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.instagram_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ig_user_id text not null,
  username text,
  page_id text,
  page_name text,
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'needs_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, ig_user_id)
);

create table if not exists public.instagram_account_tokens (
  instagram_account_id uuid primary key references public.instagram_accounts(id) on delete cascade,
  access_token text not null,
  token_type text not null default 'bearer',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  instagram_account_id uuid not null references public.instagram_accounts(id) on delete cascade,
  trigger_type text not null check (trigger_type in ('dm_keyword', 'comment_keyword')),
  keyword text not null,
  match_type text not null default 'contains' check (match_type in ('contains', 'exact')),
  response_text text not null,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  instagram_account_id uuid references public.instagram_accounts(id) on delete set null,
  automation_rule_id uuid references public.automation_rules(id) on delete set null,
  trigger_type text not null,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  input_text text,
  payload jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  instagram_account_id uuid references public.instagram_accounts(id) on delete set null,
  provider text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  state text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  instagram_account_id uuid not null references public.instagram_accounts(id) on delete cascade,
  ig_scoped_user_id text not null,
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (instagram_account_id, ig_scoped_user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  instagram_account_id uuid references public.instagram_accounts(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_workspaces_updated_at on public.workspaces;
create trigger touch_workspaces_updated_at
before update on public.workspaces
for each row execute function public.touch_updated_at();

drop trigger if exists touch_instagram_accounts_updated_at on public.instagram_accounts;
create trigger touch_instagram_accounts_updated_at
before update on public.instagram_accounts
for each row execute function public.touch_updated_at();

drop trigger if exists touch_instagram_account_tokens_updated_at on public.instagram_account_tokens;
create trigger touch_instagram_account_tokens_updated_at
before update on public.instagram_account_tokens
for each row execute function public.touch_updated_at();

drop trigger if exists touch_automation_rules_updated_at on public.automation_rules;
create trigger touch_automation_rules_updated_at
before update on public.automation_rules
for each row execute function public.touch_updated_at();

drop trigger if exists touch_contacts_updated_at on public.contacts;
create trigger touch_contacts_updated_at
before update on public.contacts
for each row execute function public.touch_updated_at();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.instagram_accounts enable row level security;
alter table public.instagram_account_tokens enable row level security;
alter table public.automation_rules enable row level security;
alter table public.automation_runs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.oauth_states enable row level security;
alter table public.contacts enable row level security;
alter table public.messages enable row level security;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

drop policy if exists "Members can view workspaces" on public.workspaces;
create policy "Members can view workspaces"
on public.workspaces for select
using (created_by = auth.uid() or public.is_workspace_member(id));

drop policy if exists "Authenticated users can create workspaces" on public.workspaces;
create policy "Authenticated users can create workspaces"
on public.workspaces for insert
with check (created_by = auth.uid());

drop policy if exists "Members can update workspaces" on public.workspaces;
create policy "Members can update workspaces"
on public.workspaces for update
using (public.is_workspace_member(id));

drop policy if exists "Users can view their memberships" on public.workspace_members;
create policy "Users can view their memberships"
on public.workspace_members for select
using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

drop policy if exists "Users can create own owner membership" on public.workspace_members;
create policy "Users can create own owner membership"
on public.workspace_members for insert
with check (user_id = auth.uid());

drop policy if exists "Members can read instagram accounts" on public.instagram_accounts;
create policy "Members can read instagram accounts"
on public.instagram_accounts for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage instagram accounts" on public.instagram_accounts;
create policy "Members can manage instagram accounts"
on public.instagram_accounts for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "No direct token access" on public.instagram_account_tokens;
create policy "No direct token access"
on public.instagram_account_tokens for all
using (false)
with check (false);

drop policy if exists "Members can manage automation rules" on public.automation_rules;
create policy "Members can manage automation rules"
on public.automation_rules for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can read automation runs" on public.automation_runs;
create policy "Members can read automation runs"
on public.automation_runs for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can read webhook events" on public.webhook_events;
create policy "Members can read webhook events"
on public.webhook_events for select
using (workspace_id is not null and public.is_workspace_member(workspace_id));

drop policy if exists "Users can manage oauth states" on public.oauth_states;
create policy "Users can manage oauth states"
on public.oauth_states for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Members can read contacts" on public.contacts;
create policy "Members can read contacts"
on public.contacts for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can read messages" on public.messages;
create policy "Members can read messages"
on public.messages for select
using (public.is_workspace_member(workspace_id));
