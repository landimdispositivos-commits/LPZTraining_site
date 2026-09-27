FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Só precisa estar definida para o build passar (src/db/index.ts valida a
# presença da variável); a conexão real só é aberta em runtime, com o valor
# vindo do .env de produção.
ENV DATABASE_URL="postgres://build:build@localhost:5432/build"
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
