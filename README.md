<div align="center">
  <img src="https://via.placeholder.com/1200x400.png?text=UniHelp+Banner" alt="UniHelp Banner" width="100%">

  <br />
  <br />

  <h1>🎓 UniHelp</h1>
  <p><b>O Seu Assistente Acadêmico Inteligente com IA</b></p>

  <p>
    <img src="https://img.shields.io/badge/REACT-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/VITE-B73BFE?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/TAILWIND_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/GEMINI_AI-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini" />
  </p>

  <p>
    <a href="#-sobre">Sobre</a> •
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-layout">Layout</a> •
    <a href="#-como-rodar">Como Rodar</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-autor">Autor</a>
  </p>
</div>

<br />

## 📱 Sobre

O **UniHelp** é uma plataforma acadêmica desenvolvida para modernizar a experiência universitária. Com uma interface *Dark Mode* sofisticada e focada em UX, o app utiliza a inteligência artificial do **Google Gemini** para oferecer suporte instantâneo aos alunos.

Diferente de sistemas acadêmicos tradicionais e complexos, o UniHelp foca na rapidez e simplicidade: tirar dúvidas sobre matérias, avaliar professores e organizar a vida acadêmica em uma interface que se comporta como um app nativo.

---

## ✨ Funcionalidades

- **🤖 Chatbot Inteligente:** Converse naturalmente com a IA para tirar dúvidas sobre ementas e cursos.
  - Respostas formatadas em Markdown (Negrito, Listas, Tópicos).
  - Feedback interativo (Botões de Like/Dislike).

- **🌗 Design Premium:** Interface imersiva em modo escuro com efeitos de *glassmorphism* (vidro) e gradientes.

- **📱 Responsividade Total:**
  - **Desktop:** Menu lateral (Sidebar) e layout expandido.
  - **Mobile:** Menu inferior (Bottom Nav) e toques otimizados.

- **📝 Sistema de Avaliação:** Formulários dinâmicos para feedback de disciplinas.

- **⚡ Performance:** Carregamento instantâneo com Vite e otimização de re-renderização no React 19.

---

## 🎨 Layout

O projeto foi desenvolvido seguindo fielmente um protótipo de alta fidelidade no Figma. O design utiliza uma paleta de cores escura (`#09090b`) com acentos em Azul Royal e Ciano.

### 📸 Galeria de Telas

<div align="center">
  <img src="https://placehold.co/300x600/1e293b/white?text=Tela+Login" width="250" alt="Tela de Login" />
  <img src="https://placehold.co/300x600/1e293b/white?text=Tela+Chat" width="250" alt="Tela de Chat" />
  <img src="https://placehold.co/300x600/1e293b/white?text=Tela+Avaliar" width="250" alt="Tela de Avaliação" />
</div>

---

## 🛠 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto:

- **[React](https://react.dev/)** (v19) - Biblioteca para construção de interfaces.
- **[Vite](https://vitejs.dev/)** - Build tool ultrarrápida.
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de estilização utility-first.
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones moderna e leve.
- **[Google Generative AI](https://ai.google.dev/)** - API do modelo Gemini Flash.
- **React Markdown** - Para renderizar as respostas da IA com formatação rica.

---

## 🚀 Como Rodar o Projeto

```bash
# Clone este repositório
$ git clone [https://github.com/SEU-USUARIO/unihelp-chat.git](https://github.com/SEU-USUARIO/unihelp-chat.git)

# Acesse a pasta do projeto no terminal/cmd
$ cd unihelp-chat

# Instale as dependências
$ npm install

# Crie um arquivo .env na raiz do projeto e adicione sua chave API
# VITE_GEMINI_API_KEY="SUA_CHAVE_AQUI"

# Execute a aplicação em modo de desenvolvimento
$ npm run dev

# O servidor iniciará na porta: 5173 - acesse http://localhost:5173

```

```text
unihelp-chat/
├── src/
│   ├── components/      # Componentes reutilizáveis (ChatInput, Logo, etc)
│   ├── assets/          # Imagens e ícones estáticos
│   ├── App.jsx          # Lógica principal e Roteamento manual
│   └── index.css        # Configurações globais do Tailwind
├── public/              # Arquivos públicos
├── .env                 # Variáveis de ambiente (Não comitado)
└── README.md            # Documentação
