#!/usr/bin/env python3
"""
FINDERR Campaign Preview Server
Serves the campaign preview with mockups
"""

from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# Get the preview directory
PREVIEW_DIR = os.path.join(os.path.dirname(__file__), 'preview')

@app.route('/')
def index():
    """Serve the campaign preview"""
    return send_from_directory(PREVIEW_DIR, 'campaign-preview-final.html')

@app.route('/<path:filename>')
def serve_file(filename):
    """Serve static files (images, etc.)"""
    return send_from_directory(PREVIEW_DIR, filename)

if __name__ == '__main__':
    print("\n🎨 FINDERR Campaign Preview Server")
    print("=" * 80)
    print("\n🚀 Starting preview server with mockups...")
    print("\n📊 Preview URL: http://localhost:5002")
    print("\n💡 Press Ctrl+C to stop the server")
    print("\n" + "=" * 80 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5002)
