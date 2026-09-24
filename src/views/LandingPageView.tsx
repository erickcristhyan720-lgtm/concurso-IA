import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Layers, 
  PenTool, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  HelpCircle,
  Award,
  Zap,
  Bot,
  GitFork,
  Calculator,
  Target,
  TrendingUp,
  BrainCircuit,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  BookOpen,
  Building2,
  Users,
  User,
  Plus,
  Minus,
  Percent,
  DollarSign,
  AlertTriangle,
  Send,
  Key,
  Mail
} from 'lucide-react';

interface LandingPageViewProps {
  onStartDemo: () => void;
  onOpenAccessManagement?: () => void;
}

interface CareerPreset {
  id: string;
  name: string;
  category: string;
  salary: number;
  salaryFormatted: string;
  vacancies: string;
  banca: string;
  format: string;
  topSubjects: string[];
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ 
  onStartDemo,
  onOpenAccessManagement 
}) => {
  // 1. Calculator state
  const careerPresets: CareerPreset[] = [
    {
      id: 'receita',
      name: 'Auditor Fiscal da Receita Federal',
      category: 'Fiscal',
      salary: 22921,
      salaryFormatted: 'R$ 22.921,00',
      vacancies: '699 vagas',
      banca: 'FGV Conhecimento',
      format: 'Múltipla escolha complexa + Discursiva',
      topSubjects: ['Direito Tributário', 'Legislação Aduaneira', 'Contabilidade Geral', 'Auditoria'],
    },
    {
      id: 'trf',
      name: 'Analista Judiciário - Tribunais (TRF / TRT / STJ)',
      category: 'Tribunais',
      salary: 14852,
      salaryFormatted: 'R$ 14.852,00',
      vacancies: 'Editais abertos e comissão formada',
      banca: 'FCC / Cebraspe',
      format: 'C/E ou Múltipla escolha + Estudo de Caso',
      topSubjects: ['Direito Constitucional', 'Direito Administrativo', 'Processo Civil', 'Processo Penal'],
    },
    {
      id: 'pf',
      name: 'Agente / Escrivão da Polícia Federal (PF / PRF)',
      category: 'Policial',
      salary: 13649,
      salaryFormatted: 'R$ 13.649,00',
      vacancies: '2.000 vagas autorizadas',
      banca: 'Cebraspe',
      format: 'Certo/Errado (1 errada anula 1 certa)',
      topSubjects: ['Informática Avançada & TI', 'Contabilidade', 'Direito Penal', 'Legislação Especial'],
    },
    {
      id: 'cnu',
      name: 'CNU - Bloco 7 (Gestão Governamental & Políticas)',
      category: 'Administrativo',
      salary: 8200,
      salaryFormatted: 'R$ 8.200,00',
      vacancies: '1.748 vagas',
      banca: 'Fundação Cesgranrio',
      format: 'Múltipla escolha com pesos e eixos temáticos',
      topSubjects: ['Políticas Públicas', 'AFO & Orçamento', 'Gestão Estratégica', 'Ética no Serviço'],
    },
    {
      id: 'inss',
      name: 'Técnico do Seguro Social - INSS',
      category: 'Administrativo',
      salary: 6596,
      salaryFormatted: 'R$ 6.596,00',
      vacancies: 'Previsão de 1.000+ vagas',
      banca: 'Cebraspe',
      format: '120 itens Certo / Errado',
      topSubjects: ['Direito Previdenciário', 'Direito Administrativo', 'Língua Portuguesa', 'Raciocínio Lógico'],
    },
    {
      id: 'caixa',
      name: 'Técnico Bancário - Caixa Econômica / Banco do Brasil',
      category: 'Bancário',
      salary: 5624,
      salaryFormatted: 'R$ 5.624,00',
      vacancies: '4.000 vagas',
      banca: 'Cesgranrio',
      format: 'Múltipla escolha 60 questões + Redação',
      topSubjects: ['Conhecimentos Bancários', 'Atendimento & Vendas', 'Tecnologia da Informação', 'Matemática Financeira'],
    },
  ];

  const [selectedCareerId, setSelectedCareerId] = useState<string>('receita');
  const [studyHoursPerDay, setStudyHoursPerDay] = useState<number>(3);
  const [monthsToExam, setMonthsToExam] = useState<number>(6);

  const currentCareer = useMemo(() => {
    return careerPresets.find(c => c.id === selectedCareerId) || careerPresets[0];
  }, [selectedCareerId]);

  // Calculations
  const totalDays = monthsToExam * 30;
  const totalStudyHours = totalDays * studyHoursPerDay;
  const estimatedQuestionsResolved = Math.round(totalStudyHours * 10);
  const estimatedSpacedReviews = Math.round(estimatedQuestionsResolved * 0.38); // 38% mistakes transformed to reviews
  const investmentCost = 69.0; // Licença individual por usuário
  const firstMonthRoiRatio = ((investmentCost / currentCareer.salary) * 100).toFixed(2);

  // 2. Interactive Feature Demo Sandbox
  const [activeFeatureTab, setActiveFeatureTab] = useState<'erros' | 'mapas' | 'max' | 'discursiva'>('erros');

  // Interactive Sandbox 1: Caderno de Erros
  const [errorCardFlipped, setErrorCardFlipped] = useState(false);
  const [simulatedCycleDay, setSimulatedCycleDay] = useState<1 | 7 | 30>(1);

  // Interactive Sandbox 2: Mapas Mentais
  const [sandboxActiveRecall, setSandboxActiveRecall] = useState(false);
  const [revealedBranches, setRevealedBranches] = useState<Record<string, boolean>>({});

  const toggleSandboxReveal = (id: string) => {
    setRevealedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Interactive Sandbox 3: Professor Max Demo
  const [selectedPrompt, setSelectedPrompt] = useState<string>('fgv');
  const maxSamplePrompts = [
    {
      id: 'fgv',
      question: 'Como a FGV cobra a Responsabilidade Civil do Estado por omissão?',
      answer: 'Na banca FGV, a regra de ouro é: omissão genérica gera responsabilidade SUBJETIVA (exige culpa administrativa / falta do serviço). Porém, em caso de custódia (presídios, escolas públicas) ou dever legal específico de agir, aplica-se a teoria do risco administrativo (OBJETIVA), conforme Súmula e jurisprudência do STF (Tema 592).',
      tags: ['FGV', 'Direito Administrativo', 'Tema 592/STF'],
    },
    {
      id: 'cebraspe',
      question: 'Na Cebraspe, vale a pena chutar questões quando não sei a resposta?',
      answer: 'Estatisticamente na Cebraspe (onde 1 erro anula 1 acerto), o chute aleatório tem valor esperado ZERO e risco altíssimo de desclassificação. Nossa inteligência calibra o seu "limiar de certeza": você só marca o item se conseguir eliminar com convicção a tese contrária ou se a banca usou termos restritivos absolutos ("sempre", "em qualquer hipótese", "exclusivamente").',
      tags: ['Cebraspe', 'Estratégia de Prova', 'Certo/Errado'],
    },
    {
      id: 'mnemonico',
      question: 'Qual o mnemônico oficial dos requisitos do Ato Administrativo?',
      answer: 'Use CO-FI-FO-MO-OB:\n• COmpetência (vinculado)\n• FInalidade (vinculado)\n• FOrma (vinculado em regra)\n• MOtivo (discricionário ou vinculado)\n• OBjeto (discricionário ou vinculado)\n\nLembre-se: vícios de competência e forma admitem CONVALIDAÇÃO (FO-CO), desde que não sejam exclusivos.',
      tags: ['Mnemônico', 'CO-FI-FO-MO-OB', 'Convalidação'],
    },
  ];

  const currentMaxSample = maxSamplePrompts.find(p => p.id === selectedPrompt) || maxSamplePrompts[0];

  // 3. Per-User Licensing & Pricing State (Venda Direta por Usuários - Sem Abas)
  const [userCount, setUserCount] = useState<number>(1);

  // Per-user volume pricing tiers
  const getPerUserPrice = (count: number): number => {
    if (count >= 20) return 39.0; // 43% de economia (Grandes turmas / Cursinhos)
    if (count >= 10) return 45.0; // 35% de economia (Turmas / Mentorias)
    if (count >= 5) return 49.0;  // 29% de economia (Grupos de estudo)
    if (count >= 3) return 55.0;  // 20% de economia (Pequenos grupos)
    if (count >= 2) return 59.0;  // 15% de economia (Duplas)
    return 69.0;                  // Licença individual
  };

  const perUserPrice = getPerUserPrice(userCount);
  const totalPrice = perUserPrice * userCount;
  const baseTotal = 69.0 * userCount;
  const totalSavings = baseTotal - totalPrice;
  const discountPercent = baseTotal > 0 ? Math.round((totalSavings / baseTotal) * 100) : 0;

  // 4. Testimonials filter
  const [testimonialFilter, setTestimonialFilter] = useState<'todos' | 'fiscal' | 'tribunais' | 'policial'>('todos');

  const testimonials = [
    {
      id: '1',
      name: 'Mariana Azevedo',
      role: 'Aprovada no TRF-3 (Analista Judiciária)',
      category: 'tribunais',
      banca: 'Banca FCC',
      quote: 'Eu fazia 80 questões por dia no modo tradicional e continuava errando os mesmos detalhes de Processo Civil. O Caderno de Erros com intervalos de 1, 7 e 30 dias mudou o jogo. Minha média subiu de 68% para 89% no simulado final.',
      metric: '+21% de acertos líquidos em 60 dias',
    },
    {
      id: '2',
      name: 'Lucas Brandão',
      role: 'Aprovado na Receita Federal (Auditor Fiscal)',
      category: 'fiscal',
      banca: 'Banca FGV',
      quote: 'A FGV é implacável com pegadinhas de Contabilidade e Tributário. O Professor Max me ajudava a desarmar os enunciados dúbios às 23h, sem ter que esperar dias em fóruns de dúvidas. Valeu cada centavo.',
      metric: 'Economia de ~12 horas semanais de estudo',
    },
    {
      id: '3',
      name: 'Rafael Guimarães',
      role: 'Aprovado na Polícia Rodoviária Federal (PRF)',
      category: 'policial',
      banca: 'Banca Cebraspe',
      quote: 'O modo 15 minutos foi o que me manteve disciplinado enquanto trabalhava em escala. E os mapas mentais com mnemônicos (LIMPE, MANÉ, CO-FI-FO-MO-OB) travaram o conteúdo de Direito Administrativo na minha cabeça.',
      metric: 'Zero questões anuladas por chute precipitado',
    },
  ];

  const filteredTestimonials = testimonials.filter(t => {
    if (testimonialFilter === 'todos') return true;
    return t.category === testimonialFilter;
  });

  // 5. FAQs
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<'geral' | 'metodologia' | 'garantia'>('geral');

  const allFaqs = [
    {
      cat: 'geral',
      q: 'O que diferencia o concurso IA de plataformas tradicionais de questões?',
      a: 'As plataformas comuns são meros repositórios de questões que apenas dizem se você acertou ou errou a alternativa. O concurso IA atua como um preceptor cognitivo: ele analisa a causa pedagógica da sua falha (falha de interpretação, pegadinha de banca, esquecimento de lei seca), cria um flashcard instantâneo e agenda revisões ativas no 1º, 7º e 30º dia, garantindo retenção permanente até a posse.',
    },
    {
      cat: 'metodologia',
      q: 'Como funciona a adaptação para bancas como Cebraspe, FGV e FCC?',
      a: 'Cada banca tem um perfil de cobrança radicalmente distinto. A Cebraspe exige treino com a regra de uma errada anular uma certa; a FGV foca em hermenêutica e jurisprudência aplicada; a FCC prioriza a letra estrita da lei. O concurso IA molda a calibragem das tarefas, dos simulados e do tutor Professor Max estritamente conforme a banca do seu edital alvo.',
    },
    {
      cat: 'metodologia',
      q: 'O que são os Mapas Mentais Interativos com Modo Active Recall?',
      a: 'Em vez de mapas mentais estáticos em PDF que você lê passivamente (e logo esquece), nossos mapas têm nós dinâmicos que podem ser ocultados com um clique no "Modo Testar Memória". Você é desafiado a recordar ativamente a regra, o mnemônico ou o artigo de lei antes de revelar a resposta, fortalecendo as sinapses neuronais.',
    },
    {
      cat: 'garantia',
      q: 'Como funciona a venda e o licenciamento por usuários?',
      a: 'Você contrata exatamente a quantidade de usuários/alunos necessária. Cada usuário recebe login individual, histórico de questões e banco de erros 100% isolados. Além disso, compras para grupos (a partir de 2 usuários) recebem descontos progressivos automáticos de até 43% por usuário.',
    },
    {
      cat: 'garantia',
      q: 'Cada usuário tem seu histórico de estudo privado e independente?',
      a: 'Sim, totalmente! Cada usuário possui sua própria conta, caderno de erros, revisões agendadas, redações e conversas com o Professor Max protegidas e privadas. Nenhum usuário interfere nas métricas ou agendamentos de outro.',
    },
    {
      cat: 'garantia',
      q: 'Como os usuários recebem o acesso após a compra?',
      a: 'Imediatamente após a confirmação do pagamento, o comprador recebe um link exclusivo de ativação para compartilhar com os usuários ou pode cadastrar diretamente os e-mails de cada aluno no painel para envio automático das credenciais.',
    },
    {
      cat: 'garantia',
      q: 'Como funciona a garantia incondicional de 7 dias com reembolso integral?',
      a: 'Você e todos os usuários adquiridos podem testar todas as ferramentas sem restrições. Se por qualquer motivo sentir que a metodologia não é a ideal para a rotina de estudos, basta solicitar o reembolso em até 7 dias para devolução de 100% do valor pago.',
    },
    {
      cat: 'garantia',
      q: 'Quais são as formas de pagamento aceitas?',
      a: 'Aceitamos Pix (com liberação imediata das licenças na hora), Cartão de Crédito em até 12x e Boleto bancário à vista.',
    },
  ];

  const filteredFaqs = allFaqs.filter(f => faqCategory === 'geral' || f.cat === faqCategory);

  return (
    <div className="space-y-16 pb-20 max-w-6xl mx-auto">
      {/* 1. HERO SECTION */}
      <div className="relative pt-6 pb-2 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Inteligência Pedagógica Focada nas Principais Bancas de Concurso</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Não estude mais horas. <br className="hidden sm:inline" />
          Transforme cada <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-4">erro em aprovação</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Chega de se afogar em PDFs de 1.500 páginas e esquecer a matéria semanas depois. O <strong>concurso IA</strong> organiza seu ciclo diário de estudos, aplica repetição espaçada automática (1, 7 e 30 dias) nos seus erros e coloca o <strong>Professor Max 24h</strong> ao seu lado para gabaritar o edital.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-2xl text-sm transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Experimentar Demonstração Gratuita</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#simulador"
            className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Simulador de Horas & Retorno</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-3">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Sem cartão para testar
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Garantia incondicional de 7 dias
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Cebraspe, FGV, FCC & Cesgranrio
          </span>
        </div>
      </div>

      {/* 2. INTERACTIVE ROI & STUDY SIMULATOR */}
      <div id="simulador" className="scroll-mt-12 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Calculator className="w-4 h-4" />
              <span>Simulador Interativo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Calcule sua rota até a posse no cargo dos seus sonhos
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Descubra como o estudo ativo multiplica suas horas e o retorno do seu investimento.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-xs text-indigo-900 shrink-0">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Primeiro contracheque: <strong>{currentCareer.salaryFormatted}</strong></span>
          </div>
        </div>

        {/* Step 1: Select Career */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            1. Escolha a Carreira ou Concurso Alvo:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {careerPresets.map((career) => {
              const isSelected = career.id === selectedCareerId;
              return (
                <button
                  key={career.id}
                  onClick={() => setSelectedCareerId(career.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 block">
                      {career.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-2 leading-tight">
                      {career.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 mt-2 block">
                    {career.salaryFormatted}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Sliders for Hours & Time Horizon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Slider 1: Study hours per day */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Horas diárias de estudo disponíveis:
              </span>
              <span className="text-sm font-extrabold text-indigo-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {studyHoursPerDay} horas / dia
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={studyHoursPerDay}
              onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>1h (Trabalha o dia todo)</span>
              <span>4h (Rotina equilibrada)</span>
              <span>8h (Dedicação exclusiva)</span>
            </div>
          </div>

          {/* Slider 2: Months until exam */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Horizonte de preparação estimado:
              </span>
              <span className="text-sm font-extrabold text-indigo-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {monthsToExam} meses
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={monthsToExam}
              onChange={(e) => setMonthsToExam(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>2 meses (Edital na praça)</span>
              <span>6 meses (Médio prazo)</span>
              <span>12 meses (Ciclo completo)</span>
            </div>
          </div>
        </div>

        {/* Simulator Results Dashboard */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-700/50 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Diagnóstico de Produtividade Pedagógica
              </span>
              <h3 className="text-lg font-bold">
                Plano para {currentCareer.name} ({currentCareer.banca})
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold self-start sm:self-auto">
              Retenção Projetada: 87%
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[11px] text-slate-300 block">Horas de Estudo Focado</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                {totalStudyHours.toLocaleString('pt-BR')} h
              </span>
              <span className="text-[10px] text-indigo-200 block mt-0.5">Em {totalDays} dias de rotina</span>
            </div>

            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[11px] text-slate-300 block">Questões Diagnosticadas</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
                ~{estimatedQuestionsResolved.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-indigo-200 block mt-0.5">No formato oficial da banca</span>
            </div>

            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[11px] text-slate-300 block">Revisões no Caderno de Erros</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                ~{estimatedSpacedReviews.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-indigo-200 block mt-0.5">Ciclos de 1, 7 e 30 dias</span>
            </div>

            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[11px] text-slate-300 block">Retorno sobre Investimento</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                {firstMonthRoiRatio}%
              </span>
              <span className="text-[10px] text-indigo-200 block mt-0.5">Do seu 1º salário mensal</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-200">
            <p>
              💡 Com o método tradicional, <strong>72% do conteúdo é esquecido em 48 horas</strong> (Curva de Ebbinghaus). Com o Concurso IA, você retém os detalhes da banca até o dia da prova.
            </p>
            <button
              onClick={onStartDemo}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shrink-0 cursor-pointer"
            >
              Testar Agora na Prática
            </button>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE FEATURE SANDBOX (DEGUSTAÇÃO DAS FERRAMENTAS) */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Degustação Interativa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Experimente o ecossistema antes mesmo de assinar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Clique nas abas abaixo para interagir em tempo real com as 4 ferramentas exclusivas do concurso IA.
          </p>
        </div>

        {/* Feature Sandbox Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveFeatureTab('erros')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFeatureTab === 'erros'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>1. Caderno de Erros Ativo</span>
            </button>

            <button
              onClick={() => setActiveFeatureTab('mapas')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFeatureTab === 'mapas'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>2. Mapas & Mnemônicos</span>
            </button>

            <button
              onClick={() => setActiveFeatureTab('max')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFeatureTab === 'max'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>3. Professor Max 24h</span>
            </button>

            <button
              onClick={() => setActiveFeatureTab('discursiva')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFeatureTab === 'discursiva'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>4. Redação & Discursiva</span>
            </button>
          </div>
        </div>

        {/* Feature Sandbox Content Cards */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          {/* TAB 1: CADERNO DE ERROS */}
          {activeFeatureTab === 'erros' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Simulação: Como o Caderno de Erros impede você de errar na prova
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ao errar uma questão, a IA diagnostica o motivo exato e programa a revisão em 1, 7 e 30 dias.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
                  <span className="text-slate-500 px-2 font-medium">Ciclo:</span>
                  {([1, 7, 30] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setSimulatedCycleDay(d)}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                        simulatedCycleDay === d ? 'bg-indigo-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      D+{d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Question Error Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      Cebraspe · 2024
                    </span>
                    <span className="text-slate-500">Direito Administrativo · Atos Administrativos</span>
                  </div>
                  <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold">
                    Item que você errou
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-900 leading-relaxed">
                  "O ato administrativo praticado com vício de competência privativa ou exclusiva é suscetível de convalidação pela autoridade hierarquicamente superior, em homenagem ao princípio da segurança jurídica."
                </p>

                <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Seu erro diagnosticado pela IA:</span>
                  </div>
                  <p className="text-slate-700">
                    Você marcou <strong>CERTO</strong>, mas o gabarito é <strong>ERRADO</strong>. A competência em regra admite convalidação, <em>SALVO</em> se for de competência exclusiva/privativa ou em razão da matéria.
                  </p>
                </div>

                {/* Spaced repetition flashcard preview */}
                <div className="pt-2">
                  <button
                    onClick={() => setErrorCardFlipped(!errorCardFlipped)}
                    className="w-full py-3 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>
                      {errorCardFlipped ? 'Ocultar Flashcard de Retenção' : 'Girar Flashcard de Retenção (D+1, D+7, D+30)'}
                    </span>
                  </button>

                  {errorCardFlipped && (
                    <div className="mt-3 p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-2 animate-fadeIn">
                      <span className="font-bold text-indigo-900 uppercase tracking-wider block">
                        Flashcard Ativo para Revisão D+{simulatedCycleDay}:
                      </span>
                      <p className="text-slate-800 leading-relaxed">
                        <strong>Pergunta:</strong> Quais vícios do ato administrativo JAMAIS admitem convalidação?
                      </p>
                      <p className="text-indigo-950 font-semibold bg-white p-2.5 rounded-lg border border-indigo-100">
                        <strong>Resposta Mnemônica:</strong> Vícios de <em>Finalidade</em>, <em>Motivo</em> e <em>Objeto</em> NUNCA convalidam. Vício de <em>Competência exclusiva</em> e <em>Forma essencial</em> também NÃO convalidam. (Convalidam apenas FO-CO se a competência não for exclusiva).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MAPAS MENTAIS & ACTIVE RECALL */}
          {activeFeatureTab === 'mapas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Mapas Mentais com Modo "Testar Memória" (Active Recall)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Oculte os mnemônicos e teste se você realmente gravou a matéria antes de revelar.
                  </p>
                </div>

                <button
                  onClick={() => setSandboxActiveRecall(!sandboxActiveRecall)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    sandboxActiveRecall
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sandboxActiveRecall ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{sandboxActiveRecall ? 'Modo Teste Ativo (Ligado)' : 'Ativar Modo Teste'}</span>
                </button>
              </div>

              {/* Interactive Tree Root */}
              <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-700">Tema Central</span>
                  <h4 className="font-bold text-slate-900 text-sm">Requisitos do Ato Administrativo (Lei 4.717/65, art. 2º)</h4>
                  <p className="text-xs text-slate-600">Mnemônico Oficial: CO-FI-FO-MO-OB</p>
                </div>
              </div>

              {/* Interactive Branches */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'b1', title: 'Competência (CO)', desc: 'Sujeito que detém poder legal para a prática. Admite convalidação se não for privativa.', mnem: 'FO-CO convalidam' },
                  { id: 'b2', title: 'Finalidade (FI)', desc: 'Sempre o interesse público. Se desviada, ocorre desvio de finalidade (nulo insanável).', mnem: 'Nunca convalida' },
                  { id: 'b3', title: 'Forma (FO)', desc: 'Exteriorização do ato (escrito, motivado). Admite convalidação se não essencial à validade.', mnem: 'Regra: escrita' },
                ].map((branch) => {
                  const isRevealed = !!revealedBranches[branch.id];
                  return (
                    <div
                      key={branch.id}
                      onClick={() => sandboxActiveRecall && toggleSandboxReveal(branch.id)}
                      className={`p-4 rounded-2xl border transition-all ${
                        sandboxActiveRecall && !isRevealed
                          ? 'bg-slate-100/80 border-dashed border-amber-300 filter blur-xs hover:blur-none select-none cursor-pointer'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-slate-900 text-xs">{branch.title}</h5>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {branch.mnem}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{branch.desc}</p>
                      {sandboxActiveRecall && !isRevealed && (
                        <span className="block text-[10px] text-amber-700 font-bold mt-2">
                          🔒 Clique para revelar
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PROFESSOR MAX 24H */}
          {activeFeatureTab === 'max' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Professor Max: Seu Tutor IA Especializado nas Bancas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tire dúvidas a qualquer hora do dia ou da noite com base na jurisprudência do STF/STJ e doutrina majoritária.
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  Online 24/7
                </span>
              </div>

              {/* Sample Prompt Selector Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-400 font-semibold self-center">Exemplos reais:</span>
                {maxSamplePrompts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPrompt(p.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      selectedPrompt === p.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.tags[0]}
                  </button>
                ))}
              </div>

              {/* Simulated Chat Dialogue */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {/* User Message */}
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-lg shadow-2xs">
                    {currentMaxSample.question}
                  </div>
                </div>

                {/* Professor Max Response */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200/80 p-4 rounded-2xl rounded-tl-none text-xs text-slate-800 space-y-2 max-w-xl shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700">Professor Max</span>
                      <span className="text-[10px] text-slate-400">Resposta instantânea</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-line">{currentMaxSample.answer}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {currentMaxSample.tags.map(t => (
                        <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REDAÇÃO E DISCURSIVA */}
          {activeFeatureTab === 'discursiva' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Estúdio de Discursivas: Feedback por Critérios Oficiais
                  </h3>
                  <p className="text-xs text-slate-500">
                    A IA avalia sua peça técnica, estudo de caso ou dissertação apontando os pontos exatos de perda de pontos.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  Simulação: Estudo de Caso FGV
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800">1. Domínio Temático</span>
                    <span className="text-xs font-extrabold text-emerald-700 font-mono">38 / 40</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Identificou com clareza o vício de forma e a tese da Súmula Vinculante 13 do STF.
                  </p>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-800">2. Estrutura & Argumentação</span>
                    <span className="text-xs font-extrabold text-amber-700 font-mono">26 / 30</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Faltou citar expressamente a consequência da nulidade <em>ex tunc</em> no 2º parágrafo.
                  </p>
                </div>

                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-800">3. Norma Padrão & Coesão</span>
                    <span className="text-xs font-extrabold text-indigo-700 font-mono">28 / 30</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Excelente vocabulário jurídico; atenção ao paralelismo sintático na conclusão.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Total Estimado: <strong className="text-slate-900 font-mono text-sm">92 / 100 pontos</strong></span>
                <span className="text-emerald-700 font-bold">Aprovado com folga na fase discursiva</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. COMPARISON MATRIX: TRADITIONAL VS. CONCURSO IA */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Comparativo Estratégico</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Por que concurseiros que usam o Concurso IA saem na frente?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Veja a diferença entre o estudo passivo dos cursinhos tradicionais e o nosso ciclo ativo.
          </p>
        </div>

        <div className="overflow-hidden border border-slate-200 rounded-3xl bg-white shadow-xs">
          <div className="grid grid-cols-12 bg-slate-50 p-4 border-b border-slate-200 text-xs font-bold text-slate-700">
            <div className="col-span-5 sm:col-span-4">Dimensão de Estudo</div>
            <div className="col-span-3 sm:col-span-4 text-slate-500">Cursinhos Tradicionais</div>
            <div className="col-span-4 text-indigo-700 font-extrabold">concurso IA</div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              {
                feature: 'Tratamento das Questões Erradas',
                trad: 'Apenas mostra se errou e o gabarito seco.',
                concursoIa: 'Diagnóstico cognitivo do motivo e agendamento automático em 1, 7 e 30 dias.',
                highlight: true,
              },
              {
                feature: 'Material Teórico',
                trad: 'PDFs gigantescos de 1.500 páginas que quase ninguém termina.',
                concursoIa: 'Esquematizações diretas, mapas mentais interativos e teoria conectada às questões.',
              },
              {
                feature: 'Dúvidas em Questões Difíceis',
                trad: 'Fóruns lentos com dias de espera por resposta.',
                concursoIa: 'Professor Max 24h respondendo em 3 segundos com a jurisprudência da banca.',
                highlight: true,
              },
              {
                feature: 'Dias com Pouco Tempo',
                trad: 'Culpa por não cumprir a meta e abandono do cronograma.',
                concursoIa: 'Modo Expresso 15 Minutos que preserva seu ciclo sem perder o ritmo.',
              },
              {
                feature: 'Fixação de Mnemônicos',
                trad: 'Leitura passiva que se perde após 48 horas.',
                concursoIa: 'Modo Active Recall: oculte as ramificações e teste sua memória.',
                highlight: true,
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 p-4 items-center ${
                  row.highlight ? 'bg-indigo-50/30' : 'bg-white'
                }`}
              >
                <div className="col-span-5 sm:col-span-4 font-bold text-slate-900 pr-2">
                  {row.feature}
                </div>
                <div className="col-span-3 sm:col-span-4 text-slate-500 pr-2 line-through decoration-red-300">
                  {row.trad}
                </div>
                <div className="col-span-4 font-semibold text-indigo-900 flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{row.concursoIa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. PER-USER LICENSING & PRICING SECTION (SEM ABAS DE PAGAMENTO) */}
      <div id="planos" className="scroll-mt-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            <Users className="w-4 h-4" />
            <span>Venda & Licenciamento por Usuários</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Adquira por Usuário: Pague apenas pelos acessos que você precisa
          </h2>
          <p className="text-xs sm:text-base text-slate-500 max-w-2xl mx-auto">
            Sem mensalidades ou abas confusas. Preço direto por usuário com descontos progressivos para candidatos individuais, duplas, grupos de estudos, turmas e mentorias.
          </p>
        </div>

        {/* Interactive User Quantity Selector Card */}
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Passo 1: Selecione a quantidade de usuários/alunos
              </span>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Quantos acessos de usuários você deseja contratar?
              </h3>
            </div>
            
            <div className="flex items-center gap-2 bg-indigo-50/80 px-3 py-1.5 rounded-xl border border-indigo-100 self-start sm:self-auto">
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">
                {userCount} {userCount === 1 ? 'login individual' : 'logins individuais'}
              </span>
            </div>
          </div>

          {/* Quick preset selector buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600">
              Atalhos rápidos de pacotes por usuário:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { count: 1, label: '1 Usuário', badge: 'Solo' },
                { count: 2, label: '2 Usuários', badge: '-15%' },
                { count: 5, label: '5 Usuários', badge: '-29%' },
                { count: 10, label: '10 Usuários', badge: '-35%' },
                { count: 25, label: '25 Usuários', badge: '-43%' },
              ].map((preset) => (
                <button
                  key={preset.count}
                  onClick={() => setUserCount(preset.count)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    userCount === preset.count
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">{preset.label}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full mt-1 ${
                      userCount === preset.count
                        ? 'bg-indigo-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stepper + Slider */}
          <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Total de Usuários Contratados</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                      {userCount}
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      {userCount === 1 ? 'usuário (licença individual)' : 'usuários (licenças independentes)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stepper Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setUserCount(prev => Math.max(1, prev - 1))}
                  disabled={userCount <= 1}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  title="Diminuir usuário"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm font-mono text-slate-800">
                  {userCount}
                </span>
                <button
                  onClick={() => setUserCount(prev => Math.min(50, prev + 1))}
                  disabled={userCount >= 50}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  title="Aumentar usuário"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={userCount}
                onChange={(e) => setUserCount(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1 Usuário (Solo)</span>
                <span>5 (Grupo)</span>
                <span>10 (Turma)</span>
                <span>25 (Mentoria)</span>
                <span>50 Usuários (Cursinho)</span>
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Summary Card */}
          <div className="border-2 border-indigo-600 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-indigo-50/40 via-white to-white space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  {userCount === 1
                    ? 'Licença Individual Completa'
                    : userCount < 5
                    ? 'Pacote Dupla & Amigos'
                    : userCount < 10
                    ? 'Pacote Grupo de Estudos'
                    : 'Pacote Turmas & Mentorias'}
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-1">
                  Acesso Total para {userCount} {userCount === 1 ? 'Usuário' : 'Usuários'}
                </h4>
              </div>

              {discountPercent > 0 && (
                <div className="bg-emerald-500 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-xs self-start sm:self-auto">
                  {discountPercent}% de Desconto no Lote
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-indigo-100 shadow-2xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Preço por Usuário:</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-extrabold text-indigo-600 font-mono">
                    R$ {perUserPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[11px] text-slate-400">/ conta</span>
                </div>
                {userCount > 1 && (
                  <span className="text-[10px] text-slate-400 line-through block">
                    De R$ 69,00 por conta
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Total do Pedido:</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[11px] text-slate-500">à vista</span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  ou 12x de R$ {(totalPrice / 12).toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Sua Economia Total:</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                    {totalSavings > 0 ? `R$ ${totalSavings.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 block font-medium">
                  {totalSavings > 0 ? `Economia direta de ${discountPercent}%` : 'Melhor preço garantido'}
                </span>
              </div>
            </div>

            {/* Feature bullets for each user */}
            <div className="space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-4">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                O que cada usuário/aluno recebe:
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  `1 login e senha individual para cada um dos ${userCount} usuários`,
                  'Caderno de Erros exclusivo com repetição espaçada (1, 7, 30 dias) individual',
                  'Professor Max 24h com respostas e jurisprudência ilimitadas por usuário',
                  'Mapas Mentais Interativos com Modo Active Recall (testar memória)',
                  'Correção pedagógica de redações e peças discursivas para cada conta',
                  'Simulados cronometrados com pontuação oficial Cebraspe, FGV e FCC',
                  'Sincronização em celular, tablet e computador sem queda de sessão',
                  userCount >= 5
                    ? 'Painel do Gestor/Mentor para acompanhar desempenho de todo o grupo'
                    : 'Garantia incondicional de 7 dias com reembolso integral imediato',
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={onStartDemo}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <span>
                  Garantir {userCount} {userCount === 1 ? 'Acesso de Usuário' : 'Acessos de Usuários'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] text-slate-400">
                <span>✓ Ativação imediata no Pix ou Cartão em até 12x</span>
                <span>✓ Links de convite enviados por e-mail na hora</span>
                <span>✓ Garantia incondicional de 7 dias</span>
              </div>
            </div>
          </div>

          {/* 3 Tier Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Individual</span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                  1 Usuário
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                R$ 69,00 por conta. Foco solo com diagnóstico de erros e preparação exclusiva.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Duplas & Grupos</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  2 a 9 Usuários
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                De R$ 49 a R$ 59/usuário. Economize até 29% estudando em parceria com amigos concurseiros.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Turmas & Mentorias</span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  10+ Usuários
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                A partir de R$ 39/usuário (até 43% OFF). Painel de acompanhamento de alunos incluso.
              </p>
            </div>
          </div>

          {/* How activation works */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <h5 className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Como funciona a distribuição das licenças após a compra:</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-indigo-900">
              <div className="p-2 bg-white/70 rounded-xl">
                <strong>1. Escolha a quantidade:</strong> Adquira exatamente o número de usuários que precisa.
              </div>
              <div className="p-2 bg-white/70 rounded-xl">
                <strong>2. Liberação imediata:</strong> Receba o link de convite ou painel administrativo.
              </div>
              <div className="p-2 bg-white/70 rounded-xl">
                <strong>3. Cadastro de cada um:</strong> Cada usuário ativa seu login e senha exclusivos.
              </div>
              <div className="p-2 bg-white/70 rounded-xl">
                <strong>4. Estudo 100% isolado:</strong> Caderno de erros e IA individuais para cada aluno.
              </div>
            </div>

            {onOpenAccessManagement && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onOpenAccessManagement}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-indigo-200/90 shadow-2xs transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Acessar Painel de Gestão de Membros & Licenças →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. REAL CANDIDATE TESTIMONIALS */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Depoimentos Reais</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Quem estudou com o método colheu a posse
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Resultados auditados de candidatos preparados para carreiras de alto nível.
          </p>

          {/* Filter tabs for testimonials */}
          <div className="flex items-center justify-center gap-1 pt-2">
            {[
              { id: 'todos', label: 'Todos os Cargos' },
              { id: 'tribunais', label: 'Tribunais' },
              { id: 'fiscal', label: 'Área Fiscal' },
              { id: 'policial', label: 'Área Policial' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTestimonialFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  testimonialFilter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredTestimonials.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {t.banca}
                  </span>
                  <span className="text-xs text-amber-500 font-bold">★★★★★</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-extrabold text-emerald-700 block mb-1">
                  ✓ {t.metric}
                </span>
                <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                <p className="text-[11px] text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. INTERACTIVE FAQ ACCORDION */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Dúvidas Frequentes</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Perguntas Respondidas</h2>
        </div>

        {/* Category switcher */}
        <div className="flex items-center justify-center gap-1">
          {[
            { id: 'geral', label: 'Visão Geral' },
            { id: 'metodologia', label: 'Metodologia & Bancas' },
            { id: 'garantia', label: 'Garantia & Pagamento' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setFaqCategory(c.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                faqCategory === c.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-2.5 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. FINAL BOTTOM CALL TO ACTION */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white text-center space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Seu nome no Diário Oficial começa pelo método certo.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Experimente agora gratuitamente. Descubra como o diagnóstico de erros e a inteligência pedagógica vão acelerar sua aprovação.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg cursor-pointer active:scale-98"
            >
              Iniciar Demonstração Gratuita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
