# Untrapd Ecosystem - Production Deployment Guide

## Overview

This package contains everything needed to deploy the Untrapd Ecosystem to production, including:
- Optimized static files
- Production configuration templates
- Automated deployment scripts
- Monitoring and health check tools
- SSL certificate setup utilities

## Quick Start

### 1. Prerequisites

- Ubuntu 20.04+ or CentOS 8+ server
- Root or sudo access
- Domain name pointing to your server
- At least 2GB RAM and 20GB disk space

### 2. Basic Deployment

```bash
# Extract the deployment package
tar -xzf untrapd-ecosystem-production-*.tar.gz
cd untrapd-ecosystem-production-*

# Run the deployment script
sudo ./scripts/deploy.sh
```

### 3. Configure Your Domain

Edit `config/nginx.conf` and replace `yourdomain.com` with your actual domain:

```bash
sed -i 's/yourdomain.com/your-actual-domain.com/g' config/nginx.conf
```

### 4. Setup SSL Certificate

```bash
# For Let's Encrypt (recommended)
sudo ./deployment-tools/ssl/setup-ssl.sh letsencrypt

# For custom certificate
sudo ./deployment-tools/ssl/setup-ssl.sh custom /path/to/cert.crt /path/to/private.key
```

## Detailed Configuration

### Environment Variables

Edit `config/.env.production` to configure:

- **Analytics**: Add your Google Analytics ID
- **Email**: Configure SendGrid or other email service
- **Payments**: Add Stripe keys for payment processing
- **Database**: Configure database connection if needed

### Nginx Configuration

The included `config/nginx.conf` provides:

- ✅ HTTPS redirect
- ✅ Security headers
- ✅ Gzip compression
- ✅ Static file caching
- ✅ Rate limiting protection

### Performance Optimization

#### Static File Caching
- CSS/JS/Images: 1 year cache
- HTML files: 1 hour cache
- Gzip compression enabled

#### Security Features
- HTTPS enforcement
- Security headers (HSTS, X-Frame-Options, etc.)
- Rate limiting
- File access restrictions

## Monitoring & Maintenance

### Health Checks

Run manual health check:
```bash
sudo ./deployment-tools/monitoring/health-check.sh
```

Setup automated monitoring (cron):
```bash
# Add to crontab (every 5 minutes)
*/5 * * * * /path/to/deployment-tools/monitoring/health-check.sh
```

### Performance Monitoring

```bash
./deployment-tools/monitoring/performance-monitor.sh
```

### Log Files

- Health checks: `/var/log/untrapd/health-check.log`
- Performance: `/var/log/untrapd/performance.log`
- Nginx access: `/var/log/nginx/access.log`
- Nginx errors: `/var/log/nginx/error.log`

## Backup & Recovery

### Create Backup

Backups are automatically created during deployment to `/var/backups/untrapd/`

### Manual Backup

```bash
sudo rsync -av /var/www/untrapd/ /var/backups/untrapd/manual_$(date +%Y%m%d_%H%M%S)/
```

### Rollback

```bash
sudo ./scripts/rollback.sh
```

## Scaling & Performance

### CDN Integration

For high traffic, integrate with a CDN:

1. **Cloudflare** (Recommended)
   - Add your domain to Cloudflare
   - Update DNS to point to Cloudflare
   - Enable caching and optimization features

2. **AWS CloudFront**
   - Create distribution pointing to your server
   - Update DNS CNAME records

### Load Balancing

For multiple servers:

1. Setup additional servers with same deployment
2. Use nginx upstream or AWS Load Balancer
3. Configure sticky sessions if needed

## Security Checklist

- ✅ HTTPS enabled with valid certificate
- ✅ Security headers configured
- ✅ File permissions properly set
- ✅ Regular security updates
- ✅ Firewall configured (ports 80, 443, 22 only)
- ✅ SSH key authentication (disable password)
- ✅ Regular backups automated
- ✅ Log monitoring configured

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if backend service is running
   - Verify nginx configuration

2. **SSL Certificate Issues**
   - Verify certificate files exist and have correct permissions
   - Check certificate expiration date

3. **Slow Loading**
   - Run performance monitor
   - Check server resources
   - Verify CDN configuration

### Support

For deployment issues:
1. Check log files in `/var/log/untrapd/`
2. Run health check script
3. Verify all services are running: `sudo systemctl status nginx`

## Advanced Configuration

### Custom Analytics

Replace Google Analytics with custom solution:
1. Remove GA scripts from HTML files
2. Add your analytics service scripts
3. Update privacy policy

### Payment Integration

Configure Stripe integration:
1. Add production API keys to `.env.production`
2. Update webhook endpoints
3. Test payment flow

### Email Marketing

Setup email service:
1. Configure SendGrid API key
2. Setup email templates
3. Configure SMTP settings

## Version Information

- **Version**: 1.0.0-production-ready
- **Build Date**: Generated automatically
- **Node.js**: 16+ recommended
- **Nginx**: 1.18+ required
- **SSL**: Let's Encrypt or custom certificate

## License

Professional license included for commercial use.
