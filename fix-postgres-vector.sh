#!/bin/bash
# Daicer Postgres Fixer
# This script detects the running Postgres container and replaces it with one that has pgvector support.

echo "🔍 Detecting running Postgres container..."
CONTAINER_ID=$(docker ps | grep postgres | awk '{print $1}')

if [ -z "$CONTAINER_ID" ]; then
  echo "⚠️  No running Postgres container found."
  echo "We will try to start one using the standard configuration."
else
  echo "✅ Found container: $CONTAINER_ID"
  echo "⏹️  Stopping current container..."
  docker stop $CONTAINER_ID
  docker rm $CONTAINER_ID
fi

echo "🚀 Starting new Postgres container with PGVector support..."
# FINAL MODE: Secure the recovered database
# Remove trust auth and enforce password authentication.
# The data is preserved in 'daicer_strapi-data'.

docker run -d \
  --name daicer-postgres-fixed \
  -p 5432:5432 \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD=strapi_password \
  -e POSTGRES_DB=strapi \
  -v daicer_strapi-data:/var/lib/postgresql/data \
  pgvector/pgvector:pg16

echo "✅ Container started!"
echo "⏳ Waiting for DB to be ready..."
sleep 5

echo "🛠️  Enabling vector extension..."
# Execute the SQL directly inside the container to ensure extension is enabled
docker exec daicer-postgres-fixed psql -U strapi -d strapi -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo "🎉 Done! You can now run 'yarn cli knowledge' or 'yarn develop'."
