# syntax=docker/dockerfile:1

FROM node:16-alpine
ENV NODE_ENV=development

WORKDIR /app

# Only for Mac M1 chips
RUN apk add --no-cache python3 g++ make

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

CMD yarn dev
