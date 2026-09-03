#!/bin/sh
set -e

echo "=== [FoundryOS Production Boot] ==="

# Execute database deployment / migrations if Postgres URL is provided
if [ -n "$DATABASE_URL" ]; then
  echo "[FoundryOS Boot] Running database deployment & migrations..."
  npm run db:deploy || echo "[FoundryOS Boot] Warning: Database deployment returned non-zero code, continuing startup..."
fi

# Export internal API port
export PORT=${API_PORT:-8787}

# Start Node API in background
echo "[FoundryOS Boot] Starting Backend API Server on port $PORT..."
node api/server.js &
API_PID=$!

# Wait for API server to be healthy
echo "[FoundryOS Boot] Waiting for Backend API health check..."
for i in $(seq 1 30); do
  if wget --quiet --spider http://127.0.0.1:$PORT/api/health; then
    echo "[FoundryOS Boot] Backend API is healthy."
    break
  fi
  sleep 1
done

# Start Caddy in foreground
echo "[FoundryOS Boot] Starting Caddy Edge Server on port ${PORT_PUBLIC:-$PORT}..."
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile &
CADDY_PID=$!

# Handle shutdown signals
trap "kill -TERM $API_PID $CADDY_PID; wait $API_PID $CADDY_PID" SIGTERM SIGINT

wait -n $API_PID $CADDY_PID
