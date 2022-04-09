# syntax=docker/dockerfile:1

FROM node:14-alpine
ENV NODE_ENV=production

RUN apk add --no-cache python2 g++ make

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --production

COPY . .

CMD yarn start
