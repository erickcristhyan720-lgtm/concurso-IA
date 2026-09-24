import { UserPreferences, Task, Question, ReviewItem, Essay, Flashcard, Simulado, PersonalMaterial, MindMap, MemberUser, AccessLicenseConfig, WeeklyStudyGoal } from '../types';
import { initialUserPreferences, sampleTasks, sampleQuestions, sampleEssay, sampleFlashcards, sampleMindMaps, initialMembers, defaultLicenseConfig } from '../data/mockData';

const KEYS = {
  USER_PREFS: 'concurso_ia_user_prefs_v1',
  TASKS: 'concurso_ia_tasks_v1',
  QUESTIONS: 'concurso_ia_questions_v1',
  REVIEWS: 'concurso_ia_reviews_v1',
  ESSAY: 'concurso_ia_essay_v1',
  FLASHCARDS: 'concurso_ia_flashcards_v1',
  SIMULADOS: 'concurso_ia_simulados_v1',
  MATERIALS: 'concurso_ia_materials_v1',
  ATTEMPTS: 'concurso_ia_attempts_v1',
  MIND_MAPS: 'concurso_ia_mind_maps_v1',
  MEMBERS: 'concurso_ia_members_v1',
  LICENSE_CONFIG: 'concurso_ia_license_config_v1',
  WEEKLY_GOAL: 'concurso_ia_weekly_goal_v1',
};

export const defaultWeeklyGoal: WeeklyStudyGoal = {
  mode: 'both',
  targetHours: 14,
  targetTasks: 10,
  extraMinutes: 0,
  targetDaysPerWeek: 6,
  customNote: 'Foco total nas disciplinas com maior peso no edital',
};

// Initial Caderno de Erros items based on sample errors
const initialReviews: ReviewItem[] = [
  {
    id: 'rev-01',
    questionId: 'q-hum-01',
    question: sampleQuestions[2],
    selectedOption: 'A',
    errorCause: 'Confundiu a concessão de direitos trabalhistas com autonomia sindical grevista irrestrita.',
    reviewStage: 1,
    addedAt: 'Ontem',
    nextReviewDate: 'Hoje',
    status: 'pending',
    history: [
      { date: 'Ontem', result: 'errei' },
    ],
  },
  {
    id: 'rev-02',
    questionId: 'q-nat-02',
    question: sampleQuestions[4],
    selectedOption: 'A',
    errorCause: 'Ignorou o mecanismo de ação sítio-específico do RNA guia (sgRNA).',
    reviewStage: 7,
    addedAt: 'Há 5 dias',
    nextReviewDate: 'Em 2 dias',
    status: 'pending',
    history: [
      { date: 'Há 5 dias', result: 'errei' },
      { date: 'Há 2 dias', result: 'dificuldade' },
    ],
  },
];

export const storage = {
  // User Preferences
  getUserPrefs(): UserPreferences {
    try {
      const data = localStorage.getItem(KEYS.USER_PREFS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading user prefs:', e);
    }
    return initialUserPreferences;
  },

  saveUserPrefs(prefs: UserPreferences): void {
    localStorage.setItem(KEYS.USER_PREFS, JSON.stringify(prefs));
  },

  // Tasks
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(KEYS.TASKS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
    return sampleTasks;
  },

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  toggleTask(taskId: string): Task[] {
    const tasks = this.getTasks().map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    this.saveTasks(tasks);
    return tasks;
  },

  reorganizeTasksAfterMissedDay(dailyMinutes: number): { reorganized: Task[]; message: string; overflowNotice?: string } {
    const tasks = this.getTasks();
    const incomplete = tasks.filter(t => !t.completed);
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    incomplete.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    let accumulatedMinutes = 0;
    const todayTasks: Task[] = [];
    const deferredTasks: Task[] = [];

    incomplete.forEach(task => {
      if (accumulatedMinutes + task.estimatedMinutes <= dailyMinutes) {
        accumulatedMinutes += task.estimatedMinutes;
        todayTasks.push({ ...task, dueDate: 'Hoje' });
      } else {
        deferredTasks.push({ ...task, dueDate: 'Próximos dias' });
      }
    });

    const completed = tasks.filter(t => t.completed);
    const updatedTasks = [...completed, ...todayTasks, ...deferredTasks];
    this.saveTasks(updatedTasks);

    let overflowNotice: string | undefined;
    if (deferredTasks.length > 0) {
      const totalMissedTime = incomplete.reduce((acc, t) => acc + t.estimatedMinutes, 0);
      overflowNotice = `Você tinha ${totalMissedTime} minutos de tarefas pendentes. Para não estourar seu limite diário saudável de ${dailyMinutes} min, priorizamos as ${todayTasks.length} tarefas essenciais para hoje e distribuímos ${deferredTasks.length} tarefas para os dias seguintes.`;
    }

    return {
      reorganized: updatedTasks,
      message: `Agenda reorganizada com sucesso para a meta de ${dailyMinutes} min/dia.`,
      overflowNotice,
    };
  },

  // Questions
  getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(KEYS.QUESTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading questions:', e);
    }
    return sampleQuestions;
  },

  // Attempts & Stats
  getAttempts(): Record<string, { selected: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean; timestamp: string }> {
    try {
      const data = localStorage.getItem(KEYS.ATTEMPTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading attempts:', e);
    }
    // Default initial mock attempts
    return {
      'q-hum-01': { selected: 'A', isCorrect: false, timestamp: new Date(Date.now() - 86400000).toISOString() },
      'q-lin-01': { selected: 'D', isCorrect: true, timestamp: new Date(Date.now() - 43200000).toISOString() },
      'q-mat-03': { selected: 'A', isCorrect: true, timestamp: new Date(Date.now() - 21600000).toISOString() },
    };
  },

  saveAttempt(questionId: string, selected: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean): void {
    const attempts = this.getAttempts();
    attempts[questionId] = { selected, isCorrect, timestamp: new Date().toISOString() };
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
  },

  // Caderno de Erros (ReviewItems)
  getReviews(): ReviewItem[] {
    try {
      const data = localStorage.getItem(KEYS.REVIEWS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading reviews:', e);
    }
    return initialReviews;
  },

  saveReviews(reviews: ReviewItem[]): void {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  },

  addQuestionToReview(question: Question, selectedOption: 'A' | 'B' | 'C' | 'D' | 'E', errorCause?: string): ReviewItem {
    const reviews = this.getReviews();
    const existing = reviews.find(r => r.questionId === question.id);
    if (existing) {
      existing.selectedOption = selectedOption;
      if (errorCause) existing.errorCause = errorCause;
      existing.status = 'pending';
      existing.nextReviewDate = 'Hoje';
      this.saveReviews(reviews);
      return existing;
    }

    const newItem: ReviewItem = {
      id: `rev-${Date.now()}`,
      questionId: question.id,
      question,
      selectedOption,
      errorCause: errorCause || `Dificuldade registrada no tópico: ${question.topic}`,
      reviewStage: 1,
      addedAt: 'Hoje',
      nextReviewDate: 'Hoje',
      status: 'pending',
      history: [{ date: 'Hoje', result: 'errei' }],
    };

    const updated = [newItem, ...reviews];
    this.saveReviews(updated);
    return newItem;
  },

  recordReviewResult(reviewId: string, result: 'errei' | 'dificuldade' | 'facilidade'): ReviewItem[] {
    const reviews = this.getReviews();
    const updated = reviews.map(item => {
      if (item.id !== reviewId) return item;

      let nextStage: 1 | 7 | 30 = 1;
      let nextDateText = 'Hoje';

      if (result === 'errei') {
        nextStage = 1;
        nextDateText = 'Amanhã (1 dia)';
      } else if (result === 'dificuldade') {
        nextStage = item.reviewStage;
        nextDateText = item.reviewStage === 1 ? 'Em 2 dias' : 'Em 5 dias';
      } else {
        // facilidade -> progress to next spaced repetition bracket
        if (item.reviewStage === 1) {
          nextStage = 7;
          nextDateText = 'Em 7 dias';
        } else if (item.reviewStage === 7) {
          nextStage = 30;
          nextDateText = 'Em 30 dias';
        } else {
          nextStage = 30;
          nextDateText = 'Revisão Consolidada';
        }
      }

      return {
        ...item,
        reviewStage: nextStage,
        nextReviewDate: nextDateText,
        status: (result === 'facilidade' ? 'reviewed' : 'pending') as 'pending' | 'reviewed',
        history: [...item.history, { date: 'Hoje', result }],
      };
    });

    this.saveReviews(updated);
    return updated;
  },

  // Essay
  getEssay(): Essay {
    try {
      const data = localStorage.getItem(KEYS.ESSAY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading essay:', e);
    }
    return sampleEssay;
  },

  saveEssay(essay: Essay): void {
    localStorage.setItem(KEYS.ESSAY, JSON.stringify(essay));
  },

  // Flashcards
  getFlashcards(): Flashcard[] {
    try {
      const data = localStorage.getItem(KEYS.FLASHCARDS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading flashcards:', e);
    }
    return sampleFlashcards;
  },

  saveFlashcards(flashcards: Flashcard[]): void {
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(flashcards));
  },

  // Personal Materials
  getMaterials(): PersonalMaterial[] {
    try {
      const data = localStorage.getItem(KEYS.MATERIALS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading materials:', e);
    }
    return [
      {
        id: 'mat-01',
        title: 'Anotações de Aula: Termodinâmica e Ciclos Reversíveis',
        originalText: 'Anotações da aula de Física sobre Máquinas Térmicas, ciclo de Carnot, fontes fria e quente e teorema da conservação de energia.',
        createdAt: '2026-09-21',
        convertedType: 'flashcards',
      },
    ];
  },

  saveMaterials(materials: PersonalMaterial[]): void {
    localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
  },

  // Mind Maps
  getMindMaps(): MindMap[] {
    try {
      const data = localStorage.getItem(KEYS.MIND_MAPS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading mind maps:', e);
    }
    return sampleMindMaps;
  },

  saveMindMaps(mindMaps: MindMap[]): void {
    localStorage.setItem(KEYS.MIND_MAPS, JSON.stringify(mindMaps));
  },

  addMindMap(newMap: MindMap): MindMap[] {
    const existing = this.getMindMaps();
    const updated = [newMap, ...existing.filter(m => m.id !== newMap.id)];
    this.saveMindMaps(updated);
    return updated;
  },

  // Members & Access Management
  getMembers(): MemberUser[] {
    try {
      const data = localStorage.getItem(KEYS.MEMBERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading members:', e);
    }
    return initialMembers;
  },

  saveMembers(members: MemberUser[]): void {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  },

  addMember(memberData: Omit<MemberUser, 'id' | 'joinedAt'>): MemberUser[] {
    const members = this.getMembers();
    const colors = [
      'bg-indigo-600',
      'bg-emerald-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-amber-600',
      'bg-cyan-600',
      'bg-teal-600',
      'bg-blue-600',
    ];
    const newMember: MemberUser = {
      ...memberData,
      id: `user-${Date.now().toString().slice(-4)}`,
      joinedAt: new Date().toLocaleDateString('pt-BR'),
      lastActiveAt: 'Recém-adicionado',
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      questionsSolved: 0,
      accuracyRate: 0,
    };
    const updated = [newMember, ...members];
    this.saveMembers(updated);
    return updated;
  },

  removeMember(memberId: string): MemberUser[] {
    const members = this.getMembers();
    const updated = members.filter(m => m.id !== memberId);
    this.saveMembers(updated);
    return updated;
  },

  updateMemberStatus(memberId: string, status: 'active' | 'suspended' | 'pending'): MemberUser[] {
    const members = this.getMembers();
    const updated = members.map(m => m.id === memberId ? { ...m, status } : m);
    this.saveMembers(updated);
    return updated;
  },

  getLicenseConfig(): AccessLicenseConfig {
    try {
      const data = localStorage.getItem(KEYS.LICENSE_CONFIG);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading license config:', e);
    }
    return defaultLicenseConfig;
  },

  saveLicenseConfig(config: AccessLicenseConfig): void {
    localStorage.setItem(KEYS.LICENSE_CONFIG, JSON.stringify(config));
  },

  // Weekly Study Goals
  getWeeklyGoal(): WeeklyStudyGoal {
    try {
      const data = localStorage.getItem(KEYS.WEEKLY_GOAL);
      if (data) return { ...defaultWeeklyGoal, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading weekly goal:', e);
    }
    return defaultWeeklyGoal;
  },

  saveWeeklyGoal(goal: WeeklyStudyGoal): void {
    localStorage.setItem(KEYS.WEEKLY_GOAL, JSON.stringify(goal));
  },

  addExtraStudyMinutes(minutes: number): WeeklyStudyGoal {
    const current = this.getWeeklyGoal();
    const updated: WeeklyStudyGoal = {
      ...current,
      extraMinutes: Math.max(0, (current.extraMinutes || 0) + minutes),
    };
    this.saveWeeklyGoal(updated);
    return updated;
  },

  // Reset to initial demo state
  resetAllDemoData(): void {
    localStorage.removeItem(KEYS.USER_PREFS);
    localStorage.removeItem(KEYS.TASKS);
    localStorage.removeItem(KEYS.QUESTIONS);
    localStorage.removeItem(KEYS.REVIEWS);
    localStorage.removeItem(KEYS.ESSAY);
    localStorage.removeItem(KEYS.FLASHCARDS);
    localStorage.removeItem(KEYS.SIMULADOS);
    localStorage.removeItem(KEYS.MATERIALS);
    localStorage.removeItem(KEYS.ATTEMPTS);
    localStorage.removeItem(KEYS.MIND_MAPS);
    localStorage.removeItem(KEYS.MEMBERS);
    localStorage.removeItem(KEYS.LICENSE_CONFIG);
    localStorage.removeItem(KEYS.WEEKLY_GOAL);
  },
};
