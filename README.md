# NextBuy API

Sistema de gerenciamento de pedidos com processamento assíncrono, geração de PDFs e relatórios.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **MongoDB** - Banco de dados
- **Redis** - Cache e filas
- **BullMQ** - Processamento assíncrono
- **AWS S3** - Armazenamento de arquivos
- **JWT** - Autenticação
- **PDFKit** - Geração de PDFs
- **Axios** - Cliente HTTP

## 📋 Requisitos

- Node.js 16+
- MongoDB
- Redis
- Docker (opcional)

## 🚀 Início Rápido

### 1. Banco de Dados
```bash
# MongoDB
docker run -d --name mongo -p 27017:27017 mongo:6

# Redis
docker run -d --name redis -p 6379:6379 redis:7
```

### 2. Configuração
```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar configurações (MongoDB, Redis, AWS)
```

### 3. Instalação
```bash
npm install
```

### 4. Executar
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 Documentação

Acesse a documentação interativa em: http://localhost:3000/api

## 🔧 Scripts

```bash
# Desenvolvimento
npm run start:dev

# Testes
npm test
npm run test:cov

# Lint
npm run lint

# Build
npm run build
```

## 📡 Endpoints Principais

### Autenticação
- `POST /auth/login` - Login e geração de token

### Clientes
- `GET /customers` - Listar clientes
- `POST /customers` - Criar cliente
- `GET /customers/:id` - Buscar cliente
- `PUT /customers/:id` - Atualizar cliente
- `DELETE /customers/:id` - Remover cliente

### Pedidos
- `GET /orders` - Listar pedidos
- `POST /orders` - Criar pedido (requer autenticação)
- `GET /orders/:id` - Buscar pedido
- `PUT /orders/:id` - Atualizar pedido
- `DELETE /orders/:id` - Remover pedido
- `POST /orders/:id/comprovante` - Upload de comprovante (requer autenticação)

### Relatórios
- `GET /relatorios/top-clientes` - Top clientes
- `GET /relatorios/resumo-vendas` - Resumo de vendas

## 🔐 Configuração

### Variáveis de Ambiente
```bash
# Banco de dados
MONGO_URI=mongodb://localhost:27017/nextbuy

# Redis (obrigatório para processamento assíncrono)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# AWS (opcional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-2
S3_BUCKET=your-bucket
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Com cobertura
npm run test:cov

# Modo watch
npm run test:watch
```

## 📊 Relatórios

### Top Clientes
Retorna os clientes com maiores gastos, com paginação e filtros.

### Resumo de Vendas
Estatísticas gerais de vendas do período.

## 📄 Geração de PDFs

- PDFs gerados automaticamente após criação do pedido
- Upload para AWS S3
- Fallback para armazenamento local
- URLs públicas para acesso

## 🔄 Processamento Assíncrono

- Filas BullMQ para processamento em background
- Geração de PDFs assíncrona
- Notificações por e-mail
- Sistema de retry automático

## 🛡️ Segurança

- Autenticação JWT
- Validação de entrada
- Rate limiting
- CORS configurado
- Sanitização de dados

## 📝 Licença

MIT License
