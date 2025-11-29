import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, Home, MessageSquare, Settings, ArrowLeft, Loader2, Monitor, Sparkles } from 'lucide-react';

// --- API KEY (Mantenha a sua aqui) ---
const GEMINI_API_KEY = "AIzaSyDgBrHw06b3zSm6v_XZWRj5To2xveUE-qo"; 

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Olá! Eu sou o UniHelp. Como posso ajudar você hoje?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, activeTab]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { role: 'user', text: inputText };
    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!GEMINI_API_KEY) {
        setTimeout(() => {
          setChatHistory(prev => [...prev, { 
            role: 'model', 
            text: 'Estou no modo de demonstração visual. Configure a API Key para eu responder de verdade!' 
          }]);
          setIsLoading(false);
        }, 1500);
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: inputText }] }]
        })
      });

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, tive um erro.";
      setChatHistory(prev => [...prev, { role: 'model', text: botResponse }]);

    } catch (error) {
      console.error("Erro:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Erro de conexão." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HEADER UNIFICADO ---
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

  // --- TELA INICIAL (Baseada na imagem "Principal") ---
  const HomeScreen = () => (
    <div className="flex flex-col h-full overflow-y-auto bg-uni-bg">
      <Header title="UniHelp" />
      <div className="p-6 max-w-5xl mx-auto w-full flex flex-col items-center">
        
        {/* Mascote / Banner */}
        <div className="mt-4 mb-8 relative w-full flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b from-uni-card to-uni-bg border border-uni-border shadow-2xl">
          <div className="w-24 h-24 bg-uni-primary/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
             <Bot size={48} className="text-uni-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Me pergunte sobre...</h2>
          <p className="text-uni-muted text-center max-w-xs text-sm">
            Matérias, organização de estudos ou qualquer dúvida acadêmica.
          </p>
          <button 
            onClick={() => setActiveTab('chat')}
            className="mt-6 px-8 py-3 bg-uni-gradient rounded-full text-white font-bold shadow-lg hover:shadow-blue-500/30 transition transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Sparkles size={18} />
            Iniciar Conversa
          </button>
        </div>

        {/* Grid de Cards Escuros */}
        <h3 className="w-full text-lg font-bold text-uni-text mb-4">Atalhos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {['Resumos', 'Agenda', 'Notas', 'Perfil'].map((item, i) => (
            <button 
              key={i} 
              className="aspect-square rounded-2xl bg-uni-card border border-uni-border flex flex-col items-center justify-center hover:bg-uni-border/50 transition group"
            >
              <div className="w-10 h-10 rounded-full bg-uni-bg flex items-center justify-center mb-2 group-hover:bg-uni-primary/10">
                <span className="text-uni-primary font-bold">{i + 1}</span>
              </div>
              <span className="text-uni-muted text-sm font-medium">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // --- TELA DE CHAT (Baseada na imagem "Chat") ---
  const ChatScreen = () => (
    <div className="flex flex-col h-full bg-uni-bg relative">
      <Header title="Chat com IA" showBack={true} />
      
      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {chatHistory.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                  {/* Avatar */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${isUser ? 'border-uni-primary bg-uni-primary/10' : 'border-uni-border bg-uni-card'}`}
                  >
                    {isUser ? <User size={14} className="text-uni-primary" /> : <Bot size={16} className="text-uni-text" />}
                  </div>
                  
                  {/* Balão */}
                  <div 
                    className={`p-4 text-sm leading-relaxed shadow-sm ${
                      isUser 
                        ? 'bg-uni-primary text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-uni-card text-uni-text border border-uni-border rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-3 ml-12 animate-pulse">
              <div className="w-2 h-2 bg-uni-muted rounded-full"></div>
              <div className="w-2 h-2 bg-uni-muted rounded-full delay-75"></div>
              <div className="w-2 h-2 bg-uni-muted rounded-full delay-150"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Flutuante Estilo Figma */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-uni-bg/95 backdrop-blur border-t border-uni-border z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3 bg-uni-card p-2 rounded-full border border-uni-border focus-within:border-uni-primary transition-colors shadow-lg">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escreva..."
            className="flex-1 bg-transparent text-uni-text px-4 py-2 outline-none placeholder:text-uni-muted"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-full bg-uni-gradient text-white shadow-md disabled:opacity-50 hover:opacity-90 transition transform active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // --- CONFIGURAÇÕES ---
  const SettingsScreen = () => (
    <div className="flex flex-col h-full bg-uni-bg">
      <Header title="Perfil" />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-uni-card border-2 border-uni-primary mb-4 flex items-center justify-center">
           <User size={40} className="text-uni-text" />
        </div>
        <h2 className="text-xl font-bold text-uni-text">Usuário UniHelp</h2>
        <p className="text-uni-muted mb-8">aluno@exemplo.com</p>
        
        <div className="w-full max-w-sm space-y-3">
          {['Conta', 'Notificações', 'Ajuda', 'Sair'].map(item => (
            <button key={item} className="w-full p-4 rounded-xl bg-uni-card border border-uni-border text-uni-text flex justify-between items-center hover:border-uni-primary/50 transition">
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // --- NAVEGAÇÃO ---
  const NavItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'settings', icon: Settings, label: 'Perfil' },
  ];

  const Sidebar = () => (
    <div className="hidden md:flex flex-col w-72 bg-uni-card border-r border-uni-border h-full p-6 z-30">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-uni-gradient flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bot size={20} color="white" />
        </div>
        <span className="text-xl font-bold tracking-wide text-white">UniHelp</span>
      </div>
      <div className="space-y-2 flex-1">
        {NavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? 'bg-uni-primary/10 text-uni-primary border border-uni-primary/20' 
                : 'text-uni-muted hover:bg-uni-bg hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  );

  const BottomNav = () => {
    if (activeTab === 'chat') return null;
    return (
      <div className="md:hidden fixed bottom-0 w-full h-20 bg-uni-bg/95 backdrop-blur border-t border-uni-border flex items-center justify-around z-40 pb-4">
        {NavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div className={`p-1.5 rounded-xl transition ${isActive ? 'text-uni-primary' : 'text-uni-muted'}`}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-uni-primary' : 'text-uni-muted'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-uni-bg flex overflow-hidden font-sans text-uni-text">
      <Sidebar />
      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'chat' && <ChatScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
        <BottomNav />
      </main>
    </div>
  );
}