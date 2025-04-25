# JurisConnect

Sistema de gerenciamento de processos jurídicos.

## 🚀 Começando

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Go](https://golang.org/dl/) (versão 1.21 ou superior)
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (conta gratuita)

### Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/jurisconnect.git
cd jurisconnect
```

2. Crie o arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

3. Configure as variáveis de ambiente no arquivo `.env`:
```env
# Configurações Gerais
APP_NAME=JurisConnect
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:5173
API_URL=http://localhost:8080

# Backend
PORT=8080
JWT_SECRET=dev-secret-key-123
JWT_EXPIRATION=24h

# MongoDB Atlas
MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@seu-cluster.mongodb.net/jurisconnect?retryWrites=true&w=majority
MONGODB_DATABASE=jurisconnect

# Frontend
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=JurisConnect
VITE_APP_ENV=development

# Configurações de Segurança
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
RATE_LIMIT=100
```

### Executando o Projeto

1. **Desenvolvimento Local**:
```bash
# Iniciar ambiente de desenvolvimento
make dev-local

# O backend estará disponível em: http://localhost:8080
# O frontend estará disponível em: http://localhost:5173
```

2. **Usando Docker Compose**:
```bash
# Iniciar todos os serviços
make up

# Parar todos os serviços
make down

# Ver logs dos serviços
make logs
```

### Comandos Disponíveis

```bash
# Desenvolvimento
make dev-local          # Inicia ambiente de desenvolvimento local
make dev-local-down     # Para o ambiente de desenvolvimento

# Docker
make up                 # Inicia todos os serviços via Docker
make down              # Para todos os serviços
make logs              # Mostra logs dos serviços

# Banco de Dados
make test-mongodb      # Testa conexão com MongoDB Atlas

# Limpeza
make clean             # Remove arquivos gerados e containers

# Ajuda
make help              # Mostra todos os comandos disponíveis
```

## 📦 Estrutura do Projeto

```
jurisconnect/
├── backend/           # API em Go
├── frontend/          # Aplicação React
├── docker-compose.yml # Configuração Docker
├── Makefile          # Comandos automatizados
└── .env              # Variáveis de ambiente
```

## 🔧 Tecnologias Utilizadas

- **Backend**: Go, Gin, MongoDB
- **Frontend**: React, Vite, TailwindCSS
- **Infraestrutura**: Docker, Docker Compose
- **Banco de Dados**: MongoDB Atlas

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request 