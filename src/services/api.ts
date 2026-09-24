import { Question, EssayEvaluation } from '../types';

export interface TutorResponse {
  text: string;
  mode?: 'live' | 'fallback';
  pedagogicalGoal?: string;
}

export interface QuestionExplanationResponse {
  alternativeExplanations: Record<string, string>;
  cognitiveErrorDiagnosis: string;
  studyRecommendation: string;
  mode?: string;
}

export interface SyllabusExtractionResponse {
  institution: string;
  exam: string;
  edition: string;
  dates: {
    application: string;
    results: string;
  };
  duration: string;
  stages: string;
  weights: string;
  essayRules: string;
  extractedTopics: {
    subject: string;
    topic: string;
    originPage?: number | null;
  }[];
  notice?: string;
}

export const api = {
  async askTutor(message: string, context?: any, actionType?: string): Promise<TutorResponse> {
    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, actionType }),
      });
      if (!res.ok) throw new Error('Falha ao comunicar com o tutor');
      return await res.json();
    } catch (err) {
      console.warn('Backend API fallback triggered for askTutor:', err);
      return {
        text: 'Não foi possível conectar ao servidor em tempo real. Modo de demonstração ativo: consulte o passo a passo sugerido no Caderno de Revisões.',
        mode: 'fallback',
      };
    }
  },

  async evaluateEssay(params: {
    title?: string;
    theme: string;
    text: string;
    examType?: string;
  }): Promise<EssayEvaluation> {
    const res = await fetch('/api/gemini/evaluate-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao avaliar redação');
    }
    return await res.json();
  },

  async explainQuestion(params: {
    question: Question;
    selectedOption: string;
    userReasoning?: string;
  }): Promise<QuestionExplanationResponse> {
    try {
      const res = await fetch('/api/gemini/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Falha ao explicar questão');
      return await res.json();
    } catch (err) {
      console.warn('API fallback for explainQuestion:', err);
      return {
        alternativeExplanations: params.question.options.reduce((acc, opt) => {
          acc[opt.id] = opt.reason;
          return acc;
        }, {} as Record<string, string>),
        cognitiveErrorDiagnosis: `Você marcou a opção ${params.selectedOption}. ${params.question.options.find(o => o.id === params.selectedOption)?.reason || ''}`,
        studyRecommendation: 'Revisão ativa recomendada no Caderno de Erros em 24h.',
      };
    }
  },

  async extractSyllabus(rawText: string, fileName?: string): Promise<SyllabusExtractionResponse> {
    const res = await fetch('/api/gemini/extract-syllabus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, fileName }),
    });
    if (!res.ok) throw new Error('Falha ao processar edital');
    return await res.json();
  },

  async convertMaterial(materialText: string, outputType: 'flashcards' | 'summary', subject?: string) {
    const res = await fetch('/api/gemini/convert-material', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialText, outputType, subject }),
    });
    if (!res.ok) throw new Error('Falha ao converter material');
    return await res.json();
  },

  async generateMindMap(params: {
    topic: string;
    subject?: string;
    banca?: string;
    notesText?: string;
  }) {
    const res = await fetch('/api/gemini/generate-mindmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao gerar mapa mental com IA');
    }
    return await res.json();
  },
};

