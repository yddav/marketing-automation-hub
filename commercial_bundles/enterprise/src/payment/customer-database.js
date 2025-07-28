// Customer Database and Management System
// AGENT BRAVO - PAYMENT SYSTEM DEPLOYMENT

const fs = require('fs-extra');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Customer Database Management System
 * Handles customer records, purchase history, and analytics tracking
 */
class CustomerDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/customers.db');
    this.dataDir = path.dirname(this.dbPath);
    this.db = null;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/customer-db.log' }),
        new winston.transports.Console()
      ]
    });

    this.initializeDatabase();
  }

  /**
   * Initialize SQLite database and create tables
   */
  async initializeDatabase() {
    try {
      // Ensure data directory exists
      await fs.ensureDir(this.dataDir);

      // Create database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          this.logger.error('Database connection failed:', err);
          throw err;
        }
        this.logger.info('Customer database connected');
      });

      // Create tables
      await this.createTables();
      
    } catch (error) {
      this.logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  createTables() {
    return new Promise((resolve, reject) => {
      const queries = [
        // Customers table
        `CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          total_spent DECIMAL(10,2) DEFAULT 0,
          purchase_count INTEGER DEFAULT 0,
          last_purchase_date DATETIME,
          country TEXT,
          status TEXT DEFAULT 'active',
          marketing_consent BOOLEAN DEFAULT 1,
          support_tier TEXT DEFAULT 'standard',
          notes TEXT
        )`,

        // Purchases table
        `CREATE TABLE IF NOT EXISTS purchases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          sale_id TEXT UNIQUE NOT NULL,
          product_tier TEXT NOT NULL,
          product_name TEXT,
          price DECIMAL(10,2) NOT NULL,
          currency TEXT DEFAULT 'USD',
          purchase_date DATETIME NOT NULL,
          payment_method TEXT DEFAULT 'gumroad',
          status TEXT DEFAULT 'completed',
          refund_amount DECIMAL(10,2) DEFAULT 0,
          refund_date DATETIME,
          refund_reason TEXT,
          download_count INTEGER DEFAULT 0,
          last_download_date DATETIME,
          fulfillment_status TEXT DEFAULT 'pending',
          fulfillment_date DATETIME,
          is_recurring BOOLEAN DEFAULT 0,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )`,

        // Support tickets table
        `CREATE TABLE IF NOT EXISTS support_tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          ticket_id TEXT UNIQUE NOT NULL,
          subject TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT DEFAULT 'open',
          priority TEXT DEFAULT 'normal',
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME,
          assigned_to TEXT,
          resolution_notes TEXT,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )`,

        // Customer communications table
        `CREATE TABLE IF NOT EXISTS communications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          type TEXT NOT NULL,
          subject TEXT,
          content TEXT,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          email_provider TEXT,
          status TEXT DEFAULT 'sent',
          template_used TEXT,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )`,

        // Create indexes for better performance
        `CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`,
        `CREATE INDEX IF NOT EXISTS idx_purchases_sale_id ON purchases(sale_id)`,
        `CREATE INDEX IF NOT EXISTS idx_purchases_customer_id ON purchases(customer_id)`,
        `CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_id ON support_tickets(customer_id)`,
        `CREATE INDEX IF NOT EXISTS idx_communications_customer_id ON communications(customer_id)`
      ];

      let completedQueries = 0;
      
      queries.forEach((query, index) => {
        this.db.run(query, (err) => {
          if (err) {
            this.logger.error(`Table creation failed for query ${index}:`, err);
            reject(err);
            return;
          }
          
          completedQueries++;
          if (completedQueries === queries.length) {
            this.logger.info('All database tables created successfully');
            resolve();
          }
        });
      });
    });
  }

  /**
   * Create new customer record
   */
  async createCustomer({
    email,
    name,
    saleId,
    productTier,
    price,
    currency = 'USD',
    purchaseDate,
    country,
    isRecurring = false
  }) {
    return new Promise((resolve, reject) => {
      const customerUuid = uuidv4();
      
      // First, try to find existing customer
      this.db.get(
        'SELECT * FROM customers WHERE email = ?',
        [email],
        async (err, existingCustomer) => {
          if (err) {
            reject(err);
            return;
          }

          let customerId;
          
          if (existingCustomer) {
            // Update existing customer
            customerId = existingCustomer.id;
            
            this.db.run(
              `UPDATE customers 
               SET total_spent = total_spent + ?,
                   purchase_count = purchase_count + 1,
                   last_purchase_date = ?,
                   updated_at = CURRENT_TIMESTAMP,
                   country = COALESCE(?, country),
                   name = COALESCE(?, name)
               WHERE id = ?`,
              [price, purchaseDate, country, name, customerId],
              (updateErr) => {
                if (updateErr) {
                  reject(updateErr);
                  return;
                }
              }
            );
          } else {
            // Create new customer
            this.db.run(
              `INSERT INTO customers 
               (uuid, email, name, total_spent, purchase_count, last_purchase_date, country)
               VALUES (?, ?, ?, ?, 1, ?, ?)`,
              [customerUuid, email, name, price, purchaseDate, country],
              function(insertErr) {
                if (insertErr) {
                  reject(insertErr);
                  return;
                }
                customerId = this.lastID;
              }
            );
          }

          // Create purchase record
          await this.createPurchaseRecord({
            customerId: customerId,
            saleId: saleId,
            productTier: productTier,
            price: price,
            currency: currency,
            purchaseDate: purchaseDate,
            isRecurring: isRecurring
          });

          // Get complete customer record
          this.db.get(
            'SELECT * FROM customers WHERE id = ?',
            [customerId],
            (selectErr, customer) => {
              if (selectErr) {
                reject(selectErr);
                return;
              }

              this.logger.info('Customer record created/updated:', {
                customer_id: customerId,
                email: email,
                sale_id: saleId,
                is_new_customer: !existingCustomer
              });

              resolve({
                ...customer,
                saleId: saleId,
                productTier: productTier,
                price: price
              });
            }
          );
        }
      );
    });
  }

  /**
   * Create purchase record
   */
  createPurchaseRecord({
    customerId,
    saleId,
    productTier,
    price,
    currency,
    purchaseDate,
    isRecurring
  }) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO purchases 
         (customer_id, sale_id, product_tier, price, currency, purchase_date, is_recurring)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customerId, saleId, productTier, price, currency, purchaseDate, isRecurring ? 1 : 0],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Update purchase fulfillment status
   */
  async updateFulfillmentStatus(saleId, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE purchases 
         SET fulfillment_status = ?, fulfillment_date = CURRENT_TIMESTAMP
         WHERE sale_id = ?`,
        [status, saleId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  /**
   * Process refund
   */
  async processRefund(saleId, { refundAmount, refundReason, refundDate }) {
    return new Promise((resolve, reject) => {
      // Get purchase info first
      this.db.get(
        'SELECT * FROM purchases WHERE sale_id = ?',
        [saleId],
        (err, purchase) => {
          if (err) {
            reject(err);
            return;
          }

          if (!purchase) {
            reject(new Error(`Purchase not found: ${saleId}`));
            return;
          }

          // Update purchase record
          this.db.run(
            `UPDATE purchases 
             SET refund_amount = ?, refund_reason = ?, refund_date = ?, status = 'refunded'
             WHERE sale_id = ?`,
            [refundAmount, refundReason, refundDate, saleId],
            (updateErr) => {
              if (updateErr) {
                reject(updateErr);
                return;
              }

              // Update customer total spent
              this.db.run(
                `UPDATE customers 
                 SET total_spent = total_spent - ?
                 WHERE id = ?`,
                [refundAmount, purchase.customer_id],
                (customerUpdateErr) => {
                  if (customerUpdateErr) {
                    reject(customerUpdateErr);
                    return;
                  }

                  this.logger.info('Refund processed:', {
                    sale_id: saleId,
                    refund_amount: refundAmount,
                    reason: refundReason
                  });

                  resolve();
                }
              );
            }
          );
        }
      );
    });
  }

  /**
   * Create support ticket
   */
  async createSupportTicket(customerEmail, { subject, description, category = 'general', priority = 'normal' }) {
    return new Promise((resolve, reject) => {
      // Find customer
      this.db.get(
        'SELECT id FROM customers WHERE email = ?',
        [customerEmail],
        (err, customer) => {
          if (err) {
            reject(err);
            return;
          }

          if (!customer) {
            reject(new Error(`Customer not found: ${customerEmail}`));
            return;
          }

          const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

          this.db.run(
            `INSERT INTO support_tickets 
             (customer_id, ticket_id, subject, description, category, priority)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [customer.id, ticketId, subject, description, category, priority],
            function(insertErr) {
              if (insertErr) {
                reject(insertErr);
                return;
              }

              this.logger.info('Support ticket created:', {
                ticket_id: ticketId,
                customer_email: customerEmail,
                subject: subject,
                priority: priority
              });

              resolve({
                ticketId: ticketId,
                customerId: customer.id,
                subject: subject,
                description: description,
                category: category,
                priority: priority,
                status: 'open'
              });
            }
          );
        }
      );
    });
  }

  /**
   * Log customer communication
   */
  async logCommunication(customerEmail, { type, subject, content, template }) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id FROM customers WHERE email = ?',
        [customerEmail],
        (err, customer) => {
          if (err) {
            reject(err);
            return;
          }

          if (!customer) {
            reject(new Error(`Customer not found: ${customerEmail}`));
            return;
          }

          this.db.run(
            `INSERT INTO communications 
             (customer_id, type, subject, content, template_used)
             VALUES (?, ?, ?, ?, ?)`,
            [customer.id, type, subject, content, template],
            function(insertErr) {
              if (insertErr) {
                reject(insertErr);
                return;
              }
              resolve(this.lastID);
            }
          );
        }
      );
    });
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(timeframe = '30d') {
    return new Promise((resolve, reject) => {
      const queries = {
        totalCustomers: 'SELECT COUNT(*) as count FROM customers',
        totalRevenue: 'SELECT SUM(total_spent) as revenue FROM customers',
        avgOrderValue: 'SELECT AVG(price) as avg_value FROM purchases WHERE status = "completed"',
        tierBreakdown: `
          SELECT product_tier, COUNT(*) as count, SUM(price) as revenue 
          FROM purchases WHERE status = "completed" 
          GROUP BY product_tier
        `,
        recentCustomers: `
          SELECT email, name, total_spent, purchase_count, created_at 
          FROM customers 
          ORDER BY created_at DESC 
          LIMIT 10
        `,
        monthlyRevenue: `
          SELECT 
            strftime('%Y-%m', purchase_date) as month,
            COUNT(*) as sales,
            SUM(price) as revenue
          FROM purchases 
          WHERE status = 'completed' 
            AND purchase_date >= date('now', '-12 months')
          GROUP BY strftime('%Y-%m', purchase_date)
          ORDER BY month
        `
      };

      const results = {};
      let completedQueries = 0;
      const totalQueries = Object.keys(queries).length;

      Object.entries(queries).forEach(([key, query]) => {
        this.db.all(query, (err, rows) => {
          if (err) {
            reject(err);
            return;
          }

          results[key] = rows;
          completedQueries++;

          if (completedQueries === totalQueries) {
            resolve(results);
          }
        });
      });
    });
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT c.*, COUNT(p.id) as purchase_count, SUM(p.price) as total_spent
         FROM customers c
         LEFT JOIN purchases p ON c.id = p.customer_id AND p.status = 'completed'
         WHERE c.email = ?
         GROUP BY c.id`,
        [email],
        (err, customer) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(customer);
        }
      );
    });
  }

  /**
   * Get customer purchase history
   */
  async getCustomerPurchases(email) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT p.* FROM purchases p
         JOIN customers c ON p.customer_id = c.id
         WHERE c.email = ?
         ORDER BY p.purchase_date DESC`,
        [email],
        (err, purchases) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(purchases);
        }
      );
    });
  }

  /**
   * Close database connection
   */
  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            this.logger.error('Database close error:', err);
          } else {
            this.logger.info('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = CustomerDatabase;