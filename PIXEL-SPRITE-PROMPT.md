# 兔兔像素風桌面寵物 — Sprite Sheet 設計指令

## 角色設定

你要為「兔兔」設計一套像素風桌面寵物的 sprite sheet。

### 角色：兔兔（npc_rabbit）
- **物種：** 兔耳女孩（人形，頭上有兔耳朵）
- **身份：** AI 助理，性格溫暖但毒舌，會催主人睡覺、擋購物衝動
- **性別：** 女孩子
- **髮型：** 灰藍色雙馬尾，額前有瀏海
- **髮色：** `#8EB8D4`（主色）、`#6A9AB8`（暗色）、`#B8D8EE`（亮色）
- **膚色：** `#FFD5B8`
- **眼睛：** 大眼動漫風格，藍色虹膜 `#4A90D9`，白色高光
- **腮紅：** 粉色 `#FFB0B0`

### 服裝：藍色女僕裝
- **女僕裝主色：** 深藍 `#2B4A8C`
- **裙子：** 深藍色百褶裙，有淺藍 `#3B5FA0` 的褶痕
- **圍裙：** 白色，從腰部延伸到裙子中間
- **領口：** 白色衣領
- **蝴蝶結：** 藍色 `#4A90D9`，在胸口
- **袖子：** 藍色泡泡袖
- **手套：** 白色長手套
- **腰帶：** 深藍 `#1E3566`
- **絲襪：** 白色，大腿處有藍色蝴蝶結
- **鞋子：** 藍色 `#3B5998` 小皮鞋
- **頭飾：** 白色女僕頭帶

### 兔耳朵
- **外側：** 白色
- **內側：** 粉色 `#FFB0B8`
- **造型：** 長耳朵，微微向外張開，有時會根據心情動（開心→豎直、難過→下垂、害羞→微彎）

### 同伴：Pucci
- **外觀：** 紫色小方塊 `#7B2D8E`，有簡單的白色眼睛和微笑
- **大小：** 兔兔的 1/3 高度
- **角色：** 跟在兔兔旁邊的小寵物

## 技術規格

### 像素尺寸
- **角色大小：** 48x48 像素（含耳朵）
- **Pucci 大小：** 16x16 像素
- **畫布大小：** 每幀 64x64（留空間給動作幅度）

### 比例
- **2.5 頭身**（像 Stardew Valley / Undertale 的角色比例）
- 頭（含耳朵）佔角色高度的 40%
- 身體 + 腿佔 60%

### 風格參考
- Stardew Valley 角色的可愛比例
- Undertale 的表情豐富度
- 拓麻歌子（桌面寵物感）
- **不要 Minecraft 方塊風格**（那是 3D 版的事）
- 像素要乾淨，不要 anti-aliasing
- 輪廓線用深色（`#1A1A2E`），1px

### 色板限制
嚴格使用以下色板，不要自己加顏色：

```
皮膚：#FFD5B8, #F0C4A0
頭髮：#8EB8D4, #6A9AB8, #B8D8EE
眼睛：#4A90D9, #6AB0E8, #1A3060, #FFFFFF
腮紅：#FFB0B0
女僕裝：#2B4A8C, #3B5FA0, #1E3566, #4A6BAF
白色部分：#FFFFFF, #F0F0F8
兔耳內側：#FFB0B8
嘴巴：#FF7B9C
Pucci：#7B2D8E, #9B4DB8, #FFFFFF
輪廓：#1A1A2E
背景：透明
```

## Sprite Sheet 需求

### 基本動畫（MVP，優先做這些）

| 動畫名 | 幀數 | 說明 |
|--------|------|------|
| `idle` | 4 幀 | 站立，微微呼吸（身體上下移動 1px），偶爾眨眼 |
| `idle_look` | 4 幀 | 站立，頭左右張望 |
| `happy` | 6 幀 | 原地跳一下 + 頭上冒 ♡ |
| `speak` | 4 幀 | 嘴巴開合 + 手舉起來比動作 |
| `think` | 4 幀 | 頭歪一邊 + 頭上冒 ? 或 💭 |
| `sleep` | 4 幀 | 坐下 → 頭低下 → zzZ 冒出來 |
| `angry` | 4 幀 | 跺腳 + 臉紅 + 頭上冒 💢 |
| `shy` | 4 幀 | 雙手捂臉 + 耳朵微彎 + 腮紅加深 |
| `walk_right` | 6 幀 | 向右走路 |
| `walk_left` | 6 幀 | 向左走路（可以 mirror walk_right）|

### Pucci 動畫
| 動畫名 | 幀數 | 說明 |
|--------|------|------|
| `pucci_idle` | 2 幀 | 原地微微跳動 |
| `pucci_follow` | 4 幀 | 跟著兔兔走（小短腿快速移動）|

### Sprite Sheet 排列方式
```
每行一個動畫，左到右排列各幀：

Row 0: idle (4 frames)        → 64x64 × 4
Row 1: idle_look (4 frames)   → 64x64 × 4
Row 2: happy (6 frames)       → 64x64 × 6
Row 3: speak (4 frames)       → 64x64 × 4
Row 4: think (4 frames)       → 64x64 × 4
Row 5: sleep (4 frames)       → 64x64 × 4
Row 6: angry (4 frames)       → 64x64 × 4
Row 7: shy (4 frames)         → 64x64 × 4
Row 8: walk_right (6 frames)  → 64x64 × 6
Row 9: walk_left (6 frames)   → 64x64 × 6

最大寬度：6 × 64 = 384px
最大高度：10 × 64 = 640px

Sheet 尺寸：384 × 640，背景透明 PNG
```

### 輸出
1. `sprite_sheet.png` — 完整的 sprite sheet（384×640，透明背景）
2. `sprite_meta.json` — 每個動畫的起始行、幀數、建議播放速度（ms/frame）
3. `preview.html` — 簡單的預覽頁面，可以選動畫播放

## 心情 → 動畫對應表（給桌面寵物程式用）

```json
{
  "mood_high_energy_high": "happy",
  "mood_high_energy_low": "idle",
  "mood_neutral_energy_high": "idle_look",
  "mood_neutral_energy_low": "idle",
  "mood_low_energy_high": "angry",
  "mood_low_energy_low": "sleep",
  "speaking": "speak",
  "thinking": "think",
  "embarrassed": "shy",
  "moving": "walk_right"
}
```

## ⚠️ 重要注意事項

1. **不要用 AI 圖片生成工具畫。** 用 Canvas API 或手動 pixel-by-pixel 繪製。AI 生成的像素圖通常不乾淨。
2. **先畫一個 `idle` 第一幀的大圖（放大 8x = 384x384）讓我 review，確認造型滿意後再畫其他動畫。**
3. **Pucci 的 sprite 可以放在同一張 sheet 的最後兩行。**
4. **所有幀的角色腳底要對齊同一條線**（anchor point 在底部中央），不然動畫會跳。
