import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, Home, MessageSquare, Settings, ArrowLeft, Loader2, Monitor, Sparkles, LogIn, Mail, Lock, ChevronRight } from 'lucide-react';

// --- CONFIGURAÇÃO SEGURA ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 


// --- COMPONENTE DE INPUT ISOLADO ---
const ChatInput = ({ onSend, isLoading }) => {
  const [localText, setLocalText] = useState('');

  const handleSend = () => {
    if (!localText.trim() || isLoading) return;
    onSend(localText);
    setLocalText('');
  };

  return (
    <div className="absolute bottom-0 left-0 w-full p-4 bg-uni-bg/95 backdrop-blur border-t border-uni-border z-20">
      <div className="max-w-3xl mx-auto flex items-center gap-3 bg-uni-card p-2 rounded-full border border-uni-border focus-within:border-uni-primary transition-colors shadow-lg">
        <input
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escreva sua mensagem..."
          className="flex-1 bg-transparent text-uni-text px-4 py-2 outline-none placeholder:text-uni-muted"
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={!localText.trim() || isLoading}
          className="p-3 rounded-full bg-uni-gradient text-white shadow-md disabled:opacity-50 hover:opacity-90 transition transform active:scale-95"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

// --- TELA DE LOGIN ---
const LoginScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-uni-bg relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-20%] w-96 h-96 bg-uni-primary/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <div className="w-28 h-28 bg-uni-card rounded-2xl flex items-center justify-center mb-8 border border-uni-border shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
           <Bot size={56} className="text-uni-primary" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
        </h1>
        <p className="text-uni-muted mb-8 text-center">
          {isLogin ? 'Entre para continuar seus estudos.' : 'O seu assistente acadêmico inteligente.'}
        </p>

        <div className="w-full space-y-4">
          {!isLogin && (
            <div className="bg-uni-card border border-uni-border rounded-xl px-4 py-3 flex items-center gap-3">
              <User size={20} className="text-uni-muted" />
              <input type="text" placeholder="Nome completo" className="bg-transparent outline-none text-uni-text w-full placeholder:text-uni-muted" />
            </div>
          )}
          
          <div className="bg-uni-card border border-uni-border rounded-xl px-4 py-3 flex items-center gap-3">
            <Mail size={20} className="text-uni-muted" />
            <input type="email" placeholder="Email institucional" className="bg-transparent outline-none text-uni-text w-full placeholder:text-uni-muted" />
          </div>
          
          <div className="bg-uni-card border border-uni-border rounded-xl px-4 py-3 flex items-center gap-3">
            <Lock size={20} className="text-uni-muted" />
            <input type="password" placeholder="Senha" className="bg-transparent outline-none text-uni-text w-full placeholder:text-uni-muted" />
          </div>

          <button 
            onClick={onLogin}
            className="w-full py-4 bg-uni-gradient rounded-xl text-white font-bold shadow-lg hover:shadow-blue-500/25 transition mt-4 flex items-center justify-center gap-2"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'} <ChevronRight size={20} />
          </button>
        </div>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-uni-muted text-sm hover:text-uni-primary transition"
        >
          {isLogin ? 'Não tem conta? Crie agora' : 'Já tem conta? Fazer login'}
        </button>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Olá! Eu sou o UniHelp. Como posso ajudar você hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, activeTab]);

  const handleSendMessage = async (text) => {
    const userMsg = { role: 'user', text: text };
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      if (!GEMINI_API_KEY) {
        setTimeout(() => {
          setChatHistory(prev => [...prev, { 
            role: 'model', 
            text: 'ATENÇÃO: Configure sua chave no arquivo .env para a IA funcionar.' 
          }]);
          setIsLoading(false);
        }, 1500);
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] })
      });

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro na resposta.";
      setChatHistory(prev => [...prev, { role: 'model', text: botResponse }]);

    } catch (error) {
      console.error("Erro:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Erro de conexão." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const Header = ({ title, showBack }) => (
    <div className="w-full h-16 flex items-center px-6 border-b border-uni-border bg-uni-bg/90 backdrop-blur-md sticky top-0 z-20">
      {showBack && (
        <button onClick={() => setActiveTab('home')} className="mr-4 text-uni-muted hover:text-white transition md:hidden">
          <ArrowLeft size={24} />
        </button>
      )}
      <div className="flex-1 flex items-center gap-2">
        {!showBack && <Bot size={24} className="text-uni-primary" />}
        <h1 className="text-lg font-bold text-uni-text tracking-wide">{title}</h1>
      </div>
      <button className="p-2 rounded-full hover:bg-uni-card transition">
        <Menu size={24} className="text-uni-text" />
      </button>
    </div>
  );
  
  const HomeScreen = () => (
    <div className="flex flex-col h-full overflow-y-auto bg-uni-bg pb-24">
      <Header title="Principal" />
      <div className="p-6 max-w-5xl mx-auto w-full flex flex-col items-center">
        
        <div className="w-full bg-uni-card border border-uni-border rounded-3xl p-6 relative overflow-hidden mb-6 group hover:border-uni-primary/30 transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-uni-primary/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
              alt="Mascote 3D" 
              className="w-32 h-32 mb-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] animate-bounce-slow"
              style={{ animationDuration: '3s' }}
            />
            
            <h2 className="text-2xl font-bold text-white mb-2">Oi, Eu sou o UniHelp!</h2>
            <p className="text-uni-muted text-sm max-w-xs mb-6">
              Estou pronto para ajudar você a conquistar as melhores notas nas disciplinas.
            </p>
            
            <button 
              onClick={() => setActiveTab('chat')}
              className="px-8 py-3 bg-uni-gradient rounded-full text-white font-bold shadow-lg hover:shadow-blue-500/30 transition transform hover:scale-105 active:scale-95"
            >
              Começar Agora
            </button>
          </div>
        </div>

        <h3 className="w-full text-lg font-bold text-uni-text mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {['Resumos', 'Agenda', 'Notas', 'Disciplinas'].map((item, i) => (
            <button key={i} className="aspect-[4/3] rounded-2xl bg-uni-card border border-uni-border flex flex-col items-center justify-center hover:bg-uni-border/50 transition group hover:border-uni-primary/30">
              <div className="p-3 rounded-xl bg-uni-bg border border-uni-border mb-2 group-hover:scale-110 transition">
                <Sparkles size={20} className="text-uni-primary" />
              </div>
              <span className="text-uni-text text-sm font-medium">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ChatScreen = () => (
    <div className="flex flex-col h-full bg-uni-bg relative">
      <Header title="Chat com IA" showBack={true} />
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {chatHistory.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${isUser ? 'border-uni-primary bg-uni-primary/10' : 'border-uni-border bg-uni-card'}`}>
                    {isUser ? <User size={14} className="text-uni-primary" /> : <Bot size={16} className="text-uni-text" />}
                  </div>
                  <div className={`p-4 text-sm leading-relaxed shadow-sm ${isUser ? 'bg-uni-primary text-white rounded-2xl rounded-tr-sm' : 'bg-uni-card text-uni-text border border-uni-border rounded-2xl rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && <div className="ml-12 text-uni-muted text-xs animate-pulse">Digitando...</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );

  const SettingsScreen = () => (
    <div className="flex flex-col h-full bg-uni-bg">
      <Header title="Perfil" />
      <div className="flex-1 flex flex-col items-center p-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-uni-primary to-purple-600 p-[2px] mb-4">
           <div className="w-full h-full rounded-full bg-uni-bg flex items-center justify-center">
             <User size={40} className="text-uni-text" />
           </div>
        </div>
        <h2 className="text-xl font-bold text-uni-text">Usuário UniHelp</h2>
        <p className="text-uni-muted mb-8">aluno@university.edu</p>
        <button onClick={() => setIsAuthenticated(false)} className="px-6 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition">Sair da Conta</button>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="w-full h-screen bg-uni-bg flex overflow-hidden font-sans text-uni-text">
      <div className="hidden md:flex flex-col w-72 bg-uni-card border-r border-uni-border h-full p-6 z-30">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-uni-gradient flex items-center justify-center"><Bot size={20} color="white" /></div>
          <span className="text-xl font-bold tracking-wide text-white">UniHelp</span>
        </div>
        <div className="space-y-2 flex-1">
          {[
            { id: 'home', icon: Home, label: 'Início' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'settings', icon: Settings, label: 'Perfil' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === item.id ? 'bg-uni-primary/10 text-uni-primary border border-uni-primary/20' : 'text-uni-muted hover:bg-uni-bg'}`}>
              <item.icon size={20} /> <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'chat' && <ChatScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
        
        {activeTab !== 'chat' && (
          <div className="md:hidden fixed bottom-0 w-full h-20 bg-uni-bg/95 backdrop-blur border-t border-uni-border flex items-center justify-around z-40 pb-4">
             {[
              { id: 'home', icon: Home, label: 'Início' },
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
              { id: 'settings', icon: Settings, label: 'Perfil' },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex flex-col items-center justify-center w-full h-full">
                <div className={`p-1.5 rounded-xl transition ${activeTab === item.id ? 'text-uni-primary' : 'text-uni-muted'}`}><item.icon size={24} /></div>
                <span className={`text-[10px] mt-1 ${activeTab === item.id ? 'text-uni-primary' : 'text-uni-muted'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}