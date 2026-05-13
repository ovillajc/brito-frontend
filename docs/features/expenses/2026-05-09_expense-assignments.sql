begin;

-- ─────────────────────────────────────────────────────────────
-- Submódulo: Asignación de Gastos (viáticos/anticipos) + Comprobación
-- ─────────────────────────────────────────────────────────────

create table if not exists public.expense_advances (
    id uuid primary key default gen_random_uuid (),
    trip_id uuid null references public.trips (id),
    unit_assembly_id uuid null references public.unit_assemblies (id),
    operator_id uuid not null references public.employees (id),
    truck_id uuid null references public.trucks (id),
    trailer_id uuid null references public.trailers (id),
    amount numeric not null check (amount > 0),
    method text not null check (
        method in ('cash', 'transfer')
    ),
    assigned_at timestamptz not null default now(),
    assigned_by uuid null references public.profiles (id),
    notes text null,
    created_at timestamptz not null default now()
);

create index if not exists expense_advances_trip_id_idx on public.expense_advances (trip_id);

create index if not exists expense_advances_operator_id_idx on public.expense_advances (operator_id);

create index if not exists expense_advances_assigned_at_idx on public.expense_advances (assigned_at desc);

create table if not exists public.expense_trip_settlements (
    id uuid primary key default gen_random_uuid (),
    trip_id uuid not null unique references public.trips (id) on delete cascade,
    operator_id uuid null references public.employees (id),
    receipt_url text null,
    notes text null,
    settled_by uuid null references public.profiles (id),
    settled_at timestamptz not null default now()
);

create index if not exists expense_trip_settlements_trip_id_idx on public.expense_trip_settlements (trip_id);

alter table public.expenses
add column if not exists advance_id uuid null references public.expense_advances (id);

create index if not exists expenses_advance_id_idx on public.expenses (advance_id);

create or replace view public.trip_expense_assignment_kpis as
select
    t.id as trip_id,
    t.folio,
    t.trip_number,
    t.departure_date,
    t.arrival_date_actual,
    t.status as trip_status,
    t.unit_assembly_id,
    ua.employee_id as operator_id,
    coalesce(a_tot.assigned_amount, 0) as assigned_amount,
    coalesce(e_tot.spent_amount, 0) as spent_amount,
    (
        coalesce(e_tot.spent_amount, 0) - coalesce(a_tot.assigned_amount, 0)
    ) as balance_amount,
    (s.id is not null) as is_settled,
    case
        when coalesce(a_tot.assigned_amount, 0) = 0 then 'no_assignment'
        when s.id is null then 'pending'
        else 'settled'
    end as settlement_status
from
    public.trips t
    left join public.unit_assemblies ua on ua.id = t.unit_assembly_id
    left join public.expense_trip_settlements s on s.trip_id = t.id
    left join lateral (
        select sum(a.amount) as assigned_amount
        from public.expense_advances a
        where
            a.trip_id = t.id
    ) a_tot on true
    left join lateral (
        select sum(e.amount) as spent_amount
        from public.expenses e
        where
            e.trip_id = t.id
    ) e_tot on true;

-- ─────────────────────────────────────────────────────────────
-- RLS: authenticated CRUD
-- ─────────────────────────────────────────────────────────────

alter table public.expense_advances enable row level security;

alter table public.expense_trip_settlements enable row level security;

drop policy if exists "expense_advances_authenticated_all" on public.expense_advances;

create policy "expense_advances_authenticated_all" on public.expense_advances for all to authenticated using (true)
with
    check (true);

drop policy if exists "expense_trip_settlements_authenticated_all" on public.expense_trip_settlements;

create policy "expense_trip_settlements_authenticated_all" on public.expense_trip_settlements for all to authenticated using (true)
with
    check (true);

commit;