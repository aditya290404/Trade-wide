#!/bin/bash
# export-to-s3.sh
# Script to export the Trade DB to CSV and upload to S3

set -e

DB_NAME="papertrade"
DB_USER="paperuser"
# Replace with Terraform output bucket name
S3_BUCKET="s3://paper-trade-backups-bucket-xxxxx"
DATE=$(date +%Y-%m-%d)
FILE_NAME="portfolio_export_${DATE}.csv"

echo "Exporting database to CSV..."
# Connect to docker container or local postgres and run copy command
docker exec paper-trade-db psql -U $DB_USER -d $DB_NAME -c "\copy (SELECT * FROM \"Trade\") TO STDOUT WITH CSV HEADER" > /tmp/$FILE_NAME

echo "Uploading to S3..."
aws s3 cp /tmp/$FILE_NAME $S3_BUCKET/exports/$FILE_NAME

echo "Upload complete: $S3_BUCKET/exports/$FILE_NAME"

# Clean up
rm /tmp/$FILE_NAME
