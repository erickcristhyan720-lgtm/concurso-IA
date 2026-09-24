import React, { useState } from 'react';
import { 
  Calendar, 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  Clock, 
  PenTool, 
  BookOpen, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Plus,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { api, SyllabusExtractionResponse } from '../services/api';
import { UserPreferences, Task } from '../types';

interface ScheduleViewProps {
  userPrefs: UserPreferences;
  tasks: Task[];
  onSaveTasks: (tasks: Task[]) => void;
  onUpdateUserPrefs: (prefs: UserPreferences) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  userPrefs,
  tasks,
  onSaveTasks,
  onUpdateUserPrefs,
}) => {
  const [activeTab, setActiveTab] = useState<'cronograma' | 'edital'>('cronograma');
  const [editalText, setEditalText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<SyllabusExtractionResponse | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedMinutes, setEditedMinutes] = useState(30);

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const handleExtractSyllabus = async () => {
    if (!editalText.trim()) return;
    setIsExtracting(true);
    try {
      const result = await api.extractSyllabus(editalText);
      setExtractedData(result);
    } catch (e) {
      console.error('Extraction error:', e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyExtractedPlan = () => {
    if (!extractedData) return;

    // Create 7-day adaptive schedule combining theory, practice, review, and essay
    const generatedTasks: Task[] = extractedData.extractedTopics.map((item, idx) => {
      const dayIndex = idx % 7;
      const type: Task['type'] = idx % 4 === 0 ? 'theory' : idx % 4 === 1 ? 'practice' : idx % 4 === 2 ? 'review' : 'essay';
      return {
        id: `gen-task-${Date.now()}-${idx}`,
        title: `${type === 'theory' ? 'Teoria Essencial' : type === 'practice' ? 'Treino Prático' : type === 'review' ? 'Revisão Ativa' : 'Laboratório Redação'}: ${item.topic}`,
        subject: item.subject,
        relatedTopic: item.topic,
        type,
        estimatedMinutes: type === 'essay' ? 60 : 35,
        priority: idx < 3 ? 'high' : 'medium',
        dueDate: dayIndex === 0 ? 'Hoje' : `Em ${dayIndex} dias`,
        completed: false,
      };
    });

    onSaveTasks([...generatedTasks, ...tasks]);
    onUpdateUserPrefs({
      ...userPrefs,
      hasUploadedSyllabus: true,
      examDate: extractedData.dates?.application !== 'Não informado no documento' ? extractedData.dates.application : userPrefs.examDate,
    });

    setActiveTab('cronograma');
  };

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
    setEditedMinutes(task.estimatedMinutes);
  };

  const saveEditedTask = (taskId: string) => {
    const updated = tasks.map(t => 
      t.id === taskId ? { ...t, title: editedTitle, estimatedMinutes: editedMinutes } : t
    );
    onSaveTasks(updated);
    setEditingTaskId(null);
  };

  const deleteTask = (taskId: string) => {
    onSaveTasks(tasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Planejamento Inteligente</span>
            <span aria-hidden="true">·</span>
            <span>Ciclo Adaptativo de 7 Dias</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cronograma & Extração de Edital
          </h1>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('cronograma')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'cronograma' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cronograma Semanal ({tasks.length} tarefas)
          </button>
          <button
            onClick={() => setActiveTab('edital')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'edital' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Enviar Edital / Manual
          </button>
        </div>
      </div>

      {/* TAB 1: CRONOGRAMA SEMANAL */}
      {activeTab === 'cronograma' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Carga diária configurada: <strong>{userPrefs.dailyMinutes} min/dia</strong> · Dias ativos: <strong>{userPrefs.availableDays.join(', ')}</strong>
            </span>
            <button
              onClick={() => setActiveTab('edital')}
              className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              + Extrair tópicos de novo edital
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isEditing = editingTaskId === task.id;
              return (
                <div
                  key={task.id}
                  className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-600">{task.subject}</span>
                      <span>·</span>
                      <span className="text-slate-400 truncate">{task.relatedTopic}</span>
                      <span>·</span>
                      <span className="capitalize text-slate-500">{task.type}</span>
                    </div>

                    {!isEditing ? (
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                        {task.title}
                      </h4>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="px-2.5 py-1 text-xs border border-indigo-500 rounded-lg flex-1"
                        />
                        <input
                          type="number"
                          value={editedMinutes}
                          onChange={(e) => setEditedMinutes(Number(e.target.value))}
                          className="w-16 px-2 py-1 text-xs border border-indigo-500 rounded-lg"
                        />
                        <button
                          onClick={() => saveEditedTask(task.id)}
                          className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Salvar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.estimatedMinutes} min</span>
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => startEditTask(task)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                        title="Editar tarefa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EXTRAÇÃO DE EDITAL */}
      {activeTab === 'edital' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Processar Edital ou Manual do Candidato
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cole o conteúdo programático ou texto do edital. A inteligência pedagógica extrai tópicos, datas e pesos com revisão prévia.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={editalText}
                onChange={(e) => setEditalText(e.target.value)}
                placeholder="Cole aqui o trecho do edital ou conteúdo programático..."
                rows={7}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditalText(`UNIVERSIDADE DE SÃO PAULO - FUVEST 2026\nMANUAL DO CANDIDATO\nProva da 1ª Fase: 15 de novembro de 2026.\nConteúdo Programático:\n- Física: Mecânica Newtoniana, Gravitação, Termodinâmica (pág. 42).\n- Química: Estequiometria, Cinética Química, Equilíbrio Químico (pág. 45).\n- Biologia: Citologia, Genética Molecular, Ecologia (pág. 48).\n- Redação: Texto dissertativo-argumentativo sobre tema contemporâneo (pág. 52).`)}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  + Carregar exemplo de edital FUVEST
                </button>

                <button
                  onClick={handleExtractSyllabus}
                  disabled={isExtracting || !editalText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
                  <span>{isExtracting ? 'Extraindo Dados...' : 'Extrair Informações do Edital'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Extracted Data Confirmation Box (as required in Section 5) */}
          {extractedData && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Revisão dos Dados Extraídos
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                  Aguardando sua confirmação
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Instituição & Prova:</span>
                  <strong className="text-slate-800">{extractedData.institution} - {extractedData.exam} ({extractedData.edition})</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Data de Aplicação:</span>
                  <strong className="text-slate-800">{extractedData.dates.application}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Pesos & Etapas:</span>
                  <strong className="text-slate-800">{extractedData.weights} · {extractedData.stages}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Regras de Redação:</span>
                  <strong className="text-slate-800">{extractedData.essayRules}</strong>
                </div>
              </div>

              {/* Topics list with origin page reference */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Tópicos e Disciplinas Detectados ({extractedData.extractedTopics.length}):
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {extractedData.extractedTopics.map((topic, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs flex items-center justify-between">
                      <span className="text-slate-800">
                        <strong>{topic.subject}:</strong> {topic.topic}
                      </span>
                      {topic.originPage && (
                        <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Pág. {topic.originPage}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleApplyExtractedPlan}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Dados e Gerar Novo Plano Adaptativo de 7 Dias</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
