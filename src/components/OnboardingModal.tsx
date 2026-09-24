import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  Upload, 
  FileText, 
  Clock, 
  HelpCircle,
  Calendar,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { UserPreferences } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPrefs: UserPreferences;
  onSavePrefs: (prefs: UserPreferences) => void;
  onStartDiagnostic: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userPrefs,
  onSavePrefs,
  onStartDiagnostic,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(userPrefs.name || '');
  const [examId, setExamId] = useState<UserPreferences['examId']>(userPrefs.examId || 'enem');
  const [examEdition, setExamEdition] = useState(userPrefs.examEdition || 'ENEM 2026');
  const [targetCourse, setTargetCourse] = useState(userPrefs.targetCourse || '');
  const [targetUniversity, setTargetUniversity] = useState(userPrefs.targetUniversity || '');
  const [examDate, setExamDate] = useState(userPrefs.examDate || '2026-11-08');
  const [dailyMinutes, setDailyMinutes] = useState(userPrefs.dailyMinutes || 90);
  const [availableDays, setAvailableDays] = useState<string[]>(
    userPrefs.availableDays || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  );
  const [difficultSubjects, setDifficultSubjects] = useState<string[]>(
    userPrefs.difficultSubjects || ['Termodinâmica e Calorimetria', 'Funções Trigonométricas']
  );
  const [editalText, setEditalText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const availableExams = [
    { id: 'enem', name: 'ENEM 2026', desc: 'Exame Nacional do Ensino Médio' },
    { id: 'fuvest', name: 'FUVEST 2026', desc: 'Vestibular USP (1ª e 2ª Fase)' },
    { id: 'unicamp', name: 'UNICAMP 2026', desc: 'Vestibular Unificado Comvest' },
    { id: 'uerj', name: 'UERJ 2026', desc: 'Exame de Qualificação e Discursivo' },
    { id: 'unesp', name: 'UNESP 2026', desc: 'Vestibular Geral Vunesp' },
    { id: 'concursos_adm', name: 'Concursos Públicos', desc: 'CNU e carreiras administrativas', comingSoon: true },
    { id: 'oab', name: 'Exame de Ordem (OAB)', desc: '1ª e 2ª Fase FGV', comingSoon: true },
  ];

  const commonDifficulties = [
    'Termodinâmica e Calorimetria',
    'Funções Trigonométricas e Logarítmicas',
    'Geometria Espacial e Volumes',
    'Era Vargas e Ditadura Militar',
    'Genética Molecular e Biotecnologia',
    'Equilíbrio Químico e Eletroquímica',
    'Coesão e Proposta de Intervenção (Redação)',
    'Interpretação e Figuras de Linguagem',
  ];

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleDifficulty = (topic: string) => {
    setDifficultSubjects(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setEditalText(`Arquivo enviado: ${file.name} (Tamanho: ${(file.size / 1024).toFixed(1)} KB). Extração pedagógica configurada.`);
    }
  };

  const handleFinishOnboarding = (startDiag: boolean) => {
    const updated: UserPreferences = {
      ...userPrefs,
      name: name.trim() || 'Estudante',
      examId,
      examEdition,
      targetCourse: targetCourse.trim() || undefined,
      targetUniversity: targetUniversity.trim() || undefined,
      examDate,
      availableDays,
      dailyMinutes,
      difficultSubjects,
      hasUploadedSyllabus: !!uploadedFileName || editalText.trim().length > 0,
      isFirstRun: false,
    };

    onSavePrefs(updated);
    onClose();

    if (startDiag) {
      onStartDiagnostic();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Progress indicator */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              {step}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {step === 1 && 'Objetivo & Exame'}
              {step === 2 && 'Disponibilidade & Metas'}
              {step === 3 && 'Dificuldades & Edital'}
              {step === 4 && 'Diagnóstico Preliminar'}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-5 h-1.5 rounded-full transition-all ${
                  s <= step ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Identification & Target */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Qual é a sua meta de aprovação?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Personalizaremos cada questão, revisão e cronograma para o seu exame.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seu Nome ou Como prefere ser chamado(a):
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ana Beatriz"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Selecione sua Prova Principal:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableExams.map((ex) => {
                    const isSelected = examId === ex.id;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          if (ex.comingSoon) return;
                          setExamId(ex.id as any);
                          setExamEdition(ex.name);
                        }}
                        disabled={ex.comingSoon}
                        className={`text-left p-3 rounded-2xl border transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-600 ring-1 ring-indigo-600'
                            : ex.comingSoon
                              ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900">{ex.name}</span>
                          {ex.comingSoon && (
                            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                              Em breve
                            </span>
                          )}
                          {isSelected && (
                            <Check className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{ex.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Universidade de Interesse (opcional):
                  </label>
                  <input
                    type="text"
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    placeholder="Ex: USP, UNICAMP, UFRJ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Curso Desejado (opcional):
                  </label>
                  <input
                    type="text"
                    value={targetCourse}
                    onChange={(e) => setTargetCourse(e.target.value)}
                    placeholder="Ex: Medicina, Direito, Eng."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Availability & Confirmed Date */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Disponibilidade Real e Data da Prova
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  A rotina deve caber na sua vida real para evitar a sensação de atraso constante.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data confirmada da sua prova (editável):
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  *Você pode alterar a data a qualquer momento se o edital for retificado.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dias da semana disponíveis para estudar:
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => {
                    const isSelected = availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-11 h-10 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700">
                    Minutos disponíveis por dia:
                  </label>
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    {dailyMinutes} min/dia
                  </span>
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
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>30 min (Express)</span>
                  <span>90 min (Recomendado)</span>
                  <span>180+ min (Intensivo)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Weaknesses & Syllabus upload */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dificuldades e Envio de Edital
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Indique os conteúdos onde você costuma travar ou errar nas questões.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Quais tópicos você considera mais difíceis?
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                  {commonDifficulties.map((topic) => {
                    const isSelected = difficultSubjects.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleDifficulty(topic)}
                        className={`text-left px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Edital ou Manual do Candidato (Opcional):
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Não é obrigatório enviar agora. O ENEM utiliza a matriz oficial cadastrada.
                </p>

                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-700 font-medium">
                    {uploadedFileName || 'Arraste o PDF do edital ou clique para selecionar'}
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="edital-upload"
                  />
                  <label
                    htmlFor="edital-upload"
                    className="inline-block mt-2 px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer shadow-2xs"
                  >
                    Selecionar Arquivo
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Diagnostic Invitation */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn text-center py-2">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Diagnóstico Inicial de 10 Questões
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Podemos calibrar suas primeiras tarefas com um teste rápido de 10 itens das 4 áreas do conhecimento.
                </p>
              </div>

              {/* Crucial Pedagogical Transparency Disclaimer */}
              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-left max-w-md mx-auto">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <strong>Nota Pedagógica:</strong> Este teste fornece um <strong>diagnóstico preliminar</strong>. 
                    Uma amostra pequena de 10 questões não determina domínio completo de uma matéria, servindo apenas para priorizar seus pontos de partida.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Voltar
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFinishOnboarding(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Pular Diagnóstico e Ir ao Painel
              </button>
              <button
                type="button"
                onClick={() => handleFinishOnboarding(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <span>Fazer Diagnóstico (10 min)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
