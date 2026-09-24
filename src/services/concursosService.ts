import { 
  ConcursoData, 
  DataSourceProviderConfig, 
  ImportHistoryItem, 
  OfficialSourceConfig, 
  ColumnMappingConfig,
  ImportPreviewResult,
  ImportConfirmationResult,
  ReviewStatus
} from '../types/concursos';

export const concursosService = {
  // 1. List Concursos with search and filters
  async getConcursos(filters?: {
    search?: string;
    banca?: string;
    state?: string;
    educationLevel?: string;
    status?: string;
    category?: string;
    reviewStatus?: ReviewStatus;
  }): Promise<{ total: number; data: ConcursoData[] }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.banca) params.append('banca', filters.banca);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.educationLevel) params.append('educationLevel', filters.educationLevel);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.reviewStatus) params.append('reviewStatus', filters.reviewStatus);

    const res = await fetch(`/api/concursos?${params.toString()}`);
    if (!res.ok) throw new Error('Falha ao consultar concursos do servidor.');
    return res.json();
  },

  // 2. Get Concurso by ID
  async getConcursoById(id: string): Promise<ConcursoData> {
    const res = await fetch(`/api/concursos/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Concurso não encontrado.');
    return res.json();
  },

  // 3. Review Status
  async updateReviewStatus(id: string, reviewStatus: ReviewStatus, notes?: string): Promise<ConcursoData> {
    const res = await fetch(`/api/concursos/${encodeURIComponent(id)}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao atualizar status de revisão.');
    }
    const json = await res.json();
    return json.data;
  },

  // 4. Providers status
  async getProviders(): Promise<DataSourceProviderConfig[]> {
    const res = await fetch('/api/concursos/meta/providers');
    if (!res.ok) throw new Error('Falha ao carregar provedores de dados.');
    return res.json();
  },

  // 5. Test Gran Cursos Connection
  async testGranConnection(): Promise<{
    success: boolean;
    status: number;
    message: string;
    details?: any;
    missingVars?: string[];
  }> {
    const res = await fetch('/api/concursos/providers/gran/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  // 6. Sync Gran Cursos
  async syncGran(): Promise<{
    success: boolean;
    status: number;
    message: string;
    syncedCount?: number;
  }> {
    const res = await fetch('/api/concursos/providers/gran/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  // 7. Preview Import (CSV or JSON)
  async previewImport(
    rawContent: string, 
    format: 'csv' | 'json', 
    mapping?: Partial<ColumnMappingConfig>
  ): Promise<ImportPreviewResult> {
    const res = await fetch('/api/concursos/import/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawContent, format, mapping }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha no processamento da prévia do arquivo.');
    }
    return res.json();
  },

  // 8. Confirm Import
  async confirmImport(validRows: ConcursoData[], sourceName: string): Promise<ImportConfirmationResult> {
    const res = await fetch('/api/concursos/import/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validRows, sourceName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao confirmar importação.');
    }
    return res.json();
  },

  // 9. Parse Edital text with AI
  async parseEdital(
    editalText: string, 
    sourceFileName?: string, 
    sourceUrl?: string
  ): Promise<{
    success: boolean;
    extracted: ConcursoData;
    references?: string;
    warning?: string;
  }> {
    const res = await fetch('/api/concursos/import/parse-edital', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editalText, sourceFileName, sourceUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha na análise estruturada do edital.');
    }
    return res.json();
  },

  // 10. History
  async getHistory(): Promise<ImportHistoryItem[]> {
    const res = await fetch('/api/concursos/meta/history');
    if (!res.ok) throw new Error('Falha ao carregar histórico.');
    return res.json();
  },

  // 11. Official sources
  async getOfficialSources(): Promise<OfficialSourceConfig[]> {
    const res = await fetch('/api/concursos/meta/sources');
    if (!res.ok) throw new Error('Falha ao carregar fontes oficiais.');
    return res.json();
  },

  // 12. Add official source
  async addOfficialSource(source: {
    name: string;
    type: 'dou' | 'diario_estadual' | 'portal_banca' | 'orgao';
    url: string;
    organOrBanca: string;
  }): Promise<OfficialSourceConfig> {
    const res = await fetch('/api/concursos/meta/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao cadastrar fonte oficial.');
    }
    const json = await res.json();
    return json.data;
  },
};
