FROM node:17.1.0

RUN apt update && \
    apt install -y ffmpeg dumb-init python python3

WORKDIR /app/

COPY --chown=node:node package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY --chown=node:node . ./
RUN yarn prisma generate

COPY --chown=node:node docker-entrypoint.sh /
ENTRYPOINT [ "/docker-entrypoint.sh" ]

USER node

CMD [ "node", "/app/index.js" ]
