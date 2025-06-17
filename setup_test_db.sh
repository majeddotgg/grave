#!/bin/bash

# Setup script for Islamic Grave Assignment System Test Database
# Uses MAMP's MySQL installation

MYSQL_PATH="/Applications/MAMP/Library/bin/mysql80/bin/mysql"
HOST="localhost"
PORT="8889"
USER="root"
PASSWORD="root"  # MAMP default password

echo "Setting up test database for Islamic Grave Assignment System..."

# Check if MAMP MySQL is accessible
if [ ! -f "$MYSQL_PATH" ]; then
    echo "Error: MAMP MySQL not found at $MYSQL_PATH"
    echo "Please ensure MAMP is installed and MySQL is available"
    exit 1
fi

# Import test schema (this will drop and recreate the database)
echo "Importing test database schema..."
$MYSQL_PATH -u $USER -p$PASSWORD -h $HOST -P $PORT < import_test.sql

if [ $? -eq 0 ]; then
    echo "✓ Test database schema imported successfully"
else
    echo "✗ Failed to import test database schema"
    echo "Trying without password..."
    $MYSQL_PATH -u $USER -h $HOST -P $PORT < import_test.sql
    if [ $? -eq 0 ]; then
        echo "✓ Test database schema imported successfully (no password)"
    else
        echo "✗ Failed to import test database schema. Please check MAMP settings."
        exit 1
    fi
fi

echo ""
echo "Test database setup complete!"
echo "Database: islamic_grave_system_test"
echo "Host: $HOST"
echo "Port: $PORT"
echo "User: $USER"
echo ""
echo "You can now run tests with: npm test" 