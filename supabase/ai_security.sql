-- Server-side daily quotas for paid external API calls.
create table if not exists public.ai_usage (
    user_id      uuid not null references auth.users(id) on delete cascade,
    feature      text not null,
    period_start date not null default current_date,
    requests     integer not null default 0 check (requests >= 0),
    updated_at   timestamptz not null default now(),
    primary key (user_id, feature, period_start)
);

alter table public.ai_usage enable row level security;

-- Edge functions call this with the user's JWT. No client can read or directly
-- edit usage rows, and the increment is atomic so parallel requests cannot race.
create or replace function public.consume_ai_quota(p_feature text, p_daily_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_requests integer;
begin
    if v_user_id is null then return false; end if;
    if p_feature !~ '^[a-z0-9-]{1,40}$' then return false; end if;
    if p_daily_limit < 1 or p_daily_limit > 1000 then return false; end if;

    insert into public.ai_usage (user_id, feature, period_start, requests)
    values (v_user_id, p_feature, current_date, 1)
    on conflict (user_id, feature, period_start) do update
       set requests = public.ai_usage.requests + 1,
           updated_at = now()
     where public.ai_usage.requests < p_daily_limit
    returning requests into v_requests;

    return v_requests is not null and v_requests <= p_daily_limit;
end;
$$;

revoke all on function public.consume_ai_quota(text, integer) from public, anon;
grant execute on function public.consume_ai_quota(text, integer) to authenticated;
