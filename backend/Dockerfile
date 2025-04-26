# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Instalar git para go mod download
RUN apk add --no-cache git

# Copiar arquivos de dependências
COPY go.mod go.sum ./

# Baixar dependências
RUN go mod download

# Copiar o código fonte
COPY . .

# Compilar a aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/main ./cmd/api

# Final stage
FROM alpine:latest

WORKDIR /app

# Copiar o binário do builder
COPY --from=builder /app/bin/main .

# Expor a porta
EXPOSE 8080

# Comando para executar a aplicação
CMD ["./main"] 