create or replace function public.limpar_curtidas_do_alvo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.curtida
   where alvo_tipo = tg_argv[0]
     and alvo_id = old.id;
  return old;
end;
$$;

revoke execute on function public.limpar_curtidas_do_alvo() from public;
revoke execute on function public.limpar_curtidas_do_alvo() from anon;

create trigger ao_apagar_post
  after delete on post
  for each row execute function public.limpar_curtidas_do_alvo('post');

create trigger ao_apagar_foto
  after delete on galeria
  for each row execute function public.limpar_curtidas_do_alvo('foto');

create trigger ao_apagar_anuncio
  after delete on anuncio
  for each row execute function public.limpar_curtidas_do_alvo('anuncio');
