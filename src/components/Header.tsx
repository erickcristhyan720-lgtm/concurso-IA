import React from 'react';
import { Sparkles, Clock, Compass, ShieldCheck, HelpCircle } from 'lucide-react';
import { UserPreferences, Question, Task, ReviewItem, Flashcard, PersonalMaterial, MindMap, PushNotificationItem } from '../types';
import { QuickSearchBar } from './QuickSearchBar';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  userPrefs: UserPreferences;
  daysUntilExam: number;
  questions: Question[];
  tasks: Task[];
  reviews: ReviewItem[];
  flashcards: Flashcard[];
  materials: PersonalMaterial[];
  mindMaps?: MindMap[];
  onOpen15Min: () => void;
  onOpenCommercial: () => void;
  onOpenOnboarding: () => void;
  onToggleSystemMode: () => void;
  onSelectQuestion: (questionId: string) => void;
  onSelectTask: (task: Task) => void;
  onSelectReview: (reviewId: string) => void;
  onSelectFlashcard: (flashcardId: string) => void;
  onSelectMaterial: (materialId: string) => void;
  onSelectMindMap?: (mindMapId: string) => void;
  onAskTutorWithContext: (context: any) => void;
  onNavigateToTab?: (tab: any) => void;
  onOpenSettings?: () => void;
  onPushToast?: (notif: PushNotificationItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userPrefs,
  daysUntilExam,
  questions,
  tasks,
  reviews,
  flashcards,
  materials,
  mindMaps = [],
  onOpen15Min,
  onOpenCommercial,
  onOpenOnboarding,
  onToggleSystemMode,
  onSelectQuestion,
  onSelectTask,
  onSelectReview,
  onSelectFlashcard,
  onSelectMaterial,
  onSelectMindMap,
  onAskTutorWithContext,
  onNavigateToTab = () => {},
  onOpenSettings = () => {},
  onPushToast,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand & Target Exam */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  concurso <span className="text-indigo-600">IA</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md hidden md:inline-block">
                  {userPrefs.examEdition}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile-only countdown */}
          {daysUntilExam > 0 && (
            <div className="sm:hidden flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>{daysUntilExam}d</span>
            </div>
          )}
        </div>

        {/* Central Fast Search Bar */}
        <div className="flex-1 w-full max-w-lg min-w-0">
          <QuickSearchBar
            questions={questions}
            tasks={tasks}
            reviews={reviews}
            flashcards={flashcards}
            materials={materials}
            mindMaps={mindMaps}
            onSelectQuestion={onSelectQuestion}
            onSelectTask={onSelectTask}
            onSelectReview={onSelectReview}
            onSelectFlashcard={onSelectFlashcard}
            onSelectMaterial={onSelectMaterial}
            onSelectMindMap={onSelectMindMap}
            onAskTutorWithContext={onAskTutorWithContext}
          />
        </div>

        {/* Action controls */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          {/* Push Notification Bell & Center */}
          <NotificationCenter
            tasks={tasks}
            reviews={reviews}
            daysUntilExam={daysUntilExam}
            onNavigateToTab={onNavigateToTab}
            onOpenSettings={onOpenSettings}
            onPushToast={onPushToast}
          />

          {/* Days until exam on desktop */}
          {daysUntilExam > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 pr-2 border-r border-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span><strong>{daysUntilExam} dias</strong> p/ prova</span>
            </div>
          )}

          {/* 15-minute quick express mode */}
          <button
            onClick={onOpen15Min}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors cursor-pointer"
            title="Atalho pedagógico para treinar e revisar em 15 minutos"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Tenho só 15 min</span>
            <span className="sm:hidden">15 min</span>
          </button>

          {/* Mode Switch (Demo vs Prod) */}
          <button
            onClick={onToggleSystemMode}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            title="Alternar entre modo de Demonstração e Produção"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">{userPrefs.systemMode === 'demo' ? 'Modo Demo' : 'Produção'}</span>
          </button>

          {/* Commercial Landing shortcut */}
          <button
            onClick={onOpenCommercial}
            className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Ver licenças por usuário e apresentação"
          >
            Licenças
          </button>
        </div>
      </div>
    </header>
  );
};
