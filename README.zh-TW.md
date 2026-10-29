[繁體中文](README.zh-TW.md) | [English](README.md)
# ASCII Sharks

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

基於 stackedlol/ascii-sharks 修改的 Chrome 新分頁擴充功能，讓 ASCII 鯊魚與魚群成為新分頁的動態背景。

支援自訂鯊魚外觀與動畫設定。

所有設定保存在瀏覽器本機，不會由本專案上傳至外部伺服器。

## 安裝

1. [下載專案 ZIP](https://github.com/yakura-OWO/ascii-sharks/archive/refs/heads/main.zip) 並解壓縮。
2. 開啟 Chrome，進入 `chrome://extensions`。
3. 開啟右上角的「開發人員模式」。
4. 點選「載入未封裝項目」。
5. 選擇專案中的 `extension` 資料夾。

完成後開啟新分頁即可使用。

## 修改與開發

需要 Node.js 及 npm。

```bash
git clone https://github.com/yakura-OWO/ascii-sharks.git
cd ascii-sharks
npm install
npm run dev
```

修改完成後執行：

```bash
npm run build
```

打包結果會輸出至 `extension/`，回到 `chrome://extensions` 重新載入即可。
主要修改檔案：

- `newtab.ts` — 新分頁功能
- `newtab.css` — 介面樣式
- `index.html` — 頁面結構
- `src/` — 原始 ASCII 動畫引擎

## 原始專案
本專案基於 [stackedlol/ascii-sharks](https://github.com/stackedlol/ascii-sharks) 修改。

- 原作者：drewdi
- 原始專案庫：stackedlol/ascii-sharks
- 原始專案：ASCII 魚群與鯊魚動畫引擎
- 本專案新增：Chrome 新分頁介面、搜尋、捷徑及自訂功能

感謝原作者開源此專案。

## AI 開發聲明
本專案的修改與擴充程式碼由 **Anthropic Claude code 和 OpenAI Codex** 協助產生。
原始 ASCII 動畫引擎來自上述開源專案，並非由本專案的 AI 工具原創。

## 授權
本專案依照 [MIT License](LICENSE) 授權。
- 原始程式碼：Copyright © 2026 drewdi
- 修改及新增部分：Copyright © 2026 yakura-OWO
使用、修改或重新發布時，須保留原有版權及 MIT 授權聲明。