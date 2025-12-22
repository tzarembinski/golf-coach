#!/usr/bin/env python3
"""
Database migration script to add annotation fields to swings table.
Run this once to add the new columns: club, shot_outcome, focus_area, notes
"""
import sqlite3
import os

def migrate_database():
    """Add new columns to swings table for shot annotation."""
    db_path = "golf_coach.db"

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        print("Database will be created automatically when you first run the app.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check if columns already exist
    cursor.execute("PRAGMA table_info(swings)")
    columns = [column[1] for column in cursor.fetchall()]

    migrations_needed = []
    new_columns = {
        'club': 'VARCHAR(100)',
        'shot_outcome': 'VARCHAR(50)',
        'focus_area': 'TEXT',
        'notes': 'TEXT'
    }

    for col_name, col_type in new_columns.items():
        if col_name not in columns:
            migrations_needed.append((col_name, col_type))

    if not migrations_needed:
        print("✓ Database is already up to date. No migration needed.")
        conn.close()
        return

    print(f"Migrating database: Adding {len(migrations_needed)} new column(s)...")

    try:
        for col_name, col_type in migrations_needed:
            sql = f"ALTER TABLE swings ADD COLUMN {col_name} {col_type}"
            print(f"  - Adding column '{col_name}' ({col_type})")
            cursor.execute(sql)

        conn.commit()
        print("✓ Migration completed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"✗ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Golf Coach Database Migration")
    print("=" * 60)
    migrate_database()
    print("=" * 60)
