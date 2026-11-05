drop policy if exists "imagens apaga o proprio" on storage.objects;

create policy "imagens apaga o proprio ou comissao"
  on storage.objects for delete to authenticated
  using (bucket_id in ('perfis','posts','galeria')
         and (owner = auth.uid() or public.e_comissao()));
