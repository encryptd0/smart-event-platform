# EventFlow production image
FROM node:20-alpine

# Run as a non-root user for safety.
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy package files first so layer cache is reused when only source changes.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the app.
COPY . .

# Drop privileges.
RUN chown -R app:app /app
USER app

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "app.js"]
