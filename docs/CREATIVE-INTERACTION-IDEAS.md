# 兔兔創意互動方案

Date: 2026-04-26  
Purpose: collect product/interaction ideas for making the OpenClaw rabbit feel like a living Telegram companion, not just a 3D avatar.

## 核心方向

不要只做「OpenClaw 回訊息時，3D 兔兔嘴巴動」。

更有特色的方向是把兔兔做成一個 **Telegram 裡的共享小生命**：

- 在 DM 裡是私人 AI 夥伴。
- 在群組裡是大家共同照顧、共同觀察的小生物。
- 在 Mini App 裡有自己的 3D 房間、心情、記憶和日常行為。
- OpenClaw 訊息事件只是其中一種刺激，群組氣氛、時間、互動儀式、任務進度也會影響兔兔。

## 1. 群組共享狀態

讓兔兔在每個 Telegram 群組都有一份共享狀態。

狀態例子：

- 心情：開心、害羞、焦慮、生氣、睏、興奮
- 精神：清醒、疲倦、睡覺中
- 好感度：根據群組互動累積
- 安全感：群組吵架、spam、陌生人頻繁 tag 會下降
- 好奇心：技術討論、圖片、問題會提高
- 飢餓度：用 `/餵兔兔` 或 Mini App 小道具補充

事件對狀態的影響：

- OpenClaw 成功回覆：心情 +1，觸發 `speak`
- 有人稱讚兔兔：好感度 +1，觸發 `happy`
- 群組太吵：安全感下降，觸發 `nervous`
- 深夜沒人說話：進入 `sleep`
- 有人一直重複叫她：變成 `annoyed`

MVP 可以先只做：

- `mood`
- `energy`
- `lastInteractionAt`
- `groupAffinity`

## 2. Telegram Mini App 小房間

Mini App 不只是打開 3D 模型，而是一個「兔兔房間」。

DM 模式：

- 私人房間。
- 可以顯示較完整的對話泡泡。
- 可以有「今天兔兔記得你的事」。
- 可以放私人任務、提醒、常用工具。

群組模式：

- 共享房間。
- 同群組成員打開 Mini App 會看到同一隻兔兔的狀態。
- 預設不顯示原始訊息內容，只顯示兔兔反應與抽象狀態。
- 群組完成某些事，房間會多出紀念物。

房間元素：

- 床：兔兔睡覺狀態
- 書桌：思考、查資料、coding 狀態
- 公告板：今日群組觀察
- 小箱子：群組累積的記憶道具
- 天氣/天空：群組情緒投影

## 3. 訊息情緒投影

不要直接把群組訊息全部顯示在 3D 畫面上。

更好的方式是把「聊天氣氛」投影到環境：

- 大家很開心：天空變亮、櫻花變多、兔兔跳一下
- 技術討論：兔兔拿書、戴眼鏡、頭上出現小燈泡
- 爭論變多：雲變暗、兔兔縮起來、耳朵下垂
- 群組安靜：兔兔坐下、看書、打瞌睡
- 有人問很難的問題：兔兔歪頭、進入 `think`
- OpenClaw 出錯：兔兔慌張、掉下小紅色驚嘆號

這樣比較安全，也比較有角色感。

## 4. 兔兔行為日誌

每天自動生成一段「兔兔今天觀察到的事」。

範例：

```text
兔兔今天觀察日記

今天大家下午 3 點最忙。
@alice 問了最多技術問題。
群組今天有一點焦慮，可能是因為 deploy 卡住了。
兔兔覺得今天最值得記住的是：大家終於修好那個 auth bug。
```

可以輸出到：

- Telegram 群組每日訊息
- Mini App 公告板
- 房間裡的一本日記書

注意：

- 群組版不要暴露太多私人細節。
- 可以用摘要，不要保存完整聊天內容。
- 可以讓群組用 `/兔兔日記 off` 關掉。

## 5. 群組儀式

讓兔兔成為群組的共同玩具。

指令例子：

- `/召喚兔兔`：兔兔跑出來揮手
- `/餵兔兔`：恢復能量
- `/讓兔兔睡覺`：進入 sleep
- `/兔兔占卜`：隨機一句今日建議
- `/兔兔心情`：回報目前心情
- `/兔兔房間`：回傳 Mini App button
- `/摸摸兔兔`：觸發害羞或開心動作
- `/兔兔記住這個`：把一句話變成房間物件或記憶

互動重點：

- 指令不一定要功能很強。
- 重要的是讓群組建立共同習慣。
- 儀式感會讓兔兔比較像群組成員。

## 6. 反應優先於文字

OpenClaw 不一定每次都要回長文字。

兔兔可以用動作表達狀態：

- 點頭：同意
- 歪頭：困惑
- 跺腳：不高興
- 跳一下：開心
- 抱枕頭：累了
- 翻書：查資料
- 戴眼鏡：進入認真模式
- 耳朵下垂：難過或被嚇到
- 轉圈：任務完成

這能避免群組被 AI 文字洗版。

也可以設計「低打擾模式」：

- 群組裡只發很短訊息。
- 主要表情與反應放在 Mini App。
- 需要完整回答時再由使用者點開。

## 7. 手機相機：兔兔看世界

手機相機不要只是普通圖片上傳。

體驗可以是：

```text
使用者打開 Mini App
  -> 點「給兔兔看」
  -> 拍照
  -> 兔兔在 3D 畫面裡走近照片
  -> 歪頭分析
  -> Telegram 或 Mini App 回覆觀察結果
```

使用情境：

- 拍桌面：兔兔幫你看東西在哪裡
- 拍錯誤訊息：兔兔進入 debug 模式
- 拍食物：兔兔給吐槽或建議
- 拍白板：兔兔整理重點

安全原則：

- 必須使用者主動拍照。
- 不做背景錄影。
- 上傳前顯示預覽。
- 預設壓縮與去除不必要 metadata。

## 8. 記憶物件化

把群組的重要事件變成房間裡的物件。

例子：

- 修好的 bug：小墓碑或戰利品
- 完成的專案：旗幟
- 常見梗：貼紙或小雕像
- 重要提醒：公告板紙條
- 某個常出現的人：專屬小道具
- 失敗的 deploy：燒焦的箱子

這會讓記憶變得可見，而不是藏在文字資料庫裡。

MVP 做法：

- 先用 JSON 存 object list。
- 每個 object 有 `type`, `label`, `createdAt`, `sourceEvent`, `visibility`。
- 前端根據 object list 渲染簡單方塊/牌子/書本。

## 9. 共同觀看與同步事件

如果多個人同時打開群組 Mini App，可以看到同步事件。

例子：

- OpenClaw 回覆時，所有人都看到兔兔說話。
- 有人按 `/餵兔兔`，所有人都看到兔兔吃東西。
- 群組氣氛改變，所有人的天空一起變化。

技術上可以用：

- SSE room stream
- WebSocket room stream
- Cloudflare Durable Object room state

MVP 可以先用 SSE：

```text
GET /events?room=telegram-group--100xxxx
```

每個事件帶：

```json
{
  "room": "telegram-group--100xxxx",
  "type": "happy",
  "durationMs": 1800,
  "publicText": "兔兔看起來很開心",
  "ts": "2026-04-26T..."
}
```

## 10. 角色化的任務狀態

把 OpenClaw 的工作狀態轉成兔兔行為。

狀態映射：

- reading context：翻書
- searching web：拿放大鏡
- coding：敲小鍵盤
- waiting approval：舉牌子
- tool error：慌張
- task done：插旗
- long-running task：坐在桌前專注

這會讓使用者不用看 log 也知道兔兔在做什麼。

## 11. 推薦 MVP：兔兔共享房間

最推薦的創意 MVP：

```text
Telegram Mini App 兔兔房間
+ OpenClaw message hooks
+ 群組共享心情狀態
+ 事件驅動 3D 動作
+ 每日兔兔觀察日記
```

MVP feature set:

- Cloudflare Pages static 3D room
- Telegram Mini App launcher
- SSE relay
- OpenClaw `message:received` / `message:sent` hook
- `mood` + `energy` shared state
- 5 animations: `idle`, `think`, `speak`, `happy`, `sleep`
- `/兔兔房間`
- `/兔兔心情`
- daily diary summary

Why this MVP is strong:

- It is technically realistic.
- It uses OpenClaw's existing hook system.
- It creates a differentiated product feeling.
- It works in both DM and group.
- It avoids privacy problems by making group output mostly emotional/visual instead of raw transcript mirroring.

## 12. Later Ideas

Future expansions:

- Seasonal room themes.
- User-specific relationship level with rabbit.
- Group achievements.
- "兔兔夢境": nightly generated surreal summary of the day.
- Voice reaction: rabbit makes short sounds when happy/surprised.
- Mini-games: feed, pet, clean room.
- Shared inventory for group members.
- "Rabbit memory museum" for long-term group milestones.
- Scheduled rabbit routines: morning greeting, midnight sleep, deploy ritual.
- Admin controls for privacy and frequency.

