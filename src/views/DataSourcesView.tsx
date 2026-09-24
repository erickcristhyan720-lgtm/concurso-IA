import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Link, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  Search, 
  Filter, 
  Info, 
  Check, 
  X, 
  ArrowRight,
  Server,
  FileSpreadsheet,
  FileCode,
  Globe
} from 'lucide-react';
import { 
  DataSourceProviderConfig, 
  ConcursoData, 
  ImportHistoryItem, 
  OfficialSourceConfig,
  ImportPreviewResult,
  ImportConfirmationResult,
  ReviewStatus
} from '../types/concursos';
import { concursosService } from '../services/concursosService';

export const DataSourcesView: React.FC = () => {
  const [providers, setProviders] = useState<DataSourceProviderConfig[]>([]);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [officialSources, setOfficialSources] = useState<OfficialSourceConfig[]>([]);
  const [pendingReviews, setPendingReviews] = useState<ConcursoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'providers' | 'import' | 'edital' | 'review' | 'sources' | 'history'>('providers');

  // Gran test feedback
  const [granTestLoading, setGranTestLoading] = useState(false);
  const [granTestResult, setGranTestResult] = useState<{
    success: boolean;
    status: number;
    message: string;
    missingVars?: string[];
  } | null>(null);

  // Gran sync feedback
  const [granSyncLoading, setGranSyncLoading] = useState(false);
  const [granSyncResult, setGranSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // File Import Wizard State (6 steps: 1=upload, 2=mapping, 3=preview, 4=validation, 5=confirm, 6=report)
  const [importStep, setImportStep] = useState<number>(1);
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importRawContent, setImportRawContent] = useState<string>('');
  const [importFileName, setImportFileName] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ImportConfirmationResult | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // AI Edital Parser State
  const [editalText, setEditalText] = useState<string>('');
  const [editalFileName, setEditalFileName] = useState<string>('');
  const [editalSourceUrl, setEditalSourceUrl] = useState<string>('');
  const [editalParsingLoading, setEditalParsingLoading] = useState(false);
  const [editalExtracted, setEditalExtracted] = useState<ConcursoData | null>(null);
  const [editalReferences, setEditalReferences] = useState<string | null>(null);
  const [editalSuccessNotice, setEditalSuccessNotice] = useState<string | null>(null);

  // New Official Source Form
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<'dou' | 'diario_estadual' | 'portal_banca' | 'orgao'>('portal_banca');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceOrgan, setNewSourceOrgan] = useState('');
  const [sourceFormError, setSourceFormError] = useState<string | null>(null);
  const [sourceSuccessNotice, setSourceSuccessNotice] = useState<string | null>(null);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [provs, hist, sources, pending] = await Promise.all([
        concursosService.getProviders(),
        concursosService.getHistory(),
        concursosService.getOfficialSources(),
        concursosService.getConcursos({ reviewStatus: 'pendente_revisao' }),
      ]);
      setProviders(provs);
      setHistory(hist);
      setOfficialSources(sources);
      setPendingReviews(pending.data);
    } catch (err) {
      console.error('Erro ao carregar dados de integração:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Test Gran Connection
  const handleTestGran = async () => {
    setGranTestLoading(true);
    setGranTestResult(null);
    try {
      const res = await concursosService.testGranConnection();
      setGranTestResult(res);
    } catch (err: any) {
      setGranTestResult({
        success: false,
        status: 500,
        message: err.message || 'Falha ao testar conexão.',
      });
    } finally {
      setGranTestLoading(false);
    }
  };

  // 2. Sync Gran
  const handleSyncGran = async () => {
    setGranSyncLoading(true);
    setGranSyncResult(null);
    try {
      const res = await concursosService.syncGran();
      setGranSyncResult(res);
      if (res.success) {
        await loadData();
      }
    } catch (err: any) {
      setGranSyncResult({
        success: false,
        message: err.message || 'Erro durante a tentativa de sincronização.',
      });
    } finally {
      setGranSyncLoading(false);
    }
  };

  // 3. File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const isJson = file.name.endsWith('.json');
    setImportFormat(isJson ? 'json' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportRawContent(content);
    };
    reader.readAsText(file);
  };

  // 4. Process Preview
  const handleProcessPreview = async () => {
    if (!importRawContent.trim()) {
      setImportError('Insira ou selecione um arquivo válido.');
      return;
    }

    setImportLoading(true);
    setImportError(null);
    try {
      const res = await concursosService.previewImport(importRawContent, importFormat);
      setPreviewResult(res);
      setImportStep(3); // Go to preview
    } catch (err: any) {
      setImportError(err.message || 'Falha ao processar arquivo.');
    } finally {
      setImportLoading(false);
    }
  };

  // 5. Confirm and Save Import
  const handleConfirmImport = async () => {
    if (!previewResult || previewResult.validRows.length === 0) return;

    setImportLoading(true);
    setImportError(null);
    try {
      const res = await concursosService.confirmImport(
        previewResult.validRows, 
        importFileName || 'Arquivo importado'
      );
      setConfirmationResult(res);
      setImportStep(6); // Report
      await loadData();
    } catch (err: any) {
      setImportError(err.message || 'Falha ao salvar registros importados.');
    } finally {
      setImportLoading(false);
    }
  };

  // 6. Reset Import Wizard
  const handleResetImportWizard = () => {
    setImportStep(1);
    setImportRawContent('');
    setImportFileName('');
    setPreviewResult(null);
    setConfirmationResult(null);
    setImportError(null);
  };

  // 7. Parse Edital with AI
  const handleParseEdital = async () => {
    if (!editalText.trim() || editalText.length < 40) {
      alert('Insira um trecho representativo do edital (mínimo de 40 caracteres).');
      return;
    }

    setEditalParsingLoading(true);
    setEditalExtracted(null);
    setEditalReferences(null);
    setEditalSuccessNotice(null);

    try {
      const res = await concursosService.parseEdital(
        editalText, 
        editalFileName || 'Texto de Edital', 
        editalSourceUrl
      );
      setEditalExtracted(res.extracted);
      if (res.references) setEditalReferences(res.references);
    } catch (err: any) {
      alert(err.message || 'Erro ao extrair dados do edital.');
    } finally {
      setEditalParsingLoading(false);
    }
  };

  // 8. Save Extracted Edital into Database as Pending Review
  const handleSaveExtractedEdital = async () => {
    if (!editalExtracted) return;

    try {
      await concursosService.confirmImport(
        [editalExtracted], 
        editalFileName || 'Extração de Edital por IA'
      );
      setEditalSuccessNotice('Concurso salvo com sucesso no banco de dados! Ele está registrado com status "Pendente de Revisão" para validação humana.');
      setEditalExtracted(null);
      setEditalText('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar certame extraído.');
    }
  };

  // 9. Review Contest (Aprovar / Rejeitar)
  const handleReviewContest = async (id: string, status: ReviewStatus) => {
    try {
      await concursosService.updateReviewStatus(id, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao revisar certame.');
    }
  };

  // 10. Add New Official Source
  const handleAddOfficialSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSourceFormError(null);
    setSourceSuccessNotice(null);

    if (!newSourceName.trim() || !newSourceUrl.trim() || !newSourceOrgan.trim()) {
      setSourceFormError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      await concursosService.addOfficialSource({
        name: newSourceName.trim(),
        type: newSourceType,
        url: newSourceUrl.trim(),
        organOrBanca: newSourceOrgan.trim(),
      });
      setSourceSuccessNotice('Fonte oficial cadastrada e validada com sucesso!');
      setNewSourceName('');
      setNewSourceUrl('');
      setNewSourceOrgan('');
      await loadData();
    } catch (err: any) {
      setSourceFormError(err.message || 'Erro ao cadastrar fonte oficial.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>Módulo de Integração de Dados</span>
            <span aria-hidden="true">·</span>
            <span>Governança & Rastreabilidade</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Fontes de Dados & Editais de Concursos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Gerenciamento autorizado de conectores de bancas, ingestão de arquivos CSV/JSON, extração auditável de editais e catálogo de fontes oficiais com rastreabilidade integral.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setActiveTab('providers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'providers'
              ? 'bg-white text-indigo-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Provedores & Gran</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'import'
              ? 'bg-white text-indigo-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Importar Arquivos (CSV/JSON)</span>
        </button>

        <button
          onClick={() => setActiveTab('edital')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'edital'
              ? 'bg-white text-indigo-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Extração de Edital (IA)</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'review'
              ? 'bg-white text-indigo-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Fila de Revisão ({pendingReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sources'
              ? 'bg-white text-indigo-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Fontes Oficiais ({officialSources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-white text-indigo-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Histórico & Auditoria</span>
        </button>
      </div>

      {/* TAB 1: PROVEDORES & GRAN CURSOS */}
      {activeTab === 'providers' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Transparency Disclaimer */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold block mb-0.5">
                Diretrizes de Integridade de Dados & Provedores
              </strong>
              <span>
                Este módulo opera exclusivamente através de canais e contratos oficiais de redistribuição. Nenhuma credencial pessoal ou sessão de terceiros é utilizada. As chamadas aos conectores só ocorrem com endpoints e chaves institucionais autorizadas.
              </span>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((prov) => {
              const isGran = prov.id === 'gran';
              const isConfigured = prov.status === 'conectado' || prov.status === 'ativo';

              return (
                <div
                  key={prov.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                    isGran
                      ? 'bg-gradient-to-b from-white to-indigo-50/30 border-indigo-200/90 shadow-2xs'
                      : 'bg-white border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isGran ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isGran ? <Server className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{prov.name}</h3>
                          <span className="text-[11px] text-slate-500 font-mono">ID: {prov.id}</span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        prov.status === 'conectado' || prov.status === 'ativo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {prov.status === 'aguardando_configuracao'
                          ? 'Aguardando Configuração'
                          : prov.status === 'conectado'
                          ? 'Conectado'
                          : 'Ativo'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {prov.description}
                    </p>

                    {/* Records Counter */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Concursos catalogados:</span>
                        <strong className="text-slate-900 font-mono">{prov.recordsCount.concursos}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Última sincronização:</span>
                        <span className="text-slate-700 font-medium">
                          {prov.lastSuccessfulSync ? new Date(prov.lastSuccessfulSync).toLocaleDateString('pt-BR') : 'Nunca'}
                        </span>
                      </div>
                    </div>

                    {/* Gran Specific Configuration Requirements */}
                    {isGran && prov.configRequirements && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          Requisitos de Ambiente (.env):
                        </span>
                        {prov.configRequirements.map(req => (
                          <div key={req.envVar} className="flex items-center justify-between text-[11px] p-2 bg-white rounded-xl border border-slate-200/80">
                            <span className="font-mono text-slate-700 font-semibold">{req.envVar}</span>
                            <span className={`font-semibold flex items-center gap-1 ${
                              req.configured ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {req.configured ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              <span>{req.configured ? 'Configurado' : 'Pendente'}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                    {isGran ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleTestGran}
                          disabled={granTestLoading}
                          className="flex-1 py-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${granTestLoading ? 'animate-spin' : ''}`} />
                          <span>Testar Conexão</span>
                        </button>

                        <button
                          onClick={handleSyncGran}
                          disabled={granSyncLoading}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${granSyncLoading ? 'animate-spin' : ''}`} />
                          <span>Sincronizar</span>
                        </button>
                      </div>
                    ) : prov.id === 'file_import' ? (
                      <button
                        onClick={() => setActiveTab('import')}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Abrir Importador</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('sources')}
                        className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Gerenciar Fontes</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gran Connection Diagnostic Output */}
          {granTestResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
              granTestResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {granTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                <span>Resultado do Teste de Conexão Gran Cursos (HTTP {granTestResult.status}):</span>
              </div>
              <p className="leading-relaxed">{granTestResult.message}</p>
              {granTestResult.missingVars && (
                <div className="pt-1">
                  <span className="font-semibold block mb-1">Variáveis ausentes no servidor:</span>
                  <ul className="list-disc pl-5 space-y-0.5 font-mono text-[11px]">
                    {granTestResult.missingVars.map(v => <li key={v}>{v}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Gran Sync Output */}
          {granSyncResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1 animate-in fade-in ${
              granSyncResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {granSyncResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>Status da Sincronização:</span>
              </div>
              <p className="leading-relaxed">{granSyncResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WIZARD DE IMPORTAÇÃO DE ARQUIVOS (6 ETAPAS) */}
      {activeTab === 'import' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Wizard Stepper Progress Bar */}
          <div className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold mb-3">
              <span className="text-slate-800">Processo de Ingestão & Validação em 6 Etapas:</span>
              <span className="text-indigo-600 font-mono">Etapa {importStep} de 6</span>
            </div>

            <div className="grid grid-cols-6 gap-1 sm:gap-2">
              {[
                { num: 1, label: 'Upload' },
                { num: 2, label: 'Formato' },
                { num: 3, label: 'Prévia' },
                { num: 4, label: 'Validação' },
                { num: 5, label: 'Confirmação' },
                { num: 6, label: 'Relatório' },
              ].map(st => (
                <div key={st.num} className="text-center">
                  <div className={`h-1.5 rounded-full mb-1 transition-colors ${
                    importStep >= st.num ? 'bg-indigo-600' : 'bg-slate-200'
                  }`} />
                  <span className={`text-[10px] hidden sm:block ${
                    importStep === st.num ? 'text-indigo-700 font-bold' : 'text-slate-400'
                  }`}>
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1 & 2: Upload and Format Selection */}
          {(importStep === 1 || importStep === 2) && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Etapa 1 & 2: Upload e Seleção de Formato
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecione um arquivo CSV com cabeçalhos ou arquivo estruturado JSON de editais autorizados.
                </p>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImportFormat('csv')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    importFormat === 'csv'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Planilha CSV (Separador vírgula ou ponto-e-vírgula)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportFormat('json')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    importFormat === 'json'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Estrutura JSON</span>
                </button>
              </div>

              {/* File Input Box */}
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl p-8 text-center transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                    Clique para selecionar arquivo
                  </span>{' '}
                  <span className="text-xs text-slate-500">ou arraste para cá</span>
                  <input
                    type="file"
                    accept={importFormat === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {importFileName && (
                  <div className="mt-2 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-xl">
                    Arquivo selecionado: {importFileName}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-2">
                  Limite de 5MB por arquivo. Não armazene dados confidenciais ou sem autorização expressa.
                </p>
              </div>

              {/* Or paste content directly */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Ou cole o conteúdo em texto plano aqui:
                </label>
                <textarea
                  rows={5}
                  value={importRawContent}
                  onChange={(e) => setImportRawContent(e.target.value)}
                  placeholder={importFormat === 'csv' 
                    ? 'nome,orgao,banca,cargo,salario,vagas,status\nConcurso TRF-1,TRF 1ª Região,FGV,Analista Judiciário,14200.00,20,edital_publicado'
                    : '[{"name": "Concurso TRF-1", "organ": "TRF-1", "banca": "FGV", "career": "Analista", "salary": "R$ 14.200"}]'}
                  className="w-full p-3 font-mono text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Submit to Step 3 */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={!importRawContent.trim() || importLoading}
                  onClick={handleProcessPreview}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${importLoading ? 'animate-spin' : ''}`} />
                  <span>Processar Prévia & Validar Colunas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Preview and Field Validation Table */}
          {(importStep === 3 || importStep === 4) && previewResult && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Etapas 3 & 4: Prévia dos Registros e Validação de Campos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifique os campos processados antes da gravação definitiva.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200">
                    {previewResult.validCount} válidos
                  </span>
                  {previewResult.invalidCount > 0 && (
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-800 font-bold rounded-lg border border-rose-200">
                      {previewResult.invalidCount} inválidos
                    </span>
                  )}
                </div>
              </div>

              {/* Detected Columns & Mapping */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Colunas Detectadas no Arquivo:</span>
                <div className="flex flex-wrap gap-1.5">
                  {previewResult.detectedColumns.map(col => (
                    <span key={col} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md font-mono text-[11px]">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Concurso</th>
                      <th className="py-2.5 px-3">Órgão</th>
                      <th className="py-2.5 px-3">Banca</th>
                      <th className="py-2.5 px-3">Cargo</th>
                      <th className="py-2.5 px-3">Salário</th>
                      <th className="py-2.5 px-3">Situação</th>
                      <th className="py-2.5 px-3">Status de Revisão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {previewResult.validPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3">{item.organ}</td>
                        <td className="py-2.5 px-3">{item.banca}</td>
                        <td className="py-2.5 px-3">{item.career}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">{item.salary || '--'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-amber-700 font-medium">
                          Pendente de Revisão
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invalid Rows Report */}
              {previewResult.invalidRows.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-950">
                  <span className="font-bold block">Linhas que apresentaram inconsistências ou campos ausentes:</span>
                  <div className="space-y-1">
                    {previewResult.invalidRows.map((inv, idx) => (
                      <div key={idx} className="font-mono text-[11px]">
                        Linha {inv.rowNumber}: {inv.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setImportStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Voltar ao Upload
                </button>

                <button
                  type="button"
                  disabled={previewResult.validRows.length === 0 || importLoading}
                  onClick={handleConfirmImport}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar & Gravar {previewResult.validRows.length} Registros</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Final Report */}
          {importStep === 6 && confirmationResult && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5 animate-in zoom-in-95">
              <div className="flex items-center gap-3 text-emerald-800">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Etapa 6: Relatório de Importação Concluída</h3>
                  <p className="text-xs text-slate-500">Lote: {confirmationResult.batchId}</p>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center">
                  <span className="text-[11px] font-semibold text-emerald-800 block">Novos Importados</span>
                  <span className="text-2xl font-bold font-mono text-emerald-900">{confirmationResult.imported}</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <span className="text-[11px] font-semibold text-slate-600 block">Duplicados / Mesclados</span>
                  <span className="text-2xl font-bold font-mono text-slate-800">{confirmationResult.duplicates}</span>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                  <span className="text-[11px] font-semibold text-rose-800 block">Rejeitados por Erro</span>
                  <span className="text-2xl font-bold font-mono text-rose-900">{confirmationResult.rejected}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {confirmationResult.summary}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetImportWizard}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Fazer Nova Importação
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXTRAÇÃO DE EDITAL POR IA (DIRETRIZ ESTREITA ANTI-ALUCINAÇÃO) */}
      {activeTab === 'edital' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Extração Assistida por IA com Revisão Humana Obrigatória</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Analisar Texto ou PDF de Edital Oficial
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              O motor de IA trata o texto estritamente como dados brutos e nunca como instruções. Informações ausentes recebem null e referências de seções são registradas para auditoria.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Documento / Arquivo:</label>
                <input
                  type="text"
                  value={editalFileName}
                  onChange={(e) => setEditalFileName(e.target.value)}
                  placeholder="Ex: Edital_CNU_Bloco_7_2026.pdf"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Link Oficial do Edital (DOU / Banca):</label>
                <input
                  type="url"
                  value={editalSourceUrl}
                  onChange={(e) => setEditalSourceUrl(e.target.value)}
                  placeholder="https://www.in.gov.br/dou/-/edital-concurso..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Texto do Edital (Cole trechos das Disposições Preliminares, Cargos e Cronograma):
              </label>
              <textarea
                rows={8}
                value={editalText}
                onChange={(e) => setEditalText(e.target.value)}
                placeholder="Ex: EDITAL Nº 01/2026 - CONCURSO PÚBLICO. O MINISTÉRIO DA GESTÃO... torna pública a realização do certame sob responsabilidade da FUNDAÇÃO CESGRANRIO. Cargo: Especialista em Políticas Públicas... Remuneração inicial de R$ 20.924,80... Vagas: 150... Inscrições de 15/06 a 10/07... Prova em 18/10/2026..."
                className="w-full p-3 font-mono text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleParseEdital}
                disabled={editalParsingLoading || !editalText.trim()}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${editalParsingLoading ? 'animate-spin' : ''}`} />
                <span>{editalParsingLoading ? 'Extraindo Dados Fatuais...' : 'Extrair Dados com IA'}</span>
              </button>
            </div>
          </div>

          {/* Extracted Preview Card */}
          {editalExtracted && (
            <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-3xl space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2 border-b border-indigo-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    Dados Extraídos (Revisão Obrigatória)
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{editalExtracted.name}</h4>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Pendente de Validação
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-slate-400 block text-[10px]">Órgão:</span>
                  <strong className="text-slate-900">{editalExtracted.organ || 'null'}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-slate-400 block text-[10px]">Banca:</span>
                  <strong className="text-slate-900">{editalExtracted.banca || 'null'}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-slate-400 block text-[10px]">Cargo:</span>
                  <strong className="text-slate-900">{editalExtracted.career || 'null'}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-slate-400 block text-[10px]">Remuneração:</span>
                  <strong className="text-emerald-700 font-mono">{editalExtracted.salary || 'null'}</strong>
                </div>
              </div>

              {editalReferences && (
                <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-indigo-100">
                  <strong>Trechos / Referências Citadas:</strong> {editalReferences}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditalExtracted(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleSaveExtractedEdital}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enviar para Fila de Revisão Administrativa</span>
                </button>
              </div>
            </div>
          )}

          {editalSuccessNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-2xl flex items-center justify-between animate-in fade-in">
              <span>{editalSuccessNotice}</span>
              <button onClick={() => setEditalSuccessNotice(null)} className="text-emerald-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FILA DE REVISÃO ADMINISTRATIVA */}
      {activeTab === 'review' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Fila de Revisão de Editais e Extrações</h3>
              <p className="text-xs text-slate-500">
                Aprovação humana mandatória antes de disponibilizar certames catalogados para os estudantes.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
              {pendingReviews.length} aguardando validação
            </span>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Fila limpa! Nenhum certame pendente de revisão.</h4>
              <p className="text-xs text-slate-500">Todos os editais importados já foram verificados e aprovados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map(item => (
                <div key={item.id} className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-800">{item.organ}</span>
                        <span>·</span>
                        <span>Banca: {item.banca}</span>
                        <span>·</span>
                        <span>Fonte: {item.sourceUrlOrFile}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">Cargo: <strong>{item.career}</strong> | Remuneração: <strong>{item.salary || 'Não informada'}</strong></p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewContest(item.id, 'aprovado')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprovar Edital</span>
                      </button>
                      <button
                        onClick={() => handleReviewContest(item.id, 'rejeitado')}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500">
                      <strong>Observações da Coleta:</strong> {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FONTES OFICIAIS & DIÁRIOS */}
      {activeTab === 'sources' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Catálogo de Fontes Oficiais</h3>
              <p className="text-xs text-slate-500">
                Portais institucionais e Diários Oficiais auditados com proteção anti-SSRF.
              </p>
            </div>
          </div>

          {/* Add Source Form */}
          <form onSubmit={handleAddOfficialSource} className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Nova Fonte Oficial</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Fonte / Portal:</label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="Ex: Portal FGV Conhecimento"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tipo:</label>
                <select
                  value={newSourceType}
                  onChange={(e: any) => setNewSourceType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="portal_banca">Portal de Banca</option>
                  <option value="dou">Diário Oficial da União (DOU)</option>
                  <option value="diario_estadual">Diário Oficial Estadual</option>
                  <option value="orgao">Portal do Órgão</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Órgão / Banca:</label>
                <input
                  type="text"
                  value={newSourceOrgan}
                  onChange={(e) => setNewSourceOrgan(e.target.value)}
                  placeholder="Ex: FGV / Cebraspe"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">URL Pública (HTTPS obrigatório):</label>
              <input
                type="url"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="https://conhecimento.fgv.br/concursos"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {sourceFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{sourceFormError}</span>
              </div>
            )}

            {sourceSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sourceSuccessNotice}</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Salvar Fonte Oficial
              </button>
            </div>
          </form>

          {/* Sources List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {officialSources.map(s => (
              <div key={s.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded-md">
                      {s.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Ativo
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                  <span className="text-xs text-slate-500 block mt-0.5">{s.organOrBanca}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{s.url}</span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span>Acessar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: HISTÓRICO & AUDITORIA */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">Histórico de Lotes & Sincronizações</h3>
            <p className="text-xs text-slate-500">
              Rastreabilidade de cada ingestão de dados com auditoria de novos, duplicados e rejeitados.
            </p>
          </div>

          <div className="space-y-3">
            {history.map(h => (
              <div key={h.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      h.status === 'sucesso' ? 'bg-emerald-500' : h.status === 'parcial' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="font-bold text-slate-900 text-xs">Lote: {h.id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 text-xs">{h.fileNameOrSource}</span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(h.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-emerald-700 font-medium"><strong>{h.importedCount}</strong> novos</span>
                  <span className="text-slate-600 font-medium"><strong>{h.duplicatesCount}</strong> duplicados/atualizados</span>
                  {h.rejectedCount > 0 && (
                    <span className="text-rose-700 font-medium"><strong>{h.rejectedCount}</strong> rejeitados</span>
                  )}
                </div>

                <p className="text-xs text-slate-600">{h.details}</p>

                {h.errors && h.errors.length > 0 && (
                  <div className="p-2.5 bg-rose-50 rounded-xl text-[11px] text-rose-900 font-mono space-y-0.5">
                    {h.errors.map((err, i) => <div key={i}>• {err}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
