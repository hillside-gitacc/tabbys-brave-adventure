#!/bin/bash
# Double-click this file on your Mac to start the game server.
# Then open the URL shown below on your iPad's Safari.

cd "$(dirname "$0")"

# Get Mac's local IP address
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

echo ""
echo "=========================================="
echo "  🌟 Tabby's Game Server is running! 🌟"
echo "=========================================="
echo ""
echo "  On your iPad, open Safari and go to:"
echo ""
echo "  👉  http://${IP}:8000"
echo ""
echo "=========================================="
echo ""
echo "  Press Ctrl+C to stop the server."
echo ""

python3 -m http.server 8000
