insert into storage.buckets (id, name, public)
values ('perfis','perfis',true),
       ('posts','posts',true),
       ('galeria','galeria',true)
on conflict (id) do nothing;

create policy "imagens leitura publica"
  on storage.objects for select
  using (bucket_id in ('perfis','posts','galeria'));

create policy "imagens envio autenticado"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('perfis','posts','galeria'));

create policy "imagens apaga o proprio"
  on storage.objects for delete to authenticated
  using (bucket_id in ('perfis','posts','galeria')
         and owner = auth.uid());
