create table codigo_comissao (
  codigo     text primary key check (length(btrim(codigo)) between 6 and 60),
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

alter table codigo_comissao enable row level security;

revoke all on codigo_comissao from anon;
revoke all on codigo_comissao from authenticated;

insert into codigo_comissao (codigo) values ('TROQUE-ESTE-CODIGO')
on conflict (codigo) do nothing;

create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
  v_admin  boolean := false;
begin
  v_codigo := nullif(btrim(coalesce(new.raw_user_meta_data->>'codigo_comissao', '')), '');

  if v_codigo is not null then
    v_admin := exists (
      select 1 from public.codigo_comissao
       where codigo = v_codigo and ativo
    );
  end if;

  insert into public.perfil (id, nome_usuario, nome, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_usuario',
             'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'nome', 'Sem nome'),
    v_admin
  );
  return new;
end;
$$;
