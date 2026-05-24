FROM node:20-alpine

WORKDIR /app
COPY examples/app/package.json examples/app/server.js ./
ENV PORT=3001
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O- http://localhost:3001/api/health || exit 1

CMD ["node", "server.js"]
