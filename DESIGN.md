# Dharma & Silk: Buddhism along the Silk Road — Design Doc

*Source of truth for the game. When a playtest changes the design, update this file first, then the code.*

Visual reference: the Claude Design canvas **"Dharma & Silk — Retro Dusk"** (Title, Party setup, Dunhuang, Faxian dialogue, Style tile). Section 9 of this doc captures everything on that canvas, so the build does not depend on opening it.

## 1. Vision

An Oregon Trail–style game for Dharma School students (roughly ages 8–13) about the ordinary people who carried the Buddha's teaching east. The player is **not** a famous figure. They are one of many monks, merchants, scribes and cooks whose journeys added up. Famous figures appear as people the party meets. The theme is interdependence: the teaching reached us through many hands.

**History rules**
- Real history only. No legends or miracle stories.
- Creative freedom is allowed where gameplay needs it: the player's party, their encounters with real people, and compressed travel times.
- Every invented encounter is marked `invented: true` in the data, shows the "Invented meeting · Real people" tag on screen, and its "What really happened" card says what is real.
- Use Buddhist terms, not borrowed Christian ones: *monastery* (vihara) and *sangha*, never "abbot" or "church". For a named senior monk, say "elder monk" or "teacher".
- Tone: honest about hardship, gentle for kids. Companions can fall ill or leave the caravan; keep it light, Oregon Trail style.

## 2. MVP scope (Chapter 1 only)

**In the MVP**
- Title screen with main menu (new journey, continue, enter save code, the real history)
- "What is your name, traveler?", choose a background, choose and name 4 companions
- Buy supplies at the Kucha bazaar
- Travel loop across 10 landmarks, with pace and ration choices
- Landmark screens with actions (continue, visit, rest, trade, talk)
- Random events and fixed story events, each followed by a "What really happened" card
- **Dialogue scenes**: JRPG-style modal with the NPC's pixel portrait, dialogue text and numbered choices. Some choices unlock only with a certain companion in the party.
- Save and load: 3 slots, autosave at each landmark, export/import a save code
- End screen: Lamp score plus the gratitude scroll

**Not in the MVP (later)**
- Bazaar trading minigame (the MVP uses a simple buy/sell list)
- Chang'an arrival activity: **undecided**. The translation minigame is dropped. For the MVP, arriving at Chang'an plays a short story scene, then the end screen.
- Chapters 2 (Sea Road) and 3 (Pacific Road), plus the Legacy carryover
- Sound and music (the settings and sound buttons are in the layout but can be stubs)

## 3. Chapter 1: The Desert Road (Spring 400 CE to early 402 CE)

**Setup.** Kucha, a Buddhist kingdom of monasteries and painted caves. Its most famous monk, Kumarajiva, was taken to China by a general's army in 384 and is still held in Liangzhou. The monks of your monastery (the *sangha*) entrust you with a bundle of Sanskrit sutras. No single leader sends you; the community does. Emperor Yao Xing is welcoming monks to Chang'an, and China needs more texts. Take them there.

**Route and landmarks** (distances approximate)

| # | Landmark | From previous | Notes |
|---|---|---|---|
| 1 | Kucha | start | Bazaar, farewell from the monks of your monastery |
| 2 | Karashahr (Agni) | ~300 km | Oasis kingdom, toll |
| 3 | Turfan (Gaochang) | ~300 km | Monastery, bazaar, summer heat |
| 4 | Hami (Yiwu) | ~400 km | Last oasis before the hard stretch |
| 5 | Dunhuang | ~400 km | Cave temples; meet Faxian (autumn 400); winter here |
| 6 | Jiuquan | ~400 km | Border permits; beacon towers |
| 7 | Zhangye | ~200 km | Hexi Corridor, rival kingdoms |
| 8 | Guzang (Wuwei) | ~250 km | Siege and surrender (401) |
| 9 | Lanzhou | ~250 km | Yellow River crossing |
| 10 | Chang'an | ~600 km | Translation hall; *Amida Sutra* (402) |

**Fixed story events**
1. **Dunhuang, autumn 400: meeting Faxian** (dialogue scene; the mockup screen is its first node). A group of Chinese monks heading *west* to India, led by Faxian, now in his sixties. `invented: true`. Real: Faxian passed through Dunhuang in 400, and its ruler, Li Gao, supplied his desert crossing. His route then ran through Shanshan and **Agni**, the oasis your caravan passed. Choices:
   1. Share water and dried fruit for his journey: −2 water, Lamp +3
   2. *(Guide in party)* The guide describes the wells on the road to Agni: Lamp +2
   3. Ask why he would travel so far at his age: follow-up lines about the incomplete monastic rules (Vinaya) in China, then return to choices
   4. Wish them a safe journey and move on
2. **Wait out winter at Dunhuang.** The calendar skips ahead to spring 401. The monk companion gets free lodging; everyone else pays.
3. **Hexi Corridor, 401.** Rival kingdoms and armies block the road. Wait (lose days) or detour (costs food and risks getting lost). Real: the corridor was split between several warring states around 400.
4. **Guzang, 401.** The Later Qin army forces Liangzhou to surrender. Kumarajiva is escorted to Chang'an, and your caravan follows in the army's wake. Following the army is `invented: true`; the surrender and escort are real.
5. **Yellow River at Lanzhou.** Cross on the winter ice (risky, free) or pay for the ferry.
6. **Chang'an, early 402.** Emperor Yao Xing sets up a translation hall where hundreds of monks help Kumarajiva. You deliver your sutras, and that year the *Amida Sutra* is translated, the same text Shin temples chant today. Delivering to the hall is creative freedom. Short story scene, then the end screen.

**The calendar.** It advances by day. Seasons matter:
- Summer heat in the desert: offer "travel at night" (slower, but uses less water).
- Winter in the mountains or on the river: more clothing and food used.

## 4. Characters

**Player background** (pick one)

| Background | Starting silk | Perk |
|---|---|---|
| Young monk | Low (■□□) | Free food and lodging at monasteries |
| Merchant's child | High (■■■) | Better prices at bazaars |
| Apprentice scribe | Medium (■■□) | Starts with 2 extra sutra copies |

**Companions** (pick 4 of 8, no duplicates, name each)

| Role | Bonus | Tradeoff | Default name |
|---|---|---|---|
| Monk | Free lodging at monasteries; slows morale loss | Won't trade or handle money | Punya |
| Sogdian merchant | Better prices; +silk at start | Wants detours to trade towns (+days) | Nanaivandak |
| Cook | Food spoils more slowly; fewer food illnesses | Heavy pots: less camel capacity | Suvarna |
| Scribe | Repairs scrolls; copies sutras at monasteries | Slower pace; uses paper and ink | Dharmika |
| Interpreter | Faster, cheaper checkpoints and tolls | Costs silk to hire | Kumudā |
| Guide | Finds water; fewer "lost the trail" events | Leaves at their home oasis (Agni) unless paid more | Arshi |
| Camel driver | Camels stay healthy and carry more | Camels need extra fodder | Kanaka |
| Healer | Can cure illness, dysentery included | Uses medicine | Vasu |

Default names are placeholders the player can overwrite. **Role-gated dialogue:** any dialogue choice can require a role in the party (`requires: "guide"`). Show it with the role tag chip (section 9).

Each person has **health** (Good / Fair / Poor / Very poor). A companion in very poor health may leave to rest at a monastery, or die.

## 5. Resources

- **Food** (days' rations), **Water** (skins), **Camels**, **Warm clothing**, **Medicine**, **Paper & ink**, **Silk** (currency)
- **Sutras:** count, plus a condition from 0–100%. Sand, water and fire damage them; the scribe repairs them.
- **Morale**
- **Pace:** Steady / Strenuous / Grueling
- **Rations:** Filling / Meager / Bare bones
- **The Lamp** (0–100): how strongly the teaching is taking root in China. It rises when you deliver sutras, rest and teach at monasteries, and share supplies with other travelers. Computer-run caravans also add small amounts during the trip, shown as a toast ("Monks from Khotan reached Chang'an with new sutras · LAMP +1"), so players see they are one voice among many.

**No hunting** (first precept). Food comes from bazaars, alms and monastery hospitality.

## 6. Random events

Each event lives in the data file with: id, text, choices, which roles change the outcome, which seasons it can happen in, where it can happen, and a "What really happened" note.

- Sandstorm (*kara-buran*): lose days; sutra damage unless you stop and cover the cargo
- Dry well: lose water; the guide finds another source
- Desert heat: offer travel at night
- Cold desert night: needs warm clothing
- Lame camel: the camel driver prevents it
- Dysentery: the healer cures it (yes, the homage stays)
- Oasis toll: the interpreter or merchant lowers it
- Border checkpoint: need a permit; the interpreter helps
- Food spoils: the cook prevents it
- Lost the trail: the guide prevents it
- Struggling caravan asks for water: give (costs water, Lamp +) or refuse
- Monastery at an oasis: rest; the scribe copies sutras; the monk gets free lodging
- River or rain damages scrolls: the scribe repairs them
- Guide reaches their home oasis: pay them to stay or let them go
- Bazaar at a trade town: buy and sell

## 7. End screen

**Lamp score** = sutras delivered × condition, + companions who arrived, + acts of generosity.

The **gratitude scroll** lists, in order:
1. The monks of your monastery in Kucha
2. Your companions, by the names the player gave them (including any who didn't finish)
3. The people who helped along the way
4. Faxian's party
5. Kumarajiva and the translators of Chang'an
6. "...and now, [player name]."

Close with *Namu Amida Butsu*.

## 8. Save system

- `localStorage` only; no server, no accounts
- **3 save slots**, each named "[traveler name] — [landmark], [season, year]". The title menu's Continue row shows the latest one ("Kai · Dunhuang, autumn 400 CE").
- Autosave on reaching each landmark; manual save from the landmark menu
- **Export save code:** a copyable text string, so a student can move to another computer or a teacher can load a scenario. Import from the title screen ("Enter a save code").
- Always handle unavailable storage (private windows, locked-down school Chromebooks): warn, and keep export/import working.
- Save data includes a `version` number so older saves still load after updates.

## 9. Visual design: "Retro Dusk"

A retro pixel look (Oregon Trail / 16-bit) with a warm dusk palette and clean, modern screen layouts. Everything is square: no rounded corners, no blur, no gradients. Depth comes from **4px borders** and **hard offset shadows**.

### 9.1 Stage
- Design at a fixed **1280×800** stage. Scale the whole stage to fit the window (letterboxed, `transform: scale()`), keeping the aspect ratio.
- Target laptops, Chromebooks and tablets in landscape. On a portrait phone, show "Turn your device sideways" rather than reflowing.
- Pixel art uses `shape-rendering: crispEdges` (SVG) or `image-rendering: pixelated` (canvas/img). Scene geometry snaps to an **8px grid**; sprites use a 4px unit.

### 9.2 Color tokens

```css
:root {
  /* sky bands, top → horizon */
  --sky-night: #24234a; --sky-dusk: #37325f; --sky-mauve: #5a3d6e; --sky-plum: #8a4f78;
  --sky-rose: #b8607a;  --sky-coral: #e08c74; --sky-glow: #f09c70;  --sky-haze: #f6c28b;
  /* land & scene */
  --dune-far: #e08a6c; --dune-mid: #a8566a; --dune-near: #6b3659;
  --cliff: #bf7a52; --cliff-ledge: #dc9a6c; --cliff-strata: #a7643f; --cave: #4a2a38;
  --ground: #e5ae7c; --ground-dot: #d49a6a; --wall: #cf956a; --roof: #6b3346;
  --poplar: #f0b53f; --poplar-shade: #d98d2b; --trunk: #6b4234;
  --sun: #ffe2ad; --camel: #5b3346;
  /* interface */
  --panel: #2b1a36; --panel-2: #3b2747; --panel-line: #5a3d6e; --shadow: #120e1f;
  --cream: #fff4e6; --paper: #f6ecdf; --card: #fffaf3; --paper-line: #e3cfb8;
  --apricot: #f2b35e; --terracotta: #c8643b; --eyebrow: #f6c89a;
  /* text & status */
  --muted: #cdb5c4; --muted-lt: #6d5a66;
  --good: #7fd8bf; --good-lt: #2f6f69; --fair: #ffe08a; --poor: #f5a3a3; --cost-lt: #a8455a;
  --water: #7fc8e0; --flame: #ff8a3d;
}
```

Use `--apricot` for the one primary action on dark screens and `--terracotta` for selection on paper screens.

### 9.3 Type
- **Press Start 2P** (Google Fonts): title (64px), screen headings (20–26px), labels, buttons and keycaps (9–16px). Always uppercase.
- **VT323** (Google Fonts): body, numbers, dialogue and lists. Dialogue 24–26px, lists 24–30px, captions 19–22px. Sentence case.
- Fallback: `monospace`. Chinese names (法顯) fall back to the system font; that's fine.

### 9.4 Components
| Component | Spec |
|---|---|
| Dark panel (HUD over scenes) | bg `--panel`, 4px `--cream` border, shadow `6px 6px 0 --shadow`, padding 14–18px |
| Paper panel (modals, setup) | bg `--paper`, 4px `--panel` border, shadow `8–10px 8–10px 0 --shadow` |
| Primary button (on dark) | bg `--apricot`, text `--panel`, Press Start 12–16px, shadow `4px 4px 0 --shadow`, trailing "›" |
| Primary button (on paper) | bg `--panel`, text `--cream`, shadow `6px 6px 0 --terracotta` |
| Secondary button | bg `--panel-2`, 3px `--panel-line` border, VT323 24px |
| Highlighted menu row | full-width apricot row with a "▸" cursor; other rows transparent |
| Keycap | 26px square, Press Start 11px. Selected: `--terracotta` bg, `--card` text. Else `#efe1d0` bg, `#7a5a3a` text. Keys 1–9 choose options. |
| Chips (VT323 20px, square) | bonus `#dcece8`/`#245e58` · warning `#f6dde0`/`#8e3048` · water `#e2eef3`/`#2e6b85` · Lamp `#fbe6c8`/`#8a5210` · invented tag `#efe1d0`/`#7a5a3a` |
| Role tag | Press Start 9px, `#dfe7f5` bg, `#3a5a95` text, e.g. GUIDE |
| Lamp meter | 20 square segments, 2px gaps, framed by a 3px `--panel-line` border; filled `--apricot`, the leading segment `--flame`, empty `--panel-2`; flame icon and the number in VT323 34px |
| Journey track | 4px line with 10 square nodes (16px). Visited: filled apricot. Current: cream with a 4px apricot border and a panel outline. Future: 4px cream outline. Labels: start, "Next: X · N km", end. |
| Toast | dark panel with a 4px `--good` border, a small mint square, text, and "LAMP +1" in apricot |
| Party row | 28px square avatar (initial in Press Start 12px, color per member), name, role in `--muted`, health word colored good/fair/poor |
| Icons | 24px stroke icons, `stroke-linecap: square`, stroke 2.2–2.5 (bowl, scales, pot, brush, speech, compass, camel, leaf, drop, silk, scroll) |

### 9.5 Screens

**Title** (canvas 1)
- Full-bleed pixel scene: 7 sky bands, pixel stars, a big pixel sun low on the right with two faint halo rings, 4 stepped dune layers. The caravan (3 camels + a walking monk with staff) is a silhouette on the mid-dune ridge in the dune's own color. A stupa silhouette sits on the near dune.
- Left column: eyebrow "CHAPTER ONE · THE DESERT ROAD", title "DHARMA / & SILK" (64px, cream, apricot "&", 6px hard shadow), subtitle "Buddhism along the Silk Road".
- Menu in a dark panel (500px): highlighted "▸ BEGIN THE JOURNEY", then Continue (with the save summary), Enter a save code, The real history. Keycaps 1–4 on the right of each row.
- Footer: "400 CE · KUCHA TO CHANG'AN · A JOURNEY OF MANY HANDS". Bottom right: square Sound and Settings buttons.

**Party setup** (canvas 2)
- Left dark column (460px): "STEP 1 OF 3 · YOUR CARAVAN"; "WHAT IS YOUR NAME, TRAVELER?"; a big VT323 name input with an apricot underline and a block cursor; "WHO ARE YOU?" with 3 background options (square radio, title, perk, silk pips). There's a small night scene at the bottom: stepped hills, moon, campfire.
- Right paper area: "CHOOSE FOUR COMPANIONS" with the subline "Each brings a gift and a cost. No one crosses the desert alone." and an "N OF 4" counter.
- 4×2 companion grid. **Selected card:** `--card` bg, 4px terracotta border, offset shadow; icon tile and ✓ toggle; role as eyebrow; **the companion's name is the editable title**; + bonus in `--good-lt`, − cost in `--cost-lt`. **Unselected card:** muted, `#efe3d3` bg, "+" toggle, role as the title.
- "CARAVAN GIFTS" chips summarize the party's bonuses. Add warning chips for gaps ("No healer: dysentery is dangerous!").
- Footer: "‹ BACK" and "TO THE KUCHA BAZAAR ›".

**Landmark: Dunhuang** (canvas 3; this is the template for every landmark)
- Full-bleed pixel scene. The HUD floats over it in dark panels:
  - Top-left: landmark card ("LANDMARK 5 OF 10", name, "Autumn · 400 CE · Day 148 · Cool and clear")
  - Top-center: journey track plus the toast
  - Top-right: the Lamp card
  - Bottom-left: supplies (2×3 grid: icon, value, label)
  - Bottom-center: action dock (a primary "CONTINUE EAST TO [NEXT] ›" button, then 4 secondary buttons: Caves / Rest / Market / Talk). A "!" badge marks an action with a new story event.
  - Bottom-right: "YOUR CARAVAN" party list
- Dunhuang scene: Mogao cliff face with rows of cave openings and a wooden walkway on the left; pixel sun; Mingsha dunes; a rammed-earth wall with a gate tower; autumn poplars; a stepped road; the caravan camp (2 resting camels, a campfire, 2 figures).
- Keep the center band of the scene clear of HUD so the camp and landmark stay visible.

**Dialogue: Faxian** (canvas 4; the template for all dialogue scenes)
- The landmark screen stays underneath with a `rgba(18,14,31,0.72)` scrim.
- Paper modal (1060×546) at the bottom-center. The **pixel portrait (32×32 at 9×, 296px framed)** sits at the left and pops 64px above the modal's top edge.
- Under the portrait: "REAL HISTORY" label, a 2–3 sentence note, and a "WHAT REALLY HAPPENED ›" button that opens the full card.
- Right column: speaker name (Press Start 26px) and native name (法顯), the "INVENTED MEETING · REAL PEOPLE" chip when `invented: true`, a one-line description, the dialogue box (card bg, 4px `--paper-line` border, "▾" continue marker), then up to 4 choices.
- Choice row: keycap, optional role tag, text, and effect chips on the right (−2 WATER, LAMP +3). The focused choice has a terracotta border and an offset shadow.
- Text appears with a quick typewriter effect; any key or tap completes it.

**Screens still to design in this style** (same components, no new ones needed): travel screen (scene scrolls, walking caravan, pace/rations controls), bazaar (paper panel buy/sell list), event card (paper modal without a portrait), "What really happened" card, supplies/caravan detail, save/load slots, end screen with gratitude scroll.

### 9.6 Pixel art recipes
- **Sky:** 6–7 flat horizontal bands using the sky tokens. Add a few 4px stars in the top bands.
- **Dunes and hills:** stepped silhouettes. Sample a smooth curve every 16px across and snap y to 8px. Use 3–4 layers far→near: `--dune-far`, `--dune-mid`, `--dune-near`, `--panel`.
- **Sun:** a pixel circle built from 8px rows, with 1–2 halo rings in `--sun` at 15–25% opacity.
- **Silhouettes:** caravan and stupa on a ridge use that ridge's color, so they read as part of the skyline.
- **Scene sprites:** units of 4px (camel = 20×14 units, 80×56px).

### 9.7 Accessibility
- All controls are real buttons, inputs and links, reachable by Tab, with visible focus: a 4px apricot outline plus the offset shadow.
- Number keys 1–9 pick choices; Enter confirms; Esc closes modals.
- Minimum text: VT323 19px, Press Start 9px (chip labels only).
- Status is never color-only: health uses words (GOOD / FAIR / POOR), and effects use signed numbers.

## 10. Tech

- Plain HTML, CSS and JavaScript. No framework, no build step, deploys to GitHub Pages as-is.
- Game data (landmarks, events, dialogues, roles, balance numbers) and pixel sprites live in plain `.js` files that set a global object. This keeps the data editable and lets the game open straight from disk (`fetch` and ES modules fail on `file://`).
- Fonts from Google Fonts: Press Start 2P and VT323 (with `monospace` fallback).
- Scenes are inline SVG built from path data (crispEdges). Sprites are stored as path strings per color (see the appendix).
- **Debug mode:** `?debug=1` adds a panel to jump to any landmark, add supplies, open any dialogue, or trigger any event.

```
index.html
css/tokens.css     color tokens from 9.2
css/style.css      components and screens
js/state.js        game state, save/load, save codes
js/engine.js       travel loop, events, resources, score (no DOM)
js/dialogue.js     dialogue modal, typewriter, choices, role gating, event cards
js/ui.js           screens and HUD
js/sprites.js      pixel sprites, portraits and scene builders (appendix)
data/landmarks.js  includes each landmark's scene composition and history cards
data/events.js     random events, fixed story events, other caravans' toasts
data/dialogues.js
data/roles.js
data/balance.js    all tuning numbers in one place
DESIGN.md          this file
PLAYTEST.md        notes from each playtest
```

**Dialogue data shape** (example):

```js
DIALOGUES.faxian_dunhuang = {
  speaker: "Faxian", native: "法顯", portrait: "faxian",
  subtitle: "Monk of Chang'an, in his sixties · heading west to India",
  invented: true,
  history: "Faxian passed through Dunhuang in 400 CE. Its ruler, Li Gao, supplied his desert crossing. Your meeting is invented.",
  lines: ["You've come from Kucha? Then you have already crossed the desert we are about to enter.",
          "Li Gao, lord of Dunhuang, gave us food for the road, but none of us knows where the wells are. We go to India for the full rules for monks — China's copies are incomplete."],
  choices: [
    { text: "Share water and dried fruit for his journey", effects: { water: -2, lamp: 3 } },
    { text: "{guide} describes the wells on the road to Agni", requires: "guide", effects: { lamp: 2 } },
    { text: "Ask why he would travel so far at his age", next: "faxian_why" },
    { text: "Wish them a safe journey and move on" }
  ]
};
```

`{guide}` is replaced with the player's name for that companion. A gated choice is hidden when its role isn't in the party.

## 11. Playtest workflow

1. Play, then log findings in `PLAYTEST.md` (or as GitHub Issues), each with a date.
2. Balance tweaks (too hard, too easy, too long) go in `data/balance.js`. No design change needed.
3. Design changes (a new role, a changed rule, a new screen) go into this file first, then into code, in the same commit.
4. Visual changes: update section 9 (and the design canvas if you're using it) before changing CSS.
5. Keep `main` deployable; try bigger changes on a branch.

## Appendix: sprite data

Each sprite is a grid; each `M x y h w v h h -w z` is one rectangle in grid units. Render inside an `<svg>` with `shape-rendering="crispEdges"`, scaled by the unit size.

**Camel** (20×14 units; render at 4px per unit)
```
body #5b3346: M8 0h2v2h-2z M5 3h2v1h-2z M11 3h2v1h-2z M16 3h3v1h-3z M15 4h5v1h-5z M4 4h10v1h-10z M14 4h2v3h-2z M3 5h12v1h-12z M2 6h15v2h-15z M2 8h14v1h-14z M3 9h12v1h-12z M3 10h1v4h-1z M5 10h1v4h-1z M12 10h1v4h-1z M14 10h1v4h-1z M1 6h1v3h-1z
blanket #c8643b: M4 5h10v1h-10z
sutra bags #f2b35e: M4 6h3v2h-3z M11 6h3v2h-3z
rider (title silhouette only, same color as body): M7 2h4v2h-4z
```

**Walking monk with staff** (6×9 units; 4px): `M1 0h2v2h-2z M0 2h4v5h-4z M0 7h1v2h-1z M3 7h1v2h-1z M5 0h1v9h-1z`

**Stupa** (14×21 units; 4px): `M6 0h2v6h-2z M5 2h4v1h-4z M5 4h4v1h-4z M5 6h4v2h-4z M4 8h6v1h-6z M3 9h8v1h-8z M2 10h10v2h-10z M1 12h12v6h-12z M0 18h14v3h-14z`, plus a lamp on top in `--apricot`: `M6 -2h2v2h-2z`

**Lamp flame icon** (8×10 units; 3px): outer `#ff8a3d` `M3 0h2v2h-2z M2 2h4v2h-4z M1 4h6v3h-6z M2 7h4v1h-4z` · core and dish `#f2b35e` `M3 4h2v3h-2z M0 9h8v1h-8z M1 8h6v1h-6z`

**Faxian portrait** (32×32 units; 9px → 288px)
```
bg bands: #b8607a y0–9 · #e08c74 y10–15 · #f6c28b y16–23
hill #e7a476: M0 24V20h6v-1h8v1h8v-2h10v14H0Z
sun #ffe4a8: M2 3h3v1h-3z M1 4h5v2h-5z M2 6h3v1h-3z
staff #6b4234: M27 5h1v27h-1z
staff rings #f2b35e: M26 1h3v1h-3z M25 2h1v3h-1z M29 2h1v3h-1z M26 5h3v1h-3z
skin #e8b48a: M12 5h8v1h-8z M11 6h10v1h-10z M10 7h12v10h-12z M11 17h10v1h-10z M12 18h8v1h-8z M9 11h1v3h-1z M22 11h1v3h-1z M14 19h4v2h-4z M25 24h3v2h-3z
highlight #f6d2ae: M13 5h4v1h-4z M12 6h4v1h-4z
skin shade #c98d63: M21 8h1v9h-1z M20 17h1v1h-1z M19 18h1v1h-1z M15 14h2v1h-2z M14 19h4v1h-4z M12 14h1v2h-1z M19 14h1v2h-1z M13 8h6v1h-6z
white brows #fff4e6: M11 10h3v1h-3z M18 10h3v1h-3z
closed eyes #2a1a14: M12 12h2v1h-2z M18 12h2v1h-2z
mouth #9a5a44: M14 16h4v1h-4z
robe #b5533a: M8 21h16v1h-16z M5 22h20v10h-20z
under-robe #6f6258: M13 21h6v1h-6z M14 22h4v2h-4z M15 24h2v1h-2z
kasaya drape #cd6a45: M6 22h3v1h-3z M7 23h3v1h-3z M9 24h3v1h-3z M10 25h3v1h-3z M12 26h3v1h-3z M13 27h3v1h-3z M15 28h3v1h-3z M16 29h3v1h-3z M18 30h3v1h-3z M19 31h3v1h-3z
patch seams #8a3a28: M22 23h1v9h-1z M9 28h1v4h-1z M5 29h4v1h-4z
```

Use the Faxian portrait as the pattern for other NPC portraits (Li Gao, an elder monk of your Kucha monastery, Kumarajiva): same 32×32 grid, same framing, a background matched to the landmark's sky.

**Title scene dune layers** (1280×800, 16px columns snapped to 8px)
```
far  #e08a6c: M0 800V560H16V552H64V544H96V536H144V528H208V520H320V512H400V520H496V528H544V536H576V544H624V552H688V560H768V568H896V560H960V552H1008V544H1040V536H1056V528H1088V520H1120V512H1168V504H1248V512H1280V800Z
mid  #a8566a: M0 800V616H32V608H80V600H144V592H288V600H368V608H416V616H464V624H512V632H560V640H656V648H720V640H816V632H864V624H896V616H928V608H960V600H992V592H1024V584H1072V576H1200V584H1248V592H1280V800Z
near #6b3659: M0 800V688H16V680H64V672H112V664H176V656H496V664H560V672H608V680H656V688H704V696H800V704H928V696H1008V688H1056V680H1088V672H1136V664H1184V656H1264V664H1280V800Z
front #2b1a36: M0 800V744H16V736H112V728H208V720H336V712H592V720H704V728H784V736H896V744H1168V736H1248V728H1280V800Z
```

## 12. Rules settled during the first build (September 2026)

The first full build had to decide things this doc left open. They are recorded here so the doc stays the source of truth; change them here first.

**Time and route**
- Seasons follow the Chinese solar calendar: spring from about Feb 4, summer May 5, autumn Aug 7, winter Nov 7. Paces are 12 / 16 / 20 km a day, so most caravans reach Dunhuang in late summer or autumn 400.
- Winter at Dunhuang is mandatory in 400: war closes the road east, so the calendar skips to spring 401 whenever you leave. Monks stay free, others pay 2 silk each, and the monks send you off with 15 days of food.
- Guzang: if you arrive before autumn 401, the siege skips the calendar to the surrender (autumn 401). Then you follow the army east (invented), which halves random events until Chang'an.
- Yellow River: pay the ferry, cross on the ice (winter only, risky), or wait for the river to freeze.
- Chang'an: if you arrive before 402, a short scene has Kumarajiva arrive in the first weeks of 402. Then comes the delivery scene, then the end screen.

**Supplies**
- Food is counted in days for the whole caravan (Filling 0.8, Meager 0.6, Bare bones 0.4 per day for five people).
- Water: you own a number of skins (capacity) and some are full. Wells on the road refill some skins; every landmark refills them all for free. Hot summer desert travel doubles water use, and night travel cuts it by about half.
- Camel load: each camel carries 12 (15 with the camel driver), each person carries 4, and the cook's pots take up 4. Overloading slows the caravan and can make a camel collapse.
- Markets are at Kucha, Turfan, Hami, Dunhuang, Zhangye, Guzang and Chang'an. The bazaar advice tells you how far the next market is.

**People**
- Health is a hidden 0–100 score shown as words. A companion in very poor health usually leaves to rest at a monastery; one who reaches zero dies.
- The player never dies. At very low health you collapse and the caravan rests until you can walk.
- If food runs out for three days, a passing caravan shares food, at most once between two landmarks.

**Roles in detail**
- Monk companion: the whole caravan lodges free at monasteries (except the winter at Dunhuang, where only monks are free), and morale losses are halved.
- Young monk (player): lodges free, and gets extra alms food at monasteries.
- Guide: better chance of finding wells, and stops dry-well and lost-trail events. The guide's home is Agni, the second landmark, so the choice to pay them (10 silk) comes early.
- Sogdian merchant: at each market town, spends a day trading (+1 day, +3 silk).
- Healer: cures illness (in 3 days with medicine, or with herbs if there is none).

**Landmark actions**
- Visit: at a monastery, stay 2 nights. You pay lodging, rest, get alms food, and teach once (Lamp +1). The scribe copies one sutra there (uses 2 paper). Everywhere else, look around. Either way you get a history card.
- Rest: 1, 3 or 5 days. The scribe mends the scrolls while you rest.
- Talk: a local at each landmark, and the story meetings (Faxian at Dunhuang, marked "!", then Li Gao). Effects from a talk only apply the first time.
- Save / Menu buttons sit on the landmark card. Autosave happens after the arrival story.

**Other**
- Settings: text speed (normal, fast, instant) and travel speed (slow, normal, fast), stored per browser.
- Lamp score = sutras × condition × 10 + 10 per companion who arrived + 5 per act of generosity.
- The 32×32 NPC portraits come from one builder (face, hat, beard, robe and background options), following the Faxian pattern.
