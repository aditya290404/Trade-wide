FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install --no-package-lock
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 5000
CMD ["npx", "ts-node", "src/index.ts"]
