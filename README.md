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

## How to play

Name yourself, choose who you are and four companions, and stock up at the Kucha bazaar. Then walk east from landmark to landmark.
On the road you set the pace and the rations; at each landmark you can visit, rest, trade and talk.
Get your sutras to Chang'an, and see who helped along the way.

Keys: **1–9** pick an option · **Enter** confirms · **Esc** closes a window · **Space** stops and starts travel · **Tab** moves between buttons.

## Build status

Chapter 1 (the Desert Road, Kucha to Chang'an) is complete: title, party setup, bazaar, travel loop, 10 landmarks,
15 random events, fixed story events with "What really happened" cards, dialogue scenes, save slots and save codes,
and the end screen with the gratitude scroll. See `DESIGN.md` section 12 for rules settled during the build.

Not built yet (see `DESIGN.md` section 2): the bazaar trading minigame, sound and music, and Chapters 2 and 3.
