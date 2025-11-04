"""
Database Models - Custom Social Media Automation Platform
SQLite-based storage for posts, schedules, and campaign management
Created: 2025-10-29
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
import os

DATABASE_PATH = os.getenv('DATABASE_PATH', 'database/posts.db')

class Database:
    """SQLite database manager"""

    def __init__(self, db_path=DATABASE_PATH):
        self.db_path = db_path
        # Ensure database directory exists
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_database()

    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Return dict-like rows
        return conn

    def init_database(self):
        """Initialize database schema"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Posts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                image_url TEXT,
                platforms TEXT NOT NULL,  -- JSON array
                scheduled_date TEXT NOT NULL,
                scheduled_time TEXT NOT NULL,
                status TEXT DEFAULT 'draft',  -- draft, scheduled, posted, failed
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                posted_at TEXT,
                error_message TEXT,
                post_results TEXT  -- JSON object with platform-specific results
            )
        ''')

        # Campaign table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                start_date TEXT,
                end_date TEXT,
                status TEXT DEFAULT 'active',  -- active, paused, completed
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Post-Campaign relationship
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS post_campaigns (
                post_id INTEGER,
                campaign_id INTEGER,
                FOREIGN KEY (post_id) REFERENCES posts (id),
                FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
                PRIMARY KEY (post_id, campaign_id)
            )
        ''')

        conn.commit()
        conn.close()

    # Post operations
    def create_post(self, text, platforms, scheduled_date, scheduled_time, image_url=None, status='draft'):
        """Create a new post"""
        conn = self.get_connection()
        cursor = conn.cursor()

        platforms_json = json.dumps(platforms)

        cursor.execute('''
            INSERT INTO posts (text, image_url, platforms, scheduled_date, scheduled_time, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (text, image_url, platforms_json, scheduled_date, scheduled_time, status))

        post_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return post_id

    def get_post(self, post_id):
        """Get a single post by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM posts WHERE id = ?', (post_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return self._row_to_dict(row)
        return None

    def get_all_posts(self, status=None, limit=None):
        """Get all posts, optionally filtered by status"""
        conn = self.get_connection()
        cursor = conn.cursor()

        query = 'SELECT * FROM posts'
        params = []

        if status:
            query += ' WHERE status = ?'
            params.append(status)

        query += ' ORDER BY scheduled_date, scheduled_time'

        if limit:
            query += ' LIMIT ?'
            params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        return [self._row_to_dict(row) for row in rows]

    def get_scheduled_posts(self):
        """Get posts that are scheduled but not yet posted"""
        return self.get_all_posts(status='scheduled')

    def get_posts_by_date(self, date):
        """Get posts scheduled for a specific date"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM posts
            WHERE scheduled_date = ?
            ORDER BY scheduled_time
        ''', (date,))

        rows = cursor.fetchall()
        conn.close()

        return [self._row_to_dict(row) for row in rows]

    def get_posts_due_now(self):
        """Get posts that should be posted now"""
        conn = self.get_connection()
        cursor = conn.cursor()

        now = datetime.now()
        current_date = now.strftime('%Y-%m-%d')
        current_time = now.strftime('%H:%M')

        cursor.execute('''
            SELECT * FROM posts
            WHERE status = 'scheduled'
            AND scheduled_date = ?
            AND scheduled_time <= ?
        ''', (current_date, current_time))

        rows = cursor.fetchall()
        conn.close()

        return [self._row_to_dict(row) for row in rows]

    def update_post(self, post_id, **kwargs):
        """Update post fields"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Build dynamic update query
        fields = []
        values = []

        for key, value in kwargs.items():
            if key == 'platforms' and isinstance(value, list):
                value = json.dumps(value)
            fields.append(f"{key} = ?")
            values.append(value)

        values.append(post_id)

        query = f"UPDATE posts SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, values)

        conn.commit()
        conn.close()

    def mark_post_posted(self, post_id, post_results=None):
        """Mark post as successfully posted"""
        update_data = {
            'status': 'posted',
            'posted_at': datetime.now().isoformat()
        }

        if post_results:
            update_data['post_results'] = json.dumps(post_results)

        self.update_post(post_id, **update_data)

    def mark_post_failed(self, post_id, error_message):
        """Mark post as failed with error message"""
        self.update_post(post_id, status='failed', error_message=error_message)

    def delete_post(self, post_id):
        """Delete a post"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('DELETE FROM posts WHERE id = ?', (post_id,))

        conn.commit()
        conn.close()

    # Campaign operations
    def create_campaign(self, name, description=None, start_date=None, end_date=None):
        """Create a new campaign"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO campaigns (name, description, start_date, end_date)
            VALUES (?, ?, ?, ?)
        ''', (name, description, start_date, end_date))

        campaign_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return campaign_id

    def add_post_to_campaign(self, post_id, campaign_id):
        """Associate a post with a campaign"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR IGNORE INTO post_campaigns (post_id, campaign_id)
            VALUES (?, ?)
        ''', (post_id, campaign_id))

        conn.commit()
        conn.close()

    def get_campaign_posts(self, campaign_id):
        """Get all posts in a campaign"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT p.* FROM posts p
            INNER JOIN post_campaigns pc ON p.id = pc.post_id
            WHERE pc.campaign_id = ?
            ORDER BY p.scheduled_date, p.scheduled_time
        ''', (campaign_id,))

        rows = cursor.fetchall()
        conn.close()

        return [self._row_to_dict(row) for row in rows]

    # Statistics
    def get_stats(self):
        """Get campaign statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Total posts by status
        cursor.execute('''
            SELECT status, COUNT(*) as count
            FROM posts
            GROUP BY status
        ''')
        status_counts = dict(cursor.fetchall())

        # Posts by date range
        cursor.execute('''
            SELECT
                MIN(scheduled_date) as first_post,
                MAX(scheduled_date) as last_post,
                COUNT(DISTINCT scheduled_date) as unique_days
            FROM posts
        ''')
        date_stats = dict(cursor.fetchone())

        # Platform distribution
        cursor.execute('SELECT platforms FROM posts')
        all_platforms = []
        for row in cursor.fetchall():
            platforms = json.loads(row[0])
            all_platforms.extend(platforms)

        platform_counts = {}
        for platform in set(all_platforms):
            platform_counts[platform] = all_platforms.count(platform)

        conn.close()

        return {
            'status_counts': status_counts,
            'date_stats': date_stats,
            'platform_counts': platform_counts,
            'total_posts': sum(status_counts.values())
        }

    # Utility
    def _row_to_dict(self, row):
        """Convert SQLite row to dictionary"""
        post_dict = dict(row)

        # Parse JSON fields
        if 'platforms' in post_dict and post_dict['platforms']:
            post_dict['platforms'] = json.loads(post_dict['platforms'])

        if 'post_results' in post_dict and post_dict['post_results']:
            post_dict['post_results'] = json.loads(post_dict['post_results'])

        return post_dict

    def clear_all_posts(self):
        """Clear all posts (for testing)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM posts')
        conn.commit()
        conn.close()


# Singleton instance
db = Database()
