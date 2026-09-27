# Playtest notes

Log each playtest here (or as a GitHub Issue), newest first. Give each finding a date.
Balance tweaks go in `data/balance.js`. Design changes go in `DESIGN.md` first, then the code.

## Template

### YYYY-MM-DD · who played · build (commit)
- **What happened:**
- **What felt off:**
- **Change to try:** (balance / design / visual)

---

### 2026-09-27 · simulated player (200–300 runs per party) · first full build
A script played the engine with a sensible strategy. It bought food to reach the next market with a margin, rested when someone was sick, cut rations when food ran short, and stayed at monasteries when lodging was free or someone was unwell.

| Background / companions | Everyone arrives | Avg. lost companions | Lamp score |
|---|---|---|---|
| Young monk / monk, guide, healer, cook | 99% | 0.05 | 104 |
| Merchant's child / merchant, interpreter, camel driver, healer | 93% | 0.2 | 102 |
| Apprentice scribe / scribe, monk, guide, healer | 100% | 0.0 | 128 |
| Merchant's child / guide, cook, scribe, interpreter | 100% | 0.0 | 108 |
| Young monk / scribe, interpreter, camel driver, cook (no guide, healer or monk) | 29% | 2.7 | 81 |

- **What happened:** In the first balance pass, silk ran out by Turfan and most caravans lost everyone. Prices, tolls and monastery hospitality were cut, and alms food was added.
- **What felt off:** It may now be too easy for careful players. The low-silk young monk without a guide or monk companion is very hard.
- **Change to try:** Watch real students. If they're breezing through, raise `eventChancePerDay` or food prices in `data/balance.js`.
