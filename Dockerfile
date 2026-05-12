FROM node:24.13.1-alpine

WORKDIR /app
RUN apk update && apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    python3

COPY package.json ./
RUN npm install

COPY . .
CMD ["npm","run","start"]