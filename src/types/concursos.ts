export type ConcursoStatus = 
  | 'edital_publicado' 
  | 'inscricoes_abertas' 
  | 'banca_definida' 
  | 'comissao_formada' 
  | 'previsto' 
  | 'encerrado';

export type ReviewStatus = 'pendente_revisao' | 'aprovado' | 'rejeitado';

export type ProviderId = 'gran' | 'file_import' | 'official_source';

export interface ConcursoData {
  id: string;                                           // ID interno único
  externalId: string | null;                            // ID no sistema de origem (null se ausente)
  name: string;                                         // Nome completo do certame
  organ: string;                                        // Órgão realizador
  banca: string;                                        // Banca organizadora
  career: string;                                       // Cargo / Carreira
  educationLevel: 'Fundamental' | 'Médio' | 'Técnico' | 'Superior' | 'Pós-graduação' | null;
  state: string | null;                                 // UF ou 'Nacional'
  city: string | null;                                  // Município ou null
  vacancies: string | number | null;                    // Vagas imediatas + CR
  salary: string | number | null;                       // Remuneração inicial informada
  registrationPeriod: {
    start: string | null;                               // YYYY-MM-DD
    end: string | null;                                 // YYYY-MM-DD
  } | null;
  examDate: string | null;                              // Data prevista ou confirmada da prova
  status: ConcursoStatus;                               // Situação atual do edital
  editalUrl: string | null;                             // Link oficial do edital (DOU / portal da banca)
  registrationUrl: string | null;                       // Link oficial para página de inscrição
  
  // Metadados obrigatórios de rastreabilidade
  sourceUrlOrFile: string;                              // URL ou arquivo de origem
  collectedAt: string;                                  // Data/hora da coleta (ISO 8601)
  lastVerifiedAt: string;                               // Data da última checagem de vigência
  reviewStatus: ReviewStatus;                           // Estado de validação administrativa
  importBatchId: string;                                // Lote de importação
  provider: ProviderId;                                 // Provedor de origem
  category?: 'Administrativo' | 'Fiscal' | 'Policial' | 'Tribunais' | 'Bancário' | 'Controle' | 'Saúde' | 'Educação';
  notes?: string;                                       // Observações factuais
}

export interface QuestaoIntegrada {
  id: string;
  externalId: string | null;
  statement: string;
  options: {
    id: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
    isCorrect: boolean;
    reason?: string;
  }[];
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  validityStatus: 'valido' | 'anulado' | 'desconhecido';
  subject: string;
  topic: string;
  banca: string;
  year: number | null;
  exam: string | null;
  explanation: string | null;                           // Somente se autorizado expressamente
  licenseType: 'dominio_publico' | 'autorizado_parceiro' | 'autoral_ia' | 'aguardando_validacao';
  isAiGenerated: boolean;                               // Se true: identificada como "Questão autoral gerada por IA"
  
  // Metadados
  sourceUrlOrFile: string;
  collectedAt: string;
  lastVerifiedAt: string;
  reviewStatus: ReviewStatus;
  importBatchId: string;
  provider: ProviderId;
}

export interface MaterialIntegrado {
  id: string;
  externalId: string | null;
  title: string;
  type: 'edital_pdf' | 'lei_seca' | 'resumo' | 'guia';
  subject: string;
  sourceUrlOrFile: string;
  content: string | null;                               // Conteúdo armazenado somente quando permitido
  reviewStatus: ReviewStatus;
  importBatchId: string;
  provider: ProviderId;
  collectedAt: string;
}

export type ProviderCapability = 
  | 'listarConcursos' 
  | 'obterConcurso' 
  | 'listarQuestoes' 
  | 'verificarConexao';

export interface DataSourceProviderConfig {
  id: ProviderId;
  name: string;
  description: string;
  status: 'conectado' | 'aguardando_configuracao' | 'erro' | 'ativo';
  capabilities: ProviderCapability[];
  lastSuccessfulSync: string | null;
  recordsCount: {
    concursos: number;
    questoes: number;
    materiais: number;
  };
  diagnosticMessage?: string;
  configRequirements?: {
    envVar: string;
    description: string;
    configured: boolean;
  }[];
}

export interface ImportHistoryItem {
  id: string;
  timestamp: string;
  provider: ProviderId | string;
  fileNameOrSource: string;
  importedCount: number;
  duplicatesCount: number;
  rejectedCount: number;
  status: 'sucesso' | 'parcial' | 'falha';
  details: string;
  errors?: string[];
}

export interface OfficialSourceConfig {
  id: string;
  name: string;
  type: 'dou' | 'diario_estadual' | 'portal_banca' | 'orgao';
  url: string;
  organOrBanca: string;
  lastCheckedAt: string | null;
  status: 'ativo' | 'inativo';
}

export interface ColumnMappingConfig {
  name: string;
  organ: string;
  banca: string;
  career: string;
  educationLevel?: string;
  state?: string;
  city?: string;
  vacancies?: string;
  salary?: string;
  examDate?: string;
  status?: string;
  editalUrl?: string;
  registrationUrl?: string;
}

export interface ImportPreviewResult {
  batchId: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  validRows: ConcursoData[];
  validPreview: ConcursoData[];
  invalidRows: { rowNumber: number; data: any; errors: string[] }[];
  detectedColumns: string[];
  mappingUsed?: any;
}

export interface ImportConfirmationResult {
  batchId: string;
  imported: number;
  duplicates: number;
  rejected: number;
  summary: string;
}
