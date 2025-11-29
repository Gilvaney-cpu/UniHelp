import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, ArrowLeft, Loader2, Sparkles, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react';

// --- CONFIGURAÇÃO DA API ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";  // <--- AGORA ESTÁ ATIVA!

// --- COMPONENTE LOGO ---
const LogoUniHelp = () => (
  <div className="flex items-center gap-2 mb-8 animate-fade-in-up">
    <div className="bg-uni-primary/20 p-3 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
       <Bot size={40} className="text-uni-primary" />
    </div>
    <span className="text-3xl font-bold text-white tracking-wide">UniHelp</span>
  </div>
);

// --- COMPONENTE INPUT CHAT ---
const ChatInput = ({ onSend, isLoading }) => {
  const [localText, setLocalText] = useState('');

  const handleSend = () => {
    if (!localText.trim() || isLoading) return;
    onSend(localText);
    setLocalText('');
  };

  return (
    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-uni-bg via-uni-bg/95 to-transparent z-20">
      <div className="max-w-3xl mx-auto flex items-center gap-3 bg-uni-card p-2 pr-2 pl-6 rounded-full border border-uni-border/50 focus-within:border-uni-primary/50 transition-all shadow-2xl ring-1 ring-white/5">
        <input
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escrever..."
          className="flex-1 bg-transparent text-uni-text text-base outline-none placeholder:text-uni-muted/60"
          disabled={isLoading}
          autoFocus
        />
        <button 
          onClick={handleSend}
          disabled={!localText.trim() || isLoading}
          className="p-3.5 rounded-full bg-uni-primary text-white shadow-lg hover:bg-uni-primary-dark hover:shadow-uni-primary/25 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95 flex items-center justify-center"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
};

// --- TELAS ---

// TELA DE LOGIN
const LoginScreen = ({ onNavigate }) => (
  <div className="w-full h-full flex flex-col p-8 bg-uni-bg relative overflow-hidden">
    <div className="absolute top-[-20%] left-[-30%] w-[600px] h-[600px] bg-uni-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
    
    <div className="relative z-10 flex-1 flex flex-col justify-center mt-10 max-w-md mx-auto w-full">
      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Login</h1>
      <p className="text-uni-muted mb-10 text-sm">Ainda não tem uma conta? <button onClick={() => onNavigate('register')} className="text-uni-primary font-semibold hover:underline decoration-2 underline-offset-4">Cadastre-se</button></p>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-uni-muted ml-1 uppercase tracking-wider">E-mail institucional</label>
          <input type="email" placeholder="seu.email@universidade.edu" className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-white outline-none focus:border-uni-primary focus:ring-1 focus:ring-uni-primary/50 transition shadow-inner" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-uni-muted ml-1 uppercase tracking-wider">Senha</label>
          <input type="password" placeholder="••••••••" className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-white outline-none focus:border-uni-primary focus:ring-1 focus:ring-uni-primary/50 transition shadow-inner" />
        </div>

        <button onClick={() => onNavigate('welcome')} className="w-full py-4 bg-uni-primary rounded-xl text-white font-bold shadow-lg shadow-uni-primary/20 hover:bg-uni-primary-dark hover:shadow-uni-primary/40 transition-all transform active:scale-[0.98] mt-6">
          Entrar
        </button>
      </div>
    </div>
    <div className="flex justify-center pb-6 opacity-80 hover:opacity-100 transition"><LogoUniHelp /></div>
  </div>
);

// TELA DE CADASTRO
const RegisterScreen = ({ onNavigate }) => (
  <div className="w-full h-full flex flex-col p-8 bg-uni-bg relative overflow-hidden">
    <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
    
    <div className="relative z-10 flex-1 flex flex-col justify-center mt-4 max-w-md mx-auto w-full">
      <h1 className="text-3xl font-bold text-white mb-1">Crie uma conta</h1>
      <p className="text-uni-muted mb-8 text-sm">Já tem uma conta? <button onClick={() => onNavigate('login')} className="text-uni-primary font-semibold hover:underline decoration-2 underline-offset-4">Login</button></p>

      <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-2 custom-scrollbar">
        {['Nome completo', 'E-mail institucional', 'Universidade'].map((placeholder) => (
          <div key={placeholder} className="space-y-1">
             <input type="text" placeholder={placeholder} className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-uni-primary transition placeholder:text-uni-muted/50" />
          </div>
        ))}
        
        <div className="flex gap-4">
           <input type="text" placeholder="Período" className="flex-1 bg-uni-card border border-uni-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-uni-primary transition placeholder:text-uni-muted/50" />
        </div>

        <input type="password" placeholder="Senha" className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-uni-primary transition placeholder:text-uni-muted/50" />
        
        <div className="flex items-start gap-3 mt-2 p-3 bg-uni-card/50 rounded-lg border border-uni-border/50">
          <input type="checkbox" className="mt-1 w-4 h-4 accent-uni-primary rounded cursor-pointer" />
          <p className="text-xs text-uni-muted leading-relaxed cursor-default">Declaro que usarei o app de forma respeitosa e contribuirei com avaliações construtivas.</p>
        </div>

        <button onClick={() => onNavigate('welcome')} className="w-full py-4 bg-uni-primary rounded-xl text-white font-bold shadow-lg shadow-uni-primary/20 hover:bg-uni-primary-dark transition-all transform active:scale-[0.98] mt-2">
          Cadastrar
        </button>
      </div>
    </div>
  </div>
);

// TELA DE BOAS VINDAS
const WelcomeScreen = ({ onNavigate }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-uni-bg text-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-uni-card/40 via-uni-bg to-uni-bg pointer-events-none" />
    
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-sm">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="Robô" className="w-56 h-56 mb-10 relative z-10 animate-bounce-slow drop-shadow-2xl filter contrast-125" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-6 leading-tight">Oi, Eu sou o <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">UniHelp!</span></h1>
      <p className="text-uni-muted text-lg leading-relaxed mb-12">
        Sua inteligência artificial para dominar as disciplinas e trocar experiências.
      </p>
      
      <button onClick={() => onNavigate('home')} className="w-full py-4 bg-white text-uni-bg text-lg font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
        Começar
      </button>
    </div>
  </div>
);

// TELA DE AVALIAÇÃO
const EvaluationScreen = ({ onNavigate }) => (
  <div className="w-full h-full flex flex-col bg-uni-bg">
    <div className="p-6 border-b border-uni-border flex items-center justify-between sticky top-0 bg-uni-bg/80 backdrop-blur-md z-10">
      <button onClick={() => onNavigate('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full transition"><ArrowLeft className="text-white" /></button>
      <h1 className="text-lg font-bold text-white absolute left-1/2 transform -translate-x-1/2">Avaliar</h1>
      <div className="w-8" />
    </div>

    <div className="p-6 space-y-8 overflow-y-auto pb-24 max-w-2xl mx-auto w-full">
      {['Disciplina', 'Professor', 'Período'].map(label => (
        <div key={label} className="space-y-2">
          <label className="text-xs font-bold text-uni-muted ml-1 uppercase">{label}</label>
          <div className="relative group">
            <select className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-uni-text appearance-none outline-none focus:border-uni-primary transition group-hover:border-uni-border/80">
              <option>Selecionar...</option>
              <option>Opção A</option>
              <option>Opção B</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-uni-muted pointer-events-none" />
          </div>
        </div>
      ))}

      <div className="bg-uni-card p-5 rounded-2xl border border-uni-border space-y-4 shadow-sm">
        <p className="text-sm font-medium text-white">O professor explica os conteúdos de forma clara?</p>
        <div className="flex gap-4">
           <label className="flex items-center gap-3 px-4 py-2 rounded-lg border border-uni-border hover:bg-uni-bg cursor-pointer transition flex-1 justify-center">
             <input type="radio" name="q1" className="accent-uni-primary w-4 h-4"/> 
             <span className="text-sm text-uni-text">Sim</span>
           </label>
           <label className="flex items-center gap-3 px-4 py-2 rounded-lg border border-uni-border hover:bg-uni-bg cursor-pointer transition flex-1 justify-center">
             <input type="radio" name="q1" className="accent-uni-primary w-4 h-4"/> 
             <span className="text-sm text-uni-text">Não</span>
           </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-uni-muted ml-1 uppercase">Sua opinião detalhada</label>
        <textarea 
          placeholder="Conte como foi sua experiência com essa disciplina..." 
          className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-white outline-none h-40 resize-none focus:border-uni-primary transition placeholder:text-uni-muted/50"
        ></textarea>
      </div>

      <button onClick={() => onNavigate('home')} className="w-full py-4 bg-white text-uni-bg font-bold rounded-xl hover:bg-gray-100 transition shadow-lg mt-4">
        Enviar Avaliação
      </button>
    </div>
  </div>
);

// --- APP PRINCIPAL ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); 
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Olá, como posso ajudar hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, currentScreen, isLoading]);

  const handleSendMessage = async (text) => {
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      if (!GEMINI_API_KEY) {
        throw new Error("API Key ausente"); // Força o erro para mostrar o aviso amigável
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui formular uma resposta.";
      setChatHistory(prev => [...prev, { role: 'model', text: botResponse }]);

    } catch (error) {
      // Mensagem de erro amigável estilizada
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        text: 'Erro de conexão. Verifique sua chave de API no arquivo .env',
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização Condicional
  if (currentScreen === 'login') return <LoginScreen onNavigate={setCurrentScreen} />;
  if (currentScreen === 'register') return <RegisterScreen onNavigate={setCurrentScreen} />;
  if (currentScreen === 'welcome') return <WelcomeScreen onNavigate={setCurrentScreen} />;
  if (currentScreen === 'evaluation') return <EvaluationScreen onNavigate={setCurrentScreen} />;

  // Layout Home/Chat
  return (
    <div className="w-full h-screen bg-uni-bg flex flex-col font-sans text-uni-text overflow-hidden">
      
      {/* Header Centralizado Perfeito */}
      {currentScreen !== 'evaluation' && (
        <div className="h-20 min-h-[5rem] flex items-center px-4 md:px-6 justify-between bg-uni-bg/90 backdrop-blur-md z-30 border-b border-uni-border/30 relative">
           <div className="w-10 flex justify-start">
             {currentScreen === 'chat' ? (
               <button onClick={() => setCurrentScreen('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full transition"><ArrowLeft className="text-white" /></button>
             ) : (
               <button className="p-2 -ml-2 hover:bg-uni-card rounded-full transition"><Menu className="text-white" /></button>
             )}
           </div>
           
           <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
             <Bot className="text-uni-primary" size={24} />
             <span className="font-bold text-lg tracking-wide">UniHelp</span>
           </div>
           
           <div className="w-10 flex justify-end">
             <div className="w-9 h-9 rounded-full bg-uni-card border border-uni-border flex items-center justify-center hover:border-uni-primary transition cursor-pointer">
               <User size={18} className="text-uni-muted"/>
             </div>
           </div>
        </div>
      )}

      {/* Conteúdo Home */}
      {currentScreen === 'home' && (
        <div className="flex-1 overflow-y-auto p-6 pb-24 max-w-3xl mx-auto w-full">
          <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 mb-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setCurrentScreen('chat')}>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 leading-tight max-w-[70%]">Me pergunte sobre <br/> uma disciplina</h2>
              <button className="bg-white text-blue-700 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-md flex items-center gap-2">
                <Sparkles size={16} /> Iniciar chat
              </button>
            </div>
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="absolute right-[-20px] bottom-[-30px] w-48 opacity-90 transition-transform group-hover:scale-110 group-hover:rotate-6" alt="Bot" />
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-uni-muted mb-4 flex items-center gap-2 uppercase tracking-wider"><Sparkles size={14}/> Sugestões</h3>
            <div className="space-y-3">
              {[
                "Como é a engenharia de software do prof. Robson?",
                "As provas de cálculo 1 são difíceis?",
                "Melhor optativa para o 4º período?"
              ].map((q, i) => (
                <button key={i} onClick={() => { setCurrentScreen('chat'); handleSendMessage(q); }} className="w-full bg-uni-card border border-uni-border p-4 rounded-xl text-left text-sm text-uni-muted hover:text-white hover:border-uni-primary/50 hover:bg-uni-card/80 transition flex justify-between items-center group">
                  {q}
                  <ArrowLeft size={16} className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity text-uni-primary"/>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setCurrentScreen('evaluation')} className="w-full py-6 text-center text-uni-muted text-sm mt-4 hover:text-white transition border-t border-uni-border/30">
            Deseja avaliar uma disciplina? <span className="underline decoration-uni-primary underline-offset-4">Clique aqui</span>
          </button>
        </div>
      )}

      {/* Conteúdo Chat */}
      {currentScreen === 'chat' && (
        <div className="flex-1 flex flex-col relative w-full max-w-5xl mx-auto">
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 custom-scrollbar">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${msg.role === 'user' ? 'border-transparent bg-uni-primary text-white' : 'border-uni-border bg-uni-card text-uni-text'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                  </div>
                  
                  {/* Balão de Mensagem */}
                  <div className="flex flex-col gap-2">
                    <div className={`p-4 text-sm md:text-base leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-uni-primary text-white rounded-2xl rounded-tr-sm shadow-blue-900/20' 
                        : 'bg-uni-card text-uni-text border border-uni-border rounded-2xl rounded-tl-sm'
                    } ${msg.isError ? 'border-red-500/50 bg-red-500/10 text-red-200' : ''}`}>
                      {msg.text}
                    </div>

                    {/* Botões de Feedback (Estilo do Print) */}
                    {msg.role === 'model' && !msg.isError && idx > 0 && (
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full hover:bg-gray-200 transition shadow-sm">
                          Sim
                        </button>
                        <button className="flex items-center gap-1.5 bg-black/40 border border-uni-border/50 text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-black/60 transition">
                          Não
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start w-full animate-pulse">
                 <div className="flex gap-3 max-w-[85%]">
                    <div className="w-9 h-9 rounded-full border border-uni-border bg-uni-card flex items-center justify-center">
                       <Bot size={18} className="text-uni-text"/>
                    </div>
                    <div className="bg-uni-card border border-uni-border rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                       <div className="w-2 h-2 bg-uni-muted rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                       <div className="w-2 h-2 bg-uni-muted rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                       <div className="w-2 h-2 bg-uni-muted rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}