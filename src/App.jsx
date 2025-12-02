import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, ArrowLeft, Loader2, Sparkles, ChevronDown, Check, X, Star, ShieldCheck, LogOut, Circle, ThumbsUp, ThumbsDown, MessageSquare, Clock, Filter, XCircle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc, getDoc, updateDoc, arrayUnion, where } from "firebase/firestore";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth, db;
try {
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.log("Modo Demo: Firebase não configurado.");
  }
} catch (e) { console.error("Erro Firebase:", e); }

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 

// --- DADOS PARA OS MENUS ---
const MOCK_SUBJECTS = ["Engenharia de Software", "Cálculo 1", "Física 3", "Algoritmos", "Ética", "Banco de Dados"];
const MOCK_PROFESSORS = ["Robson Correia", "Ana Paula", "Carlos Silva", "Fernanda Lima", "Roberto Santos"];
const MOCK_PERIODS = ["2024.1", "2023.2", "2023.1", "2022.2"];

const MOCK_VALIDATIONS = [
  { id: 1, text: "O professor Robson cobra presença em todas as aulas de Engenharia de Software?", subject: "Engenharia de Software" },
  { id: 2, text: "Dizem que a prova de Cálculo 1 permite consulta a uma folha A4. Confere?", subject: "Cálculo 1" },
  { id: 3, text: "É verdade que a disciplina de Ética não tem prova final, apenas trabalhos?", subject: "Ética" }
];

// --- COMPONENTES VISUAIS ---

const LogoUniHelp = ({ size = "normal" }) => {
  const isLarge = size === "large";
  return (
    <div className={`flex items-center gap-3 select-none ${isLarge ? 'scale-125' : ''}`}>
      <div className={`relative flex items-center justify-center bg-gradient-to-tr from-blue-600 to-cyan-400 text-white rounded-2xl shadow-lg shadow-blue-500/30 ${isLarge ? 'w-16 h-16 rounded-[1.2rem]' : 'w-10 h-10'}`}>
        <Bot size={isLarge ? 32 : 20} strokeWidth={2.5} />
        <div className="absolute inset-0 rounded-2xl bg-white/20 blur-[2px]" style={{ clipPath: 'inset(0 0 50% 0)' }}></div>
      </div>
      <span className={`font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white ${isLarge ? 'text-4xl' : 'text-xl'}`}>UniHelp</span>
    </div>
  );
};

const ChatFilters = ({ filters, setFilters, isOpen, setIsOpen }) => {
  const activeCount = Object.values(filters).filter(Boolean).length;
  return (
    <div className="absolute top-0 left-0 w-full z-20 px-4 pt-2">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="mx-auto flex items-center gap-2 bg-uni-card/80 backdrop-blur-md border border-uni-border px-4 py-1.5 rounded-full text-xs text-uni-muted hover:text-white hover:border-uni-primary transition shadow-lg">
          <Filter size={12} /> Filtros de Pesquisa {activeCount > 0 && <span className="bg-uni-primary text-white px-1.5 rounded-full text-[10px]">{activeCount}</span>}
        </button>
      )}
      {isOpen && (
        <div className="bg-uni-card/95 backdrop-blur-xl border border-uni-border/50 shadow-2xl rounded-2xl p-4 animate-fade-in-down mx-auto max-w-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Filter size={14} className="text-uni-primary"/> Filtrar Contexto da IA</h3>
            <button onClick={() => setIsOpen(false)} className="text-uni-muted hover:text-white"><X size={16}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { l: "Disciplina", k: "disciplina", op: MOCK_SUBJECTS },
              { l: "Professor", k: "professor", op: MOCK_PROFESSORS },
              { l: "Período", k: "periodo", op: MOCK_PERIODS }
            ].map(f => (
              <div key={f.k} className="space-y-1">
                <label className="text-[10px] uppercase text-uni-muted font-bold tracking-wider">{f.l}</label>
                <select value={filters[f.k]} onChange={(e) => setFilters(prev => ({...prev, [f.k]: e.target.value}))} className="w-full bg-uni-bg/50 border border-uni-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-uni-primary">
                  <option value="">Todos</option>
                  {f.op.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          {activeCount > 0 && (
            <button onClick={() => setFilters({ disciplina: '', professor: '', periodo: '' })} className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition">
              <XCircle size={14} /> Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ChatInput = ({ onSend, isLoading }) => {
  const [localText, setLocalText] = useState('');
  return (
    <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-uni-bg via-uni-bg/95 to-transparent z-20 pointer-events-none">
      <div className="max-w-3xl mx-auto flex items-center gap-3 bg-uni-card p-2 pr-2 pl-4 md:pl-6 rounded-full border border-uni-border/50 focus-within:border-uni-primary/50 transition-all shadow-2xl ring-1 ring-white/5 pointer-events-auto">
        <input type="text" value={localText} onChange={(e) => setLocalText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !isLoading && onSend(localText) && setLocalText('')} placeholder="Escrever..." className="flex-1 bg-transparent text-uni-text text-base outline-none placeholder:text-uni-muted/60 min-w-0" disabled={isLoading} autoFocus />
        <button onClick={() => { if(localText.trim()) { onSend(localText); setLocalText(''); } }} disabled={!localText.trim() || isLoading} className="p-3 md:p-3.5 rounded-full bg-uni-primary text-white shadow-lg hover:bg-uni-primary-dark disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center shrink-0">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
};

// --- FUNÇÃO DE RENDERIZAÇÃO PREMIUM (Estilo Perplexity/Gemini) ---
const renderContentWithSources = (text) => {
  // 1. Extrai todas as fontes usando Regex
  const sourceMatches = text.match(/\[ID:[a-zA-Z0-9]+\]/g) || [];
  
  // 2. Remove as tags do texto principal para a leitura ficar limpa e fluida
  const cleanText = text.replace(/\[ID:[a-zA-Z0-9]+\]/g, ''); 

  // 3. Remove duplicatas (caso a IA cite a mesma fonte 2x)
  const uniqueSources = [...new Set(sourceMatches.map(s => s.replace('[ID:', '').replace(']', '')))];

  return (
    <div className="flex flex-col">
      {/* Texto Principal (Limpo e Fluido) */}
      <ReactMarkdown 
        className="prose prose-invert prose-sm max-w-none break-words leading-relaxed text-gray-100"
        components={{
          p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          strong: ({node, ...props}) => <span className="font-bold text-blue-200" {...props} />
        }}
      >
        {cleanText}
      </ReactMarkdown>

      {/* Rodapé de Fontes (Só aparece se houver citações) */}
      {uniqueSources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10 animate-fade-in">
          <p className="text-[10px] text-uni-muted font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <ShieldCheck size={10} className="text-green-400" /> Fontes verificadas:
          </p>
          
          <div className="flex flex-wrap gap-2">
            {uniqueSources.map((id, idx) => (
              <button 
                key={idx}
                onClick={() => alert(`🔍 Detalhes da Avaliação:\n\nID no Banco: ${id}\n\n(Aqui abriria o modal com o texto completo do aluno)`)}
                className="
                  group flex items-center gap-1.5 
                  px-2.5 py-1.5 
                  bg-uni-bg/40 border border-uni-border/50 hover:border-uni-primary/50 
                  rounded-lg transition-all duration-200
                  hover:bg-uni-primary/10 active:scale-95
                "
              >
                <div className="w-1.5 h-1.5 rounded-full bg-uni-primary group-hover:bg-cyan-400 transition-colors"></div>
                <span className="text-[11px] text-uni-muted group-hover:text-white font-medium">
                  Avaliação #{idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- TELAS (Login, Cadastro, Avaliação, Lista de Chats) ---
// (Mantidas iguais para economizar espaço, lógica principal está no App abaixo)

const LoginScreen = ({ onNavigate, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = async () => {
      setLoading(true);
      try {
        if (auth) { await signInWithEmailAndPassword(auth, email, password); } 
        else { if(email && password) setTimeout(() => onLoginSuccess({ email }), 1000); else { alert("Preencha campos"); setLoading(false); } }
      } catch (err) { alert("Erro: " + err.message); setLoading(false); }
    };
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-uni-bg p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="mb-12"><LogoUniHelp size="large" /></div>
          <div className="w-full space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
            <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-uni-primary rounded-xl text-white font-bold mt-4 flex justify-center hover:scale-[1.02] transition-transform">{loading ? <Loader2 className="animate-spin" /> : "Entrar"}</button>
            <button onClick={() => onNavigate('register')} className="text-uni-muted text-sm hover:text-white w-full text-center mt-4">Criar conta</button>
          </div>
        </div>
      </div>
    );
};
const RegisterScreen = ({ onNavigate, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleRegister = async () => {
      setLoading(true);
      if (auth) { try { await createUserWithEmailAndPassword(auth, email, password); } catch(e) { alert("Erro: " + e.message); setLoading(false); } } 
      else { setTimeout(() => onLoginSuccess({ email }), 1000); }
    };
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-uni-bg p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-8"><LogoUniHelp size="large" /></div>
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Criar conta</h1>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
              <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
              <button onClick={handleRegister} disabled={loading} className="w-full py-4 bg-uni-primary rounded-xl text-white font-bold mt-4 flex justify-center hover:scale-[1.02] transition-transform">{loading ? <Loader2 className="animate-spin" /> : "Cadastrar"}</button>
              <button onClick={() => onNavigate('login')} className="w-full text-uni-muted text-sm hover:text-white text-center mt-4">Voltar ao Login</button>
            </div>
          </div>
        </div>
    );
};
const EvaluationScreen = ({ onNavigate }) => {
    const [formData, setFormData] = useState({ disciplina: '', professor: '', periodo: '', explicacaoClara: null, avaliacoesAlinhadas: null, opiniaoGeral: '' });
    const [enviado, setEnviado] = useState(false);
    const handleSubmit = async () => {
      if (!formData.disciplina || !formData.professor) return alert("Preencha os campos!");
      if (db) { try { await addDoc(collection(db, "avaliacoes"), { ...formData, data: new Date(), userId: auth?.currentUser?.uid || 'anon' }); } catch (e) { return; } }
      setEnviado(true); setTimeout(() => { setEnviado(false); onNavigate('home'); }, 2000);
    };
    if (enviado) return (<div className="w-full h-full flex flex-col items-center justify-center bg-uni-bg"><div className="w-24 h-24 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mb-6"><Check size={48} className="text-green-500" /></div><h2 className="text-3xl font-bold text-white">Avaliação Enviada!</h2></div>);
    return (
      <div className="w-full h-full flex flex-col bg-uni-bg relative">
        <div className="p-6 border-b border-uni-border flex items-center justify-between sticky top-0 bg-uni-bg/95 backdrop-blur-md z-30">
          <button onClick={() => onNavigate('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full"><ArrowLeft className="text-white" /></button>
          <h1 className="text-lg font-bold text-white absolute left-1/2 transform -translate-x-1/2">Avaliar</h1><div className="w-8" />
        </div>
        <div className="flex-1 w-full relative overflow-y-auto custom-scrollbar p-6 space-y-6 pb-32 max-w-2xl mx-auto">
              {[ { l: "Disciplina", k: "disciplina", o: MOCK_SUBJECTS }, { l: "Professor", k: "professor", o: MOCK_PROFESSORS }, { l: "Período", k: "periodo", o: MOCK_PERIODS } ].map(f => (
                <div key={f.k} className="space-y-2 bg-uni-card/30 p-4 rounded-xl border border-uni-border/50">
                  <label className="text-xs font-bold text-uni-muted ml-1 uppercase">{f.l}</label>
                  <select value={formData[f.k]} onChange={e => setFormData({...formData, [f.k]: e.target.value})} className="w-full bg-uni-card border border-uni-border rounded-lg px-4 py-3 text-white outline-none focus:border-uni-primary"><option value="">Selecionar</option>{f.o.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                </div>
              ))}
              <div className="space-y-2 bg-uni-card/30 p-4 rounded-xl border border-uni-border/50">
                <label className="text-xs font-bold text-uni-muted ml-1 uppercase">Opinião Geral</label>
                <textarea value={formData.opiniaoGeral} onChange={e => setFormData({...formData, opiniaoGeral: e.target.value})} className="w-full bg-uni-card border border-uni-border rounded-lg px-4 py-3 text-white h-32 resize-none outline-none focus:border-uni-primary"></textarea>
              </div>
              <button onClick={handleSubmit} className="w-full py-4 bg-white text-uni-bg font-bold rounded-xl shadow-lg">Enviar Avaliação</button>
        </div>
      </div>
    );
};
const ChatsListScreen = ({ onNavigate, onLoadChat }) => {
    const [chats, setChats] = useState([]);
    useEffect(() => { const f = async () => { if(db && auth?.currentUser) { const q = query(collection(db, "chats"), where("userId", "==", auth.currentUser.uid), orderBy("lastMessageAt", "desc")); const s = await getDocs(q); setChats(s.docs.map(d => ({id:d.id, ...d.data()}))); }}; f(); }, []);
    return (
      <div className="w-full h-full flex flex-col bg-uni-bg relative">
        <div className="p-6 border-b border-uni-border flex items-center justify-between sticky top-0 bg-uni-bg/95 backdrop-blur-md z-30"><button onClick={() => onNavigate('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full"><ArrowLeft className="text-white" /></button><h1 className="text-lg font-bold text-white absolute left-1/2 transform -translate-x-1/2">Chats</h1><div className="w-8"/></div>
        <div className="flex-1 w-full relative overflow-y-auto custom-scrollbar p-4 space-y-2">
          {chats.map(c => <button key={c.id} onClick={() => onLoadChat(c.messages)} className="w-full p-4 bg-uni-card/50 hover:bg-uni-card border border-uni-border/50 rounded-xl flex items-center gap-4 text-left"><div className="w-10 h-10 rounded-full bg-uni-primary/20 flex items-center justify-center"><Bot size={20} className="text-uni-primary"/></div><div className="flex-1 truncate"><p className="text-white font-medium truncate">{c.messages[1]?.text || "Chat"}</p><p className="text-xs text-uni-muted">{new Date(c.lastMessageAt?.toDate()).toLocaleDateString()}</p></div></button>)}
        </div>
      </div>
    );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); 
  const [chatHistory, setChatHistory] = useState([ { role: 'model', text: 'Olá! Sou o UniHelp. Posso tirar dúvidas usando as avaliações reais dos alunos.', feedback: null } ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  // ESTADOS DE FILTRO
  const [searchFilters, setSearchFilters] = useState({ disciplina: '', professor: '', periodo: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (auth) { const u = onAuthStateChanged(auth, (usr) => { if (usr) { setUser(usr); setCurrentScreen('home'); } else { setUser(null); setCurrentScreen('login'); } }); return () => u(); } 
    else { setCurrentScreen('login'); }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory.length, currentScreen, filtersOpen]);

  // --- FETCH KNOWLEDGE (Com Filtros + ID para Citações) ---
  const fetchKnowledge = async () => {
    if (!db) return "";
    try {
      let q = collection(db, "avaliacoes");
      let constraints = [];
      if (searchFilters.disciplina) constraints.push(where("disciplina", "==", searchFilters.disciplina));
      if (searchFilters.professor) constraints.push(where("professor", "==", searchFilters.professor));
      if (searchFilters.periodo) constraints.push(where("periodo", "==", searchFilters.periodo));
      constraints.push(limit(10));

      const finalQuery = query(q, ...constraints);
      const querySnapshot = await getDocs(finalQuery);
      if (querySnapshot.empty) return "";

      let knowledgeBase = "";
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // AQUI ESTÁ A MÁGICA DA CITAÇÃO: Inserimos o ID no texto enviado para a IA
        knowledgeBase += `ID_DA_FONTE: ${doc.id} | CONTEÚDO: "${data.opiniaoGeral}" (Matéria: ${data.disciplina}, Prof: ${data.professor})\n`;
      });
      return knowledgeBase;
    } catch (error) { 
      if(error.code === 'failed-precondition') alert("DEV: Crie o índice no Firestore (Link no Console)");
      return ""; 
    }
  };

  const saveChat = async (newMessages) => {
    if (!db || !user) return;
    try {
      const data = { userId: user.uid, messages: newMessages, lastMessageAt: new Date() };
      if (currentChatId) await updateDoc(doc(db, "chats", currentChatId), { messages: newMessages, lastMessageAt: new Date() });
      else { const docRef = await addDoc(collection(db, "chats"), data); setCurrentChatId(docRef.id); }
    } catch (e) { console.error(e); }
  };

const handleSendMessage = async (text) => {
    // 1. STATE UPLIFTING: Salva mensagem do usuário
    const newUserMessage = { role: 'user', text, feedback: null };
    const historyWithUser = [...chatHistory, newUserMessage];
    
    setChatHistory(historyWithUser);
    saveChat(historyWithUser);
    setIsLoading(true);

    try {
      if (!GEMINI_API_KEY) throw new Error("API Key ausente");

      // 2. Busca dados específicos no banco (RAG)
      const knowledge = await fetchKnowledge();
      const today = new Date().toLocaleDateString('pt-BR');
      
      // Cria texto dos filtros para a IA entender o contexto
      const activeFiltersText = Object.values(searchFilters).filter(Boolean).join(', ');

      // --- A MÁGICA DO RAG HÍBRIDO ESTÁ AQUI ---
      const systemInstruction = `
        Você é o UniHelp, um assistente acadêmico universitário experiente.
        Hoje é ${today}.
        ${activeFiltersText ? `O aluno está filtrando por: ${activeFiltersText}.` : ''}

        === DADOS DO BANCO DA UNIVERSIDADE (Prioridade Máxima) ===
        ${knowledge ? knowledge : "Não há dados específicos sobre isso no banco de avaliações agora."}
        
        === SUAS INSTRUÇÕES DE COMPORTAMENTO ===
        1. **Analise a pergunta:**
           - Se for sobre algo específico da faculdade (ex: "Como é o Prof. Robson?", "Cai prova na matéria tal?"), use **EXCLUSIVAMENTE** os "DADOS DO BANCO" acima. Se não tiver a info, diga que não sabe.
           - Se for uma dúvida conceitual ou geral (ex: "O que se estuda em Engenharia de Software?", "Dicas de estudo", "Explique Scrum"), use seu **próprio conhecimento** de IA para ajudar o aluno, mesmo que não esteja no banco.

        2. **Estilo de Resposta:**
           - Seja didático, jovem e universitário.
           - Use Emojis 🎓🚀.
           - Se usar uma informação que veio do banco de dados, você **DEVE** citar a fonte no final da frase usando [ID:codigo]. Se for conhecimento geral seu, não precisa citar ID.
      `;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemInstruction}\n\nHistórico da conversa:\n${historyWithUser.map(m => `${m.role}: ${m.text}`).join('\n')}\n\nAluno pergunta: ${text}` }] }] })
      });

      const data = await response.json();
      
      if(data.error) throw new Error(data.error.message);

      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao processar resposta.";
      
      // 3. Salva resposta da IA
      const finalHistory = [...historyWithUser, { role: 'model', text: botResponse, feedback: null }];
      
      setChatHistory(finalHistory);
      saveChat(finalHistory);
      
      // Validação aleatória (mantida)
      if (Math.random() > 0.7) setTimeout(() => {
         const v = MOCK_VALIDATIONS[Math.floor(Math.random() * MOCK_VALIDATIONS.length)];
         setChatHistory(prev => [...prev, { role: 'model', text: `🤔 **Ajude a comunidade:**\n\n"${v.text}"`, type: 'validation', validationId: v.id }]);
      }, 1500);

    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', text: '⚠️ Tive um problema de conexão. Tente novamente.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationResponse = async (id, r) => { if(db) try{ await addDoc(collection(db, "validacoes"), { id, r, date: new Date() }); }catch(e){} setChatHistory(prev=>[...prev,{role:'model',text:'✅ Obrigado!',type:'text'}]); };
  const handleFeedback = (i, t) => setChatHistory(prev => prev.map((m, idx) => idx === i ? { ...m, feedback: t } : m));
  const handleLogout = () => { if(auth) signOut(auth); setUser(null); setCurrentScreen('login'); setMobileMenuOpen(false); setCurrentChatId(null); setChatHistory([{ role: 'model', text: 'Olá!', feedback: null }]); };
  const startNewChat = () => { setCurrentChatId(null); setChatHistory([{ role: 'model', text: 'Como posso ajudar?', feedback: null }]); setCurrentScreen('chat'); };

  if (!user && currentScreen === 'login') return <LoginScreen onNavigate={setCurrentScreen} onLoginSuccess={(u) => { setUser(u); setCurrentScreen('home'); }} />;
  if (!user && currentScreen === 'register') return <RegisterScreen onNavigate={setCurrentScreen} onLoginSuccess={(u) => { setUser(u); setCurrentScreen('home'); }} />;
  if (currentScreen === 'evaluation') return <EvaluationScreen onNavigate={setCurrentScreen} />;
  if (currentScreen === 'chats') return <ChatsListScreen onNavigate={setCurrentScreen} onLoadChat={(m) => {setChatHistory(m); setCurrentScreen('chat');}} />;

  return (
    <div className="w-full h-[100dvh] bg-uni-bg flex flex-col font-sans text-uni-text overflow-hidden relative">
      {mobileMenuOpen && ( <div className="fixed inset-0 z-50 flex"><div className="absolute inset-0 bg-black/50" onClick={()=>setMobileMenuOpen(false)}></div><div className="relative w-64 bg-uni-card h-full p-6 flex flex-col border-r border-uni-border"><div className="mb-8"><LogoUniHelp/></div><div className="space-y-2 flex-1"><button onClick={()=>{setCurrentScreen('home');setMobileMenuOpen(false)}} className="w-full text-left p-3 rounded-xl hover:bg-uni-border text-white flex gap-3"><Bot/> Início</button><button onClick={()=>{setCurrentScreen('chats');setMobileMenuOpen(false)}} className="w-full text-left p-3 rounded-xl hover:bg-uni-border text-white flex gap-3"><MessageSquare/> Chats</button><button onClick={()=>{setCurrentScreen('evaluation');setMobileMenuOpen(false)}} className="w-full text-left p-3 rounded-xl hover:bg-uni-border text-white flex gap-3"><Star/> Avaliar</button></div><button onClick={handleLogout} className="w-full text-left p-3 rounded-xl hover:bg-red-500/20 text-red-400 flex gap-3 mt-auto"><LogOut/> Sair</button></div></div> )}
      
      <div className="h-16 md:h-20 flex items-center px-4 justify-between bg-uni-bg/90 backdrop-blur-md z-30 border-b border-uni-border/30 shrink-0">
          <div className="w-10">{currentScreen==='chat'?<button onClick={()=>setCurrentScreen('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full"><ArrowLeft className="text-white"/></button>:<button onClick={()=>setMobileMenuOpen(true)} className="p-2 -ml-2 hover:bg-uni-card rounded-full"><Menu className="text-white"/></button>}</div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"><LogoUniHelp/></div>
          <div className="w-10 flex justify-end"><div className="w-9 h-9 rounded-full bg-uni-card border border-uni-border flex items-center justify-center cursor-pointer" onClick={handleLogout}><User size={18} className="text-uni-muted"/></div></div>
      </div>

      <div className="flex-1 w-full h-full relative overflow-y-auto custom-scrollbar scroll-smooth">
        {currentScreen === 'home' && (
          <div className="p-6 pb-24 max-w-3xl mx-auto w-full">
            <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 mb-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer hover:scale-[1.01] transition" onClick={startNewChat}>
              <div className="relative z-10"><h2 className="text-2xl font-bold mb-6 max-w-[70%]">Tire dúvidas sobre <br/> suas disciplinas</h2><button className="bg-white text-blue-700 px-6 py-2.5 rounded-full font-bold text-sm flex gap-2"><Sparkles size={16}/> Iniciar chat</button></div>
              <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="absolute right-[-20px] bottom-[-30px] w-48 opacity-90 transition group-hover:scale-110 group-hover:rotate-6" alt="Bot"/>
            </div>
            <div className="mb-6"><h3 className="text-sm font-bold text-uni-muted mb-4 flex items-center gap-2 uppercase tracking-wider"><ShieldCheck size={14}/> Valide informações</h3><div className="p-4 bg-uni-card border border-uni-border rounded-2xl flex items-center justify-between group cursor-pointer hover:border-uni-primary/50 transition" onClick={startNewChat}><div><p className="text-white font-medium">Ajude outros alunos</p><p className="text-xs text-uni-muted">Responda perguntas rápidas</p></div><ChevronDown className="-rotate-90 text-uni-muted"/></div></div>
            <button onClick={() => setCurrentScreen('evaluation')} className="w-full py-4 bg-uni-card border border-uni-border rounded-2xl text-white font-medium hover:bg-uni-border transition">Avaliar uma Disciplina</button>
          </div>
        )}

        {currentScreen === 'chat' && (
          <div className="w-full max-w-4xl mx-auto min-h-full flex flex-col pb-32 relative">
            <ChatFilters filters={searchFilters} setFilters={setSearchFilters} isOpen={filtersOpen} setIsOpen={setFiltersOpen} />
            <div className={`flex-1 p-4 space-y-6 pt-12 transition-all ${filtersOpen ? 'mt-40 md:mt-24' : 'mt-0'}`}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`flex max-w-[95%] md:max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${msg.role === 'user' ? 'border-transparent bg-uni-primary text-white' : 'border-uni-border bg-uni-card text-uni-text'}`}>{msg.role === 'user' ? <User size={16}/> : <Bot size={18}/>}</div>
                    <div className="flex flex-col gap-2 w-full min-w-0">
                      <div className={`p-4 text-sm md:text-base leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-uni-primary text-white rounded-2xl rounded-tr-sm' : msg.type==='validation'?'bg-uni-card border border-uni-primary/30 rounded-2xl':'bg-uni-card text-uni-text border border-uni-border rounded-2xl rounded-tl-sm'}`}>
                        {/* AQUI RENDERIZAMOS O TEXTO COM OS BOTÕES DE FONTE SE FOR MODELO, OU MARKDOWN NORMAL SE FOR USUARIO */}
                        {msg.role === 'model' && msg.type !== 'validation' ? renderContentWithSources(msg.text) : <ReactMarkdown className="prose prose-invert prose-sm" components={{ p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} /> }}>{msg.text}</ReactMarkdown>}
                        
                        {msg.type === 'validation' && (<div className="mt-4 pt-4 border-t border-uni-border flex gap-3 justify-center"><button onClick={()=>handleValidationResponse(msg.validationId,'verdade')} className="flex-1 bg-green-500/10 text-green-400 border border-green-500/30 py-2 rounded-lg text-xs font-bold hover:bg-green-500/20">É VERDADE</button><button onClick={()=>handleValidationResponse(msg.validationId,'fake')} className="flex-1 bg-red-500/10 text-red-400 border border-red-500/30 py-2 rounded-lg text-xs font-bold hover:bg-red-500/20">É MITO</button></div>)}
                      </div>
                      {msg.role === 'model' && msg.type !== 'validation' && !msg.isError && idx > 0 && (<div className="flex gap-2">{msg.feedback === 'yes' ? (<div className="text-xs text-uni-primary flex items-center gap-1 font-bold"><Check size={14}/> Obrigado!</div>) : msg.feedback === 'no' ? (<div className="text-xs text-uni-muted flex gap-1">Anotado.</div>) : (<><button onClick={()=>handleFeedback(idx,'yes')} className="p-1.5 rounded-full hover:bg-uni-border text-uni-muted hover:text-green-400 transition"><ThumbsUp size={16}/></button><button onClick={()=>handleFeedback(idx,'no')} className="p-1.5 rounded-full hover:bg-uni-border text-uni-muted hover:text-red-400 transition"><ThumbsDown size={16}/></button></>)}</div>)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div className="ml-16"><Loader2 className="animate-spin text-uni-muted"/></div>}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>
      {currentScreen === 'chat' && <ChatInput onSend={handleSendMessage} isLoading={isLoading} />}
    </div>
  );
}