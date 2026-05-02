# 兔兔創意互動方案 v3

Date: 2026-04-26  
Base: v2 review + feasibility corrections + MVP scope tightening  
Goal: turn the creative direction into a buildable product spec.

---

## v3 修訂重點

v2 的方向是對的：兔兔應該是一個「活在 Telegram 裡的小生命」，不是單純 3D 模型。

v3 保留 v2 的核心，但做幾個修正：

1. **保留群組房間優先**，但不要完全砍掉 DM。DM 先做成「私密控制/設定入口」，私人房間延後。
2. **基本 SSE 不能推遲**。如果要讓 Mini App 裡的兔兔跟 opc 回覆同步，Layer 2 最少需要 SSE。推遲的是多人 presence、共同操作、WebSocket 遊戲式同步。
3. **「兔兔正在...」卡片分兩階段**。MVP 先在 Mini App 顯示狀態；Telegram 群組裡的可編輯狀態卡片等到 opc tool/progress events 穩定後再做。
4. **碎碎念要有節制和上下文安全**。每天 2-3 句可以，但需要 quiet hours、冷卻時間、admin off switch。
5. **mood + energy 保留**，但補上 decay、儲存、事件合併規則，避免狀態亂跳。
6. **記憶物件化保留手動觸發**，但加一個「候選建議」機制，兔兔可以建議，admin 才確認。

---

## 核心哲學

> 兔兔不是 3D 模型。兔兔是一個活在 Telegram 裡的小生命，3D 是她的身體，opc 是她的大腦，Telegram 是她生活的地方。

每個功能都要通過三個測試：

1. **截圖測試**：第一次看到的人會不會想截圖或轉傳？
2. **低打擾測試**：放在群組裡會不會變噪音？
3. **兔兔感測試**：這件事像不像「兔兔會做的事」，還是只是普通 bot 功能？

如果一個功能只滿足技術炫技，但不滿足這三點，先不要做。

---

## 產品定位

### 不是

- 不是完整電子寵物遊戲。
- 不是群組分析 dashboard。
- 不是把所有 Telegram 訊息投影到 3D 場景。
- 不是 opc Gateway 的公開前端。
- 不是需要大家每天維護的養成系統。

### 是

- 一個能被分享到 Telegram 群組的 3D 兔兔房間。
- 一個會根據 opc 與群組互動改變狀態的小生命。
- 一個低打擾的群組陪伴存在。
- 一個能把 AI 助理狀態變成可見動作的角色化介面。

---

## 架構分層

```text
Layer 0: 靜態觀賞頁
  目標：今天就能分享連結，兔兔會自己動。

Layer 1: Telegram Mini App 群組房間
  目標：在 Telegram 裡打開共享兔兔房間，有基本狀態和儀式。

Layer 2: opc hook + SSE 事件連動
  目標：opc 收到/回覆訊息時，兔兔同步反應。

Layer 2.5: 低打擾群組存在感
  目標：碎碎念、狀態卡、記憶物件，讓兔兔像群組成員。

Layer 3: 相機 / AR / 高階互動
  目標：讓兔兔看見現實世界，之後再做。
```

關鍵修正：

- **SSE 屬於 Layer 2 必需品**，不是未來功能。
- **多人同步 presence** 才是未來功能。
- **DM 私人房間** 可以延後，但 DM 設定入口應該早點做，因為它能處理隱私、admin、debug。

---

## Layer 0：靜態觀賞頁

### 目標

把現有 `web/index.html` 變成可以馬上分享的手機觀賞頁。

成功標準：

- 手機打開 5 秒內看到兔兔。
- 不需要鍵盤就能觀賞。
- 可以轉 Telegram 連結給朋友。
- 預設畫面值得截圖。

### 必做

1. `?mode=view`
   - 隱藏 WASD 控制 UI。
   - 隱藏 FPS 或改成 debug only。
   - 角色自動 idle。

2. Idle loop
   - 微微呼吸。
   - 左右張望。
   - 耳朵晃動。
   - 偶爾小跳。
   - 偶爾坐下看書或伸懶腰。
   - 每 3-8 秒隨機切換，不要機械循環。

3. Mobile quality
   - Mobile pixel ratio cap: `1.25` or `1.5`。
   - Shadow map 2048 → 1024。
   - Mobile 減少樹、花、粒子。
   - `quality=low|medium|high`。

4. Screenshot moment
   - 兔兔頭上有簡潔名牌。
   - 開場 1 秒內做一個揮手或轉頭。
   - 預設鏡頭角度固定在最可愛的位置。

### 不做

- 不做登入。
- 不做 opc 連動。
- 不做 camera。
- 不做複雜房間。

### 預估

0.5-1.5 天。

---

## Layer 1：Telegram Mini App 群組房間

### 目標

讓 Telegram 群組成員打開 Mini App 時，看到同一個「兔兔房間」。

v3 仍然建議 **群組房間優先**，因為社交傳播性比 DM 強。

### 群組房間畫面

```text
┌─────────────────────────────────────┐
│           ☁️  ☁️   ☀️                │
│                                      │
│     🌸          🌸                   │
│         兔兔                         │
│        ┌────┐                        │
│   📖   │ 🛏 │   💻                   │
│        └────┘                        │
│   ┌──────────────────────┐           │
│   │ 今天兔兔覺得：        │
│   │ 大家好像在忙 deploy   │
│   └──────────────────────┘           │
│                                      │
│   🪦 auth-bug  🏴 v2.0  📦 梗       │
└─────────────────────────────────────┘
```

### 固定元素

| 元素 | 用途 | MVP 行為 |
|---|---|---|
| 兔兔 | 主角色 | 根據 mood/energy 播動畫 |
| 天氣/天空 | 群組氣氛 | mood 高變晴，低變陰 |
| 床 | 睡覺/低能量 | energy 低時靠近或睡覺 |
| 書桌 | 思考/工作 | opc think/speak 時靠近 |
| 公告板 | 抽象摘要 | 顯示一句安全摘要或碎碎念 |
| 小箱子 | 記憶物件 | 有新物件時發光 |

### Telegram Mini App 的角色

Mini App 負責：

- 提供 Telegram 內的入口。
- 讀取 Telegram launch context。
- 打開群組對應房間。
- 展示兔兔狀態。
- 讓使用者做低風險互動，如摸摸兔兔。

Mini App 不負責：

- 被動讀群組訊息。
- 直接連 opc Gateway。
- 保存完整聊天紀錄。

### DM 在 v3 的定位

DM 不先做完整私人房間，但要保留作為：

- Admin 設定入口。
- 隱私設定入口。
- 記憶物件確認入口。
- Debug/status 入口。

私人 DM 房間放到 Layer 3 或後續版本。

---

## Layer 2：opc Hook + SSE 事件連動

### 目標

opc 的 Telegram 收訊和回覆會驅動兔兔動作。

### 架構

```text
opc Telegram runtime
  -> message:received / message:sent hook
  -> rabbit-avatar hook
  -> local relay POST /events
  -> SSE room stream
  -> Mini App / web viewer
  -> 兔兔播放動畫
```

### 為什麼用 opc hook

- opc 已經有 `message:received` / `message:sent`。
- 本機已有 `security-guard` hook 證明可行。
- hook 比 Telegram Bot API polling 更接近「兔兔真的回覆了」這個事件。
- 不需要把 opc Gateway token 暴露到瀏覽器。

### 為什麼 SSE 是 MVP 必需

如果沒有 SSE，Mini App 只能刷新或 polling，兔兔就不會像「活著」。

SSE 的 MVP 成本不高：

- `POST /events` 接 hook 事件。
- `GET /events?room=...` 給瀏覽器訂閱。
- EventSource 自動重連。

推遲的是：

- 多人 presence。
- 使用者游標/同時操作。
- WebSocket 雙向控制。
- Durable Object 房間狀態。

### 事件格式

```json
{
  "room": "telegram-group--100123456",
  "source": "opc",
  "kind": "message_sent",
  "animation": "speak",
  "moodDelta": 5,
  "energyDelta": -3,
  "publicText": "兔兔正在回答",
  "privateText": null,
  "createdAt": "2026-04-26T01:30:00+08:00"
}
```

### 事件映射

| opc event | Rabbit event | 狀態變化 |
|---|---|---|
| `message:received` in group | `think` | energy -1 |
| `message:sent success` | `speak` | mood +3, energy -3 |
| `message:sent error` | `confused` | mood -8, energy -2 |
| owner/admin command | depends | no default mood change |
| ignored/no activation | none or subtle glance | no state change |

### 群組文字顯示規則

群組 Mini App 預設不顯示原始訊息內容。

可以顯示：

- 「兔兔正在思考」
- 「兔兔回答完了」
- 「今天大家聊了技術問題」
- 「兔兔看起來有點累」

不顯示：

- 原始群組訊息。
- 完整 opc 回覆。
- 個人身份細節。
- 私密任務內容。

---

## Layer 2.5：低打擾群組存在感

Layer 2.5 是讓兔兔「像活著」的關鍵，但要嚴格控量。

### 1. 兔兔碎碎念

兔兔偶爾在群組說一句短短的話，不是回答問題，而是自然存在。

範例：

```text
兔兔覺得今天大家好像都在忙。
剛剛的討論有點激烈，兔兔耳朵都豎起來了。
晚安，兔兔要趴回床上了。
```

規則：

- 每天最多 2-3 句。
- 同一群組兩句之間至少 3 小時。
- 群組活躍吵鬧時不主動插話。
- 深夜只說晚安，不開新話題。
- Admin 可關閉：`/兔兔安靜`。

碎碎念來源：

- mood/energy。
- 時間。
- 最近事件類型。
- 天氣或簡單 context。

不要做：

- 不要長文日記。
- 不要精準點名群友，除非使用者明確同意。
- 不要評論敏感內容。

### 2. 「兔兔正在...」狀態

v2 的狀態卡片很有產品感，但 MVP 要分階段。

#### Phase A: Mini App 狀態卡

先在 Mini App 裡做：

```text
兔兔正在思考...
兔兔正在翻書...
兔兔剛剛回答完了
```

這只需要 SSE event，不需要 Telegram message editing。

#### Phase B: Telegram 可編輯狀態訊息

之後再做群組內可編輯訊息：

```text
兔兔正在思考...
讀取 context 中
工具執行中
回答完成，點開 Mini App 看兔兔反應
```

注意：

- Telegram bot 可以編輯自己發出的訊息，但需要保存 message id。
- 真正的進度百分比需要 opc 更細的 lifecycle/tool events。
- MVP 不要假裝有 80% 進度，容易不準。

### 3. 個人化招呼動畫

這是高截圖價值功能，保留。

設計：

- 每個重要成員最多一個專屬 greeting。
- 只在 Mini App 打開時觸發。
- 不在群組公開暴露太多身份資訊。

例子：

- Admin 打開：兔兔跑過來揮手。
- 安全專家打開：兔兔敬禮。
- 常幫忙的人打開：兔兔遞茶。
- 普通成員打開：兔兔正常揮手。

MVP 做法：

- 靜態 config mapping。
- 沒有 mapping 就 default greeting。
- 之後再做 admin 設定 UI。

---

## 心情系統

v3 保留 v2 的兩維模型。

```text
mood:   -100 ... 0 ... +100
energy:    0 ... 50 ... 100
```

### 狀態解讀

| mood | energy | 狀態 | 動作 |
|---:|---:|---|---|
| +50 到 +100 | 60 到 100 | 開心有精神 | 跳、轉圈、耳朵挺 |
| +50 到 +100 | 0 到 40 | 開心但累 | 微笑、打哈欠 |
| -20 到 +20 | 60 到 100 | 平靜清醒 | idle、看窗外 |
| -20 到 +20 | 0 到 40 | 安靜疲倦 | 坐下、看書、想睡 |
| -100 到 -40 | 60 到 100 | 生氣/緊張 | 跺腳、耳朵豎 |
| -100 到 -40 | 0 到 40 | 難過/低落 | 耳朵下垂、抱枕 |

### 狀態更新規則

事件 delta：

| 事件 | mood | energy |
|---|---:|---:|
| 被稱讚 | +8 | 0 |
| 被罵或 spam | -12 | -3 |
| 回答完成 | +3 | -3 |
| 回答失敗 | -8 | -2 |
| 被摸摸 | +5 | 0 |
| 深夜被叫醒 | -5 | -5 |
| 每小時自然流逝 | 0 toward neutral | -2 |

Clamp:

- `mood` 永遠限制在 `[-100, 100]`。
- `energy` 永遠限制在 `[0, 100]`。

Decay:

- mood 每小時往 0 靠近 3 點。
- energy 白天緩慢下降，凌晨更快下降。
- 早上可以自動恢復一部分 energy，避免永遠睡死。

事件合併：

- 10 秒內多個 `message:received` 合併成一次 `think`。
- 30 秒內多個 `message:sent` 可以排隊，但不要讓動畫瘋狂中斷。
- 同一事件不要重複套用 mood delta。

### 儲存

MVP state:

```json
{
  "room": "telegram-group--100123456",
  "mood": 12,
  "energy": 64,
  "lastEventAt": "2026-04-26T01:30:00+08:00",
  "lastMutterAt": "2026-04-25T22:00:00+08:00",
  "memoryObjects": []
}
```

Storage options:

- MVP: local JSON file on Mac relay.
- Better: SQLite.
- Later: Cloudflare Durable Object or D1 if relay moves cloud-side.

---

## 群組儀式

v3 保留 v2 的精簡指令。

| 指令 | 效果 | 備註 |
|---|---|---|
| `/兔兔` | 回 Mini App button | 核心入口 |
| `/摸摸兔兔` | mood +5，觸發害羞/開心 | 最直覺 |
| `/兔兔心情` | 回 mood + energy + 一句話 | 快速查狀態 |

新增 admin-only 指令：

| 指令 | 效果 |
|---|---|
| `/兔兔安靜` | 關閉碎碎念 |
| `/兔兔說話` | 開啟碎碎念 |
| `/兔兔記住` | 建立記憶物件候選或確認 |

原則：

- 普通群友只需要記住 3 個。
- Admin 指令可以藏在文件裡，不打擾一般人。
- 自然語言互動仍然交給 opc，不要全部指令化。

---

## 記憶物件化

保留 v2 的手動觸發原則。

### 為什麼不自動產生

自動記憶會很快變成垃圾場。

真正有意義的物件應該稀缺：

- 每個群組最多 20 個。
- 重要事件才留下。
- Admin 有最後決定權。

### v3 流程

```text
群組發生值得記住的事
  -> 兔兔可以在 DM 建議 admin：「要不要把這個變成物件？」
  -> admin 確認
  -> 房間新增物件
  -> 群組 Mini App 裡小箱子發光
```

### 物件 schema

```json
{
  "id": "mem_auth_bug_20260426",
  "room": "telegram-group--100123456",
  "type": "trophy",
  "label": "auth bug",
  "description": "大家修好的第一個大 bug",
  "createdAt": "2026-04-26T01:30:00+08:00",
  "createdBy": "admin",
  "visibility": "group"
}
```

### 物件類型

| type | 視覺 |
|---|---|
| `trophy` | 小獎盃/旗幟 |
| `bug_grave` | bug 墓碑 |
| `book` | 知識/規則 |
| `poster` | 群組梗 |
| `box` | 未分類記憶 |

---

## 隱私設計

### 三層隱私模型

| 層級 | 誰能看 | 顯示內容 |
|---|---|---|
| 公開層 | 群組成員 | 兔兔動作、天氣、記憶物件、碎碎念 |
| 摘要層 | 群組成員 | 抽象摘要，不含原文 |
| 私密層 | owner/admin DM | 完整設定、debug、候選記憶、敏感狀態 |

### 群組安全原則

- 群組 Mini App 永遠不顯示原始訊息內容。
- 預設不點名個人。
- 不顯示 opc 完整工作內容。
- 不顯示 private DM 內容。
- 不把 Gateway token、Bot token、relay secret 放到前端。
- Telegram Mini App `initData` 如果用於身份授權，必須 server-side 驗證。

### 內容輸出規則

Allowed:

- 「兔兔正在思考」
- 「今天群組比較熱鬧」
- 「兔兔有點累」
- 「房間新增了一個記憶物件」

Avoid:

- 「Alice 說了 xxx」
- 「Bob 剛剛問了 yyy」
- 「opc 讀取了某個私密檔案」
- 「完整群組摘要含原始語句」

---

## 手機相機與 AR

### 相機

保留，但不是 MVP。

體驗：

```text
Mini App 點「給兔兔看」
  -> 使用者拍照
  -> 兔兔走近畫面歪頭
  -> 圖片上傳給 backend/opc
  -> 兔兔回覆觀察
```

適合場景：

- 拍錯誤訊息。
- 拍白板。
- 拍桌面找東西。
- 拍實物問兔兔。

要求：

- HTTPS。
- 使用者明確點擊後才 request camera。
- 拍照預覽。
- 壓縮上傳。
- 不背景錄影。

### AR

AR 截圖價值高，但技術風險也高。

放到 Layer 3+：

- WebXR 支援不一致。
- iOS Safari 限制多。
- Telegram in-app browser 是否穩定支援要實測。

短期替代：

- 先做「照片背景 + 兔兔疊上去」的假 AR。
- 比真 WebXR 便宜很多，也足夠可分享。

---

## MVP Roadmap

### Phase 0: Shareable Rabbit

目標：今天或 1-2 天內有可分享 URL。

Deliverables:

- `?mode=view`
- idle 動畫
- mobile quality preset
- Cloudflare Pages deploy
- default screenshot-friendly camera

Success metric:

- 朋友點開連結能在 5 秒內看到動起來的兔兔。

### Phase 1: Telegram Room Shell

目標：Telegram Mini App 可以打開群組房間。

Deliverables:

- Mini App launch URL
- room id mapping
- 5 個固定房間元素
- mood + energy local state
- 3 個群組指令
- admin DM 設定入口的最小版本

Success metric:

- 群組可以用 `/兔兔` 打開同一個房間。

### Phase 2: opc-Reactive Rabbit

目標：opc 事件能驅動兔兔。

Deliverables:

- `rabbit-avatar` opc hook
- local SSE relay
- frontend EventSource client
- event queue
- 5 個動畫：`idle`, `think`, `speak`, `happy`, `sleep`
- privacy-safe public text

Success metric:

- opc 回覆 Telegram 時，Mini App 裡兔兔會同步 `speak`。

### Phase 2.5: Living Presence

目標：兔兔有低打擾存在感。

Deliverables:

- 碎碎念 scheduler
- quiet hours
- `/兔兔安靜`
- manual memory object flow
- personalized greeting config
- Mini App status card

Success metric:

- 群組覺得兔兔「有存在感」但沒有被洗版。

### Phase 3: Camera / Fake AR / Advanced Sync

目標：提升驚喜感。

Deliverables:

- camera capture
- image upload to opc/backend
- fake AR share image
- optional WebSocket/presence
- later true WebXR test

Success metric:

- 使用者願意拍照給兔兔看，並分享結果。

---

## Build Order

建議實作順序：

1. Layer 0 viewer mode。
2. Cloudflare Pages deploy。
3. Mini App shell with static room。
4. mood + energy local state。
5. `/兔兔`, `/摸摸兔兔`, `/兔兔心情`。
6. SSE relay。
7. opc `message:received` / `message:sent` hook。
8. Frontend event queue and 5 animations。
9. 碎碎念 scheduler。
10. 記憶物件 admin flow。
11. 個人化招呼。
12. Camera/fake AR。

不要先做：

- 真 WebXR。
- 完整多人同步。
- 成就系統。
- Mini-games。
- 飢餓度/餵食。
- 複雜 dashboard。

---

## Open Questions

需要實測或決策：

1. Telegram Mini App 在目標手機上的 Three.js performance。
2. Telegram in-app browser 對 WebGL、camera、fullscreen 的實際限制。
3. opc hook 能拿到多少 Telegram group metadata。
4. 是否要把 relay 長期放 Mac + Cloudflare Tunnel，還是後續搬到 Worker/Durable Object。
5. 群組碎碎念是否預設開啟，還是 admin opt-in。
6. 個人化招呼的身份 mapping 要手動設定還是從 Telegram user id 建立。
7. 記憶物件的管理 UI 是在 DM、Mini App admin panel，還是先用 config file。

---

## v3 Final Recommendation

最強的 MVP 不是「功能最多的兔兔」，而是：

```text
一個能在 Telegram 群組被打開的 3D 兔兔房間，
兔兔有 mood/energy，
opc 回覆時她會動，
偶爾用很短的碎碎念表現存在感，
但永遠不洩漏群組原文或私密內容。
```

先把「活著」做出來，再加「聰明」和「好玩」。

