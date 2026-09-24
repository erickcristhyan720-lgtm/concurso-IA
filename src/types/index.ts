export type AreaType = 
  | 'Direito Administrativo' 
  | 'Direito Constitucional' 
  | 'Língua Portuguesa' 
  | 'Raciocínio Lógico' 
  | 'Direito Penal & Processo' 
  | 'Informática & TI' 
  | 'AFO & Gestão Pública' 
  | 'Legislação & Ética'
  | string;

export interface UserPreferences {
  name: string;
  examId: 'cnu' | 'inss' | 'receita_federal' | 'policia_federal' | 'tribunais' | 'caixa_bb' | 'controle_tcu' | string;
  examEdition: string;
  targetCourse?: string; // Mantido para compatibilidade
  targetUniversity?: string; // Mantido para compatibilidade
  targetCareer?: string; // Ex: Especialista EPPGG, Agente PF, Técnico Judiciário
  targetOrgan?: string; // Ex: CNU Bloco 7, INSS, TRF-1, Receita Federal
  bancaPreference?: 'Cebraspe' | 'FGV' | 'FCC' | 'Cesgranrio' | 'Vunesp' | 'Mista';
  examDate: string; // YYYY-MM-DD
  availableDays: string[];
  dailyMinutes: number;
  difficultSubjects: string[];
  hasUploadedSyllabus: boolean;
  diagnosticCompleted: boolean;
  diagnosticScore?: number;
  isFirstRun: boolean;
  systemMode: 'demo' | 'prod';
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  type: 'theory' | 'practice' | 'review' | 'essay';
  estimatedMinutes: number;
  completed: boolean;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  relatedTopic: string;
}

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  isCorrect: boolean;
  reason: string;
}

export interface Question {
  id: string;
  area: AreaType;
  subject: string;
  topic: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  isOfficial: boolean;
  institution?: string;
  banca?: 'Cebraspe' | 'FGV' | 'FCC' | 'Cesgranrio' | 'Vunesp' | 'Quadrix' | string;
  organ?: string;
  format?: 'multipla_escolha' | 'certo_errado';
  year?: number;
  source?: string;
  contextText: string;
  statement: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  skillEvaluated: string;
  hint: string;
  legalBasis?: string;
}

export interface ReviewItem {
  id: string;
  questionId: string;
  question: Question;
  selectedOption: 'A' | 'B' | 'C' | 'D' | 'E';
  errorCause?: string;
  reviewStage: 1 | 7 | 30; // Spaced repetition interval in days
  addedAt: string;
  nextReviewDate: string;
  status: 'pending' | 'reviewed';
  history: {
    date: string;
    result: 'errei' | 'dificuldade' | 'facilidade';
  }[];
}

export interface MindMapNode {
  id: string;
  title: string;
  subtitle?: string;
  mnemonic?: string;
  legalBasis?: string; // Ex: "Art. 5º, XI, CF/88" ou "Lei 14.133 art. 28"
  details?: string[];
  children?: MindMapNode[];
  color?: string;
  icon?: string;
  keyConcepts?: string[];
}

export interface MindMap {
  id: string;
  subject: string;
  topic: string;
  bancaTarget?: string; // Ex: 'Cebraspe / FGV'
  description: string;
  rootNode: MindMapNode;
  createdAt?: string;
  tags?: string[];
  isUserGenerated?: boolean;
}

export interface MotivatingText {
  id: number;
  title: string;
  content: string;
  source: string;
}

export interface CompetencyFeedback {
  id: number;
  name: string;
  score: number;
  justification: string;
  excerpts: string[];
  suggestions: string;
  exercise: string;
}

export interface EssayEvaluation {
  totalScore: number;
  disclaimer: string;
  competencies: CompetencyFeedback[];
  topPriorities: string[];
  evaluatedAt: string;
  statistics?: {
    wordCount: number;
    paragraphCount: number;
    characterCount: number;
  };
}

export interface Essay {
  id: string;
  theme: string;
  motivatingTexts: MotivatingText[];
  currentText: string;
  examType: 'ENEM' | 'FUVEST' | 'UNICAMP' | 'UERJ' | 'UNESP';
  versions: {
    id: string;
    versionNumber: number;
    savedAt: string;
    text: string;
    score?: number;
  }[];
  evaluation?: EssayEvaluation;
  lastUpdated: string;
}

export interface Flashcard {
  id: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  intervalDays: number;
  nextReview: string;
  repetitionCount: number;
  easinessFactor: number;
}

export interface Simulado {
  id: string;
  title: string;
  mode: 'treino_rapido' | 'materia' | 'personalizado' | 'completo';
  durationMinutes: number;
  questions: Question[];
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  flaggedQuestions: string[];
  startTime?: number;
  targetEndTime?: number;
  isFinished: boolean;
  completedAt?: string;
  result?: {
    totalQuestions: number;
    correct: number;
    wrong: number;
    blank: number;
    timeSpentSeconds: number;
    bySubject: Record<string, { total: number; correct: number }>;
  };
}

export interface PersonalMaterial {
  id: string;
  title: string;
  originalText: string;
  createdAt: string;
  convertedType?: 'summary' | 'flashcards' | 'questions';
  outputData?: any;
}

export interface VestibularProfile {
  id: string;
  name: string;
  institution: string;
  currentEdition: string;
  stage: string;
  duration: string;
  questionsFormat: string;
  status: 'validado' | 'configuracao_pendente';
  essayRubric: string;
  requiredReadings?: string[];
  updatedAt: string;
  officialSource: string;
}

export interface ConcursoProfile {
  id: string;
  name: string;
  organ: string;
  banca: 'Cebraspe' | 'FGV' | 'FCC' | 'Cesgranrio' | 'Vunesp' | string;
  career: string;
  salary: string;
  currentEdition: string;
  stage: string;
  duration: string;
  questionsFormat: string;
  status: 'edital_publicado' | 'banca_definida' | 'comissao_formada' | 'previsto';
  discursiveRubric: string;
  syllabusSubjects: string[];
  vacancies: string;
  updatedAt: string;
  officialSource: string;
  category: 'Administrativo' | 'Fiscal' | 'Policial' | 'Tribunais' | 'Bancário' | 'Controle';
}

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'aluno';
  status: 'active' | 'pending' | 'suspended';
  targetExam?: string;
  targetCareer?: string;
  joinedAt: string;
  lastActiveAt?: string;
  questionsSolved?: number;
  accuracyRate?: number;
  avatarColor?: string;
}

export interface AccessLicenseConfig {
  totalLicenses: number;
  organizationName: string;
  planName: string;
}

export interface PushNotificationSettings {
  enabled: boolean;
  alertTasks: boolean;
  alertReviews: boolean;
  alertExamCountdown: boolean;
  soundEnabled: boolean;
  scheduledTime: string;
  lastNotifiedDate?: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'task' | 'review' | 'exam' | 'system';
  timestamp: string;
  isRead: boolean;
  targetTab?: 'hoje' | 'materiais' | 'estudar' | 'redacao' | 'desempenho' | 'cronograma';
  actionLabel?: string;
  metadata?: {
    pendingTasksCount?: number;
    pendingReviewsCount?: number;
    daysUntilExam?: number;
  };
}

export interface WeeklyStudyGoal {
  mode: 'hours' | 'tasks' | 'both';
  targetHours: number;
  targetTasks: number;
  extraMinutes: number;
  targetDaysPerWeek: number;
  customNote?: string;
}

export * from './concursos';

