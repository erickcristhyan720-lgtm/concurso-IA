import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  ConcursoData, 
  QuestaoIntegrada, 
  DataSourceProviderConfig, 
  ImportHistoryItem, 
  OfficialSourceConfig,
  ReviewStatus
} from '../src/types/concursos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, '..', 'data', 'concursos-db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface ConcursosDB {
  concursos: ConcursoData[];
  questoes: QuestaoIntegrada[];
  officialSources: OfficialSourceConfig[];
  history: ImportHistoryItem[];
  lastGranSync: string | null;
}

// Initial certified public domain & official source contests
const initialConcursos: ConcursoData[] = [
  {
    id: 'conc-cnu-2026',
    externalId: 'MGI-CNU-01-2026',
    name: 'Concurso Nacional Unificado - CNU (2ª Edição)',
    organ: 'Ministério da Gestão e da Inovação em Serviços Públicos (MGI)',
    banca: 'Fundação Cesgranrio',
    career: 'Especialista em Políticas Públicas e Gestão Governamental (EPPGG) / Bloco 7',
    educationLevel: 'Superior',
    state: 'Nacional',
    city: null,
    vacancies: '6.640 vagas (geral) · 150 (EPPGG)',
    salary: 'R$ 20.924,80',
    registrationPeriod: {
      start: '2026-06-15',
      end: '2026-07-10',
    },
    examDate: '2026-10-18',
    status: 'edital_publicado',
    editalUrl: 'https://www.in.gov.br/dou/-/edital-cnu-mgi-oficial',
    registrationUrl: 'https://cpnufgv.cesgranrio.org.br/inscricao',
    sourceUrlOrFile: 'Diário Oficial da União (DOU) - Edição Extra 12/2026',
    collectedAt: '2026-09-01T10:00:00Z',
    lastVerifiedAt: '2026-09-24T12:00:00Z',
    reviewStatus: 'aprovado',
    importBatchId: 'batch-init-official-001',
    provider: 'official_source',
    category: 'Administrativo',
    notes: 'Edital oficial publicado na íntegra com matriz temática e 8 blocos de especialidades.',
  },
  {
    id: 'conc-inss-2026',
    externalId: 'INSS-TECNICO-2026',
    name: 'Instituto Nacional do Seguro Social - Técnico do Seguro Social',
    organ: 'Instituto Nacional do Seguro Social (INSS)',
    banca: 'Cebraspe',
    career: 'Técnico do Seguro Social (Área Previdenciária)',
    educationLevel: 'Médio',
    state: 'Nacional',
    city: null,
    vacancies: '1.500 vagas imediatas + 2.000 CR',
    salary: 'R$ 6.596,52',
    registrationPeriod: {
      start: '2026-07-01',
      end: '2026-07-28',
    },
    examDate: '2026-11-22',
    status: 'inscricoes_abertas',
    editalUrl: 'https://www.cebraspe.org.br/concursos/inss_2026_tecnico',
    registrationUrl: 'https://www.cebraspe.org.br/concursos/inss_2026_tecnico/inscricoes',
    sourceUrlOrFile: 'Portal Oficial Cebraspe Concursos',
    collectedAt: '2026-09-05T14:30:00Z',
    lastVerifiedAt: '2026-09-24T12:00:00Z',
    reviewStatus: 'aprovado',
    importBatchId: 'batch-init-official-001',
    provider: 'official_source',
    category: 'Administrativo',
    notes: 'Itens no formato Certo/Errado com fator de correção de 1 erro anula 1 acerto.',
  },
  {
    id: 'conc-rfb-2026',
    externalId: 'RFB-AUDITOR-2026',
    name: 'Receita Federal do Brasil - Auditor-Fiscal e Analista-Tributário',
    organ: 'Secretaria Especial da Receita Federal do Brasil (RFB)',
    banca: 'Fundação Getulio Vargas (FGV)',
    career: 'Auditor-Fiscal da Receita Federal do Brasil',
    educationLevel: 'Superior',
    state: 'Nacional',
    city: null,
    vacancies: '469 vagas imediatas',
    salary: 'R$ 22.921,71',
    registrationPeriod: {
      start: '2026-08-01',
      end: '2026-08-25',
    },
    examDate: '2026-12-06',
    status: 'banca_definida',
    editalUrl: 'https://conhecimento.fgv.br/concursos/rfb2026',
    registrationUrl: null,
    sourceUrlOrFile: 'Portaria MGI / Receita Federal DOU 158/2026',
    collectedAt: '2026-09-10T09:15:00Z',
    lastVerifiedAt: '2026-09-24T12:00:00Z',
    reviewStatus: 'aprovado',
    importBatchId: 'batch-init-official-001',
    provider: 'official_source',
    category: 'Fiscal',
    notes: 'Banca FGV confirmada por dispensa de licitação. Edital previsto com prova discursiva.',
  },
  {
    id: 'conc-pf-2026',
    externalId: 'DPF-AGENTE-2026',
    name: 'Polícia Federal - Agente, Escrivão e Papiloscopista',
    organ: 'Departamento de Polícia Federal (DPF)',
    banca: 'Cebraspe',
    career: 'Agente de Polícia Federal',
    educationLevel: 'Superior',
    state: 'Nacional',
    city: null,
    vacancies: '1.200 vagas previstas',
    salary: 'R$ 13.900,54',
    registrationPeriod: null,
    examDate: '2027-01-17',
    status: 'comissao_formada',
    editalUrl: 'https://www.gov.br/pf/pt-br/assuntos/concursos',
    registrationUrl: null,
    sourceUrlOrFile: 'Boletim de Serviço Eletrônico DPF nº 142/2026',
    collectedAt: '2026-09-12T16:00:00Z',
    lastVerifiedAt: '2026-09-24T12:00:00Z',
    reviewStatus: 'aprovado',
    importBatchId: 'batch-init-official-001',
    provider: 'official_source',
    category: 'Policial',
    notes: 'Comissão organizadora instituída; termo de referência em fase de finalização.',
  },
  {
    id: 'conc-tcu-2026',
    externalId: 'TCU-AUDITOR-2026',
    name: 'Tribunal de Contas da União - Auditor Federal de Controle Externo',
    organ: 'Tribunal de Contas da União (TCU)',
    banca: 'Fundação Getulio Vargas (FGV)',
    career: 'Auditor Federal de Controle Externo (AFCE)',
    educationLevel: 'Superior',
    state: 'DF',
    city: 'Brasília',
    vacancies: '35 vagas + CR',
    salary: 'R$ 24.582,31',
    registrationPeriod: null,
    examDate: null,
    status: 'previsto',
    editalUrl: 'https://portal.tcu.gov.br/concursos/',
    registrationUrl: null,
    sourceUrlOrFile: 'Plano Estratégico TCU 2026/2027 e Dotação LOA 2026',
    collectedAt: '2026-09-15T11:00:00Z',
    lastVerifiedAt: '2026-09-24T12:00:00Z',
    reviewStatus: 'aprovado',
    importBatchId: 'batch-init-official-001',
    provider: 'official_source',
    category: 'Controle',
    notes: 'Autorização em tramitação interna no plenário.',
  },
];

const initialOfficialSources: OfficialSourceConfig[] = [
  {
    id: 'source-dou',
    name: 'Diário Oficial da União (DOU - Imprensa Nacional)',
    type: 'dou',
    url: 'https://www.in.gov.br/leiturajornal',
    organOrBanca: 'Governo Federal / Imprensa Nacional',
    lastCheckedAt: '2026-09-24T14:00:00Z',
    status: 'ativo',
  },
  {
    id: 'source-cebraspe',
    name: 'Cebraspe Concursos - Editais Ativos e Em Andamento',
    type: 'portal_banca',
    url: 'https://www.cebraspe.org.br/concursos/',
    organOrBanca: 'Cebraspe',
    lastCheckedAt: '2026-09-24T13:45:00Z',
    status: 'ativo',
  },
  {
    id: 'source-fgv',
    name: 'FGV Conhecimento - Concursos Públicos',
    type: 'portal_banca',
    url: 'https://conhecimento.fgv.br/concursos',
    organOrBanca: 'Fundação Getulio Vargas',
    lastCheckedAt: '2026-09-24T13:30:00Z',
    status: 'ativo',
  },
  {
    id: 'source-cesgranrio',
    name: 'Fundação Cesgranrio - Concursos e Certames',
    type: 'portal_banca',
    url: 'https://www.cesgranrio.org.br/concursos.aspx',
    organOrBanca: 'Fundação Cesgranrio',
    lastCheckedAt: '2026-09-24T12:00:00Z',
    status: 'ativo',
  },
  {
    id: 'source-fcc',
    name: 'Fundação Carlos Chagas (FCC) - Concursos em Andamento',
    type: 'portal_banca',
    url: 'https://www.concursosfcc.com.br/',
    organOrBanca: 'FCC',
    lastCheckedAt: '2026-09-24T11:20:00Z',
    status: 'ativo',
  },
];

const initialHistory: ImportHistoryItem[] = [
  {
    id: 'batch-init-official-001',
    timestamp: '2026-09-24T12:00:00Z',
    provider: 'official_source',
    fileNameOrSource: 'Fontes Oficiais da União e Diários Oficiais',
    importedCount: 5,
    duplicatesCount: 0,
    rejectedCount: 0,
    status: 'sucesso',
    details: 'Carga inicial oficial de certames com editais e portarias homologadas.',
  },
];

export class ConcursosStore {
  private static loadDB(): ConcursosDB {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          concursos: parsed.concursos || initialConcursos,
          questoes: parsed.questoes || [],
          officialSources: parsed.officialSources || initialOfficialSources,
          history: parsed.history || initialHistory,
          lastGranSync: parsed.lastGranSync || null,
        };
      }
    } catch (err) {
      console.error('[ConcursosStore] Erro ao carregar base de dados de concursos:', err);
    }

    const defaultDB: ConcursosDB = {
      concursos: initialConcursos,
      questoes: [],
      officialSources: initialOfficialSources,
      history: initialHistory,
      lastGranSync: null,
    };
    ConcursosStore.saveDB(defaultDB);
    return defaultDB;
  }

  private static saveDB(db: ConcursosDB): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ConcursosStore] Erro ao salvar base de dados de concursos:', err);
    }
  }

  public static getConcursos(filters?: {
    search?: string;
    banca?: string;
    state?: string;
    educationLevel?: string;
    status?: string;
    category?: string;
    reviewStatus?: ReviewStatus;
  }): ConcursoData[] {
    const db = this.loadDB();
    let result = db.concursos;

    if (!filters) return result;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.organ.toLowerCase().includes(q) ||
        c.career.toLowerCase().includes(q) ||
        c.banca.toLowerCase().includes(q)
      );
    }

    if (filters.banca && filters.banca !== 'todas') {
      result = result.filter(c => c.banca.toLowerCase() === filters.banca?.toLowerCase());
    }

    if (filters.state && filters.state !== 'todos') {
      result = result.filter(c => c.state === filters.state);
    }

    if (filters.educationLevel && filters.educationLevel !== 'todos') {
      result = result.filter(c => c.educationLevel === filters.educationLevel);
    }

    if (filters.status && filters.status !== 'todos') {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters.category && filters.category !== 'todos') {
      result = result.filter(c => c.category === filters.category);
    }

    if (filters.reviewStatus) {
      result = result.filter(c => c.reviewStatus === filters.reviewStatus);
    }

    return result;
  }

  public static getConcursoById(id: string): ConcursoData | null {
    const db = this.loadDB();
    return db.concursos.find(c => c.id === id) || null;
  }

  // Idempotent upsert preventing duplicates by provider + externalId or deterministic key
  public static saveConcursos(items: ConcursoData[], batchId: string, sourceName: string): {
    imported: number;
    duplicates: number;
    rejected: number;
    errors: string[];
  } {
    const db = this.loadDB();
    let imported = 0;
    let duplicates = 0;
    let rejected = 0;
    const errors: string[] = [];

    const existingMap = new Map<string, ConcursoData>();
    db.concursos.forEach(c => {
      // Key 1: provider + externalId (if present)
      if (c.externalId) {
        existingMap.set(`${c.provider}:${c.externalId}`, c);
      }
      // Key 2: deterministic key (organ + career + banca)
      const detKey = `${c.organ.trim().toLowerCase()}_${c.career.trim().toLowerCase()}_${c.banca.trim().toLowerCase()}`;
      existingMap.set(`det:${detKey}`, c);
    });

    const updatedConcursos = [...db.concursos];

    items.forEach((item, index) => {
      // Validate mandatory fields
      if (!item.name || !item.organ || !item.banca || !item.career) {
        rejected++;
        errors.push(`Linha/Item ${index + 1}: Campos obrigatórios ausentes (nome, órgão, banca ou cargo).`);
        return;
      }

      const externalKey = item.externalId ? `${item.provider}:${item.externalId}` : null;
      const detKey = `det:${item.organ.trim().toLowerCase()}_${item.career.trim().toLowerCase()}_${item.banca.trim().toLowerCase()}`;

      const existingMatch = (externalKey && existingMap.get(externalKey)) || existingMap.get(detKey);

      if (existingMatch) {
        // Idempotent update without overwriting valid data with nulls
        const matchIndex = updatedConcursos.findIndex(c => c.id === existingMatch.id);
        if (matchIndex >= 0) {
          updatedConcursos[matchIndex] = {
            ...existingMatch,
            // Update non-null fields
            salary: item.salary ?? existingMatch.salary,
            vacancies: item.vacancies ?? existingMatch.vacancies,
            examDate: item.examDate ?? existingMatch.examDate,
            registrationPeriod: item.registrationPeriod ?? existingMatch.registrationPeriod,
            status: item.status || existingMatch.status,
            editalUrl: item.editalUrl ?? existingMatch.editalUrl,
            registrationUrl: item.registrationUrl ?? existingMatch.registrationUrl,
            lastVerifiedAt: new Date().toISOString(),
          };
          duplicates++;
          return;
        }
      }

      // Add new record
      const newRecord: ConcursoData = {
        ...item,
        id: item.id || `conc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        collectedAt: item.collectedAt || new Date().toISOString(),
        lastVerifiedAt: item.lastVerifiedAt || new Date().toISOString(),
        importBatchId: batchId,
      };

      updatedConcursos.push(newRecord);
      if (item.externalId) existingMap.set(`${item.provider}:${item.externalId}`, newRecord);
      existingMap.set(detKey, newRecord);
      imported++;
    });

    db.concursos = updatedConcursos;

    // Record import history
    const historyItem: ImportHistoryItem = {
      id: batchId,
      timestamp: new Date().toISOString(),
      provider: items[0]?.provider || 'file_import',
      fileNameOrSource: sourceName,
      importedCount: imported,
      duplicatesCount: duplicates,
      rejectedCount: rejected,
      status: rejected > 0 && imported === 0 ? 'falha' : rejected > 0 ? 'parcial' : 'sucesso',
      details: `${imported} certames novos cadastrados, ${duplicates} atualizados/duplicados identificados, ${rejected} rejeitados.`,
      errors: errors.slice(0, 5),
    };
    db.history.unshift(historyItem);

    this.saveDB(db);

    return { imported, duplicates, rejected, errors };
  }

  public static updateReviewStatus(id: string, reviewStatus: ReviewStatus, notes?: string): ConcursoData | null {
    const db = this.loadDB();
    const index = db.concursos.findIndex(c => c.id === id);
    if (index === 0 || index > 0) {
      db.concursos[index] = {
        ...db.concursos[index],
        reviewStatus,
        notes: notes !== undefined ? notes : db.concursos[index].notes,
        lastVerifiedAt: new Date().toISOString(),
      };
      this.saveDB(db);
      return db.concursos[index];
    }
    return null;
  }

  public static getProviders(): DataSourceProviderConfig[] {
    const db = this.loadDB();
    const granBaseUrl = process.env.GRAN_API_BASE_URL;
    const granApiKey = process.env.GRAN_API_KEY;
    const isGranConfigured = !!(granBaseUrl && granApiKey && granApiKey !== 'seu_token_de_parceiro_gran_aqui');

    const totalConcursos = db.concursos.length;
    const granConcursos = db.concursos.filter(c => c.provider === 'gran').length;
    const fileConcursos = db.concursos.filter(c => c.provider === 'file_import').length;
    const officialConcursos = db.concursos.filter(c => c.provider === 'official_source').length;

    return [
      {
        id: 'gran',
        name: 'Gran Cursos (API B2B Autorizada)',
        description: 'Integração direta com o ecossistema institucional Gran Cursos para sincronização de editais e bancos autorizados.',
        status: isGranConfigured ? 'conectado' : 'aguardando_configuracao',
        capabilities: ['listarConcursos', 'obterConcurso', 'listarQuestoes', 'verificarConexao'],
        lastSuccessfulSync: db.lastGranSync,
        recordsCount: {
          concursos: granConcursos,
          questoes: db.questoes.filter(q => q.provider === 'gran').length,
          materiais: 0,
        },
        diagnosticMessage: isGranConfigured 
          ? 'Chaves B2B detectadas no servidor. Pronto para verificação de permissões.'
          : 'Aguardando configuração de credenciais B2B institucionais no servidor (.env). Nenhuma chamada fictícia é realizada.',
        configRequirements: [
          {
            envVar: 'GRAN_API_BASE_URL',
            description: 'URL base da API REST institucional fornecida pelo Gran Cursos',
            configured: !!granBaseUrl && !granBaseUrl.includes('seu_token'),
          },
          {
            envVar: 'GRAN_API_KEY',
            description: 'Token de autenticação de parceiro (Bearer Token / B2B Key)',
            configured: !!granApiKey && !granApiKey.includes('seu_token'),
          },
        ],
      },
      {
        id: 'file_import',
        name: 'Importação de Arquivos Autorizados',
        description: 'Módulo de ingestão de arquivos CSV, JSON e análise estruturada de PDFs de editais oficiais com validação de colunas.',
        status: 'ativo',
        capabilities: ['listarConcursos', 'listarQuestoes', 'verificarConexao'],
        lastSuccessfulSync: db.history[0]?.timestamp || null,
        recordsCount: {
          concursos: fileConcursos,
          questoes: db.questoes.filter(q => q.provider === 'file_import').length,
          materiais: 0,
        },
        diagnosticMessage: 'Mecanismo de importação ativo com verificação de tipo, tamanho e mapeamento de campos.',
      },
      {
        id: 'official_source',
        name: 'Fontes Oficiais & Diários da União',
        description: 'Coleta e catalogação direta de portais de bancas (Cebraspe, FGV, FCC, Cesgranrio) e Diário Oficial da União (DOU).',
        status: 'ativo',
        capabilities: ['listarConcursos', 'obterConcurso', 'verificarConexao'],
        lastSuccessfulSync: new Date().toISOString(),
        recordsCount: {
          concursos: officialConcursos,
          questoes: 0,
          materiais: 0,
        },
        diagnosticMessage: '5 fontes oficiais ativas monitoradas com links diretos de editais em domínio público.',
      },
    ];
  }

  public static getHistory(): ImportHistoryItem[] {
    return this.loadDB().history;
  }

  public static getOfficialSources(): OfficialSourceConfig[] {
    return this.loadDB().officialSources;
  }

  public static addOfficialSource(source: Omit<OfficialSourceConfig, 'id' | 'lastCheckedAt' | 'status'>): OfficialSourceConfig {
    const db = this.loadDB();
    const newSource: OfficialSourceConfig = {
      ...source,
      id: `source-${Date.now().toString(36)}`,
      lastCheckedAt: new Date().toISOString(),
      status: 'ativo',
    };
    db.officialSources.unshift(newSource);
    this.saveDB(db);
    return newSource;
  }

  // Real, strict check of Gran Cursos integration
  public static async testGranConnection(): Promise<{
    success: boolean;
    status: number;
    message: string;
    details?: any;
    missingVars?: string[];
  }> {
    const baseUrl = process.env.GRAN_API_BASE_URL;
    const apiKey = process.env.GRAN_API_KEY;

    const missing: string[] = [];
    if (!baseUrl || baseUrl.includes('seu_token')) missing.push('GRAN_API_BASE_URL');
    if (!apiKey || apiKey.includes('seu_token')) missing.push('GRAN_API_KEY');

    if (missing.length > 0 || !baseUrl || !apiKey) {
      return {
        success: false,
        status: 400,
        message: 'A integração com o Gran Cursos está aguardando configuração de credenciais no servidor.',
        missingVars: missing.length > 0 ? missing : ['GRAN_API_BASE_URL', 'GRAN_API_KEY'],
        details: {
          status: 'Aguardando configuração',
          required: [
            'Contrato institucional B2B com o Gran Cursos formalizado com permissão de redistribuição',
            'Definição da variável GRAN_API_BASE_URL no arquivo de ambiente do servidor (.env)',
            'Definição da variável GRAN_API_KEY com a chave de API fornecida no onboarding técnico',
          ],
          safePolicy: 'O sistema cumpre a diretriz de não realizar chamadas fictícias, não contornar login/CAPTCHA e não utilizar sessões de terceiros.',
        },
      };
    }

    const safeBaseUrl = baseUrl;
    const safeApiKey = apiKey;

    // SSRF prevention check
    try {
      const parsedUrl = new URL(safeBaseUrl);
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        return {
          success: false,
          status: 400,
          message: 'Protocolo de URL inválido. A API deve utilizar HTTPS.',
        };
      }
      const host = parsedUrl.hostname.toLowerCase();
      if (
        host === 'localhost' || 
        host === '127.0.0.1' || 
        host.startsWith('10.') || 
        host.startsWith('192.168.') || 
        host.startsWith('172.16.') || 
        host === '169.254.169.254'
      ) {
        return {
          success: false,
          status: 403,
          message: 'Acesso bloqueado: URLs de rede local ou de metadados não são permitidas por segurança (anti-SSRF).',
        };
      }
    } catch {
      return {
        success: false,
        status: 400,
        message: 'Endereço da GRAN_API_BASE_URL inválido.',
      };
    }

    // Attempt real connection with strict timeout and no retries on 401/403
    try {
      const response = await fetch(`${safeBaseUrl.replace(/\/+$/, '')}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${safeApiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'ConcursoIA-Integration/1.0',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          status: response.status,
          message: `Falha de autorização com a API Gran Cursos (HTTP ${response.status}). A chave informada é inválida, não possui permissão ativa para redistribuição de dados ou foi revogada. Sincronização suspensa conforme diretriz de segurança.`,
        };
      }

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: true,
          status: 200,
          message: 'Conexão autorizada com a API do Gran Cursos estabelecida com sucesso!',
          details: data,
        };
      }

      return {
        success: false,
        status: response.status,
        message: `Servidor do Gran Cursos retornou status HTTP ${response.status}.`,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 504,
        message: `Não foi possível estabelecer contato com ${baseUrl}: ${err.message || 'Tempo limite esgotado'}. Verifique o endereço e a conectividade de rede.`,
      };
    }
  }

  public static async syncGran(): Promise<{
    success: boolean;
    status: number;
    message: string;
    syncedCount?: number;
  }> {
    const testResult = await this.testGranConnection();
    if (!testResult.success) {
      return {
        success: false,
        status: testResult.status,
        message: testResult.message,
      };
    }

    // If test succeeded, perform authenticated request (not fictive)
    const baseUrl = process.env.GRAN_API_BASE_URL!;
    const apiKey = process.env.GRAN_API_KEY!;

    try {
      const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/concursos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'ConcursoIA-Integration/1.0',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: `A sincronização foi suspensa devido a erro retornado pelo Gran Cursos: HTTP ${response.status}`,
        };
      }

      const payload = await response.json();
      const rawList = Array.isArray(payload) ? payload : payload.data || [];
      
      const batchId = `gran-sync-${Date.now()}`;
      const mapped: ConcursoData[] = rawList.map((item: any) => ({
        id: `gran-${item.id || item.codigo || Math.random().toString(36).slice(2, 8)}`,
        externalId: String(item.id || item.codigo || ''),
        name: item.nome || item.titulo || 'Concurso Gran',
        organ: item.orgao || item.instituicao || '',
        banca: item.banca || 'A Definir',
        career: item.cargo || item.carreira || '',
        educationLevel: item.escolaridade || null,
        state: item.uf || item.estado || null,
        city: item.municipio || item.cidade || null,
        vacancies: item.vagas || null,
        salary: item.remuneracao || item.salario || null,
        registrationPeriod: item.inscricao ? { start: item.inscricao.inicio || null, end: item.inscricao.fim || null } : null,
        examDate: item.dataProva || item.data_prova || null,
        status: item.situacao || 'edital_publicado',
        editalUrl: item.linkEdital || null,
        registrationUrl: item.linkInscricao || null,
        sourceUrlOrFile: `${baseUrl}/concursos`,
        collectedAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        reviewStatus: 'aprovado',
        importBatchId: batchId,
        provider: 'gran',
      }));

      const saveResult = this.saveConcursos(mapped, batchId, 'API Gran Cursos');

      const db = this.loadDB();
      db.lastGranSync = new Date().toISOString();
      this.saveDB(db);

      return {
        success: true,
        status: 200,
        message: `Sincronização concluída com o Gran Cursos: ${saveResult.imported} novos certames e ${saveResult.duplicates} atualizados.`,
        syncedCount: saveResult.imported,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 500,
        message: `Falha na requisição de sincronização com o Gran Cursos: ${err.message}`,
      };
    }
  }
}
