import React, { useState, useMemo } from 'react';
import { 
  GitFork, 
  Sparkles, 
  Search, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronDown, 
  Bot, 
  Copy, 
  Check, 
  Plus, 
  Layers, 
  BookOpen, 
  Filter, 
  ShieldCheck, 
  Bookmark, 
  Maximize2, 
  Minimize2,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { MindMap, MindMapNode } from '../types';
import { api } from '../services/api';

interface MindMapsViewProps {
  mindMaps: MindMap[];
  onSaveMindMaps: (maps: MindMap[]) => void;
  onAskTutorWithContext: (context: any) => void;
  initialSelectedMapId?: string;
}

export const MindMapsView: React.FC<MindMapsViewProps> = ({
  mindMaps,
  onSaveMindMaps,
  onAskTutorWithContext,
  initialSelectedMapId,
}) => {
  // Selected map
  const [selectedMapId, setSelectedMapId] = useState<string>(
    initialSelectedMapId || mindMaps[0]?.id || ''
  );

  // Filters & Search
  const [selectedSubject, setSelectedSubject] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Active recall toggle (hide details to test memory)
  const [isActiveRecallMode, setIsActiveRecallMode] = useState(false);
  const [revealedNodeIds, setRevealedNodeIds] = useState<Record<string, boolean>>({});

  // Collapsed branches state
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Generator modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genSubject, setGenSubject] = useState('Direito Administrativo');
  const [genBanca, setGenBanca] = useState('Cebraspe');
  const [genNotesText, setGenNotesText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Copy feedback
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Subjects available
  const availableSubjects = useMemo(() => {
    const set = new Set(mindMaps.map(m => m.subject));
    return ['todos', ...Array.from(set)];
  }, [mindMaps]);

  // Filtered mind maps
  const filteredMaps = useMemo(() => {
    return mindMaps.filter(m => {
      const matchesSubject = selectedSubject === 'todos' || m.subject === selectedSubject;
      const matchesQuery = !searchQuery || 
        m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSubject && matchesQuery;
    });
  }, [mindMaps, selectedSubject, searchQuery]);

  // Current active map
  const currentMap = useMemo(() => {
    return mindMaps.find(m => m.id === selectedMapId) || filteredMaps[0] || mindMaps[0];
  }, [mindMaps, selectedMapId, filteredMaps]);

  // Toggle collapse of a node
  const toggleCollapse = (nodeId: string) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Expand all / Collapse all
  const handleExpandAll = () => setCollapsedNodes({});
  const handleCollapseAll = () => {
    if (!currentMap?.rootNode.children) return;
    const collapsed: Record<string, boolean> = {};
    const traverse = (node: MindMapNode) => {
      if (node.children && node.children.length > 0) {
        collapsed[node.id] = true;
        node.children.forEach(traverse);
      }
    };
    currentMap.rootNode.children.forEach(traverse);
    setCollapsedNodes(collapsed);
  };

  // Toggle Active Recall reveal for a node
  const toggleRevealNode = (nodeId: string) => {
    setRevealedNodeIds(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Copy outline as Markdown
  const handleCopyOutline = () => {
    if (!currentMap) return;

    let text = `# Mapa Mental: ${currentMap.topic}\n`;
    text += `**Disciplina**: ${currentMap.subject} | **Banca**: ${currentMap.bancaTarget || 'Geral'}\n`;
    text += `*${currentMap.description}*\n\n`;

    const formatNode = (node: MindMapNode, depth: number) => {
      const indent = '  '.repeat(depth);
      let line = `${indent}- **${node.title}**`;
      if (node.mnemonic) line += ` [Mnemônico: ${node.mnemonic}]`;
      if (node.legalBasis) line += ` (${node.legalBasis})`;
      text += `${line}\n`;

      if (node.details) {
        node.details.forEach(d => {
          text += `${indent}  • ${d}\n`;
        });
      }

      if (node.children) {
        node.children.forEach(c => formatNode(c, depth + 1));
      }
    };

    if (currentMap.rootNode.children) {
      currentMap.rootNode.children.forEach(c => formatNode(c, 0));
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  // Generate new mind map with AI
  const handleGenerateMindMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) return;

    setIsGenerating(true);
    setGenError(null);

    try {
      const generated = await api.generateMindMap({
        topic: genTopic,
        subject: genSubject,
        banca: genBanca,
        notesText: genNotesText.trim() ? genNotesText : undefined,
      });

      const updated = [generated, ...mindMaps.filter(m => m.id !== generated.id)];
      onSaveMindMaps(updated);
      setSelectedMapId(generated.id);
      setShowGenerateModal(false);
      setGenTopic('');
      setGenNotesText('');
    } catch (err: any) {
      console.error('Error generating mind map:', err);
      setGenError(err.message || 'Falha ao gerar mapa mental. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 backdrop-blur-xs border border-indigo-400/20">
              <GitFork className="w-3.5 h-3.5" />
              <span>Esquematização Visual & Mnemônicos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Mapas Mentais para Concursos
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Estruture o raciocínio hierárquico das matérias do edital, memorize mnemônicos consagrados (CO-FI-FO-MO-OB, MANÉ, P-A-T-I) e teste sua retenção com o modo ativo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Gerar com IA</span>
            </button>
          </div>
        </div>

        {/* Quick Discipline Filter Bar */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Disciplinas:
          </span>
          {availableSubjects.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-white text-indigo-950 shadow-xs font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {sub === 'todos' ? 'Todas' : sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container: Map Selector + Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Available Mind Maps (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mapas Disponíveis ({filteredMaps.length})
            </span>
          </div>

          {/* Search Bar for maps */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar mapa ou mnemônico..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Scrollable list */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredMaps.map(map => {
              const isSelected = map.id === currentMap?.id;
              return (
                <button
                  key={map.id}
                  onClick={() => setSelectedMapId(map.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-700">
                      {map.subject}
                    </span>
                    {map.isUserGenerated && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                        Criado c/ IA
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">
                    {map.topic}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {map.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                    <span>Banca: <strong className="text-slate-600">{map.bancaTarget || 'Geral'}</strong></span>
                    <span>{map.rootNode.children?.length || 0} ramos</span>
                  </div>
                </button>
              );
            })}

            {filteredMaps.length === 0 && (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Nenhum mapa encontrado com este filtro.</p>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="mt-2 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Gerar mapa sobre este assunto agora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Interactive Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentMap ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
              {/* Active Map Header & Control Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                      {currentMap.subject}
                    </span>
                    {currentMap.bancaTarget && (
                      <span className="text-xs text-slate-500">
                        Banca: <strong>{currentMap.bancaTarget}</strong>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    {currentMap.topic}
                  </h2>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center flex-wrap gap-2">
                  {/* Active Recall Memory Test Toggle */}
                  <button
                    onClick={() => setIsActiveRecallMode(!isActiveRecallMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActiveRecallMode
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Oculta os ramos e detalhes para você testar sua memória antes de revelar"
                  >
                    {isActiveRecallMode ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{isActiveRecallMode ? 'Modo Teste Ativo' : 'Testar Memória'}</span>
                  </button>

                  {/* Expand / Collapse All */}
                  <button
                    onClick={handleExpandAll}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium cursor-pointer"
                    title="Expandir Todos os Ramos"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCollapseAll}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium cursor-pointer"
                    title="Recolher Todos os Ramos"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy outline */}
                  <button
                    onClick={handleCopyOutline}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copiar esquema em texto/Markdown"
                  >
                    {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSuccess ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  {/* Tutor Help for this map */}
                  <button
                    onClick={() => onAskTutorWithContext({
                      type: 'mindmap',
                      topic: currentMap.topic,
                      subject: currentMap.subject,
                      banca: currentMap.bancaTarget,
                    })}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Dúvida no Max</span>
                  </button>
                </div>
              </div>

              {/* Active Recall Banner helper when enabled */}
              {isActiveRecallMode && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Modo Estudo Ativo ativado:</strong> Detalhes e mnemônicos estão borrados. Tente recordar mentalmente a regra e clique no ramo para revelar!
                    </span>
                  </div>
                  <button
                    onClick={() => setRevealedNodeIds({})}
                    className="text-[11px] font-bold text-amber-800 underline shrink-0 cursor-pointer ml-2"
                  >
                    Ocultar todos
                  </button>
                </div>
              )}

              {/* Central Root Node Presentation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-slate-50 border-2 border-indigo-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <GitFork className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    Núcleo Temático Central
                  </span>
                  <h3 className="text-lg font-bold text-slate-950">
                    {currentMap.rootNode.title}
                  </h3>
                  {currentMap.rootNode.subtitle && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      {currentMap.rootNode.subtitle}
                    </p>
                  )}
                  {currentMap.rootNode.details && currentMap.rootNode.details.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {currentMap.rootNode.details.map((detail, idx) => (
                        <p key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{detail}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hierarchical Interactive Tree Branches */}
              <div className="space-y-4 pt-2">
                {currentMap.rootNode.children?.map((branch, index) => {
                  const isCollapsed = !!collapsedNodes[branch.id];
                  const isRevealed = !!revealedNodeIds[branch.id];
                  const branchColor = branch.color || '#4F46E5';

                  return (
                    <div
                      key={branch.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white hover:border-slate-300 shadow-2xs"
                    >
                      {/* Branch Header */}
                      <div
                        onClick={() => toggleCollapse(branch.id)}
                        className="p-4 flex items-start justify-between gap-3 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors select-none"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Color bar indicator */}
                          <div
                            className="w-1.5 h-10 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: branchColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">
                                {branch.title}
                              </h4>
                              {branch.mnemonic && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/80">
                                  Mnemônico: {branch.mnemonic}
                                </span>
                              )}
                              {branch.legalBasis && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  {branch.legalBasis}
                                </span>
                              )}
                            </div>
                            {branch.subtitle && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {branch.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Chevron & branch children counter */}
                        <div className="flex items-center gap-2 text-slate-400 shrink-0">
                          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                            {branch.children?.length ? `${branch.children.length} subdivisões` : 'Detalhes'}
                          </span>
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                      </div>

                      {/* Branch Body (Details & Sub-children) */}
                      {!isCollapsed && (
                        <div className="p-4 pt-2 border-t border-slate-100 space-y-3">
                          {/* Branch primary details */}
                          {branch.details && branch.details.length > 0 && (
                            <div
                              onClick={() => isActiveRecallMode && toggleRevealNode(branch.id)}
                              className={`p-3 rounded-xl bg-slate-50 border border-slate-100 transition-all ${
                                isActiveRecallMode && !isRevealed
                                  ? 'filter blur-xs select-none cursor-pointer bg-slate-100/70 hover:blur-[2px]'
                                  : ''
                              }`}
                            >
                              {isActiveRecallMode && !isRevealed ? (
                                <div className="text-center py-1 text-slate-600 font-semibold text-xs">
                                  🔒 Clique para revelar o conteúdo deste ramo
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {branch.details.map((item, idx) => (
                                    <div key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                      <span
                                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                        style={{ backgroundColor: branchColor }}
                                      />
                                      <span className="leading-relaxed">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Sub-children nodes */}
                          {branch.children && branch.children.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 sm:pl-4 border-l-2 border-slate-200/80 mt-3">
                              {branch.children.map(subNode => {
                                const isSubRevealed = !!revealedNodeIds[subNode.id];
                                return (
                                  <div
                                    key={subNode.id}
                                    onClick={() => isActiveRecallMode && toggleRevealNode(subNode.id)}
                                    className={`p-3 rounded-xl border border-slate-200/80 bg-white transition-all ${
                                      isActiveRecallMode && !isSubRevealed
                                        ? 'filter blur-xs select-none cursor-pointer bg-slate-50 hover:blur-[2px]'
                                        : 'hover:border-slate-300'
                                    }`}
                                  >
                                    {isActiveRecallMode && !isSubRevealed ? (
                                      <div className="text-center py-2 text-slate-500 font-semibold text-xs">
                                        🔒 Clique para revelar
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-start justify-between gap-1">
                                          <h5 className="font-bold text-slate-900 text-xs">
                                            {subNode.title}
                                          </h5>
                                        </div>

                                        {subNode.mnemonic && (
                                          <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                            {subNode.mnemonic}
                                          </span>
                                        )}

                                        {subNode.legalBasis && (
                                          <span className="inline-block mt-1 ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                            {subNode.legalBasis}
                                          </span>
                                        )}

                                        {subNode.details && (
                                          <div className="mt-2 space-y-1">
                                            {subNode.details.map((d, dIdx) => (
                                              <p key={dIdx} className="text-[11px] text-slate-600 leading-snug">
                                                • {d}
                                              </p>
                                            ))}
                                          </div>
                                        )}

                                        {/* Quick Ask Tutor Button for this sub-concept */}
                                        <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex justify-end">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onAskTutorWithContext({
                                                type: 'concept',
                                                topic: `${branch.title} -> ${subNode.title}`,
                                                subject: currentMap.subject,
                                                mnemonic: subNode.mnemonic,
                                                legalBasis: subNode.legalBasis,
                                              });
                                            }}
                                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                          >
                                            <Bot className="w-3 h-3" />
                                            <span>Explicar no Max</span>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
              <GitFork className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>Selecione um mapa mental à esquerda para visualizar sua estrutura.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: AI Mind Map Generator */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Gerador de Mapas Mentais com IA</h3>
                  <p className="text-xs text-slate-500">Especialista em esquematização para bancas de concursos</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {genError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{genError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateMindMap} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tema ou Conceito do Concurso <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Princípios da Administração Pública (LIMPE), Crimes Funcionais, Responsabilidade Civil do Estado..."
                  value={genTopic}
                  onChange={e => setGenTopic(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Disciplina
                  </label>
                  <select
                    value={genSubject}
                    onChange={e => setGenSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Direito Administrativo">Direito Administrativo</option>
                    <option value="Direito Constitucional">Direito Constitucional</option>
                    <option value="Língua Portuguesa">Língua Portuguesa</option>
                    <option value="Raciocínio Lógico">Raciocínio Lógico (RLM)</option>
                    <option value="Direito Penal & Processual">Direito Penal & Processo</option>
                    <option value="Informática & TI">Informática & TI</option>
                    <option value="AFO & Gestão Pública">AFO & Gestão Pública</option>
                    <option value="Legislação & Ética">Legislação & Ética</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Banca Alvo
                  </label>
                  <select
                    value={genBanca}
                    onChange={e => setGenBanca(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Cebraspe">Cebraspe (CESPE)</option>
                    <option value="FGV">FGV Conhecimento</option>
                    <option value="FCC">FCC (Fundação Carlos Chagas)</option>
                    <option value="Cesgranrio">Cesgranrio (CNU)</option>
                    <option value="Vunesp">Vunesp</option>
                    <option value="Geral">Geral / Mista</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Anotações ou Trechos do Edital (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Cole anotações de aula, artigo de lei ou resumo pessoal para a IA organizar nos ramos..."
                  value={genNotesText}
                  onChange={e => setGenNotesText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !genTopic.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Construindo Mapa com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Gerar Mapa Mental</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
