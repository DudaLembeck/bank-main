# CONTEXTO 3BANK — leitura obrigatória

Documento de referência do projeto **3BANK**. Deve ser lido **antes de qualquer alteração** no código. Se algo aqui conflitar com o pedido do usuário, o pedido do usuário vence — mas avise o conflito antes de prosseguir.

---

## 1. O que o sistema é

O 3BANK é o **caixa compartilhado do terceiro ano do ensino médio**. Ele controla o dinheiro arrecadado nos **dias D** e demais eventos do terceirão.

Pontos que definem todo o resto do projeto:

- **Existe um único caixa, coletivo.** Não há carteira individual, não há saldo por aluno. O valor mostrado na tela inicial é o total do terceirão, igual para todo mundo.
- **Só a comissão (administradores) movimenta o dinheiro.** Adiciona ou retira do caixa, e **toda movimentação exige uma descrição** dizendo o motivo.
- **O que o protótipo chama de "transferência" não é transferência.** É adição ou retirada do total do caixa. Não existe aluno enviando dinheiro para outro aluno.
- **Avisos são exclusivos da comissão.** Anúncios de dias D e eventos só podem ser publicados por administradores.
- **A parte social é aberta aos alunos.** Qualquer usuário publica posts e fotos sobre os dias D e eventos, e envia fotos para a galeria.

Resumindo os dois lados do app: um lado **financeiro e somente-leitura para o aluno** (saldo, extrato, avisos) e um lado **social e aberto** (posts, galeria, curtidas).

---

## 2. Papéis e permissões

| Ação | Aluno | Comissão (admin) |
| --- | --- | --- |
| Ver saldo do caixa e extrato | sim | sim |
| Adicionar ou retirar dinheiro do caixa | **não** | sim, com descrição obrigatória |
| Publicar aviso / anúncio | **não** | sim |
| Publicar post social | sim | sim |
| Enviar foto para a galeria | sim | sim |
| Curtir post, aviso ou foto | sim | sim |
| Editar o próprio perfil | sim | sim |

A permissão vem de `perfil.is_admin` e é aplicada **no banco**, por políticas de Row Level Security e pela função que movimenta o caixa. A interface também esconde o que o aluno não pode fazer, mas esconder botão não é segurança: quem garante é o banco.

---

## 3. Regras inegociáveis do agente

1. **Não escrever comentários no código.** Nenhum `//`, `/* */`, `<!-- -->` ou `#` explicativo em arquivos `.ts`, `.vue`, `.css`, `.sql` ou qualquer outro. O código deve se explicar pelos nomes. Comentários já existentes podem permanecer, mas não crie novos.
2. **Não usar git.** Nada de `git add`, `git commit`, `git push`, `git checkout`, `git reset`, `git stash`, branches ou PRs. As mudanças ficam apenas na árvore de trabalho; quem commita é a pessoa desenvolvedora.
3. **Não apagar nem sobrescrever trabalho existente** sem antes ler o arquivo inteiro.
4. **O banco de dados é o Supabase (PostgreSQL).** Nada de banco local no aparelho, nada de SQLite, nada de `localStorage` como banco. As imagens vão para o Supabase Storage.
5. **Nunca colocar a chave `service_role` no app**, nem em `.env`, nem em código, nem em exemplo. Só a chave publicável (`anon`) vai para o cliente.
6. **Português do Brasil** em toda a interface e nos textos.
7. Antes de criar um arquivo novo, verificar se já existe equivalente em `src/views`, `src/components`, `src/services` ou `src/stores`.

---

## 4. Stack real do projeto

| Item | Valor |
| --- | --- |
| Framework | Vue 3 (`<script setup lang="ts">`) + Ionic Vue 8 |
| Build | Vite 5 |
| Linguagem | TypeScript |
| Roteamento | `@ionic/vue-router` (`createWebHistory`) |
| Mobile | Capacitor 8 (`android/` já gerado) |
| Banco e autenticação | **Supabase** — PostgreSQL + Auth + Storage + Realtime |
| Estado global | Pinia |
| Sessão no aparelho | `@capacitor/preferences` |
| Testes | Vitest (`tests/unit`) + Cypress (`tests/e2e`) |
| Lint | ESLint 8 + `eslint-plugin-vue` |
| Alias | `@` → `./src` |

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run test:unit`, `npm run test:e2e`.

### Chaves e ambiente

Arquivo `.env` na raiz:

```
VITE_SUPABASE_URL=https://fvatsruiaqzgmxgckeal.supabase.co
VITE_SUPABASE_ANON_KEY=<chave publicavel>
```

- `.env` **precisa estar no `.gitignore`** antes de receber a chave. Versionar apenas `.env.example` com os nomes e valores vazios.
- Só variáveis com prefixo `VITE_` chegam ao app; tudo que entra no bundle é **público** — qualquer pessoa lê a chave abrindo o app. Isso é esperado: ela só é segura porque as políticas de RLS limitam o que ela pode fazer. **Sem RLS, essa chave dá acesso total ao banco.**
- A chave `service_role` ignora toda RLS. Nunca entra no app, nem em teste.

---

## 5. Elementos de Ionic + Vue das aulas (obrigatório)

O 3BANK é o projeto da UC **Técnico em Informática para Internet · 3º Ano · SENAC Joinville**. Tudo deve usar os elementos ensinados nas aulas — **não inventar padrão fora do que foi dado em aula** e não escrever HTML puro onde existe componente Ionic equivalente.

Motivo, segundo a aula 04: os componentes do Ionic já trazem adaptação automática iOS/Android, acessibilidade (ARIA, foco por teclado), tema consistente e gestos nativos. Um `<div>` estilizado à mão perde tudo isso.

> **Atenção:** o Supabase **não aparece em nenhuma das aulas lidas** (01, 02, 04, 07, 10). A persistência ensinada foi local (Preferences e Filesystem do Capacitor). Confirmar com o professor se usar um banco na nuvem é aceito no projeto da UC — ver pendência 1.

### Aula 01 — Ambiente

`ionic serve` (navegador, `localhost:8100`), `ionic cap run android` (emulador). Node LTS 20+, Ionic CLI 7+, AVD Pixel com API 34.

### Aula 02 — Estrutura, componentes e rotas

- Estrutura `src/`: `components/`, `views/`, `router/index.ts`, `theme/variables.css`, `App.vue` (IonApp + IonRouterOutlet), `main.ts`.
- Todo `.vue` em três blocos: `<template>`, `<script setup lang="ts">`, `<style scoped>`.
- Reatividade com `ref()` — `.value` no script, sem `.value` no template.
- Diretivas: `v-model`, `v-for` com `:key`, `v-if`, `@click`, `:bind`.
- Toda tela é `IonPage > IonHeader > IonToolbar > IonTitle` + `IonContent`.
- Rotas com **lazy loading**: `component: () => import('../views/XPage.vue')`.

### Aula 04 — Componentes de UI e tema

| Componente | Uso no 3BANK |
| --- | --- |
| `IonButton` | `fill` (solid/outline/clear), `color`, `expand="block"` nos botões principais, `:disabled` ligado a validação |
| `IonIcon` | importar de `ionicons/icons` (só os usados); `slot="start"`, `slot="end"`, `slot="icon-only"`; ícone condicional com ternário (coração vazio/cheio ao curtir) |
| `IonInput` | login e cadastro: `label` + `label-placement="floating"`, `v-model`, `type`, `:clear-input`, `:error-text` |
| `IonTextarea` | texto de post, aviso e descrição de movimentação: `:auto-grow`, `:maxlength`, `counter` |
| `IonCard` + `Header`/`Title`/`Subtitle`/`Content` | card do saldo, cards de post, cards da galeria |
| `IonList` + `IonItem` + `IonLabel` | extrato, anúncios, notificações. `<h2>` título e `<p>` subtítulo; `slot="start"` para ícone, `slot="end"` para ação |
| `IonNote` | data e hora no `slot="end"` dos itens do extrato |
| `IonBadge` | notificações não lidas; `color="success"` para entrada e `color="danger"` para saída |
| `IonChip` | filtro por evento / dia D |
| `IonListHeader` | título de seção dentro das listas |
| `IonSpinner` / `IonSkeletonText` | enquanto a consulta ao Supabase não volta |
| `IonRefresher` | puxar para atualizar as listas |

Validação de formulário é reativa: `computed()` devolve a mensagem de erro (ou string vazia) e o input recebe `:error-text` mais `:class="{'ion-invalid ion-touched': erro}"`. É assim que o **RF009** e as mensagens do **RNF006** devem aparecer, inclusive os erros vindos do Supabase.

Tema: cores só em `src/theme/variables.css`, com as variáveis `--ion-color-*` e variantes `-rgb`, `-contrast`, `-shade`, `-tint`, geradas no **Ionic Color Generator**. No componente, `<style scoped>` com `var(--ion-color-*)`; para o shadow DOM de um componente Ionic, `::part(native)`. Espaçamento padrão 16px (`ion-padding`).

### Aula 05 — Pinia (estado global)

*Esta aula não pôde ser lida (arquivo grande demais para extração de texto). O conteúdo abaixo vem do uso que as aulas 07 e 10 fazem de Pinia — confirmar com o material original.*

- Stores em `src/stores/`, com `defineStore('nome', () => { ... })` (setup store), devolvendo `ref`s e funções.
- Nos componentes: `const store = useXStore()`, com `storeToRefs(store)` para estado reativo.
- **Como convive com o Supabase:** a store é a camada reativa **em cima** dos serviços; as chamadas ao Supabase ficam só em `src/services/`. Fluxo: `componente → store Pinia → service → Supabase`.

### Aula 07 — Navegação

- **Sempre `useIonRouter()`**, nunca `useRouter()` puro — é o que traz a animação nativa. Métodos: `push`, `back`, `replace`, `navigate`, `canGoBack()`.
- `replace()` depois do login, nunca `push()`.
- Params `:id` para recurso, lidos com `useRoute()` e convertidos (params são sempre string). Query (`?evento=`) para filtros opcionais.
- `IonBackButton` sempre com `default-href`, dentro de `IonButtons slot="start"`.
- `IonModal` (`:is-open`, `@did-dismiss`, `:breakpoints`) e `alertController` para confirmações — usar na **confirmação de lançamento no caixa** e ao excluir post.
- `toastController` para mensagens rápidas, incluindo falha de rede.
- **Guards** `beforeEach` + `meta`: `meta: { requerLogin: true }` nas telas internas e `meta: { requerAdmin: true }` nas ações da comissão. O guard lê a store Pinia, não o `localStorage`.
- `onBeforeRouteLeave` para avisar antes de descartar formulário preenchido.

### Aula 10 — Capacitor (recursos nativos)

- **Camera API** (`@capacitor/camera`): `Camera.getPhoto({ resultType: CameraResultType.DataUrl, source: CameraSource.Prompt, quality: 90, width: 800 })`, encapsulada em `src/composables/useCamera.ts` com `carregando` e tratamento de erro. Cumpre **RF006** e **RF015**.
- **O destino da foto é o Supabase Storage**, não o Filesystem: Camera devolve a imagem → serviço envia ao bucket → o banco guarda só o caminho.
- Cancelamento do usuário **não é erro**: checar `'cancelled'` no catch e retornar sem toast.
- Permissões: `checkPermissions()` → se não `granted`, `requestPermissions()` → tratar recusa. Declarar `CAMERA` e `READ_MEDIA_IMAGES` no `AndroidManifest.xml`.
- **Preferences** (`@capacitor/preferences`) não é banco: guarda a **sessão do Supabase Auth**, via `storage` adapter passado ao `createClient`. O padrão do supabase-js é `localStorage`, que o sistema pode limpar.
- **`@capacitor/network`**: o app depende de internet; detectar `connected === false` e avisar na tela.
- `npx cap sync` depois de instalar plugin ou editar `capacitor.config.ts`. Remover `server: { url, cleartext }` antes do APK final.
- Onde cada coisa fica: **Supabase** = todos os dados; **Storage** = imagens; **Preferences** = sessão. Nunca `localStorage`, nunca `Filesystem` como fonte de verdade.

### Conflito conhecido: pílulas × IonTabs

A aula 07 ensina `IonTabs` com barra inferior, mas o protótipo usa **pílulas brancas no topo**. As pílulas podem ser feitas com `IonButton` + `router-link` + `router-direction`. Decidir antes de criar as telas — muda a estrutura de rotas.

### Sobre git

As aulas pedem branch, commits e Pull Request a cada atividade. Isso vale para **você**, não para o agente: a regra 2 da seção 3 se mantém.

---

## 6. Camada de dados (Supabase)

O cliente é criado uma única vez em `src/services/supabase.ts` e importado pelos demais serviços.

### Estado atual

**No servidor** (projeto `fvatsruiaqzgmxgckeal`): o banco está **pronto e verificado**. As seis migrações foram executadas no SQL Editor e o resultado foi conferido por requisição HTTP:

| Verificação | Resultado |
| --- | --- |
| 12 tabelas, índices e a linha única do caixa | criados |
| Leitura sem login em qualquer tabela | `42501 permission denied` |
| `registrar_movimentacao` chamada sem login | `42501 permission denied for function` |
| Buckets `perfis`, `posts`, `galeria` | criados (públicos) |
| Conexão com a chave publicável | confirmada |

**Nesta pasta:** a base do app está recriada — migrações, cliente, serviço de autenticação, store do usuário, telas de login e cadastro e o guard de rota. Falta apenas o `.env` com a chave publicável, que não é versionado.

### Telas e arquivos já implementados

| Arquivo | Papel |
| --- | --- |
| `src/services/supabase.ts` | cliente único, sessão no `Preferences` |
| `src/services/authService.ts` | `entrar`, `cadastrar`, `sair`, `buscarSessao`, `buscarPerfil`, `observarSessao` + tradução dos erros do Supabase para português |
| `src/stores/usuario.ts` | store Pinia: `logado`, `ehComissao`, `nomeExibicao` |
| `src/views/LoginPage.vue` | entrada por e-mail e senha |
| `src/views/CadastroPage.vue` | cadastro com dois modos (ALUNO / COMISSÃO), campo de código só no modo comissão, pede nome completo, senha e e-mail |
| `src/components/CartaoFormulario.vue` | cartão branco + cartão rosa interno dos formulários |
| `src/components/MarcaTopo.vue`, `TituloSecao.vue` | cabeçalho da marca e título `—— SEÇÃO ——` |
| `src/components/CabecalhoApp.vue` | cabeçalho de todas as telas internas: perfil, sino, "Bem vindo(a), {nome}", logo |
| `src/components/PilulasNavegacao.vue` | pílulas brancas do topo; recebe o grupo (`anuncios`, `posts`, `galeria`, `simples`) e mostra as outras telas |
| `src/services/dinheiro.ts` | `paraCentavos`, `formatarReal`, `formatarComSinal`, `formatarData` |
| `src/services/caixaService.ts` | `buscarSaldo`, `listarMovimentacoes` (com autor e evento), `registrarMovimentacao` (RPC) |
| `src/services/eventoService.ts` | `listarEventos`, `criarEvento`, `alternarEncerrado` |
| `src/stores/caixa.ts` | saldo, extrato e `lancar()` |
| `src/views/ExtratoPage.vue` | saldo, lista de movimentações e, só para comissão, os botões ADICIONAR e RETIRAR, que abrem o modal de lançamento (valor, evento opcional, motivo obrigatório) com confirmação. Retirada acima do saldo é barrada na tela e, de novo, pelo banco |
| `src/views/EventosPage.vue` | cadastro e lista de dias D e eventos (cadastro só para comissão) |
| `src/composables/useCamera.ts` | captura de foto (Camera API, `DataUrl`, `webUseInput` no navegador), cancelamento tratado em silêncio |
| `src/services/imagemService.ts` | `enviarImagem` (Storage), `urlPublica`, `removerImagens` |
| `src/services/postService.ts` | `listarPosts` (com autor, evento e imagens), `publicarPost` (envia fotos, grava post e imagens, desfaz se falhar), `removerPost` |
| `src/services/galeriaService.ts` | `listarFotos`, `enviarFoto`, `removerFoto` |
| `src/composables/useFeed.ts` | feed de posts compartilhado pela Home (3 posts) e pela página Posts (30): carregar, curtir com atualização imediata na tela e desfeita se falhar, apagar com confirmação |
| `src/services/curtidaService.ts` | `curtir` e `descurtir` (ignora o erro de curtida duplicada, `23505`) |
| `src/services/nome.ts` | `nomeBonito` (primeira letra maiúscula, "de/da/do" em minúscula) e `inicialDoNome` |
| `src/components/CartaoPost.vue` | cartão de post estilo rede social: avatar, nome com selo de comissão, "há 5 h", evento, texto, grade de fotos e coração com contagem |
| `src/components/AvatarUsuario.vue` | foto de perfil redonda, ou a inicial do nome sobre fundo vinho quando não há foto |
| `src/components/BarraNovoPost.vue` | barra "Compartilhe um momento com a turma…" que abre o modal de novo post |
| `src/components/NovoPostModal.vue` | modal de novo post (texto, evento opcional, até 4 fotos), usado pela Home e pela página Posts |
| `src/views/PostsPage.vue` | feed completo de posts (30 mais recentes) |
| `src/views/GaleriaPage.vue` | fotos com legenda "Turma - Turma de ANO", modal de envio (foto, turma, ano, legenda, evento opcional); mesma regra de apagar |
| `src/views/RecuperarSenhaPage.vue` | recuperação de senha em duas etapas: pede o e-mail e depois código + nova senha |
| `src/services/anuncioService.ts` | `listarAnuncios` (fixados primeiro, depois os mais novos), `publicarAnuncio`, `alternarFixado`, `removerAnuncio` |
| `src/views/AnunciosPage.vue` | lista de avisos para todos; só a comissão vê NOVO ANÚNCIO (texto, evento opcional, fixar no topo) e os botões de fixar e apagar |
| `src/services/perfilService.ts` | `atualizarFotoPerfil`: envia a foto ao bucket `perfis`, grava o caminho em `perfil.foto_perfil` e apaga a foto antiga (desfaz o envio se a gravação falhar) |
| `src/views/PerfilPage.vue` | avatar grande, selo Aluno/Comissão, nome, e-mail, tipo de conta e "membro desde" (somente leitura), TROCAR FOTO, REDEFINIR SENHA (pede a senha atual) e SAIR |
| `src/views/NotificacoesPage.vue` | **esqueleto**: só cabeçalho, pílulas e título; conteúdo ainda não construído |
| `src/router/index.ts` | rotas com lazy loading + guard `requerLogin` / `somenteVisitante` |

`HomePage.vue` ainda é a tela do template, só ligada à sessão (mostra o nome, o papel e um botão de sair) — a tela real do protótipo ainda não foi feita.

Migrações, aplicadas no servidor e versionadas em `supabase/migrations/`:

| Arquivo | O que faz |
| --- | --- |
| `...0001_schema.sql` | tabelas, índices, linha única do caixa |
| `...0002_funcoes.sql` | gatilho do perfil + `registrar_movimentacao` |
| `...0003_rls.sql` | RLS, políticas e `e_comissao()` |
| `...0004_storage.sql` | buckets `perfis`, `posts`, `galeria` |
| `...0005_codigo_comissao.sql` | tabela de códigos + gatilho que concede `is_admin` |
| `...0006_nome_usuario_completo.sql` | afrouxa o `check` de `nome_usuario` para caber nome completo |
| `...0007_storage_comissao_apaga.sql` | a comissão também pode apagar arquivos de imagem enviados por outras pessoas (antes só o dono). **Precisa ser executada no SQL Editor** |
| `...0008_limpar_curtidas.sql` | gatilhos que apagam as curtidas de um post, foto ou anúncio quando ele é apagado (a tabela `curtida` não tem chave estrangeira para o alvo). **Precisa ser executada no SQL Editor**; sem ela as curtidas ficam órfãs, sem aparecer em lugar nenhum |

### Configuração do painel (não é migração)

- **Confirm email**: desligado em *Authentication → Sign In / Providers → Email*, para o cadastro já criar sessão. Consequência aceita: ninguém prova ser dono do e-mail informado.
- **Template de e-mail "Reset Password"** (Authentication → Emails): precisa conter `{{ .Token }}`, que é o código de 6 dígitos. Sem isso o e-mail só traz o link e a tela de recuperação não funciona. Exemplo de corpo: `<h2>Redefinir sua senha no 3BANK</h2><p>Seu código de verificação é:</p><h1>{{ .Token }}</h1><p>Digite esse código no app. Se não foi você, ignore este e-mail.</p>`
- **SMTP**: o serviço de e-mail padrão do Supabase recusa entregar para endereços que não sejam do time do projeto e limita a 2 mensagens por hora (documentação oficial, conferida em 05/11/2026). Serve para testar com o e-mail do próprio dono; para os alunos é preciso configurar SMTP próprio em Authentication → Emails → SMTP Settings. Com SMTP próprio o limite padrão sobe para 30 por hora.
- **Código da comissão**: o valor real é definido por `update codigo_comissao set ativo = false;` seguido de `insert into codigo_comissao (codigo) values ('<codigo>');`. O provisório `TROQUE-ESTE-CODIGO` precisa estar desativado.

### Regras

- Todo acesso ao banco fica isolado em `src/services/`. **Nenhum componente `.vue` chama `supabase` diretamente.**
- O schema vive em `supabase/migrations/` como `.sql` versionados. Nada de criar tabela clicando no painel sem registrar a migração.
- **Toda tabela tem RLS ligada, com política explícita.**
- Valores monetários em **centavos**, coluna `bigint`.
- Datas e horas em `timestamptz`; data pura em `date`.
- Tratar **todo** erro: `const { data, error } = await ...` — nunca ignorar o `error`.
- O app depende de internet: toda tela que carrega dados precisa de estado de carregando e de erro.

### Autenticação

O **Supabase Auth** cuida de cadastro e login (RF001, RF009, RNF005):

- Senha não é problema nosso: nada de coluna de senha, nada de hash manual.
- A tabela `perfil` tem o mesmo `id` (uuid) de `auth.users` e é criada por gatilho quando a conta nasce.
- `signUp()`, `signInWithPassword()`, `signOut()`, `onAuthStateChange()` — este último alimenta a store Pinia, que alimenta os guards.
- `auth.uid()` dentro do Postgres identifica quem está chamando: é a base de todas as políticas.

### Tipos de dados no PostgreSQL

| Dado | Tipo | Observação |
| --- | --- | --- |
| Chave primária | `bigint generated always as identity` | sequência gerenciada pelo banco |
| Usuário | `uuid` | mesmo id de `auth.users`, nunca inteiro |
| Texto | `text` | sem `varchar(n)`; limitar com `check (length(...))` |
| Nome de usuário | `citext` | comparação sem diferenciar maiúsculas |
| Booleano | `boolean` | `true`/`false`, não `0/1` |
| Dinheiro | `bigint` em centavos | ver nota abaixo |
| Data e hora | `timestamptz` | `default now()` |
| Data sem hora | `date` | o tipo valida o formato sozinho |
| Enumeração | `text` + `check (col in (...))` | mais fácil de alterar que `enum` |

**`text not null` continua aceitando string vazia**, então todo texto obrigatório leva `check (length(...) > 0)` ou faixa, e todo texto opcional é `null` — nunca `''`.

**Sobre dinheiro:** o Postgres tem `numeric(12,2)`, decimal exato de verdade. Mantivemos centavos em `bigint` porque o JavaScript só tem `number` (float de 8 bytes) e o PostgREST entrega `numeric` como número JSON, que vira float no cliente de qualquer jeito. Com `bigint` em centavos o valor é inteiro exato dos dois lados.

### Modelo de dados

```sql
create extension if not exists citext;

create table perfil (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome_usuario  citext not null unique,
  nome          text not null check (length(nome) between 2 and 80),
  is_admin      boolean not null default false,
  foto_perfil   text check (foto_perfil is null or length(foto_perfil) > 0),
  criado_em     timestamptz not null default now(),
  constraint perfil_nome_usuario_tamanho
    check (length(btrim(nome_usuario)) between 2 and 80)
);

create table caixa (
  id              smallint primary key default 1 check (id = 1),
  saldo_centavos  bigint not null default 0 check (saldo_centavos >= 0),
  atualizado_em   timestamptz not null default now()
);

insert into caixa (id) values (1) on conflict do nothing;

create table codigo_comissao (
  codigo     text primary key check (length(btrim(codigo)) between 6 and 60),
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

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
```

Decisões de modelagem que valem destacar:

- **`caixa` tem uma linha só.** O `check (id = 1)` garante no banco que não existe um segundo caixa.
- **Não existe saldo por usuário.** A tela inicial lê `caixa.saldo_centavos`.
- **`descricao` da movimentação é obrigatória** (`not null`, mínimo 3 caracteres depois do `btrim`).
- **`saldo_apos_centavos`** guarda quanto o caixa ficou depois do lançamento — auditoria linha a linha.
- **`id_admin` usa `on delete restrict`**: excluir alguém da comissão não pode apagar lançamentos.
- **`saldo_centavos >= 0`** impede caixa negativo; a função falha se a saída for maior que o saldo.
- **`anuncio.origem` + `id_movimentacao`** atendem ao RF010.
- **`alvo_tipo` + `alvo_id` é uma chave estrangeira que o banco não valida**, porque o alvo pode ser post, aviso, dúvida ou foto. Apagar um post **não** apaga curtidas e notificações dele — limpeza é responsabilidade do serviço.
- `timestamptz` grava em UTC e converte na exibição conforme o fuso do aparelho.

### Gatilho do perfil e do código da comissão

```sql
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

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();
```

**Como o código da comissão funciona:** o código **já existe no banco antes** de qualquer cadastro — é inserido à mão uma vez. Ele não é gerado no cadastro, e **não aparece no login**. Quem cria conta escolhendo COMISSÃO digita o código, o app o envia dentro de `raw_user_meta_data`, e o gatilho acima compara com a tabela. Escolher "COMISSÃO" na tela não concede nada: `is_admin` nunca vem do app.

A tabela `codigo_comissao` tem RLS ligada e **nenhuma política** — nem `anon` nem `authenticated` leem por API. Não existe função que responda "esse código é válido?", porque viraria um oráculo para adivinhar o código por tentativa; o preço é que o erro só aparece depois da conta criada (que nasce como aluno, com aviso na tela).

### Movimentar o caixa é uma função no banco

O supabase-js **não tem transação**: cada chamada é uma requisição HTTP isolada. Gravar em `movimentacao` e atualizar `caixa` em duas chamadas pode deixar o caixa errado se a segunda falhar. Por isso a movimentação é uma **função Postgres** chamada por RPC:

```sql
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
```

No app: `await supabase.rpc('registrar_movimentacao', { ... })`. Tudo numa transação só; se o saldo ficar negativo, o `check` da tabela `caixa` derruba a operação inteira.

### Armadilha de permissão aprendida aqui

`revoke execute on function ... from anon` **não basta**: no PostgreSQL toda função nasce com `execute` concedido a **`public`**, e revogar de `anon` não tira o que veio por `public`. A primeira versão da migração tinha esse erro — a função do caixa ficou chamável por quem não estava logado (foi barrada só pela checagem interna de `is_admin`, sem gravar nada). A forma correta, para **toda** função `security definer`:

```sql
revoke execute on function public.nome_da_funcao(...) from public;
revoke execute on function public.nome_da_funcao(...) from anon;
grant  execute on function public.nome_da_funcao(...) to authenticated;
```

### Row Level Security

Ligar RLS em **todas** as tabelas. O desenho, em palavras:

- `caixa` e `movimentacao`: leitura para autenticados; **escrita nenhuma** — só a função `security definer` altera.
- `anuncio`: leitura para autenticados; inserir, editar e apagar só para `is_admin` (RF002).
- `post`, `galeria`, `duvida`, `curtida`: leitura para autenticados; inserir com `id_usuario = auth.uid()`; editar e apagar só as próprias linhas (apagar também liberado para a comissão em `post` e `galeria`).
- `resposta`: leitura para autenticados; inserir só `is_admin` (RF014).
- `notificacao`: cada pessoa lê e marca como lida **apenas as suas**.
- `perfil`: leitura para autenticados; atualizar só a própria linha. **`is_admin` não é editável pelo app** — `revoke update on perfil from authenticated;` seguido de `grant update (nome_usuario, nome, foto_perfil) on perfil to authenticated;`.
- `codigo_comissao`: RLS ligada e nenhuma política.

Formato das políticas, com a função auxiliar:

```sql
create or replace function public.e_comissao()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from perfil where id = auth.uid() and is_admin);
$$;

alter table anuncio enable row level security;

create policy "anuncio leitura autenticada"
  on anuncio for select to authenticated
  using (true);

create policy "anuncio escrita comissao"
  on anuncio for all to authenticated
  using (public.e_comissao())
  with check (public.e_comissao());
```

Também: `revoke all on all tables in schema public from anon;` — o app exige login.

### Storage (imagens)

Buckets `perfis`, `posts`, `galeria`, criados **públicos**. O banco guarda **o caminho dentro do bucket**, não a imagem e não uma URL assinada. Upload com `supabase.storage.from('galeria').upload(...)`; exibição com `getPublicUrl`.

Política de upload: qualquer pessoa autenticada envia; só quem enviou apaga. **Não** exigir `owner = auth.uid()` no `INSERT` — o `owner` é preenchido pelo servidor do Storage, não pelo cliente, e a checagem recusa o upload.

### Atualização em tempo real

O **Realtime** torna literal a frase "atualiza imediatamente para todos":

```ts
supabase.channel('caixa')
  .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'caixa' },
      recarregarSaldo)
  .subscribe()
```

Cancelar a inscrição no `onUnmounted` — mesma lógica do `clearWatch` da aula 10.

---

## 7. Telas (baseadas no protótipo)

Todas repetem o mesmo cabeçalho: ícone de perfil, sino de notificações, "Bem vindo(a), {nome}" e a logo **3BANK** à direita. O fundo usa a marca d'água `src/imgs/background.png`.

| Rota | Tela | Conteúdo |
| --- | --- | --- |
| `/login` | Login | card branco flutuante, campos *email* e *senha*, botão **ENTRAR**, link "esqueceu sua senha?" que leva a `/recuperar-senha` |
| `/cadastro` | Crie sua conta | botões ALUNO / COMISSÃO, card "SUAS INFORMAÇÕES" com *nome completo*, *senha*, *email* e — só no modo comissão — *código da comissão* |
| `/home` | Início | card com o **total do caixa** (`Saldo: R$ 1234,56` + olho de ocultar + "Ver extrato"), card-imagem "GALERIA DE TURMAS", "Quadro de Anúncios" com o último aviso e "Ver tudo", divisor "ATUALIZAÇÕES", card "Posts" |
| `/anuncios` | Anúncios | pílulas (INÍCIO / POSTS / GALERIA), avisos da comissão, curtir e enviar, rodapé "sem novos anúncios". **Só admin publica** |
| `/posts` | Posts | pílulas (INÍCIO / ANÚNCIOS / GALERIA), posts dos alunos com autor, texto e grade de imagens |
| `/galeria` | Galeria de turmas | pílulas (INÍCIO / ANÚNCIOS / POSTS), fotos dos dias D com legenda "Terceiro 2 - Turma de 2023" |
| `/extrato` | Extrato do caixa | pílula INÍCIO, total atual, lista de movimentações com tipo, valor, data e descrição. Somente leitura para o aluno |
| `/notificacoes` | Notificações | pílula INÍCIO, curtidas recebidas e movimentações do caixa |
| `/perfil` | Perfil | pílula INÍCIO, avatar grande, card "Editar Perfil" com nome, senha mascarada e "Salvar alterações" |

A navegação entre abas é por **pílulas brancas arredondadas no topo**, não por `ion-tabs` na base. Cada tela mostra as três irmãs, nunca ela mesma.

O que o protótipo mostra como "Transferência +R$300" é **uma entrada no caixa** (`movimentacao.tipo = 'entrada'`), com a descrição do motivo. O rótulo na interface deve dizer *Entrada* e *Saída*, não "Transferência".

Toda tela que lê dados precisa de três estados: carregando, erro (inclusive sem internet) e vazio.

---

## 8. Identidade visual

- Fundo geral rosa muito claro (`#f8eff3` / `#fdf2f7`), com a marca d'água 3BANK repetida.
- Cards brancos, `border-radius` ~16px, sombra suave e difusa.
- Texto de destaque e divisores em roxo-vinho `--ion-color-tertiary` (`#9b2262`).
- Rosa principal `--ion-color-primary` (`#ff80c3`); apoio em `--ion-color-primary-shade`.
- Títulos de seção em caixa alta, espaçados, entre dois traços horizontais (`—— ANÚNCIOS ——`).
- Ícones do `ionicons`: coração para curtir, avião de papel para enviar, olho para ocultar o total.
- Entrada de dinheiro em verde, saída em vermelho, sempre com o sinal (`+R$300` / `-R$300`).
- Sempre usar as variáveis de `src/theme/variables.css`.
- Layout responsivo para telas de celular.

**Detalhe de CSS que custou tempo:** em componente com `<slot />`, `:slotted(x)` só atinge os **nós raiz** do slot. Para estilizar descendentes é preciso `:slotted(raiz) descendente` — sem isso, os `ion-item` continuam com fundo branco dentro do cartão rosa.

---

## 9. Requisitos (resumo de `docs/3BANK - Requisitos.md`)

**Funcionais:** cadastro e login (RF001, RF009), postagens apenas pelo Administrador (RF002), carteira digital com saldo (RF003), depósito e saque (RF004), galeria de fotos com upload (RF005, RF006, RF015), administrador edita e exclui perfil (RF007), dúvidas com envio, página própria e resposta do admin (RF008, RF012, RF013, RF014), relatório automático de retirada publicado no feed (RF010), feed de notícias (RF011).

**Não funcionais:** interface intuitiva, padronização visual, Android e iOS, segurança dos dados, autenticação por login e senha, mensagens de erro, múltiplas resoluções de tela.

### Rastreabilidade requisito → onde vive

| Requisito | Onde vive |
| --- | --- |
| RF001, RF009, RNF005 | Supabase Auth + tabela `perfil` |
| RF002 | `perfil.is_admin` + política de RLS de `anuncio` |
| RF003 | `caixa` (linha única, coletiva) |
| RF004 | função `registrar_movimentacao` + tabela `movimentacao` |
| RF005, RF006, RF015 | Camera API → Supabase Storage → `galeria` / `post_imagem` |
| RF007 | `perfil` + `on delete cascade` das tabelas filhas |
| RF008, RF012, RF013 | `duvida` |
| RF014 | `resposta`, `duvida.respondida`, política de RLS |
| RF010 | `anuncio.origem = 'automatico'` + `anuncio.id_movimentacao` |
| RF011 | `anuncio`, `post`, `post_imagem`, `curtida` |
| RNF004 | RLS em todas as tabelas + senha gerenciada pelo Supabase Auth |
| — (só no protótipo) | `notificacao`, `curtida`, `anuncio.fixado` |

### Requisitos que precisam ser reescritos

O texto atual de `docs/3BANK - Requisitos.md` descreve o sistema errado em três pontos:

- **RF003** fala em "carteira digital" individual. É um **caixa único coletivo**.
- **RF004** diz que "o usuário realize depósitos e saques em sua carteira". Quem movimenta é **só a comissão**, e a **descrição é obrigatória**.
- **RF002** diz que só o Administrador faz postagens. O correto: só o Administrador publica **avisos**; **posts e fotos são livres**.

Faltam requisitos para notificações, curtidas, obrigatoriedade da descrição e dependência de internet.

---

## 10. Decisões tomadas

1. **O banco é o Supabase (PostgreSQL), na nuvem.** Nada é armazenado no celular como fonte de verdade. Todos os celulares leem e escrevem o **mesmo** caixa.
2. **O app depende de internet.** Sem conexão, as telas de dados não funcionam.
3. **A autenticação é do Supabase Auth.** Não existe tabela de senha no nosso schema.
4. **A permissão é aplicada no banco** (RLS + função `security definer`), não apenas na interface.
5. **A tela inicial mostra o saldo atual do caixa** — entradas menos saídas.
6. **Dias D e eventos são uma tabela** (`evento`), referenciada por movimentações, posts, fotos e avisos.
7. **O cadastro é aberto.** Qualquer pessoa que criar conta vê o caixa do terceirão — então nada de dado sensível na descrição dos lançamentos.
8. **A sessão fica no `Preferences` do Capacitor**, via adapter de storage do supabase-js.
9. **O app usa os componentes e padrões das aulas da UC** (seção 5).
10. **O login é por e-mail e senha**, não por nome de usuário. O protótipo mostra três campos no login, mas o Supabase Auth autentica por e-mail; entrar pelo nome exigiria uma função aberta a quem não está logado traduzindo usuário → e-mail, o que permitiria descobrir quem existe na turma.
11. **O nome de usuário É o nome completo do aluno.** Não existe apelido separado: o cadastro pede só *nome completo*, e esse valor vai para `perfil.nome` e `perfil.nome_usuario`. Consequência: `nome_usuario` é `unique`, então **dois alunos homônimos não conseguem se cadastrar**, e o `@` do protótipo exibe o nome por extenso.
12. **Existem dois tipos de cadastro: aluno e comissão**, escolhidos por dois botões na tela, com o código da comissão validado pelo banco (ver seção 6).
13. **A recuperação de senha é por código de 6 dígitos enviado por e-mail, não por link.** Fluxo: `resetPasswordForEmail(email)` → o aluno digita o código no app → `verifyOtp({ email, token, type: 'recovery' })` cria a sessão → `updateUser({ password })` grava a nova senha. Motivo: num app Capacitor um link abriria o navegador do celular, não o app, e exigiria deep link. Requer que o template **Reset Password** do Supabase mostre `{{ .Token }}` (ver a seção de configuração do painel). A resposta é a mesma exista ou não conta com o e-mail, para não revelar quem tem cadastro.
14. **Fotos: até 4 por post, redimensionadas na captura** (`width: 1000`, `quality: 85`), enviadas ao Storage com o caminho `{id_do_usuario}/{timestamp}-{sufixo}.jpg`. Se o envio de uma foto, a criação do post ou o registro das imagens falhar, o que já foi enviado é desfeito. Isso é feito no cliente, em chamadas separadas, porque o supabase-js não tem transação — pode sobrar um arquivo órfão se a rede cair no meio do desfazer.
15. **Posts e fotos da galeria podem ser apagados pelo dono e pela comissão.** O banco confirma a exclusão: se a RLS recusar, o serviço avisa em vez de fingir que apagou.
16. **Curtidas existem só para posts**, na Home e na página Posts. Fotos da galeria e anúncios ainda não têm coração, embora a tabela e o gatilho de limpeza já os considerem. A curtida não gera notificação ainda (etapa 9). Não há comentários: a tabela não existe.

17. **Na galeria, a legenda fica sobre a foto**, em branco com sombra e um degradê escuro embaixo, para ler bem em qualquer imagem. A foto tem altura fixa de 320px e é cortada para preencher (`object-fit: cover`, aplicado pela `::part(image)` do `ion-img`, porque `object-fit` no próprio `ion-img` não atinge a imagem interna). O mesmo corte vale para a grade dos posts.
18. **A Home mostra o Quadro de anúncios** com os 2 avisos mais recentes (fixados primeiro) e o link "Ver tudo". Anúncio automático de retirada (RF010) ainda não existe.
19. **O perfil mostra os dados da conta sem permitir editá-los**: nome e e-mail são só leitura (a RLS também só libera `nome_usuario`, `nome` e `foto_perfil` para atualização, nunca `is_admin`). O que o usuário altera é a **foto** e a **senha**. A foto aparece também no ícone de perfil do cabeçalho.
20. **A senha é trocada dentro do app confirmando a senha atual**: o app confere a atual com `signInWithPassword` e só então chama `updateUser({ password })`. Assim uma pessoa com o celular desbloqueado não troca a senha sem conhecê-la, e não gasta e-mail (o limite do SMTP é baixo). O fluxo por código de e-mail continua só para quem esqueceu a senha.
21. **Diálogos e action sheets têm fundo branco e texto escuro**, definidos em `src/theme/variables.css`. O fundo geral do tema é `#bd9cad`, e os overlays o herdavam, deixando os botões rosa quase invisíveis. A variável `--ion-overlay-background-color` troca o fundo, e os seletores de texto precisam de mais especificidade que os do Ionic. Diálogos de apagar usam `cssClass: 'alerta-perigo'`, que deixa o botão Apagar vermelho.
22. **As telas de lista recarregam toda vez que voltam a aparecer**, com `onIonViewWillEnter`, e não só quando são criadas (`onMounted`). O Ionic mantém as telas em memória ao navegar; com `onMounted` a Home continuava mostrando um anúncio já apagado. Vale para toda tela nova que leia dados.
23. **A Home tem a seção "Atualizações"**: barra de novo post, os 3 posts mais recentes e o botão VER TODOS OS POSTS. A ordem da Home é saldo, quadro de anúncios, atualizações e atalhos.

---

## 11. Pendências (decisão pendente)

1. **Supabase é aceito na UC?** Nenhuma das aulas lidas ensina banco na nuvem. Confirmar com o professor, porque muda a avaliação do projeto.
2. **Homônimos não se cadastram.** Se acontecer na turma, decidir entre tirar o `unique` ou voltar a ter apelido separado para o `@`.
3. **Promover alguém pelo app.** Hoje só o código concede admin, no momento do cadastro. Quem entrar na comissão depois precisa de `update perfil set is_admin = true ...` no SQL Editor. Uma tela de "gerenciar comissão" resolveria.
4. **Dinheiro: `bigint` em centavos ou `numeric(12,2)`.** Trocar é possível, mas nos dois lados ao mesmo tempo.
5. **Saída maior que o saldo.** Hoje o banco bloqueia. Confirmar se o caixa pode ficar negativo.
6. **Buckets públicos ou privados.** Hoje públicos: quem tiver a URL vê a foto sem login. Para fechar, `public = false` e `createSignedUrl`.
7. **Aviso com data do evento.** Com a tabela `evento`, a data pode sair de `evento.data_evento` em vez do texto.
8. **Moderação dos posts.** Exclusão definitiva ou coluna `removido` — e refletir na RLS.
9. **Aba "Dúvidas".** Está nos requisitos e não aparece em nenhum print. Tabelas prontas, tela não existe.
10. **Comissão que sai.** `id_admin` está com `on delete restrict`. Alternativa: desativar a conta (`perfil.ativo`).
11. **Galeria por turma.** `turma` e `ano` são texto repetido em cada foto. Se guardar vários terceirões, vale a tabela `turma`.
12. **E-mail de recuperação de senha para alunos.** A recuperação está construída (ver decisão 13), mas o e-mail padrão do Supabase só entrega a membros do time do projeto e tem limite de 2 mensagens por hora. Para os alunos receberem o código é preciso configurar um SMTP próprio.
13. **Menções `@fulano`** no texto do post: interpretar na exibição ou criar tabela `mencao`.
14. **Olho de ocultar o total:** estado da tela, a não ser que precise sobreviver ao fechar o app.
15. **Pílulas no topo × `IonTabs`.** Decidir antes de criar as telas — muda a estrutura de rotas.
16. **Conferir a aula 05 (Pinia).** O arquivo não pôde ser lido; a seção 5 descreve Pinia pelo uso nas aulas 07 e 10.

---

## 12. Convenções de código

- Telas em `src/views` e pedaços reutilizáveis em `src/components`, sempre em PascalCase. Stores em `src/stores`, serviços em `src/services`, composables em `src/composables`, migrações em `supabase/migrations`.
- `<script setup lang="ts">` sempre; `ref` e `computed` da Composition API.
- Estilo sempre `<style scoped>`.
- Componentes Ionic no lugar de HTML puro sempre que existir equivalente (seção 5), importados de `@ionic/vue`; ícones de `ionicons/icons`, só os usados.
- Navegação sempre por `useIonRouter()`; rotas novas com lazy loading.
- Nenhum `.vue` importa `supabase` direto — sempre através de um serviço.
- Todo `await supabase...` trata o `error` e mostra mensagem ao usuário.
- Nomes de variáveis, funções, colunas e rotas em português.
- Cada tela nova precisa ser registrada em `src/router/index.ts`.
- **Todo `<ion-modal>` inline vai dentro de `<div class="ancora-modal">`**, e um componente cujo único conteúdo é um modal também precisa dessa `div` como raiz. Ao abrir, o Ionic tira o `ion-modal` do lugar; se o Vue usar esse modal como ponto de referência para inserir itens de uma lista logo antes dele, dá `insertBefore ... is not a child of this node`, a página para de renderizar e a navegação trava (a URL muda, mas a tela não). A `div` é o ponto de referência que nunca se move.
- **Não usar `ion-title` com `width`/`flex` customizados em cabeçalhos.** No iPhone (modo iOS) o Ionic centraliza o `ion-title` em cima de toda a barra, e o "3BANK" passou por cima dos ícones. Para a marca no canto, usar um elemento comum com `slot="end"`. Testar cabeçalhos nos dois modos: o navegador usa o modo Android (`md`), e `?ionic:mode=ios` na URL força o do iPhone.
- Botões que dependem de `usuario.perfil` não podem sair em silêncio quando ele não carregou: mostrar "Sua sessão não carregou. Saia e entre de novo.".
- Toda regra de permissão existe no banco (RLS/função); a interface apenas esconde o que não se pode fazer.
- Rodar `npm run lint` e `npm run build` depois de mexer em código, e relatar o resultado real.
