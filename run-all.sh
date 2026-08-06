#!/usr/bin/env bash
# One-click launcher for backend (Spring Boot) + frontend (learner, :3100) + admin (:3101).
# Usage: ./run-all.sh
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

PIDS=()
cleanup() {
  echo ""
  echo "Stopping all services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" >/dev/null 2>&1
  done
  wait >/dev/null 2>&1
  exit 0
}
trap cleanup INT TERM

echo "== BaseCamp: starting backend, frontend, and admin =="

echo "-- backend (Spring Boot, http://localhost:8081) --"
(
  cd backend
  SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-dev}" ./mvnw spring-boot:run
) &
PIDS+=($!)

if [ ! -d frontend/node_modules ]; then
  echo "-- installing frontend dependencies --"
  (cd frontend && npm install)
fi
echo "-- frontend (learner app, http://localhost:3100) --"
(cd frontend && npm run dev:local) &
PIDS+=($!)

if [ ! -d admin/node_modules ]; then
  echo "-- installing admin dependencies --"
  (cd admin && npm install)
fi
echo "-- admin (ops console, http://localhost:3101) --"
(cd admin && npm run dev:local) &
PIDS+=($!)

cat <<'EOF'

All services starting:
  Backend API   -> http://localhost:8081
  Learner app   -> http://localhost:3100
  Admin console -> http://localhost:3101

Press Ctrl+C to stop everything.
EOF

wait
