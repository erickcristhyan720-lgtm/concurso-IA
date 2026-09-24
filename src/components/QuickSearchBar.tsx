import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  CheckSquare, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  GraduationCap,
  CornerDownLeft,
  Calendar,
  Clock,
  GitFork
} from 'lucide-react';
import { Question, Task, ReviewItem, Flashcard, PersonalMaterial, MindMap } from '../types';

export type SearchCategory = 'todos' | 'questoes' | 'tarefas' | 'mapas' | 'erros' | 'flashcards' | 'materiais';

interface SearchResultItem {
  id: string;
  category: 'questoes' | 'tarefas' | 'mapas' | 'erros' | 'flashcards' | 'materiais';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  meta?: string;
  rawItem: any;
}

interface QuickSearchBarProps {
  questions: Question[];
  tasks: Task[];
  reviews: ReviewItem[];
  flashcards: Flashcard[];
  materials: PersonalMaterial[];
  mindMaps?: MindMap[];
  onSelectQuestion: (questionId: string) => void;
  onSelectTask: (task: Task) => void;
  onSelectReview: (reviewId: string) => void;
  onSelectFlashcard: (flashcardId: string) => void;
  onSelectMaterial: (materialId: string) => void;
  onSelectMindMap?: (mindMapId: string) => void;
  onAskTutorWithContext: (context: any) => void;
}

export const QuickSearchBar: React.FC<QuickSearchBarProps> = ({
  questions,
  tasks,
  reviews,
  flashcards,
  materials,
  mindMaps = [],
  onSelectQuestion,
  onSelectTask,
  onSelectReview,
  onSelectFlashcard,
  onSelectMaterial,
  onSelectMindMap,
  onAskTutorWithContext,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('todos');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut: Ctrl+K or Cmd+K or / (when not typing in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Normalize text for search comparison
  const normalize = (str?: string | null) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];

    const list: SearchResultItem[] = [];

    // 1. Search Questions
    if (selectedCategory === 'todos' || selectedCategory === 'questoes') {
      questions.forEach((item) => {
        const matchesStatement = normalize(item.statement).includes(q);
        const matchesTopic = normalize(item.topic).includes(q);
        const matchesSubject = normalize(item.subject).includes(q);
        const matchesArea = normalize(item.area).includes(q);
        const matchesInstitution = normalize(item.institution || '').includes(q);
        const matchesOption = item.options.some((opt) => normalize(opt.text).includes(q));

        if (matchesStatement || matchesTopic || matchesSubject || matchesArea || matchesInstitution || matchesOption) {
          list.push({
            id: `q-${item.id}`,
            category: 'questoes',
            title: item.topic || item.subject,
            subtitle: item.statement,
            badge: item.isOfficial ? `${item.institution} ${item.year || ''}` : 'Autoral IA',
            badgeColor: item.isOfficial ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
            meta: `${item.subject} · ${item.difficulty}`,
            rawItem: item,
          });
        }
      });
    }

    // 2. Search Tasks
    if (selectedCategory === 'todos' || selectedCategory === 'tarefas') {
      tasks.forEach((item) => {
        const matchesTitle = normalize(item.title).includes(q);
        const matchesSubject = normalize(item.subject).includes(q);
        const matchesTopic = normalize(item.relatedTopic).includes(q);
        const matchesType = normalize(item.type).includes(q);

        if (matchesTitle || matchesSubject || matchesTopic || matchesType) {
          list.push({
            id: `t-${item.id}`,
            category: 'tarefas',
            title: item.title,
            subtitle: `Tópico: ${item.relatedTopic} · ${item.estimatedMinutes} min sugeridos`,
            badge: item.completed ? 'Concluída' : item.dueDate || 'Pendente',
            badgeColor: item.completed ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-800 border-amber-200',
            meta: `${item.subject} · ${item.type}`,
            rawItem: item,
          });
        }
      });
    }

    // 3. Search Review Items (Caderno de Erros)
    if (selectedCategory === 'todos' || selectedCategory === 'erros') {
      reviews.forEach((item) => {
        const matchesCause = normalize(item.errorCause).includes(q);
        const matchesTopic = normalize(item.question.topic).includes(q);
        const matchesSubject = normalize(item.question.subject).includes(q);
        const matchesStatement = normalize(item.question.statement).includes(q);

        if (matchesCause || matchesTopic || matchesSubject || matchesStatement) {
          list.push({
            id: `r-${item.id}`,
            category: 'erros',
            title: `Erro em ${item.question.topic}`,
            subtitle: item.errorCause || item.question.statement,
            badge: `Ciclo: ${item.reviewStage}d`,
            badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
            meta: `${item.question.subject} · Próxima: ${item.nextReviewDate}`,
            rawItem: item,
          });
        }
      });
    }

    // 4. Search Flashcards
    if (selectedCategory === 'todos' || selectedCategory === 'flashcards') {
      flashcards.forEach((item) => {
        const matchesFront = normalize(item.front).includes(q);
        const matchesBack = normalize(item.back).includes(q);
        const matchesTopic = normalize(item.topic).includes(q);
        const matchesSubject = normalize(item.subject).includes(q);

        if (matchesFront || matchesBack || matchesTopic || matchesSubject) {
          list.push({
            id: `fc-${item.id}`,
            category: 'flashcards',
            title: item.front,
            subtitle: item.back,
            badge: 'Flashcard',
            badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            meta: `${item.subject} · ${item.topic}`,
            rawItem: item,
          });
        }
      });
    }

    // 5. Search Personal Materials
    if (selectedCategory === 'todos' || selectedCategory === 'materiais') {
      materials.forEach((item) => {
        const matchesTitle = normalize(item.title).includes(q);
        const matchesText = normalize(item.originalText).includes(q);

        if (matchesTitle || matchesText) {
          list.push({
            id: `mat-${item.id}`,
            category: 'materiais',
            title: item.title,
            subtitle: item.originalText.slice(0, 140) + '...',
            badge: 'Anotação',
            badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
            meta: `Processado em ${item.createdAt}`,
            rawItem: item,
          });
        }
      });
    }

    // 6. Search Mind Maps (Mapas Mentais)
    if (selectedCategory === 'todos' || selectedCategory === 'mapas') {
      mindMaps.forEach((item) => {
        const matchesTopic = normalize(item.topic).includes(q);
        const matchesSubject = normalize(item.subject).includes(q);
        const matchesDesc = normalize(item.description).includes(q);
        const matchesBanca = normalize(item.bancaTarget).includes(q);
        const matchesMnemonic = item.rootNode.children?.some(c => 
          normalize(c.mnemonic).includes(q) ||
          c.children?.some(sc => normalize(sc.mnemonic).includes(q))
        );

        if (matchesTopic || matchesSubject || matchesDesc || matchesBanca || matchesMnemonic) {
          list.push({
            id: `mm-${item.id}`,
            category: 'mapas',
            title: `Mapa Mental: ${item.topic}`,
            subtitle: item.description,
            badge: item.bancaTarget ? `Banca: ${item.bancaTarget}` : 'Mnemônicos & Esquema',
            badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
            meta: `${item.subject} · ${item.rootNode.children?.length || 0} ramos`,
            rawItem: item,
          });
        }
      });
    }

    return list;
  }, [query, selectedCategory, questions, tasks, reviews, flashcards, materials, mindMaps]);

  // Reset keyboard selection index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelectItem = (item: SearchResultItem) => {
    setIsOpen(false);
    if (item.category === 'questoes') {
      onSelectQuestion(item.rawItem.id);
    } else if (item.category === 'tarefas') {
      onSelectTask(item.rawItem);
    } else if (item.category === 'erros') {
      onSelectReview(item.rawItem.id);
    } else if (item.category === 'flashcards') {
      onSelectFlashcard(item.rawItem.id);
    } else if (item.category === 'materiais') {
      onSelectMaterial(item.rawItem.id);
    } else if (item.category === 'mapas' && onSelectMindMap) {
      onSelectMindMap(item.rawItem.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectItem(results[selectedIndex]);
      }
    }
  };

  const getCategoryIcon = (category: SearchResultItem['category']) => {
    switch (category) {
      case 'questoes':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-600" />;
      case 'tarefas':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'erros':
        return <RotateCcw className="w-3.5 h-3.5 text-rose-600" />;
      case 'flashcards':
        return <Layers className="w-3.5 h-3.5 text-indigo-500" />;
      case 'materiais':
        return <FileText className="w-3.5 h-3.5 text-purple-600" />;
      case 'mapas':
        return <GitFork className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const counts = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return { questoes: 0, tarefas: 0, mapas: 0, erros: 0, flashcards: 0, materiais: 0, total: 0 };

    const qCount = questions.filter((i) =>
      normalize(i.statement).includes(q) ||
      normalize(i.topic).includes(q) ||
      normalize(i.subject).includes(q) ||
      normalize(i.area).includes(q)
    ).length;

    const tCount = tasks.filter((i) =>
      normalize(i.title).includes(q) ||
      normalize(i.subject).includes(q) ||
      normalize(i.relatedTopic).includes(q)
    ).length;

    const mmCount = mindMaps.filter((i) =>
      normalize(i.topic).includes(q) ||
      normalize(i.subject).includes(q) ||
      normalize(i.description).includes(q)
    ).length;

    const rCount = reviews.filter((i) =>
      normalize(i.errorCause).includes(q) ||
      normalize(i.question.topic).includes(q) ||
      normalize(i.question.subject).includes(q)
    ).length;

    const fcCount = flashcards.filter((i) =>
      normalize(i.front).includes(q) ||
      normalize(i.back).includes(q) ||
      normalize(i.topic).includes(q)
    ).length;

    const mCount = materials.filter((i) =>
      normalize(i.title).includes(q) ||
      normalize(i.originalText).includes(q)
    ).length;

    return {
      questoes: qCount,
      tarefas: tCount,
      mapas: mmCount,
      erros: rCount,
      flashcards: fcCount,
      materiais: mCount,
      total: qCount + tCount + mmCount + rCount + fcCount + mCount,
    };
  }, [query, questions, tasks, reviews, flashcards, materials, mindMaps]);

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-auto">
      {/* Input trigger bar */}
      <div
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-100 border rounded-xl transition-all cursor-text ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar questões, temas, materiais ou tarefas..."
          className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />

        {query ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden text-left animate-fadeIn max-w-lg min-w-[300px] sm:min-w-[440px]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto text-xs">
            {(
              [
                { id: 'todos', label: 'Tudo', count: counts.total },
                { id: 'questoes', label: 'Questões', count: counts.questoes },
                { id: 'mapas', label: 'Mapas Mentais', count: counts.mapas },
                { id: 'tarefas', label: 'Tarefas', count: counts.tarefas },
                { id: 'erros', label: 'Erros', count: counts.erros },
                { id: 'flashcards', label: 'Cards', count: counts.flashcards },
                { id: 'materiais', label: 'Anotações', count: counts.materiais },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
                {query.trim() && tab.count > 0 ? (
                  <span className="ml-1 text-[10px] font-mono bg-slate-200/80 text-slate-700 px-1 py-0.2 rounded-full">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Results list or Empty State */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {!query.trim() ? (
              <div className="p-5 text-center space-y-2">
                <Search className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Busque por assunto do concurso (ex: <em>Atos Administrativos</em>, <em>Direito Constitucional</em>), mnemônicos, bancas ou leis.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">Sugestões rápidas:</span>
                  {['Atos Administrativos', 'LIMPE', 'Art. 5º', 'Cebraspe', 'Crase', 'Licitações', 'MANÉ'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setQuery(sug)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] rounded-md transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700">
                  Nenhum resultado encontrado para "{query}"
                </p>
                <p className="text-[11px] text-slate-400">
                  Tente buscar por termos mais amplos ou verificar a categoria selecionada.
                </p>
              </div>
            ) : (
              results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 transition-colors cursor-pointer flex items-start gap-3 ${
                      isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shrink-0 shadow-2xs mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${
                              item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{item.meta}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                              onAskTutorWithContext({
                                subject: item.meta || item.title,
                                statement: item.subtitle,
                                source: `Busca rápida: ${item.title}`,
                              });
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                            title="Tirar dúvida com Professor Max"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Perguntar ao Max</span>
                          </button>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                            Abrir <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">↑</kbd>
                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">↓</kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">Enter</kbd>
                Selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">Esc</kbd>
                Fechar
              </span>
            </div>

            <span>{results.length} resultados</span>
          </div>
        </div>
      )}
    </div>
  );
};
