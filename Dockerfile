# syntax=docker/dockerfile:1

FROM node:14-alpine
ENV NODE_ENV=development

RUN apk add python2 g++ make

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

CMD yarn dev
