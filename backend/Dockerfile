FROM node:20-slim

ENV NODE_ENV=production \
    PORT=3001 \
    DB_DIALECT=sqlite \
    DB_STORAGE=/data/dev.sqlite

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    pkg-config \
    sqlite3 \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY .sequelizerc ./
COPY src ./src
COPY config ./config
COPY migrations ./migrations
COPY seeders ./seeders

RUN mkdir -p /data && mkdir -p uploads/documentos
VOLUME ["/data", "/app/uploads"]

EXPOSE 3001

CMD ["npm", "start"]
