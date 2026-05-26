FROM node:24.13.1-alpine

WORKDIR /app
<<<<<<< Updated upstream
COPY package.json package-lock.json ./
RUN npm install
=======
RUN apk update && apk add --no-cache \
    build-base \
    python3

COPY package*.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 600000 \
    && if [ -f package-lock.json ]; then npm ci --include=dev --no-audit --no-fund; else npm install --include=dev --no-audit --no-fund; fi
>>>>>>> Stashed changes

COPY . .
RUN npm run build

CMD ["npm","run","start"]
