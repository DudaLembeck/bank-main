create extension if not exists citext;

create table perfil (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome_usuario  citext not null unique
                check (length(nome_usuario) between 3 and 30),
  nome          text not null check (length(nome) between 2 and 80),
  is_admin      boolean not null default false,
  foto_perfil   text check (foto_perfil is null or length(foto_perfil) > 0),
  criado_em     timestamptz not null default now()
);

create table caixa (
  id              smallint primary key default 1 check (id = 1),
  saldo_centavos  bigint not null default 0 check (saldo_centavos >= 0),
  atualizado_em   timestamptz not null default now()
);

insert into caixa (id) values (1) on conflict do nothing;

create table evento (
  id           bigint generated always as identity primary key,
  nome         text not null check (length(nome) between 2 and 80),
  tipo         text not null default 'dia_d' check (tipo in ('dia_d','outro')),
  data_evento  date,
  descricao    text check (descricao is null or
                           length(descricao) between 1 and 300),
  encerrado    boolean not null default false,
  criado_em    timestamptz not null default now()
);

create table movimentacao (
  id                   bigint generated always as identity primary key,
  id_admin             uuid not null references perfil(id) on delete restrict,
  id_evento            bigint references evento(id) on delete set null,
  tipo                 text not null check (tipo in ('entrada','saida')),
  valor_centavos       bigint not null
                       check (valor_centavos between 1 and 100000000),
  descricao            text not null
                       check (length(btrim(descricao)) between 3 and 200),
  saldo_apos_centavos  bigint not null check (saldo_apos_centavos >= 0),
  data                 timestamptz not null default now()
);

create table post (
  id          bigint generated always as identity primary key,
  id_usuario  uuid not null references perfil(id) on delete cascade,
  id_evento   bigint references evento(id) on delete set null,
  texto       text not null check (length(texto) between 1 and 500),
  data        timestamptz not null default now()
);

create table post_imagem (
  id        bigint generated always as identity primary key,
  id_post   bigint not null references post(id) on delete cascade,
  caminho   text not null check (length(caminho) > 0),
  ordem     smallint not null default 0 check (ordem between 0 and 9),
  unique (id_post, ordem)
);

create table anuncio (
  id               bigint generated always as identity primary key,
  id_usuario       uuid not null references perfil(id) on delete cascade,
  id_evento        bigint references evento(id) on delete set null,
  texto            text not null check (length(texto) between 1 and 500),
  fixado           boolean not null default false,
  origem           text not null default 'manual'
                   check (origem in ('manual','automatico')),
  id_movimentacao  bigint references movimentacao(id) on delete cascade,
  data             timestamptz not null default now(),
  check ((origem = 'automatico') = (id_movimentacao is not null))
);

create table duvida (
  id          bigint generated always as identity primary key,
  id_usuario  uuid not null references perfil(id) on delete cascade,
  texto       text not null check (length(texto) between 1 and 500),
  respondida  boolean not null default false,
  data        timestamptz not null default now()
);

create table resposta (
  id          bigint generated always as identity primary key,
  id_duvida   bigint not null references duvida(id) on delete cascade,
  id_usuario  uuid not null references perfil(id) on delete cascade,
  texto       text not null check (length(texto) between 1 and 500),
  data        timestamptz not null default now()
);

create table galeria (
  id          bigint generated always as identity primary key,
  id_usuario  uuid not null references perfil(id) on delete cascade,
  id_evento   bigint references evento(id) on delete set null,
  caminho     text not null check (length(caminho) > 0),
  legenda     text check (legenda is null or length(legenda) between 1 and 200),
  turma       text check (turma is null or length(turma) between 1 and 40),
  ano         smallint check (ano is null or ano between 1950 and 2100),
  data        timestamptz not null default now()
);

create table curtida (
  id          bigint generated always as identity primary key,
  id_usuario  uuid not null references perfil(id) on delete cascade,
  alvo_tipo   text not null
              check (alvo_tipo in ('post','anuncio','duvida','foto')),
  alvo_id     bigint not null check (alvo_id > 0),
  data        timestamptz not null default now(),
  unique (id_usuario, alvo_tipo, alvo_id)
);

create table notificacao (
  id          bigint generated always as identity primary key,
  id_usuario  uuid not null references perfil(id) on delete cascade,
  tipo        text not null
              check (tipo in ('curtida','movimentacao','anuncio','resposta')),
  id_ator     uuid references perfil(id) on delete cascade,
  alvo_tipo   text check (alvo_tipo is null or
                          alvo_tipo in ('post','anuncio','duvida',
                                        'foto','movimentacao')),
  alvo_id     bigint check (alvo_id is null or alvo_id > 0),
  titulo      text not null check (length(titulo) between 1 and 80),
  descricao   text check (descricao is null or
                          length(descricao) between 1 and 200),
  lida        boolean not null default false,
  data        timestamptz not null default now(),
  check ((alvo_tipo is null) = (alvo_id is null))
);

create index idx_movimentacao_data        on movimentacao (data desc);
create index idx_movimentacao_admin       on movimentacao (id_admin);
create index idx_movimentacao_evento      on movimentacao (id_evento);
create index idx_post_data                on post (data desc);
create index idx_post_evento              on post (id_evento);
create index idx_post_imagem_post         on post_imagem (id_post, ordem);
create index idx_anuncio_data             on anuncio (fixado desc, data desc);
create index idx_anuncio_movimentacao     on anuncio (id_movimentacao);
create index idx_duvida_data              on duvida (data desc);
create index idx_resposta_duvida          on resposta (id_duvida);
create index idx_galeria_evento           on galeria (id_evento);
create index idx_galeria_ano              on galeria (ano desc, data desc);
create index idx_curtida_alvo             on curtida (alvo_tipo, alvo_id);
create index idx_notificacao_usuario_lida on notificacao (id_usuario, lida, data desc);
create index idx_evento_data              on evento (data_evento desc);
