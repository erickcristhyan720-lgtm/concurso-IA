import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  RefreshCw,
  User,
  ArrowRight
} from 'lucide-react';
import { api, TutorResponse } from '../services/api';
import { UserPreferences, Question } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  time: string;
  mode?: 'live' | 'fallback';
}

interface TutorViewProps {
  userPrefs: UserPreferences;
  activeContext?: any;
  onClearContext?: () => void;
}

export const TutorView: React.FC<TutorViewProps> = ({
  userPrefs,
  activeContext,
  onClearContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'tutor',
      text: `Olá, ${userPrefs.name.split(' ')[0]}! Eu sou o Professor Max, seu tutor pedagógico para o ${userPrefs.examEdition}. \n\nEstou calibrado com a matriz de habilidades da prova. O que você gostaria de destravar hoje? Pode usar os atalhos rápidos abaixo ou mandar sua dúvida direta.`,
      time: 'Agora',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Quick prompt shortcuts as specified in Section 7
  const quickActions = [
    { label: 'Explique do zero', prompt: 'Pode me explicar este conceito didaticamente do zero, com uma analogia simples?', type: 'explain-zero' },
    { label: 'Dê uma pista', prompt: 'Não me dê a resposta final ainda: dê apenas uma pista pedagógica para eu raciocinar.', type: 'hint' },
    { label: 'Mostre um exemplo', prompt: 'Mostre um exemplo prático aplicado no padrão de questões do ENEM.', type: 'example' },
    { label: 'Teste se eu entendi', prompt: 'Faça uma pergunta rápida de múltipla escolha para testar se eu realmente entendi.', type: 'quiz' },
    { label: 'Explique meu erro', prompt: 'Por que a alternativa que marquei estava conceitualmente incorreta?', type: 'error-diag' },
    { label: 'Crie flashcards', prompt: 'Crie 2 flashcards (frente e verso) com os conceitos-chave deste tópico para memorização.', type: 'flashcard' },
  ];

  const handleSendMessage = async (textToSend: string, actionType?: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response: TutorResponse = await api.askTutor(
        textToSend,
        {
          exam: userPrefs.examEdition,
          targetCourse: userPrefs.targetCourse,
          difficulties: userPrefs.difficultSubjects,
          activeContext,
        },
        actionType
      );

      const tutorMsg: Message = {
        id: `t-${Date.now()}`,
        sender: 'tutor',
        text: response.text,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        mode: response.mode,
      };

      setMessages(prev => [...prev, tutorMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `t-err-${Date.now()}`,
        sender: 'tutor',
        text: 'Não consegui me conectar com os servidores neste instante. No entanto, sua pergunta foi registrada e você pode revisar as resoluções salvas no Caderno de Erros.',
        time: 'Agora',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
      {/* Tutor Topbar */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Professor Max</h2>
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                Tutor Pedagógico IA
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Calibrado para: <strong>{userPrefs.examEdition}</strong> {userPrefs.targetCourse ? `· ${userPrefs.targetCourse}` : ''}
            </p>
          </div>
        </div>

        {/* Active context chip if present */}
        {activeContext && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 truncate max-w-[150px]">
              Contexto: <strong>{activeContext.topic || 'Questão ativa'}</strong>
            </span>
            {onClearContext && (
              <button
                onClick={onClearContext}
                className="text-slate-400 hover:text-slate-600 font-bold"
                title="Limpar contexto"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isTutor = msg.sender === 'tutor';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-2xl ${isTutor ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                isTutor ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isTutor ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isTutor 
                    ? 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs whitespace-pre-line' 
                    : 'bg-indigo-600 text-white font-medium'
                }`}>
                  {msg.text}
                </div>

                <div className={`text-[10px] text-slate-400 px-1 ${isTutor ? 'text-left' : 'text-right'}`}>
                  {msg.time}
                  {msg.mode === 'live' && ' · IA Gemini 2.5'}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 max-w-md mr-auto">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Professor Max está estruturando a explicação...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Shortcuts Bar */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleSendMessage(action.prompt, action.type)}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Text Input Footer */}
      <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputText);
          }}
          placeholder="Tire uma dúvida com o Professor Max..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        />

        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
