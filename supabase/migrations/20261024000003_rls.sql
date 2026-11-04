alter table perfil       enable row level security;
alter table caixa        enable row level security;
alter table evento       enable row level security;
alter table movimentacao enable row level security;
alter table post         enable row level security;
alter table post_imagem  enable row level security;
alter table anuncio      enable row level security;
alter table duvida       enable row level security;
alter table resposta     enable row level security;
alter table galeria      enable row level security;
alter table curtida      enable row level security;
alter table notificacao  enable row level security;

revoke all on all tables in schema public from anon;

revoke update on perfil from authenticated;
grant update (nome_usuario, nome, foto_perfil) on perfil to authenticated;

create or replace function public.e_comissao()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from perfil where id = auth.uid() and is_admin);
$$;

revoke execute on function public.e_comissao() from public;
revoke execute on function public.e_comissao() from anon;
grant execute on function public.e_comissao() to authenticated;

create policy "perfil leitura autenticada"
  on perfil for select to authenticated using (true);

create policy "perfil edita o proprio"
  on perfil for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "caixa leitura autenticada"
  on caixa for select to authenticated using (true);

create policy "movimentacao leitura autenticada"
  on movimentacao for select to authenticated using (true);

create policy "evento leitura autenticada"
  on evento for select to authenticated using (true);

create policy "evento escrita comissao"
  on evento for all to authenticated
  using (public.e_comissao()) with check (public.e_comissao());

create policy "anuncio leitura autenticada"
  on anuncio for select to authenticated using (true);

create policy "anuncio escrita comissao"
  on anuncio for all to authenticated
  using (public.e_comissao()) with check (public.e_comissao());

create policy "post leitura autenticada"
  on post for select to authenticated using (true);

create policy "post cria o proprio"
  on post for insert to authenticated
  with check (id_usuario = auth.uid());

create policy "post edita o proprio"
  on post for update to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());

create policy "post apaga o proprio ou comissao"
  on post for delete to authenticated
  using (id_usuario = auth.uid() or public.e_comissao());

create policy "post imagem leitura autenticada"
  on post_imagem for select to authenticated using (true);

create policy "post imagem escrita do dono"
  on post_imagem for all to authenticated
  using (exists (select 1 from post p
                  where p.id = id_post
                    and (p.id_usuario = auth.uid() or public.e_comissao())))
  with check (exists (select 1 from post p
                       where p.id = id_post and p.id_usuario = auth.uid()));

create policy "galeria leitura autenticada"
  on galeria for select to authenticated using (true);

create policy "galeria cria o proprio"
  on galeria for insert to authenticated
  with check (id_usuario = auth.uid());

create policy "galeria edita o proprio"
  on galeria for update to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());

create policy "galeria apaga o proprio ou comissao"
  on galeria for delete to authenticated
  using (id_usuario = auth.uid() or public.e_comissao());

create policy "duvida leitura autenticada"
  on duvida for select to authenticated using (true);

create policy "duvida cria o proprio"
  on duvida for insert to authenticated
  with check (id_usuario = auth.uid());

create policy "duvida apaga o proprio ou comissao"
  on duvida for delete to authenticated
  using (id_usuario = auth.uid() or public.e_comissao());

create policy "resposta leitura autenticada"
  on resposta for select to authenticated using (true);

create policy "resposta escrita comissao"
  on resposta for all to authenticated
  using (public.e_comissao()) with check (public.e_comissao());

create policy "curtida leitura autenticada"
  on curtida for select to authenticated using (true);

create policy "curtida cria a propria"
  on curtida for insert to authenticated
  with check (id_usuario = auth.uid());

create policy "curtida apaga a propria"
  on curtida for delete to authenticated
  using (id_usuario = auth.uid());

create policy "notificacao le as proprias"
  on notificacao for select to authenticated
  using (id_usuario = auth.uid());

create policy "notificacao marca as proprias"
  on notificacao for update to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());
