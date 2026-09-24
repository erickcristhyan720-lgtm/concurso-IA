import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Bookmark, 
  RotateCw, 
  Flag, 
  Filter, 
  ArrowRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { Question, AreaType } from '../types';
import { api } from '../services/api';

interface StudyViewProps {
  questions: Question[];
  initialQuestionId?: string | null;
  onSaveAttempt: (questionId: string, selectedOption: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => void;
  onAddToReview: (question: Question, selectedOption: 'A' | 'B' | 'C' | 'D' | 'E', errorCause?: string) => void;
  onAskTutorWithContext: (context: any) => void;
}

export const StudyView: React.FC<StudyViewProps> = ({
  questions,
  initialQuestionId,
  onSaveAttempt,
  onAddToReview,
  onAskTutorWithContext,
}) => {
  const [selectedArea, setSelectedArea] = useState<AreaType | 'Todas'>('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Todas' | 'Fácil' | 'Médio' | 'Difícil'>('Todas');
  const [selectedOrigin, setSelectedOrigin] = useState<'Todas' | 'Oficial' | 'Autoral'>('Todas');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Synchronize when initialQuestionId changes
  React.useEffect(() => {
    if (initialQuestionId) {
      setSelectedArea('Todas');
      setSelectedDifficulty('Todas');
      setSelectedOrigin('Todas');
      const idx = questions.findIndex(q => q.id === initialQuestionId);
      if (idx !== -1) {
        setCurrentQuestionIndex(idx);
        setSelectedOption(null);
        setHasAnswered(false);
        setShowHint(false);
        setAddedToReview(false);
        setAlternateExplanation(null);
        setReportSuccess(false);
      }
    }
  }, [initialQuestionId, questions]);

  // Interaction states for the current question
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [addedToReview, setAddedToReview] = useState(false);
  const [alternateExplanation, setAlternateExplanation] = useState<string | null>(null);
  const [isExplainingAlternate, setIsExplainingAlternate] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (selectedArea !== 'Todas' && q.area !== selectedArea) return false;
    if (selectedDifficulty !== 'Todas' && q.difficulty !== selectedDifficulty) return false;
    if (selectedOrigin === 'Oficial' && !q.isOfficial) return false;
    if (selectedOrigin === 'Autoral' && q.isOfficial) return false;
    return true;
  });

  const activeQuestion = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (hasAnswered) return;
    setSelectedOption(optId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || hasAnswered) return;
    setHasAnswered(true);

    const isCorrect = selectedOption === activeQuestion.correctOption;
    onSaveAttempt(activeQuestion.id, selectedOption, isCorrect);

    // If incorrect, automatically prepare error tracking
    if (!isCorrect) {
      onAddToReview(
        activeQuestion,
        selectedOption,
        `Erro em ${activeQuestion.topic}: marcou ${selectedOption}. ${activeQuestion.options.find(o => o.id === selectedOption)?.reason || ''}`
      );
      setAddedToReview(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
    // Reset interaction state
    setSelectedOption(null);
    setHasAnswered(false);
    setShowHint(false);
    setAddedToReview(false);
    setAlternateExplanation(null);
    setReportSuccess(false);
  };

  const handleManualAddToReview = () => {
    if (!activeQuestion || !selectedOption) return;
    onAddToReview(activeQuestion, selectedOption, `Revisão solicitada pelo aluno em ${activeQuestion.topic}`);
    setAddedToReview(true);
  };

  const handleExplainDifferently = async () => {
    if (isExplainingAlternate) return;
    setIsExplainingAlternate(true);
    try {
      const res = await api.askTutor(
        `Por favor, explique esta questão de outro jeito, usando uma analogia simples do dia a dia e focando na alternativa correta ${activeQuestion.correctOption}.`,
        {
          exam: 'ENEM',
          subject: activeQuestion.subject,
          topic: activeQuestion.topic,
          selectedOption,
          correctOption: activeQuestion.correctOption,
          statement: activeQuestion.statement,
        },
        'explain-zero'
      );
      setAlternateExplanation(res.text);
    } catch (e) {
      setAlternateExplanation(`💡 **Analogia Alternativa:** Pense no conceito de ${activeQuestion.topic} como uma balança de dois pratos. A opção ${activeQuestion.correctOption} é a única que equilibra a premissa fundamental sem distorcer o resultado.`);
    } finally {
      setIsExplainingAlternate(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <span>Banco de Questões</span>
              <span aria-hidden="true">·</span>
              <span>Estudo Ativo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Prática com Correção Pedagógica Imediata
            </h1>
          </div>
          <div className="text-xs text-slate-500">
            Mostrando <strong>{filteredQuestions.length} questões</strong> no filtro
          </div>
        </div>

        {/* Filter Controls (Segmented Tabs) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Areas */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl">
            {(['Todas', 'Matemática', 'Natureza', 'Humanas', 'Linguagens'] as const).map((area) => (
              <button
                key={area}
                onClick={() => {
                  setSelectedArea(area);
                  setCurrentQuestionIndex(0);
                  setHasAnswered(false);
                  setSelectedOption(null);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedArea === area 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl">
            {(['Todas', 'Fácil', 'Médio', 'Difícil'] as const).map((dif) => (
              <button
                key={dif}
                onClick={() => {
                  setSelectedDifficulty(dif);
                  setCurrentQuestionIndex(0);
                  setHasAnswered(false);
                  setSelectedOption(null);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedDifficulty === dif 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dif}
              </button>
            ))}
          </div>

          {/* Origin: Oficial vs Autoral */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl">
            {(['Todas', 'Oficial', 'Autoral'] as const).map((orig) => (
              <button
                key={orig}
                onClick={() => {
                  setSelectedOrigin(orig);
                  setCurrentQuestionIndex(0);
                  setHasAnswered(false);
                  setSelectedOption(null);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedOrigin === orig 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {orig === 'Todas' ? 'Todas Origens' : orig === 'Oficial' ? 'Oficiais' : 'Autorais IA'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {activeQuestion ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          {/* Metadata & Strict Visual Differentiation of Official vs Authorial */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600">{activeQuestion.area}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">{activeQuestion.subject}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500">{activeQuestion.topic}</span>
            </div>

            {/* Visual Tag */}
            <div>
              {activeQuestion.isOfficial ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg font-semibold text-[11px]">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Item Oficial: {activeQuestion.institution} {activeQuestion.year} ({activeQuestion.source})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg font-medium text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Questão Autoral gerada por IA (Não é item oficial de prova)</span>
                </div>
              )}
            </div>
          </div>

          {/* Context Text & Statement */}
          <div className="space-y-3">
            {activeQuestion.contextText && (
              <div className="p-4 bg-slate-50/90 border border-slate-200/70 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "{activeQuestion.contextText}"
              </div>
            )}
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
              {activeQuestion.statement}
            </h3>
          </div>

          {/* Pre-Answer Hint Button */}
          {!hasAnswered && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'Ocultar pista' : 'Pedir uma pista antes de responder'}</span>
              </button>

              <span className="text-xs text-slate-400">
                Questão {currentQuestionIndex + 1} de {filteredQuestions.length}
              </span>
            </div>
          )}

          {showHint && !hasAnswered && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs text-indigo-950 leading-relaxed animate-fadeIn">
              💡 <strong>Pista do Professor Max:</strong> {activeQuestion.hint}
            </div>
          )}

          {/* Alternatives List */}
          <div className="space-y-2.5">
            {activeQuestion.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isCorrect = option.id === activeQuestion.correctOption;

              let optionClasses = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40 text-slate-800';

              if (hasAnswered) {
                if (isCorrect) {
                  optionClasses = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-medium ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  optionClasses = 'border-rose-400 bg-rose-50/90 text-rose-950';
                } else {
                  optionClasses = 'border-slate-200 opacity-60 bg-slate-50 text-slate-600';
                }
              } else if (isSelected) {
                optionClasses = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium ring-1 ring-indigo-600';
              }

              return (
                <div key={option.id} className="space-y-1">
                  <button
                    onClick={() => handleSelectOption(option.id)}
                    disabled={hasAnswered}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${optionClasses}`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      hasAnswered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : hasAnswered && isSelected && !isCorrect
                          ? 'bg-rose-500 text-white'
                          : isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                    }`}>
                      {option.id}
                    </span>
                    <div className="flex-1 leading-relaxed pt-0.5">
                      {option.text}
                    </div>
                  </button>

                  {/* After answering: display specific justification for each alternative */}
                  {hasAnswered && (
                    <div className="pl-10 pr-3 text-[11px] leading-relaxed">
                      {isCorrect ? (
                        <span className="text-emerald-700 font-medium">
                          ✓ Justificativa do gabarito: {option.reason}
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          ✗ Por que está incorreta: {option.reason}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button: Confirm or Next */}
          <div className="pt-2 flex items-center justify-between">
            {!hasAnswered ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={!selectedOption}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs"
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs ml-auto"
              >
                <span>Próxima Questão</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pedagogical Post-Answer Resolution Box */}
          {hasAnswered && (
            <div className="mt-4 p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {selectedOption === activeQuestion.correctOption ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Você acertou! Alternativa {activeQuestion.correctOption}
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Gabarito: Alternativa {activeQuestion.correctOption}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  {activeQuestion.skillEvaluated}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Resolução e Comentário Pedagógico:
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeQuestion.explanation}
                </p>
              </div>

              {/* Alternate Explanation from AI Tutor */}
              {alternateExplanation && (
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 leading-relaxed">
                  <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Explicação Alternativa do Professor Max:
                  </div>
                  <div className="whitespace-pre-line">
                    {alternateExplanation}
                  </div>
                </div>
              )}

              {/* Functional Post-Answer Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200">
                <button
                  onClick={handleExplainDifferently}
                  disabled={isExplainingAlternate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-indigo-600 ${isExplainingAlternate ? 'animate-spin' : ''}`} />
                  <span>{isExplainingAlternate ? 'Gerando...' : 'Explicar de outro jeito'}</span>
                </button>

                <button
                  onClick={handleManualAddToReview}
                  disabled={addedToReview}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                    addedToReview
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                  <span>{addedToReview ? 'No Caderno de Revisão ✓' : 'Adicionar à revisão'}</span>
                </button>

                <button
                  onClick={() => onAskTutorWithContext({
                    exam: 'ENEM',
                    subject: activeQuestion.subject,
                    topic: activeQuestion.topic,
                    selectedOption,
                    correctOption: activeQuestion.correctOption,
                    statement: activeQuestion.statement,
                  })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Perguntar ao Professor Max</span>
                </button>

                <button
                  onClick={() => setReportSuccess(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-slate-600 text-xs ml-auto cursor-pointer"
                  title="Reportar problema com enunciado ou gabarito"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{reportSuccess ? 'Reportado ✓' : 'Reportar problema'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3">
          <p className="text-slate-600 text-sm">
            Nenhuma questão encontrada com os filtros selecionados.
          </p>
          <button
            onClick={() => {
              setSelectedArea('Todas');
              setSelectedDifficulty('Todas');
              setSelectedOrigin('Todas');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
