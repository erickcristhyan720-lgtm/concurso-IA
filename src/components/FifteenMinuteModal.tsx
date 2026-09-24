import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReviewItem, Question } from '../types';

interface FifteenMinuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingReviews: ReviewItem[];
  sampleQuestions: Question[];
  onRecordResult: (reviewId: string, result: 'errei' | 'dificuldade' | 'facilidade') => void;
  onNavigateToStudy: () => void;
}

export const FifteenMinuteModal: React.FC<FifteenMinuteModalProps> = ({
  isOpen,
  onClose,
  pendingReviews,
  sampleQuestions,
  onRecordResult,
  onNavigateToStudy,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Pick up to 3 items prioritized by pending spaced reviews, then sample questions
  const itemsToReview: Question[] = React.useMemo(() => {
    if (pendingReviews.length > 0) {
      return pendingReviews.slice(0, 3).map(r => r.question);
    }
    return sampleQuestions.slice(0, 3);
  }, [pendingReviews, sampleQuestions]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setCompleted(false);
      setSecondsRemaining(15 * 60);
      return;
    }

    const interval = setInterval(() => {
      if (isTimerRunning) {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning]);

  if (!isOpen) return null;

  const currentQ = itemsToReview[currentIndex];
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const currentReviewItem = pendingReviews.find(r => r.questionId === currentQ?.id);

  const handleSelect = (optionId: string) => {
    if (showExplanation) return;
    setSelectedOption(optionId);
    setShowExplanation(true);

    const isCorrect = optionId === currentQ.correctOption;
    if (currentReviewItem) {
      onRecordResult(
        currentReviewItem.id, 
        isCorrect ? 'facilidade' : 'errei'
      );
    }
  };

  const handleNext = () => {
    if (currentIndex < itemsToReview.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-amber-500/10 border-b border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Modo Expresso: 15 Minutos
              </h3>
              <p className="text-xs text-amber-900/80">
                Seleção rápida baseada em suas dificuldades e revisões pendentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono text-xs font-semibold px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-amber-900 tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!completed ? (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Item {currentIndex + 1} de {itemsToReview.length}</span>
                <span className="font-medium text-indigo-600">{currentQ.subject} · {currentQ.topic}</span>
              </div>

              {/* Statement */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm leading-relaxed">
                {currentQ.contextText && (
                  <p className="text-xs text-slate-600 mb-2 italic">
                    "{currentQ.contextText}"
                  </p>
                )}
                <p className="font-medium text-slate-900">
                  {currentQ.statement}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt) => {
                  const isChosen = selectedOption === opt.id;
                  const isCorrect = opt.id === currentQ.correctOption;
                  let optStyle = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50';

                  if (showExplanation) {
                    if (isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium';
                    } else if (isChosen && !isCorrect) {
                      optStyle = 'border-rose-400 bg-rose-50/80 text-rose-950';
                    } else {
                      optStyle = 'border-slate-200 opacity-60 bg-slate-50';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      disabled={showExplanation}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        showExplanation && isCorrect 
                          ? 'bg-emerald-600 text-white' 
                          : showExplanation && isChosen && !isCorrect
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {opt.id}
                      </span>
                      <div className="flex-1 leading-snug">
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation card */}
              {showExplanation && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    {selectedOption === currentQ.correctOption ? (
                      <span className="text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Excelente! Você acertou.
                      </span>
                    ) : (
                      <span className="text-rose-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Atenção: oportunidade de fixação de erro.
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <strong>Habilidade:</strong> {currentQ.skillEvaluated}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">
                  Sessão de 15 Minutos Concluída!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Mesmo em dias corridos, 15 minutos consistentes mantêm sua memória de longo prazo ativa e destravam suas maiores dificuldades.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-left max-w-sm mx-auto">
                <p className="font-semibold text-slate-800 mb-1">Impacto registrado:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>3 itens revisados em repetição espaçada</li>
                  <li>Caderno de Erros sincronizado</li>
                  <li>Meta diária de manutenção cumprida</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          {!completed ? (
            <>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              {showExplanation && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <span>{currentIndex < itemsToReview.length - 1 ? 'Próxima Questão' : 'Finalizar Sessão'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Voltar ao Painel Hoje
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
