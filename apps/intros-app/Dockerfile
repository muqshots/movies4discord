ARG NODE_VERSION=lts

FROM node:${NODE_VERSION} AS deps
RUN apt-get -qy update && apt-get -qy install rsync

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

RUN yarn workspace intros-app build

RUN --mount=type=cache,target=/root/.yarn-cache,id=workspace-install,rw \
    SKIP_POSTINSTALL=1 \
    YARN_CACHE_FOLDER=/root/.yarn-cache \
    yarn workspaces focus intros-app --production


FROM node:${NODE_VERSION} AS runner

WORKDIR /app
COPY --from=builder /app/apps/intros-app/package.json ./apps/intros-app/
COPY --from=builder /app/apps/intros-app/dist ./apps/intros-app/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 6969

CMD ["yarn", "workspace", "intros-app", "run", "start"]
