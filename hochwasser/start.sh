#!/usr/bin/env bash
# start.sh — start Quarkus backend (:8080) and Vite frontend (:5173) together.
# Ctrl-C stops both.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REQUIRED_JAVA_MAJOR=11
BACK_PORT=8080
FRONT_PORT=5173

err()  { echo "❌  $*" >&2; }
info() { echo "ℹ️   $*"; }
ok()   { echo "✅  $*"; }

# SDKMAN's init references unset vars; relax nounset while sourcing.
SDKMAN_INIT="${SDKMAN_DIR:-$HOME/.sdkman}/bin/sdkman-init.sh"
if [[ -f "$SDKMAN_INIT" ]]; then
  set +u
  # shellcheck source=/dev/null
  source "$SDKMAN_INIT"
  set -u
fi

# ── prerequisites ──────────────────────────────────────────────────────────────

for tool in java mvn node npm; do
  command -v "$tool" &>/dev/null || { err "$tool not found on PATH."; exit 1; }
done

JAVA_MAJOR=$(java -version 2>&1 | head -1 | grep -oE '"[0-9]+(\.[0-9]+)?' | head -1 | tr -d '"' | awk -F. '{print ($1==1?$2:$1)}')
if [[ -z "$JAVA_MAJOR" ]] || (( JAVA_MAJOR < REQUIRED_JAVA_MAJOR )); then
  err "Java $REQUIRED_JAVA_MAJOR+ required, found '${JAVA_MAJOR:-unknown}'."
  exit 1
fi
ok "Java $JAVA_MAJOR, Maven, Node $(node -v) detected"

for port in "$BACK_PORT" "$FRONT_PORT"; do
  if lsof -iTCP:"$port" -sTCP:LISTEN -t &>/dev/null; then
    err "Port $port already in use."
    exit 1
  fi
done

# ── frontend deps ──────────────────────────────────────────────────────────────

if [[ ! -d "$ROOT/front/node_modules" ]]; then
  info "Installing frontend dependencies…"
  (cd "$ROOT/front" && npm install)
fi

# ── start both; kill both on exit ──────────────────────────────────────────────

PIDS=()

# Kill a process and all its descendants (mvn/npm spawn child JVMs/nodes).
kill_tree() {
  local pid="$1" child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

cleanup() {
  trap - INT TERM EXIT
  echo
  info "Stopping…"
  for pid in "${PIDS[@]:-}"; do
    [[ -n "$pid" ]] && kill_tree "$pid"
  done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# Process substitution (not a pipe) so $! is the real mvn/npm PID.
info "Starting backend (Quarkus dev, http://localhost:$BACK_PORT)…"
cd "$ROOT/back"
mvn -q quarkus:dev -Dquarkus.console.enabled=false > >(sed -u 's/^/[back]  /') 2>&1 &
PIDS+=($!)

info "Starting frontend (Vite, http://localhost:$FRONT_PORT)…"
cd "$ROOT/front"
npm run dev > >(sed -u 's/^/[front] /') 2>&1 &
PIDS+=($!)

ok "Open http://localhost:$FRONT_PORT  (Ctrl-C to stop both)"

# bash 3.2 (macOS) has no `wait -n`; poll until either process dies.
while kill -0 "${PIDS[0]}" 2>/dev/null && kill -0 "${PIDS[1]}" 2>/dev/null; do
  sleep 1
done
err "A process exited; shutting down."
exit 1
