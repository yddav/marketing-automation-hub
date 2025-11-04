#!/usr/bin/env python3
"""
Database Migration: Add Multi-Image Support
Adds image_urls column to posts table
"""

import sqlite3
import os

DATABASE_PATH = os.getenv('DATABASE_PATH', 'database/posts.db')

def migrate():
    """Add image_urls column for multiple images"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(posts)")
        columns = [row[1] for row in cursor.fetchall()]

        if 'image_urls' not in columns:
            print("Adding image_urls column...")
            cursor.execute('''
                ALTER TABLE posts ADD COLUMN image_urls TEXT
            ''')
            conn.commit()
            print("✅ Migration complete! image_urls column added.")
        else:
            print("✅ Column already exists, no migration needed.")

    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
