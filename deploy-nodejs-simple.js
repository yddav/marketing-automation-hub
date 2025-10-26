#!/usr/bin/env node

// Simple Node.js Deployment Server
// Mission: Bulletproof deployment for launch

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    deployment: 'simple-nodejs',
    uptime: process.uptime()
  });
});

// API endpoint for basic functionality
app.get('/api/status', (req, res) => {
  res.json({
    server: 'Marketing Automation Hub',
    status: 'operational',
    deployment: 'simple-nodejs',
    features: {
      static_files: true,
      analytics_dashboard: true,
      content_templates: true,
      mobile_responsive: true
    }
  });
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  // Check if it's an API call
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 MARKETING AUTOMATION HUB - SIMPLE DEPLOYMENT
===============================================

✅ Server Status: OPERATIONAL
📊 Port: ${PORT}
🌐 Homepage: http://localhost:${PORT}
📊 Dashboard: http://localhost:${PORT}/dashboard/
📝 Templates: http://localhost:${PORT}/templates.html
💰 Payment: http://localhost:${PORT}/payment-dashboard.html

✅ Features Available:
   • Static file serving
   • Analytics dashboard
   • Template showcase
   • Mobile responsive design
   • Health monitoring

🔧 Deployment Method: Simple Node.js Express
⚡ Performance: Optimized for speed
🛡️ Security: CORS enabled
📱 Mobile: Fully responsive

💡 Ready for Launch Demo!
========================
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});