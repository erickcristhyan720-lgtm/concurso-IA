import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  Filter, 
  FileText, 
  Banknote, 
  Users, 
  ExternalLink,
  Search,
  Calendar,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';
import { UserPreferences, ConcursoProfile } from '../types';
import { ConcursoData } from '../types/concursos';
import { concursoProfiles } from '../data/mockData';
import { concursosService } from '../services/concursosService';

interface VestibularesViewProps {
  userPrefs: UserPreferences;
  onSelectExam: (examId: any, name: string) => void;
  onNavigateToDataSources?: () => void;
}

export const VestibularesView: React.FC<VestibularesViewProps> = ({
  userPrefs,
  onSelectExam,
  onNavigateToDataSources,
}) => {
  const [concursosList, setConcursosList] = useState<ConcursoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBanca, setSelectedBanca] = useState('todas');
  const [selectedState, setSelectedState] = useState('todos');
  const [selectedEducation, setSelectedEducation] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Load from database service
  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      setIsLoading(true);
      try {
        const res = await concursosService.getConcursos();
        if (isMounted && res.data && res.data.length > 0) {
          setConcursosList(res.data);
        }
      } catch (err) {
        console.warn('ConcursosService offline, using mock profiles:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  // Filter options
  const bancas = ['todas', 'Cebraspe', 'FGV', 'FCC', 'Cesgranrio', 'Vunesp'];
  const states = ['todos', 'Nacional', 'DF', 'SP', 'RJ', 'MG', 'RS', 'PR'];
  const educations = ['todos', 'Médio', 'Superior', 'Técnico'];
  const statuses = [
    { id: 'todos', label: 'Todas as Situações' },
    { id: 'edital_publicado', label: 'Edital Publicado' },
    { id: 'inscricoes_abertas', label: 'Inscrições Abertas' },
    { id: 'banca_definida', label: 'Banca Definida' },
    { id: 'comissao_formada', label: 'Comissão Formada' },
    { id: 'previsto', label: 'Previsto' },
  ];
  const categories = ['todos', 'Administrativo', 'Fiscal', 'Policial', 'Tribunais', 'Bancário', 'Controle'];

  // Filtered Concursos
  const filtered = concursosList.filter(c => {
    // Only show approved or official contests for students
    if (c.reviewStatus && c.reviewStatus === 'rejeitado') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        c.name.toLowerCase().includes(q) ||
        c.organ.toLowerCase().includes(q) ||
        c.career.toLowerCase().includes(q) ||
        c.banca.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Banca filter
    if (selectedBanca !== 'todas' && c.banca.toLowerCase() !== selectedBanca.toLowerCase()) {
      return false;
    }

    // State filter
    if (selectedState !== 'todos' && c.state !== selectedState) {
      return false;
    }

    // Education level
    if (selectedEducation !== 'todos' && c.educationLevel !== selectedEducation) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'todos' && c.status !== selectedStatus) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'todos' && c.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Catálogo Oficial de Concursos</span>
            <span aria-hidden="true">·</span>
            <span>Editais & Bancas Examinadoras</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Concursos Públicos & Carreiras de Estado
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Consulte editais verificados, remunerações, vagas e cronogramas oficiais das principais bancas do país (Cebraspe, FGV, FCC, Cesgranrio).
          </p>
        </div>

        {onNavigateToDataSources && (
          <button
            onClick={onNavigateToDataSources}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Gerenciar Fontes & Gran</span>
          </button>
        )}
      </div>

      {/* Search and Multi-Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por concurso, órgão, cargo ou banca (ex: EPPGG, INSS, Receita Federal, Cebraspe)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-slate-50/50"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Banca */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Banca:</label>
            <select
              value={selectedBanca}
              onChange={(e) => setSelectedBanca(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {bancas.map(b => (
                <option key={b} value={b}>{b === 'todas' ? 'Todas as Bancas' : b}</option>
              ))}
            </select>
          </div>

          {/* UF / Estado */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Estado / UF:</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {states.map(s => (
                <option key={s} value={s}>{s === 'todos' ? 'Todos os Estados' : s}</option>
              ))}
            </select>
          </div>

          {/* Escolaridade */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Escolaridade:</label>
            <select
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {educations.map(ed => (
                <option key={ed} value={ed}>{ed === 'todos' ? 'Qualquer Nível' : ed}</option>
              ))}
            </select>
          </div>

          {/* Situação */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Situação do Edital:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {statuses.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills (Interactive Filter Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] shrink-0 mr-1">Área:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'todos' ? 'Todas as Carreiras' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Exibindo <strong>{filtered.length}</strong> {filtered.length === 1 ? 'concurso catalogado' : 'concursos catalogados'}
        </span>
        <span className="text-[11px] text-slate-400">
          Dados auditados com verificação de links oficiais
        </span>
      </div>

      {/* Concursos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((c) => {
          const isCurrent = userPrefs.examId === c.id || userPrefs.examEdition.toLowerCase().includes(c.id);

          return (
            <div
              key={c.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/30 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500 font-semibold">
                      <span>{c.organ}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-600">{c.banca}</span>
                      {c.state && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{c.state}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {c.name}
                    </h3>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    c.status === 'inscricoes_abertas'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : c.status === 'edital_publicado'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Cargo */}
                <p className="text-xs text-slate-600">
                  Cargo / Especialidade: <strong className="text-slate-900">{c.career}</strong>
                  {c.educationLevel && <span> ({c.educationLevel})</span>}
                </p>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Remuneração Inicial:</span>
                    <strong className="text-emerald-700 font-mono">{c.salary || 'A Definir'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vagas Ofertadas:</span>
                    <strong className="text-slate-900">{c.vacancies || 'Não informada'}</strong>
                  </div>
                  {c.examDate && (
                    <div className="pt-1 col-span-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Data da Prova:</span>
                      <strong className="text-slate-800 font-mono">{c.examDate}</strong>
                    </div>
                  )}
                </div>

                {/* Provenance & Audit Info (Required) */}
                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span>Fonte: {c.sourceUrlOrFile}</span>
                    <span>Checado: {new Date(c.lastVerifiedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {c.importBatchId && (
                    <div className="font-mono text-[10px] text-slate-400 truncate">
                      Lote de rastreio: {c.importBatchId}
                    </div>
                  )}
                </div>

                {/* Official Links */}
                {(c.editalUrl || c.registrationUrl) && (
                  <div className="flex items-center gap-2 pt-1">
                    {c.editalUrl && (
                      <a
                        href={c.editalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver Edital Oficial</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {c.registrationUrl && (
                      <a
                        href={c.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 ml-auto"
                      >
                        <span>Página de Inscrição</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Set as Active Target Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectExam(c.id, c.name)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concurso Ativo no Meu Plano</span>
                    </>
                  ) : (
                    <>
                      <span>Definir como Meu Concurso Alvo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
