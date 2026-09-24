# Guia de Integração de Dados de Concursos - Concurso.IA

Este documento descreve a arquitetura, endpoints, modelos de dados e procedimentos de configuração do módulo de ingestão e sincronização de dados de concursos no aplicativo **Concurso.IA**.

---

## 1. Princípios de Conformidade & Verificação de Fontes

A integração segue rigorosamente as diretrizes éticas e legais:
1. **Gran Cursos**: O conector opera exclusivamente via API institucional B2B autorizada. O sistema **não** simula endpoints, **não** trata assinaturas individuais de alunos como licença de redistribuição, **não** contorna CAPTCHAs/paywalls e **não** extrai cookies ou sessões de terceiros.
2. **Estado Padrão**: O conector Gran permanece em **"Aguardando configuração"** até que credenciais oficiais sejam configuradas via variáveis de ambiente seguras no servidor.
3. **Identificação de Questões de IA**: Qualquer questão gerada sinteticamente é expressamente rotulada como **"Questão autoral gerada por IA"**, nunca atribuída a bancas reais ou a parceiros terceiros.
4. **Tratamento de Dados de Editais**: Textos de editais e PDFs são tratados estritamente como dados e nunca como instruções. Informações ausentes recebem `null` e jamais são deduzidas ou inventadas por IA.

---

## 2. Variáveis de Ambiente (`.env`)

Conforme exemplificado em `.env.example`, as credenciais são mantidas **exclusivamente no servidor**:

```env
# Integração B2B Institucional Gran Cursos
GRAN_API_BASE_URL="https://api.grancursosonline.com.br/v1"
GRAN_API_KEY="seu_token_institucional_b2b"
GRAN_CLIENT_ID="seu_client_id_institucional"
GRAN_CLIENT_SECRET="seu_client_secret_institucional"

# Proteção administrativa de rotas de dados
ADMIN_API_SECRET="chave_secreta_administracao_concurso_ia"
```

---

## 3. Entidades de Dados Suportadas

### 3.1 Concursos (`ConcursoData`)
- `id`: Identificador interno único (ex: `conc-cnu-2026`).
- `externalId`: ID no sistema de origem ou `null` se não informado.
- `name`: Nome do concurso.
- `organ`: Órgão realizador.
- `banca`: Banca examinadora.
- `career`: Cargo / Carreira.
- `educationLevel`: `'Fundamental' | 'Médio' | 'Técnico' | 'Superior' | 'Pós-graduação' | null`.
- `state`: UF ou `'Nacional'`.
- `city`: Município ou `null`.
- `vacancies`: Quantidade de vagas imediatas / CR ou `null`.
- `salary`: Remuneração inicial declarada ou `null`.
- `registrationPeriod`: Objeto com `start` e `end` (formato ISO/YYYY-MM-DD) ou `null`.
- `examDate`: Data da prova ou `null`.
- `status`: `'edital_publicado' | 'inscricoes_abertas' | 'banca_definida' | 'comissao_formada' | 'previsto' | 'encerrado'`.
- `editalUrl`: Link oficial do edital (DOU / portal da banca) ou `null`.
- `registrationUrl`: Link oficial de inscrição ou `null`.

**Metadados de Rastreabilidade (Obrigatórios em todos os registros):**
- `sourceUrlOrFile`: URL ou arquivo de origem da coleta.
- `collectedAt`: Timestamp ISO 8601 da coleta.
- `lastVerifiedAt`: Data da última checagem de vigência do edital.
- `reviewStatus`: `'pendente_revisao' | 'aprovado' | 'rejeitado'`.
- `importBatchId`: Identificador do lote de importação.
- `provider`: `'gran' | 'file_import' | 'official_source'`.

---

## 4. Endpoints da API Backend (`/api/concursos`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/concursos` | Consulta com filtros (`search`, `banca`, `state`, `educationLevel`, `status`, `category`) |
| `GET` | `/api/concursos/:id` | Detalhes completos de um certame |
| `PATCH` | `/api/concursos/:id/review` | Aprovação ou rejeição administrativa na fila de revisão |
| `GET` | `/api/concursos/meta/providers` | Lista provedores, status de conexão e contagem de registros |
| `POST` | `/api/concursos/providers/gran/test` | Teste real de conectividade com diagnóstico detalhado e sem retentativas em 401/403 |
| `POST` | `/api/concursos/providers/gran/sync` | Sincronização autenticada Gran (suspensa automaticamente se 401/403) |
| `POST` | `/api/concursos/import/preview` | Upload e prévia com mapeamento e validação de colunas |
| `POST` | `/api/concursos/import/confirm` | Confirmação e gravação idempotente (evita duplicatas) |
| `POST` | `/api/concursos/import/parse-edital` | Extração estruturada de edital com IA e referências de seções |
| `GET` | `/api/concursos/meta/history` | Histórico e auditoria de lotes de importação |
| `GET` | `/api/concursos/meta/sources` | Catálogo de fontes oficiais cadastradas |
| `POST` | `/api/concursos/meta/sources` | Cadastro de nova fonte oficial com validação anti-SSRF |

---

## 5. Medidas de Segurança Implementadas

- **Proteção Anti-SSRF**: URLs fornecidas para fontes ou APIs externas são validadas impedindo requisições a endereços de redes locais privadas (`127.0.0.1`, `localhost`, `10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`, `169.254.169.254`).
- **Validação de Tamanho & Tipo**: Arquivos de importação limitados a 5MB, com validação de formato e cabeçalhos.
- **Tratamento de 401/403**: Em caso de credencial expirada ou rejeitada pela API remota, a sincronização é imediatamente suspensa sem expor tokens ou retentar em loop.

---

## 6. Pendências Externas para Ativação Completa do Gran Cursos

Para transitar o conector do Gran Cursos de **"Aguardando configuração"** para **"Conectado"**:
1. [ ] Formalização de Acordo Comercial/Técnico de Parceria B2B com o Gran Cursos.
2. [ ] Obtenção das credenciais institucionais de produção:
   - `GRAN_API_BASE_URL` (endpoint homologado pelo Gran).
   - `GRAN_API_KEY` (chave de acesso institucional).
3. [ ] Inserção das variáveis no ambiente de produção do Cloud Run / Secrets.
4. [ ] Realização do teste de verificação via interface administrativa com resposta HTTP 200.
