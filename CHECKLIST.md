
---

## Fase 1: Setup e Infraestrutura
- [X] Inicializar projeto Next.js com TypeScript e Tailwind CSS (`npx create-next-app@latest`).
- [X] Criar projeto no **Supabase** e executar o script SQL de criação da tabela `participants`.
- [x] Configurar o arquivo `.env.local` com as chaves do Supabase, Resend, `ADMIN_PASSWORD` e `NEXT_PUBLIC_APP_URL`.
- [x] Instalar pacotes necessários (`@supabase/supabase-js`, `lucide-react`).
- [x] Configurar cliente do Supabase apenas para o lado do servidor (`lib/supabase.ts`).

---

## Fase 2: Tela Inicial e Cadastro (`/` — Módulo 1)
- [x] **[RNF01]** Criar layout base Mobile-First (`max-w-md mx-auto min-h-screen`) com tema visual de verão/chinelas.
- [x] **[RF01]** Construir formulário de cadastro:
  - [x] Input de **Nome Completo**.
  - [x] Input de **WhatsApp** com máscara `(99) 99999-9999` e `inputMode="numeric"`.
  - [x] Grade de botões selecionáveis para **Tamanho do Chinelo** (`33-34`, `35-36`, `37-38`, `39-40`, `41-42`, `43-44`, `45-46`).
  - [x] Input de **PIN de 4 dígitos** (`maxLength={4}`, `inputMode="numeric"`).
- [ ] **[RF02]** Criar Server Action / API de cadastro validando se `phone` ou `email` já existem no banco (retornar mensagem amigável se duplicado).
- [ ] **[RF03]** Criar listagem pública na tela inicial exibindo apenas o nome dos participantes cadastrados (`🩴 Fulano`) e o total de inscritos.
- [ ] **[RF04]** Verificar se o sorteio já foi realizado (ex: checando se os registros possuem `drawn_id != null`). Se sim, ocultar o formulário e mostrar o card de *"Sorteio já realizado!"*.

---

## Fase 3: Painel do Organizador (`/admin` — Módulo 2)
- [ ] **[RF05]** Criar tela de login simples em `/admin` validando a senha com `ADMIN_PASSWORD` (salvar sessão em cookie HTTP-only ou estado local).
- [ ] **[RF06]** Listar tabela de inscritos no painel contendo: Nome, WhatsApp, E-mail, Tamanho do Chinelo e o **PIN**.
- [ ] **[RF06]** Adicionar funcionalidade para **Editar** dados de um participante (ex: corrigir telefone, e-mail ou tamanho) e **Excluir** participante (habilitado apenas antes do sorteio).
- [ ] **[RF07]** Implementar a função de **Sorteio em Fila Circular** no back-end:
  - [ ] Validar se há no mínimo 3 participantes cadastrados.
  - [ ] Embaralhar a lista de participantes aleatoriamente (*Fisher-Yates*).
  - [ ] Vincular cada participante ao próximo da lista (`participante[i].drawn_id = participante[i + 1].id`) e o último ao primeiro (`participante[ultimo].drawn_id = participante[0].id`).
  - [ ] Salvar todos os pares no banco de dados.
- [ ] **[RF10]** Exibir coluna de status de visualização (`⏳ Pendente` quando `viewed_at` for nulo, ou `✅ Já viu` com data/hora formatada).
- [ ] **[RF11]** Criar botão **"Resetar Sorteio"** com confirmação dupla que limpa `drawn_id = null`, `viewed_at = null` e `whatsapp_sent = false` de todos os registros.

---

## Fase 4: Notificações Sem Spoiler (E-mail e WhatsApp)
- [ ] **[RF08]** Integrar **Resend** na função de sorteio para disparar um e-mail a cada participante contendo apenas o convite e o link `https://seusite.vercel.app/sorteio/[secret_token]` (sem mencionar quem foi sorteado).
- [ ] **[RF08]** Adicionar botão **"📧 Reenviar E-mail"** individual na linha de cada participante no painel `/admin`.
- [ ] **[RF09]** Adicionar botão **"📲 Enviar WhatsApp"** na linha de cada participante no `/admin`:
  - [ ] Gerar URL `https://wa.me/55[TELEFONE]?text=[MENSAGEM_COM_LINK_DO_TOKEN]` (sem mencionar quem foi sorteado).
  - [ ] Ao clicar no botão, atualizar `whatsapp_sent = true` no banco e mudar a cor/texto do botão para `"✅ WhatsApp Clicado"`.

---

## Fase 5: Revelação Protegida (`/sorteio/[token]` — Módulo 3)
- [ ] **[RF12]** Criar página dinâmica `/sorteio/[token]` que busca no servidor apenas o `name` do dono do `secret_token` (retornar página de erro caso o token não exista ou o sorteio ainda não tenha ocorrido).
- [ ] **[RF12]** Exibir tela bloqueada: *"Olá [Fulano]! Digite seu PIN de 4 dígitos para revelar quem você tirou"* com campo numérico de 4 dígitos e botão de confirmar.
- [ ] **[RF13]** Criar Server Action / API de validação do PIN:
  - [ ] Receber `secret_token` e `pin`.
  - [ ] Verificar se o PIN está correto para aquele token (retornar erro `"PIN incorreto"` se falhar).
  - [ ] Se correto e `viewed_at` estiver vazio, gravar `NOW()` no campo `viewed_at`.
  - [ ] Buscar e retornar apenas o `name` e o `shoe_size` do participante referenciado em `drawn_id`.
- [ ] **[RF14]** Exibir na tela o resultado desbloqueado no formato exato:
  > **“Olá [Fulano], você tirou:**
  > 
  > **Nome:** [Siclano da Silva] **Tamanho:** [35-36]”

---

## Fase 6: Testes Finais e Deploy
- [ ] Cadastrar 4 usuários fictícios na tela inicial e testar a trava de e-mail/telefone duplicado.
- [ ] Entrar no `/admin`, realizar o sorteio e verificar se o formulário da tela inicial bloqueou novas inscrições.
- [ ] Testar o clique no botão de WhatsApp e verificar se o link abre corretamente sem dar spoiler do sorteado.
- [ ] Abrir o link `/sorteio/[token]` de um usuário, testar um PIN errado (deve bloquear) e depois o PIN certo (deve exibir o nome e tamanho do sorteado).
- [ ] Verificar no `/admin` se o status do usuário mudou para `✅ Já viu`.
- [ ] Usar o botão **"Resetar Sorteio"** para limpar o banco de testes.
- [ ] Subir o repositório no GitHub, conectar na **Vercel**, configurar as variáveis de amb