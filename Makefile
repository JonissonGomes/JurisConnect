.PHONY: help build up down logs clean test lint env-setup check-deps gcp-setup gcp-deploy gcp-logs gcp-shell dev-local dev-local-down test-mongodb mongodb-local

# Cores para o output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RED    := $(shell tput -Txterm setaf 1)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

TARGET_MAX_CHAR_NUM=20

# Variáveis
PROJECT_ID ?= $(shell gcloud config get-value project)
REGION ?= us-central1
REPOSITORY ?= jurisconnect
SERVICE_NAME ?= backend

# Carrega variáveis do arquivo .env
include .env
export

## Mostra ajuda
help:
	@echo ''
	@echo 'Comandos disponíveis:'
	@echo ''
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${YELLOW}%-$(TARGET_MAX_CHAR_NUM)s${RESET} ${GREEN}%s${RESET}\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

## Verifica dependências necessárias
check-deps:
	@echo "${GREEN}Verificando dependências...${RESET}"
	@command -v docker >/dev/null 2>&1 || { echo "${RED}Docker não está instalado.${RESET}"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "${RED}Docker Compose não está instalado.${RESET}"; exit 1; }
	@command -v go >/dev/null 2>&1 || { echo "${RED}Go não está instalado.${RESET}"; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "${RED}Node.js não está instalado.${RESET}"; exit 1; }
	@command -v golangci-lint >/dev/null 2>&1 || { echo "${RED}golangci-lint não está instalado.${RESET}"; exit 1; }
	@command -v gcloud >/dev/null 2>&1 || { echo "${RED}Google Cloud SDK não está instalado.${RESET}"; exit 1; }
	@echo "${GREEN}Todas as dependências estão instaladas!${RESET}"

## Configura o ambiente
env-setup:
	@echo "${GREEN}Configurando ambiente...${RESET}"
	@if [ -f .env ]; then \
		echo "${YELLOW}O arquivo .env já existe. Deseja sobrescrever? (s/n)${RESET}"; \
		read response; \
		if [[ "$$response" =~ ^([nN][oO]|[nN])$$ ]]; then \
			echo "${YELLOW}Operação cancelada.${RESET}"; \
			exit 0; \
		fi; \
	fi
	@cp .env.example .env
	@echo "${GREEN}Arquivo .env criado com sucesso!${RESET}"
	@echo "${YELLOW}Por favor, edite o arquivo .env e configure as variáveis de ambiente necessárias.${RESET}"
	@echo "${YELLOW}Algumas variáveis importantes para configurar:${RESET}"
	@echo "${YELLOW}- GCP_PROJECT_ID${RESET}"
	@echo "${YELLOW}- GCP_REGION${RESET}"
	@echo "${YELLOW}- CLOUD_SQL_INSTANCE_NAME${RESET}"
	@echo "${YELLOW}- CLOUD_SQL_USER e CLOUD_SQL_PASSWORD${RESET}"

## Configura o ambiente GCP
gcp-setup:
	@echo "${GREEN}Configurando ambiente GCP...${RESET}"
	@gcloud services enable cloudbuild.googleapis.com
	@gcloud services enable run.googleapis.com
	@gcloud services enable artifactregistry.googleapis.com
	@gcloud artifacts repositories create $(REPOSITORY) \
		--repository-format=docker \
		--location=$(REGION) \
		--description="Repositório de imagens Docker para JurisConnect"
	@echo "${GREEN}Ambiente GCP configurado!${RESET}"

## Deploy para GCP
gcp-deploy:
	@echo "${GREEN}Fazendo deploy da aplicação...${RESET}"
	@gcloud builds submit --config cloudbuild.yaml

## Mostra logs do GCP
gcp-logs:
	@echo "${GREEN}Visualizando logs da aplicação...${RESET}"
	@gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$(SERVICE_NAME)" --limit=50

## Acessa o shell do MongoDB no GCP
gcp-shell:
	@echo "${GREEN}Acessando shell do MongoDB...${RESET}"
	@kubectl exec -it $(shell kubectl get pods -l app=mongodb -o jsonpath='{.items[0].metadata.name}') -- mongosh

## Inicia todos os containers
up:
	@echo "${GREEN}Iniciando containers...${RESET}"
	docker-compose up -d
	docker-compose logs -f

## Para todos os containers
down:
	@echo "${GREEN}Parando containers...${RESET}"
	docker-compose down

## Reconstroi e inicia os containers
rebuild:
	@echo "${GREEN}Reconstruindo e iniciando containers...${RESET}"
	docker-compose up -d --build
	docker-compose logs -f

## Mostra logs dos containers
logs:
	@echo "${GREEN}Mostrando logs...${RESET}"
	docker-compose logs -f

## Limpa containers e volumes
clean:
	@echo "${GREEN}Limpando arquivos gerados...${RESET}"
	@rm -rf backend/bin
	@rm -rf frontend/build
	@rm -rf frontend/node_modules
	@echo "${GREEN}Limpando containers e volumes...${RESET}"
	docker-compose down -v
	docker system prune -f

## Executa testes do backend
test:
	@echo "${GREEN}Executando testes...${RESET}"
	@cd backend && go test ./...
	@cd frontend && npm test

## Executa lint no backend
lint:
	@echo "${GREEN}Executando lint...${RESET}"
	cd backend && golangci-lint run

## Instala dependências do backend
backend-deps:
	@echo "${GREEN}Instalando dependências do backend...${RESET}"
	cd backend && go mod tidy

## Instala dependências do frontend
frontend-deps:
	@echo "${GREEN}Instalando dependências do frontend...${RESET}"
	cd frontend && npm install

## Inicia o backend em modo desenvolvimento
backend-dev:
	@echo "${GREEN}Iniciando backend em modo desenvolvimento...${RESET}"
	cd backend && go run main.go

## Inicia o frontend em modo desenvolvimento
frontend-dev:
	@echo "${GREEN}Iniciando frontend em modo desenvolvimento...${RESET}"
	cd frontend && npm run dev

## Verifica status dos containers
status:
	@echo "${GREEN}Verificando status dos containers...${RESET}"
	docker-compose ps

## Inicia ambiente de desenvolvimento completo
dev: check-deps env-setup backend-deps frontend-deps rebuild
	@echo "${GREEN}Ambiente de desenvolvimento pronto!${RESET}"
	@echo "${GREEN}Frontend: http://localhost:5173${RESET}"
	@echo "${GREEN}Backend: http://localhost:8080${RESET}"
	@echo "${GREEN}MongoDB: mongodb://localhost:27017${RESET}"

## Inicia MongoDB local
mongodb-local:
	@echo "${GREEN}Iniciando MongoDB local...${RESET}"
	@docker-compose up -d mongodb
	@sleep 5
	@echo "${GREEN}MongoDB local iniciado!${RESET}"

## Configura ambiente de desenvolvimento local
dev-local:
	@echo "${GREEN}Configurando ambiente de desenvolvimento local...${RESET}"
	@echo "${YELLOW}Instalando dependências do backend...${RESET}"
	@cd backend && go mod tidy
	@echo "${YELLOW}Iniciando backend...${RESET}"
	@cd backend && go run cmd/api/main.go

## Para o ambiente de desenvolvimento local
dev-local-down:
	@echo "${GREEN}Parando ambiente de desenvolvimento local...${RESET}"
	@docker-compose down

## Testa conexão com MongoDB Atlas
test-mongodb:
	@echo "${GREEN}Testando conexão com MongoDB Atlas...${RESET}"
	@docker run --rm mongo:6.0 mongosh "${MONGODB_URI}" --eval "db.runCommand({ ping: 1 })"

## Mostra logs do MongoDB
mongodb-logs:
	@echo "${GREEN}Mostrando logs do MongoDB...${RESET}"
	@docker-compose logs -f mongodb

## Acessa o shell do MongoDB
mongodb-shell:
	@echo "${GREEN}Acessando shell do MongoDB...${RESET}"
	@docker exec -it jurisconnect-mongodb mongosh 