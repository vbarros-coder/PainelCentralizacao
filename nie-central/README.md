# Central de Projetos NIE

Sistema de gestão de projetos do Núcleo de Inteligência Estratégica (NIE).

## 🚀 Stack Tecnológica

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Framer Motion** - Animações avançadas
- **Lucide React** - Ícones modernos
- **next-themes** - Tema claro/escuro

## 📁 Estrutura do Projeto

```
nie-central/
├── app/                    # Rotas e páginas
│   ├── login/             # Página de login
│   ├── dashboard/         # Área logada
│   │   ├── page.tsx       # Dashboard principal
│   │   └── layout.tsx     # Layout com sidebar
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Redirect para login
│   ├── not-found.tsx      # Página 404
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Button, Input, etc)
│   ├── layout/           # Sidebar, Topbar
│   └── providers/        # Context providers
├── features/             # Módulos por domínio
│   ├── auth/            # Autenticação
│   ├── projects/        # Projetos
│   └── lgpd/            # Conformidade LGPD
├── hooks/               # Custom hooks
├── lib/                 # Utilitários e dados
│   ├── utils.ts        # Funções auxiliares
│   ├── design-system.ts # Tokens de design
│   └── mock-data.ts    # Dados mockados
├── types/               # Tipos TypeScript
└── public/              # Assets estáticos
```

## 🔐 Sistema de Autenticação

### Perfis de Usuário

| Perfil | Permissões |
|--------|-----------|
| **Admin** | Acesso total a todos os projetos e funcionalidades |
| **Diretor** | Acesso aos projetos da sua diretoria |
| **Usuário** | Acesso restrito (apenas visualização) |

### Credenciais de Demonstração

```
Admin:     admin@nie.gov.br / Admin@2024
Diretor:   diretor.ti@nie.gov.br / Diretor@2024
Usuário:   usuario@nie.gov.br / Usuario@2024
```

## 🎨 Design System

### Cores Principais
- **Primary**: Blue 600 (#2563eb)
- **Success**: Emerald 500 (#10b981)
- **Warning**: Amber 500 (#f59e0b)
- **Error**: Red 500 (#ef4444)

### Categorias de Projetos
- Estratégia (Violet)
- Operacional (Emerald)
- Tecnologia (Blue)
- Financeiro (Amber)
- RH (Rose)
- Marketing (Pink)
- Jurídico (Slate)

## 🛡️ Segurança Implementada

### Frontend
- ✅ Sanitização de inputs (XSS prevention)
- ✅ Validação de email e senha
- ✅ CSP Headers configurados
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security

### Autenticação
- ✅ Limite de tentativas (5x)
- ✅ Bloqueio temporário (15 min)
- ✅ Sessão com expiração (24h)
- ✅ Proteção de rotas

### LGPD
- ✅ Banner de consentimento de cookies
- ✅ Painel de privacidade
- ✅ Opção de exportar dados
- ✅ Opção de exclusão de dados

## 📦 Dependências

```json
{
  "dependencies": {
    "next": "^16.2.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "next-themes": "^0.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

## 🚀 Como Executar

### Desenvolvimento
```bash
cd nie-central
npm install
npm run dev
```

Acesse: http://localhost:3000

### Build de Produção
```bash
npm run build
npm start
```

## 🧪 Testes de Segurança

### 1. XSS Prevention
- Tentar injetar `<script>alert('xss')</script>` nos campos de busca
- Verificar se o input é sanitizado

### 2. Autenticação
- Tentar acessar `/dashboard` sem login (deve redirecionar)
- Tentar login com credenciais inválidas (máx 5 tentativas)
- Verificar expiração de sessão

### 3. Headers de Segurança
```bash
curl -I http://localhost:3000
```
Verificar presença de:
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## 🔮 Roadmap

- [ ] Integração com Google Sheets
- [ ] API real com backend
- [ ] Painel administrativo completo
- [ ] Métricas e analytics
- [ ] Notificações em tempo real
- [ ] Mobile app

## 📄 Licença

© 2024 Núcleo de Inteligência Estratégica. Todos os direitos reservados.

---

**Desenvolvido com foco em segurança, usabilidade e excelência técnica.**
