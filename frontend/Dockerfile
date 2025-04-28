FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Instalar todas as dependências, incluindo as de desenvolvimento
RUN npm install --include=dev
RUN npm install -D @types/react @types/react-dom

# Copiar o resto do código
COPY . .

# Expor a porta
EXPOSE 5173

# Comando para executar a aplicação
CMD ["npm", "run", "dev"] 