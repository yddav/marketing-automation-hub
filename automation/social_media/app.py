#!/usr/bin/env python3
"""
FINDERR Campaign Preview - Production Web Server
Deployment-ready Flask app with password protection
"""

from flask import Flask, send_from_directory, request, Response
from functools import wraps
import os

app = Flask(__name__)

# Get preview directory
PREVIEW_DIR = os.path.join(os.path.dirname(__file__), 'preview')

# Password protection (set via environment variable)
USERNAME = os.environ.get('PREVIEW_USERNAME', 'admin')
PASSWORD = os.environ.get('PREVIEW_PASSWORD', 'finderr2024')

def check_auth(username, password):
    """Check if username/password combination is valid"""
    return username == USERNAME and password == PASSWORD

def authenticate():
    """Send 401 response to trigger browser login"""
    return Response(
        'Access denied. Please login with valid credentials.',
        401,
        {'WWW-Authenticate': 'Basic realm="FINDERR Campaign Preview"'}
    )

def requires_auth(f):
    """Decorator for routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

@app.route('/')
@requires_auth
def index():
    """Serve the campaign preview"""
    return send_from_directory(PREVIEW_DIR, 'campaign-preview-final.html')

@app.route('/<path:filename>')
@requires_auth
def serve_file(filename):
    """Serve static files (images, CSS, JS)"""
    return send_from_directory(PREVIEW_DIR, filename)

@app.route('/health')
def health():
    """Health check endpoint (no auth required)"""
    return {'status': 'ok', 'service': 'FINDERR Campaign Preview'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
