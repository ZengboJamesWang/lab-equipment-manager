#!/bin/bash

# ======================================================
#   Lab Equipment Manager v1.0.0 - Development Mode
# ======================================================

echo "===================================================="
echo "  Lab Equipment Manager v1.0.0 - Development Mode"
echo "===================================================="
echo ""

# Check if Node.js is installed
echo "[INFO] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js is installed"
node --version
echo ""

# Run the cross-platform Node.js script
echo "[INFO] Starting development servers..."
echo ""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/start-dev.js"
