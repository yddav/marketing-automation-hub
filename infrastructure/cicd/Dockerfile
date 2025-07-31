# Multi-stage Dockerfile for Marketing Automation Hub
# Production-optimized with security hardening

# Build Stage
FROM node:18-alpine AS builder

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --no-optional && npm cache clean --force

# Copy source code
COPY . .

# Build application (if build step exists)
RUN if [ -f "package.json" ] && npm run | grep -q "build"; then npm run build; fi

# Remove dev dependencies and clean up
RUN npm prune --production && \
    rm -rf node_modules/.cache && \
    rm -rf /tmp/* /var/tmp/*

# Production Stage
FROM node:18-alpine AS production

# Security hardening
RUN apk add --no-cache dumb-init && \
    apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=appuser:nodejs /app/package*.json ./
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/src ./src
COPY --from=builder --chown=appuser:nodejs /app/public ./public
COPY --from=builder --chown=appuser:nodejs /app/content_templates ./content_templates

# Copy any build artifacts if they exist
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist 2>/dev/null || true
COPY --from=builder --chown=appuser:nodejs /app/build ./build 2>/dev/null || true

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/cache /app/tmp && \
    chown -R appuser:nodejs /app && \
    chmod -R 755 /app && \
    chmod -R 770 /app/logs /app/cache /app/tmp

# Security: Remove unnecessary packages and files
RUN rm -rf /usr/local/lib/node_modules/npm && \
    rm -rf /opt/yarn-* && \
    rm -rf /tmp/* /var/tmp/* && \
    find /app -name "*.md" -not -path "*/node_modules/*" -delete && \
    find /app -name "test*" -not -path "*/node_modules/*" -type d -exec rm -rf {} + 2>/dev/null || true

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000
EXPOSE 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV METRICS_PORT=9090

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]

# Metadata
LABEL maintainer="DevOps Team <devops@yourdomain.com>"
LABEL version="2.0.0"
LABEL description="Marketing Automation Hub - Production Container"
LABEL org.opencontainers.image.title="Marketing Automation Hub"
LABEL org.opencontainers.image.description="Multi-agent marketing automation system"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.vendor="Your Company"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/your-org/marketing-automation-hub"