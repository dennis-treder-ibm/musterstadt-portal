#!/usr/bin/env bash
# start.sh — check Java + Maven, then rebuild and start Liberty in dev mode

set -euo pipefail

REQUIRED_JAVA_MAJOR=8

# ── helpers ────────────────────────────────────────────────────────────────────

err()  { echo "❌  $*" >&2; }
info() { echo "ℹ️   $*"; }
ok()   { echo "✅  $*"; }

sdk_install_hint() {
  local tool="$1"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $tool not found. Set it up with SDKMAN:"
  echo ""
  echo "  1. Install SDKMAN (if not already):"
  echo "       curl -s https://get.sdkman.io | bash"
  echo "       source \"\$HOME/.sdkman/bin/sdkman-init.sh\""
  echo ""
  if [[ "$tool" == "Java" ]]; then
    echo "  2. Install Java $REQUIRED_JAVA_MAJOR:"
    echo "       sdk install java 8.0.402-tem"
    echo "       sdk use java 8.0.402-tem"
  else
    echo "  2. Install Maven:"
    echo "       sdk install maven"
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

# ── source SDKMAN if present so sdk-managed binaries are on PATH ───────────────

SDKMAN_INIT="${SDKMAN_DIR:-$HOME/.sdkman}/bin/sdkman-init.sh"
if [[ -f "$SDKMAN_INIT" ]]; then
  # SDKMAN's init script references ZSH_VERSION without guarding it, which
  # blows up under bash's nounset (-u). Relax it just for this source call.
  set +u
  # shellcheck source=/dev/null
  source "$SDKMAN_INIT"
  set -u
fi

# ── check Java ─────────────────────────────────────────────────────────────────

if ! command -v java &>/dev/null; then
  err "java not found on PATH."
  sdk_install_hint "Java"
  exit 1
fi

JAVA_VERSION_OUTPUT=$(java -version 2>&1 | head -1)
# Handles both `java version "1.8.x"` and `openjdk version "11.x"` formats
JAVA_MAJOR=$(echo "$JAVA_VERSION_OUTPUT" | grep -oE '"[0-9]+(\.[0-9]+)?' | head -1 | tr -d '"' | awk -F. '{print ($1==1?$2:$1)}')

if [[ -z "$JAVA_MAJOR" ]]; then
  err "Could not parse Java version from: $JAVA_VERSION_OUTPUT"
  exit 1
fi

if (( JAVA_MAJOR < REQUIRED_JAVA_MAJOR )); then
  err "Java $REQUIRED_JAVA_MAJOR+ required, found major version $JAVA_MAJOR."
  sdk_install_hint "Java"
  exit 1
fi

ok "Java $JAVA_MAJOR detected  ($JAVA_VERSION_OUTPUT)"

# ── check Maven ────────────────────────────────────────────────────────────────

if ! command -v mvn &>/dev/null; then
  err "mvn not found on PATH."
  sdk_install_hint "Maven"
  exit 1
fi

MVN_VERSION=$(mvn --version 2>&1 | head -1)
ok "Maven detected  ($MVN_VERSION)"

# ── clean build + dev mode ─────────────────────────────────────────────────────

info "Running full clean build…"
mvn clean package -DskipTests

info "Starting Liberty in dev mode (Ctrl-C to stop)…"
mvn liberty:dev
