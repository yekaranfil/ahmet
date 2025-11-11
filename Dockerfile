FROM node:20-alpine

WORKDIR /app

# Bağımlılıkları önbellek dostu kurulum
COPY package*.json ./
RUN npm ci --only=production

# Uygulama kodunu kopyala
COPY . .

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]


