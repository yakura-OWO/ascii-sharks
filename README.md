[English](README.md) | [繁體中文](README.zh-TW.md)
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

A Chrome new tab extension based on [stackedlol/ascii-sharks](https://github.com/stackedlol/ascii-sharks), bringing animated ASCII sharks and fish to your new tab background.

Supports customizable shark appearances and animation settings.

All settings are stored locally in your browser and are not uploaded to any external server by this project.

## Installation

1. [Download the project ZIP](https://github.com/yakura-OWO/ascii-sharks/archive/refs/heads/main.zip) and extract it.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the `extension` folder from the extracted project.

Once installed, open a new tab to start using it.

## Development

Requires Node.js and npm.

```bash
git clone https://github.com/yakura-OWO/ascii-sharks.git
cd ascii-sharks
npm install
npm run dev
```

After making changes, run:

```bash
npm run build
```

The build output will be generated in `extension/`. Go back to `chrome://extensions` and reload the extension to apply your changes.

Main files:

- `newtab.ts` — New tab functionality
- `newtab.css` — Interface styles
- `index.html` — Page structure
- `src/` — Original ASCII animation engine
- `public/` — Extension manifest and static files

## Original Project

This project is based on [stackedlol/ascii-sharks](https://github.com/stackedlol/ascii-sharks).

- Original author: drewdi
- Original repository: stackedlol/ascii-sharks
- Original project: ASCII fish and shark animation engine
- Additions in this fork: Chrome new tab interface, search, shortcuts, and customization options

Thanks to the original author for making this project open source.

## AI Development Disclosure

The modifications and additional code in this project were generated with the assistance of **Anthropic Claude Code and OpenAI Codex**.

The original ASCII animation engine comes from the open-source project mentioned above and was not created by the AI tools used in this fork.

## License

This project is licensed under the [MIT License](LICENSE).

- Original code: Copyright © 2026 drewdi
- Modifications and additions: Copyright © 2026 yakura-OWO

The original copyright notices and MIT license must be retained when using, modifying, or redistributing this project.
