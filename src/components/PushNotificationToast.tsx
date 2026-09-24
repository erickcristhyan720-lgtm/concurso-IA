import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  X, 
  ArrowRight, 
  Clock, 
  RotateCcw, 
  Calendar, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PushNotificationItem } from '../types';

interface PushNotificationToastProps {
  notification: PushNotificationItem | null;
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onClose,
  onNavigateToTab,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 7000); // Auto-dismiss after 7 seconds
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification, onClose]);

  if (!notification || !isVisible) return null;

  const handleClickAction = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      if (notification.targetTab) {
        onNavigateToTab(notification.targetTab);
      }
    }, 200);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-indigo-500/40 relative overflow-hidden space-y-3">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              notification.type === 'task' ? 'bg-indigo-600 text-white' :
              notification.type === 'review' ? 'bg-amber-500 text-white' :
              notification.type === 'exam' ? 'bg-rose-600 text-white' :
              'bg-emerald-600 text-white'
            }`}>
              {notification.type === 'task' && <Clock className="w-4 h-4" />}
              {notification.type === 'review' && <RotateCcw className="w-4 h-4" />}
              {notification.type === 'exam' && <Calendar className="w-4 h-4" />}
              {notification.type === 'system' && <Bell className="w-4 h-4" />}
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                <span>Notificação Push</span>
                <span>·</span>
                <span>{notification.timestamp || 'Agora'}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                {notification.title}
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 200);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed relative z-10">
          {notification.body}
        </p>

        {notification.actionLabel && (
          <div className="pt-1 flex items-center justify-end relative z-10">
            <button
              onClick={handleClickAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow-indigo-500/25"
            >
              <span>{notification.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
