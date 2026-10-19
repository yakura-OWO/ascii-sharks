# ascii sharks

An artificial-life ocean drawn as ASCII on a canvas: schools of tiny fish and the sharks that hunt them.

Fish are boids with a blind spot behind them; alarm spreads through a school so the whole thing bolts when its edge sees a shark, and fleeing fish split around the shark's path. Sharks wander, patrol, get hungry, and go after stragglers in sparse water. Eaten fish come back later as new schools swimming in from the edges. The cursor scares fish, and a click splashes.

Sharks are rasterised cell by cell from a swimming spine: shaded skin glyphs, edge glyphs for anti-aliasing, fins that bank into turns, and a hide that shimmers with accent colours.

Zero dependencies. Pulled out of haj.

## Run the demo

```sh
npm install
npm run dev
```

Pick the sharks with a query string, biggest first: `?sharks=thresher,hammerhead,mako,nurse`. With no query you get four classics.

## Use it

```ts
import { OceanEngine } from "./src";

const engine = new OceanEngine(canvas, [
  { kind: "greathammer", size: 1.2 },
  { kind: "hammerhead", size: 1.05 },
  { kind: "tiger", size: 0.95 },
  { kind: "zebra", size: 0.8 },
]);

// later
engine.destroy();
```

`size` is relative to the biggest shark; smaller sharks read as deeper and are drawn dimmer and underneath. The canvas's `font-family` sets the glyphs, so give it a monospace font (the demo uses Geist Mono). The engine handles resize, pauses off-screen, and shows a single still frame under `prefers-reduced-motion`. Sharks keep a soft no-swim zone in the middle of the frame so a headline over the water stays clear.

In React, `src/react.tsx` has an `<AsciiOcean sharks={...} />` wrapper.

The water is always drawn light on black. For a light theme, invert it and rotate the hue back:

```css
.light .ascii-ocean { filter: invert(1) hue-rotate(180deg); }
```

## Sharks

### Classic

`classic`. The default. Rounded snout, sickle pectorals, forked tail, cool blue-grey back.

```
                         '
                          t.
                           ;;:
                            ;%%:.
                             :%t;S.
                              %S;:S%'
                              St;:tt%tS'..'
                 .          .'8XXS%SX%SXX%#%8SSSoo.
''                :;.'8XX%XXXttS%%S%%Stt%tStSSSSoo%%S
 '::'        'X8SXSSSt%Stttttt%8@%%@%S%%%Sttt%%%%%SSS%'
  '8XXtt%t%%%S;:%StS%ttSS%tSXS%88@@%8SS%%tStS%%X%SS%%%t'
 .###88##@@@@@@##8@8@X8X888XXXSX8SXXXSX%%SS%%%%%XXX%X;.
  %;%             t:    ''@##8@##8#X#XX8XX#8##88oo##@
 %%                           :;;%#@#@@@@#@@#@@@oo'
                              :%%;%%%%
                             '%%t:t.
                            .:::%'
                           .:S;
                          .;:
                         '.
```

### Hammerhead

`hammerhead`. Swept-back cephalofoil with the eyes on its tips, a tall first dorsal and a long upper tail lobe. Bronze-olive.

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

### Great hammerhead

`greathammer`. A wider, nearly straight cephalofoil notched at the centre, a towering sickle dorsal, and slate skin.

```
                             '
                             ':.
                              .::'                 oooo.
                               ';S%.               SXXX'
                                .:S%;.             X%X%.
                                 :tt%tS8X.         X%%X.
.:.                '         '''XSSSXSSX%%#S#.     XSSS.
 :;:               'S''X8%XXX%%S%%S%SStt%tSt8S#X8' ttttt
  ::%S       ''8SXXSSt%Stttttt%8@%%@%8@888ttt%%%%SSSSS%tt.
  'SXXtt%t%%%S%:;;tS%ttSS%tSXSt88@@%8%@88@StS%%X%SS%%St;;t
 .###88#@...@@@@@#@8@X8X888XXXSX8SX88SX888S%%%%S88#t%t%%%.
  ';%t             ';    '.###@##8@X#8X8XX#8##@@#. %SS%.
  %t;                            %%@#@@###@@#.    'XStS.
 .%'                            ';%%%%...         '%XXX.
 %                              t:tS.              XS%%'
                               :%:'                %S%X
                              ;;.                  oooo
                             ;'
```

### Tiger

`tiger`. Blunt, square snout on a heavy body, with wavy dark bars across the back. Warm grey-brown.

```
                          .t
                           .@#.
                            .@@:.
                             '%t;S.
                              'S;:@@%
                               t;:@%#8S8#S@8..
                 .         ..88SX%###%SXX%#%8S%%Xoo8.
':.               :;.X8@X%XX%#%Stt@##Stt%@@t%%%SSSt%%;.
 '::%       ''X##@SSSt###ttt%#%8@%%@%S%%%%%tt%%%%%SSS%t.
  '8XXtt%t%#%S;:#@%S%t@@%%tS@%%88@@%8SS%%##tS%%X%SS%%%t;
 .###88##@@@@@@#@@#X#X@#%X8X#@@X8SX%@SX%%%@%%%%%XXX%S;t'
  %;%'            t:  '.##@##%@888%#%XXXX%8XX8X8SX#8#%.
 .%.                          ';#@#@#@@#@#@##@@@@oo@.
 .                            .%%;@#%%#@@....
                              %%t:%.
                             #::%'
                            %@%'
                           ;%
                          .
```

### Zebra

`zebra`. Short rounded head, a body that ends halfway, then a long ribbon of a tail. Pale ridges and leopard spots on sandy skin.

```
                                   .
                                   %%'
                                    %;t'
                                    tStt;
                                  .8%%X%%XSSX8'.
                          .t''X%%X;;t::#:t:;S8XXX%o%.
          '''X8#@XX@%X#SS@:;t@%tS@%t%%%%St%#%%@%%SSS%t
   .8%t%t%%%S%t%StSS%%XSS:ttSt88@@%%tt;;:t:t;;%;tt#%%t'
.'.@@#####%#%@@@@...'    '.@#@t%@888SX%%SS@%%%#%%@%X;t
                          '    '@%8%8;t;:t;####X8@o@.
                                   '@@@@@@@#@..'
                                    #%#%.
                                   :@%.
                                   %.
```

### Mako

`mako`. Long conical snout, a torpedo body that narrows hard to the tail stalk, and a tall crescent tail. Metallic indigo.

```
                             %.
                              %t;
                               S;:S'
                                ;:tt%'.
.:.                           ''XS%SX%S#%XX8#XSo.
 :;:              ''  '.8%8XX%%S%%S%SStt%tXX8SSooXS
  ::%S        ''XXXSSt%Stttttt%8@%%@%S%%%Sttt%%%%%SS8
  'SXX%%St%%;t%t%StSSt%SS%tSXSt88@@%8SS%%tStS%%X%SS%%%t
 .@####.....''..'#@#@8#X88#8XXSX8SX88SX%%SS%%%%%X88X@
  ';%t            .       .'##@##8@X#8X#88##8#8oo#@
  %t;                           ;%%@#@@@@@@@#@@o'
 .%'                           .%;%%.
 %                            '%t:
                             '::
                            .'
```

### Thresher

`thresher`. A compact body over the front half, then an upper tail lobe that whips out as long as the shark itself. Bronze-violet.

```
                                          .
                                           %.
                                            ;t
                                             t:.
                                              tt%'
                                              'tt;: ..'
                                               ;SSS%SSX%@#Xoo.
                                     '    'XX%%SS%Xt%%%SX#Xooo;.
                      ...'.'''..''..S%%Xt%ttS%%%%8tttt%%%%%SSS%%t
       '''X%%%%S%tt%%%SSS%%8XXXS88XSS%%%S%XSS@888@StXS%S%SXS%%%%t'
'@###.'''.....                       ..'@@##88SS%XS%%%%%XXXX%S;;t
                                           ''@@##X#XXX88X#8ooo%%
                                              '::@@#88@@@@@oo.
                                              tt%%. ..
                                             't::
                                            .:S
                                           ;;
                                          S'
```

### Nurse

`nurse`. Blunt, broad head, a heavy flat body with both dorsals set far back, rounded paddle fins, and a long low tail. Tawny.

```
                                 %
                                 S%;
                                  t%tS'..'
                             ''XS%SX%SX%%S8S8S88XSo.
                     '.8%8XX%%S%%S%%Stt%tStSSS#XX%oo;;
       '.''''''.8XXXt%Stttttt%ttSt%tS%%%Sttt%%%%%SSS%t.
 '.XXtt%t%%%S%t%S:;;t%S8%8%XSt%%%StXSS%%tStS%%X%SS%%%t;
.@##8X888#8#@@.''.#@8#888#XXXSX8SX8XSX%%SS%%%%%XXX%S;t'
                        '.###@##8@X#8X8XX#88@8#X8#oo%;
                                .#@#@@###@@#@@@@@@o.
                                 %%%%.
                                 tS
                                '
```

## Files

| File | What it does |
| --- | --- |
| `src/world.ts` | The simulation: fish schools, sharks, hunting, respawns |
| `src/renderer.ts` | Draws the world as ASCII cells, and every shark's shape |
| `src/engine.ts` | Wires world and renderer to a canvas: loop, resize, pointer, reduced motion |
| `src/species.ts` | Fish species and how each one schools |
| `src/math.ts` | Helpers and the ocean current |
| `src/react.tsx` | React wrapper |
