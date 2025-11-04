# Dockerfile for Postiz Render Deployment
FROM ghcr.io/gitroomhq/postiz-app:latest

# Expose port 4200 for Render
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4200/ || exit 1

# Start command (Postiz default)
CMD ["npm", "start"]
