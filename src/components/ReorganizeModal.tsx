import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, Check, RefreshCw, Sliders, ArrowRight } from 'lucide-react';
import { Task, UserPreferences } from '../types';

interface ReorganizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  userPrefs: UserPreferences;
  onConfirmReorganize: (newDailyMinutes: number, prioritizedSubjects: string[]) => void;
}

export const ReorganizeModal: React.FC<ReorganizeModalProps> = ({
  isOpen,
  onClose,
  tasks,
  userPrefs,
  onConfirmReorganize,
}) => {
  const [dailyMinutes, setDailyMinutes] = useState(userPrefs.dailyMinutes || 90);
  const [prioritizedSubjects, setPrioritizedSubjects] = useState<string[]>(
    userPrefs.difficultSubjects || []
  );

  if (!isOpen) return null;

  const pendingTasks = tasks.filter(t => !t.completed);
  const totalPendingMinutes = pendingTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  // Calculation of distribution
  const estimatedDaysToFinish = Math.ceil(totalPendingMinutes / dailyMinutes);
  const exceedsOneDay = totalPendingMinutes > dailyMinutes;

  const toggleSubject = (sub: string) => {
    setPrioritizedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleApply = () => {
    onConfirmReorganize(dailyMinutes, prioritizedSubjects);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Perdeu um dia de estudos?
              </h3>
              <p className="text-xs text-slate-500">
                Reorganize suas tarefas sem sobrecarga mental
              </p>
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
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Situation Analysis */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tarefas pendentes acumuladas:</span>
              <span className="font-semibold text-slate-800">{pendingTasks.length} tarefas</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tempo total acumulado:</span>
              <span className="font-semibold text-slate-900">{totalPendingMinutes} minutos</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-500">Sua disponibilidade configurada:</span>
              <span className="font-bold text-indigo-600">{dailyMinutes} min/dia</span>
            </div>
          </div>

          {/* Time Limitation Transparency Notice */}
          {exceedsOneDay && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="block font-semibold mb-0.5">
                  Limitação de Prazo Identificada
                </strong>
                O conteúdo acumulado ({totalPendingMinutes} min) excede o seu limite diário saudável ({dailyMinutes} min). 
                Não adianta acumular 4 horas em um único dia. O algoritmo manterá no topo de hoje apenas as <strong>atividades de maior impacto e peso</strong>, redistribuindo o restante de forma suave ao longo de {estimatedDaysToFinish} dias.
              </div>
            </div>
          )}

          {/* Daily Availability Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-800">
                Ajustar minutos disponíveis por dia:
              </label>
              <span className="font-bold text-indigo-600 font-mono text-sm">
                {dailyMinutes} min
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="240"
              step="15"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>30 min (Express)</span>
              <span>90 min (Padrão)</span>
              <span>180 min (Intensivo)</span>
            </div>
          </div>

          {/* Subject Priority Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              Priorizar matérias com maior peso ou dificuldade hoje:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Matemática',
                'Física',
                'Química',
                'Biologia',
                'Redação',
                'História',
                'Geografia',
                'Linguagens',
              ].map((sub) => {
                const isSelected = prioritizedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            Manter Como Está
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <span>Reorganizar Sem Sobrecarga</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
