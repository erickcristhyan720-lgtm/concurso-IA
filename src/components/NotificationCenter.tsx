import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Trash2, 
  X, 
  AlertCircle, 
  Check, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Settings,
  Send,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { PushNotificationItem, PushNotificationSettings, Task, ReviewItem } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationCenterProps {
  tasks: Task[];
  reviews: ReviewItem[];
  daysUntilExam: number;
  onNavigateToTab: (tab: any) => void;
  onOpenSettings: () => void;
  onPushToast?: (notif: PushNotificationItem) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  tasks,
  reviews,
  daysUntilExam,
  onNavigateToTab,
  onOpenSettings,
  onPushToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(() => notificationService.getNotifications());
  const [settings, setSettings] = useState<PushNotificationSettings>(() => notificationService.getSettings());
  const [permission, setPermission] = useState<NotificationPermission>(() => notificationService.getBrowserPermission());
  const [filter, setFilter] = useState<'all' | 'task' | 'review'>('all');
  const [testSentFeedback, setTestSentFeedback] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reload on open
  useEffect(() => {
    if (isOpen) {
      setNotifications(notificationService.getNotifications());
      setPermission(notificationService.getBrowserPermission());
      setSettings(notificationService.getSettings());
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Request browser permission
  const handleRequestPermission = async () => {
    const perm = await notificationService.requestBrowserPermission();
    setPermission(perm);
    if (perm === 'granted') {
      const { notification } = notificationService.triggerTestPush();
      setNotifications(notificationService.getNotifications());
      if (onPushToast) onPushToast(notification);
      setTestSentFeedback('Permissão concedida! Notificação de teste enviada.');
      setTimeout(() => setTestSentFeedback(null), 4000);
    }
  };

  // Test push notification
  const handleTestNotification = () => {
    const { notification, nativeSent } = notificationService.triggerTestPush();
    setNotifications(notificationService.getNotifications());
    if (onPushToast) onPushToast(notification);

    if (nativeSent) {
      setTestSentFeedback('Notificação push enviada para a área de trabalho do seu sistema!');
    } else {
      setTestSentFeedback('Alerta de notificação disparado internamente no app!');
    }
    setTimeout(() => setTestSentFeedback(null), 4000);
  };

  // Trigger automated scan of pending tasks/reviews
  const handleScanAlerts = () => {
    const created = notificationService.checkAndAlertPending(tasks, reviews, daysUntilExam, true);
    setNotifications(notificationService.getNotifications());
    if (created.length > 0) {
      if (onPushToast) onPushToast(created[0]);
      setTestSentFeedback(`${created.length} alerta(s) de tarefas/revisões disparado(s)!`);
    } else {
      setTestSentFeedback('Tudo em dia! Nenhuma tarefa ou revisão pendente no momento.');
    }
    setTimeout(() => setTestSentFeedback(null), 4000);
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notificationService.markAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notificationService.deleteNotification(id);
    setNotifications(updated);
  };

  const handleClearAll = () => {
    const updated = notificationService.clearAll();
    setNotifications(updated);
  };

  const handleActionClick = (notif: PushNotificationItem) => {
    notificationService.markAsRead(notif.id);
    setNotifications(notificationService.getNotifications());
    setIsOpen(false);
    if (notif.targetTab) {
      onNavigateToTab(notif.targetTab);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  // Calculate live numbers for immediate alerts
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        title="Central de Notificações Push & Lembretes"
        aria-label="Abrir notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">Notificações Push</h3>
                <span className="text-[10px] text-slate-300 block">
                  {unreadCount === 0 ? 'Tudo lido' : `${unreadCount} alerta(s) não lido(s)`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-indigo-200 hover:text-white hover:underline px-2 py-0.5 rounded cursor-pointer"
                  title="Marcar todas como lidas"
                >
                  Ler todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Push Permission Banner */}
          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                permission === 'granted' ? 'bg-emerald-500 shadow-emerald-500/50 shadow-sm' : 
                permission === 'denied' ? 'bg-rose-500' : 'bg-amber-500 animate-ping'
              }`} />
              <div className="text-[11px] text-slate-600 truncate">
                {permission === 'granted' && (
                  <span className="text-emerald-700 font-semibold">Push no Navegador: Ativo ✓</span>
                )}
                {permission === 'default' && (
                  <span className="text-amber-800 font-semibold">Push no Navegador: Inativo</span>
                )}
                {permission === 'denied' && (
                  <span className="text-rose-700 font-semibold">Push bloqueado pelo navegador</span>
                )}
              </div>
            </div>

            {permission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Ativar Push
              </button>
            ) : (
              <button
                onClick={handleTestNotification}
                className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                title="Disparar notificação de teste"
              >
                <Send className="w-2.5 h-2.5 text-indigo-600" />
                <span>Testar</span>
              </button>
            )}
          </div>

          {/* Feedback message banner if test triggered */}
          {testSentFeedback && (
            <div className="px-3 py-1.5 bg-indigo-50 border-b border-indigo-100 text-[11px] text-indigo-900 font-medium flex items-center justify-between animate-in fade-in">
              <span>{testSentFeedback}</span>
              <button onClick={() => setTestSentFeedback(null)} className="text-indigo-500 hover:text-indigo-800">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Quick Real-Time Status Counters */}
          <div className="px-3 py-2 bg-white border-b border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateToTab('hoje');
              }}
              className="p-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100/80 text-left transition-colors cursor-pointer flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {pendingTasksCount}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Metas de Hoje</span>
                <span className="text-[11px] font-semibold text-slate-800 truncate block">
                  {pendingTasksCount === 0 ? 'Concluídas ✓' : `${pendingTasksCount} pendentes`}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateToTab('materiais');
              }}
              className="p-2 rounded-xl bg-amber-50/70 hover:bg-amber-50 border border-amber-100/80 text-left transition-colors cursor-pointer flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {pendingReviewsCount}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-wider">Revisões</span>
                <span className="text-[11px] font-semibold text-slate-800 truncate block">
                  {pendingReviewsCount === 0 ? 'Em dia ✓' : `${pendingReviewsCount} agendadas`}
                </span>
              </div>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('task')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filter === 'task' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tarefas
              </button>
              <button
                onClick={() => setFilter('review')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filter === 'review' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Revisões
              </button>
            </div>

            <button
              onClick={handleScanAlerts}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
              title="Verificar tarefas e revisões agora"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Verificar</span>
            </button>
          </div>

          {/* Notifications Scroll Area */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">Nenhuma notificação por aqui</p>
                <p className="text-[11px]">Você será avisado sobre suas tarefas e revisões diárias.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleActionClick(notif)}
                  className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-2.5 ${
                    !notif.isRead ? 'bg-indigo-50/40' : 'bg-white'
                  }`}
                >
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    notif.type === 'task' ? 'bg-indigo-100 text-indigo-700' :
                    notif.type === 'review' ? 'bg-amber-100 text-amber-700' :
                    notif.type === 'exam' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {notif.type === 'task' && <Clock className="w-4 h-4" />}
                    {notif.type === 'review' && <RotateCcw className="w-4 h-4" />}
                    {notif.type === 'exam' && <Calendar className="w-4 h-4" />}
                    {notif.type === 'system' && <Sparkles className="w-4 h-4" />}
                  </div>

                  {/* Body text */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {notif.body}
                    </p>

                    {/* Action link */}
                    {notif.actionLabel && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800">
                          <span>{notif.actionLabel}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>

                        <div className="flex items-center gap-1">
                          {!notif.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="text-[10px] text-slate-400 hover:text-indigo-600 p-0.5 rounded cursor-pointer"
                              title="Marcar como lida"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(notif.id, e)}
                            className="text-[10px] text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                            title="Remover alerta"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Configurar Alertas</span>
            </button>

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Limpar histórico
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
