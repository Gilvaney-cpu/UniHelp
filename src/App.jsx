import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, ArrowLeft, Loader2, Sparkles, ChevronDown, Check, X, Star, ShieldCheck, LogOut, Circle, ThumbsUp, ThumbsDown, MessageSquare, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc, getDoc, updateDoc, arrayUnion, where, serverTimestamp } from "firebase/firestore";

// --- CONFIGURAÇÃO DO FIREBASE (HÍBRIDA) ---
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
} catch (e) { 
  console.error("Erro ao inicializar Firebase:", e); 
}

// --- CONFIGURAÇÃO DA API GEMINI ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 

// --- DADOS ENRIQUECIDOS (CONTEXTO BASE) ---
const SUBJECTS_INFO = {
  "Engenharia de Software": "Foco em ciclo de vida de software, metodologias ágeis (Scrum, Kanban) e UML. Professor Robson costuma cobrar projeto prático em grupo.",
  "Cálculo 1": "Limites, Derivadas e Integrais. Historicamente tem alto índice de reprovação. A dica é fazer muitos exercícios do livro do Stewart.",
  "Física 3": "Eletromagnetismo. Aulas práticas de laboratório são essenciais para a nota. Professor Carlos é exigente com relatórios.",
  "Algoritmos": "Lógica de programação, estruturas de dados básicas (vetores, matrizes). Base para todo o curso.",
  "Ética": "Discussões sobre impacto social da tecnologia, LGPD e responsabilidade profissional. Avaliação geralmente por seminários.",
  "Banco de Dados": "Modelagem ER, SQL e NoSQL. Projeto final costuma ser a criação de um banco completo para um sistema."
};

const PROFESSORS_INFO = {
  "Robson Correia": "Didática prática, valoriza participação. Gosta de exemplos do mercado de trabalho. Provas justas, mas exige estudo.",
  "Ana Paula": "Muito teórica, cobra detalhes dos slides. É importante não faltar, pois ela passa dicas exclusivas em sala.",
  "Carlos Silva": "Rigoroso com horários e prazos. Suas listas de exercícios são difíceis, mas preparam bem para a prova.",
  "Fernanda Lima": "Acessível e paciente. Costuma dar pontos extras por atividades em sala.",
  "Roberto Santos": "Especialista na área, mas suas aulas podem ser densas. Recomenda-se gravar o áudio para revisar depois."
};

const MOCK_VALIDATIONS = [
  { id: 1, text: "O professor Robson cobra presença em todas as aulas de Engenharia de Software?", subject: "Engenharia de Software" },
  { id: 2, text: "Dizem que a prova de Cálculo 1 permite consulta a uma folha A4. Confere?", subject: "Cálculo 1" },
  { id: 3, text: "É verdade que a disciplina de Ética não tem prova final, apenas trabalhos?", subject: "Ética" }
];

// --- COMPONENTES ---

const LogoUniHelp = ({ className = "h-12" }) => (
  <div className="flex items-center gap-2 animate-fade-in">
    <img 
      src="/logo.png" 
      alt="UniHelp" 
      className={`object-contain ${className} bg-transparent`} 
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
    <div className="hidden items-center gap-2 text-white font-bold text-xl">
       <Bot className="text-uni-primary" /> UniHelp
    </div>
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
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if(email && password) setTimeout(() => onLoginSuccess({ email }), 1000);
        else { alert("Preencha os campos (Modo Demo)"); setLoading(false); }
      }
    } catch (err) { 
      alert("Erro no login: " + err.message); 
      setLoading(false); 
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-uni-bg overflow-y-auto custom-scrollbar p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8 scale-150"><LogoUniHelp className="h-16" /></div>
        <div className="w-full space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
          <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-uni-primary rounded-xl text-white font-bold shadow-lg mt-4 flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Entrar"}
          </button>
          <button onClick={() => onNavigate('register')} className="text-uni-muted text-sm hover:text-white transition w-full text-center">Criar conta</button>
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
    if (auth) {
      try { 
        await createUserWithEmailAndPassword(auth, email, password); 
      } catch(e) {
        alert("Erro ao cadastrar: " + e.message);
        setLoading(false);
      }
    } else {
        setTimeout(() => onLoginSuccess({ email }), 1000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-uni-bg overflow-y-auto custom-scrollbar p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Criar Conta</h1>
        <div className="space-y-4">
          <input type="text" placeholder="Nome" className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-uni-card border border-uni-border rounded-xl p-4 text-white outline-none focus:border-uni-primary" />
          <button onClick={handleRegister} disabled={loading} className="w-full py-4 bg-uni-primary rounded-xl text-white font-bold shadow-lg mt-4 flex justify-center">
             {loading ? <Loader2 className="animate-spin" /> : "Cadastrar"}
          </button>
          <button onClick={() => onNavigate('login')} className="w-full text-uni-muted text-sm hover:text-white transition text-center">Voltar para Login</button>
        </div>
      </div>
    </div>
  );
};

const EvaluationScreen = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    disciplina: '', professor: '', periodo: '', explicacaoClara: null, avaliacoesAlinhadas: null, opiniaoGeral: ''
  });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async () => {
    if (!formData.disciplina || !formData.professor || !formData.periodo) return alert("Preencha os campos obrigatórios!");
    
    if (db) {
      try {
        await addDoc(collection(db, "avaliacoes"), {
          ...formData,
          data: serverTimestamp(),
          userId: auth?.currentUser?.uid || 'anon'
        });
      } catch (e) { 
        console.error("Erro ao salvar:", e);
        alert("Erro ao salvar a avaliação.");
        return;
      }
    }
    
    setEnviado(true);
    setTimeout(() => { setEnviado(false); onNavigate('home'); }, 2000);
  };

  if (enviado) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-uni-bg animate-fade-in">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4"><Check size={40} className="text-green-500" /></div>
      <h2 className="text-2xl font-bold text-white">Avaliação Recebida!</h2>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-uni-bg relative">
      <div className="p-6 border-b border-uni-border flex items-center justify-between sticky top-0 bg-uni-bg/95 backdrop-blur-md z-30">
        <button onClick={() => onNavigate('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full transition"><ArrowLeft className="text-white" /></button>
        <h1 className="text-lg font-bold text-white absolute left-1/2 transform -translate-x-1/2">Avaliar</h1>
        <div className="w-8" />
      </div>
      
      <div className="flex-1 w-full relative overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6 pb-32 max-w-2xl mx-auto w-full">
            {[
              { label: "Disciplina", key: "disciplina", options: Object.keys(SUBJECTS_INFO) },
              { label: "Professor", key: "professor", options: Object.keys(PROFESSORS_INFO) },
              { label: "Período em que cursou", key: "periodo", options: ["2024.1", "2023.2", "2023.1", "2022.2"] }
            ].map((field) => (
              <div key={field.key} className="space-y-2 bg-uni-card/50 p-4 rounded-xl border border-uni-border/50">
                <label className="text-xs font-bold text-uni-muted ml-1 uppercase tracking-wide">{field.label}</label>
                <div className="relative">
                  <select value={formData[field.key]} onChange={e => setFormData({...formData, [field.key]: e.target.value})} className="w-full bg-uni-card border border-uni-border rounded-lg px-4 py-3 text-uni-text outline-none appearance-none cursor-pointer focus:border-uni-primary transition">
                    <option value="">Selecionar</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-uni-muted pointer-events-none" size={18} />
                </div>
              </div>
            ))}
            {[
              { label: "O professor explica os conteúdos da aula de forma clara?", key: "explicacaoClara" },
              { label: "As avaliações (provas, atividades) estão alinhados com o que foi ensinado.", key: "avaliacoesAlinhadas" }
            ].map((q) => (
              <div key={q.key} className="bg-uni-card/50 p-5 rounded-xl border border-uni-border/50 space-y-4">
                <p className="text-sm font-medium text-white">{q.label}</p>
                <div className="flex items-center gap-8 px-2">
                   {['sim', 'nao'].map(opt => (
                     <div key={opt} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFormData({...formData, [q.key]: opt})}>
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${formData[q.key] === opt ? 'border-uni-primary bg-uni-primary' : 'border-uni-muted group-hover:border-white'}`}>
                          {formData[q.key] === opt && <Check size={14} className="text-white" />}
                       </div>
                       <span className={`text-sm capitalize ${formData[q.key] === opt ? 'text-white' : 'text-uni-muted group-hover:text-white'}`}>{opt === 'nao' ? 'Não' : 'Sim'}</span>
                     </div>
                   ))}
                </div>
              </div>
            ))}
            <div className="space-y-2 bg-uni-card/50 p-4 rounded-xl border border-uni-border/50">
              <label className="text-xs font-bold text-uni-muted ml-1 uppercase">No geral, como você avalia a disciplina?</label>
              <textarea value={formData.opiniaoGeral} onChange={e => setFormData({...formData, opiniaoGeral: e.target.value})} placeholder="Escreva aqui..." className="w-full bg-uni-card border border-uni-border rounded-lg px-4 py-3 text-white h-32 resize-none outline-none focus:border-uni-primary transition placeholder:text-uni-muted/50"></textarea>
            </div>
            <button onClick={handleSubmit} className="w-full py-4 bg-white text-uni-bg font-bold rounded-xl hover:bg-gray-200 transition shadow-lg active:scale-[0.98]">Enviar Avaliação</button>
          </div>
      </div>
    </div>
  );
};

const ChatsListScreen = ({ onNavigate, onLoadChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      if (!db || !auth?.currentUser) { setLoading(false); return; }
      try {
        const q = query(collection(db, "chats"), where("userId", "==", auth.currentUser.uid), orderBy("lastMessageAt", "desc"));
        const snap = await getDocs(q);
        setChats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchChats();
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-uni-bg relative">
      <div className="p-6 border-b border-uni-border flex items-center justify-between sticky top-0 bg-uni-bg/95 backdrop-blur-md z-30">
        <button onClick={() => onNavigate('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full transition"><ArrowLeft className="text-white" /></button>
        <h1 className="text-lg font-bold text-white absolute left-1/2 transform -translate-x-1/2">Meus Chats</h1>
        <div className="w-8" />
      </div>
      <div className="flex-1 w-full relative overflow-y-auto custom-scrollbar p-4">
        {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-uni-primary" /></div> : 
         chats.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-uni-muted"><MessageSquare size={48} className="mb-4 opacity-50" /><p>Nenhum chat encontrado.</p></div> : 
         <div className="space-y-2">{chats.map(chat => (
            <button key={chat.id} onClick={() => onLoadChat(chat.messages, chat.id)} className="w-full p-4 bg-uni-card/50 hover:bg-uni-card border border-uni-border/50 rounded-xl flex items-center gap-4 transition">
              <div className="w-10 h-10 rounded-full bg-uni-primary/20 flex items-center justify-center"><Bot size={20} className="text-uni-primary" /></div>
              <div className="flex-1 text-left truncate"><p className="text-white font-medium truncate">{chat.messages[1]?.text || "Nova conversa"}</p><p className="text-xs text-uni-muted flex items-center gap-1"><Clock size={12} /> {chat.lastMessageAt?.seconds ? new Date(chat.lastMessageAt.toDate()).toLocaleDateString() : 'Hoje'}</p></div>
            </button>
         ))}</div>}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); 
  const [chatHistory, setChatHistory] = useState([{ role: 'model', text: 'Olá! Sou o UniHelp. Como posso te ajudar hoje?', feedback: null }]);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (auth) {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) { setUser(u); setCurrentScreen('home'); } else { setUser(null); setCurrentScreen('login'); }
      });
      return () => unsub();
    } else { setCurrentScreen('login'); }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory.length, currentScreen]);

  // Busca conhecimento no Firebase + Dados Estáticos (Enriquecimento)
  const fetchKnowledge = async () => {
    let knowledgeBase = "INFORMAÇÕES GERAIS DAS DISCIPLINAS E PROFESSORES:\n";
    
    // Adiciona dados estáticos enriquecidos
    for (const [subj, desc] of Object.entries(SUBJECTS_INFO)) knowledgeBase += `- Disciplina ${subj}: ${desc}\n`;
    for (const [prof, desc] of Object.entries(PROFESSORS_INFO)) knowledgeBase += `- Professor ${prof}: ${desc}\n`;

    if (!db) return knowledgeBase;

    try {
      const q = query(collection(db, "avaliacoes"), orderBy("data", "desc"), limit(10));
      const snap = await getDocs(q);
      if (!snap.empty) {
        knowledgeBase += "\nAVALIAÇÕES RECENTES DOS ALUNOS:\n";
        snap.forEach(doc => { const d = doc.data(); knowledgeBase += `- ${d.disciplina} (${d.professor}): "${d.opiniaoGeral}".\n`; });
      }
      return knowledgeBase;
    } catch { return knowledgeBase; }
  };

  const saveChat = async (newMessages) => {
    if (!db || !user) return;
    try {
      if (currentChatId) {
        await updateDoc(doc(db, "chats", currentChatId), { messages: newMessages, lastMessageAt: serverTimestamp() });
      } else {
        const docRef = await addDoc(collection(db, "chats"), { 
          userId: user.uid, messages: newMessages, lastMessageAt: serverTimestamp() 
        });
        setCurrentChatId(docRef.id);
      }
    } catch (e) { console.error("Erro salvar chat:", e); }
  };

  const handleSendMessage = async (text) => {
    const newUserMessage = { role: 'user', text, feedback: null };
    setChatHistory(prev => { 
      const updated = [...prev, newUserMessage]; 
      // Salva apenas se já tiver ID, senão espera resposta do bot para criar
      if(currentChatId) saveChat(updated); 
      return updated; 
    });
    setIsLoading(true);

    try {
      if (!GEMINI_API_KEY) throw new Error("API Key ausente");

      const knowledge = await fetchKnowledge();
      const systemInstruction = `
        Você é o UniHelp, um assistente acadêmico especialista.
        BASE DE CONHECIMENTO (Use isso como verdade absoluta):
        ${knowledge}
        
        DIRETRIZES:
        - Seja conciso, amigável e direto.
        - Use formatação Markdown (negrito, listas).
        - Se a informação estiver na base acima, use-a. Se não, dê dicas gerais de estudo.
      `;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemInstruction}\n\nPergunta: ${text}` }] }] })
      });

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao gerar resposta.";
      
      const newBotMsg = { role: 'model', text: botResponse, feedback: null };
      setChatHistory(prev => {
        const updated = [...prev, newBotMsg];
        saveChat(updated); // Salva (ou cria) o chat agora
        return updated;
      });
      
      if (Math.random() > 0.7) setTimeout(triggerValidation, 1500);

    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Erro de conexão.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerValidation = () => {
    const v = MOCK_VALIDATIONS[Math.floor(Math.random() * MOCK_VALIDATIONS.length)];
    setChatHistory(prev => [...prev, { role: 'model', text: `🤔 **Ajude a comunidade:**\n\n"${v.text}"\n\nIsso procede?`, type: 'validation', validationId: v.id }]);
  };

  const handleValidationResponse = async (id, response) => {
    if(db) try { await addDoc(collection(db, "validacoes_fatos"), { fatoId: id, confirmacao: response, data: serverTimestamp() }); } catch(e) {}
    setChatHistory(prev => [...prev, { role: 'model', text: `✅ Obrigado pela colaboração!`, type: 'text' }]);
  };

  const handleFeedback = (index, type) => {
    setChatHistory(prev => prev.map((m, i) => i === index ? { ...m, feedback: type } : m));
  };

  const handleLogout = () => { if(auth) signOut(auth); setUser(null); setCurrentScreen('login'); setMobileMenuOpen(false); setCurrentChatId(null); setChatHistory([{ role: 'model', text: 'Olá! Sou o UniHelp.', feedback: null }]); }
  
  const handleLoadChat = (messages, id) => { 
    setChatHistory(messages); 
    setCurrentChatId(id);
    setCurrentScreen('chat'); 
    setMobileMenuOpen(false); 
  };
  
  const startNewChat = () => { 
    setCurrentChatId(null); 
    setChatHistory([{ role: 'model', text: 'Olá! Sou o UniHelp. Como posso ajudar?', feedback: null }]); 
    setCurrentScreen('chat'); 
  };

  if (!user && currentScreen === 'login') return <LoginScreen onNavigate={setCurrentScreen} onLoginSuccess={(u) => { setUser(u); setCurrentScreen('home'); }} />;
  if (!user && currentScreen === 'register') return <RegisterScreen onNavigate={setCurrentScreen} onLoginSuccess={(u) => { setUser(u); setCurrentScreen('home'); }} />;
  if (currentScreen === 'evaluation') return <EvaluationScreen onNavigate={setCurrentScreen} />;
  if (currentScreen === 'chats') return <ChatsListScreen onNavigate={setCurrentScreen} onLoadChat={handleLoadChat} />;

  return (
    <div className="w-full h-[100dvh] bg-uni-bg flex flex-col font-sans text-uni-text overflow-hidden relative">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-64 bg-uni-card h-full p-6 flex flex-col border-r border-uni-border shadow-2xl animate-fade-in">
            <div className="mb-8"><LogoUniHelp className="h-10"/></div>
            <div className="flex-1 space-y-2">
              <button onClick={() => { setCurrentScreen('home'); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-uni-border text-white flex items-center gap-3"><Bot size={20}/> Início</button>
              <button onClick={() => { setCurrentScreen('chats'); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-uni-border text-white flex items-center gap-3"><MessageSquare size={20}/> Meus Chats</button>
              <button onClick={() => { setCurrentScreen('evaluation'); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-uni-border text-white flex items-center gap-3"><Star size={20}/> Avaliar</button>
            </div>
            <button onClick={handleLogout} className="w-full text-left p-3 rounded-xl hover:bg-red-500/20 text-red-400 flex items-center gap-3 mt-auto"><LogOut size={20}/> Sair</button>
          </div>
        </div>
      )}

      <div className="h-16 md:h-20 min-h-[4rem] flex items-center px-4 md:px-6 justify-between bg-uni-bg/90 backdrop-blur-md z-30 border-b border-uni-border/30 shrink-0">
          <div className="w-10 flex justify-start">
            {currentScreen === 'chat' ? (
              <button onClick={() => setCurrentScreen('home')} className="p-2 -ml-2 hover:bg-uni-card rounded-full transition"><ArrowLeft className="text-white" /></button>
            ) : (
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 hover:bg-uni-card rounded-full transition"><Menu className="text-white" /></button>
            )}
          </div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"><LogoUniHelp className="h-8" /></div>
          <div className="w-10 flex justify-end">
            <div className="w-9 h-9 rounded-full bg-uni-card border border-uni-border flex items-center justify-center hover:border-uni-primary transition cursor-pointer" onClick={handleLogout}><User size={18} className="text-uni-muted"/></div>
          </div>
      </div>

      <div className="flex-1 w-full h-full relative overflow-y-auto custom-scrollbar scroll-smooth">
        {currentScreen === 'home' && (
          <div className="p-6 pb-24 max-w-3xl mx-auto w-full">
            <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 mb-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer transition-transform hover:scale-[1.01]" onClick={startNewChat}>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 leading-tight max-w-[70%]">Tire dúvidas sobre <br/> suas disciplinas</h2>
                <button className="bg-white text-blue-700 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-md flex items-center gap-2"><Sparkles size={16} /> Iniciar chat</button>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="absolute right-[-20px] bottom-[-30px] w-48 opacity-90 transition-transform group-hover:scale-110 group-hover:rotate-6" alt="Bot" />
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-bold text-uni-muted mb-4 flex items-center gap-2 uppercase tracking-wider"><ShieldCheck size={14}/> Valide informações</h3>
              <div className="p-4 bg-uni-card border border-uni-border rounded-2xl flex items-center justify-between group cursor-pointer hover:border-uni-primary/50 transition" onClick={startNewChat}>
                 <div><p className="text-white font-medium">Ajude outros alunos</p><p className="text-xs text-uni-muted">Responda perguntas rápidas sobre professores</p></div>
                 <ChevronDown className="-rotate-90 text-uni-muted" size={20}/>
              </div>
            </div>
            <button onClick={() => setCurrentScreen('evaluation')} className="w-full py-4 bg-uni-card border border-uni-border rounded-2xl text-center text-white font-medium hover:bg-uni-border transition shadow-sm">Avaliar uma Disciplina</button>
          </div>
        )}

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
                      <div className={`p-4 text-sm md:text-base leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-uni-primary text-white rounded-2xl rounded-tr-sm shadow-blue-900/20' : msg.type === 'validation' ? 'bg-uni-card border border-uni-primary/30 rounded-2xl' : 'bg-uni-card text-uni-text border border-uni-border rounded-2xl rounded-tl-sm'}`}>
                        <ReactMarkdown className="prose prose-invert prose-sm max-w-none components={{ strong: ({node, ...props}) => <span className='font-bold text-blue-300' {...props} /> }}">{msg.text}</ReactMarkdown>
                        {msg.type === 'validation' && (
                          <div className="mt-4 pt-4 border-t border-uni-border flex gap-3 justify-center">
                             <button onClick={() => handleValidationResponse(msg.validationId, 'verdade')} className="flex-1 bg-green-500/10 text-green-400 border border-green-500/30 py-2 rounded-lg text-xs font-bold hover:bg-green-500/20 transition">É VERDADE</button>
                             <button onClick={() => handleValidationResponse(msg.validationId, 'fake')} className="flex-1 bg-red-500/10 text-red-400 border border-red-500/30 py-2 rounded-lg text-xs font-bold hover:bg-red-500/20 transition">É MITO</button>
                             <button onClick={() => handleValidationResponse(msg.validationId, 'skip')} className="px-4 text-uni-muted hover:text-white text-xs">Pular</button>
                          </div>
                        )}
                      </div>
                      {msg.role === 'model' && msg.type !== 'validation' && !msg.isError && idx > 0 && (
                        <div className="flex gap-2">
                          {msg.feedback === 'yes' ? <div className="text-xs text-uni-primary flex items-center gap-1 font-bold animate-fade-in"><Check size={14} /> Obrigado!</div> : 
                           msg.feedback === 'no' ? <div className="text-xs text-uni-muted flex items-center gap-1 animate-fade-in">Anotado.</div> : 
                           <>
                              <button onClick={() => handleFeedback(idx, 'yes')} className="p-1.5 rounded-full hover:bg-uni-border text-uni-muted hover:text-green-400 transition" title="Gostei"><ThumbsUp size={16} /></button>
                              <button onClick={() => handleFeedback(idx, 'no')} className="p-1.5 rounded-full hover:bg-uni-border text-uni-muted hover:text-red-400 transition" title="Não gostei"><ThumbsDown size={16} /></button>
                           </>}
                        </div>
                      )}
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