import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, 
  Sparkles, 
  Save, 
  Clock, 
  History, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  HelpCircle,
  FileText,
  SlidersHorizontal,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { Essay, CompetencyFeedback, EssayEvaluation } from '../types';
import { api } from '../services/api';

interface EssayViewProps {
  essay: Essay;
  onSaveEssay: (essay: Essay) => void;
  onAskTutorWithContext: (context: any) => void;
}

export const EssayView: React.FC<EssayViewProps> = ({
  essay,
  onSaveEssay,
  onAskTutorWithContext,
}) => {
  const [currentText, setCurrentText] = useState(essay.currentText);
  const [selectedExamType, setSelectedExamType] = useState<Essay['examType']>(essay.examType || 'ENEM');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EssayEvaluation | undefined>(essay.evaluation);
  const [showMotivators, setShowMotivators] = useState(true);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [comparingVersionText, setComparingVersionText] = useState<string | null>(null);
  const [showPhotoTranscriptionModal, setShowPhotoTranscriptionModal] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'salvo' | 'salvando'>('salvo');
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<any>(null);

  // Auto-save logic
  useEffect(() => {
    setSaveStatus('salvando');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      const updated: Essay = {
        ...essay,
        currentText,
        examType: selectedExamType,
        evaluation,
        lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      onSaveEssay(updated);
      setSaveStatus('salvo');
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [currentText, selectedExamType, evaluation]);

  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const paragraphCount = currentText.trim() ? currentText.split(/\n\s*\n/).filter(Boolean).length : 0;

  const handleSaveNewVersion = () => {
    const nextVerNum = (essay.versions?.length || 0) + 1;
    const newVersion = {
      id: `v-${Date.now()}`,
      versionNumber: nextVerNum,
      savedAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text: currentText,
      score: evaluation?.totalScore,
    };

    const updated: Essay = {
      ...essay,
      versions: [newVersion, ...(essay.versions || [])],
    };
    onSaveEssay(updated);
  };

  const handleEvaluate = async () => {
    if (currentText.trim().length < 150) {
      setEvaluationError('Por favor, escreva ou cole um texto com pelo menos 150 caracteres para avaliação pedagógica completa.');
      return;
    }

    setEvaluationError(null);
    setIsEvaluating(true);

    try {
      const result = await api.evaluateEssay({
        theme: essay.theme,
        text: currentText,
        examType: selectedExamType,
      });

      setEvaluation(result);
      const updated: Essay = {
        ...essay,
        evaluation: result,
      };
      onSaveEssay(updated);
    } catch (err: any) {
      console.error('Error in evaluateEssay:', err);
      setEvaluationError('Ocorreu uma instabilidade na conexão com o avaliador. Seus rascunhos continuam salvos localmente.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleConfirmPhotoTranscription = () => {
    if (transcribedText.trim()) {
      setCurrentText(prev => prev ? `${prev}\n\n${transcribedText}` : transcribedText);
      setShowPhotoTranscriptionModal(false);
      setTranscribedText('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Exam Rubric Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Estúdio de Redação</span>
            <span aria-hidden="true">·</span>
            <span>Rubrica Oficial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laboratório de Escrita & Correção Pedagógica
          </h1>
        </div>

        {/* Rubric Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Banca:</label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="ENEM">ENEM (5 Competências - 1.000 pts)</option>
            <option value="FUVEST">FUVEST (USP - 3 Quesitos - 50 pts)</option>
            <option value="UNICAMP">UNICAMP (Gêneros Textuais)</option>
            <option value="UERJ">UERJ (Romance Obrigatório)</option>
            <option value="UNESP">UNESP (Vunesp - 3 Critérios)</option>
          </select>
        </div>
      </div>

      {/* Mandatory Official Pedagogical Disclaimer Banner */}
      <div className="p-3.5 bg-slate-100/90 border border-slate-200 rounded-2xl flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 font-semibold">Aviso Pedagógico Oficial:</strong> Avaliação pedagógica estimada por IA baseada na cartilha oficial da edição selecionada. <strong>Não equivale à nota oficial do exame</strong> nem garante aprovação. O objetivo é apontar desvios argumentativos e fornecer exercícios práticos de reescrita.
        </div>
      </div>

      {/* Theme & Motivating Texts Accordion */}
      <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Proposta de Redação
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {essay.theme}
            </h2>
          </div>
          <button
            onClick={() => setShowMotivators(!showMotivators)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Expandir ou recolher textos motivadores"
          >
            {showMotivators ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showMotivators && (
          <div className="pt-2 border-t border-slate-100 space-y-3 animate-fadeIn">
            <p className="text-xs text-slate-500">
              A partir da leitura dos textos motivadores seguintes e dos conhecimentos construídos ao longo de sua formação, redija um texto dissertativo-argumentativo em modalidade escrita formal:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {essay.motivatingTexts.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5">
                  <span className="font-semibold text-slate-800 block text-[11px]">
                    {item.title}
                  </span>
                  <p className="text-slate-600 line-clamp-4 leading-relaxed italic">
                    "{item.content}"
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-200 truncate">
                    {item.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout: Text Editor (Left) & Evaluation/Versions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Area (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between text-xs px-2 text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono">
                <strong>{wordCount}</strong> palavras
              </span>
              <span>·</span>
              <span className="font-mono">
                <strong>{paragraphCount}</strong> parágrafos
              </span>
              <span>·</span>
              <span className="text-slate-400">
                {saveStatus === 'salvando' ? 'Salvando...' : 'Salvo localmente ✓'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Photo Upload Shortcut */}
              <button
                onClick={() => setShowPhotoTranscriptionModal(true)}
                className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium cursor-pointer"
                title="Enviar foto da redação manuscrita"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enviar Foto</span>
              </button>

              {/* Save Version button */}
              <button
                onClick={handleSaveNewVersion}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                title="Salvar como nova versão no histórico"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Versão</span>
              </button>
            </div>
          </div>

          {/* Textarea Editor */}
          <div className="relative bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 transition-all">
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Digite ou cole sua redação aqui. O salvamento é automático..."
              rows={16}
              className="w-full text-slate-800 text-sm sm:text-base leading-relaxed resize-y focus:outline-none placeholder:text-slate-400 font-sans"
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-400">
              *A contagem visual de linhas varia por dispositivo e não acarreta anulação automática.
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md"
            >
              <Sparkles className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Avaliando com Rubrica Oficial...' : 'Solicitar Avaliação da IA'}</span>
            </button>
          </div>

          {evaluationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{evaluationError}</span>
            </div>
          )}

          {/* Side-by-side version comparison if active */}
          {comparingVersionText && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  Comparação com Versão Anterior do Histórico
                </span>
                <button
                  onClick={() => setComparingVersionText(null)}
                  className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  Fechar Comparação
                </button>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-line">
                {comparingVersionText}
              </div>
            </div>
          )}
        </div>

        {/* Feedback & Competencies Breakdown (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {evaluation ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-5">
              {/* Score header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Pontuação Estimada
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
                      {evaluation.totalScore}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      / 1.000 pts
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onAskTutorWithContext({
                    exam: selectedExamType,
                    essayText: currentText,
                    score: evaluation.totalScore,
                    competencies: evaluation.competencies,
                  })}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tirar Dúvida com Max</span>
                </button>
              </div>

              {/* Top 3 Priorities for Next Version */}
              {evaluation.topPriorities && evaluation.topPriorities.length > 0 && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    3 Prioridades para a Próxima Reescrita:
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-indigo-900 space-y-1 pl-1">
                    {evaluation.topPriorities.map((prio, idx) => (
                      <li key={idx} className="leading-snug">
                        {prio}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* The 5 ENEM Competencies */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Avaliação por Competência:
                </h4>

                <div className="space-y-3">
                  {evaluation.competencies.map((comp) => (
                    <div key={comp.id} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          C{comp.id}: {comp.name}
                        </span>
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {comp.score} / 200
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed">
                        {comp.justification}
                      </p>

                      {/* Excerpts cited */}
                      {comp.excerpts && comp.excerpts.length > 0 && (
                        <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-600 italic">
                          <strong>Trecho avaliado:</strong> {comp.excerpts[0]}
                        </div>
                      )}

                      {/* Practical suggestion */}
                      <p className="text-[11px] text-indigo-950">
                        <strong>Sugestão prática:</strong> {comp.suggestions}
                      </p>

                      {/* Targeted improvement exercise */}
                      {comp.exercise && (
                        <div className="p-2 bg-amber-50/80 border border-amber-200/70 rounded-lg text-[11px] text-amber-950">
                          <strong>Exercício de Fixação:</strong> {comp.exercise}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white border border-slate-200/90 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <PenTool className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Nenhuma avaliação gerada ainda
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Escreva ou cole seu texto e clique em <strong>"Solicitar Avaliação da IA"</strong> para receber o diagnóstico detalhado nas 5 competências oficiais do exame.
              </p>
            </div>
          )}

          {/* Versions History Card */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                Histórico de Versões
              </span>
              <span className="text-slate-400">
                {essay.versions?.length || 0} versões salvas
              </span>
            </div>

            {essay.versions && essay.versions.length > 0 ? (
              <div className="space-y-1.5">
                {essay.versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        Versão {ver.versionNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        {ver.savedAt}
                      </span>
                      {ver.score && (
                        <span className="ml-2 font-mono font-bold text-indigo-600">
                          ({ver.score} pts)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setComparingVersionText(ver.text)}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      Comparar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Nenhuma versão arquivada. Clique em "Salvar Versão" para guardar rascunhos.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Photo / Handwritten Essay Upload Modal with Transcription Confirmation */}
      {showPhotoTranscriptionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Digitalizar Redação Manuscrita
                </h3>
              </div>
              <button
                onClick={() => setShowPhotoTranscriptionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tire uma foto legível da folha de redação manuscrita. Revise e confirme a transcrição gerada antes de enviar para correção pedagógica.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Texto Transcrito (Revise e ajuste antes de confirmar):
              </label>
              <textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                placeholder="Cole aqui ou simule a transcrição da sua foto manuscrita..."
                rows={6}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setTranscribedText('No contexto social brasileiro contemporâneo, observa-se que a valorização dos povos e comunidades tradicionais é indispensável para a conservação ecológica e a preservação da identidade cultural nacional. Contudo, entraves estruturais e morosidade burocrática persistem no território.')}
                className="text-[11px] text-indigo-600 hover:underline font-medium"
              >
                + Carregar exemplo demonstrativo de foto transcrita
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPhotoTranscriptionModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPhotoTranscription}
                disabled={!transcribedText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Confirmar Transcrição e Inserir no Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
