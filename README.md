# Dr. Bruno Quintela - Osteopatia

Sistema de gestão para clínica de osteopatia desenvolvido com Next.js 14 e App Router.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **ShadCN UI** - Componentes UI
- **Lucide React** - Ícones
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de dados (Supabase)

## 🎨 Tema de Cores

- **Primary**: #F28C1D (Laranja principal)
- **Primary Light**: #F6A94A
- **Primary Dark**: #D67511
- **Background**: #FFFFFF
- **Foreground**: #F9F6F2
- **Text Dark**: #333333
- **Text Light**: #666666
- **Accent**: #FFD8A6
- **Muted**: #F3E7D9
- **Border**: #EDE0D0

## 📁 Estrutura do Projeto

```
/app
  /dashboard      - Página principal do dashboard
  /clientes       - Gestão de clientes
  /marcacoes      - Gestão de marcações
  /calendario     - Visualização do calendário
  /api            - Rotas da API

/components
  /layout         - Componentes de layout (Sidebar, Topbar)
  /ui             - Componentes ShadCN UI
```

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure a base de dados:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione: `DATABASE_URL="postgresql://user:password@host:port/database"`
   - Veja mais detalhes em `PRISMA_SETUP.md`

3. Configure o Prisma:
```bash
npm run db:generate
npm run db:migrate
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:generate` - Gera o Prisma Client
- `npm run db:migrate` - Cria e aplica migrações
- `npm run db:studio` - Abre o Prisma Studio

## 🎯 Funcionalidades

- ✅ Dashboard com estatísticas e atividades recentes
- ✅ Gestão de clientes (CRUD completo via API)
- ✅ Gestão de marcações (CRUD completo via API)
- ✅ Visualização de calendário
- ✅ Layout responsivo com sidebar e topbar
- ✅ Tema customizado com cores laranja
- ✅ API REST completa para Clientes e Marcações
- ✅ Integração com PostgreSQL via Prisma

## 📡 API Endpoints

Consulte `PRISMA_SETUP.md` para documentação completa dos endpoints da API.

