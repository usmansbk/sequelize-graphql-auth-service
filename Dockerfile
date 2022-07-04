# syntax=docker/dockerfile:1

FROM node:16 
ENV NODE_ENV=development
WORKDIR /usr/app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
EXPOSE 4000
CMD yarn dev