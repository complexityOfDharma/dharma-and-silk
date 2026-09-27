# Dharma & Silk

An Oregon Trail–style game for Dharma School students (about ages 8–13) about the
ordinary people who carried the Buddha's teaching along the Silk Road, from Kucha
to Chang'an in 400 CE.

- **Play:** https://complexityofdharma.github.io/dharma-and-silk/ (once GitHub Pages is on)
- **Design:** [`DESIGN.md`](DESIGN.md) is the source of truth. **Playtests:** log them in [`PLAYTEST.md`](PLAYTEST.md).

## Run it

No build step. Open `index.html` in a browser, straight from disk, or serve the folder with any static server.

## Review helpers

- `?debug=1` shows a debug panel: jump to any screen or landmark scene.
- `?scene=dunhuang` opens one landmark scene (`&guides=1` outlines where the HUD panels will sit).
- `?screen=setup` opens party setup directly.

## Build status

| Phase | What | Status |
|---|---|---|
| 1 | Stage, tokens, fonts, rotate prompt | Done |
| 2 | Pixel sprites; title scene; 10 landmark scenes | Done |
| 3 | Title screen and party setup | Done |
| 4 | Save system (slots, autosave, save codes) | Next |
| 5 | Kucha bazaar | |
| 6 | Travel loop, calendar, pace, rations | |
| 7 | Landmark screens and HUD | |
| 8 | Random events and "What really happened" cards | |
| 9 | Dialogue scenes and fixed story events | |
| 10 | End screen and gratitude scroll | |
| 11 | Debug mode, accessibility and balance pass | |
