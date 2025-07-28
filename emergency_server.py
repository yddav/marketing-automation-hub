#!/usr/bin/env python3
"""
EMERGENCY BACKUP SERVER - App Marketing Automation Hub
Simple HTTP server for immediate demo deployment
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from threading import Timer

class EmergencyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        # Cache control for development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        # Route handling for demo
        if self.path == '/':
            self.path = '/emergency_demo.html'
        elif self.path == '/dashboard':
            self.path = '/analytics_dashboard/index.html'
        elif self.path == '/website':
            self.path = '/website/index.html'
        elif self.path.startswith('/content-templates'):
            # Serve content templates with proper MIME type
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            return
        
        super().do_GET()

def open_browser():
    """Open browser after server starts"""
    webbrowser.open('http://localhost:3000')

def main():
    PORT = 3000
    
    print("🚨 EMERGENCY BACKUP SERVER - App Marketing Automation Hub")
    print("=" * 60)
    print(f"🚀 Starting emergency demo server on port {PORT}")
    print(f"📊 Dashboard: http://localhost:{PORT}/dashboard")
    print(f"🌐 Website: http://localhost:{PORT}/website")
    print(f"📄 Main Demo: http://localhost:{PORT}")
    print("=" * 60)
    
    try:
        with socketserver.TCPServer(("", PORT), EmergencyHTTPRequestHandler) as httpd:
            print(f"✅ Emergency server running at http://localhost:{PORT}")
            print("🔄 Auto-opening browser in 2 seconds...")
            
            # Auto-open browser after 2 seconds
            Timer(2.0, open_browser).start()
            
            print("📱 Mobile responsive design enabled")
            print("⚡ CORS enabled for development")
            print("🛡️  Serving all marketing automation demo content")
            print("\n👆 Press Ctrl+C to stop server")
            print("=" * 60)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Emergency server stopped")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Port {PORT} is already in use")
            print("🔄 Trying alternative port 3001...")
            PORT = 3001
            main()
        else:
            print(f"❌ Server error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()