# 研究任務：兔兔虛擬形象 — 手機版 + OpenClaw 連動

## 背景

我有一個現成的 Minecraft 風格 3D 虛擬角色專案：
- 位置：`/Users/floatj/project/openclaw/minecraft_pet/web/index.html`
- 技術：Three.js + Tauri（桌面版骨架）
- 角色：兔耳女僕裝角色，有完整的 WASD 移動、跳躍、蹲下、跑步動畫
- 世界：Minecraft 風格草地、樹、花、雲、櫻花飄落效果

## 目標

我要把這個角色變成我的 AI 助理「兔兔」的虛擬形象分身，讓它能：

### Layer 1：靜態 Web 部署（最優先）
- 把現有的 `index.html` 部署成可手機瀏覽的 web app
- 新增「觀賞模式」：隱藏鍵盤控制 UI，角色自動做 idle 動畫（待機、左右張望、偶爾跳一下）
- 手機友善：觸控旋轉鏡頭、縮放
- 能透過 Telegram 傳連結給朋友看

### Layer 2：與 OpenClaw 即時連動
- 兔兔（AI 助理）在 Telegram 回訊息時，3D 角色要有對應反應
- 需要研究的連動方式：
  - OpenClaw Gateway（跑在 MacBook Air M2 上）是否有 WebSocket 或 webhook 可用？
  - 或者用 Telegram Bot API 的 webhook 監聽訊息事件？
  - 或者直接輪詢某個 endpoint？
- 前端收到事件後播放對應動畫：
  - `speak` → 角色嘴巴動 + 文字氣泡
  - `happy` → 跳一下
  - `angry` → 跺腳
  - `sleep` → 打瞌睡動畫
  - `think` → 頭歪一邊

### Layer 3：手機鏡頭輸入（長遠目標）
- 用手機瀏覽器的 `getUserMedia` API 拍照或錄影
- 將圖片/影片傳送到 OpenClaw 讓兔兔分析
- 這層先做調研，不用實作

## 請幫我做以下研究

1. **部署方案比較**
   - GitHub Pages vs Vercel vs Cloudflare Pages
   - 哪個最適合純靜態 Three.js 頁面？
   - 手機效能考量（Three.js 在手機上跑得動嗎？需要哪些優化？）

2. **OpenClaw Gateway 連動研究**
   - 閱讀 OpenClaw 文件：`/Users/floatj/.nvm/versions/node/v22.16.0/lib/node_modules/openclaw/docs/`
   - 找出 Gateway 是否有 WebSocket / webhook / event stream 的 API
   - 找出當兔兔回訊息時，有沒有 hook 或 event 可以觸發外部通知
   - 查看 `hooks` 相關的設定文件

3. **替代連動方案**
   - Telegram Bot API 的 `getUpdates` 或 webhook
   - 用 Server-Sent Events (SSE) 從 Mac 推送到手機瀏覽器
   - 需要考慮：Mac 在內網，手機可能在外面 → 需要 tunnel（Tailscale？Cloudflare Tunnel？）

4. **手機鏡頭 API 調研**
   - `navigator.mediaDevices.getUserMedia` 在手機 Chrome / Safari 的支援度
   - 拍照後直接 POST 到 backend 的最佳實踐
   - 安全性考量（HTTPS 才能用 getUserMedia）

5. **現有程式碼評估**
   - 閱讀 `/Users/floatj/project/openclaw/minecraft_pet/web/index.html`
   - 評估哪些部分可以直接用、哪些需要重構
   - Three.js 手機效能優化建議（降低 shadow map、減少 draw call 等）

## 輸出格式

請產出一份 `RESEARCH-RESULTS.md`，包含：
1. 每個研究項目的結論和建議
2. Layer 1 的具體實作步驟（我要能直接照著做）
3. Layer 2 的架構圖和技術選型建議
4. 預估的開發時間

不要直接開始寫 code。先做完研究，我 review 後再決定怎麼做。
