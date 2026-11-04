create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfil (id, nome_usuario, nome)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_usuario',
             'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'nome', 'Sem nome')
  );
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

create or replace function public.registrar_movimentacao(
  p_tipo            text,
  p_valor_centavos  bigint,
  p_descricao       text,
  p_id_evento       bigint default null
)
returns movimentacao
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo bigint;
  v_mov   movimentacao;
begin
  if not exists (select 1 from perfil
                  where id = auth.uid() and is_admin) then
    raise exception 'apenas a comissao pode movimentar o caixa';
  end if;

  if p_tipo not in ('entrada','saida') then
    raise exception 'tipo invalido: %', p_tipo;
  end if;

  update caixa
     set saldo_centavos = saldo_centavos +
           case when p_tipo = 'entrada' then p_valor_centavos
                else -p_valor_centavos end,
         atualizado_em = now()
   where id = 1
  returning saldo_centavos into v_saldo;

  insert into movimentacao (id_admin, id_evento, tipo, valor_centavos,
                            descricao, saldo_apos_centavos)
  values (auth.uid(), p_id_evento, p_tipo, p_valor_centavos,
          p_descricao, v_saldo)
  returning * into v_mov;

  return v_mov;
end;
$$;

revoke execute on function public.registrar_movimentacao(text, bigint, text, bigint) from public;
revoke execute on function public.registrar_movimentacao(text, bigint, text, bigint) from anon;
grant execute on function public.registrar_movimentacao(text, bigint, text, bigint) to authenticated;
