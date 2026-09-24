import React, { useState } from 'react';
import { 
  Layers, 
  RotateCcw, 
  Check, 
  HelpCircle, 
  Flame, 
  BookOpen, 
  Plus, 
  Sparkles, 
  FileText, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  GitFork
} from 'lucide-react';
import { ReviewItem, Flashcard, PersonalMaterial, MindMap } from '../types';
import { api } from '../services/api';
import { MindMapsView } from './MindMapsView';

interface ReviewMaterialsViewProps {
  reviews: ReviewItem[];
  flashcards: Flashcard[];
  materials: PersonalMaterial[];
  mindMaps?: MindMap[];
  onRecordResult: (reviewId: string, result: 'errei' | 'dificuldade' | 'facilidade') => void;
  onSaveFlashcards: (cards: Flashcard[]) => void;
  onSaveMaterials: (materials: PersonalMaterial[]) => void;
  onSaveMindMaps?: (maps: MindMap[]) => void;
  onAskTutorWithContext: (context: any) => void;
  initialSubTab?: 'erros' | 'flashcards' | 'mapas' | 'materiais';
  initialReviewId?: string;
  initialFlashcardId?: string;
  initialMindMapId?: string;
}

export const ReviewMaterialsView: React.FC<ReviewMaterialsViewProps> = ({
  reviews,
  flashcards,
  materials,
  mindMaps = [],
  onRecordResult,
  onSaveFlashcards,
  onSaveMaterials,
  onSaveMindMaps = () => {},
  onAskTutorWithContext,
  initialSubTab,
  initialReviewId,
  initialFlashcardId,
  initialMindMapId,
}) => {
  const [subTab, setSubTab] = useState<'erros' | 'flashcards' | 'mapas' | 'materiais'>(initialSubTab || 'erros');
  const [filterStage, setFilterStage] = useState<'todos' | 1 | 7 | 30>('todos');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(initialReviewId || reviews[0]?.id || null);

  // Flashcards study state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Synchronize when initial props change from search navigation
  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
    if (initialMindMapId) {
      setSubTab('mapas');
    }
    if (initialReviewId) {
      setActiveReviewId(initialReviewId);
      setFilterStage('todos');
    }
    if (initialFlashcardId) {
      const idx = flashcards.findIndex(f => f.id === initialFlashcardId);
      if (idx !== -1) {
        setCurrentCardIndex(idx);
        setIsCardFlipped(false);
      }
    }
  }, [initialSubTab, initialReviewId, initialFlashcardId, initialMindMapId, flashcards]);

  // Materials converter state
  const [materialInput, setMaterialInput] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertType, setConvertType] = useState<'flashcards' | 'summary'>('flashcards');

  const filteredReviews = reviews.filter(r => {
    if (filterStage !== 'todos' && r.reviewStage !== filterStage) return false;
    return true;
  });

  const activeReview = reviews.find(r => r.id === activeReviewId) || filteredReviews[0];
  const activeFlashcard = flashcards[currentCardIndex] || flashcards[0];

  const handleConvertMaterial = async () => {
    if (!materialInput.trim()) return;
    setIsConverting(true);
    try {
      const res = await api.convertMaterial(materialInput, convertType);
      
      const newMaterial: PersonalMaterial = {
        id: `mat-${Date.now()}`,
        title: materialTitle.trim() || 'Anotações Pessoais',
        originalText: materialInput,
        createdAt: new Date().toLocaleDateString('pt-BR'),
        convertedType: convertType,
      };

      onSaveMaterials([newMaterial, ...materials]);

      if (convertType === 'flashcards' && res.flashcards) {
        const newCards: Flashcard[] = res.flashcards.map((c: any, i: number) => ({
          id: `fc-gen-${Date.now()}-${i}`,
          front: c.front,
          back: c.back,
          subject: 'Anotações',
          topic: materialTitle || 'Material Pessoal',
          intervalDays: 1,
        }));
        onSaveFlashcards([...newCards, ...flashcards]);
        setSubTab('flashcards');
      }

      setMaterialInput('');
      setMaterialTitle('');
    } catch (e) {
      console.error('Error converting material:', e);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Fixação & Memória de Longo Prazo</span>
            <span aria-hidden="true">·</span>
            <span>Repetição Espaçada</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Caderno de Erros & Materiais
          </h1>
        </div>

        {/* Subtabs Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setSubTab('erros')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'erros' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Caderno de Erros ({reviews.length})
          </button>
          <button
            onClick={() => setSubTab('flashcards')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'flashcards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flashcards ({flashcards.length})
          </button>
          <button
            onClick={() => setSubTab('mapas')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              subTab === 'mapas' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-indigo-700 hover:bg-indigo-50 font-bold'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Mapas Mentais ({mindMaps.length})</span>
          </button>
          <button
            onClick={() => setSubTab('materiais')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'materiais' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Converter Anotações
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CADERNO DE ERROS */}
      {subTab === 'erros' && (
        <div className="space-y-4">
          {/* Method banner */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950 flex items-start gap-3 leading-relaxed">
            <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong>Como funciona a Repetição Espaçada (1, 7 e 30 dias):</strong> Cada questão errada entra automaticamente aqui. Ao revisar, use os botões abaixo: se marcar <em>Errei</em>, o intervalo volta para 1 dia. Se marcar <em>Dificuldade</em>, mantém o estágio. Se marcar <em>Facilidade</em>, avança para 7 ou 30 dias até consolidar na memória de longo prazo.
            </div>
          </div>

          {/* Filters by stage */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Estágio:</span>
            {(['todos', 1, 7, 30] as const).map((stage) => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer border ${
                  filterStage === stage
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {stage === 'todos' ? 'Todos os Intervalos' : `${stage} ${stage === 1 ? 'dia' : 'dias'}`}
              </button>
            ))}
          </div>

          {/* Main Review Layout */}
          {filteredReviews.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Item List (Left 4 cols) */}
              <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto">
                {filteredReviews.map((item) => {
                  const isSelected = item.id === (activeReview?.id || activeReviewId);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveReviewId(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 ring-1 ring-indigo-600 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-indigo-600">{item.question.subject}</span>
                        <span className="font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.reviewStage} {item.reviewStage === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {item.question.topic}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {item.errorCause}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                        <span>Próxima: <strong>{item.nextReviewDate}</strong></span>
                        <span className="capitalize">{item.status === 'pending' ? 'Pendente' : 'Consolidado'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Review Details & Action Buttons (Right 8 cols) */}
              {activeReview && (
                <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600">{activeReview.question.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">{activeReview.question.topic}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 font-semibold rounded-lg text-[11px]">
                      Estágio de Repetição: {activeReview.reviewStage} {activeReview.reviewStage === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>

                  {/* Diagnóstico do Erro Registrado */}
                  <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs space-y-1">
                    <span className="font-bold text-rose-900 block">
                      Diagnóstico do Erro Cometido Anteriormente:
                    </span>
                    <p className="text-rose-950 leading-relaxed">
                      {activeReview.errorCause}
                    </p>
                    <div className="text-[11px] text-rose-800/80 pt-1">
                      Você havia marcado a opção <strong>{activeReview.selectedOption}</strong>. O gabarito é a opção <strong>{activeReview.question.correctOption}</strong>.
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="space-y-2">
                    {activeReview.question.contextText && (
                      <p className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600 italic">
                        "{activeReview.question.contextText}"
                      </p>
                    )}
                    <h3 className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {activeReview.question.statement}
                    </h3>
                  </div>

                  {/* Resolution & Explanation */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
                    <span className="font-bold text-slate-900 block">
                      Resolução Pedagógica Detalhada:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {activeReview.question.explanation}
                    </p>
                  </div>

                  {/* The 3 Core Spaced Repetition Interactive Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Como foi sua recordação desta questão agora?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => onRecordResult(activeReview.id, 'errei')}
                        className="p-3 rounded-2xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-900 text-left transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-xs block">Errei</span>
                        <span className="text-[11px] text-rose-800 block mt-0.5">
                          Reinicia o intervalo para 1 dia
                        </span>
                      </button>

                      <button
                        onClick={() => onRecordResult(activeReview.id, 'dificuldade')}
                        className="p-3 rounded-2xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-left transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-xs block">Com Dificuldade</span>
                        <span className="text-[11px] text-amber-800 block mt-0.5">
                          Mantém o intervalo atual
                        </span>
                      </button>

                      <button
                        onClick={() => onRecordResult(activeReview.id, 'facilidade')}
                        className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-left transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-xs block">Com Facilidade</span>
                        <span className="text-[11px] text-emerald-800 block mt-0.5">
                          Avança para {activeReview.reviewStage === 1 ? '7 dias' : '30 dias'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">
                Nenhum erro pendente neste estágio!
              </h4>
              <p className="text-xs text-slate-500">
                Continue praticando questões. Qualquer erro futuro será automaticamente arquivado aqui.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: FLASHCARDS */}
      {subTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Card {currentCardIndex + 1} de {flashcards.length}</span>
            <span className="font-semibold text-indigo-600">{activeFlashcard.subject} · {activeFlashcard.topic}</span>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="w-full min-h-[260px] bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {!isCardFlipped ? 'Frente (Pergunta / Conceito)' : 'Verso (Resposta / Resumo)'}
              </span>
              <span className="text-xs text-indigo-600 font-medium">
                Clique para virar ↺
              </span>
            </div>

            <div className="my-auto text-center py-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {!isCardFlipped ? activeFlashcard.front : activeFlashcard.back}
              </h3>
            </div>

            <div className="text-center text-[11px] text-slate-400">
              {!isCardFlipped ? 'Tente lembrar ativamente antes de virar' : 'Entendeu o conceito chave?'}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsCardFlipped(false);
                setCurrentCardIndex(prev => Math.max(0, prev - 1));
              }}
              disabled={currentCardIndex === 0}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              ← Anterior
            </button>

            <button
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Virar Card
            </button>

            <button
              onClick={() => {
                setIsCardFlipped(false);
                setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
              }}
              disabled={currentCardIndex === flashcards.length - 1}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB: MAPAS MENTAIS INTERATIVOS */}
      {subTab === 'mapas' && (
        <MindMapsView
          mindMaps={mindMaps}
          onSaveMindMaps={onSaveMindMaps}
          onAskTutorWithContext={onAskTutorWithContext}
          initialSelectedMapId={initialMindMapId}
        />
      )}

      {/* SUBTAB 3: CONVERTER ANOTAÇÕES */}
      {subTab === 'materiais' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Transformar Anotações Próprias em Estudo Ativo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cole anotações de aulas ou resumos para a IA converter automaticamente em flashcards ou resumos orientados a questões.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título ou Tema do Material:
              </label>
              <input
                type="text"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="Ex: Lei de Coulomb e Campo Elétrico"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Formato Desejado:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConvertType('flashcards')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    convertType === 'flashcards'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Gerar Flashcards de Fixação
                </button>
                <button
                  type="button"
                  onClick={() => setConvertType('summary')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    convertType === 'summary'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Resumo Pedagógico Focado
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cole o texto ou anotações:
              </label>
              <textarea
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                placeholder="Cole aqui seu texto da aula, transcrição ou tópicos que você anotou..."
                rows={7}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleConvertMaterial}
              disabled={isConverting || !materialInput.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className={`w-4 h-4 ${isConverting ? 'animate-spin' : ''}`} />
              <span>{isConverting ? 'Processando e Gerando...' : 'Converter em Estudo Ativo'}</span>
            </button>
          </div>

          {/* Converted materials library */}
          {materials.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Seus Materiais Processados:
              </h4>
              <div className="space-y-2">
                {materials.map((mat) => (
                  <div key={mat.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">{mat.title}</span>
                      <span className="text-[11px] text-slate-500">Salvo em {mat.createdAt} · {mat.convertedType}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Sincronizado
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
