import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  RotateCcw, 
  User, 
  Calendar, 
  Clock, 
  Save, 
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Bell,
  Volume2,
  VolumeX,
  Send,
  CheckCircle2,
  Check
} from 'lucide-react';
import { UserPreferences, PushNotificationSettings, PushNotificationItem } from '../types';
import { notificationService } from '../services/notificationService';

interface SettingsViewProps {
  userPrefs: UserPreferences;
  onSavePrefs: (prefs: UserPreferences) => void;
  onResetDemoData: () => void;
  onOpenOnboarding: () => void;
  onPushToast?: (notif: PushNotificationItem) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userPrefs,
  onSavePrefs,
  onResetDemoData,
  onOpenOnboarding,
  onPushToast,
}) => {
  const [name, setName] = useState(userPrefs.name);
  const [targetCourse, setTargetCourse] = useState(userPrefs.targetCourse || '');
  const [targetUniversity, setTargetUniversity] = useState(userPrefs.targetUniversity || '');
  const [examDate, setExamDate] = useState(userPrefs.examDate || '2026-11-08');
  const [dailyMinutes, setDailyMinutes] = useState(userPrefs.dailyMinutes);
  const [systemMode, setSystemMode] = useState<UserPreferences['systemMode']>(userPrefs.systemMode || 'demo');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Push Notifications State
  const [pushSettings, setPushSettings] = useState<PushNotificationSettings>(() => notificationService.getSettings());
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => notificationService.getBrowserPermission());
  const [testPushFeedback, setTestPushFeedback] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestBrowserPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      const { notification } = notificationService.triggerTestPush();
      if (onPushToast) onPushToast(notification);
      setTestPushFeedback('Permissão concedida! Notificação de teste disparada.');
      setTimeout(() => setTestPushFeedback(null), 4000);
    }
  };

  const handleTestPush = () => {
    const { notification, nativeSent } = notificationService.triggerTestPush();
    if (onPushToast) onPushToast(notification);
    if (nativeSent) {
      setTestPushFeedback('Notificação enviada com sucesso para o seu sistema!');
    } else {
      setTestPushFeedback('Alerta de notificação acionado no aplicativo!');
    }
    setTimeout(() => setTestPushFeedback(null), 4000);
  };

  const updatePushSetting = <K extends keyof PushNotificationSettings>(
    key: K, 
    value: PushNotificationSettings[K]
  ) => {
    const updated = { ...pushSettings, [key]: value };
    setPushSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleSave = () => {
    onSavePrefs({
      ...userPrefs,
      name,
      targetCourse: targetCourse || undefined,
      targetUniversity: targetUniversity || undefined,
      examDate,
      dailyMinutes,
      systemMode,
    });
    notificationService.saveSettings(pushSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <span>Personalização & Dados</span>
          <span aria-hidden="true">·</span>
          <span>Preferências</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Configurações da Conta
        </h1>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-xs">
        {/* Profile Details */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Dados do Estudante
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome ou Apelido:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Universidade Alvo:
              </label>
              <input
                type="text"
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                placeholder="Ex: USP, UFRJ, UNICAMP"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Curso Desejado:
              </label>
              <input
                type="text"
                value={targetCourse}
                onChange={(e) => setTargetCourse(e.target.value)}
                placeholder="Ex: Medicina, Direito, Computação"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Study Goals */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Metas de Rotina
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data Confirmada da Prova:
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Tempo diário disponível:</label>
              <span className="font-bold text-indigo-600 font-mono">{dailyMinutes} min/dia</span>
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
          </div>
        </div>

        {/* Push Notifications & Reminders Configuration */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Notificações Push & Lembretes
                </h2>
                <span className="text-[11px] text-slate-500 block">
                  Alertas no navegador sobre metas diárias e revisões no Caderno de Erros.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushSettings.enabled}
                  onChange={(e) => updatePushSetting('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Browser Permission Status Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                browserPermission === 'granted' ? 'bg-emerald-500' :
                browserPermission === 'denied' ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Permissão no Navegador:{' '}
                  {browserPermission === 'granted' ? 'Concedida (Ativa)' :
                   browserPermission === 'denied' ? 'Bloqueada nas configurações do site' :
                   'Pendente de autorização'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {browserPermission === 'granted'
                    ? 'Seu navegador está habilitado para exibir notificações push nativas.'
                    : 'Autorize para receber alertas na sua área de trabalho mesmo sem olhar para a aba.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {browserPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-colors cursor-pointer"
                >
                  Solicitar Permissão
                </button>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Habilitado</span>
                </span>
              )}

              <button
                type="button"
                onClick={handleTestPush}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3 h-3 text-indigo-600" />
                <span>Testar Push</span>
              </button>
            </div>
          </div>

          {testPushFeedback && (
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-medium flex items-center justify-between">
              <span>{testPushFeedback}</span>
              <button type="button" onClick={() => setTestPushFeedback(null)} className="text-indigo-400 hover:text-indigo-700">
                ✕
              </button>
            </div>
          )}

          {/* Detailed Alert Options */}
          <div className="space-y-2.5 bg-white border border-slate-200/80 rounded-2xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pushSettings.alertTasks}
                onChange={(e) => updatePushSetting('alertTasks', e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Alertas de Tarefas Pendentes do Dia
                </span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">
                  Envia um lembrete direto com as metas agendadas para hoje para manter a consistência de estudos.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                checked={pushSettings.alertReviews}
                onChange={(e) => updatePushSetting('alertReviews', e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Lembretes de Revisão Espaçada Agendada (Caderno de Erros)
                </span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">
                  Avisa quando o ciclo de 24h, 7 dias ou 30 dias tiver questões para fixação na memória de longo prazo.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                checked={pushSettings.alertExamCountdown}
                onChange={(e) => updatePushSetting('alertExamCountdown', e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Marcos da Contagem Regressiva do Concurso
                </span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">
                  Notifica em marcos decisivos (ex: faltam 30, 15 ou 7 dias) para focar na reta final de simulados.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                checked={pushSettings.soundEnabled}
                onChange={(e) => updatePushSetting('soundEnabled', e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sinal Sonoro Suave (Chime Harmônico)</span>
                </span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">
                  Toca um tom acústico sutil quando a notificação de estudo for disparada.
                </span>
              </div>
            </label>

            {/* Scheduled Time */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Horário preferencial dos lembretes matinais:</span>
              <select
                value={pushSettings.scheduledTime}
                onChange={(e) => updatePushSetting('scheduledTime', e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white"
              >
                <option value="07:00">07:00 (Início da manhã)</option>
                <option value="08:30">08:30 (Rotina matinal)</option>
                <option value="12:30">12:30 (Horário de almoço)</option>
                <option value="18:30">18:30 (Pós-expediente)</option>
                <option value="20:00">20:00 (Turno da noite)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mode Switch: Demo vs Production */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Ambiente da Aplicação
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSystemMode('demo')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                systemMode === 'demo'
                  ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="font-bold text-xs text-slate-900 block">Modo Demonstração</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Dados locais completos e persistentes para teste imediato.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSystemMode('prod')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                systemMode === 'prod'
                  ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="font-bold text-xs text-slate-900 block">Modo Produção</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Comunicação com backend Express e IA Gemini 2.5.
              </span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={onOpenOnboarding}
            className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
          >
            Refazer Diagnóstico e Onboarding
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Salvo com Sucesso ✓' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-5 bg-rose-50/70 border border-rose-200/80 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Zona de Redefinição</span>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed">
          Deseja restaurar todos os dados para o estado demonstrativo original? Isso limpará seus rascunhos de redação e tentativas salvas no navegador.
        </p>
        <button
          onClick={onResetDemoData}
          className="mt-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Restaurar Dados Padrão de Demonstração
        </button>
      </div>
    </div>
  );
};
