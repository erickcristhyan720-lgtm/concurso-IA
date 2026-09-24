import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { UserPreferences, Task, Question, ReviewItem, Essay, Flashcard, PersonalMaterial, MindMap, MemberUser, AccessLicenseConfig, PushNotificationItem } from './types';
import { Header } from './components/Header';
import { Navigation, MainTab } from './components/Navigation';
import { FifteenMinuteModal } from './components/FifteenMinuteModal';
import { ReorganizeModal } from './components/ReorganizeModal';
import { OnboardingModal } from './components/OnboardingModal';
import { DiagnosticModal } from './components/DiagnosticModal';
import { PushNotificationToast } from './components/PushNotificationToast';
import { PomodoroTimer } from './components/PomodoroTimer';
import { notificationService } from './services/notificationService';

// Views
import { TodayView } from './views/TodayView';
import { StudyView } from './views/StudyView';
import { EssayView } from './views/EssayView';
import { TutorView } from './views/TutorView';
import { SimuladosView } from './views/SimuladosView';
import { ScheduleView } from './views/ScheduleView';
import { ReviewMaterialsView } from './views/ReviewMaterialsView';
import { PerformanceView } from './views/PerformanceView';
import { VestibularesView } from './views/VestibularesView';
import { LandingPageView } from './views/LandingPageView';
import { SettingsView } from './views/SettingsView';
import { MindMapsView } from './views/MindMapsView';
import { AccessManagementView } from './views/AccessManagementView';
import { DataSourcesView } from './views/DataSourcesView';

export default function App() {
  // State from storage
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(() => storage.getUserPrefs());
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [questions, setQuestions] = useState<Question[]>(() => storage.getQuestions());
  const [reviews, setReviews] = useState<ReviewItem[]>(() => storage.getReviews());
  const [essay, setEssay] = useState<Essay>(() => storage.getEssay());
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => storage.getFlashcards());
  const [materials, setMaterials] = useState<PersonalMaterial[]>(() => storage.getMaterials());
  const [mindMaps, setMindMaps] = useState<MindMap[]>(() => storage.getMindMaps());
  const [attempts, setAttempts] = useState<Record<string, any>>(() => storage.getAttempts());
  const [members, setMembers] = useState<MemberUser[]>(() => storage.getMembers());
  const [licenseConfig, setLicenseConfig] = useState<AccessLicenseConfig>(() => storage.getLicenseConfig());

  // Active view tab & modals
  const [currentTab, setCurrentTab] = useState<MainTab>('hoje');
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const [isCommercialOpen, setIsCommercialOpen] = useState(false);

  // Modals
  const [is15MinOpen, setIs15MinOpen] = useState(false);
  const [isReorganizeOpen, setIsReorganizeOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => userPrefs.isFirstRun);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Active contextual data for Professor Max
  const [activeTutorContext, setActiveTutorContext] = useState<any>(null);

  // Search selection targeting state
  const [searchSelectedQuestionId, setSearchSelectedQuestionId] = useState<string | null>(null);
  const [searchSelectedReviewId, setSearchSelectedReviewId] = useState<string | null>(null);
  const [searchSelectedFlashcardId, setSearchSelectedFlashcardId] = useState<string | null>(null);
  const [searchSelectedMindMapId, setSearchSelectedMindMapId] = useState<string | null>(null);
  const [searchSelectedSubTab, setSearchSelectedSubTab] = useState<'erros' | 'flashcards' | 'mapas' | 'materiais' | undefined>(undefined);

  // Reorganization notification
  const [reorganizeNotice, setReorganizeNotice] = useState<string | null>(null);

  // Active floating push notification toast
  const [activePushToast, setActivePushToast] = useState<PushNotificationItem | null>(null);

  // Active task for Pomodoro timer
  const [pomodoroActiveTaskId, setPomodoroActiveTaskId] = useState<string | null>(null);

  // Automated smart push check on app mount
  useEffect(() => {
    if (!isOnboardingOpen) {
      const generated = notificationService.checkAndAlertPending(tasks, reviews, daysUntilExam, false);
      if (generated.length > 0) {
        setActivePushToast(generated[0]);
      }
    }
  }, [isOnboardingOpen]);

  // Countdown to exam
  const daysUntilExam = React.useMemo(() => {
    if (!userPrefs.examDate) return 0;
    const target = new Date(userPrefs.examDate).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    const diff = target - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [userPrefs.examDate]);

  // Handlers for Tasks
  const handleToggleTask = (taskId: string) => {
    const updated = storage.toggleTask(taskId);
    setTasks(updated);
  };

  const handleStartActivity = (task: Task) => {
    setPomodoroActiveTaskId(task.id);
    if (task.type === 'essay') {
      setCurrentTab('redacao');
    } else if (task.type === 'review') {
      setCurrentTab('materiais');
    } else {
      setCurrentTab('estudar');
    }
  };

  const handleConfirmReorganize = (newDailyMinutes: number, prioritizedSubjects: string[]) => {
    const updatedPrefs = { ...userPrefs, dailyMinutes: newDailyMinutes, difficultSubjects: prioritizedSubjects };
    setUserPrefs(updatedPrefs);
    storage.saveUserPrefs(updatedPrefs);

    const result = storage.reorganizeTasksAfterMissedDay(newDailyMinutes);
    setTasks(result.reorganized);

    if (result.overflowNotice) {
      setReorganizeNotice(result.overflowNotice);
    }
  };

  // Handlers for Attempts & Question reviews
  const handleSaveAttempt = (questionId: string, selectedOption: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => {
    storage.saveAttempt(questionId, selectedOption, isCorrect);
    setAttempts(storage.getAttempts());
  };

  const handleAddToReview = (question: Question, selectedOption: 'A' | 'B' | 'C' | 'D' | 'E', errorCause?: string) => {
    storage.addQuestionToReview(question, selectedOption, errorCause);
    setReviews(storage.getReviews());
  };

  const handleRecordReviewResult = (reviewId: string, result: 'errei' | 'dificuldade' | 'facilidade') => {
    const updated = storage.recordReviewResult(reviewId, result);
    setReviews(updated);
  };

  // Handlers for Essay
  const handleSaveEssay = (newEssay: Essay) => {
    setEssay(newEssay);
    storage.saveEssay(newEssay);
  };

  // Handlers for Flashcards & Materials
  const handleSaveFlashcards = (newCards: Flashcard[]) => {
    setFlashcards(newCards);
    storage.saveFlashcards(newCards);
  };

  const handleSaveMaterials = (newMats: PersonalMaterial[]) => {
    setMaterials(newMats);
    storage.saveMaterials(newMats);
  };

  const handleSaveMindMaps = (newMaps: MindMap[]) => {
    setMindMaps(newMaps);
    storage.saveMindMaps(newMaps);
  };

  // Switch to Professor Max with prefilled context
  const handleAskTutorWithContext = (context: any) => {
    setActiveTutorContext(context);
    setCurrentTab('max');
  };

  // Diagnostic completion
  const handleCompleteDiagnostic = (score: number, wrongQuestions: Question[]) => {
    wrongQuestions.forEach(q => {
      storage.addQuestionToReview(
        q,
        'A',
        `Ponto fraco detectado no diagnóstico preliminar: ${q.subject} (${q.topic})`
      );
    });
    setReviews(storage.getReviews());
  };

  // Toggle Mode (Demo vs Production)
  const handleToggleSystemMode = () => {
    const nextMode: 'demo' | 'prod' = userPrefs.systemMode === 'demo' ? 'prod' : 'demo';
    const updated: UserPreferences = { ...userPrefs, systemMode: nextMode };
    setUserPrefs(updated);
    storage.saveUserPrefs(updated);
  };

  // Reset to initial demo state
  const handleResetDemoData = () => {
    storage.resetAllDemoData();
    setUserPrefs(storage.getUserPrefs());
    setTasks(storage.getTasks());
    setQuestions(storage.getQuestions());
    setReviews(storage.getReviews());
    setEssay(storage.getEssay());
    setFlashcards(storage.getFlashcards());
    setMaterials(storage.getMaterials());
    setMindMaps(storage.getMindMaps());
    setAttempts(storage.getAttempts());
    setMembers(storage.getMembers());
    setLicenseConfig(storage.getLicenseConfig());
    setCurrentTab('hoje');
  };

  // Member & Access Management Handlers
  const handleAddMember = (memberData: Omit<MemberUser, 'id' | 'joinedAt'>) => {
    const updated = storage.addMember(memberData);
    setMembers(updated);
  };

  const handleRemoveMember = (memberId: string) => {
    const updated = storage.removeMember(memberId);
    setMembers(updated);
  };

  const handleUpdateMemberStatus = (memberId: string, status: 'active' | 'suspended' | 'pending') => {
    const updated = storage.updateMemberStatus(memberId, status);
    setMembers(updated);
  };

  const handleUpdateLicenseConfig = (config: AccessLicenseConfig) => {
    storage.saveLicenseConfig(config);
    setLicenseConfig(config);
  };

  // Search result action handlers
  const handleSelectQuestionFromSearch = (questionId: string) => {
    setIsCommercialOpen(false);
    setSearchSelectedQuestionId(questionId);
    setCurrentTab('estudar');
  };

  const handleSelectTaskFromSearch = (task: Task) => {
    setIsCommercialOpen(false);
    handleStartActivity(task);
  };

  const handleSelectReviewFromSearch = (reviewId: string) => {
    setIsCommercialOpen(false);
    setSearchSelectedSubTab('erros');
    setSearchSelectedReviewId(reviewId);
    setCurrentTab('materiais');
  };

  const handleSelectFlashcardFromSearch = (flashcardId: string) => {
    setIsCommercialOpen(false);
    setSearchSelectedSubTab('flashcards');
    setSearchSelectedFlashcardId(flashcardId);
    setCurrentTab('materiais');
  };

  const handleSelectMaterialFromSearch = (_materialId: string) => {
    setIsCommercialOpen(false);
    setSearchSelectedSubTab('materiais');
    setCurrentTab('materiais');
  };

  const handleSelectMindMapFromSearch = (mindMapId: string) => {
    setIsCommercialOpen(false);
    setSearchSelectedMindMapId(mindMapId);
    setCurrentTab('mapas');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top App Header */}
      <Header
        userPrefs={userPrefs}
        daysUntilExam={daysUntilExam}
        questions={questions}
        tasks={tasks}
        reviews={reviews}
        flashcards={flashcards}
        materials={materials}
        mindMaps={mindMaps}
        onOpen15Min={() => setIs15MinOpen(true)}
        onOpenCommercial={() => setIsCommercialOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onToggleSystemMode={handleToggleSystemMode}
        onSelectQuestion={handleSelectQuestionFromSearch}
        onSelectTask={handleSelectTaskFromSearch}
        onSelectReview={handleSelectReviewFromSearch}
        onSelectFlashcard={handleSelectFlashcardFromSearch}
        onSelectMaterial={handleSelectMaterialFromSearch}
        onSelectMindMap={handleSelectMindMapFromSearch}
        onAskTutorWithContext={handleAskTutorWithContext}
        onNavigateToTab={(tab) => {
          setIsCommercialOpen(false);
          setCurrentTab(tab);
        }}
        onOpenSettings={() => {
          setIsCommercialOpen(false);
          setCurrentTab('configuracoes');
        }}
        onPushToast={(notif) => setActivePushToast(notif)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation (Sidebar on desktop, bottom bar on mobile) */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setIsCommercialOpen(false);
            setCurrentTab(tab);
          }}
          pendingReviewsCount={reviews.filter(r => r.status === 'pending').length}
          showMobileMoreMenu={showMobileMoreMenu}
          setShowMobileMoreMenu={setShowMobileMoreMenu}
          isCommercialOpen={isCommercialOpen}
          onOpenCommercial={() => setIsCommercialOpen(true)}
          activeMembersCount={members.filter(m => m.status === 'active').length}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 max-w-5xl">
          {/* Transparent schedule overflow banner if day was missed */}
          {reorganizeNotice && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 flex items-start justify-between gap-3 animate-fadeIn">
              <div>
                <strong className="font-bold block mb-0.5">Agenda Diária Otimizada:</strong>
                <p className="leading-relaxed">{reorganizeNotice}</p>
              </div>
              <button
                onClick={() => setReorganizeNotice(null)}
                className="text-indigo-600 hover:text-indigo-800 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* VIEW SWITCHER */}
          {isCommercialOpen ? (
            <LandingPageView 
              onStartDemo={() => setIsCommercialOpen(false)} 
              onOpenAccessManagement={() => {
                setIsCommercialOpen(false);
                setCurrentTab('gestao-acesso');
              }}
            />
          ) : currentTab === 'hoje' ? (
            <TodayView
              userPrefs={userPrefs}
              tasks={tasks}
              pendingReviews={reviews.filter(r => r.status === 'pending')}
              latestEssay={essay}
              daysUntilExam={daysUntilExam}
              onToggleTask={handleToggleTask}
              onStartActivity={handleStartActivity}
              onOpen15Min={() => setIs15MinOpen(true)}
              onOpenReorganize={() => setIsReorganizeOpen(true)}
              onNavigateToTab={(tab) => {
                setIsCommercialOpen(false);
                setCurrentTab(tab);
              }}
              onTriggerPushToast={(notif) => setActivePushToast(notif)}
            />
          ) : currentTab === 'estudar' ? (
            <StudyView
              questions={questions}
              initialQuestionId={searchSelectedQuestionId}
              onSaveAttempt={handleSaveAttempt}
              onAddToReview={handleAddToReview}
              onAskTutorWithContext={handleAskTutorWithContext}
            />
          ) : currentTab === 'redacao' ? (
            <EssayView
              essay={essay}
              onSaveEssay={handleSaveEssay}
              onAskTutorWithContext={handleAskTutorWithContext}
            />
          ) : currentTab === 'max' ? (
            <TutorView
              userPrefs={userPrefs}
              activeContext={activeTutorContext}
              onClearContext={() => setActiveTutorContext(null)}
            />
          ) : currentTab === 'simulados' ? (
            <SimuladosView
              questions={questions}
              onAddToReview={handleAddToReview}
            />
          ) : currentTab === 'cronograma' ? (
            <ScheduleView
              userPrefs={userPrefs}
              tasks={tasks}
              onSaveTasks={(newTasks) => {
                setTasks(newTasks);
                storage.saveTasks(newTasks);
              }}
              onUpdateUserPrefs={(newPrefs) => {
                setUserPrefs(newPrefs);
                storage.saveUserPrefs(newPrefs);
              }}
            />
          ) : currentTab === 'mapas' ? (
            <MindMapsView
              mindMaps={mindMaps}
              onSaveMindMaps={handleSaveMindMaps}
              onAskTutorWithContext={handleAskTutorWithContext}
              initialSelectedMapId={searchSelectedMindMapId || undefined}
            />
          ) : currentTab === 'materiais' ? (
            <ReviewMaterialsView
              reviews={reviews}
              flashcards={flashcards}
              materials={materials}
              mindMaps={mindMaps}
              initialSubTab={searchSelectedSubTab}
              initialReviewId={searchSelectedReviewId || undefined}
              initialFlashcardId={searchSelectedFlashcardId || undefined}
              initialMindMapId={searchSelectedMindMapId || undefined}
              onRecordResult={handleRecordReviewResult}
              onSaveFlashcards={handleSaveFlashcards}
              onSaveMaterials={handleSaveMaterials}
              onSaveMindMaps={handleSaveMindMaps}
              onAskTutorWithContext={handleAskTutorWithContext}
            />
          ) : currentTab === 'desempenho' ? (
            <PerformanceView
              userPrefs={userPrefs}
              questions={questions}
              attempts={attempts}
              latestEssay={essay}
            />
          ) : currentTab === 'vestibulares' ? (
            <VestibularesView
              userPrefs={userPrefs}
              onSelectExam={(examId, name) => {
                const updated = { ...userPrefs, examId, examEdition: name };
                setUserPrefs(updated);
                storage.saveUserPrefs(updated);
                setCurrentTab('hoje');
              }}
              onNavigateToDataSources={() => setCurrentTab('fontes-dados')}
            />
          ) : currentTab === 'fontes-dados' ? (
            <DataSourcesView />
          ) : currentTab === 'gestao-acesso' ? (
            <AccessManagementView
              members={members}
              licenseConfig={licenseConfig}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onUpdateMemberStatus={handleUpdateMemberStatus}
              onUpdateLicenseConfig={handleUpdateLicenseConfig}
              onOpenCommercial={() => setIsCommercialOpen(true)}
            />
          ) : currentTab === 'configuracoes' ? (
            <SettingsView
              userPrefs={userPrefs}
              onSavePrefs={(prefs) => {
                setUserPrefs(prefs);
                storage.saveUserPrefs(prefs);
              }}
              onResetDemoData={handleResetDemoData}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onPushToast={(notif) => setActivePushToast(notif)}
            />
          ) : null}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Modo Expresso: 15 Minutos */}
      <FifteenMinuteModal
        isOpen={is15MinOpen}
        onClose={() => setIs15MinOpen(false)}
        pendingReviews={reviews.filter(r => r.status === 'pending')}
        sampleQuestions={questions}
        onRecordResult={handleRecordReviewResult}
        onNavigateToStudy={() => {
          setIs15MinOpen(false);
          setCurrentTab('estudar');
        }}
      />

      {/* 2. Reorganizar Tarefas por Perda de Dia */}
      <ReorganizeModal
        isOpen={isReorganizeOpen}
        onClose={() => setIsReorganizeOpen(false)}
        tasks={tasks}
        userPrefs={userPrefs}
        onConfirmReorganize={handleConfirmReorganize}
      />

      {/* 3. Onboarding & Personalização Inicial */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userPrefs={userPrefs}
        onSavePrefs={(prefs) => {
          setUserPrefs(prefs);
          storage.saveUserPrefs(prefs);
        }}
        onStartDiagnostic={() => setIsDiagnosticOpen(true)}
      />

      {/* 4. Diagnóstico Preliminar de 10 Questões */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        questions={questions}
        onCompleteDiagnostic={handleCompleteDiagnostic}
      />

      {/* 5. Floating Push Notification Toast */}
      <PushNotificationToast
        notification={activePushToast}
        onClose={() => setActivePushToast(null)}
        onNavigateToTab={(tab) => {
          setIsCommercialOpen(false);
          setCurrentTab(tab);
        }}
      />

      {/* 6. Cronômetro Pomodoro Interativo */}
      <PomodoroTimer
        tasks={tasks}
        onToggleTask={handleToggleTask}
        activeTaskId={pomodoroActiveTaskId}
        onSelectTask={(id) => setPomodoroActiveTaskId(id)}
      />
    </div>
  );
}
