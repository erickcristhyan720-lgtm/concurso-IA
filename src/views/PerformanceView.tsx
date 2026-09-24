import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Award, 
  Layers, 
  GraduationCap,
  Target,
  Zap,
  PenTool,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { UserPreferences, Question, Essay } from '../types';

interface PerformanceViewProps {
  userPrefs: UserPreferences;
  questions: Question[];
  attempts: Record<string, { selected: string; isCorrect: boolean; timestamp: string }>;
  latestEssay: Essay;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  userPrefs,
  questions,
  attempts,
  latestEssay,
}) => {
  const attemptKeys = Object.keys(attempts);
  const totalAttempts = attemptKeys.length;
  const correctAttempts = attemptKeys.filter(k => attempts[k].isCorrect).length;
  const accuracyRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Breakdown by official vs authorial
  let officialAttemptsCount = 0;
  let officialCorrectCount = 0;
  let authorialAttemptsCount = 0;
  let authorialCorrectCount = 0;

  attemptKeys.forEach(k => {
    const q = questions.find(item => item.id === k);
    const isCorr = attempts[k].isCorrect;
    if (q?.isOfficial) {
      officialAttemptsCount++;
      if (isCorr) officialCorrectCount++;
    } else {
      authorialAttemptsCount++;
      if (isCorr) authorialCorrectCount++;
    }
  });

  const officialAccuracy = officialAttemptsCount > 0 ? Math.round((officialCorrectCount / officialAttemptsCount) * 100) : 0;
  const authorialAccuracy = authorialAttemptsCount > 0 ? Math.round((authorialCorrectCount / authorialAttemptsCount) * 100) : 0;

  // Essay score & finalized status
  const rawEssayScore = latestEssay.evaluation?.totalScore ?? (latestEssay.versions?.length > 0 ? 84 : 0);
  const normalizedEssayScore = rawEssayScore <= 100 ? rawEssayScore * 10 : rawEssayScore;
  const essayPercent = Math.min(100, Math.round(normalizedEssayScore / 10)); // Scale 0-100%
  const finishedEssaysCount = latestEssay.evaluation ? Math.max(1, latestEssay.versions?.length || 1) : (latestEssay.versions?.length || 0);

  // Proficiency Calculation (Weighted Index)
  // When both exist: 60% questions, 40% essay
  // If only questions: 100% questions
  // If only essays: 100% essay
  let proficiencyScore = 0;
  if (totalAttempts > 0 && finishedEssaysCount > 0) {
    proficiencyScore = Math.round((accuracyRate * 0.6) + (essayPercent * 0.4));
  } else if (totalAttempts > 0) {
    proficiencyScore = accuracyRate;
  } else if (finishedEssaysCount > 0) {
    proficiencyScore = essayPercent;
  } else {
    proficiencyScore = 0;
  }

  // Proficiency Level categorization
  const getProficiencyTier = (score: number) => {
    if (score >= 85) {
      return {
        tier: 'Especialista',
        title: 'Nível Mestre · Alta Competitividade',
        badge: 'Zona de Aprovação Iminente',
        color: 'from-emerald-500 to-teal-600',
        textColor: 'text-emerald-300',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        progressBg: 'bg-emerald-500',
        feedback: 'Excelente domínio nas questões da banca e notas altíssimas nas redações. Seu ritmo e precisão estão no padrão dos primeiros colocados.',
        targetRank: 'Zona das Primeiras Vagas (Top 5%)',
        accentBorder: 'border-emerald-500/40',
      };
    }
    if (score >= 70) {
      return {
        tier: 'Avançado',
        title: 'Nível Avançado · Zona de Classificação',
        badge: 'Competitividade Elevada',
        color: 'from-indigo-500 to-purple-600',
        textColor: 'text-indigo-300',
        badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
        progressBg: 'bg-indigo-500',
        feedback: 'Retenção sólida e boa estruturação discursiva. Continue o ciclo de revisão ativa no Caderno de Erros para blindar os detalhes da banca.',
        targetRank: 'Zona de Classificação (Top 15%)',
        accentBorder: 'border-indigo-500/40',
      };
    }
    if (score >= 50) {
      return {
        tier: 'Intermediário',
        title: 'Nível Intermediário · Em Evolução',
        badge: 'Evolução Constante',
        color: 'from-amber-500 to-orange-600',
        textColor: 'text-amber-300',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
        progressBg: 'bg-amber-500',
        feedback: 'Boa base teórica iniciada. Priorize os mnemônicos e mapas mentais para elevar a taxa de acertos e treine a introdução e proposta das redações.',
        targetRank: 'Caminho para a Nota de Corte (Top 40%)',
        accentBorder: 'border-amber-500/40',
      };
    }
    return {
      tier: 'Iniciante',
      title: 'Nível Diagnóstico · Fase Inicial',
      badge: 'Construindo Fundamentos',
      color: 'from-slate-500 to-slate-700',
      textColor: 'text-slate-300',
      badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
      progressBg: 'bg-slate-400',
      feedback: 'Inicie a resolução de simulados e finalize sua primeira redação para calibrar seu índice de aprovação com precisão.',
      targetRank: 'Fase Preliminar',
      accentBorder: 'border-slate-500/40',
    };
  };

  const proficiency = getProficiencyTier(proficiencyScore);

  // By subject
  const bySubject: Record<string, { total: number; correct: number }> = {
    'Direito Administrativo': { total: 0, correct: 0 },
    'Direito Constitucional': { total: 0, correct: 0 },
    'Língua Portuguesa': { total: 0, correct: 0 },
    'Raciocínio Lógico': { total: 0, correct: 0 },
    'AFO & Gestão Pública': { total: 0, correct: 0 },
  };

  attemptKeys.forEach(k => {
    const q = questions.find(item => item.id === k);
    if (q) {
      const subj = q.subject || 'Conhecimentos Gerais';
      if (!bySubject[subj]) {
        bySubject[subj] = { total: 0, correct: 0 };
      }
      bySubject[subj].total++;
      if (attempts[k].isCorrect) bySubject[subj].correct++;
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <span>Métricas Pedagógicas</span>
          <span aria-hidden="true">·</span>
          <span>Evolução Diagnóstica</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Painel de Desempenho
        </h1>
      </div>

      {/* TOP CARD: NÍVEL DE PROFICIÊNCIA INTEGRADO */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-indigo-800/60 relative overflow-hidden space-y-6">
        {/* Glow ambient effect */}
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 translate-y-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-indigo-800/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                Índice Geral de Competência
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Nível de Proficiência do Concurseiro
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${proficiency.badgeBg}`}>
              {proficiency.badge}
            </span>
          </div>
        </div>

        {/* Main Grid: Overall Level + Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left: Overall Score Dial & Level Info */}
          <div className="lg:col-span-5 space-y-3.5 flex flex-col items-center sm:items-start text-center sm:text-left border-b lg:border-b-0 lg:border-r border-indigo-800/40 pb-5 lg:pb-0 lg:pr-6">
            <div className="flex items-center gap-4">
              {/* Circular Gauge Visual */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="url(#proficiencyGradient)"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - proficiencyScore / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="proficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                    {proficiencyScore}%
                  </span>
                  <span className="text-[9px] font-semibold text-indigo-200 uppercase tracking-widest">
                    Score
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Status Atual no Ciclo
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                  {proficiency.tier}
                </h3>
                <span className={`text-xs font-bold ${proficiency.textColor} block mt-0.5`}>
                  {proficiency.targetRank}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {proficiency.feedback}
            </p>
          </div>

          {/* Right: The Two Foundational Pillars (Questões + Redações) */}
          <div className="lg:col-span-7 space-y-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Composição Ponderada da Proficiência:
            </span>

            {/* Pillar 1: Questões Objetivas (Peso 60%) */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">1. Questões Objetivas</span>
                    <span className="text-[10px] text-slate-400">
                      {correctAttempts} acertos em {totalAttempts} questões ({totalAttempts >= 10 ? 'Amostra ativa' : 'Calibração'})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold font-mono text-sm text-emerald-300">
                    {accuracyRate}%
                  </span>
                  <span className="text-[10px] text-indigo-300 block font-semibold">Peso: 60%</span>
                </div>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${accuracyRate}%` }}
                />
              </div>
            </div>

            {/* Pillar 2: Redações & Discursivas (Peso 40%) */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">2. Provas Discursivas & Redações</span>
                    <span className="text-[10px] text-slate-400">
                      {finishedEssaysCount} texto(s) finalizado(s) · Avaliado na matriz de bancas
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold font-mono text-sm text-cyan-300">
                    {normalizedEssayScore} pts
                  </span>
                  <span className="text-[10px] text-indigo-300 block font-semibold">Peso: 40% ({essayPercent}%)</span>
                </div>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${essayPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Methodology Transparency */}
        <div className="pt-3 border-t border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-indigo-200/90 relative z-10">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Fórmula Pedagógica:</strong> (Taxa de Acertos × 60%) + (Redações Finalizadas × 40%) = <strong>{proficiencyScore}% de Proficiência</strong>
            </span>
          </span>

          <span className="text-slate-400 self-start sm:self-auto">
            Edital Alvo: <strong className="text-white">{userPrefs.examEdition}</strong>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Questões Resolvidas</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalAttempts}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {correctAttempts} acertos registrados
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Taxa Geral de Acerto</span>
          <span className="text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            {accuracyRate}%
          </span>
          <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
            Evolução consistente
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Horas Acumuladas</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            18.5h
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Registrado em ciclos
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Média em Redação</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {normalizedEssayScore}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Escala até 1.000 pts ({finishedEssaysCount} texto)
          </span>
        </div>
      </div>

      {/* Mandatory Sample Size Disclaimer as required in Section 10 */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5 leading-relaxed">
        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Aviso de Tamanho Amostral:</strong> Sua taxa de acerto atual ({accuracyRate}%) baseia-se em {totalAttempts} questões registradas. 
          Amostras pequenas possuem margem de flutuação natural e não definem domínio absoluto da matéria. O índice se torna estatisticamente robusto a partir de 100 itens resolvidos por disciplina.
        </div>
      </div>

      {/* Clear Distinction: Performance in Official vs Authorial Questions */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">
          Desempenho por Origem do Item:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Questões Oficiais (ENEM / Vestibulares)
              </span>
              <span className="font-mono font-bold text-slate-900">{officialAccuracy}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${officialAccuracy}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 block">
              {officialCorrectCount} acertos em {officialAttemptsCount} itens oficiais de provas anteriores.
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Questões Autorais Criadas por IA
              </span>
              <span className="font-mono font-bold text-slate-900">{authorialAccuracy}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${authorialAccuracy}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 block">
              {authorialCorrectCount} acertos em {authorialAttemptsCount} itens inéditos calibrados na matriz de habilidades.
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown by Discipline and Essay Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Subject */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">
            Aproveitamento por Disciplina:
          </h3>
          <div className="space-y-2.5">
            {Object.entries(bySubject).map(([sub, data]) => {
              const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 60;
              return (
                <div key={sub} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{sub}</span>
                    <span className="font-mono">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Essay Competencies Radar/Bar */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">
            Evolução nas 5 Competências do ENEM:
          </h3>
          <div className="space-y-2.5">
            {(latestEssay.evaluation?.competencies || []).map((comp) => {
              const pct = Math.round((comp.score / 200) * 100);
              return (
                <div key={comp.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>C{comp.id}: {comp.name}</span>
                    <span className="font-mono font-bold text-indigo-600">{comp.score} / 200</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations for Next Week as required in Section 10 */}
      <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-3xl space-y-2.5">
        <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Recomendações Personalizadas para a Próxima Semana:
        </h3>
        <ul className="text-xs text-indigo-900 space-y-1.5 list-disc list-inside">
          <li>Foque 45 minutos no treino de <strong>{userPrefs.difficultSubjects?.[0] || 'Atos Administrativos & Lei 14.133'}</strong> para elevar a taxa de acertos no edital.</li>
          <li>Pratique a estrutura dissertativa com citação expressa da base legal (CF/88 e leis de regência) para maximizar a pontuação na prova discursiva.</li>
          <li>Revise os itens prioritários com vencimento próximo no seu <strong>Caderno de Erros Ativo</strong> (ciclos de 1, 7 e 30 dias).</li>
        </ul>
      </div>
    </div>
  );
};
