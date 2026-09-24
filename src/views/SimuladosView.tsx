import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Flag, 
  Play, 
  ArrowRight, 
  RotateCcw,
  BarChart2,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question } from '../types';

interface SimuladosViewProps {
  questions: Question[];
  onAddToReview: (question: Question, selectedOption: 'A' | 'B' | 'C' | 'D' | 'E', errorCause?: string) => void;
}

type SimuladoFormat = 'rapido' | 'materia' | 'personalizado' | 'completo';

export const SimuladosView: React.FC<SimuladosViewProps> = ({
  questions,
  onAddToReview,
}) => {
  const [activeMode, setActiveMode] = useState<'selection' | 'running' | 'results'>('selection');
  const [selectedFormat, setSelectedFormat] = useState<SimuladoFormat>('rapido');
  const [simuladoQuestions, setSimuladoQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [startTime, setStartTime] = useState<number>(0);
  const [finishTime, setFinishTime] = useState<number>(0);

  // Timer interval
  useEffect(() => {
    let timer: any;
    if (activeMode === 'running') {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleFinishSimulado();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeMode]);

  const handleStart = (format: SimuladoFormat) => {
    setSelectedFormat(format);
    let count = 5;
    let timeMinutes = 15;

    if (format === 'rapido') {
      count = 5;
      timeMinutes = 15;
    } else if (format === 'materia') {
      count = 8;
      timeMinutes = 24;
    } else if (format === 'personalizado') {
      count = 6;
      timeMinutes = 18;
    } else if (format === 'completo') {
      count = 10;
      timeMinutes = 30;
    }

    const selectedQ = [...questions].sort(() => 0.5 - Math.random()).slice(0, count);
    setSimuladoQuestions(selectedQ);
    setSecondsRemaining(timeMinutes * 60);
    setAnswers({});
    setMarkedForReview({});
    setCurrentIndex(0);
    setStartTime(Date.now());
    setActiveMode('running');
  };

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const qId = simuladoQuestions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const toggleMarkReview = (qId: string) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleFinishSimulado = () => {
    setFinishTime(Date.now());
    setActiveMode('results');

    // Automatically feed incorrect questions into Caderno de Erros
    simuladoQuestions.forEach(q => {
      const userAns = answers[q.id];
      if (userAns && userAns !== q.correctOption) {
        onAddToReview(
          q,
          userAns,
          `Erro no Simulado: marcou ${userAns}. Gabarito: ${q.correctOption}. ${q.topic}`
        );
      }
    });

    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const currentQ = simuladoQuestions[currentIndex];
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  // Stats calculation
  const totalQuestions = simuladoQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = simuladoQuestions.filter(q => answers[q.id] === q.correctOption).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const totalElapsedSeconds = Math.max(1, Math.round((finishTime - startTime) / 1000));
  const avgSecondsPerQuestion = totalQuestions > 0 ? Math.round(totalElapsedSeconds / totalQuestions) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* SELECTION SCREEN */}
      {activeMode === 'selection' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <span>Treino com Cronômetro</span>
              <span aria-hidden="true">·</span>
              <span>Condições Reais</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Simulados & Treinos Cronometrados
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Treine sua velocidade, estratégia de prova e preenchimento consciente do tempo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-2xs hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  15 Minutos
                </span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Treino Rápido</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                5 questões interdisciplinares de alta relevância com tempo limite de 3 minutos por questão.
              </p>
              <button
                onClick={() => handleStart('rapido')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Iniciar Treino Rápido
              </button>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-2xs hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Por Área / Matéria
                </span>
                <Award className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Simulado Temático</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                8 questões focadas nas áreas de maior peso (Matemática e Ciências da Natureza).
              </p>
              <button
                onClick={() => handleStart('materia')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Iniciar Simulado Temático
              </button>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-2xs hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                  Personalizado
                </span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Foco em Dificuldades</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                6 questões selecionadas diretamente a partir dos seus pontos fracos mapeados.
              </p>
              <button
                onClick={() => handleStart('personalizado')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Iniciar Foco em Dificuldades
              </button>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-2xs hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-1 rounded-lg">
                  Completo
                </span>
                <Award className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Simulado Geral Integrado</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                10 itens cobrindo as 4 áreas da matriz de referência do ENEM com cronômetro de 30 min.
              </p>
              <button
                onClick={() => handleStart('completo')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Iniciar Simulado Integrado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RUNNING MODE */}
      {activeMode === 'running' && currentQ && (
        <div className="space-y-4">
          {/* Top Timer Bar */}
          <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-700">Simulado Ativo:</span>
              <span className="text-xs text-indigo-600 font-semibold">{currentQ.area} · {currentQ.subject}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>

              <button
                onClick={handleFinishSimulado}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Entregar Simulado
              </button>
            </div>
          </div>

          {/* Question Status Palette as required in Section 8 */}
          <div className="p-3 bg-white border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
              <span>Paleta de Questões ({answeredCount} de {totalQuestions} preenchidas)</span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" /> Respondida
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Marcada p/ rever
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-200" /> Pendente
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {simuladoQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isMarked = markedForReview[q.id];

                let pillColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isMarked) pillColor = 'bg-amber-100 text-amber-900 border border-amber-300';
                else if (isAnswered) pillColor = 'bg-indigo-600 text-white';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${pillColor} ${
                      isCurrent ? 'ring-2 ring-slate-900 ring-offset-1' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Statement & Options */}
          <div className="p-5 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>Questão {currentIndex + 1} de {totalQuestions}</span>
              <button
                onClick={() => toggleMarkReview(currentQ.id)}
                className={`flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                  markedForReview[currentQ.id] ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{markedForReview[currentQ.id] ? 'Marcada para rever' : 'Marcar para rever depois'}</span>
              </button>
            </div>

            {currentQ.contextText && (
              <p className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs text-slate-600 italic leading-relaxed">
                "{currentQ.contextText}"
              </p>
            )}

            <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
              {currentQ.statement}
            </h3>

            {/* Alternatives */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-medium ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-800'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {opt.id}
                    </span>
                    <div className="flex-1 leading-relaxed pt-0.5">
                      {opt.text}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation footer */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
              >
                ← Questão Anterior
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Próxima Questão →
                </button>
              ) : (
                <button
                  onClick={handleFinishSimulado}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Finalizar e Corrigir
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESULTS SCREEN */}
      {activeMode === 'results' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-xs text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Resultado do Simulado
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Você acertou <strong>{correctCount} de {totalQuestions} questões</strong> ({scorePercent}% de acerto).
              </p>
            </div>

            {/* Mandatory Non-TRI Disclaimer as required in Section 8 */}
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-950 text-left max-w-xl mx-auto flex items-start gap-2.5 leading-relaxed">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso de Metodologia:</strong> Pontuação estimada simples calculada por taxa direta de acertos. 
                <strong> Não substitui o cálculo oficial do Inep baseado na Teoria de Resposta ao Item (TRI)</strong>, que pondera a consistência pedagógica entre itens fáceis, médios e difíceis.
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Tempo Total</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {Math.floor(totalElapsedSeconds / 60)} min {totalElapsedSeconds % 60}s
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Média por Questão</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {avgSecondsPerQuestion} seg
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 block">Caderno de Erros</span>
                <span className="text-base font-bold text-indigo-600 font-mono">
                  {totalQuestions - correctCount} alimentados
                </span>
              </div>
            </div>
          </div>

          {/* List of items and errors breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Revisão Item a Item:
            </h3>

            {simuladoQuestions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctOption;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Item {idx + 1}: {q.subject} · {q.topic}</span>
                    <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isCorrect ? '✓ Acertou' : `✗ Errou (Marcou ${userAns || 'Em branco'} | Gabarito ${q.correctOption})`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {q.statement}
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1 mt-1 border-t border-slate-200">
                    <strong>Resolução:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setActiveMode('selection')}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Voltar ao Menu de Simulados
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
