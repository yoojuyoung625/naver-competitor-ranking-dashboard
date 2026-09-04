create table if not exists collection_runs (
  id text primary key,
  scheduled_at text not null,
  started_at text,
  completed_at text,
  requested integer not null default 0,
  succeeded integer not null default 0,
  failed integer not null default 0,
  status text not null,
  message text
);

create table if not exists ranking_observations (
  id text primary key,
  run_id text references collection_runs(id),
  keyword text not null,
  device text not null check (device in ('PC', 'MOBILE')),
  observed_at text not null,
  company text not null,
  rank real,
  placement text not null,
  screenshot_path text,
  status text not null,
  collector_version text not null,
  created_at text not null default current_timestamp
);

create index if not exists idx_observations_filter
on ranking_observations(keyword, device, observed_at, company);
