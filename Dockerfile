# syntax=docker/dockerfile:1

FROM node:14-alpine

ENV NODE_ENV=development

WORKDIR /app

RUN apk add --no-cache python2 g++ make
COPY . .
RUN yarn install --production
CMD ['yarn', 'start']
EXPOSE 3000