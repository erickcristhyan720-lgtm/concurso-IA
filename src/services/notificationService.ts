import { PushNotificationSettings, PushNotificationItem, Task, ReviewItem } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'concurso_ia_push_settings_v1',
  ITEMS: 'concurso_ia_push_notifications_v1',
  LAST_CHECK: 'concurso_ia_last_push_check_v1',
};

const DEFAULT_SETTINGS: PushNotificationSettings = {
  enabled: true,
  alertTasks: true,
  alertReviews: true,
  alertExamCountdown: true,
  soundEnabled: true,
  scheduledTime: '08:30',
};

// Subtle pleasant Web Audio chime
function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play two ascending harmonious sine tones
    const now = ctx.currentTime;
    
    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: A5 (880 Hz) - slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // AudioContext may be blocked or restricted prior to user gesture; ignore safely
  }
}

export const notificationService = {
  getSettings(): PushNotificationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading push settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: PushNotificationSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving push settings:', e);
    }
  },

  getBrowserPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  },

  async requestBrowserPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return 'default';
    }
  },

  sendNativePush(title: string, options?: NotificationOptions): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission !== 'granted') {
      return false;
    }
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch (e) {
      console.warn('Native notification spawn failed:', e);
      return false;
    }
  },

  getNotifications(): PushNotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading push notifications list:', e);
    }

    // Default seeded initial notifications so the user has immediate visual feedback
    const initialList: PushNotificationItem[] = [
      {
        id: 'notif-init-1',
        title: '📋 Tarefas Pendentes do Dia',
        body: 'Você tem 2 metas de estudo pendentes hoje. Que tal resolver as 20 questões de Direito Administrativo agora?',
        type: 'task',
        timestamp: 'Há 15 min',
        isRead: false,
        targetTab: 'hoje',
        actionLabel: 'Ver Tarefas de Hoje',
        metadata: { pendingTasksCount: 2 },
      },
      {
        id: 'notif-init-2',
        title: '🔁 Revisão Espaçada Agendada',
        body: 'Ciclo de 24h: 1 item de Direito Constitucional aguarda sua revisão no Caderno de Erros para fixar na memória!',
        type: 'review',
        timestamp: 'Há 1 hora',
        isRead: false,
        targetTab: 'materiais',
        actionLabel: 'Revisar no Caderno de Erros',
        metadata: { pendingReviewsCount: 1 },
      },
    ];
    this.saveNotifications(initialList);
    return initialList;
  },

  saveNotifications(items: PushNotificationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items.slice(0, 50))); // Keep last 50
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  },

  addNotification(item: Omit<PushNotificationItem, 'id' | 'timestamp' | 'isRead'>): PushNotificationItem {
    const settings = this.getSettings();
    const newItem: PushNotificationItem = {
      ...item,
      id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: 'Agora há pouco',
      isRead: false,
    };

    const current = this.getNotifications();
    const updated = [newItem, ...current];
    this.saveNotifications(updated);

    // Audio cue if enabled
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Native browser push notification
    if (settings.enabled && this.getBrowserPermission() === 'granted') {
      this.sendNativePush(newItem.title, {
        body: newItem.body,
        tag: newItem.type,
      });
    }

    return newItem;
  },

  markAsRead(id: string): PushNotificationItem[] {
    const current = this.getNotifications();
    const updated = current.map(item => item.id === id ? { ...item, isRead: true } : item);
    this.saveNotifications(updated);
    return updated;
  },

  markAllAsRead(): PushNotificationItem[] {
    const current = this.getNotifications();
    const updated = current.map(item => ({ ...item, isRead: true }));
    this.saveNotifications(updated);
    return updated;
  },

  deleteNotification(id: string): PushNotificationItem[] {
    const current = this.getNotifications();
    const updated = current.filter(item => item.id !== id);
    this.saveNotifications(updated);
    return updated;
  },

  clearAll(): PushNotificationItem[] {
    this.saveNotifications([]);
    return [];
  },

  triggerTestPush(): { notification: PushNotificationItem; nativeSent: boolean } {
    const settings = this.getSettings();
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    const testItem: PushNotificationItem = {
      id: `push-test-${Date.now()}`,
      title: '🎯 Concurso Max: Teste de Notificação Push',
      body: 'Sistema de alertas ativo com sucesso! Você receberá lembretes diários de tarefas e revisões agendadas.',
      type: 'system',
      timestamp: 'Agora mesmo',
      isRead: false,
      targetTab: 'hoje',
      actionLabel: 'Ver Painel de Estudos',
    };

    const current = this.getNotifications();
    this.saveNotifications([testItem, ...current]);

    const nativeSent = this.sendNativePush(testItem.title, {
      body: testItem.body,
      tag: 'test-push',
    });

    return { notification: testItem, nativeSent };
  },

  checkAndAlertPending(
    tasks: Task[], 
    reviews: ReviewItem[], 
    daysUntilExam: number,
    force = false
  ): PushNotificationItem[] {
    const settings = this.getSettings();
    if (!settings.enabled && !force) return [];

    const todayStr = new Date().toISOString().slice(0, 10);
    const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_CHECK);

    // Limit automatic multi-fire on same day unless forced
    if (lastCheck === todayStr && !force) {
      return [];
    }

    const created: PushNotificationItem[] = [];

    // 1. Alert pending tasks
    if (settings.alertTasks) {
      const pendingTasks = tasks.filter(t => !t.completed);
      if (pendingTasks.length > 0) {
        const topTask = pendingTasks[0];
        const notif = this.addNotification({
          title: `⏰ ${pendingTasks.length} ${pendingTasks.length === 1 ? 'Tarefa Pendente' : 'Tarefas Pendentes'} Hoje`,
          body: `Você ainda tem metas agendadas para hoje. Prioridade: "${topTask.title}" (${topTask.subject}). Não deixe acumular!`,
          type: 'task',
          targetTab: 'hoje',
          actionLabel: 'Ver Tarefas de Hoje',
          metadata: { pendingTasksCount: pendingTasks.length },
        });
        created.push(notif);
      }
    }

    // 2. Alert scheduled reviews in Caderno de Erros
    if (settings.alertReviews) {
      const dueReviews = reviews.filter(r => r.status === 'pending');
      if (dueReviews.length > 0) {
        const notif = this.addNotification({
          title: `🔁 ${dueReviews.length} ${dueReviews.length === 1 ? 'Revisão Agendada' : 'Revisões Agendadas'}`,
          body: `Seu ciclo de repetição espaçada tem ${dueReviews.length} ${dueReviews.length === 1 ? 'questão aguardando' : 'questões aguardando'} revisão no Caderno de Erros.`,
          type: 'review',
          targetTab: 'materiais',
          actionLabel: 'Revisar no Caderno de Erros',
          metadata: { pendingReviewsCount: dueReviews.length },
        });
        created.push(notif);
      }
    }

    // 3. Alert Exam Countdown milestone
    if (settings.alertExamCountdown && daysUntilExam > 0 && (daysUntilExam === 30 || daysUntilExam === 15 || daysUntilExam === 7 || daysUntilExam <= 3)) {
      const notif = this.addNotification({
        title: `⏳ Contagem Regressiva: Faltam ${daysUntilExam} dias!`,
        body: `A reta final para sua prova chegou. Mantenha o foco nos simulados e na revisão dos pontos fracos.`,
        type: 'exam',
        targetTab: 'cronograma',
        actionLabel: 'Ver Cronograma Reta Final',
        metadata: { daysUntilExam },
      });
      created.push(notif);
    }

    localStorage.setItem(STORAGE_KEYS.LAST_CHECK, todayStr);
    return created;
  }
};
