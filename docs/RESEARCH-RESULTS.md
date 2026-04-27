# RESEARCH RESULTS: 兔兔虛擬形象手機版 + OpenClaw 連動

Date: 2026-04-26  
Scope: research only, no implementation.

## Executive Summary

Recommended path:

1. **Layer 1:** deploy the current Three.js page as a static mobile-friendly web app on **Cloudflare Pages**.
2. **Layer 1.5:** add a **Telegram Mini App** wrapper/launcher so DM and group users can open 兔兔 inside Telegram.
3. **Layer 2:** use **OpenClaw `message:sent` / `message:received` hooks** as the source of truth, then push animation events to the web app through a small relay using **SSE first**, WebSocket only if bidirectional control is needed.
4. **Layer 3:** mobile camera capture is feasible with `navigator.mediaDevices.getUserMedia`, but it requires HTTPS and explicit user permission; implement later as a separate upload/analysis flow.

Key conclusion: **Telegram Mini Apps are useful for launch and Telegram-native UX, but they are not the best realtime event source.** They do not replace OpenClaw hooks because a Mini App cannot passively read Telegram group or DM messages. For "rabbit reacts when OpenClaw replies", the reliable event source is OpenClaw's outbound message hook.

## Sources Checked

Local sources:

- `RESEARCH-PROMPT.md`
- `web/index.html`
- OpenClaw npm package: `/Users/floatj/.nvm/versions/node/v22.16.0/lib/node_modules/openclaw`
- OpenClaw local config via `openclaw config get hooks --json`
- Existing hook example: `~/.openclaw/hooks/security-guard/handler.js`

External current docs:

- OpenClaw README and CLI docs links bundled in installed package: <https://docs.openclaw.ai>
- Telegram Mini Apps: <https://core.telegram.org/bots/webapps>
- Telegram Bot API: <https://core.telegram.org/bots/api>
- MDN `getUserMedia`: <https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia>
- Cloudflare Pages: <https://pages.cloudflare.com/> and <https://developers.cloudflare.com/pages/framework-guides/deploy-anything/>
- Cloudflare Tunnel: <https://developers.cloudflare.com/tunnel/>
- Tailscale Funnel: <https://tailscale.com/kb/1223/funnel>
- Vercel deployments: <https://vercel.com/docs/deployments/deployment-methods>
- GitHub Pages custom domains: <https://docs.github.com/github/working-with-github-pages/configuring-a-custom-domain-for-your-github-pages-site>

## 1. Deployment方案比較

### Recommendation

Use **Cloudflare Pages** for Layer 1.

Reasons:

- Static HTML/JS/CSS works directly.
- Good global edge delivery for Taiwan/mobile users.
- Free SSL, preview URLs, Git integration, and custom domains.
- Later Layer 2 relay can stay near Cloudflare using Workers/Durable Objects if needed.
- Cloudflare Tunnel is also a clean option for exposing the Mac relay without opening inbound ports.

### Comparison

| Option | Fit | Pros | Cons | Verdict |
|---|---:|---|---|---|
| Cloudflare Pages | High | Static hosting, SSL, edge CDN, easy custom domain, pairs well with Tunnel/Workers | Slightly more Cloudflare-specific setup | Best default |
| Vercel | High | Very easy deploys, preview URLs, strong frontend DX | More optimized for app frameworks than a single static file; serverless costs/features may be overkill | Good alternative |
| GitHub Pages | Medium | Simple, free, enough for a static demo | Less flexible for future relay/backend, fewer deployment/runtime features | OK for quick public demo |

### Mobile Three.js feasibility

The current scene should run on modern mobile devices, but it needs optimization before being shared widely.

Current code observations:

- Single `web/index.html`, about 1313 lines.
- Uses Three.js from CDN via import map.
- Renderer uses `antialias: true`, `devicePixelRatio` capped at `2`.
- Shadow map is enabled with `PCFSoftShadowMap` and `2048x2048` shadow map.
- Around 55 meshes, 28 `BoxGeometry` calls, 20 `MeshStandardMaterial` calls.
- Trees/flowers/clouds are many separate meshes/groups; no instancing or geometry merging.
- UI is keyboard-first; mobile can orbit via `OrbitControls`, but movement controls are not mobile-friendly.

Minimum mobile optimizations:

- Cap pixel ratio to `Math.min(devicePixelRatio, 1.5)` on mobile.
- Use `1024x1024` shadow map or disable shadows on low-end mobile.
- Add a `?quality=low|medium|high` mode.
- Reduce flowers/particles/cloud count on mobile.
- Use `InstancedMesh` for flowers, petals, repeated blocks, and tree leaf blocks if performance drops.
- Pause heavy animation when tab is hidden using `document.visibilityState`.
- Avoid updating FPS text every frame; current 0.5s cadence is fine.
- Preload Three.js locally through Vite/bundling instead of CDN import map for production caching and integrity.

## 2. OpenClaw Gateway連動研究

### Gateway capability

OpenClaw Gateway is a local-first **WebSocket Gateway**. The CLI confirms:

- `openclaw gateway --help`: "Run, inspect, and query the WebSocket Gateway"
- Default example port: `18789`
- Gateway can bind to loopback/LAN/tailnet/custom and has token/password/trusted-proxy auth modes.
- OpenClaw also has remote/Tailscale documentation entries.

This does not mean the browser should directly connect to the Gateway. Direct browser-to-Gateway exposure would require careful auth/CORS/scope handling and risks leaking a control-plane token to users.

### Hooks capability

OpenClaw has the exact hook events needed:

- Internal hooks:
  - `message:received`
  - `message:sent`
  - `message:transcribed`
  - `message:preprocessed`
  - `gateway:startup`
  - `session:patch`
- Plugin hooks include:
  - `message_received`
  - `message_sending`
  - `message_sent`
  - `before_agent_reply`
  - `agent_end`
  - many tool/session lifecycle hooks

Important local finding: your config already has internal hooks enabled:

```json
{
  "internal": {
    "enabled": true,
    "entries": {
      "security-guard": {
        "enabled": true
      }
    }
  }
}
```

You also already have a working managed hook at:

```text
~/.openclaw/hooks/security-guard/handler.js
```

That hook listens to:

```text
message:received
message:sent
```

This is strong proof that a new `rabbit-avatar` hook can be implemented with the same model.

### OpenClaw message-sent event viability

The installed OpenClaw Telegram delivery code emits message-sent hooks. The local package contains Telegram delivery paths that call `emitTelegramMessageSentHooks` and internal `message:sent` hooks after outbound sends.

Recommended event source:

- Use OpenClaw `message:sent` to trigger `speak`.
- Use `message:received` to trigger `think` or "noticed message".
- Optionally use `before_agent_reply` / `agent_end` through plugin hooks if you later want more precise "thinking started" and "reply finished" phases.

Event payload shape for relay:

```json
{
  "type": "speak",
  "channel": "telegram",
  "chatKind": "dm|group",
  "conversationId": "-100...",
  "messageId": "123",
  "textPreview": "兔兔回覆的前 80 字",
  "emotion": "happy",
  "ts": "2026-04-26T..."
}
```

Do not expose raw full messages to anonymous viewers unless you intentionally want that. For group demos, use `textPreview` or only animation events.

## 3. Telegram互動方案

### Telegram Bot API: getUpdates / webhook

Telegram Bot API supports two common update ingestion modes:

- `getUpdates`: long polling.
- `setWebhook`: Telegram POSTs updates to your HTTPS endpoint.

This is useful if you build an independent Telegram bot pipeline, but it is **not the recommended main path here** because OpenClaw already owns Telegram ingestion/reply dispatch.

Use Telegram Bot API directly only for:

- Adding custom buttons that open the Mini App.
- Setting bot menu / commands.
- Sending explicit "open 兔兔" messages if OpenClaw does not provide a convenient way.

Avoid:

- Polling Telegram separately just to infer OpenClaw replies. That duplicates OpenClaw's channel runtime and can miss context.
- Reading bot updates as the animation truth source. The OpenClaw hook is closer to the actual assistant reply event.

### Telegram Mini Apps

Telegram Mini Apps are a **good idea** as a Telegram-native wrapper.

Use Mini Apps for:

- DM "Open 兔兔" button.
- Group "Open 兔兔" button.
- `startapp` links.
- Telegram theme colors, fullscreen/viewport APIs, haptics.
- Passing signed user/chat launch context through `initData`.

Limitations:

- Mini Apps are not passive chat listeners.
- They do not replace bot updates or OpenClaw hooks.
- Any trusted user/chat identity from `initData` must be verified server-side before authorizing private event streams.

Best use:

```text
Telegram DM/group button
  -> opens Mini App
  -> Mini App loads Cloudflare Pages static 3D app
  -> app connects to event relay
  -> OpenClaw hook pushes animation events
```

### DM vs Group interaction design

DM interaction ideas:

- Default launch button: "看兔兔".
- Personal mode: show full reply bubble only for the authorized owner/user.
- Subtle states:
  - User sends message: `think`
  - OpenClaw starts replying: `speak`
  - Reply success: `happy`
  - Error/failover: `confused`
  - Idle timeout: `sleep`

Group interaction ideas:

- Group mode should be privacy-preserving by default.
- Show animation and short generic bubbles, not full message text, unless explicitly enabled.
- Trigger reactions only when:
  - OpenClaw is mentioned.
  - OpenClaw replies.
  - A whitelisted group event occurs.
- Add a "stage mode" URL that only shows the character and reactions, suitable for sharing in the group.

Better group UX than raw chat mirroring:

- Mini App button pinned or sent by command.
- Group-specific room state: viewers in the same group see the same rabbit reaction timeline.
- Anonymous reactions: group members can tap simple buttons in the Mini App, but these should be rate-limited.
- "兔兔狀態" overlay: thinking, typing, sleeping, listening.

## 4. Layer 2架構建議

### Recommended architecture: OpenClaw hook + SSE relay

```text
Telegram DM / Group
        |
        v
OpenClaw Telegram channel runtime
        |
        v
OpenClaw assistant turn
        |
        v
OpenClaw message:sent / message:received hook
        |
        v
Local rabbit-avatar hook
        |
        v
Local relay on MacBook Air M2
  - POST /events from hook
  - GET /events as SSE stream for browser clients
        |
        v
Cloudflare Tunnel or Tailscale Funnel
        |
        v
Mobile browser / Telegram Mini App
        |
        v
Three.js rabbit animation
```

### SSE vs WebSocket

Use **SSE first**.

Reasons:

- Browser-native `EventSource`.
- Simple one-way server-to-browser push, exactly what animation events need.
- Easier to debug and reconnect.
- Works well behind normal HTTP proxies/tunnels.

Use WebSocket only if:

- Viewers need to send live controls back.
- You need low-latency bidirectional interaction.
- You need rooms/presence at a larger scale.

### Relay hosting options

| Relay location | Fit | Notes |
|---|---:|---|
| Mac + Cloudflare Tunnel | High | Best practical option. Public HTTPS hostname to local relay without inbound ports. |
| Mac + Tailscale Funnel | Medium/High | Fast for personal testing, public URL available, but beta and less custom-domain polished. |
| Cloudflare Worker/Durable Object | High later | Best if events need to be globally available and persistent. Hook would POST outbound to Cloudflare. |
| Direct Gateway WebSocket from browser | Low | Avoid exposing Gateway token/control plane to public users. |
| Telegram Bot API webhook only | Medium | Works, but duplicates OpenClaw and is farther from actual assistant lifecycle. |

### Security model

Minimum controls:

- Relay accepts hook POSTs with a shared secret header.
- Browser event stream uses scoped room IDs, not global events.
- DM streams require Telegram Mini App `initData` verification if showing private text.
- Group streams should default to animation-only or redacted text.
- Never put `OPENCLAW_GATEWAY_TOKEN` in the browser.
- Do not expose OpenClaw Gateway directly to public internet.

## 5. 手機鏡頭 API 調研

Feasible, but should be Layer 3.

Browser requirements:

- `navigator.mediaDevices.getUserMedia` is widely available in modern browsers.
- It requires a secure context: HTTPS, localhost, or equivalent secure origin.
- User permission is mandatory.
- If the page is not HTTPS, `navigator.mediaDevices` may be undefined.

Recommended capture flow:

```text
User taps "拍照給兔兔看"
  -> request getUserMedia({ video: { facingMode: "environment" }, audio: false })
  -> show preview
  -> draw current frame to canvas
  -> convert to Blob/JPEG/WebP
  -> POST to backend
  -> backend forwards image to OpenClaw/media-understanding path
  -> OpenClaw response triggers normal message/animation event
```

Best practices:

- Ask for camera only after a user gesture.
- Prefer still image capture first, not continuous video upload.
- Downscale before upload, e.g. max 1280px longest edge.
- Strip EXIF/geolocation if using file upload.
- Show clear "stop camera" control and stop tracks after capture.
- Use signed upload endpoint or short-lived token from verified Mini App launch.

## 6. 現有程式碼評估

### Directly reusable

- The character model and Minecraft-style world.
- Existing idle/movement animation primitives.
- OrbitControls for touch rotate/zoom.
- The visual identity: rabbit maid character, world, particles, pet companion.

### Needs refactor before serious mobile/web app use

- Split `web/index.html` into modules:
  - `scene.js`
  - `avatar.js`
  - `world.js`
  - `animations.js`
  - `events.js`
  - `ui.js`
- Move CSS into a separate file.
- Bundle Three.js locally via Vite instead of import map CDN.
- Add quality presets.
- Add `view` or `mode` URL params:
  - `?mode=viewer`
  - `?mode=play`
  - `?quality=low`
  - `?room=<group-or-dm-room>`
- Add a central animation state machine:
  - `idle`
  - `think`
  - `speak`
  - `happy`
  - `angry`
  - `sleep`
  - `confused`
- Add event ingestion:
  - `window.dispatchEvent(new CustomEvent("rabbit:event", ...))` for local testing.
  - `EventSource("/events")` for relay mode.

### Watch mode requirements

Layer 1 viewer mode should:

- Hide keyboard UI and FPS by default on mobile.
- Keep camera touch rotate/zoom.
- Auto-idle:
  - gentle breathing
  - ear wiggle
  - left/right glance
  - occasional hop
  - occasional sleep blink
- Add a small Telegram/OpenClaw badge or "兔兔 is idle" status.

## 7. Layer 1具體實作步驟

1. Create a production web app folder, preferably `webapp/` or convert current `web/` to Vite.
2. Move current `web/index.html` into app structure while preserving current behavior.
3. Add mobile viewer mode:
   - Hide `#controls-info` and `#fps` under `?mode=viewer`.
   - Disable keyboard-only assumptions.
   - Add idle animation scheduler.
4. Add responsive CSS:
   - Safe-area padding.
   - Mobile overlay controls.
   - Loading state.
5. Add quality presets:
   - Low: pixel ratio 1, no soft shadows, fewer particles/flowers.
   - Medium: pixel ratio 1.5, 1024 shadow map.
   - High: current desktop quality.
6. Bundle with Vite:
   - Install `three`.
   - Import `OrbitControls` from npm.
   - Build to static `dist/`.
7. Deploy to Cloudflare Pages:
   - Connect GitHub repo.
   - Build command: `npm run build`.
   - Output directory: `dist`.
   - Add custom domain if desired.
8. Share the normal URL in Telegram.
9. Add Telegram Mini App after static deploy:
   - Configure bot's Web App / menu button through BotFather or Bot API.
   - Point it to the Cloudflare Pages HTTPS URL.
   - Add launch params for group/DM room routing later.

## 8. Layer 2具體實作步驟

1. Build a local relay service on the Mac:
   - `POST /events`: accepts hook events with secret.
   - `GET /events?room=...`: SSE stream.
   - optional `GET /health`.
2. Create an OpenClaw internal hook:
   - `~/.openclaw/hooks/rabbit-avatar/HOOK.md`
   - `~/.openclaw/hooks/rabbit-avatar/handler.js`
   - listen to `message:received` and `message:sent`.
3. Map OpenClaw events to animation events:
   - `message:received` → `think`
   - `message:sent success` → `speak`
   - `message:sent failure` → `confused`
   - group unauthorized/ignored messages → no public event or subtle `idle`.
4. Enable hook in OpenClaw config.
5. Expose relay:
   - Preferred: Cloudflare Tunnel with public hostname to local relay.
   - Alternative: Tailscale Funnel for quick testing.
6. Add frontend EventSource client:
   - Connect to relay URL.
   - Reconnect automatically.
   - Queue events so animations do not interrupt too aggressively.
7. Add privacy controls:
   - DM: full bubble only for verified owner/user.
   - Group: redacted or animation-only by default.
8. Add Telegram Mini App room binding:
   - Verify `initData` server-side.
   - Resolve `chat_instance` / launch param to relay room.

## 9. Development Time Estimate

| Work item | Estimate |
|---|---:|
| Layer 1 static deploy from current file | 0.5 day |
| Mobile viewer mode + quality presets | 1-2 days |
| Refactor into Vite modules | 1-2 days |
| Telegram Mini App launcher | 0.5-1 day |
| Local SSE relay | 0.5-1 day |
| OpenClaw rabbit-avatar hook | 0.5 day |
| Frontend event animation state machine | 1-2 days |
| Cloudflare Tunnel setup + security pass | 0.5-1 day |
| DM/group privacy and room routing | 1-2 days |
| Layer 3 camera proof-of-concept | 1-2 days |

Practical MVP:

- Layer 1 static viewer: **1-2 days**
- Layer 1.5 Mini App launcher: **0.5-1 day**
- Layer 2 event-reactive rabbit: **2-4 days**
- Layer 3 camera prototype: **1-2 days**

## Final Recommendation

Do not start with Telegram Bot API polling or direct Gateway WebSocket exposure.

Build in this order:

1. **Cloudflare Pages static viewer** so the rabbit is shareable immediately.
2. **Telegram Mini App launcher** so it feels native in DM/group.
3. **OpenClaw hook → SSE relay → Three.js animation events** for real assistant reactions.
4. **Camera upload** only after the event pipeline and privacy model are stable.

