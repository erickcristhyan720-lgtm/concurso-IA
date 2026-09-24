import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  Circle,
  Clock, 
  Coffee, 
  Sparkles, 
  Check, 
  X,
  Target,
  Flame,
  ListTodo
} from 'lucide-react';
import { Task } from '../types';
import { storage } from '../services/storage';

interface PomodoroTimerProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  activeTaskId?: string | null;
  onSelectTask?: (taskId: string) => void;
}

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,       // 25 minutes
  shortBreak: 5 * 60,   // 5 minutes
  longBreak: 15 * 60,   // 15 minutes
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  onToggleTask,
  activeTaskId,
  onSelectTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [focusDurationMinutes, setFocusDurationMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  // Selected task state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Sync with activeTaskId prop if passed
  useEffect(() => {
    if (activeTaskId) {
      setSelectedTaskId(activeTaskId);
    } else if (!selectedTaskId) {
      // Default to first pending task
      const firstPending = tasks.find(t => !t.completed);
      if (firstPending) {
        setSelectedTaskId(firstPending.id);
      }
    }
  }, [activeTaskId, tasks]);

  const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks.find(t => !t.completed) || tasks[0];

  // Web Audio chime synthesizer
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, delay: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur);
      };

      // Gentle two-tone chord
      playTone(523.25, 0, 0.4);   // C5
      playTone(659.25, 0.15, 0.5); // E5
      playTone(783.99, 0.3, 0.7);  // G5
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  };

  // Timer interval countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playChime();

      if (mode === 'focus') {
        const nextCycles = completedCycles + 1;
        setCompletedCycles(nextCycles);
        // Log extra minutes into study goals
        storage.addExtraStudyMinutes(focusDurationMinutes);

        const taskName = activeTask?.title ? `"${activeTask.title.slice(0, 32)}..."` : 'sua tarefa';
        setCompletionNotice(`🍅 Pomodoro concluído! +${focusDurationMinutes} min creditados. Deseja marcar ${taskName} como concluída?`);

        // Automatically switch to short or long break
        if (nextCycles % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(DEFAULT_DURATIONS.longBreak);
        } else {
          setMode('shortBreak');
          setTimeLeft(DEFAULT_DURATIONS.shortBreak);
        }
      } else {
        setCompletionNotice('☕ Pausa finalizada! Pronto para iniciar o próximo bloco de foco?');
        setMode('focus');
        setTimeLeft(focusDurationMinutes * 60);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, completedCycles, focusDurationMinutes, activeTask]);

  // Mode changer
  const handleSelectMode = (newMode: PomodoroMode, customMinutes?: number) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') {
      const mins = customMinutes || focusDurationMinutes;
      setFocusDurationMinutes(mins);
      setTimeLeft(mins * 60);
    } else {
      setTimeLeft(DEFAULT_DURATIONS[newMode]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setTimeLeft(focusDurationMinutes * 60);
    } else {
      setTimeLeft(DEFAULT_DURATIONS[mode]);
    }
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      const nextCycles = completedCycles + 1;
      setCompletedCycles(nextCycles);
      if (nextCycles % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(DEFAULT_DURATIONS.longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(DEFAULT_DURATIONS.shortBreak);
      }
    } else {
      setMode('focus');
      setTimeLeft(focusDurationMinutes * 60);
    }
  };

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Total duration for current mode
  const totalDuration = mode === 'focus' ? focusDurationMinutes * 60 : DEFAULT_DURATIONS[mode];
  const progressPercent = Math.max(0, Math.min(100, Math.round(((totalDuration - timeLeft) / totalDuration) * 100)));

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* 1. MINIMIZED FLOATING PILL */}
      {!isExpanded ? (
        <div 
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/95 hover:bg-slate-900 text-white rounded-full shadow-xl border border-slate-700/60 backdrop-blur-md transition-all transform hover:scale-105 cursor-pointer animate-in fade-in"
          title="Abrir Cronômetro Pomodoro"
        >
          {/* Status Indicator */}
          <div className="relative flex items-center justify-center">
            <span className="text-base">{mode === 'focus' ? '🍅' : '☕'}</span>
            {isRunning && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>

          {/* Time Countdown */}
          <div className="flex flex-col">
            <span className="text-sm font-bold font-mono tracking-tight leading-none">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-[160px] leading-tight">
              {activeTask ? activeTask.title : mode === 'focus' ? 'Ciclo de 25 min' : 'Pausa de Estudo'}
            </span>
          </div>

          {/* Mini Play / Pause button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRunning(!isRunning);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isRunning ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          {/* Expand Icon */}
          <ChevronUp className="w-4 h-4 text-slate-400" />
        </div>
      ) : (
        /* 2. EXPANDED INTERACTIVE CARD */
        <div className="w-[330px] sm:w-[360px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 fade-in">
          {/* Card Top Header */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍅</span>
              <div>
                <h4 className="text-xs font-bold tracking-tight">Cronômetro Pomodoro</h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span>Ciclo {(completedCycles % 4) + 1} de 4</span>
                  <span>·</span>
                  <span>{completedCycles} {completedCycles === 1 ? 'bloco concluído' : 'blocos concluídos'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title={soundEnabled ? 'Silenciar alerta sonoro' : 'Ativar alerta sonoro'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Minimizar para o canto"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium">
              <button
                onClick={() => handleSelectMode('focus', 25)}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  mode === 'focus'
                    ? 'bg-white text-indigo-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Foco 25m
              </button>
              <button
                onClick={() => handleSelectMode('shortBreak')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  mode === 'shortBreak'
                    ? 'bg-white text-indigo-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pausa 5m
              </button>
              <button
                onClick={() => handleSelectMode('longBreak')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  mode === 'longBreak'
                    ? 'bg-white text-indigo-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Descanso 15m
              </button>
            </div>

            {/* Quick Focus Durations Selector (if in focus mode) */}
            {mode === 'focus' && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Duração do foco:</span>
                <div className="flex items-center gap-1">
                  {[25, 45, 50].map(mins => (
                    <button
                      key={mins}
                      onClick={() => handleSelectMode('focus', mins)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        focusDurationMinutes === mins
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Central Clock Display & Progress Bar */}
            <div className="text-center py-2 relative">
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium flex items-center justify-center gap-1.5">
                {mode === 'focus' ? (
                  <>
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span>{isRunning ? 'Sessão de foco ativa' : 'Sessão em pausa'}</span>
                  </>
                ) : (
                  <>
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    <span>Descanse a mente antes do próximo bloco</span>
                  </>
                )}
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    mode === 'focus' ? 'bg-indigo-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>{progressPercent}% decorrido</span>
                <span>{Math.ceil(timeLeft / 60)} min restantes</span>
              </div>
            </div>

            {/* Play, Pause, Reset, Skip Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Reiniciar tempo atual"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-7 py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isRunning 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Iniciar Foco</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSkip}
                className="w-10 h-10 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Pular para a próxima etapa"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Task Integration Section */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  Tarefa Vinculada:
                </span>
                <button
                  onClick={() => setIsTaskSelectorOpen(!isTaskSelectorOpen)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer text-[11px]"
                >
                  {isTaskSelectorOpen ? 'Fechar lista' : 'Trocar tarefa'}
                </button>
              </div>

              {/* Task Selector Dropdown / List */}
              {isTaskSelectorOpen && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-2xl max-h-44 overflow-y-auto space-y-1 text-xs animate-in fade-in">
                  <span className="text-[10px] font-bold text-slate-400 block px-1">
                    Selecione a tarefa do seu cronograma:
                  </span>
                  {tasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        if (onSelectTask) onSelectTask(t.id);
                        setIsTaskSelectorOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                        t.id === selectedTaskId
                          ? 'bg-indigo-100/70 text-indigo-900 font-semibold'
                          : 'hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block truncate text-xs">{t.title}</span>
                        <span className="text-[10px] text-slate-500">{t.subject} · {t.estimatedMinutes} min</span>
                      </div>
                      {t.completed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Current Active Task Card */}
              {activeTask && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                      <span className="font-semibold text-slate-700 truncate">{activeTask.subject}</span>
                      <span>·</span>
                      <span>{activeTask.estimatedMinutes} min</span>
                    </div>
                    <h5 className={`text-xs font-semibold leading-tight line-clamp-1 ${
                      activeTask.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {activeTask.title}
                    </h5>
                  </div>

                  <button
                    onClick={() => onToggleTask(activeTask.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                      activeTask.completed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                    title={activeTask.completed ? 'Tarefa concluída (clique para reabrir)' : 'Concluir tarefa agora'}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{activeTask.completed ? 'Feita' : 'Concluir'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cycle completion notification alert */}
            {completionNotice && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium leading-snug">{completionNotice}</span>
                  <button onClick={() => setCompletionNotice(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {activeTask && !activeTask.completed && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onToggleTask(activeTask.id);
                        setCompletionNotice(null);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Sim, marcar tarefa como feita!
                    </button>
                    <button
                      onClick={() => setCompletionNotice(null)}
                      className="px-2 py-1 text-slate-600 hover:text-slate-800 text-[11px] cursor-pointer"
                    >
                      Deixar pendente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
