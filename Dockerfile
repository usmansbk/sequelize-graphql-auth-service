# syntax=docker/dockerfile:1

FROM node:14-alpine 

ARG NODE_ENV=development

RUN apk add --no-cache python2 g++ make

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

CMD yarn dev
