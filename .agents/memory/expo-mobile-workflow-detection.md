---
name: Expo mobile workflow detection — broken relay
description: Why kind="mobile" workflow detection always fails in this repl and what was conclusively proven
---

## The rule
`kind = "mobile"` workflow detection in this repl ALWAYS fails regardless of what the dev script does. Even a zero-dependency Node.js server that binds 0.0.0.0:3000 in milliseconds gets "didn't open port 3000".

**Why:** The detection for `kind = "mobile"` does not check the local port at all. It checks the Expo relay at `$REPLIT_EXPO_DEV_DOMAIN` (e.g. `*.expo.sisko.replit.dev`). That relay is not reachable from within the container via HTTP/HTTPS curl (returns empty / connection timeout). The error message "didn't open port N" is misleading.

**How to apply:** Do NOT spend time debugging this with different ports, proxies, or `ensurePreviewReachable` values. The root cause is the Expo relay not being reachable from within the container. The workflow will show "FAILED" indefinitely. The QR-code native experience still works when the process runs (Metro registers with the relay even though HTTP checks from within the container fail — it uses a different transport for relay registration). Users can see the QR code in workflow logs and scan it with Expo Go.

## What was proven
- Simple `http.createServer` binding 0.0.0.0:3000 → still "didn't open port 3000"
- `https://RELAY/status` curl from inside container → empty response (unreachable)
- `https://REPLIT_DEV_DOMAIN/mobile/status` curl → HTTP 200 (reverse proxy routing IS set up correctly)
- Metro does register with relay (shows exp:// URL in logs), but detection still fails
- `router = "expo-domain"` vs no router → same result either way
- `ensurePreviewReachable` present vs absent → same result

## The workaround
The dev-proxy.mjs approach (proxy on :3000, Metro on :3001) IS the right architecture. Keep it. Metro starts correctly, QR code appears in workflow logs, native app works. Web preview in Replit pane is unavailable due to this platform issue.
