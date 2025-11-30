import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, ArrowLeft, Loader2, Sparkles, ChevronDown, Check, X, Star, ShieldCheck, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

// --- CONFIGURAÇÃO DO FIREBASE ---
// Substitua com suas chaves do Firebase Console depois
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa Firebase apenas se houver configuração (evita erro em dev sem chaves)
let auth, db;
try {
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.log("Firebase não configurado ainda (Modo Demo)");
}

// --- CONFIGURAÇÃO DA API GEMINI ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 

// --- DADOS MOCKADOS (Para testar sem Banco de Dados) ---
const MOCK_VALIDATIONS = [
  { id: 1, text: "O professor Robson cobra presença em todas as aulas de Engenharia de Software?", subject: "Engenharia de Software" },
  { id: 2, text: "Dizem que a prova de Cálculo 1 permite consulta a uma folha A4. Confere?", subject: "Cálculo 1" },
  { id: 3, text: "É verdade que a disciplina de Ética não tem prova final, apenas trabalhos?", subject: "Ética" }
];

const MOCK_PROFESSORS = ["Robson Correia", "Ana Paula", "Carlos Silva", "Fernanda Lima"];
const MOCK_SUBJECTS = ["Engenharia de Software", "Cálculo 1", "Física 3", "Algoritmos", "Ética"];

// --- COMPONENTES ---

const LogoUniHelp = () => (
  <div className="flex items-center gap-2 mb-8 animate-fade-in">
    <div className="bg-uni-primary/20 p-3 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
       <Bot size={40} className="text-uni-primary" />
    </div>
    <span className="text-3xl font-bold text-white tracking-wide">UniHelp</span>
  </div>
);

const ChatInput = ({ onSend, isLoading }) => {
  const [localText, setLocalText] = useState('');
  return (
    <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-uni-bg via-uni-bg/95 to-transparent z-20 pointer-events-none">
      <div className="max-w-3xl mx-auto flex items-center gap-3 bg-uni-card p-2 pr-2 pl-4 md:pl-6 rounded-full border border-uni-border/50 focus-within:border-uni-primary/50 transition-all shadow-2xl ring-1 ring-white/5 pointer-events-auto">
        <input
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && onSend(localText) && setLocalText('')}
          placeholder="Escrever..."
          className="flex-1 bg-transparent text-uni-text text-base outline-none placeholder:text-uni-muted/60 min-w-0"
          disabled={isLoading}
          autoFocus
        />
        <button 
          onClick={() => { if(localText.trim()) { onSend(localText); setLocalText(''); } }}
          disabled={!localText.trim() || isLoading}
          className="p-3 md:p-3.5 rounded-full bg-uni-primary text-white shadow-lg hover:bg-uni-primary-dark disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center shrink-0"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
};

// --- TELAS ---

const LoginScreen = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Simulação para testar sem Firebase
        if(email && password) {
           setTimeout(() => onLoginSuccess({ email }), 1000);
           return;
        }
      }
      onLoginSuccess(auth?.currentUser || { email });
    } catch (err) {
      setError("Erro ao entrar. Verifique suas credenciais.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-uni-bg">
      <div className="absolute inset-0 w-full h-full overflow-y-auto custom-scrollbar flex flex-col p-8">
        <div className="relative z-10 flex-1 flex flex-col justify-center mt-10 max-w-md mx-auto w-full">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Login</h1>
          <p className="text-uni-muted mb-10 text-sm">Ainda não tem uma conta? <button onClick={() => onNavigate('register')} className="text-uni-primary font-semibold hover:underline">Cadastre-se</button></p>
          
          <div className="space-y-5">
            <div className="space-y-1.5"><label className="text-xs font-medium text-uni-muted ml-1 uppercase">E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-white outline-none focus:border-uni-primary transition" /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-uni-muted ml-1 uppercase">Senha</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-white outline-none focus:border-uni-primary transition" /></div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-uni-primary rounded-xl text-white font-bold shadow-lg hover:bg-uni-primary-dark transition-all mt-6 active:scale-[0.98] flex justify-center">
              {loading ? <Loader2 className="animate-spin" /> : "Entrar"}
            </button>
          </div>
        </div>
        <div className="flex justify-center pb-6 mt-auto shrink-0"><LogoUniHelp /></div>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleRegister = async () => {
    if (auth) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        onLoginSuccess(auth.currentUser);
      } catch (e) { alert("Erro ao criar conta: " + e.message); }
    } else {
      onLoginSuccess({ email }); // Mock
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-8 bg-uni-bg relative overflow-y-auto custom-scrollbar">
      <div className="relative z-10 flex-1 flex flex-col justify-center mt-4 max-w-md mx-auto w-full pb-10">
        <h1 className="text-3xl font-bold text-white mb-1">Crie uma conta</h1>
        <p className="text-uni-muted mb-8 text-sm">Já tem uma conta? <button onClick={() => onNavigate('login')} className="text-uni-primary font-semibold hover:underline">Login</button></p>
        <div className="space-y-4">
          <input type="text" placeholder="Nome" className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-uni-primary" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-uni-primary" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-uni-primary" />
          <button onClick={handleRegister} className="w-full py-4 bg-uni-primary rounded-xl text-white font-bold shadow-lg mt-2 active:scale-[0.98]">Cadastrar</button>
        </div>
      </div>
    </div>
  );
};

const EvaluationScreen = ({ onNavigate }) => {
  const [disciplina, setDisciplina] = useState('');
  const [professor, setProfessor] = useState('');
  const [opiniao, setOpiniao] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async () => {
    if (!disciplina || !professor || !opiniao) return alert("Preencha todos os campos!");
    
    // Salvar no Firebase (se configurado)
    if (db) {
      try {
        await addDoc(collection(db, "avaliacoes"), {
          disciplina, professor, opiniao,
          data: new Date(),
          userId: auth?.currentUser?.uid
        });
      } catch (e) { console.error(e); }
    }
    
    setEnviado(true);
    setTimeout(() => { setEnviado(false); onNavigate('home'); }, 2000);
  };

  if (enviado) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-uni-bg animate-fade-in">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
        <Check size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-white">Avaliação Enviada!</h2>
      <p className="text-uni-muted mt-2">Obrigado por contribuir com a comunidade.</p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-uni-bg relative">
      <div className="p-6 border-b border-uni-border flex items-center justify-between sticky top-0 bg-uni-bg/95 backdrop-blur-md z-30">
        <button onClick={() => onNavigate('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full transition"><ArrowLeft className="text-white" /></button>
        <h1 className="text-lg font-bold text-white absolute left-1/2 transform -translate-x-1/2">Avaliar</h1>
        <div className="w-8" />
      </div>
      <div className="absolute inset-0 top-[80px] w-full overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6 pb-24 max-w-2xl mx-auto w-full">
            
            {/* Inputs Melhorados conforme imagem */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-uni-muted ml-1 uppercase">Disciplina</label>
              <div className="relative">
                <select value={disciplina} onChange={e => setDisciplina(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-uni-text outline-none appearance-none cursor-pointer focus:border-uni-primary transition">
                  <option value="">Selecionar...</option>
                  {MOCK_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-uni-muted pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-uni-muted ml-1 uppercase">Professor</label>
              <div className="relative">
                <select value={professor} onChange={e => setProfessor(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-uni-text outline-none appearance-none cursor-pointer focus:border-uni-primary transition">
                  <option value="">Selecionar...</option>
                  {MOCK_PROFESSORS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-uni-muted pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-uni-muted ml-1 uppercase">Sua Opinião</label>
              <textarea 
                value={opiniao} 
                onChange={e => setOpiniao(e.target.value)} 
                placeholder="Escreva aqui o que achou da metodologia, provas, etc..." 
                className="w-full bg-uni-card border border-uni-border rounded-xl px-4 py-4 text-white h-40 resize-none outline-none focus:border-uni-primary transition placeholder:text-uni-muted/50"
              ></textarea>
            </div>

            <button onClick={handleSubmit} className="w-full py-4 bg-white text-uni-bg font-bold rounded-xl hover:bg-gray-200 transition shadow-lg mt-4 active:scale-[0.98]">
              Enviar Avaliação
            </button>
          </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); 
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Olá, sou o UniHelp! Posso tirar suas dúvidas ou validar informações sobre disciplinas.', type: 'text' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (auth) {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) { setUser(u); setCurrentScreen('home'); }
        else { setUser(null); setCurrentScreen('login'); }
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory.length, currentScreen]);

  // Função para Injetar uma Validação no Chat
  const triggerValidation = () => {
    // Pega uma afirmação aleatória para o usuário validar
    const validation = MOCK_VALIDATIONS[Math.floor(Math.random() * MOCK_VALIDATIONS.length)];
    
    setChatHistory(prev => [
      ...prev,
      { 
        role: 'model', 
        text: `🤔 **Ajude a comunidade:**\n\n"${validation.text}"\n\nEssa informação procede?`, 
        type: 'validation',
        validationId: validation.id
      }
    ]);
  };

  const handleSendMessage = async (text) => {
    setChatHistory(prev => [...prev, { role: 'user', text, type: 'text' }]);
    setIsLoading(true);

    // Lógica para acionar a validação aleatoriamente (ex: 30% de chance após uma resposta)
    const shouldValidate = Math.random() > 0.7;

    try {
      if (!GEMINI_API_KEY) throw new Error("API Key ausente");

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setChatHistory(prev => [...prev, { role: 'model', text: botResponse, type: 'text' }]);

      if (shouldValidate) {
        setTimeout(triggerValidation, 1500); // Dispara a validação um pouco depois
      }

    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Erro de conexão.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationResponse = (id, response) => {
    // Aqui salvaríamos a resposta no Banco de Dados para contabilizar a veracidade
    console.log(`Validação ${id}: ${response}`);
    
    // Atualiza a UI para agradecer
    setChatHistory(prev => [
      ...prev,
      { role: 'model', text: `✅ Obrigado! Sua resposta ajuda a manter o UniHelp atualizado.`, type: 'text' }
    ]);
  };

  if (!user && currentScreen !== 'register') return <LoginScreen onNavigate={setCurrentScreen} onLoginSuccess={(u) => { setUser(u); setCurrentScreen('home'); }} />;
  if (currentScreen === 'register') return <RegisterScreen onNavigate={setCurrentScreen} onLoginSuccess={(u) => { setUser(u); setCurrentScreen('home'); }} />;
  if (currentScreen === 'evaluation') return <EvaluationScreen onNavigate={setCurrentScreen} />;

  return (
    <div className="w-full h-[100dvh] bg-uni-bg flex flex-col font-sans text-uni-text overflow-hidden relative">
      
      {/* Header */}
      <div className="h-16 md:h-20 min-h-[4rem] flex items-center px-4 md:px-6 justify-between bg-uni-bg/90 backdrop-blur-md z-30 border-b border-uni-border/30 shrink-0">
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
            <div className="w-9 h-9 rounded-full bg-uni-card border border-uni-border flex items-center justify-center hover:border-uni-primary transition cursor-pointer" onClick={() => { setUser(null); setCurrentScreen('login'); }}>
              <LogOut size={18} className="text-uni-muted hover:text-red-400"/>
            </div>
          </div>
      </div>

      {/* Container Principal */}
      <div className="flex-1 w-full h-full relative overflow-y-auto custom-scrollbar scroll-smooth">
        
        {/* Home */}
        {currentScreen === 'home' && (
          <div className="p-6 pb-24 max-w-3xl mx-auto w-full">
            <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 mb-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setCurrentScreen('chat')}>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 leading-tight max-w-[70%]">Tire dúvidas sobre <br/> suas disciplinas</h2>
                <button className="bg-white text-blue-700 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-md flex items-center gap-2">
                  <Sparkles size={16} /> Iniciar chat
                </button>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="absolute right-[-20px] bottom-[-30px] w-48 opacity-90 transition-transform group-hover:scale-110 group-hover:rotate-6" alt="Bot" />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-uni-muted mb-4 flex items-center gap-2 uppercase tracking-wider"><ShieldCheck size={14}/> Valide informações</h3>
              <div className="p-4 bg-uni-card border border-uni-border rounded-2xl flex items-center justify-between group cursor-pointer hover:border-uni-primary/50 transition" onClick={() => setCurrentScreen('chat')}>
                 <div>
                   <p className="text-white font-medium">Ajude outros alunos</p>
                   <p className="text-xs text-uni-muted">Responda perguntas rápidas sobre professores</p>
                 </div>
                 <ChevronDown className="-rotate-90 text-uni-muted" size={20}/>
              </div>
            </div>

            <button onClick={() => setCurrentScreen('evaluation')} className="w-full py-4 bg-uni-card border border-uni-border rounded-2xl text-center text-white font-medium hover:bg-uni-border transition shadow-sm">
              Avaliar uma Disciplina
            </button>
          </div>
        )}

        {/* Chat */}
        {currentScreen === 'chat' && (
          <div className="w-full max-w-4xl mx-auto min-h-full flex flex-col pb-32">
            <div className="flex-1 p-4 space-y-6">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`flex max-w-[95%] md:max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${msg.role === 'user' ? 'border-transparent bg-uni-primary text-white' : 'border-uni-border bg-uni-card text-uni-text'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full min-w-0">
                      <div className={`p-4 text-sm md:text-base leading-relaxed shadow-sm ${
                        msg.role === 'user' ? 'bg-uni-primary text-white rounded-2xl rounded-tr-sm' : 
                        msg.type === 'validation' ? 'bg-uni-card border border-uni-primary/30 rounded-2xl' :
                        'bg-uni-card text-uni-text border border-uni-border rounded-2xl rounded-tl-sm'
                      }`}>
                        
                        <ReactMarkdown 
                          className="prose prose-invert prose-sm max-w-none"
                          components={{
                            strong: ({node, ...props}) => <span className="font-bold text-blue-300" {...props} />
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>

                        {/* UI de Validação Especial */}
                        {msg.type === 'validation' && (
                          <div className="mt-4 pt-4 border-t border-uni-border flex gap-3 justify-center">
                             <button onClick={() => handleValidationResponse(msg.validationId, 'verdade')} className="flex-1 bg-green-500/10 text-green-400 border border-green-500/30 py-2 rounded-lg text-xs font-bold hover:bg-green-500/20 transition">É VERDADE</button>
                             <button onClick={() => handleValidationResponse(msg.validationId, 'fake')} className="flex-1 bg-red-500/10 text-red-400 border border-red-500/30 py-2 rounded-lg text-xs font-bold hover:bg-red-500/20 transition">É MITO</button>
                             <button onClick={() => handleValidationResponse(msg.validationId, 'skip')} className="px-4 text-uni-muted hover:text-white text-xs">Pular</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div className="ml-16"><Loader2 className="animate-spin text-uni-muted" /></div>}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {currentScreen === 'chat' && <ChatInput onSend={handleSendMessage} isLoading={isLoading} />}
    </div>
  );
}