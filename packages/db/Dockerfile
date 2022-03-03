ARG NODE_VERSION=lts
# ARG NODE_VERSION=16-alpine3.15

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/
COPY ./packages/db ./packages/db
COPY ./package.json ./package.json
# RUN yarn db migrate:deploy



RUN --mount=type=cache,target=/root/.yarn-cache,id=workspace-install,rw \
    SKIP_POSTINSTALL=1 \
    YARN_CACHE_FOLDER=/root/.yarn-cache \
    yarn workspaces focus @movies4discord/db --production

CMD ["yarn", "db", "docker"]
