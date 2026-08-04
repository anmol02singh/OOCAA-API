FROM node:20-bookworm-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=4096
EXPOSE 3000

CMD ["npx", "ts-node", "server.ts"]