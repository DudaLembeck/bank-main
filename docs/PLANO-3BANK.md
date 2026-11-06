# PLANO DE PRODUÇÃO — 3BANK

Ordem de construção do app até ele rodar no celular. Companheiro de `docs/CONTEXTO-3BANK.md`, que continua sendo a fonte das regras — este aqui diz **o que fazer e em que ordem**.

Cada etapa tem: o que construir, de que depende, e **como saber que ficou pronta**. Não comece uma etapa sem fechar a anterior: a ordem existe porque cada uma usa o que a outra deixou pronto.

---

## Estado atual

**Pronto, no servidor:** o banco no Supabase (projeto `fvatsruiaqzgmxgckeal`) está completo e verificado — 12 tabelas, RLS em todas, função `registrar_movimentacao` protegida, buckets de imagem criados, código da comissão funcionando.

**Nesta pasta:** a **etapa 0 está feita** — dependências, migrações versionadas, cliente Supabase, serviço de autenticação, store do usuário, telas de login e cadastro e guard de rota. Falta só o `.env` com a chave publicável, que não entra no git.

**Etapas 1 e 2 construídas** — compilam e passam no lint e no build, mas **ainda sem teste com conta logada**: cabeçalho, pílulas, extrato com lançamento da comissão e tela de eventos. A tela de eventos não estava no plano original; entrou por decisão da Maria, para o lançamento poder apontar para um dia D. A próxima etapa é a **3** (Home), depois a **4** (Avisos).

**Etapas 5, 6 e 7 construídas em 05/11/2026**, sem teste com conta logada: câmera e Storage, galeria com envio e exclusão, posts com até 4 fotos e exclusão, e a recuperação de senha por código (que não estava no plano original). **Curtidas** ficaram de fora e entram junto com as notificações, na etapa 9.

---

## Como cada tela é construída

Vale para todas. Repetir isso em cada tela evita retrabalho:

1. **Serviço primeiro** (`src/services/xService.ts`) — as consultas ao Supabase, isoladas. Nenhum `.vue` importa `supabase` direto.
2. **Store, só se o dado for usado em mais de uma tela** (`src/stores/`). Saldo e usuário sim; lista de uma tela só, não.
3. **Tela** em `src/views/`, com `IonPage > IonHeader > IonToolbar` + `IonContent`.
4. **Rota** em `src/router/index.ts`, com lazy loading e `meta: { requerLogin: true }`.
5. **Três estados obrigatórios**: carregando (`IonSpinner`), erro (mensagem + botão tentar de novo) e vazio ("sem anúncios ainda"). Sem isso a tela trava sem explicação quando a internet cai.
6. **Permissão**: esconder da interface o que a pessoa não pode fazer — lembrando que quem garante é a RLS, não o `v-if`.

---

## Etapa 0 — Base do app (CONCLUÍDA, menos o `.env`)

Sem isto, nada roda.

**Dependências:**

```bash
npm install
```

```bash
npm install @supabase/supabase-js @capacitor/preferences pinia
```

**Ambiente:** criar `.env` na raiz com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (a chave publicável está em *Project Settings → API*; **não** é a `service_role`). Antes disso, **acrescentar `.env` ao `.gitignore`** — ele não está lá.

**Migrações:** recriar os arquivos `.sql` em `supabase/migrations/` a partir do schema da seção 6 do contexto. O banco no servidor **já tem tudo aplicado** — os arquivos são para o projeto não depender da memória do painel, e para alguém conseguir recriar o banco do zero.

**Código base:**

- `src/services/supabase.ts` — cliente único, com a sessão indo para o `Preferences`.
- `src/services/authService.ts` — `entrar`, `cadastrar`, `sair`, `buscarSessao`, `buscarPerfil`, `observarSessao`, e a tradução das mensagens de erro do Supabase para português.
- `src/stores/usuario.ts` — `logado`, `ehComissao`, `nomeExibicao`, `inicializar()`.
- `src/views/LoginPage.vue` e `src/views/CadastroPage.vue` — conforme a seção 7 do contexto.
- `src/components/CartaoFormulario.vue`, `MarcaTopo.vue`, `TituloSecao.vue`.
- `src/router/index.ts` com guard `requerLogin` / `somenteVisitante`; `src/main.ts` com Pinia e `inicializar()` antes de montar.

**Pronto quando:** `npm run lint` e `npm run build` passam, dá para criar uma conta pelo app, entrar, e `/home` redireciona para `/login` quando ninguém está logado.

---

## Etapa 1 — Esqueleto de navegação (CONSTRUÍDA)

**Por quê antes das telas:** todas dependem do cabeçalho e das pílulas. Fazer uma vez evita copiar e colar em sete lugares.

- `src/components/CabecalhoApp.vue` — ícone de perfil (vai para `/perfil`), sino de notificações (vai para `/notificacoes`), "Bem vindo(a), {nome}" vindo da store, logo 3BANK.
- `src/components/PilhasNavegacao.vue` — as pílulas brancas do topo. Recebe quais mostrar; usa `IonButton` + `router-link` + `router-direction`.
- Registrar `/anuncios`, `/posts`, `/galeria`, `/extrato`, `/notificacoes`, `/perfil` apontando para telas com só o cabeçalho.

**Pronto quando:** dá para navegar entre as sete telas pelas pílulas, com cabeçalho igual em todas, e o botão voltar do Android funciona.

---

## Etapa 2 — Caixa: saldo e extrato (CONSTRUÍDA, falta testar logado)

O coração do app. Antes da parte social, porque é o que justifica o projeto.

**Serviço** `src/services/caixaService.ts`:

| Função | O que faz |
| --- | --- |
| `buscarSaldo()` | `select` em `caixa` |
| `listarMovimentacoes(limite, pagina)` | `select` em `movimentacao`, `order by data desc`, com o nome do admin por join em `perfil` |
| `registrarMovimentacao(tipo, valorCentavos, descricao, idEvento?)` | chama o RPC `registrar_movimentacao` |

**Store** `src/stores/caixa.ts`: guarda `saldoCentavos`. Aparece na Home e no Extrato — por isso vira store.

**Conversão de dinheiro** (`src/services/dinheiro.ts`), para centavos não vazarem para a tela:

```ts
export function paraCentavos(valor: string): number {
  const limpo = valor.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.')
  return Math.round(Number(limpo) * 100)
}

export function formatarReal(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
```

**Tela `/extrato`:** `IonList` + `IonItem` + `IonLabel` (`<h2>` valor, `<p>` descrição), `IonNote` com a data no `slot="end"`, verde para entrada e vermelho para saída, sempre com sinal.

**Só para comissão:** botão que abre um `IonModal` com tipo (entrada/saída), valor e **descrição obrigatória**. Confirmar com `alertController` antes de gravar — é dinheiro.

**Pronto quando:** a comissão lança uma entrada e o saldo muda; um aluno logado vê o lançamento e **não** vê o botão; saída maior que o saldo mostra erro em português em vez de quebrar.

---

## Etapa 3 — Tela inicial (CONSTRUÍDA, falta testar logado)

Já feito: card do saldo com olho de ocultar e "Ver extrato", e lista de atalhos para extrato, eventos, anúncios, posts e galeria — sem isso não havia caminho para as telas internas. **Falta:** a prévia do último post. O card-imagem "Galeria de turmas" do protótipo virou um atalho comum até existir foto.

Agora que o saldo existe, a Home tem o que mostrar.

Conforme o print: card do saldo (`formatarReal`, olho de ocultar, "Ver extrato" → `/extrato`), card-imagem "GALERIA DE TURMAS" → `/galeria`, "Quadro de Anúncios" com o último aviso + "Ver tudo", divisor "ATUALIZAÇÕES" e card "Posts" com o post mais recente.

São três consultas pequenas: saldo, último anúncio (`fixado desc, data desc limit 1`), último post.

**Pronto quando:** abrir o app logado cai numa Home com dados reais do banco, não texto fixo.

---

## Etapa 4 — Avisos (anúncios) (CONSTRUÍDA, falta testar logado)

**Serviço** `anuncioService.ts`: `listar()`, `publicar(texto, idEvento?)`, `fixar(id, valor)`, `remover(id)`.

Tela `/anuncios` com a lista; o formulário de publicar aparece **só** se `ehComissao`. A RLS já recusa se alguém burlar.

**Pronto quando:** admin publica e o aviso aparece no topo da lista e na Home; aluno vê a lista sem formulário.

---

## Etapa 5 — Fotos: câmera e Storage (CONSTRUÍDA, falta testar no navegador logado)

A parte que mais dá trabalho, por isso vem antes dos posts, que dependem dela.

- Instalar `@capacitor/camera` e rodar `npx cap sync`.
- `src/composables/useCamera.ts` conforme a aula 10: `getPhoto` com `DataUrl`, `quality: 90`, `width: 800`, `carregando`, cancelamento tratado em silêncio.
- `src/services/imagemService.ts`: recebe o base64, converte para `Blob`, envia com `supabase.storage.from(bucket).upload(caminho, blob)` e devolve o caminho. Caminho sugerido: `{id_do_usuario}/{timestamp}.jpg`.
- Declarar `CAMERA` e `READ_MEDIA_IMAGES` no `AndroidManifest.xml`.

**Pronto quando:** dá para escolher uma foto pelo navegador (no `ionic serve` a câmera vira seletor de arquivo) e a imagem aparece no bucket pelo painel do Supabase.

---

## Etapa 6 — Galeria (CONSTRUÍDA, falta testar logado)

Tela `/galeria` com os cards de foto e legenda ("Terceiro 2 - Turma de 2023"), e botão de enviar foto para qualquer pessoa logada.

**Serviço** `galeriaService.ts`: `listar()`, `enviar(caminho, legenda, turma, ano, idEvento?)`, `remover(id)`.

**Pronto quando:** uma foto enviada por você aparece para outra conta logada.

---

## Etapa 7 — Posts e curtidas (CONSTRUÍDA para posts; falta testar logado)

**Serviço** `postService.ts`: `listar()` trazendo autor e imagens, `publicar(texto, caminhos[])` gravando `post` + `post_imagem` com `ordem`, `remover(id)`.

**Serviço** `curtidaService.ts`: `curtir(alvoTipo, alvoId)`, `descurtir(...)`, `contar(...)`. Coração cheio/vazio com ternário no `:icon`, como na aula 04.

**Atenção:** apagar um post **não** apaga curtidas e notificações dele — a chave polimórfica não é validada pelo banco. Limpar no serviço, junto da exclusão.

**Pronto quando:** publicar post com duas fotos, curtir, descurtir, e o contador bater ao recarregar.

---

## Etapa 8 — Perfil (CONSTRUÍDA, falta testar logado)

Tela `/perfil`: avatar grande (trocável pela câmera), nome completo, salvar alterações.

Lembrar: `is_admin` **não** é editável — a permissão de escrita nessa coluna foi revogada. Mostrar o papel ("Comissão" ou "Aluno") como texto, sem controle.

**Pronto quando:** trocar a foto e o nome persiste depois de fechar e abrir o app.

---

## Etapa 9 — Notificações

Depende de tudo acima, porque é gerada pelo que os outros fazem.

Precisa de **migração nova** com gatilhos: ao inserir `curtida`, criar `notificacao` para o dono do alvo; ao inserir `movimentacao`, notificar todos (o RF010 também publica o aviso automático aqui).

Tela `/notificacoes`: lista das próprias, `IonBadge` com não lidas no sino, marcar como lida ao abrir.

**Pronto quando:** curtir o post de outra conta gera notificação para ela, e não para você.

---

## Etapa 10 — Tempo real e offline

- Inscrever a Home nas mudanças de `caixa` (`postgres_changes`), cancelando no `onUnmounted`.
- `@capacitor/network`: avisar na tela quando a conexão cair, em vez de deixar a consulta falhar calada.

**Pronto quando:** com o app aberto em dois navegadores, lançar um valor em um atualiza o saldo no outro sem recarregar.

---

## Etapa 11 — Android

```bash
npm run build
```

```bash
npx cap sync
```

```bash
npx cap run android
```

Depois: ícone e splash, `appId` de verdade no `capacitor.config.ts` (o template vem com `io.ionic.starter`), e **remover qualquer bloco `server: { url, cleartext }`** antes de gerar o APK final.

**Pronto quando:** o APK instala num celular de verdade e o fluxo completo funciona — cadastrar, entrar, ver saldo, publicar foto.

---

## O que deixar para o fim (ou cortar)

Estão nos requisitos ou no protótipo, mas não bloqueiam nada:

- **Aba Dúvidas** (RF008, RF012–RF014) — tabelas prontas, tela não existe, não aparece em nenhum print.
- ~~**"Esqueceu sua senha?"**~~ — construída, por código de 6 dígitos. Falta configurar o template do e-mail e um SMTP próprio para os alunos (ver o contexto).
- **Tela de gerenciar comissão** — promover alguém depois do cadastro. Hoje é SQL na mão.
- **Menções `@fulano`** nos posts.
- **Filtro por evento/dia D** com `IonChip` — o banco já suporta (`id_evento`), falta a tela.

---

## Riscos conhecidos

| Risco | Quando aparece | O que fazer |
| --- | --- | --- |
| Homônimos não se cadastram | duas pessoas com o mesmo nome completo | tirar o `unique` ou voltar com apelido separado |
| Saldo travado em zero | comissão tenta lançar saída antes de qualquer entrada | o `check` do banco recusa; é o comportamento escolhido |
| Fotos pesadas | upload lento no 4G da escola | já limitado a `width: 800`; reduzir mais se preciso |
| Buckets públicos | link de foto vaza | trocar para privado e usar `createSignedUrl` |
| Código da comissão vazado | um aluno vira admin | desativar o código e criar outro; contas já criadas continuam admin |
| Perder o código de novo | outra cópia do projeto sem os arquivos | manter tudo numa pasta só e versionar com git |

---

## Ordem resumida

```
0. Recriar a base (deps, .env, migrações, login/cadastro)
1. Esqueleto (cabeçalho + pílulas + rotas)
2. Caixa (saldo, extrato, lançamento)      ← o coração
3. Home
4. Avisos
5. Câmera + Storage                        ← destrava 6 e 7
6. Galeria
7. Posts e curtidas
8. Perfil
9. Notificações (precisa de migração)
10. Tempo real e offline
11. Android
```

As etapas 0 a 4 já entregam um app demonstrável: entra, vê o caixa do terceirão, vê os avisos. Se o prazo apertar, é um ponto de parada honesto.
