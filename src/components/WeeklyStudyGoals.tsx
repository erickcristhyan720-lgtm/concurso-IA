import React, { useState } from 'react';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Sliders, 
  Flame, 
  Sparkles, 
  Plus, 
  Minus, 
  X, 
  Check, 
  Calendar,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { Task, UserPreferences, WeeklyStudyGoal } from '../types';
import { storage } from '../services/storage';

interface WeeklyStudyGoalsProps {
  tasks: Task[];
  userPrefs: UserPreferences;
  onNavigateToSchedule?: () => void;
}

export const WeeklyStudyGoals: React.FC<WeeklyStudyGoalsProps> = ({
  tasks,
  userPrefs,
  onNavigateToSchedule,
}) => {
  const [goal, setGoal] = useState<WeeklyStudyGoal>(() => storage.getWeeklyGoal());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'both' | 'hours' | 'tasks'>(goal.mode || 'both');
  const [extraNotice, setExtraNotice] = useState<string | null>(null);

  // Form edit temporary state
  const [editMode, setEditMode] = useState<'both' | 'hours' | 'tasks'>(goal.mode);
  const [editHours, setEditHours] = useState<number>(goal.targetHours);
  const [editTasks, setEditTasks] = useState<number>(goal.targetTasks);
  const [editDays, setEditDays] = useState<number>(goal.targetDaysPerWeek || 6);
  const [editNote, setEditNote] = useState<string>(goal.customNote || '');

  // Progress metrics calculation
  const completedTasks = tasks.filter(t => t.completed);
  const completedTasksCount = completedTasks.length;
  const tasksMinutes = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const totalCompletedMinutes = tasksMinutes + (goal.extraMinutes || 0);
  
  const completedHoursDecimal = Math.round((totalCompletedMinutes / 60) * 10) / 10;
  const targetHours = Math.max(1, goal.targetHours);
  const targetTasks = Math.max(1, goal.targetTasks);

  const hoursProgress = Math.min(200, Math.round((completedHoursDecimal / targetHours) * 100));
  const tasksProgress = Math.min(200, Math.round((completedTasksCount / targetTasks) * 100));
  const overallProgress = Math.round((hoursProgress + tasksProgress) / 2);

  // Determine current day of week (Monday = 1, Sunday = 7)
  const today = new Date();
  const rawDay = today.getDay(); // 0 is Sun, 1 is Mon...
  const dayOfWeekIndex = rawDay === 0 ? 7 : rawDay; 
  const daysRemainingInWeek = Math.max(1, 7 - dayOfWeekIndex + 1);

  // Expected progress benchmark for current day of week (assuming linear distribution)
  const expectedPacePercent = Math.round((dayOfWeekIndex / 7) * 100);
  const mainProgress = activeTab === 'hours' ? hoursProgress : activeTab === 'tasks' ? tasksProgress : overallProgress;
  const isAheadOfPace = mainProgress >= expectedPacePercent;
  const isGoalCompleted = mainProgress >= 100;

  // Pace calculations
  const remainingHours = Math.max(0, Math.round((targetHours - completedHoursDecimal) * 10) / 10);
  const remainingTasks = Math.max(0, targetTasks - completedTasksCount);
  const recommendedDailyMinutes = daysRemainingInWeek > 0 
    ? Math.round((remainingHours * 60) / daysRemainingInWeek) 
    : 0;

  // Save changes from modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WeeklyStudyGoal = {
      ...goal,
      mode: editMode,
      targetHours: Math.max(1, editHours),
      targetTasks: Math.max(1, editTasks),
      targetDaysPerWeek: Math.max(1, Math.min(7, editDays)),
      customNote: editNote.trim(),
    };
    storage.saveWeeklyGoal(updated);
    setGoal(updated);
    setActiveTab(editMode);
    setIsEditModalOpen(false);
  };

  // Quick preset selection
  const applyPreset = (h: number, t: number, days: number, label: string) => {
    setEditHours(h);
    setEditTasks(t);
    setEditDays(days);
    setEditNote(`Meta: ${label}`);
  };

  // Quick extra study adder
  const handleAddExtraMinutes = (mins: number) => {
    const updated = storage.addExtraStudyMinutes(mins);
    setGoal(updated);
    setExtraNotice(
      mins > 0 
        ? `+${mins >= 60 ? `${mins / 60}h` : `${mins}min`} computados na meta semanal!` 
        : `${mins}min ajustados.`
    );
    setTimeout(() => setExtraNotice(null), 3000);
  };

  const handleResetExtra = () => {
    const updated: WeeklyStudyGoal = { ...goal, extraMinutes: 0 };
    storage.saveWeeklyGoal(updated);
    setGoal(updated);
    setExtraNotice('Horas extras avulsas redefinidas para 0.');
    setTimeout(() => setExtraNotice(null), 3000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-indigo-600 font-semibold">
              <Target className="w-3.5 h-3.5" />
              Metas Semanais de Estudos
            </span>
            <span aria-hidden="true">·</span>
            <span>Ciclo Semanal</span>
            <span aria-hidden="true">·</span>
            <span>{daysRemainingInWeek} {daysRemainingInWeek === 1 ? 'dia restante' : 'dias restantes'}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            Progresso em Relação ao Planejado
          </h2>
        </div>

        {/* View Mode Switcher + Edit Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'hours'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Horas ({completedHoursDecimal}h / {targetHours}h)
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tarefas ({completedTasksCount} / {targetTasks})
            </button>
          </div>

          <button
            onClick={() => {
              setEditMode(goal.mode);
              setEditHours(goal.targetHours);
              setEditTasks(goal.targetTasks);
              setEditDays(goal.targetDaysPerWeek || 6);
              setEditNote(goal.customNote || '');
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
            title="Ajustar metas de horas e blocos"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Ajustar Metas</span>
          </button>
        </div>
      </div>

      {/* Main Visual Progress Section */}
      <div className="space-y-4">
        {/* Visual Progress Bar Card */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isGoalCompleted 
            ? 'bg-emerald-50/70 border-emerald-200/90' 
            : 'bg-slate-50/60 border-slate-200/70'
        }`}>
          {/* Progress Header */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {activeTab === 'hours' 
                  ? 'Meta em Horas de Estudo' 
                  : activeTab === 'tasks' 
                  ? 'Meta em Blocos de Tarefas' 
                  : 'Progresso Consolidado da Semana'}
              </span>
              {isGoalCompleted ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Meta Atingida!
                </span>
              ) : isAheadOfPace ? (
                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                  Ritmo Ideal
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  Atenção ao Ritmo
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {mainProgress}%
              </span>
              <span className="text-xs text-slate-500 font-medium">concluído</span>
            </div>
          </div>

          {/* Primary Interactive Visual Progress Bar */}
          <div className="relative w-full bg-slate-200/80 h-3.5 sm:h-4 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                isGoalCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm'
                  : isAheadOfPace
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 via-indigo-500 to-indigo-600'
              }`}
              style={{ width: `${Math.min(100, mainProgress)}%` }}
            >
              {/* Soft glow animation line */}
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>

            {/* Expected Pace Marker indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-slate-600/40 z-10"
              style={{ left: `${Math.min(100, expectedPacePercent)}%` }}
              title={`Ritmo esperado para hoje (${expectedPacePercent}%)`}
            />
          </div>

          {/* Milestone markers / scale labels */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
            <span>0%</span>
            <span>25%</span>
            <span className="hidden sm:inline">50%</span>
            <span>75%</span>
            <span className="font-bold text-slate-600">100% (Meta)</span>
          </div>

          {/* Contextual Feedback & Remaining Advice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200/60 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {isGoalCompleted ? (
                  <strong className="text-emerald-800">
                    Sensacional! Você já superou sua meta semanal de estudos!
                  </strong>
                ) : (
                  <span>
                    Faltam <strong>{remainingHours}h</strong> e <strong>{remainingTasks} blocos</strong> para fechar a semana.
                  </span>
                )}
              </span>
            </div>

            {!isGoalCompleted && (
              <div className="text-[11px] text-slate-500 font-medium">
                Ritmo sugerido: <strong>~{recommendedDailyMinutes} min/dia</strong> nos próximos {daysRemainingInWeek} dias.
              </div>
            )}
          </div>
        </div>

        {/* Dual Progress Bars if in "both" view */}
        {activeTab === 'both' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Hours specific card */}
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Horas de Estudo</span>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  {completedHoursDecimal}h <span className="text-slate-400 font-normal">/ {targetHours}h</span>
                  <span className="ml-1.5 text-xs text-indigo-600 font-semibold">({hoursProgress}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, hoursProgress)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{Math.round(totalCompletedMinutes)} min acumulados</span>
                <span>{remainingHours > 0 ? `Faltam ${remainingHours}h` : 'Meta batida!'}</span>
              </div>
            </div>

            {/* Tasks specific card */}
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Blocos / Tarefas</span>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  {completedTasksCount} <span className="text-slate-400 font-normal">/ {targetTasks}</span>
                  <span className="ml-1.5 text-xs text-emerald-600 font-semibold">({tasksProgress}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, tasksProgress)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{completedTasksCount} tarefas cumpridas</span>
                <span>{remainingTasks > 0 ? `Faltam ${remainingTasks} blocos` : 'Meta batida!'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Log Extra Study Time & Strategy Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Registrar Estudo Avulso:</span>{' '}
              <span className="text-slate-500">Vídeo-aulas, leitura da lei seca ou livros fora da grade.</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleAddExtraMinutes(30)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
              title="Adicionar 30 minutos de estudo livre"
            >
              +30 min
            </button>
            <button
              onClick={() => handleAddExtraMinutes(60)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
              title="Adicionar 1 hora de estudo livre"
            >
              +1 hora
            </button>
            {goal.extraMinutes > 0 && (
              <button
                onClick={handleResetExtra}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Zerar minutos extras avulsos"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Extra Notice Toast */}
        {extraNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in">
            <span>{extraNotice}</span>
            <button onClick={() => setExtraNotice(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Custom Study Note if configured */}
        {goal.customNote && (
          <div className="flex items-start gap-2 text-xs text-slate-600 bg-indigo-50/50 border border-indigo-100/80 rounded-xl p-2.5">
            <Info className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-indigo-950">Foco Estratégico da Semana: </span>
              <span>{goal.customNote}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Ajustar Metas Semanais */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Definir Metas Semanais</h3>
                  <p className="text-xs text-slate-500">Calibre suas horas de estudo e blocos de tarefas</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Rápidos */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Sugestões Rápidas de Ritmo:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(8, 6, 5, 'Iniciante / Leve')}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 block">Leve</span>
                  <span className="text-[11px] text-slate-500 block">8h · 6 blocos</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(14, 10, 6, 'Equilibrado / Moderado')}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/30 text-left hover:border-indigo-500 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-indigo-900 block">Equilibrado</span>
                  <span className="text-[11px] text-slate-500 block">14h · 10 blocos</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(20, 15, 6, 'Intensivo / Foco')}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 block">Intenso</span>
                  <span className="text-[11px] text-slate-500 block">20h · 15 blocos</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(28, 20, 7, 'Reta Final / Edital')}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 block">Reta Final</span>
                  <span className="text-[11px] text-slate-500 block">28h · 20 blocos</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Modo de Acompanhamento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Métrica Principal de Acompanhamento:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode('hours')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      editMode === 'hours'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Horas de Estudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode('tasks')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      editMode === 'tasks'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Blocos / Tarefas
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode('both')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      editMode === 'both'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Ambos Integrados
                  </button>
                </div>
              </div>

              {/* Controles de Horas e Tarefas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Meta de Horas */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Horas Semanais:</span>
                    <span className="text-sm font-bold font-mono text-indigo-600">{editHours}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditHours(h => Math.max(1, h - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="2"
                      max="45"
                      step="1"
                      value={editHours}
                      onChange={(e) => setEditHours(Number(e.target.value))}
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setEditHours(h => Math.min(60, h + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Média: ~{Math.round((editHours * 60) / editDays)} min por dia de estudo
                  </div>
                </div>

                {/* Meta de Blocos */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Blocos de Tarefas:</span>
                    <span className="text-sm font-bold font-mono text-emerald-600">{editTasks}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditTasks(t => Math.max(1, t - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="2"
                      max="35"
                      step="1"
                      value={editTasks}
                      onChange={(e) => setEditTasks(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setEditTasks(t => Math.min(50, t + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Média: ~{(editTasks / editDays).toFixed(1)} blocos por dia de estudo
                  </div>
                </div>
              </div>

              {/* Dias de Estudo Ativos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Dias de estudo ativo na semana:</span>
                  <span className="font-bold text-slate-900">{editDays} dias por semana</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[4, 5, 6, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setEditDays(d)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        editDays === d
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {d} dias
                    </button>
                  ))}
                </div>
              </div>

              {/* Anotação de Foco */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Lembrete de Foco da Semana (Opcional):
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Ex: Concluir módulo de Licitações e fazer 20 questões Cebraspe"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Metas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
