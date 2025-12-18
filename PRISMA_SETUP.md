# Configuração do Prisma

## 📋 Pré-requisitos

1. PostgreSQL instalado ou conta no Supabase
2. Node.js e npm instalados

## 🚀 Passos de Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variável de Ambiente

Crie um arquivo `.env` na raiz do projeto com a seguinte estrutura:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dr_bruno_osteopatia?schema=public"
```

**Para Supabase:**
1. Acesse o seu projeto no Supabase
2. Vá em Settings > Database
3. Copie a Connection String (URI)
4. Substitua `[YOUR-PASSWORD]` pela sua senha
5. Cole no arquivo `.env`

Exemplo:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### 3. Gerar Prisma Client

```bash
npm run db:generate
```

### 4. Criar Migrações

```bash
npm run db:migrate
```

Este comando irá:
- Criar a pasta `prisma/migrations`
- Aplicar as migrações à base de dados
- Gerar o Prisma Client

### 5. (Opcional) Abrir Prisma Studio

Para visualizar e editar dados diretamente:

```bash
npm run db:studio
```

## 📡 Endpoints da API

### Clientes

- `GET /api/clientes` - Listar todos os clientes
  - Query params: `?search=termo` (busca por nome, email ou telemóvel)
  
- `GET /api/clientes/[id]` - Buscar cliente por ID

- `POST /api/clientes` - Criar novo cliente
  ```json
  {
    "nomeCompleto": "João Silva",
    "numeroBI": "123456789",
    "nif": "123456789",
    "genero": "Masculino",
    "dataNascimento": "1990-01-01",
    "estadoCivil": "Solteiro",
    "profissao": "Engenheiro",
    "morada": "Rua Exemplo, 123",
    "localidade": "Lisboa",
    "codigoPostal": "1000-001",
    "telemovel": "+351912345678",
    "email": "joao@example.com",
    "observacoes": "Observações do cliente"
  }
  ```

- `PUT /api/clientes/[id]` - Atualizar cliente

- `DELETE /api/clientes/[id]` - Deletar cliente

### Marcações

- `GET /api/marcacoes` - Listar todas as marcações
  - Query params: 
    - `?data=2024-01-15` (filtrar por data)
    - `?status=pendente` (filtrar por status)
    - `?clienteId=1` (filtrar por cliente)

- `GET /api/marcacoes/[id]` - Buscar marcação por ID

- `POST /api/marcacoes` - Criar nova marcação
  ```json
  {
    "clienteId": 1,
    "data": "2024-01-15T14:30:00Z",
    "hora": "14:30",
    "tipo": "Consulta",
    "preco": 50.00,
    "observacoes": "Primeira consulta",
    "status": "pendente"
  }
  ```

- `PUT /api/marcacoes/[id]` - Atualizar marcação

- `DELETE /api/marcacoes/[id]` - Deletar marcação

## 🔄 Comandos Úteis

- `npm run db:generate` - Gerar Prisma Client após mudanças no schema
- `npm run db:migrate` - Criar e aplicar migrações
- `npm run db:studio` - Abrir interface visual do Prisma

## 📝 Notas

- O modelo `User` está incluído no schema mas não possui endpoints CRUD ainda
- As marcações são deletadas em cascata quando um cliente é deletado
- Todos os timestamps são gerenciados automaticamente pelo Prisma

