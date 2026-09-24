import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question } from '../types';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onCompleteDiagnostic: (score: number, wrongQuestions: Question[]) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  questions,
  onCompleteDiagnostic,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const total = Math.min(10, questions.length);
  const activeQuestions = questions.slice(0, total);
  const currentQ = activeQuestions[currentIndex];

  const handleSelect = (optionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishDiagnostic();
    }
  };

  const finishDiagnostic = () => {
    setIsFinished(true);
    let correctCount = 0;
    const wrongList: Question[] = [];

    activeQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctOption) {
        correctCount++;
      } else {
        wrongList.push(q);
      }
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    onCompleteDiagnostic(correctCount, wrongList);
  };

  const calculateResults = () => {
    let correct = 0;
    const byArea: Record<string, { total: number; correct: number }> = {
      Matemática: { total: 0, correct: 0 },
      Natureza: { total: 0, correct: 0 },
      Humanas: { total: 0, correct: 0 },
      Linguagens: { total: 0, correct: 0 },
    };

    activeQuestions.forEach(q => {
      const isCorrect = userAnswers[q.id] === q.correctOption;
      if (isCorrect) correct++;
      if (!byArea[q.area]) byArea[q.area] = { total: 0, correct: 0 };
      byArea[q.area].total++;
      if (isCorrect) byArea[q.area].correct++;
    });

    return { correct, byArea };
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Diagnóstico Preliminar
              </span>
              <span className="text-xs text-slate-400">
                {!isFinished ? `Questão ${currentIndex + 1} de ${total}` : 'Resultado'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!isFinished ? (
            <>
              {/* Question metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-600">{currentQ.area} · {currentQ.subject}</span>
                <span>{currentQ.topic}</span>
              </div>

              {/* Statement */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 text-sm leading-relaxed">
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
                  const isSelected = userAnswers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-medium ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
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
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Diagnóstico Preliminar Concluído
                </h3>
                <p className="text-xs text-slate-500">
                  Você acertou <strong>{calculateResults().correct} de {total} questões</strong> ({Math.round((calculateResults().correct / total) * 100)}%).
                </p>
              </div>

              {/* Mandatory disclaimer */}
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-950 leading-relaxed flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Diagnóstico Preliminar:</strong> Uma amostra de 10 itens não determina domínio absoluto das matérias nem equivale à pontuação TRI oficial do exame. Este resultado serviu para mapear seus pontos de partida no plano de estudos.
                </div>
              </div>

              {/* Breakdown by Area */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Desempenho por Grande Área:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(calculateResults().byArea).map(([area, data]) => {
                    const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                    return (
                      <div key={area} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex justify-between text-xs font-medium text-slate-800">
                          <span>{area}</span>
                          <span>{data.correct}/{data.total}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 leading-relaxed">
                ✨ <strong>Próximo passo:</strong> As questões erradas já foram automaticamente adicionadas ao seu <strong>Caderno de Erros</strong> com revisão agendada para 24h e resolução detalhada!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {!isFinished ? (
            <>
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Pular por Enquanto
              </button>
              <button
                onClick={handleNext}
                disabled={!userAnswers[currentQ.id]}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <span>{currentIndex < total - 1 ? 'Próxima Questão' : 'Ver Resultado'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Começar Meu Plano no Painel Hoje
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
