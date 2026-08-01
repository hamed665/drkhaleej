-- P15 hosted compatibility correction.
-- The canonical Sitemap readers and promotion contracts use `index` only after
-- an independently reviewed Queue is already `index_eligible`. The original
-- staging constraint predated that terminal state and omitted the value.

alter table public.import_publish_queue
  drop constraint if exists import_publish_queue_index_policy_check;

alter table public.import_publish_queue
  add constraint import_publish_queue_index_policy_check
  check (index_policy in ('noindex', 'index_eligible', 'index', 'blocked'));

comment on constraint import_publish_queue_index_policy_check
  on public.import_publish_queue is
  'Fail-closed Queue policy states: noindex, independently index-eligible, reviewed Sitemap index, or blocked.';
