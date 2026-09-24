import React from 'react';
import { 
  Calendar, 
  BookOpen, 
  PenTool, 
  Bot, 
  Menu, 
  FileText, 
  Award, 
  BarChart3, 
  Layers, 
  Settings, 
  Sparkles,
  School,
  X,
  GitFork,
  Users,
  Server
} from 'lucide-react';

export type MainTab = 
  | 'hoje' 
  | 'estudar' 
  | 'redacao' 
  | 'max' 
  | 'mais' 
  | 'mapas'
  | 'simulados' 
  | 'cronograma' 
  | 'materiais' 
  | 'desempenho' 
  | 'vestibulares'
  | 'fontes-dados'
  | 'gestao-acesso'
  | 'configuracoes';

interface NavigationProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  pendingReviewsCount: number;
  showMobileMoreMenu: boolean;
  setShowMobileMoreMenu: (show: boolean) => void;
  isCommercialOpen?: boolean;
  onOpenCommercial?: () => void;
  activeMembersCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  pendingReviewsCount,
  showMobileMoreMenu,
  setShowMobileMoreMenu,
  isCommercialOpen = false,
  onOpenCommercial,
  activeMembersCount,
}) => {
  const primaryTabs = [
    { id: 'hoje', label: 'Hoje', icon: Calendar },
    { id: 'estudar', label: 'Estudar', icon: BookOpen },
    { id: 'redacao', label: 'Discursiva', icon: PenTool },
    { id: 'max', label: 'Max', icon: Bot, isSpecial: true },
    { id: 'mais', label: 'Mais', icon: Menu },
  ];

  const secondaryTabs = [
    { id: 'mapas', label: 'Mapas Mentais', icon: GitFork, desc: 'Hierarquias conceituais, mnemônicos e modo teste ativo' },
    { id: 'simulados', label: 'Simulados & Bancas', icon: Award, desc: 'Cebraspe, FGV, FCC, Cesgranrio com tempo real' },
    { id: 'cronograma', label: 'Edital & Cronograma', icon: FileText, desc: 'Extração de disciplinas e ciclo adaptativo' },
    { id: 'materiais', label: 'Caderno de Erros', icon: Layers, desc: 'Repetição espaçada (1, 7, 30 dias) e flashcards', badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : undefined },
    { id: 'desempenho', label: 'Desempenho & Estatísticas', icon: BarChart3, desc: 'Taxa de acertos por disciplina e evolução' },
    { id: 'vestibulares', label: 'Concursos & Editais', icon: School, desc: 'CNU, INSS, Receita Federal, PF, Tribunais, Bancários' },
    { id: 'fontes-dados', label: 'Fontes de Dados & Gran', icon: Server, desc: 'API Gran Cursos, importação CSV/JSON e extração de editais' },
    { id: 'gestao-acesso', label: 'Gestão de Acesso', icon: Users, desc: 'Membros ativos, convites e licenças por usuário', badge: activeMembersCount !== undefined ? `${activeMembersCount} ativos` : undefined },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, desc: 'Cargo alvo, banca preferida e metas diárias' },
  ];

  const handleMobileTabClick = (tabId: string) => {
    if (tabId === 'mais') {
      setShowMobileMoreMenu(true);
    } else {
      setShowMobileMoreMenu(false);
      onSelectTab(tabId as MainTab);
    }
  };

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible on md and above) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 select-none p-4 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
          Principal
        </div>
        <nav className="space-y-1 mb-6">
          {primaryTabs.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as MainTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'max' && (
                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                    IA
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
          Ferramentas de Estudo
        </div>
        <nav className="space-y-1 flex-1">
          {secondaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as MainTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Small desktop footer info & commercial link */}
        <div className="pt-4 border-t border-slate-100 mt-auto text-xs text-slate-400 px-1 space-y-2">
          {onOpenCommercial && (
            <button
              onClick={onOpenCommercial}
              className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                isCommercialOpen 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                  : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-900 hover:bg-indigo-100'
              }`}
            >
              <div>
                <span className="block text-[11px] font-bold">Licenças por Usuário</span>
                <span className={`text-[10px] block ${isCommercialOpen ? 'text-indigo-100' : 'text-indigo-600'}`}>
                  Venda por Usuários
                </span>
              </div>
              <Sparkles className={`w-3.5 h-3.5 ${isCommercialOpen ? 'text-white' : 'text-indigo-600'}`} />
            </button>
          )}
          <p className="leading-relaxed text-[11px]">
            Metodologia ativa para Cebraspe, FGV, FCC e Cesgranrio.
          </p>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION (Visible on mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 safe-bottom">
        <div className="flex items-center justify-around">
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const isTabActive = item.id === 'mais' ? showMobileMoreMenu : currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMobileTabClick(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors relative cursor-pointer ${
                  isTabActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isTabActive ? 'text-indigo-600 stroke-[2.2]' : 'text-slate-400'}`} />
                  {item.id === 'max' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                  )}
                  {item.id === 'mais' && pendingReviewsCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 text-[9px] font-bold bg-amber-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {pendingReviewsCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MOBILE MORE MENU DRAWER / MODAL */}
      {showMobileMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end animate-fadeIn">
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">Mais Recursos</span>
                <span className="text-xs text-slate-400">concurso IA</span>
              </div>
              <button
                onClick={() => setShowMobileMoreMenu(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {secondaryTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowMobileMoreMenu(false);
                      onSelectTab(item.id as MainTab);
                    }}
                    className={`w-full flex items-start gap-3.5 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {item.badge} pendentes
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                    </div>
                  </button>
                );
              })}

              {onOpenCommercial && (
                <button
                  onClick={() => {
                    setShowMobileMoreMenu(false);
                    onOpenCommercial();
                  }}
                  className="w-full flex items-start gap-3.5 p-3 rounded-2xl text-left bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 text-indigo-950 transition-all cursor-pointer mt-2"
                >
                  <div className="p-2 rounded-xl mt-0.5 bg-indigo-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-indigo-900">Licenças por Usuário</span>
                      <span className="text-[10px] font-bold bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full">
                        7 dias de garantia
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 mt-0.5">
                      Venda por usuários, descontos em lote e degustação
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
