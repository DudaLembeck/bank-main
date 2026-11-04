do $$
declare
  v_nome text;
begin
  select conname into v_nome
    from pg_constraint
   where conrelid = 'public.perfil'::regclass
     and contype = 'c'
     and pg_get_constraintdef(oid) like '%nome_usuario%';

  if v_nome is not null then
    execute format('alter table public.perfil drop constraint %I', v_nome);
  end if;
end $$;

alter table public.perfil
  add constraint perfil_nome_usuario_tamanho
  check (length(btrim(nome_usuario)) between 2 and 80);
