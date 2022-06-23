# syntax=docker/dockerfile:1

FROM node:16-alpine AS build

RUN apk add --no-cache python3 g++ make

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

CMD yarn dev
