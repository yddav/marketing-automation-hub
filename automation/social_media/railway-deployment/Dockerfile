FROM ghcr.io/gitroomhq/postiz-app:latest

# Expose ports
EXPOSE 3000 4200 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start Postiz
CMD ["node", "dist/index.js"]
