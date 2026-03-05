# AgencyOS - Midnight Studio CRM

Sistema completo de gestão interna para agências de marketing digital.

## 🚀 Sobre o Projeto

O **AgencyOS** é um CRM avançado desenvolvido especificamente para agências de marketing, integrando ferramentas de gestão financeira, produção de conteúdo, mídia paga e muito mais. O sistema segue o design "Midnight Studio" com tema dark mode profissional.

## ✨ Funcionalidades Principais

### 📊 Dashboard Principal
- Visão geral do desempenho da agência
- Métricas de receita, clientes ativos e conteúdo em produção
- Gráficos interativos de receita mensal e distribuição por cliente

### 💼 Gestão de Clientes
- Cadastro completo de clientes com informações detalhadas
- Perfil do cliente com abas organizadas:
  - Informações Gerais (dados cadastrais, status)
  - Contratos e Documentos (upload e gestão de arquivos)
  - Dados Financeiros (histórico de pagamentos, valores)
  - Integrações (Google Ads, Meta Ads)

### 💰 Painel Financeiro
- Dashboard financeiro com KPIs principais
- Gestão de pagamentos por cliente
- Controle de inadimplência
- Gráficos de receita mensal vs meta
- Margem de faturamento (MF) por cliente

### 📝 Grade de Conteúdo (Kanban)
- Sistema Kanban com drag-and-drop
- Colunas personalizadas:
  - Briefing → Em Produção → Revisão → Aguardando Aprovação → Aprovado → Agendado → Publicado
- Atribuição de responsáveis
- Datas de publicação
- Sistema de tags e categorias
- Aprovação de clientes (preparado para portal externo)

### 👥 Gestão de Colaboradores
- Cadastro de equipe interna
- Controle de permissões por cargo:
  - Admin / Sócio (acesso total)
  - Gerente de Contas
  - Social Media / Designer
  - Gestor de Tráfego
  - Financeiro
  - Estagiário

### 🎯 Metas e Planejamento
- Definição de metas financeiras e operacionais
- Acompanhamento de progresso com barras visuais
- OKRs da agência
- Calendário de reuniões e to-dos

### 📈 Mídia Paga (Mockado)
- Dashboard de Google Ads com métricas principais
- Dashboard de Meta Ads (Facebook + Instagram)
- Gráficos de investimento e conversões
- Comparativo de performance por canal

### 📊 Insights de Conteúdo (Mockado)
- Performance de posts publicados
- Métricas de engajamento
- Sugestões automáticas baseadas em dados
- Melhores horários e formatos de publicação

## 🛠 Stack Tecnológica

### Backend
- **FastAPI** - Framework web moderno e rápido
- **MongoDB** - Banco de dados NoSQL
- **Motor** - Driver async para MongoDB
- **Pydantic** - Validação de dados
- **JWT** - Autenticação com tokens
- **Bcrypt** - Hash de senhas

### Frontend
- **React 19** - Biblioteca JavaScript
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes UI modernos
- **Recharts** - Gráficos e visualizações
- **@hello-pangea/dnd** - Drag and drop para Kanban
- **Sonner** - Notificações toast
- **Axios** - Requisições HTTP
- **Lucide React** - Ícones

## 🎨 Design System

### Cores Principais
- **Background**: `#09090b` (Zinc 950)
- **Primary**: `#7c3aed` (Violet 600)
- **Accent**: `#06b6d4` (Cyan 600)
- **Success**: `#10b981` (Emerald 500)
- **Warning**: `#f97316` (Orange 500)

### Tipografia
- **Headings**: Plus Jakarta Sans (bold, geometric)
- **Body**: Inter (clean, readable)
- **Mono/Data**: JetBrains Mono

### Componentes
- Cards com glassmorphism e hover effects
- Botões com glow effects
- Inputs com focus states suaves
- Badges coloridos por status
- Gráficos com cores neon no dark theme

## 🚀 Como Usar

### Acessar o Sistema
- **URL**: https://agency-hub-141.preview.emergentagent.com
- **Email de teste**: admin@agencyos.com
- **Senha**: admin123

### Outros Usuários de Teste
- Social Media: social@agencyos.com / social123
- Designer: design@agencyos.com / design123

## 📋 Estrutura de Dados

### Usuários (Users)
- Autenticação e autorização
- Controle de permissões por cargo
- Perfil com foto e informações

### Clientes (Clients)
- Dados cadastrais completos
- Valor mensal e dia de vencimento
- Status (Ativo, Pausado, Cancelado, Em negociação)
- Margem de faturamento

### Pagamentos (Payments)
- Histórico por cliente
- Status (Pago, Pendente, Em atraso)
- Data e forma de pagamento

### Conteúdo (Content Cards)
- Título e tipo (Post, Reels, Stories, etc.)
- Cliente e responsável
- Status no Kanban
- Data de publicação
- Tags e comentários
- Status de aprovação

## 🔐 Segurança

- Autenticação JWT com tokens seguros
- Senhas com hash bcrypt
- Controle de acesso baseado em cargos
- Proteção de rotas no frontend
- Validação de dados com Pydantic

## 🎯 Próximas Melhorias Sugeridas

### Funcionalidades
1. **Portal do Cliente** - Acesso externo para aprovação de conteúdo
2. **Integrações Reais** - Google Ads API, Meta Marketing API
3. **Notificações** - Push e email notifications
4. **Relatórios** - Geração de PDF automática
5. **Calendário Editorial** - Visualização e agendamento

---

**AgencyOS - Midnight Studio CRM** 
Desenvolvido com ❤️ para agências de marketing digital
