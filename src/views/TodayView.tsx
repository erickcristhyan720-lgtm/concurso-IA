import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Layers, 
  PenTool, 
  Calendar, 
  Flame, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  AlertCircle,
  GitFork,
  Bell,
  Send,
  X
} from 'lucide-react';
import { Task, ReviewItem, Essay, UserPreferences, PushNotificationItem } from '../types';
import { notificationService } from '../services/notificationService';
import { WeeklyStudyGoals } from '../components/WeeklyStudyGoals';

interface TodayViewProps {
  userPrefs: UserPreferences;
  tasks: Task[];
  pendingReviews: ReviewItem[];
  latestEssay: Essay;
  daysUntilExam: number;
  onToggleTask: (taskId: string) => void;
  onStartActivity: (task: Task) => void;
  onOpen15Min: () => void;
  onOpenReorganize: () => void;
  onNavigateToTab: (tab: any) => void;
  onTriggerPushToast?: (notif: PushNotificationItem) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  userPrefs,
  tasks,
  pendingReviews,
  latestEssay,
  daysUntilExam,
  onToggleTask,
  onStartActivity,
  onOpen15Min,
  onOpenReorganize,
  onNavigateToTab,
  onTriggerPushToast,
}) => {
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Today's priority tasks: filter uncompleted first, limit to top 3
  const todayTasks = tasks.filter(t => t.dueDate === 'Hoje' || !t.completed);
  const nextActivity = todayTasks.find(t => !t.completed) || tasks[0];
  const topThreeTasks = todayTasks.slice(0, 3);
  const pendingTasksTotal = tasks.filter(t => !t.completed).length;

  const browserPerm = notificationService.getBrowserPermission();

  const handleTestPushBanner = async () => {
    if (browserPerm !== 'granted') {
      const perm = await notificationService.requestBrowserPermission();
      if (perm === 'granted') {
        const { notification } = notificationService.triggerTestPush();
        if (onTriggerPushToast) onTriggerPushToast(notification);
        setBannerFeedback('Permissão concedida! Notificação push enviada para o seu sistema.');
      } else {
        const { notification } = notificationService.triggerTestPush();
        if (onTriggerPushToast) onTriggerPushToast(notification);
        setBannerFeedback('Alerta de notificação disparado internamente no app!');
      }
    } else {
      const { notification, nativeSent } = notificationService.triggerTestPush();
      if (onTriggerPushToast) onTriggerPushToast(notification);
      if (nativeSent) {
        setBannerFeedback('Notificação push enviada para a área de trabalho do seu sistema!');
      } else {
        setBannerFeedback('Alerta de notificação disparado internamente no app!');
      }
    }
    setTimeout(() => setBannerFeedback(null), 4000);
  };

  // Weekly progress calculation
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length || 1;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  // Sum of estimated minutes for today's pending tasks
  const todayPendingMinutes = topThreeTasks
    .filter(t => !t.completed)
    .reduce((acc, t) => acc + t.estimatedMinutes, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Painel do Dia</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-600">{userPrefs.examEdition}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Olá, {userPrefs.name.split(' ')[0]}! O que vamos estudar agora?
          </h1>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpen15Min}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-900 transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Tenho só 15 min</span>
          </button>
          <button
            onClick={onOpenReorganize}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Reorganizar se perdeu um dia"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Perdeu um dia?</span>
          </button>
        </div>
      </div>

      {/* Push Notification Alert Banner */}
      {!isBannerDismissed && (pendingTasksTotal > 0 || pendingReviews.length > 0) && (
        <div className="bg-gradient-to-r from-indigo-50 via-white to-amber-50/50 border border-indigo-100 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Sistema de Notificações Push & Lembretes
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {pendingTasksTotal} tarefas · {pendingReviews.length} revisões
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                {browserPerm === 'granted'
                  ? 'Alertas push ativos no seu navegador para avisar sobre metas pendentes e revisões espaçadas.'
                  : 'Ative as notificações push para ser alertado no horário certo sobre suas revisões e metas do dia.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleTestPushBanner}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{browserPerm === 'granted' ? 'Testar Push' : 'Ativar Alertas'}</span>
            </button>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {bannerFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{bannerFeedback}</span>
          <button onClick={() => setBannerFeedback(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero: "Próxima Atividade" Card */}
      {nextActivity && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 shadow-lg">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
              <span className="px-2 py-0.5 bg-indigo-700/80 rounded-md">Próxima Atividade Recomendada</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {nextActivity.estimatedMinutes} minutos estimados
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {nextActivity.title}
            </h2>

            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Tópico chave do seu plano: <strong>{nextActivity.relatedTopic}</strong>. Focado em consolidar a teoria e fixar com itens práticos no padrão da prova.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onStartActivity(nextActivity)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Começar Agora</span>
              </button>

              <button
                onClick={() => onToggleTask(nextActivity.id)}
                className="px-3 py-2 text-xs text-indigo-200 hover:text-white transition-colors cursor-pointer"
              >
                Marcar como concluída
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Countdown */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Até a Prova</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {daysUntilExam > 0 ? daysUntilExam : '--'}
            </span>
            <span className="text-xs text-slate-500 font-medium">dias</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
            {userPrefs.examDate ? `Data: ${userPrefs.examDate}` : 'Confirmar data'}
          </span>
        </div>

        {/* Pending Reviews */}
        <div 
          onClick={() => onNavigateToTab('materiais')}
          className="p-4 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Revisões Pendentes</span>
            <Layers className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {pendingReviews.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">itens</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
            Caderno de Erros ativo
          </span>
        </div>

        {/* Today's Study Time */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Carga de Hoje</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {todayPendingMinutes}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ {userPrefs.dailyMinutes} min</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
            Dentro da sua meta diária
          </span>
        </div>

        {/* Last Essay score */}
        <div 
          onClick={() => onNavigateToTab('redacao')}
          className="p-4 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Última Redação</span>
            <PenTool className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-indigo-600 font-mono tabular-nums">
              {latestEssay.evaluation?.totalScore || 840}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 1.000</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
            {latestEssay.evaluation ? 'Rubrica Oficial ENEM' : 'Rascunho salvo'}
          </span>
        </div>
      </div>

      {/* Weekly Study Goals Component */}
      <WeeklyStudyGoals 
        tasks={tasks} 
        userPrefs={userPrefs} 
        onNavigateToSchedule={() => onNavigateToTab('cronograma')} 
      />

      {/* Main Grid: Priority Tasks (Left) & Spaced Review / Essay Focus (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 3 Priority Tasks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Tarefas Prioritárias de Hoje
              </h3>
              <p className="text-xs text-slate-500">
                Até 3 atividades calibradas para sua meta de {userPrefs.dailyMinutes} min
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('cronograma')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver cronograma completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topThreeTasks.map((task) => {
              const isTaskComplete = task.completed;
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    isTaskComplete
                      ? 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-80'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isTaskComplete
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-indigo-500'
                      }`}
                    >
                      {isTaskComplete && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">{task.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500 truncate">{task.relatedTopic}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-600 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes} min
                        </span>
                      </div>
                      <h4 className={`text-sm font-semibold leading-snug ${
                        isTaskComplete ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}>
                        {task.title}
                      </h4>
                    </div>
                  </div>

                  {!isTaskComplete && (
                    <button
                      onClick={() => onStartActivity(task)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      Iniciar
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Schedule Link / Tip */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-600 mt-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>{completedCount}</strong> de <strong>{totalTasks}</strong> tarefas do cronograma concluídas
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('cronograma')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Gerenciar tarefas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Caderno de Erros Highlights & Essay Tip */}
        <div className="space-y-4">
          {/* Caderno de Erros Card */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Caderno de Erros
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                {pendingReviews.length} para hoje
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Cada erro em uma questão gera uma explicação pedagógica e entra no ciclo de repetição espaçada (1, 7 e 30 dias).
            </p>

            {pendingReviews.length > 0 ? (
              <div className="space-y-2 pt-1">
                {pendingReviews.slice(0, 2).map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-800 block">
                      {item.question.subject} · {item.question.topic}
                    </span>
                    <span className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                      {item.errorCause}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 text-center">
                🎉 Nenhuma revisão pendente para agora. Parabéns!
              </div>
            )}

            <button
              onClick={() => onNavigateToTab('materiais')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Revisar Caderno de Erros
            </button>
          </div>

          {/* Redação feedback card */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <PenTool className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Foco na Redação
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {latestEssay.evaluation?.totalScore || 840} pts
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {latestEssay.evaluation?.topPriorities?.[0] || 'Priorize o aprofundamento do repertório legitimado na argumentação.'}
            </p>

            <button
              onClick={() => onNavigateToTab('redacao')}
              className="w-full py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Abrir Estúdio de Redação & Discursiva
            </button>
          </div>

          {/* Mapas Mentais & Mnemônicos card */}
          <div className="p-5 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-100 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Mapas Mentais Interativos
                  </h3>
                  <span className="text-[10px] text-indigo-700 font-semibold">
                    Mnemônicos & Leis Secas
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Fixe conceitos cobrados nas bancas com esquematizações em árvore e o modo ativo de recordação.
            </p>

            <button
              onClick={() => onNavigateToTab('mapas')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Explorar Mapas Mentais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
