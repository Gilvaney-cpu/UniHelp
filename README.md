<div align="center">
  <h1>🎓 UniHelp</h1>
  <p><b>O Seu Assistente Acadêmico Inteligente com RAG Híbrido</b></p>

  <p>
    <img src="https://img.shields.io/badge/REACT-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TAILWIND-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/FIREBASE-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/GEMINI_AI-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini" />
  </p>

  <p>
    <a href="#-sobre">Sobre</a> •
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-como-rodar">Como Rodar</a>
  </p>
</div>

<br />

## 📱 Sobre

https://github.com/user-attachments/assets/b5638e0d-1acb-4079-9916-c9d3121e7861

O **UniHelp** é uma plataforma acadêmica desenvolvida para modernizar a experiência universitária. Diferente de chatbots comuns, ele utiliza uma arquitetura de **RAG Híbrido (Retrieval-Augmented Generation)**.

Isso significa que o UniHelp consulta uma base de dados real de avaliações de alunos (Firestore) para responder perguntas específicas sobre a faculdade (ex: "Como é o Prof. Robson?"), mas também utiliza o conhecimento geral do **Google Gemini** para tirar dúvidas conceituais (ex: "O que é Engenharia de Software?").

Tudo isso envolto em uma interface **Dark Mode** com estética *Glassmorphism*, focada na experiência do usuário (UX).

---

## ✨ Funcionalidades Principais

### 🧠 1. Inteligência Híbrida
- **Contexto Local:** Responde perguntas sobre professores, provas e ementas usando dados reais dos alunos.
- **Conhecimento Geral:** Atua como professor particular para explicar matérias e conceitos técnicos.

### 🔍 2. Smart Search (Filtros Inteligentes)
- Sistema de filtros no topo do chat para refinar o contexto da IA.
- Permite focar as respostas em uma **Disciplina**, **Professor** ou **Período** específico.

### ✅ 3. Verificação de Fontes (Citações)
- **Anti-Alucinação:** Toda informação extraída do banco de dados vem acompanhada de uma citação interativa.
- **Transparência:** O usuário vê tags como `Avaliação #1` ao final da resposta, garantindo a procedência da informação.

### 🎨 4. UX/UI Premium
- Design moderno e responsivo.
- Feedback visual instantâneo (Skeletons, Loaders, Toasts).
- Animações fluidas e transições suaves.

---

## 📸 Galeria

<div align="center">
  <img src="https://placehold.co/800x400/1e293b/white?text=Preview+Chat+Hibrido" width="100%" alt="Preview Chat" />
</div>

> *A interface apresenta citações verificáveis e filtros dinâmicos.*

---

## 🛠 Tecnologias

- **Frontend:** React (Vite)
- **Estilização:** Tailwind CSS (Utility-first)
- **Ícones:** Lucide React
- **Banco de Dados & Auth:** Firebase (Firestore + Authentication)
- **Inteligência Artificial:** Google Gemini API (Model: gemini-2.5-flash)
- **Markdown:** React Markdown (Renderização rica de texto)

---

## 🚀 Como Rodar o Projeto

```bash
# 1. Clone este repositório
$ git clone [https://github.com/SEU-USUARIO/unihelp-chat.git](https://github.com/SEU-USUARIO/unihelp-chat.git)

# 2. Acesse a pasta do projeto
$ cd unihelp-chat

# 3. Instale as dependências
$ npm install

# 4. Configuração de Ambiente (.env)
# Crie um arquivo .env na raiz com as chaves:
# VITE_FIREBASE_API_KEY=...
# VITE_GEMINI_API_KEY=...

# 5. Execute a aplicação
$ npm run dev
