
本專安完全由 claude 及 codex 開發
# ascii sharks

```
                            ;'
                             %%'
                              .t;.               .oooo
                               S;:S%              %8S8.
                                ;:tt%t '..        XX%%S
t'                            ''XSSS8SSX%XX8#.    %XSX%
 :;'               ;.''X8%8XX%%S%%S%SStt%tSX8S#X8't%ttt.
  ::%'       ''8XXXSSt%Stttttt%8@%%@%8@8%Sttt%%%%SSSSS%tt.
  'SXXtt%t%%%S%:;StS%ttSS%tSXSt88@@%8%@8%tStS%%X%SS%%S%;;t
 .@##88#@...'@@@@#@8@88X88#XXXSX8SX88SX8%SS%S%%S88St%t%%%.
  %;%t             :.    '.'##@###@X#888XX##8@@@#.X%XS%.
 .%t                            ;%%%#@@##@@@.     SXS%%
 t.                            .%;%%%.            %%XXS
                              '%t:t              .SXSS'
                             '::.                ooooo
                            .S'
                            .
```

把彩色 ASCII 鯊魚海洋變成 Chrome 新分頁。

Fork of [stackedlol/ascii-sharks](https://github.com/stackedlol/ascii-sharks) — the ASCII fish and shark engine (`src/`) is the original work; this fork wraps it in a Chrome new tab extension.

## 功能

- 動態 ASCII 鯊魚與魚群背景，點擊會激起水波
- 半透明搜尋框（Google 搜尋，或直接輸入網址）
- 可新增、編輯、移除的捷徑（預設為空）
- Google 應用程式選單、可自訂頭像
- 右下角「自訂」：淺色／深色／跟隨系統、游動速度、字元大小、小魚數量，以及每隻鯊魚的種類、大小、顏色

所有設定只存在你自己的瀏覽器（`chrome.storage.local`），不會上傳到任何地方。

## 安裝

1. 下載或 clone 這個 repo
2. 開啟 `chrome://extensions`，打開右上角「開發人員模式」
3. 按「載入未封裝項目」，選擇 `extension` 資料夾

Chrome 會在擴充功能換掉新分頁時於頁面下方顯示一條頁尾，可在「自訂 Chrome」側邊面板中關閉。

## 開發

```sh
npm install
npm run dev     # 開發伺服器，新分頁頁面
npm run build   # 打包到 extension/
```

修改 `index.html`、`newtab.ts`、`newtab.css`、`src/`、`public/` 後執行 `npm run build`，再到 `chrome://extensions` 重新載入。`extension/` 是打包結果，請勿直接修改。

原作者的展示頁在開發伺服器的 `/original-demo.html`，引擎用法：

```ts
import { OceanEngine } from "./src";

const engine = new OceanEngine(canvas, [{ kind: "hammerhead", size: 1 }]);
```

## 授權

MIT，見 [LICENSE](LICENSE)。原始引擎 © drewdi，新分頁擴充功能部分 © yakura-OWO。
