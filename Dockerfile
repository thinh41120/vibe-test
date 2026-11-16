# Game Đập chuột — server tĩnh Node.js (không có thư viện ngoài)
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /srv

# Server trước (ít thay đổi), sau đó tới nội dung game
COPY --chown=node:node server/ ./server/
COPY --chown=node:node design/ ./design/
COPY --chown=node:node app/ ./app/

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/healthz" || exit 1

CMD ["node", "server/server.js"]
