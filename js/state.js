/* Game state, save and load: DESIGN.md section 8.
   localStorage only: 3 slots, autosave at each landmark, and a save code
   (a text string) so a student can move computers or a teacher can load a scenario. */
(function () {
  "use strict";

  const SAVE_VERSION = 1;
  const KEY = "dharmaSilk.slot.";
  const SLOTS = [1, 2, 3];

  function roleById(id) { return window.ROLES.find((r) => r.id === id); }

  // setup: { playerName, background, companions: [{ role, name }] }
  function newGame(setup) {
    const B = window.BALANCE;
    const bg = window.BACKGROUNDS.find((b) => b.id === setup.background);
    let silk = B.startingSilk[bg.silkLevel];
    const roles = setup.companions.map((c) => c.role);
    if (roles.includes("merchant")) silk += B.merchantCompanionSilk;
    if (roles.includes("interpreter")) silk -= B.interpreterHireCost;

    const sutras = B.start.sutras + (setup.background === "scribe" ? B.scribeBackgroundExtraSutras : 0);

    return {
      version: SAVE_VERSION,
      player: { name: setup.playerName, background: setup.background, hp: 100, illness: null, illDays: 0 },
      party: setup.companions.map((c) => ({
        role: c.role, name: c.name || roleById(c.role).defaultName,
        hp: 100, illness: null, illDays: 0, status: "traveling", statusNote: ""
      })),
      supplies: {
        food: B.start.food, water: B.start.water, waterMax: B.start.waterMax, camels: B.start.camels,
        clothing: B.start.clothing, medicine: B.start.medicine, paper: B.start.paper, silk: Math.max(0, silk)
      },
      sutras: { count: sutras, condition: B.start.sutraCondition },
      morale: B.start.morale,
      lamp: B.start.lamp,
      pace: "steady",
      rations: "filling",
      night: false,
      landmark: 0,
      km: 0,
      detourKm: 0,
      year: B.startYear,
      dayOfYear: B.startDayOfYear,
      day: 1,
      helpers: [],
      generosity: 0,
      noFoodDays: 0,
      recentEvents: [],
      flags: { visited: { kucha: {} } },
      phase: "bazaar",      // bazaar → farewell → travel ⇄ landmark → end
      finished: false,
      slot: null,
      savedAt: null,
      log: []
    };
  }

  function hasRole(state, role) {
    return state.party.some((p) => p.role === role && p.status === "traveling");
  }

  /* ---------- Storage (always guarded: private windows, locked-down Chromebooks) ---------- */
  let storageChecked = null;
  function storageOK() {
    if (storageChecked !== null) return storageChecked;
    try {
      const k = "dharmaSilk.test";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      storageChecked = true;
    } catch (e) { storageChecked = false; }
    return storageChecked;
  }
  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function remove(key) {
    try { window.localStorage.removeItem(key); return true; } catch (e) { return false; }
  }

  /* ---------- Save summaries ---------- */
  // "[traveler name] — [landmark], [season, year]"
  function summary(state) {
    const lm = window.LANDMARKS[state.landmark];
    const d = window.ENGINE.dateInfo(state);
    const where = state.finished ? "Journey's end" : (state.km > 0 && window.LANDMARKS[state.landmark + 1]
      ? `Road to ${window.LANDMARKS[state.landmark + 1].name}` : lm.name);
    return { name: state.player.name, where, when: `${d.season} ${d.year} CE`, day: state.day, text: `${state.player.name} · ${where}, ${d.season} ${d.year} CE` };
  }

  function listSlots() {
    return SLOTS.map((n) => {
      const raw = read(KEY + n);
      if (!raw) return { n, empty: true };
      try {
        const data = JSON.parse(raw);
        return { n, empty: false, savedAt: data.savedAt, summary: data.summary };
      } catch (e) { return { n, empty: true, broken: true }; }
    });
  }
  function latestSlot() {
    return listSlots().filter((s) => !s.empty).sort((a, b) => b.savedAt - a.savedAt)[0] || null;
  }
  // The slot a new journey should use: the first empty one, or null if all are full.
  function freeSlot() {
    const s = listSlots().find((x) => x.empty);
    return s ? s.n : null;
  }

  function saveToSlot(state, n) {
    if (!storageOK()) return false;
    state.slot = n;
    state.savedAt = Date.now();
    const data = { version: SAVE_VERSION, savedAt: state.savedAt, summary: summary(state), state };
    return write(KEY + n, JSON.stringify(data));
  }
  function autosave(state) {
    if (!state.slot) return false;
    return saveToSlot(state, state.slot);
  }
  function loadSlot(n) {
    const raw = read(KEY + n);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      const st = migrate(data.state);
      st.slot = n;
      return st;
    } catch (e) { return null; }
  }
  function deleteSlot(n) { return remove(KEY + n); }

  // Older saves still load after updates: fill anything a newer version added.
  function migrate(st) {
    if (!st || typeof st !== "object" || !st.player || !Array.isArray(st.party)) throw new Error("Not a save");
    const fresh = newGame({
      playerName: st.player.name || "Traveler", background: st.player.background || "monk",
      companions: st.party.map((p) => ({ role: p.role, name: p.name }))
    });
    const out = Object.assign({}, fresh, st);
    out.supplies = Object.assign({}, fresh.supplies, st.supplies);
    out.sutras = Object.assign({}, fresh.sutras, st.sutras);
    out.flags = Object.assign({}, fresh.flags, st.flags);
    out.player = Object.assign({}, fresh.player, st.player);
    out.party = st.party.map((p, i) => Object.assign({}, fresh.party[i], p));
    out.version = SAVE_VERSION;
    return out;
  }

  /* ---------- Save codes ---------- */
  // Format: "DS<version>." + base64 of the JSON state. Plain text so it survives email and chat.
  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function fromBase64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function exportCode(state) {
    const copy = JSON.parse(JSON.stringify(state));
    delete copy.slot; delete copy.log;
    const body = toBase64(JSON.stringify(copy));
    // Break into lines of 60 so it's easier to copy by hand if needed.
    return `DS${SAVE_VERSION}.` + body.replace(/(.{60})/g, "$1\n");
  }
  function importCode(code) {
    const clean = String(code || "").replace(/\s+/g, "");
    const m = clean.match(/^DS(\d+)\.([A-Za-z0-9+/=]+)$/);
    if (!m) throw new Error("That doesn't look like a Dharma & Silk save code. It should start with DS1.");
    let st;
    try { st = JSON.parse(fromBase64(m[2])); }
    catch (e) { throw new Error("That save code is incomplete or has a typo. Try copying it again."); }
    st = migrate(st);
    st.slot = null;
    st.log = st.log || [];
    return st;
  }

  window.STATE = {
    SAVE_VERSION, newGame, hasRole, roleById, current: null,
    storageOK, listSlots, latestSlot, freeSlot, saveToSlot, autosave, loadSlot, deleteSlot,
    exportCode, importCode, summary, migrate
  };
})();
