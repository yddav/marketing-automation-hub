// Automated Order Fulfillment Service
// AGENT BRAVO - PAYMENT SYSTEM DEPLOYMENT

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const crypto = require('crypto');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Automated Bundle Generation and Delivery Service
 * Handles ZIP creation, file hosting, and secure download delivery
 */
class FulfillmentService {
  constructor() {
    this.bundlesPath = path.join(__dirname, '../../commercial_bundles');
    this.downloadsPath = path.join(__dirname, '../../public/downloads');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/fulfillment.log' }),
        new winston.transports.Console()
      ]
    });

    // Bundle configurations
    this.bundleConfigs = {
      starter: {
        name: 'Marketing_Automation_Starter_Bundle',
        sourcePath: 'starter',
        price: 199,
        files: [
          'content_templates/',
          'setup_guides/',
          'demo_videos/',
          'LICENSE_STARTER.md'
        ],
        estimatedSize: '50MB',
        setupTime: '2-4 hours'
      },
      professional: {
        name: 'Marketing_Automation_Professional_Bundle', 
        sourcePath: 'professional',
        price: 299,
        files: [
          'content_templates/',
          'analytics_dashboard/',
          'api_framework/',
          'automation_scripts/',
          'advanced_guides/',
          'video_tutorials/',
          'LICENSE_PROFESSIONAL.md'
        ],
        estimatedSize: '250MB',
        setupTime: '1-2 days'
      },
      enterprise: {
        name: 'Marketing_Automation_Enterprise_Bundle',
        sourcePath: 'enterprise', 
        price: 597,
        files: [
          'complete_source_code/',
          'multi_agent_framework/',
          'customization_toolkit/',
          'production_deployment/',
          'enterprise_guides/',
          'consultation_materials/',
          'LICENSE_ENTERPRISE.md'
        ],
        estimatedSize: '1.2GB',
        setupTime: '1 week'
      }
    };

    this.initializeDirectories();
  }

  /**
   * Initialize required directories
   */
  async initializeDirectories() {
    try {
      await fs.ensureDir(this.downloadsPath);
      await fs.ensureDir(path.join(this.downloadsPath, 'temp'));
      
      this.logger.info('Fulfillment directories initialized');
    } catch (error) {
      this.logger.error('Failed to initialize directories:', error);
    }
  }

  /**
   * Main order fulfillment method
   */
  async fulfillOrder({ customer, productTier, saleId }) {
    try {
      this.logger.info('Starting order fulfillment:', {
        sale_id: saleId,
        customer_email: customer.email,
        product_tier: productTier
      });

      // Generate unique download token
      const downloadToken = this.generateDownloadToken(saleId, customer.email);

      // Create bundle ZIP file
      const zipResult = await this.createBundleZip(productTier, downloadToken);

      // Create secure download link
      const downloadLink = this.createSecureDownloadLink(downloadToken, productTier);

      // Set expiration (7 days from now)
      const expiresAt = moment().add(7, 'days').toDate();

      // Store download record
      await this.storeDownloadRecord({
        token: downloadToken,
        saleId: saleId,
        customerEmail: customer.email,
        productTier: productTier,
        zipPath: zipResult.filePath,
        createdAt: new Date(),
        expiresAt: expiresAt,
        downloadCount: 0,
        maxDownloads: 5
      });

      this.logger.info('Order fulfilled successfully:', {
        sale_id: saleId,
        download_token: downloadToken,
        zip_size: zipResult.sizeBytes,
        expires_at: expiresAt
      });

      return {
        status: 'fulfilled',
        downloadLink: downloadLink,
        downloadToken: downloadToken,
        expiresAt: expiresAt,
        bundleSize: zipResult.sizeFormatted,
        maxDownloads: 5
      };

    } catch (error) {
      this.logger.error('Order fulfillment failed:', {
        sale_id: saleId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Create bundle ZIP file
   */
  async createBundleZip(productTier, downloadToken) {
    const config = this.bundleConfigs[productTier];
    if (!config) {
      throw new Error(`Unknown product tier: ${productTier}`);
    }

    const sourcePath = path.join(this.bundlesPath, config.sourcePath);
    const fileName = `${config.name}_${downloadToken}.zip`;
    const outputPath = path.join(this.downloadsPath, fileName);

    // Verify source directory exists
    if (!(await fs.pathExists(sourcePath))) {
      throw new Error(`Bundle source not found: ${sourcePath}`);
    }

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      let totalBytes = 0;

      output.on('close', () => {
        const sizeBytes = archive.pointer();
        const sizeFormatted = this.formatBytes(sizeBytes);
        
        resolve({
          filePath: outputPath,
          fileName: fileName,
          sizeBytes: sizeBytes,
          sizeFormatted: sizeFormatted
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.on('progress', (progress) => {
        totalBytes = progress.fs.processedBytes;
      });

      archive.pipe(output);

      // Add files based on bundle configuration
      config.files.forEach(file => {
        const fullPath = path.join(sourcePath, file);
        
        if (file.endsWith('/')) {
          // Directory
          archive.directory(fullPath, file);
        } else {
          // Individual file
          archive.file(fullPath, { name: file });
        }
      });

      // Add purchase receipt
      const receipt = this.generatePurchaseReceipt(productTier, downloadToken);
      archive.append(receipt, { name: 'PURCHASE_RECEIPT.txt' });

      // Add setup instructions
      const setupInstructions = this.generateSetupInstructions(productTier);
      archive.append(setupInstructions, { name: 'SETUP_INSTRUCTIONS.md' });

      archive.finalize();
    });
  }

  /**
   * Generate unique download token
   */
  generateDownloadToken(saleId, email) {
    const data = `${saleId}-${email}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  /**
   * Create secure download link
   */
  createSecureDownloadLink(token, productTier) {
    return `${this.baseUrl}/download/${token}?tier=${productTier}`;
  }

  /**
   * Store download record in database
   */
  async storeDownloadRecord(record) {
    try {
      // Simple file-based storage for now (can be upgraded to database)
      const recordsPath = path.join(this.downloadsPath, 'download_records.json');
      
      let records = {};
      if (await fs.pathExists(recordsPath)) {
        records = await fs.readJson(recordsPath);
      }

      records[record.token] = record;
      await fs.writeJson(recordsPath, records, { spaces: 2 });

    } catch (error) {
      this.logger.error('Failed to store download record:', error);
      throw error;
    }
  }

  /**
   * Handle secure download request
   */
  async handleDownloadRequest(token, req, res) {
    try {
      // Get download record
      const record = await this.getDownloadRecord(token);
      
      if (!record) {
        return res.status(404).json({ error: 'Download not found' });
      }

      // Check expiration
      if (new Date() > new Date(record.expiresAt)) {
        return res.status(410).json({ error: 'Download link expired' });
      }

      // Check download limit
      if (record.downloadCount >= record.maxDownloads) {
        return res.status(429).json({ error: 'Download limit exceeded' });
      }

      // Verify file exists
      if (!(await fs.pathExists(record.zipPath))) {
        this.logger.error('Download file missing:', { token, zipPath: record.zipPath });
        return res.status(500).json({ error: 'Download file not available' });
      }

      // Update download count
      await this.incrementDownloadCount(token);

      // Stream file download
      const fileName = path.basename(record.zipPath);
      const fileSize = (await fs.stat(record.zipPath)).size;

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fileSize);

      const fileStream = fs.createReadStream(record.zipPath);
      fileStream.pipe(res);

      this.logger.info('Download served:', {
        token,
        customer_email: record.customerEmail,
        product_tier: record.productTier,
        download_count: record.downloadCount + 1,
        file_size: this.formatBytes(fileSize)
      });

    } catch (error) {
      this.logger.error('Download request failed:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  }

  /**
   * Get download record
   */
  async getDownloadRecord(token) {
    try {
      const recordsPath = path.join(this.downloadsPath, 'download_records.json');
      
      if (!(await fs.pathExists(recordsPath))) {
        return null;
      }

      const records = await fs.readJson(recordsPath);
      return records[token] || null;

    } catch (error) {
      this.logger.error('Failed to get download record:', error);
      return null;
    }
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(token) {
    try {
      const recordsPath = path.join(this.downloadsPath, 'download_records.json');
      const records = await fs.readJson(recordsPath);
      
      if (records[token]) {
        records[token].downloadCount = (records[token].downloadCount || 0) + 1;
        records[token].lastDownloadAt = new Date();
        await fs.writeJson(recordsPath, records, { spaces: 2 });
      }

    } catch (error) {
      this.logger.error('Failed to increment download count:', error);
    }
  }

  /**
   * Generate purchase receipt
   */
  generatePurchaseReceipt(productTier, downloadToken) {
    const config = this.bundleConfigs[productTier];
    const now = new Date();

    return `
MARKETING AUTOMATION HUB - PURCHASE RECEIPT
==========================================

Product: ${config.name}
Tier: ${productTier.toUpperCase()}
Purchase Date: ${now.toLocaleDateString()}
Download Token: ${downloadToken}

BUNDLE CONTENTS:
${config.files.map(file => `- ${file}`).join('\n')}

ESTIMATED SETUP TIME: ${config.setupTime}
BUNDLE SIZE: ${config.estimatedSize}

SUPPORT:
- Email: support@marketingautomationhub.com
- Setup Guides: Included in bundle
- Video Tutorials: ${productTier !== 'starter' ? 'Included' : 'Basic tutorials included'}

DOWNLOAD INFORMATION:
- Maximum Downloads: 5
- Link Expires: 7 days from purchase
- File Format: ZIP archive

Thank you for your purchase!
Marketing Automation Hub Team
    `.trim();
  }

  /**
   * Generate setup instructions
   */
  generateSetupInstructions(productTier) {
    const config = this.bundleConfigs[productTier];

    return `
# ${config.name} - Setup Instructions

## Quick Start Guide

### Step 1: Extract Files
1. Extract the ZIP file to your desired directory
2. Navigate to the extracted folder
3. Review the README.md file for detailed instructions

### Step 2: Environment Setup
\`\`\`bash
# Install Node.js dependencies (if applicable)
npm install

# Copy environment variables
cp .env.example .env

# Configure your API keys
nano .env
\`\`\`

### Step 3: Configuration
1. Follow the setup guides in the \`setup_guides/\` directory
2. Configure your brand settings in \`content_templates/brand_system/\`
3. Test API connections using provided scripts

### Step 4: Deployment
- **Starter**: Follow QUICK_START_GUIDE.md
- **Professional**: Review MULTI_PLATFORM_SETUP.md  
- **Enterprise**: See PRODUCTION_DEPLOYMENT.md

## Support Resources

- **Email**: support@marketingautomationhub.com
- **Documentation**: All guides included in bundle
- **Video Tutorials**: ${productTier !== 'starter' ? 'Professional tutorials included' : 'Basic tutorials included'}
- **Setup Time**: ${config.setupTime}

## Bundle Contents

${config.files.map(file => `- **${file}**: ${this.getFileDescription(file)}`).join('\n')}

---

**Need Help?** Contact support with your purchase receipt for priority assistance.
    `.trim();
  }

  /**
   * Get file description for setup instructions
   */
  getFileDescription(file) {
    const descriptions = {
      'content_templates/': 'Pre-built marketing content templates',
      'setup_guides/': 'Step-by-step configuration instructions',  
      'demo_videos/': 'Video tutorials and walkthroughs',
      'analytics_dashboard/': 'Real-time analytics and reporting tools',
      'api_framework/': 'API integration utilities and examples',
      'automation_scripts/': 'Automated deployment and management scripts',
      'complete_source_code/': 'Full application source code',
      'multi_agent_framework/': 'Multi-agent development system',
      'customization_toolkit/': 'Brand customization and white-label tools',
      'production_deployment/': 'Production-ready deployment configurations',
      'enterprise_guides/': 'Enterprise setup and scaling documentation',
      'consultation_materials/': 'Strategy framework and ROI calculator'
    };

    return descriptions[file] || 'Additional resources and documentation';
  }

  /**
   * Revoke access (for refunds)
   */
  async revokeAccess(saleId) {
    try {
      const recordsPath = path.join(this.downloadsPath, 'download_records.json');
      
      if (!(await fs.pathExists(recordsPath))) {
        return;
      }

      const records = await fs.readJson(recordsPath);
      
      // Find and disable record
      for (const [token, record] of Object.entries(records)) {
        if (record.saleId === saleId) {
          record.revoked = true;
          record.revokedAt = new Date();
          record.expiresAt = new Date(); // Expire immediately
          
          // Optionally remove ZIP file
          if (await fs.pathExists(record.zipPath)) {
            await fs.remove(record.zipPath);
          }
        }
      }

      await fs.writeJson(recordsPath, records, { spaces: 2 });
      
      this.logger.info('Access revoked for sale:', { sale_id: saleId });

    } catch (error) {
      this.logger.error('Failed to revoke access:', error);
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clean up expired downloads
   */
  async cleanupExpiredDownloads() {
    try {
      const recordsPath = path.join(this.downloadsPath, 'download_records.json');
      
      if (!(await fs.pathExists(recordsPath))) {
        return;
      }

      const records = await fs.readJson(recordsPath);
      const now = new Date();
      let cleanedCount = 0;

      for (const [token, record] of Object.entries(records)) {
        if (new Date(record.expiresAt) < now) {
          // Remove expired file
          if (await fs.pathExists(record.zipPath)) {
            await fs.remove(record.zipPath);
          }
          
          // Remove record
          delete records[token];
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        await fs.writeJson(recordsPath, records, { spaces: 2 });
        this.logger.info('Cleaned up expired downloads:', { count: cleanedCount });
      }

    } catch (error) {
      this.logger.error('Cleanup failed:', error);
    }
  }
}

module.exports = FulfillmentService;