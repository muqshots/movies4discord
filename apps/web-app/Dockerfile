ARG NODE_VERSION=lts
# ARG NODE_VERSION=16-alpine3.15

FROM node:${NODE_VERSION} AS deps
RUN apt-get -qy update && apt-get -qy install rsync
# RUN apk add rsync

WORKDIR /workspace-install

COPY yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/

#   - All package.json present in the host (root, apps/*, packages/*)
#   - All schema.prisma (cause prisma will generate a schema on postinstall)
RUN --mount=type=bind,target=/docker-context \
    rsync -amv --delete \
    --exclude='node_modules' \
    --exclude='*/node_modules' \
    --include='package.json' \
    --include='schema.prisma' \
    --include='*/' --exclude='*' \
    /docker-context/ /workspace-install/;

RUN --mount=type=cache,target=/root/.yarn-cache \
    YARN_CACHE_FOLDER=/root/.yarn-cache \
    yarn install --immutable --inline-builds




FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY . .
COPY --from=deps /workspace-install ./

# RUN yarn db migrate:deploy
RUN yarn workspace web-app build

RUN --mount=type=cache,target=/root/.yarn-cache,id=workspace-install,rw \
    SKIP_POSTINSTALL=1 \
    YARN_CACHE_FOLDER=/root/.yarn-cache \
    yarn workspaces focus web-app --production




FROM node:${NODE_VERSION} AS runner

WORKDIR /app
COPY --from=builder /app/apps/web-app/next.config.mjs \
    /app/apps/web-app/package.json \
    ./apps/web-app/
COPY --from=builder /app/apps/web-app/public ./apps/web-app/public
COPY --from=builder /app/apps/web-app/.next ./apps/web-app/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["yarn", "workspace", "web-app", "run", "start", "-p", "3000"]
