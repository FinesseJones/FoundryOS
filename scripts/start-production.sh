#!/bin/sh
set -e

echo "=== [FoundryOS Production Boot] ==="

# Execute database deployment / migrations if Postgres URL is provided
# FAIL CLOSED: Terminate boot immediately if database migration fails
if [ -n "$DATABASE_URL" ]; then
  echo "[FoundryOS Boot] Running database deployment & migrations..."
  npm run db:deploy
fi

# Start Node API in background scoped to internal port 8787 only (no global export)
echo "[FoundryOS Boot] Starting Backend API Server on internal port 8787..."
PORT=8787 node api/server.js &
API_PID=$!

# Wait for API server to be healthy
echo "[FoundryOS Boot] Waiting for Backend API health check on 127.0.0.1:8787..."
for i in $(seq 1 30); do
  if wget --quiet --spider http://127.0.0.1:8787/api/health; then
    echo "[FoundryOS Boot] Backend API is healthy on port 8787."
    break
  fi
  sleep 1
done

# Start Caddy in foreground (inherits Railway's injected $PORT with default fallback to 80)
echo "[FoundryOS Boot] Starting Caddy Edge Server..."
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile &
CADDY_PID=$!

# Handle shutdown signals
trap "kill -TERM $API_PID $CADDY_PID; wait $API_PID $CADDY_PID" SIGTERM SIGINT

wait -n $API_PID $CADDY_PID
