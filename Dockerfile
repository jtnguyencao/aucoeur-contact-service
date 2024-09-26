FROM node:18-alpine AS base
USER node
RUN mkdir -p /home/node/app

FROM base as build
WORKDIR /usr/src/app
USER node
COPY dist/package*.json ./
RUN npm ci --only=production

FROM base as pre-production
USER root
RUN apk add --no-cache dumb-init

FROM pre-production as production
WORKDIR /usr/src/app
USER node
ENV NODE_ENV production
COPY --chown=node:node ./dist .
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
CMD ["dumb-init", "node", "./main.js"]
