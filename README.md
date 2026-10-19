# 🩴 Amigo Chinela — Sistema de Sorteio Mobile-First

Aplicação web Mobile-First para gerenciamento e sorteio de Amigo Oculto temático de chinelas. Os participantes se cadastram informando o tamanho do calçado e um PIN numérico de segurança. O sorteio é realizado em fila circular pelo administrador, com disparo automático de e-mail e geração de links diretos para WhatsApp sem revelar o resultado nas notificações.

---

## 🚀 Stack Tecnológica e Arquitetura

* **Front-end & Back-end:** Next.js (App Router + Server Actions / API Routes)
* **Estilização:** Tailwind CSS (Design Mobile-First, tema tropical/verão)
* **Banco de Dados:** Supabase (PostgreSQL) — *Acesso exclusivo via Back-end*
* **Envio de E-mails:** Resend API
* **Envio de WhatsApp:** Links dinâmicos `wa.me` acionados pelo painel Admin
* **Hospedagem:** Vercel

---

## 🔐 Fluxo de Segurança e Uso

1. **Inscrição (`/`):** O participante preenche Nome, WhatsApp, E-mail, Tamanho do Chinelo e cria um **PIN de 4 dígitos**.
2. **Sorteio (`/admin`):** O organizador aciona o sorteio. O back-end embaralha a lista em ciclo único ($A \rightarrow B \rightarrow C \rightarrow A$), salva no banco e dispara os e-mails automaticamente.
3. **Notificação (Sem Spoiler):** O participante recebe no E-mail e no WhatsApp apenas o seu link exclusivo (`/sorteio/[token]`), sem o nome de quem tirou para evitar que terceiros vejam na tela bloqueada do celular.
4. **Revelação (`/sorteio/[token]`):** O participante abre o link, digita seu **PIN de 4 dígitos** e o sistema exibe na tela quem ele tirou e a numeração do chinelo.

---

## 📋 Levantamento de Requisitos

### 📦 Módulo 1: Participante (Pré-Sorteio — Rota `/`)

| Código | Requisito | Regra de Negócio / Detalhe Técnico |
| :--- | :--- | :--- |
| **RF01** | **Cadastro com PIN (5 Campos)** | O formulário solicita: **Nome Completo**, **WhatsApp** (com máscara), **E-mail**, **Tamanho do Chinelo** (`33-34` a `45-46` em botões grandes) e **PIN de 4 dígitos**. |
| **RF02** | **Prevenção de Duplicidade** | Valida no banco se o WhatsApp ou E-mail já existe antes de salvar, evitando inscrições duplicadas. |
| **RF03** | **Mural de Participantes** | Exibe abaixo do formulário a lista de participantes confirmados (`🩴 Nome`) e o contador total. |
| **RF04** | **Trava Pós-Sorteio** | Após a realização do sorteio, oculta o formulário de inscrição e exibe o aviso para conferirem o WhatsApp ou E-mail. |

### 🛠️ Módulo 2: Painel do Organizador (Rota `/admin`)

| Código | Requisito | Regra de Negócio / Detalhe Técnico |
| :--- | :--- | :--- |
| **RF05** | **Acesso por Senha Mestre** | Rota protegida pela variável de ambiente `ADMIN_PASSWORD`. |
| **RF06** | **Gestão de Inscritos e PINs** | Tabela com Nome, WhatsApp, E-mail, Tamanho do Chinelo e **PIN** (para suporte). Permite editar dados ou excluir participantes antes do sorteio. |
| **RF07** | **Motor de Sorteio (Fila Circular)** | Exige mínimo de 3 participantes. Embaralha a lista (*Fisher-Yates*) e vincula em fila circular ($A \rightarrow B \rightarrow C \rightarrow A$), garantindo zero auto-sorteio. |
| **RF08** | **Disparo Automático de E-mail** | Ao sortear, envia e-mails via **Resend** contendo apenas o link `/sorteio/[token]`. Possui botão para reenvio individual. |
| **RF09** | **Disparo Rápido WhatsApp (`wa.me`)** | Botão **"📲 Enviar WhatsApp"** ao lado de cada nome com texto + link exclusivo prontos. Marca o registro como `whatsapp_sent = true` ao clicar. |
| **RF10** | **Monitoramento de Visualização** | Exibe na tabela o status `⏳ Pendente` ou `✅ Já viu (Data/Hora)`, atualizado somente após o participante acertar o PIN. |
| **RF11** | **Reset do Sorteio** | Botão com confirmação dupla para limpar os pares sorteados (`drawn_id`, `viewed_at`, `whatsapp_sent`), permitindo testes prévios. |

### 🩴 Módulo 3: Página de Revelação Protegida (Rota `/sorteio/[token]`)

| Código | Requisito | Regra de Negócio / Detalhe Técnico |
| :--- | :--- | :--- |
| **RF12** | **Tela de Bloqueio por PIN** | Carrega apenas o nome do dono do token e solicita o PIN de 4 dígitos. Os dados do sorteado não trafegam na rede antes da validação. |
| **RF13** | **Validação de PIN no Back-end** | Valida se o `pin` corresponde ao `secret_token`. Se correto, grava a data/hora em `viewed_at` (se vazio) e retorna o nome e tamanho do sorteado. |
| **RF14** | **Mensagem de Revelação** | Exibe em destaque na tela:<br><br>**“Olá [Fulano], você tirou:**<br>**Nome:** [Siclano da Silva] **Tamanho:** [35-36]” |

### 📱 Módulo 4: Requisitos Não Funcionais

| Código | Requisito | Regra de Negócio / Detalhe Técnico |
| :--- | :--- | :--- |
| **RNF01** | **Design Mobile-First Temático** | Container centralizado (`max-w-md`), paleta de verão/praia, seletores de tamanho táteis e teclado numérico nativo (`inputMode="numeric"`). |
| **RNF02** | **Isolamento de Dados no Back-end** | Comunicação com o banco feita exclusivamente via servidor do Next.js. Nenhuma rota pública expõe a coluna `drawn_id`. |

---

## 🗄️ Esquema do Banco de Dados (SQL)

Execute o script abaixo no **SQL Editor** do Supabase:

```sql
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  shoe_size TEXT NOT NULL,                  -- Ex: '35-36'
  pin VARCHAR(4) NOT NULL,                  -- Senha de 4 dígitos (Ex: '1234')
  secret_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  drawn_id UUID REFERENCES participants(id), -- ID de quem essa pessoa tirou
  whatsapp_sent BOOLEAN DEFAULT FALSE,       -- Controle de envio no Admin
  viewed_at TIMESTAMP WITH TIME ZONE,        -- Preenchido ao acertar o PIN
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);