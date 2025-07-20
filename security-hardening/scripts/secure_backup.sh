#!/bin/bash

# Mentara Secure Database Backup Script
# HIPAA Compliant Encrypted Backups

set -e

# Configuration
DB_NAME="mentara_db"
DB_USER="mentara_admin"
BACKUP_DIR="/secure/backups/mentara"
ENCRYPTION_KEY_FILE="/secure/keys/backup.key"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mentara_backup_${DATE}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔐 Starting secure database backup..."

# Create database dump
pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

# Encrypt the backup
openssl enc -aes-256-cbc -salt -in "$BACKUP_DIR/$BACKUP_FILE" -out "$BACKUP_DIR/$ENCRYPTED_FILE" -pass file:"$ENCRYPTION_KEY_FILE"

# Remove unencrypted backup
rm "$BACKUP_DIR/$BACKUP_FILE"

# Set secure permissions
chmod 600 "$BACKUP_DIR/$ENCRYPTED_FILE"

echo "✅ Secure backup completed: $ENCRYPTED_FILE"

# Clean up old backups (keep last 30 days)
find "$BACKUP_DIR" -name "mentara_backup_*.sql.enc" -mtime +30 -delete

echo "🧹 Old backups cleaned up"
