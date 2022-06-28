# syntax=docker/dockerfile:1

FROM node:16 AS base 
ENV NODE_ENV=development
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .

FROM base AS dev
CMD yarn dev

FROM base AS build
RUN yarn build

FROM build AS prod
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
RUN yarn install
COPY --from=build /app/build ./build
COPY ./.env.production ./.env
COPY ./emails ./emails
COPY ./locales ./locales
EXPOSE 4000
CMD yarn start 