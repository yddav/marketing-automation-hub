const express = require('express');
const path = require('path');

const app = express();
const PORT = 9000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add CORS headers for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Professional Polish Preview Server Running!`);
    console.log(`📊 Main Website: http://localhost:${PORT}`);
    console.log(`🎨 Templates: http://localhost:${PORT}/templates.html`);
    console.log(`📈 Dashboard: http://localhost:${PORT}/dashboard/`);
    console.log('');
    console.log('✨ Professional Polish Features:');
    console.log('  • Premium Electric Blue Design System');
    console.log('  • Glass Morphism Effects');
    console.log('  • Smooth Scroll Animations');
    console.log('  • Professional Typography');
    console.log('  • Enhanced Interactive Elements');
    console.log('');
    console.log('🌐 Ready to preview your professionally polished website!');
}).on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});