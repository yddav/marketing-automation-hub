# Production Deployment Guide
## Marketing Automation Hub - Enterprise Infrastructure

### Overview
This guide provides step-by-step instructions for deploying the enterprise-grade production infrastructure for the Marketing Automation Hub, designed to handle 100K+ concurrent users during Product Hunt launches.

## Infrastructure Architecture

### Core Components
- **Kubernetes Cluster**: Auto-scaling container orchestration
- **PostgreSQL**: High-availability database with read replicas
- **Redis Cluster**: Distributed caching and session management
- **NGINX Ingress**: Load balancing with DDoS protection
- **Prometheus/Grafana**: Comprehensive monitoring and alerting
- **Velero**: Disaster recovery and backup automation

### Performance Targets
- **Uptime**: 99.99% availability
- **Latency**: <100ms API response time
- **Scaling**: 2-50 instances in <2 minutes
- **Recovery**: <30 second deployment rollbacks

## Prerequisites

### Required Tools
```bash
# Install required CLI tools
kubectl version --client  # v1.28+
helm version             # v3.12+
velero version          # v1.11+
```

### Cloud Resources
- **Kubernetes Cluster**: EKS/GKE/AKS with 3+ nodes
- **Storage**: SSD-backed persistent volumes
- **Networking**: Load balancer with SSL termination
- **DNS**: Route53/CloudFlare for failover
- **Backup Storage**: S3-compatible object storage

## Deployment Steps

### 1. Cluster Preparation

```bash
# Create namespaces
kubectl apply -f infrastructure/kubernetes/namespace.yaml

# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.metrics.enabled=true

# Install Cert Manager for SSL
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

### 2. Database Infrastructure

```bash
# Install CloudNativePG Operator
kubectl apply -f \
  https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.20/releases/cnpg-1.20.0.yaml

# Install Redis Operator
kubectl apply -f \
  https://raw.githubusercontent.com/OT-CONTAINER-KIT/redis-operator/master/config/manager/manager.yaml

# Deploy database infrastructure
kubectl apply -f infrastructure/kubernetes/database.yaml
```

### 3. Security Configuration

```bash
# Install OPA Gatekeeper
kubectl apply -f \
  https://raw.githubusercontent.com/open-policy-agent/gatekeeper/release-3.14/deploy/gatekeeper.yaml

# Apply security policies
kubectl apply -f infrastructure/security/security-policies.yaml
kubectl apply -f infrastructure/security/network-policies.yaml

# Configure secrets (requires sealed-secrets or external-secrets)
kubectl apply -f infrastructure/security/secrets.yaml
```

### 4. Monitoring Stack

```bash
# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Deploy custom monitoring configuration
kubectl apply -f infrastructure/monitoring/prometheus.yaml
kubectl apply -f infrastructure/monitoring/grafana.yaml
kubectl apply -f infrastructure/monitoring/alerting.yaml
```

### 5. Application Deployment

```bash
# Deploy the application
kubectl apply -f infrastructure/kubernetes/deployment.yaml
kubectl apply -f infrastructure/kubernetes/service.yaml
kubectl apply -f infrastructure/kubernetes/ingress.yaml

# Configure auto-scaling
kubectl apply -f infrastructure/kubernetes/hpa.yaml

# Verify deployment
kubectl get pods -n marketing-automation
kubectl get svc -n marketing-automation
```

### 6. Disaster Recovery Setup

```bash
# Install Velero
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --set-file credentials.secretContents.cloud=credentials-velero

# Configure backup schedules
kubectl apply -f infrastructure/disaster-recovery/backup-strategy.yaml

# Setup failover automation
kubectl apply -f infrastructure/disaster-recovery/failover-automation.yaml
```

## CI/CD Pipeline Setup

### GitHub Actions Configuration

1. **Repository Secrets**:
   ```
   KUBECONFIG_PRODUCTION: Base64 encoded kubeconfig
   KUBECONFIG_STAGING: Base64 encoded staging kubeconfig
   SONAR_TOKEN: SonarCloud authentication token
   SNYK_TOKEN: Snyk security scanning token
   SLACK_WEBHOOK: Slack notifications webhook URL
   ```

2. **Deploy Pipeline**:
   ```bash
   # Copy GitHub Actions workflow
   cp infrastructure/ci-cd/github-actions.yaml .github/workflows/production.yml
   
   # Update container registry settings
   # Edit .github/workflows/production.yml
   ```

### Build and Deploy

```bash
# Build production Docker image
docker build -f infrastructure/ci-cd/Dockerfile -t marketing-automation-hub:2.0.0 .

# Push to registry
docker tag marketing-automation-hub:2.0.0 ghcr.io/your-org/marketing-automation-hub:2.0.0
docker push ghcr.io/your-org/marketing-automation-hub:2.0.0

# Deploy via GitOps or manual
kubectl set image deployment/marketing-automation-hub \
  marketing-hub=ghcr.io/your-org/marketing-automation-hub:2.0.0 \
  -n marketing-automation
```

## Performance Testing

### Load Testing Setup

```bash
# Install Artillery.js
npm install -g artillery

# Run performance tests
artillery run infrastructure/ci-cd/performance-tests.yml

# Validate performance targets
# - Response time <100ms (95th percentile)
# - Error rate <0.1%
# - Successful scaling to 50 instances
```

### Scaling Validation

```bash
# Test auto-scaling
kubectl run load-generator \
  --image=busybox \
  --restart=Never \
  -- /bin/sh -c "while true; do wget -q -O- http://marketing-automation-service/health; done"

# Monitor scaling
kubectl get hpa -n marketing-automation -w
kubectl get pods -n marketing-automation -w
```

## Monitoring and Alerting

### Dashboard Access

- **Grafana**: https://grafana.yourdomain.com
  - Username: admin
  - Password: (from grafana-credentials secret)

- **Prometheus**: Internal cluster access only
  - URL: http://prometheus-service.monitoring:9090

### Key Metrics to Monitor

1. **Application Metrics**:
   - Response time (target: <100ms)
   - Error rate (target: <0.1%)
   - Request throughput
   - Active users

2. **Infrastructure Metrics**:
   - CPU utilization (target: <70%)
   - Memory usage (target: <80%)
   - Disk I/O
   - Network throughput

3. **Database Metrics**:
   - Connection pool usage
   - Query performance
   - Replication lag
   - Lock contention

### Alert Configuration

Critical alerts automatically notify via:
- Slack: #alerts-critical channel
- Email: devops@yourdomain.com
- PagerDuty: (if configured)

## Security Checklist

### Pre-Production Security Validation

- [ ] Network policies implemented and tested
- [ ] Pod security standards enforced
- [ ] Secrets properly encrypted and rotated
- [ ] Image vulnerability scanning passed
- [ ] TLS certificates installed and valid
- [ ] WAF rules configured and active
- [ ] Rate limiting enabled and tested
- [ ] Security headers configured

### Ongoing Security Operations

- [ ] Daily vulnerability scans
- [ ] Weekly security policy reviews
- [ ] Monthly penetration testing
- [ ] Quarterly security audit

## Disaster Recovery Testing

### DR Drill Procedure

1. **Simulate Primary Failure**:
   ```bash
   # Simulate region failure
   kubectl scale deployment marketing-automation-hub --replicas=0 -n marketing-automation
   ```

2. **Verify Failover**:
   ```bash
   # Check DR region activation
   kubectl --kubeconfig=dr-cluster get pods -n marketing-automation
   ```

3. **Test Recovery**:
   ```bash
   # Restore primary region
   kubectl scale deployment marketing-automation-hub --replicas=3 -n marketing-automation
   ```

### Backup Verification

```bash
# Verify daily backups
velero backup get --selector backup-type=daily

# Test restore capability
velero restore create test-restore --from-backup daily-backup-20241129

# Verify database backups
kubectl logs -n marketing-automation -l app=postgres-backup
```

## Troubleshooting

### Common Issues

1. **Pods Not Starting**:
   ```bash
   kubectl describe pod <pod-name> -n marketing-automation
   kubectl logs <pod-name> -n marketing-automation
   ```

2. **Database Connection Issues**:
   ```bash
   kubectl exec -it deployment/marketing-automation-hub -n marketing-automation -- \
     node -e "console.log(process.env.DATABASE_URL)"
   ```

3. **SSL Certificate Issues**:
   ```bash
   kubectl describe certificate marketing-automation-tls -n marketing-automation
   kubectl get certificaterequest -n marketing-automation
   ```

4. **Auto-scaling Not Working**:
   ```bash
   kubectl describe hpa marketing-automation-hpa -n marketing-automation
   kubectl top pods -n marketing-automation
   ```

### Emergency Procedures

#### Complete System Recovery

```bash
# 1. Restore from backup
velero restore create emergency-restore --from-backup latest-backup

# 2. Verify database integrity
kubectl exec -it postgres-cluster-primary-0 -n marketing-automation -- \
  psql -U postgres -d marketing_automation_hub -c "SELECT count(*) FROM information_schema.tables;"

# 3. Scale application
kubectl scale deployment marketing-automation-hub --replicas=5 -n marketing-automation

# 4. Verify functionality
curl -I https://marketing-hub.yourdomain.com/health
```

#### Rollback Deployment

```bash
# Quick rollback to previous version
kubectl rollout undo deployment/marketing-automation-hub -n marketing-automation

# Rollback to specific revision
kubectl rollout undo deployment/marketing-automation-hub --to-revision=2 -n marketing-automation

# Verify rollback
kubectl rollout status deployment/marketing-automation-hub -n marketing-automation
```

## Performance Optimization

### Database Optimization

```sql
-- Enable query performance insights
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Optimize for high concurrency
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET shared_buffers = '256MB';
```

### Application Tuning

```bash
# Adjust resource limits based on monitoring
kubectl patch deployment marketing-automation-hub -n marketing-automation -p '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "marketing-hub",
          "resources": {
            "requests": {"memory": "512Mi", "cpu": "500m"},
            "limits": {"memory": "2Gi", "cpu": "2000m"}
          }
        }]
      }
    }
  }
}'
```

## Maintenance Procedures

### Regular Maintenance Schedule

**Daily**:
- Review monitoring dashboards
- Check backup completion
- Verify auto-scaling metrics

**Weekly**:
- Update security patches
- Review resource utilization
- Test disaster recovery procedures

**Monthly**:
- Performance optimization review
- Security audit and penetration testing
- Capacity planning assessment

### Planned Maintenance Windows

```bash
# 1. Scale down for maintenance
kubectl scale deployment marketing-automation-hub --replicas=1 -n marketing-automation

# 2. Apply updates
kubectl apply -f updated-manifests/

# 3. Verify deployment
kubectl rollout status deployment/marketing-automation-hub -n marketing-automation

# 4. Scale back up
kubectl scale deployment marketing-automation-hub --replicas=3 -n marketing-automation
```

## Support Contacts

- **DevOps Team**: devops@yourdomain.com
- **Security Team**: security@yourdomain.com
- **On-Call Engineer**: +1-555-DEVOPS-1

## Documentation Updates

This guide should be updated whenever:
- Infrastructure components are modified
- New monitoring is added
- Security policies change
- Performance targets are adjusted

Last Updated: 2024-01-29
Version: 2.0.0