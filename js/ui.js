/* Screens: title, party setup, bazaar, travel, landmarks, save slots, end screen.
   DESIGN.md section 9.5. Each screen renders into #screen and may set a key handler. */
(function () {
  "use strict";

  const S = window.SPRITES;
  const E = window.ENGINE;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const screenEl = () => $("#screen");
  const st = () => window.STATE.current;
  const LM = () => window.LANDMARKS;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- Settings (per viewer, kept in localStorage when it works) ---------- */
  const PREFS_KEY = "dharmaSilk.prefs";
  let prefsCache = null;
  function prefs() {
    if (prefsCache) return prefsCache;
    prefsCache = { textSpeed: "normal", travelSpeed: "normal" };
    try { Object.assign(prefsCache, JSON.parse(localStorage.getItem(PREFS_KEY) || "{}")); } catch (e) { /* ignore */ }
    return prefsCache;
  }
  function savePrefs() { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefsCache)); } catch (e) { /* ignore */ } }

  /* ---------- Stage scaling (9.1) ---------- */
  function fitStage() {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
    document.documentElement.style.setProperty("--scale", String(s));
  }
  window.addEventListener("resize", fitStage);

  /* ---------- Keyboard routing ---------- */
  let screenKeys = null;
  const modalStack = [];
  function typing(e) {
    const t = e.target;
    return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
  }
  document.addEventListener("keydown", (e) => {
    if (e.target && e.target.closest && e.target.closest("#debug-panel")) return;
    if (modalStack.length) {
      const m = modalStack[modalStack.length - 1];
      if (e.key === "Escape" && m.escCloses) { e.preventDefault(); closeModal(); return; }
      if (e.key === "Tab") { trapFocus(e, m.el); return; }
      if (m.onKey && !typing(e)) m.onKey(e);
      return;
    }
    if (screenKeys) screenKeys(e);
  });

  /* ---------- Toasts (9.4): one at a time, queued ---------- */
  const toastQueue = [];
  let toastTimer = null;
  function toast(text, lampGain) {
    toastQueue.push({ text, lampGain });
    if (toastQueue.length > 4) toastQueue.splice(0, toastQueue.length - 4);
    if (!toastTimer) nextToast();
  }
  function nextToast() {
    const root = $("#toast-root");
    const t = toastQueue.shift();
    if (!t) { root.innerHTML = ""; toastTimer = null; return; }
    root.innerHTML = `<div class="toast"><span>${esc(t.text)}</span>${t.lampGain ? `<span class="lamp-gain">LAMP +${t.lampGain}</span>` : ""}</div>`;
    toastTimer = setTimeout(nextToast, 2600);
  }
  function clearToasts() { toastQueue.length = 0; clearTimeout(toastTimer); toastTimer = null; $("#toast-root").innerHTML = ""; }
  function toastAll(list) {
    (list || []).forEach((t) => (typeof t === "string" ? toast(t) : toast(t.text, t.lamp)));
  }

  /* ---------- Modals ----------
     opts: bare (html is the whole content), dialogClass, scrimClass, closeButton,
           escCloses (default true), onKey, onClose, focus */
  function openModal(html, opts) {
    opts = opts || {};
    const returnFocus = document.activeElement;
    const scrim = document.createElement("div");
    scrim.className = "scrim" + (opts.scrimClass ? " " + opts.scrimClass : "");
    const closeBtn = opts.closeButton === false ? "" : '<button class="modal-close" type="button" aria-label="Close">X</button>';
    scrim.innerHTML = opts.bare ? html
      : `<div class="modal panel-paper ${opts.dialogClass || ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title">${closeBtn}${html}</div>`;
    $("#modal-root").appendChild(scrim);
    const m = { el: scrim, returnFocus, onClose: opts.onClose, onKey: opts.onKey, escCloses: opts.escCloses !== false };
    modalStack.push(m);
    const cb = $(".modal-close", scrim);
    if (cb) cb.addEventListener("click", closeModal);
    if (m.escCloses) scrim.addEventListener("mousedown", (e) => { if (e.target === scrim) closeModal(); });
    $$("[data-close]", scrim).forEach((b) => b.addEventListener("click", closeModal));
    const first = $(opts.focus || "[data-autofocus]", scrim) || cb;
    if (first) first.focus();
    return scrim;
  }
  function closeModal() {
    const m = modalStack.pop(); if (!m) return;
    m.el.remove();
    if (m.returnFocus && document.contains(m.returnFocus)) m.returnFocus.focus();
    if (m.onClose) m.onClose();
  }
  function closeAllModals() {
    while (modalStack.length) modalStack.pop().el.remove();
  }
  function trapFocus(e, root) {
    const f = $$("button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])", root)
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function confirmModal(title, text, yes, onYes) {
    openModal(`<h2 id="modal-title">${esc(title)}</h2><p>${esc(text)}</p>
      <div class="modal-actions"><button class="btn-outline-paper" type="button" data-close data-autofocus>Cancel</button>
      <button class="btn-primary-paper" type="button" id="confirm-yes">${esc(yes)} ›</button></div>`);
    $("#confirm-yes").addEventListener("click", () => { closeModal(); onYes(); });
  }

  function show(render) {
    stopTravel();
    screenKeys = null;
    clearToasts();
    closeAllModals();
    render(screenEl());
  }

  // Run a list of steps (each gets a `next` callback) one after another.
  function chain(steps, done) {
    const list = steps.filter(Boolean);
    const run = (i) => { if (i >= list.length) { if (done) done(); return; } list[i](() => run(i + 1)); };
    run(0);
  }

  /* =================================================================
     HUD COMPONENTS (9.4)
     ================================================================= */
  function chipHtml(c) { return `<span class="chip chip-${c.kind}">${esc(c.text)}</span>`; }

  function lampMeterHtml(value) {
    const filled = Math.round(Math.max(0, Math.min(100, value)) / 5);
    let segs = "";
    for (let i = 0; i < 20; i++) {
      const cls = i < filled - 1 ? "on" : i === filled - 1 ? "lead" : "";
      segs += `<span class="seg ${cls}"></span>`;
    }
    return `<div class="lamp-meter" role="meter" aria-label="The Lamp" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value)}">${segs}</div>`;
  }
  function lampCard(state) {
    return `<section class="hud hud-tr panel-dark" aria-label="The Lamp">
      <div class="lamp-head">${S.lampFlame(3)}<span class="lamp-title">The Lamp</span><span class="lamp-num">${Math.round(state.lamp)}</span></div>
      ${lampMeterHtml(state.lamp)}
      <p class="lamp-sub">${state.sutras.count} sutras · ${Math.round(state.sutras.condition)}% condition</p>
    </section>`;
  }

  function journeyTrack(state) {
    const L = LM(), n = L.length;
    const seg = E.segment(state);
    const progress = seg && state.km > 0 ? Math.min(1, state.km / seg.km) : 0;
    const pos = (i) => (i / (n - 1)) * 100;
    let nodes = "";
    L.forEach((l, i) => {
      const cls = i < state.landmark ? "visited" : i === state.landmark ? (state.km > 0 ? "visited" : "current") : "future";
      nodes += `<span class="node ${cls}" style="left:${pos(i)}%" title="${esc(l.name)}"></span>`;
    });
    const fillPct = pos(state.landmark) + progress * (100 / (n - 1));
    const next = L[state.landmark + 1];
    const mid = next ? `Next: ${next.name} · ${E.kmToNext(state)} km` : "Journey's end";
    return `<section class="hud hud-tc panel-dark" aria-label="Journey">
      <div class="track" aria-hidden="true"><span class="track-line"></span><span class="track-fill" style="width:${fillPct}%"></span>${nodes}
        ${state.km > 0 ? `<span class="track-caravan" style="left:${fillPct}%"></span>` : ""}</div>
      <div class="track-labels"><span>${esc(L[0].name)}</span><span class="track-next">${esc(mid)}</span><span>${esc(L[n - 1].name)}</span></div>
      <p class="visually-hidden">Landmark ${state.landmark + 1} of ${n}. ${esc(mid)}.</p>
    </section>`;
  }

  function suppliesPanel(state) {
    const s = state.supplies;
    const foodDays = Math.floor(s.food / Math.max(0.01, E.foodPerDay(state)));
    const items = [
      ["food", foodDays, "days food", foodDays < 5],
      ["drop", `${Math.floor(s.water)}/${s.waterMax}`, "water", s.water < 2],
      ["camel", s.camels, "camels", s.camels < 1],
      ["clothing", s.clothing, "warm clothes", false],
      ["medicine", s.medicine, "medicine", false],
      ["silk", Math.floor(s.silk), "silk", s.silk < 3]
    ];
    return `<section class="hud hud-bl panel-dark" aria-label="Supplies">
      <h2 class="hud-h">Supplies</h2>
      <div class="supplies">${items.map(([ic, v, l, low]) => `
        <div class="sup${low ? " is-low" : ""}">${S.icon(ic, 24)}<span class="sup-val">${v}${low ? '<span class="low-tag">LOW</span>' : ""}</span><span class="sup-lbl">${l}</span></div>`).join("")}
      </div>
    </section>`;
  }

  function roleColor(p) {
    if (p.isPlayer || p.role === "player") return "var(--apricot)";
    const r = window.STATE.roleById(p.role);
    return r ? r.color : "var(--panel-line)";
  }
  function healthHtml(p) {
    const w = E.healthWord(p.hp);
    return `<span class="hw hw-${w}">${E.HEALTH_LABEL[w].toUpperCase()}</span>${p.illness ? '<span class="sick-tag">SICK</span>' : ""}`;
  }
  function partyPanel(state) {
    const people = E.traveling(state);
    const bg = window.BACKGROUNDS.find((b) => b.id === state.player.background);
    return `<section class="hud hud-br panel-dark" aria-label="Your caravan">
      <div class="hud-h-row"><h2 class="hud-h">Your caravan</h2><button class="link-btn" type="button" data-action="details">Details ›</button></div>
      <ul class="party">${people.map((p) => {
        const role = p.isPlayer ? bg.title : window.STATE.roleById(p.role).role;
        return `<li class="prow"><span class="avatar" style="background:${roleColor(p)};color:${p.isPlayer ? "var(--panel)" : "var(--cream)"}">${esc(p.name.charAt(0).toUpperCase())}</span>
          <span class="pname">${esc(p.name)} <span class="prole">${esc(role)}</span></span>${healthHtml(p)}</li>`;
      }).join("")}</ul>
    </section>`;
  }

  function placeCard(state, title, eyebrow) {
    const d = E.dateInfo(state);
    return `<section class="hud hud-tl panel-dark" aria-label="Where you are">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1 class="place-name">${esc(title)}</h1>
      <p class="place-sub">${esc(d.label)} · Day ${state.day} · ${esc(E.weather(state))}</p>
      <div class="place-btns">
        <button class="mini-btn" type="button" data-action="save" aria-label="Save or load">${S.icon("scroll", 18)}<span>Save</span></button>
        <button class="mini-btn" type="button" data-action="menu" aria-label="Menu">${S.icon("gear", 18)}<span>Menu</span></button>
      </div>
    </section>`;
  }

  // Party / supplies detail window.
  function detailsModal() {
    const state = st();
    const s = state.supplies;
    const bg = window.BACKGROUNDS.find((b) => b.id === state.player.background);
    const all = [Object.assign({}, state.player, { isPlayer: true })].concat(state.party);
    const rows = all.map((p) => {
      const role = p.isPlayer ? bg.title : window.STATE.roleById(p.role).role;
      const status = p.isPlayer || p.status === "traveling"
        ? `${E.HEALTH_LABEL[E.healthWord(p.hp)]}${p.illness ? ` · sick with ${window.BALANCE.illness[p.illness].label}` : ""}`
        : cap(p.statusNote || p.status);
      return `<tr><td><span class="avatar" style="background:${roleColor(p)}">${esc(p.name.charAt(0))}</span></td>
        <td>${esc(p.name)}</td><td class="muted">${esc(role)}</td><td>${esc(status)}</td></tr>`;
    }).join("");
    const load = E.load(state), capy = E.capacity(state);
    openModal(`
      <p class="eyebrow eyebrow-paper">Day ${state.day} · ${esc(E.dateInfo(state).label)}</p>
      <h2 id="modal-title">Your caravan</h2>
      <table class="detail-table"><tbody>${rows}</tbody></table>
      <div class="detail-grid">
        <p><b>Food:</b> ${Math.floor(s.food / E.foodPerDay(state))} days (${esc(state.rations === "bare" ? "bare bones" : state.rations)} rations)</p>
        <p><b>Water:</b> ${Math.floor(s.water)} of ${s.waterMax} skins full</p>
        <p><b>Camels:</b> ${s.camels} · load ${load} of ${capy}${load > capy ? " (overloaded!)" : ""}</p>
        <p><b>Warm clothes:</b> ${s.clothing} for ${E.traveling(state).length} people</p>
        <p><b>Medicine:</b> ${s.medicine} · <b>Paper &amp; ink:</b> ${s.paper}</p>
        <p><b>Silk:</b> ${Math.floor(s.silk)}</p>
        <p><b>Sutras:</b> ${state.sutras.count} at ${Math.round(state.sutras.condition)}% condition</p>
        <p><b>Morale:</b> ${Math.round(state.morale)} of 100 · <b>Pace:</b> ${esc(state.pace)}</p>
      </div>
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Close ›</button></div>`,
      { dialogClass: "modal-wide" });
  }

  function gameMenu() {
    openModal(`
      <h2 id="modal-title">Menu</h2>
      <div class="menu-list">
        <button class="btn-outline-paper" type="button" id="gm-save">Save or load</button>
        <button class="btn-outline-paper" type="button" id="gm-details">Your caravan</button>
        <button class="btn-outline-paper" type="button" id="gm-settings">Settings</button>
        <button class="btn-outline-paper" type="button" id="gm-history">The real history</button>
        <button class="btn-outline-paper" type="button" id="gm-title">Quit to title</button>
      </div>
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Back to the game ›</button></div>`);
    const go = (id, fn) => $(id).addEventListener("click", () => { closeModal(); fn(); });
    go("#gm-save", () => slotsModal("save"));
    go("#gm-details", detailsModal);
    go("#gm-settings", settingsModal);
    go("#gm-history", historyModal);
    go("#gm-title", () => confirmModal("Quit to the title screen?", "Your journey was saved when you last reached a landmark. Anything since then will be lost unless you save now.", "Quit", titleScreen));
  }

  /* =================================================================
     TITLE (canvas 1)
     ================================================================= */
  let soundOn = false;

  function titleScreen() {
    show((root) => {
      const ok = window.STATE.storageOK();
      const latest = ok ? window.STATE.latestSlot() : null;
      const items = [
        { id: "begin", label: "Begin the journey" },
        { id: "continue", label: "Continue", sub: !ok ? "Saving isn't available in this browser" : latest ? latest.summary.text : "No saved journey yet", disabled: !latest },
        { id: "code", label: "Enter a save code" },
        { id: "history", label: "The real history" }
      ];
      root.innerHTML = `
        <div class="screen title-screen">
          ${S.titleScene()}
          <div class="title-col">
            <p class="eyebrow">Chapter one · The desert road</p>
            <h1 class="game-title">DHARMA<br><span class="amp">&amp;</span> SILK</h1>
            <p class="subtitle">Buddhism along the Silk Road</p>
          </div>
          <nav class="title-menu panel-dark" aria-label="Main menu">
            ${items.map((it, i) => `
              <button class="menu-row" type="button" data-id="${it.id}" data-index="${i}"
                ${it.disabled ? 'aria-disabled="true"' : ""}>
                <span class="row-text">
                  <span class="row-label">${esc(it.label)}</span>
                  ${it.sub ? `<span class="row-sub">${esc(it.sub)}</span>` : ""}
                </span>
                <span class="keycap" aria-hidden="true">${i + 1}</span>
              </button>`).join("")}
          </nav>
          <p class="title-footer">400 CE · Kucha to Chang'an · A journey of many hands</p>
          <div class="title-buttons">
            <button class="btn-square" type="button" id="btn-sound" aria-pressed="${soundOn}"
              aria-label="Sound">${S.icon(soundOn ? "sound" : "soundOff", 26)}</button>
            <button class="btn-square" type="button" id="btn-settings" aria-label="Settings">${S.icon("gear", 26)}</button>
          </div>
        </div>`;

      const rows = $$(".menu-row", root);
      let active = 0;
      function setActive(i, focus) {
        active = (i + rows.length) % rows.length;
        rows.forEach((r, j) => {
          r.classList.toggle("is-active", j === active);
          $(".keycap", r).classList.toggle("is-selected", j === active);
        });
        if (focus) rows[active].focus();
      }
      rows.forEach((r, i) => {
        r.addEventListener("mouseenter", () => setActive(i));
        r.addEventListener("focus", () => setActive(i));
        r.addEventListener("click", () => activate(items[i].id));
      });
      setActive(0, true);

      screenKeys = (e) => {
        if (typing(e)) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1, true); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1, true); }
        else if (/^[1-4]$/.test(e.key)) { e.preventDefault(); setActive(+e.key - 1, true); activate(items[+e.key - 1].id); }
      };

      $("#btn-sound", root).addEventListener("click", (e) => {
        soundOn = !soundOn;
        const b = e.currentTarget;
        b.setAttribute("aria-pressed", String(soundOn));
        b.innerHTML = S.icon(soundOn ? "sound" : "soundOff", 26);
        toast(soundOn ? "Sound on. Music and sound effects come in a later build." : "Sound off.");
      });
      $("#btn-settings", root).addEventListener("click", settingsModal);
    });
  }

  function activate(id) {
    if (id === "begin") return setupScreen();
    if (id === "continue") return continueGame();
    if (id === "code") return saveCodeModal();
    if (id === "history") return historyModal();
  }

  function continueGame() {
    if (!window.STATE.storageOK()) return toast("This browser can't save. Use a save code instead.");
    const saves = window.STATE.listSlots().filter((s) => !s.empty);
    if (!saves.length) return toast("No saved journey yet. Choose Begin the journey.");
    if (saves.length === 1) return loadAndResume(saves[0].n);
    slotsModal("load");
  }
  function loadAndResume(n) {
    const state = window.STATE.loadSlot(n);
    if (!state) return toast("That save couldn't be read.");
    window.STATE.current = state;
    resume();
  }

  function historyModal() {
    openModal(`
      <p class="eyebrow eyebrow-paper">About 400 CE</p>
      <h2 id="modal-title">The real history</h2>
      <p>For hundreds of years, the Buddha's teaching traveled from India along the Silk Road.
        Merchants, monks, scribes and translators carried it from oasis to oasis. No single person did it.</p>
      <p><b>Kucha</b>, on the northern edge of the Taklamakan Desert, was a Buddhist kingdom known for its
        monasteries and painted caves. Its most famous monk, <b>Kumarajiva</b>, was taken east by a
        Chinese general's army in 384 and held in Liangzhou for many years.</p>
      <p>In 399 the Chinese monk <b>Faxian</b>, already in his sixties, set out from Chang'an for India to find the
        full rules for monks. In 400 he passed through <b>Dunhuang</b>, where its ruler, Li Gao, supplied his desert crossing.</p>
      <p>In 401 the army of the Later Qin brought Kumarajiva to <b>Chang'an</b>. Emperor Yao Xing gave him a
        translation hall, where many monks helped him put sutras into Chinese. In 402 they translated the
        <i>Amida Sutra</i>, which Shin Buddhist temples still chant today.</p>
      <p class="muted">In this game you are not a famous person. You are one of the many ordinary travelers
        whose journeys added up. Meetings the game invents are always marked
        <span class="chip chip-invented">Invented meeting · Real people</span></p>
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Close ›</button></div>`,
      { dialogClass: "modal-wide" });
  }

  function saveCodeModal() {
    openModal(`
      <h2 id="modal-title">Enter a save code</h2>
      <p>Paste the save code you copied from another computer, or one your teacher gave you.</p>
      <label class="visually-hidden" for="save-code">Save code</label>
      <textarea id="save-code" data-autofocus spellcheck="false" placeholder="DS1.…"></textarea>
      <p class="form-error" id="code-error" role="alert"></p>
      <div class="modal-actions">
        <button class="btn-outline-paper" type="button" data-close>Cancel</button>
        <button class="btn-primary-paper" type="button" id="code-load">Load journey ›</button>
      </div>`);
    $("#code-load").addEventListener("click", () => {
      try {
        const state = window.STATE.importCode($("#save-code").value);
        closeModal();
        window.STATE.current = state;
        const slot = window.STATE.freeSlot();
        if (slot && window.STATE.storageOK()) { window.STATE.saveToSlot(state, slot); }
        resume();
        if (!slot) toast("Loaded. All save slots are full, so save from the landmark menu to keep it here.");
        else toast(`Loaded ${state.player.name}'s journey into slot ${slot}.`);
      } catch (err) {
        $("#code-error").textContent = err.message;
      }
    });
  }

  function settingsModal() {
    const p = prefs();
    const opt = (name, val, label) => `<label class="radio-pill"><input type="radio" name="${name}" value="${val}" ${p[name] === val ? "checked" : ""}><span>${label}</span></label>`;
    openModal(`
      <h2 id="modal-title">Settings</h2>
      <fieldset class="setting"><legend>Text speed</legend>
        ${opt("textSpeed", "normal", "Normal")}${opt("textSpeed", "fast", "Fast")}${opt("textSpeed", "instant", "Instant")}</fieldset>
      <fieldset class="setting"><legend>Travel speed</legend>
        ${opt("travelSpeed", "slow", "Slow")}${opt("travelSpeed", "normal", "Normal")}${opt("travelSpeed", "fast", "Fast")}</fieldset>
      <p class="muted">Keys: 1–9 pick an option · Enter confirms · Esc closes a window · Space pauses travel · Tab moves between buttons.</p>
      <p class="muted">Music and sound effects come in a later build.</p>
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Done ›</button></div>`);
    $$(".setting input").forEach((r) => r.addEventListener("change", () => { p[r.name] = r.value; savePrefs(); }));
  }

  /* =================================================================
     PARTY SETUP (canvas 2)
     ================================================================= */
  // Kept between visits so BACK from the bazaar doesn't lose choices.
  const setup = { playerName: "", background: null, companions: [] }; // companions: [{ role, name }]

  function setupScreen() {
    const B = window.BALANCE;
    show((root) => {
      root.innerHTML = `
        <div class="screen setup-screen">
          <section class="setup-left" aria-labelledby="name-heading">
            <p class="eyebrow">Step 1 of 3 · Your caravan</p>
            <h1 id="name-heading">What is your name, traveler?</h1>
            <div class="name-field">
              <input id="player-name" type="text" maxlength="${B.nameMaxLength}" autocomplete="off" spellcheck="false"
                aria-labelledby="name-heading" placeholder="Your name" value="${esc(setup.playerName)}">
              <span class="block-cursor" aria-hidden="true"></span>
            </div>
            <h2 id="bg-heading">Who are you?</h2>
            <div class="bg-options" role="radiogroup" aria-labelledby="bg-heading">
              ${window.BACKGROUNDS.map((b) => `
                <label class="bg-option">
                  <input type="radio" name="background" value="${b.id}" ${setup.background === b.id ? "checked" : ""}>
                  <span class="radio" aria-hidden="true"></span>
                  <span class="bg-text">
                    <span class="bg-title">${esc(b.title)}</span>
                    <span class="bg-perk">${esc(b.perk)}</span>
                  </span>
                  <span class="silk-pips">
                    <span class="pip-label">Silk</span>
                    <span class="pips" aria-hidden="true">${[1, 2, 3].map((n) => `<span class="pip ${n <= b.silkLevel ? "on" : ""}"></span>`).join("")}</span>
                    <span class="visually-hidden">${["", "Low", "Medium", "High"][b.silkLevel]} starting silk</span>
                  </span>
                </label>`).join("")}
            </div>
            ${S.nightCampScene()}
          </section>

          <section class="setup-right" aria-labelledby="comp-heading">
            <div class="setup-head">
              <div>
                <h1 id="comp-heading">Choose four companions</h1>
                <p>Each brings a gift and a cost. No one crosses the desert alone.</p>
              </div>
              <div class="party-counter" id="party-counter" aria-live="polite"></div>
            </div>
            <div class="companion-grid" id="companion-grid"></div>
            <div class="gifts" id="gifts" aria-live="polite"></div>
            <div class="setup-footer">
              <button class="btn-outline-paper" type="button" id="btn-back">‹ Back</button>
              <div class="footer-right">
                <p class="form-message" id="form-message" role="status"></p>
                <button class="btn-primary-paper" type="button" id="btn-next">To the Kucha bazaar ›</button>
              </div>
            </div>
          </section>
        </div>`;

      const nameInput = $("#player-name", root);
      const syncLen = () => nameInput.parentElement.style.setProperty("--len", nameInput.value.length);
      nameInput.addEventListener("input", () => { setup.playerName = nameInput.value; syncLen(); clearMsg(); });
      syncLen();
      $$('input[name="background"]', root).forEach((r) =>
        r.addEventListener("change", () => { setup.background = r.value; clearMsg(); }));

      renderCompanions();
      $("#btn-back", root).addEventListener("click", titleScreen);
      $("#btn-next", root).addEventListener("click", tryContinue);
      nameInput.focus();

      screenKeys = (e) => {
        if (typing(e)) {
          if (e.key === "Enter" && e.target === nameInput) { e.preventDefault(); $('input[name="background"]:checked, input[name="background"]', root).focus(); }
        }
      };
    });
  }

  function clearMsg() { const m = $("#form-message"); if (m) m.textContent = ""; }
  function setMsg(t) { const m = $("#form-message"); if (m) m.textContent = t; }

  function renderCompanions() {
    const grid = $("#companion-grid");
    const chosen = (id) => setup.companions.find((c) => c.role === id);
    grid.innerHTML = window.ROLES.map((r) => {
      const c = chosen(r.id);
      if (c) {
        return `
          <article class="companion is-selected" data-role="${r.id}">
            <div class="companion-top">
              <span class="icon-tile">${S.icon(r.icon, 24)}</span>
              <button class="toggle" type="button" aria-pressed="true" aria-label="Remove ${esc(c.name || r.defaultName)} the ${esc(r.role)}">${S.icon("check", 20, null, 3)}</button>
            </div>
            <p class="role-eyebrow">${esc(r.role)}</p>
            <label class="visually-hidden" for="name-${r.id}">Name your ${esc(r.role)}</label>
            <input class="name-input" id="name-${r.id}" type="text" maxlength="${window.BALANCE.nameMaxLength}"
              value="${esc(c.name)}" placeholder="${esc(r.defaultName)}" autocomplete="off" spellcheck="false">
            <p class="perk perk-bonus">+ ${esc(r.bonus)}</p>
            <p class="perk perk-cost">− ${esc(r.cost)}</p>
          </article>`;
      }
      return `
        <article class="companion" data-role="${r.id}">
          <div class="companion-top">
            <span class="icon-tile">${S.icon(r.icon, 24)}</span>
            <button class="toggle" type="button" aria-pressed="false" aria-label="Add the ${esc(r.role)}">${S.icon("plus", 20, null, 3)}</button>
          </div>
          <p class="role-title">${esc(r.role)}</p>
          <p class="perk">+ ${esc(r.bonus)}</p>
          <p class="perk">− ${esc(r.cost)}</p>
        </article>`;
    }).join("");

    $$(".companion", grid).forEach((card) => {
      const id = card.dataset.role;
      $(".toggle", card).addEventListener("click", (e) => { e.stopPropagation(); toggleCompanion(id); });
      card.addEventListener("click", (e) => {
        if (!card.classList.contains("is-selected") && !e.target.closest("input")) toggleCompanion(id);
      });
      const input = $(".name-input", card);
      if (input) {
        input.addEventListener("input", () => {
          chosen(id).name = input.value;
          $(".toggle", card).setAttribute("aria-label", `Remove ${input.value || window.STATE.roleById(id).defaultName}`);
        });
        input.addEventListener("blur", () => {
          if (!input.value.trim()) { input.value = window.STATE.roleById(id).defaultName; chosen(id).name = input.value; }
        });
      }
    });

    const n = setup.companions.length, max = window.BALANCE.partySize;
    const counter = $("#party-counter");
    counter.textContent = `${n} of ${max}`.toUpperCase();
    counter.classList.toggle("is-full", n === max);
    renderGifts();
  }

  function toggleCompanion(id) {
    const i = setup.companions.findIndex((c) => c.role === id);
    const max = window.BALANCE.partySize;
    if (i >= 0) setup.companions.splice(i, 1);
    else if (setup.companions.length >= max) {
      setMsg("Your caravan is full. Remove someone first.");
      return;
    } else setup.companions.push({ role: id, name: window.STATE.roleById(id).defaultName });
    clearMsg();
    renderCompanions();
    const t = $(`.companion[data-role="${id}"] .toggle`);
    if (t) t.focus();
  }

  function renderGifts() {
    const el = $("#gifts");
    const roles = setup.companions.map((c) => window.STATE.roleById(c.role));
    if (!roles.length) {
      el.innerHTML = `<h2>Caravan gifts</h2><p class="empty">Choose companions to see what they bring.</p>`;
      return;
    }
    const gifts = roles.map((r) => `<span class="chip chip-bonus">+ ${esc(r.gift)}</span>`);
    const warnings = setup.companions.length === window.BALANCE.partySize
      ? window.PARTY_WARNINGS.filter((w) => !roles.some((r) => r.id === w.missing))
        .map((w) => `<span class="chip chip-warning">! ${esc(w.text)}</span>`)
      : [];
    el.innerHTML = `<h2>Caravan gifts</h2><div class="gift-chips">${gifts.join("")}${warnings.join("")}</div>`;
  }

  function tryContinue() {
    const max = window.BALANCE.partySize;
    const name = setup.playerName.trim();
    if (!name) { setMsg("Tell us your name first."); $("#player-name").focus(); return; }
    if (!setup.background) { setMsg("Choose who you are."); $('input[name="background"]').focus(); return; }
    if (setup.companions.length < max) {
      setMsg(`Choose ${max - setup.companions.length} more companion${max - setup.companions.length > 1 ? "s" : ""}.`);
      return;
    }
    setup.companions.forEach((c) => { if (!c.name.trim()) c.name = window.STATE.roleById(c.role).defaultName; c.name = c.name.trim(); });
    const state = window.STATE.newGame({
      playerName: name, background: setup.background,
      companions: setup.companions.map((c) => ({ role: c.role, name: c.name }))
    });
    // Keep the slot of a journey already started from this setup (BACK from the bazaar).
    if (st() && st().phase === "bazaar" && st().slot) state.slot = st().slot;
    window.STATE.current = state;
    chooseSlotThen(state, bazaarScreen);
  }

  // A new journey takes the first empty slot, or asks which one to replace.
  function chooseSlotThen(state, next) {
    if (!window.STATE.storageOK()) {
      openModal(`<h2 id="modal-title">Saving is off</h2>
        <p>This browser won't let the game save (this happens in private windows and on some school computers).</p>
        <p>You can still play. At any landmark, open <b>Save</b> and copy your save code to keep your journey.</p>
        <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Play anyway ›</button></div>`,
        { onClose: next });
      return;
    }
    if (state.slot) return next();
    const free = window.STATE.freeSlot();
    if (free) { state.slot = free; window.STATE.saveToSlot(state, free); return next(); }
    const slots = window.STATE.listSlots();
    openModal(`<h2 id="modal-title">All three save slots are full</h2>
      <p>Choose a journey to replace, or play without saving to a slot.</p>
      <div class="slot-list">${slots.map((s) => `
        <div class="slot-row"><span class="slot-n">${s.n}</span><span class="slot-sum">${esc(s.summary.text)} · Day ${s.summary.day}</span>
        <button class="btn-outline-paper btn-small" type="button" data-replace="${s.n}">Replace</button></div>`).join("")}</div>
      <div class="modal-actions"><button class="btn-outline-paper" type="button" id="no-slot">Play without a slot</button></div>`);
    $$("[data-replace]").forEach((b) => b.addEventListener("click", () => {
      state.slot = +b.dataset.replace; window.STATE.saveToSlot(state, state.slot); closeModal(); next();
    }));
    $("#no-slot").addEventListener("click", () => { closeModal(); next(); });
  }

  /* =================================================================
     BAZAAR (Kucha and every market town)
     ================================================================= */
  const BAZAAR_ITEMS = [
    { key: "food", icon: "food", name: "Food", unit: "5 days of food" },
    { key: "waterMax", icon: "drop", name: "Water skins", unit: "1 skin (filled free at wells)" },
    { key: "camels", icon: "camel", name: "Camels", unit: "1 camel" },
    { key: "clothing", icon: "clothing", name: "Warm clothing", unit: "1 set" },
    { key: "medicine", icon: "medicine", name: "Medicine", unit: "1 pouch" },
    { key: "paper", icon: "brush", name: "Paper & ink", unit: "1 bundle" }
  ];

  function bazaarHtml(state, lmId) {
    const s = state.supplies, B = window.BALANCE;
    const load = E.load(state), capy = E.capacity(state);
    const fd = Math.floor(s.food / E.foodPerDay(state));
    const have = { food: `${fd} days`, waterMax: `${s.waterMax}`, camels: s.camels, clothing: s.clothing, medicine: s.medicine, paper: s.paper };
    const rows = BAZAAR_ITEMS.map((it) => {
      const buy = E.price(state, it.key, lmId), sell = E.sellPrice(state, it.key, lmId);
      const step = B.priceStep[it.key];
      const addLoad = it.key === "food" ? step * B.load.food : it.key === "camels" ? 0 : (B.load[it.key === "waterMax" ? "water" : it.key] || 0) * step;
      const canBuy = s.silk >= buy && (it.key === "camels" || load + addLoad <= capy);
      const canSell = sell > 0 && s[it.key] >= step && !(it.key === "camels" && s.camels <= 0);
      return `<tr>
        <td class="bz-icon">${S.icon(it.icon, 24)}</td>
        <td><span class="bz-name">${esc(it.name)}</span><span class="bz-unit">${esc(it.unit)}</span></td>
        <td class="bz-have">${esc(have[it.key])}</td>
        <td>${sell > 0 ? `<button class="bz-btn" type="button" data-sell="${it.key}" ${canSell ? "" : "disabled"} aria-label="Sell ${esc(it.unit)} for ${sell} silk">Sell +${sell}</button>` : '<span class="muted">Nobody buys</span>'}</td>
        <td><button class="bz-btn bz-buy" type="button" data-buy="${it.key}" ${canBuy ? "" : "disabled"} aria-label="Buy ${esc(it.unit)} for ${buy} silk">Buy −${buy}</button></td>
      </tr>`;
    }).join("");
    const pct = Math.min(100, Math.round(load / Math.max(1, capy) * 100));
    return `
      <div class="bz-top">
        <div class="bz-silk">${S.icon("silk", 26)}<span class="bz-silk-num">${Math.floor(s.silk)}</span><span class="bz-silk-lbl">silk to spend</span></div>
        <div class="bz-load"><span class="bz-load-lbl">Camel load ${load} of ${capy}</span>
          <span class="bz-bar" aria-hidden="true"><span style="width:${pct}%" class="${load > capy ? "over" : ""}"></span></span></div>
      </div>
      <table class="bz-table"><thead><tr><th></th><th>Item</th><th>You have</th><th>Sell</th><th>Buy</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function bindBazaar(root, lmId, rerender) {
    const state = st(), B = window.BALANCE;
    $$("[data-buy]", root).forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.buy, p = E.price(state, k, lmId);
      if (state.supplies.silk < p) return;
      state.supplies.silk -= p;
      state.supplies[k] += B.priceStep[k];
      if (k === "waterMax") state.supplies.water += B.priceStep[k]; // skins come filled
      rerender(`[data-buy="${k}"]`);
    }));
    $$("[data-sell]", root).forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.sell;
      if (state.supplies[k] < B.priceStep[k]) return;
      state.supplies.silk += E.sellPrice(state, k, lmId);
      state.supplies[k] -= B.priceStep[k];
      if (k === "waterMax") state.supplies.water = Math.min(state.supplies.water, state.supplies.waterMax);
      rerender(`[data-sell="${k}"]`);
    }));
  }

  function advice(state) {
    const seg = E.segment(state);
    if (!seg) return "";
    const days = Math.ceil(seg.km / E.speed(state));
    const m = E.nextMarket(state);
    const mDays = m ? Math.ceil(m.km / E.speed(state)) + 5 : days + 5;
    const monk = E.hasRole(state, "monk") ? ` ${E.byRole(state, "monk").name} the monk won't bargain, so leave the haggling to others.` : "";
    const market = m && m.lm.id !== seg.to.id ? ` There's no market until ${m.lm.name}, ${m.km} km away, so` : " To be safe,";
    return `Next stop: ${seg.to.name}, ${seg.km} km (about ${days} days).${market} carry at least ${mDays} days of food.${monk}`;
  }

  // Step 2 of 3: the Kucha bazaar, full screen.
  function bazaarScreen() {
    const state = st();
    state.phase = "bazaar";
    show((root) => {
      root.innerHTML = `
        <div class="screen">
          ${S.buildScene(LM()[0].scene, { label: "Kucha" })}
          <div class="scrim scrim-static"></div>
          <section class="bazaar-panel panel-paper" aria-labelledby="bz-title">
            <p class="eyebrow eyebrow-paper">Step 2 of 3 · Kucha, spring 400 CE</p>
            <h1 id="bz-title">The Kucha bazaar</h1>
            <p class="lead">${esc(advice(state))}</p>
            <div id="bz-body"></div>
            <div class="bazaar-actions">
              <button class="btn-outline-paper" type="button" id="bz-back">‹ Back to your caravan</button>
              <button class="btn-primary-paper" type="button" id="bz-go">Say farewell and set out ›</button>
            </div>
          </section>
        </div>`;
      const body = $("#bz-body", root);
      const render = (focusSel) => {
        body.innerHTML = bazaarHtml(state, "kucha");
        bindBazaar(body, "kucha", render);
        if (focusSel) { const f = $(focusSel, body); if (f && !f.disabled) f.focus(); }
      };
      render();
      $("#bz-back", root).addEventListener("click", setupScreen);
      $("#bz-go", root).addEventListener("click", farewell);
      $("#bz-go", root).focus();
    });
  }

  // Market at a landmark (modal over the landmark screen).
  function marketModal(lmId, onDone) {
    const state = st();
    openModal(`<p class="eyebrow eyebrow-paper">${esc(LM().find((l) => l.id === lmId) ? LM().find((l) => l.id === lmId).name : "Traders")} market</p>
      <h2 id="modal-title">Buy and sell</h2>
      <p class="lead-sm">${esc(advice(state))}</p>
      <div id="bz-body"></div>
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Done ›</button></div>`,
      { dialogClass: "modal-bazaar", onClose: onDone });
    const body = $("#bz-body");
    const render = (focusSel) => {
      body.innerHTML = bazaarHtml(state, lmId);
      bindBazaar(body, lmId, render);
      if (focusSel) { const f = $(focusSel, body); if (f && !f.disabled) f.focus(); }
    };
    render();
  }

  /* =================================================================
     STEP 3 OF 3: FAREWELL, then the road
     ================================================================= */
  function farewell() {
    const state = st();
    state.phase = "farewell";
    window.DIALOGUE.open("farewell_kucha", {
      onEnd: () => {
        state.phase = "travel";
        state.log.push(`Day ${state.day}: set out from Kucha.`);
        window.STATE.autosave(state);
        travelScreen();
      }
    });
  }

  /* =================================================================
     TRAVEL SCREEN
     ================================================================= */
  let travel = null; // { timer, paused, sceneKey }

  function stopTravel() {
    if (travel && travel.timer) clearTimeout(travel.timer);
    travel = null;
  }
  function tickMs() {
    if (window.__dsFast) return 30;
    const t = prefs().travelSpeed;
    return t === "fast" ? 280 : t === "slow" ? 1000 : 600;
  }

  function travelScreen() {
    const state = st();
    state.phase = "travel";
    show((root) => {
      root.innerHTML = `<div class="screen travel-screen" id="travel-root">
        <div id="travel-scene"></div>
        <div id="travel-hud"></div>
      </div>`;
      travel = { timer: null, paused: false, sceneKey: "", busy: false };
      renderTravel();
      screenKeys = (e) => {
        if (typing(e)) return;
        if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); togglePause(); }
      };
      schedule();
    });
  }

  function travelPeople(state) {
    return E.traveling(state).map((p) => ({ color: p.isPlayer ? S.T("terracotta") : (window.STATE.roleById(p.role) || {}).color }));
  }

  function renderTravel() {
    const state = st();
    if (!travel) return;
    const seg = E.segment(state);
    const d = E.dateInfo(state);
    const key = [seg.terrain, state.night, d.season === "winter", E.traveling(state).length, Math.min(4, state.supplies.camels)].join("|");
    if (key !== travel.sceneKey) {
      travel.sceneKey = key;
      $("#travel-scene").innerHTML = S.travelScene({ terrain: seg.terrain, night: state.night, season: d.season, people: travelPeople(state), camels: state.supplies.camels });
    }
    $("#travel-root").classList.toggle("is-paused", travel.paused || travel.busy);
    const focusId = document.activeElement && document.activeElement.id;
    $("#travel-hud").innerHTML =
      placeCard(state, `To ${seg.to.name}`, `On the road from ${seg.from.name}`) +
      journeyTrack(state) + lampCard(state) + suppliesPanel(state) + travelControls(state) + partyPanel(state);
    bindHud($("#travel-hud"));
    bindTravelControls();
    if (focusId) { const f = document.getElementById(focusId); if (f) f.focus(); }
  }

  function seg3(name, label, options, value) {
    return `<div class="seg-group" role="radiogroup" aria-label="${label}"><span class="seg-label">${label}</span>
      ${options.map(([v, l]) => `<button type="button" role="radio" id="${name}-${v}" class="segbtn${value === v ? " on" : ""}" aria-checked="${value === v}" data-${name}="${v}">${l}</button>`).join("")}</div>`;
  }

  function travelControls(state) {
    const paused = travel && travel.paused;
    const night = E.nightTravelOffered(state) || state.night;
    return `<section class="hud hud-bc panel-dark travel-controls" aria-label="Travel controls">
      <p class="travel-status"><span>${paused ? "Stopped" : "Traveling east"} · ${E.speed(state)} km a day</span><span>${E.kmToNext(state)} km to ${esc(E.segment(state).to.name)}</span></p>
      ${seg3("pace", "Pace", [["steady", "Steady"], ["strenuous", "Strenuous"], ["grueling", "Grueling"]], state.pace)}
      ${seg3("rations", "Rations", [["filling", "Filling"], ["meager", "Meager"], ["bare", "Bare bones"]], state.rations)}
      <div class="travel-btns">
        <button class="btn-primary" type="button" id="btn-pause">${paused ? "Go on ›" : "Stop"}</button>
        <button class="btn-secondary" type="button" id="btn-rest">Rest</button>
        ${night ? `<button class="btn-secondary${state.night ? " on" : ""}" type="button" id="btn-night" aria-pressed="${state.night}">Travel at night: ${state.night ? "on" : "off"}</button>` : ""}
      </div>
    </section>`;
  }

  function bindHud(root) {
    $$("[data-action]", root).forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.action;
      if (a === "details") pauseWhile(detailsModal);
      if (a === "save") pauseWhile(() => slotsModal("save"));
      if (a === "menu") pauseWhile(gameMenu);
    }));
  }
  // Pause travel while a window is open, then carry on.
  function pauseWhile(open) {
    if (travel) { travel.busy = true; renderTravel(); }
    open();
    const top = modalStack[modalStack.length - 1];
    if (top) {
      const prev = top.onClose;
      top.onClose = () => { if (prev) prev(); if (travel) { travel.busy = false; renderTravel(); schedule(); } };
    } else if (travel) { travel.busy = false; }
  }

  function bindTravelControls() {
    const state = st();
    $$("[data-pace]").forEach((b) => b.addEventListener("click", () => { state.pace = b.dataset.pace; renderTravel(); }));
    $$("[data-rations]").forEach((b) => b.addEventListener("click", () => { state.rations = b.dataset.rations; renderTravel(); }));
    $("#btn-pause").addEventListener("click", togglePause);
    $("#btn-rest").addEventListener("click", roadRest);
    const n = $("#btn-night");
    if (n) n.addEventListener("click", () => { state.night = !state.night; renderTravel(); });
  }
  function togglePause() {
    if (!travel) return;
    travel.paused = !travel.paused;
    renderTravel();
    if (!travel.paused) schedule();
  }

  function schedule() {
    if (!travel) return;
    clearTimeout(travel.timer);
    if (travel.paused || travel.busy) return;
    travel.timer = setTimeout(travelTick, tickMs());
  }

  function travelTick() {
    const state = st();
    if (!travel || travel.paused || travel.busy) return;
    const out = E.travelDay(state);
    toastAll(out.toasts);
    renderTravel();
    const steps = [];
    out.notices.forEach((n) => {
      if (n.collapse) steps.push((next) => window.DIALOGUE.runEvent("collapse", () => { renderTravel(); next(); }));
      else steps.push((next) => window.DIALOGUE.notice(n, next));
    });
    if (out.story) steps.push((next) => window.DIALOGUE.runEvent(out.story, (r) => { afterEvent(r); next(); }));
    if (out.event) steps.push((next) => window.DIALOGUE.runEvent(out.event, (r) => afterEvent(r, next)));
    if (out.arrived) { stopTravel(); return chain(steps, arriveAtLandmark); }
    if (!steps.length) return schedule();
    travel.busy = true;
    renderTravel();
    chain(steps, () => {
      if (!travel) return;
      travel.busy = false;
      if (E.segment(state) && state.km >= E.segment(state).km) { stopTravel(); return arriveAtLandmark(); }
      renderTravel();
      schedule();
    });
  }

  // After an event: show its toasts and notices, open a market if asked.
  function afterEvent(r, next) {
    r = r || {};
    toastAll(r.toasts);
    const steps = (r.notices || []).map((n) => (nx) => window.DIALOGUE.notice(n, nx));
    if (r.openMarket) steps.push((nx) => marketModal("traders", nx));
    if (travel) renderTravel();
    chain(steps, next);
  }

  function roadRest() {
    const state = st();
    travel.busy = true;
    renderTravel();
    restCard({ onRoad: true }, () => {
      travel.busy = false;
      renderTravel();
      schedule();
    });
  }

  // Rest chooser (used on the road and at landmarks).
  function restCard(opts, onDone) {
    const state = st();
    const prep = {
      id: "rest", title: opts.onRoad ? "Make camp and rest" : `Rest at ${LM()[state.landmark].name}`,
      eyebrow: "Rest · " + `Day ${state.day}`,
      text: opts.onRoad
        ? "Resting helps the sick and tired recover and lifts spirits, but uses food and water, and the road doesn't get any shorter."
        : "Rest in town for a few days. Your water skins are refilled for free at the wells.",
      ev: { icon: "bowl" },
      choices: [1, 3, 5].map((n) => ({ label: `Rest ${n} day${n > 1 ? "s" : ""}`, chips: [{ text: `+${n} DAY${n > 1 ? "S" : ""}`, kind: "warning" }], n }))
        .concat([{ label: "Not now", chips: [], n: 0 }])
    };
    window.DIALOGUE.eventCard(prep, (i) => {
      const n = prep.choices[i].n;
      if (!n) return { text: "You decide to keep going." };
      const r = E.restDays(state, n, { onRoad: !!opts.onRoad });
      const people = E.traveling(state);
      const summary = people.map((p) => `${p.name}: ${E.HEALTH_LABEL[E.healthWord(p.hp)].toLowerCase()}`).join(", ");
      return { text: `You rest for ${n} day${n > 1 ? "s" : ""}. ${summary}.`, chips: [], notices: r.notices, toasts: r.toasts };
    }, (r) => afterEvent(r, onDone));
  }

  /* =================================================================
     LANDMARKS (canvas 3 is the template)
     ================================================================= */
  function arriveAtLandmark() {
    const state = st();
    const lm = E.arrive(state);
    state.phase = "landmark";
    landmarkScreen();
    const has = (r) => E.hasRole(state, r);
    const steps = [];
    if (lm.id === "karashahr") {
      steps.push((next) => window.DIALOGUE.runEvent("toll_agni", (r) => afterEvent(r, next)));
      if (has("guide")) steps.push((next) => window.DIALOGUE.runEvent("guide_home", (r) => afterEvent(r, next)));
    }
    if (lm.id === "dunhuang") steps.push((next) => { toast("A party of monks from Chang'an is camped by the caves. (Talk)"); next(); });
    if (lm.id === "jiuquan") steps.push((next) => window.DIALOGUE.runEvent("permit_jiuquan", (r) => afterEvent(r, next)));
    if (lm.id === "guzang" && !state.flags.guzangSurrendered) {
      steps.push((next) => window.DIALOGUE.runEvent("guzang_siege", (r) => afterEvent(r, next)));
      steps.push((next) => window.DIALOGUE.runEvent("follow_army", (r) => afterEvent(r, next)));
    }
    if (lm.id === "changan") return changanFinale();
    // Autosave once the arrival story is done, so reloading can't skip it.
    chain(steps, () => { window.STATE.autosave(state); landmarkScreen(true); });
  }

  // Chang'an: wait for Kumarajiva if you're early, deliver the sutras, then the end screen.
  function changanFinale() {
    const state = st();
    const steps = [];
    {
      const d = E.dateOf(state);
      if (d.year < 402) {
        steps.push((next) => {
          E.skipTo(state, 402, 40);
          window.DIALOGUE.notice({ eyebrow: `Chang'an · ${d.year} CE`, title: "Waiting for Kumarajiva",
            text: `You reach Chang'an in the ${E.seasonOf(d.doy)} of ${d.year} and find lodging near the palace. In the first weeks of 402, the army arrives with Kumarajiva. Emperor Yao Xing welcomes him with great honor and gives him a hall for translating sutras.` }, () => { landmarkScreen(true); next(); });
        });
      }
      steps.push((next) => window.DIALOGUE.open("kumarajiva_changan", { onEnd: () => next() }));
    }
    chain(steps, finishGame);
  }

  function landmarkScreen(keepFocus) {
    const state = st();
    const lm = LM()[state.landmark];
    state.phase = "landmark";
    const render = (root) => {
      const next = LM()[state.landmark + 1];
      const faxianBadge = lm.id === "dunhuang" && !state.flags.metFaxian;
      const actions = [
        { id: "visit", label: lm.visit, icon: lm.monastery ? "bowl" : "compass" },
        { id: "rest", label: "Rest", icon: "leaf" },
        { id: "market", label: "Market", icon: "scales", disabled: !lm.bazaar, note: "No market here" },
        { id: "talk", label: "Talk", icon: "speech", badge: faxianBadge, disabled: !lm.talk && lm.id !== "dunhuang" }
      ];
      root.innerHTML = `<div class="screen landmark-screen">
        ${S.buildScene(lm.scene, { label: lm.name })}
        ${placeCard(state, lm.name, `Landmark ${state.landmark + 1} of ${LM().length}${lm.alt ? " · " + lm.alt : ""}`)}
        ${journeyTrack(state)}
        ${lampCard(state)}
        ${suppliesPanel(state)}
        <section class="hud hud-bc panel-dark dock" aria-label="What will you do?">
          ${next ? `<button class="btn-primary dock-go" type="button" id="dock-go">Continue east to ${esc(next.name)} ›</button>`
            : `<button class="btn-primary dock-go" type="button" id="dock-deliver">Deliver your sutras ›</button>`}
          <div class="dock-actions">${actions.map((a, i) => `
            <button class="btn-secondary dock-btn" type="button" data-dock="${a.id}" ${a.disabled ? 'aria-disabled="true"' : ""}>
              ${S.icon(a.icon, 22)}<span>${esc(a.label)}</span>${a.badge ? '<span class="badge" aria-label="New story">!</span>' : ""}
              <span class="dock-key" aria-hidden="true">${i + 1}</span>
              ${a.disabled && a.note ? `<span class="visually-hidden">${esc(a.note)}</span>` : ""}
            </button>`).join("")}</div>
        </section>
        ${partyPanel(state)}
      </div>`;
      bindHud(root);
      const go = $("#dock-go", root) || $("#dock-deliver", root);
      if (go) go.addEventListener("click", next ? continueEast : changanFinale);
      $$("[data-dock]", root).forEach((b) => b.addEventListener("click", () => {
        if (b.getAttribute("aria-disabled") === "true") {
          return toast(b.dataset.dock === "market" ? `${lm.name} has no market. Stock up at the next market town.` : "Nobody here has time to talk.");
        }
        dockAction(b.dataset.dock);
      }));
      screenKeys = (e) => {
        if (typing(e)) return;
        if (/^[1-4]$/.test(e.key)) { e.preventDefault(); const b = $$("[data-dock]", root)[+e.key - 1]; if (b) b.click(); }
      };
      if (!keepFocus || !document.activeElement || document.activeElement === document.body) { if (go) go.focus(); }
    };
    if (screenEl().querySelector(".landmark-screen") && keepFocus) {
      const focused = document.activeElement && (document.activeElement.dataset.dock || document.activeElement.id);
      screenKeys = null;
      render(screenEl());
      const f = focused && ($(`[data-dock="${focused}"]`) || document.getElementById(focused));
      if (f) f.focus();
    } else show(render);
  }

  function dockAction(id) {
    const state = st();
    const lm = LM()[state.landmark];
    const refresh = () => landmarkScreen(true);
    if (id === "rest") return restCard({}, refresh);
    if (id === "market") return marketModal(lm.id, refresh);
    if (id === "talk") {
      if (lm.id === "dunhuang" && !state.flags.metFaxian) {
        return window.DIALOGUE.open("faxian_dunhuang", { onEnd: (r) => { state.flags.metFaxian = true; afterEvent(r, refresh); } });
      }
      const tid = lm.talk;
      state.flags.talked = state.flags.talked || {};
      const first = !state.flags.talked[tid];
      return window.DIALOGUE.open(tid, { applyEffects: first, onEnd: (r) => { state.flags.talked[tid] = true; afterEvent(r, refresh); } });
    }
    if (id === "visit") return visitCard(lm, refresh);
  }

  // Visit: stay at a monastery (rest, teach, copy sutras) or look around; always ends with history.
  function visitCard(lm, onDone) {
    const state = st();
    const v = state.flags.visited[lm.id] = state.flags.visited[lm.id] || {};
    const choices = [];
    const monks = E.traveling(state).filter((p) => E.isMonk(state, p)).length;
    const lodging = E.lodgingCost(state);
    const B = window.BALANCE;
    const alms = B.monasteryAlms + (state.player.background === "monk" ? B.youngMonkAlms : 0);
    if (lm.monastery) {
      const chips = [{ text: `+${window.BALANCE.monasteryStayDays} DAYS`, kind: "warning" }];
      if (lodging) chips.push({ text: `−${Math.min(lodging, Math.floor(state.supplies.silk))} SILK`, kind: "warning" });
      chips.push({ text: `+${alms} DAYS FOOD`, kind: "bonus" });
      if (!v.taught) chips.push({ text: `LAMP +${window.BALANCE.teachLamp}`, kind: "lamp" });
      choices.push({ label: `Stay at the monastery for ${window.BALANCE.monasteryStayDays} nights`, chips, kind: "stay" });
    }
    choices.push({ label: "Look around and learn about this place", chips: [], kind: "look" });
    choices.push({ label: "Not now", chips: [], kind: "no" });
    const prep = {
      id: "visit", title: lm.visitTitle, eyebrow: `${lm.name} · ${lm.visit}`, text: lm.visitText,
      ev: { icon: lm.monastery ? "bowl" : "compass", history: lm.visitHistory }, choices
    };
    window.DIALOGUE.eventCard(prep, (i) => {
      const c = choices[i];
      if (c.kind === "no") return { text: "Maybe later." };
      if (c.kind === "look") return { text: `You spend an hour exploring ${lm.name}.` };
      // Monastery stay
      const pay = Math.min(lodging, Math.floor(state.supplies.silk));
      state.supplies.silk -= pay;
      const r = E.restDays(state, window.BALANCE.monasteryStayDays, { monastery: true });
      const bits = [];
      if (pay < lodging) bits.push("You didn't have enough silk, so you swept courtyards to pay for your stay.");
      else if (lodging) bits.push(`Lodging cost ${pay} silk${monks ? "; monks stayed free" : ""}.`);
      else if (E.hasRole(state, "monk")) bits.push(`Because ${E.byRole(state, "monk").name} is a monk, the whole caravan stayed for free.`);
      else bits.push("As monks, you all stayed for free.");
      state.supplies.food += alms;
      bits.push(state.player.background === "monk" ? "The monks gave you, a young monk, extra alms food for the road." : "The monks shared alms food for the road.");
      const chips = [{ text: `+${window.BALANCE.monasteryStayDays} DAYS`, kind: "warning" }, { text: `+${alms} DAYS FOOD`, kind: "bonus" }];
      if (pay) chips.push({ text: `−${pay} SILK`, kind: "warning" });
      if (!v.taught) {
        v.taught = true;
        state.lamp = Math.min(100, state.lamp + window.BALANCE.teachLamp);
        bits.push("You taught the chants of Kucha to the novices.");
        chips.push({ text: `LAMP +${window.BALANCE.teachLamp}`, kind: "lamp" });
      }
      const scribe = E.byRole(state, "scribe");
      if (scribe && !v.copied && state.supplies.paper >= window.BALANCE.scribeCopyPaper) {
        v.copied = true;
        state.supplies.paper -= window.BALANCE.scribeCopyPaper;
        state.sutras.count += 1;
        bits.push(`${scribe.name} copied one of the monastery's sutras for you to carry.`);
        chips.push({ text: "+1 SUTRAS", kind: "bonus" });
      }
      return { text: `You rest with the monks and join the evening chanting. ${bits.join(" ")}`, chips, notices: r.notices, toasts: r.toasts };
    }, (r) => afterEvent(r, onDone));
  }

  function continueEast() {
    const state = st();
    const lm = LM()[state.landmark];
    if (lm.id === "dunhuang" && !state.flags.wintered && E.dateInfo(state).year === 400) {
      return window.DIALOGUE.runEvent("winter_dunhuang", (r) => afterEvent(r, () => {
        window.STATE.autosave(state);
        landmarkScreen();
        toast("It is spring of 401. The road east is open.");
      }));
    }
    const depart = () => {
      const v = state.flags.visited[lm.id] = state.flags.visited[lm.id] || {};
      const merchant = E.byRole(state, "merchant");
      if (lm.bazaar && merchant && !v.detour) {
        v.detour = true;
        E.advanceCalendar(state, window.BALANCE.merchantDetourDays);
        state.supplies.silk += window.BALANCE.merchantDetourSilk;
        toast(`${merchant.name} spends a day trading in the bazaar: +${window.BALANCE.merchantDetourSilk} silk, +${window.BALANCE.merchantDetourDays} day.`);
      }
      state.log.push(`Day ${state.day}: left ${lm.name}.`);
      travelScreen();
    };
    if (lm.id === "lanzhou" && !state.flags.crossedRiver) {
      return window.DIALOGUE.runEvent("yellow_river", (r) => afterEvent(r, depart));
    }
    depart();
  }

  /* =================================================================
     SAVE SLOTS (section 8)
     ================================================================= */
  function slotsModal(mode) {
    const state = st();
    const ok = window.STATE.storageOK();
    const slots = ok ? window.STATE.listSlots() : [];
    const rows = slots.map((s) => {
      const label = s.empty ? '<span class="muted">Empty</span>' : `${esc(s.summary.text)} · Day ${s.summary.day}`;
      const current = state && state.slot === s.n ? ' <span class="chip chip-bonus">This journey</span>' : "";
      const btns = mode === "save"
        ? `<button class="btn-outline-paper btn-small" type="button" data-save="${s.n}">Save here</button>`
        : s.empty ? "" : `<button class="btn-primary-paper btn-small" type="button" data-load="${s.n}">Load</button>
          <button class="btn-outline-paper btn-small" type="button" data-del="${s.n}" aria-label="Delete slot ${s.n}">Delete</button>`;
      return `<div class="slot-row"><span class="slot-n">${s.n}</span><span class="slot-sum">${label}${current}</span>${btns}</div>`;
    }).join("");
    const code = mode === "save" && state ? window.STATE.exportCode(state) : "";
    openModal(`
      <h2 id="modal-title">${mode === "save" ? "Save your journey" : "Continue a journey"}</h2>
      ${ok ? `<div class="slot-list">${rows}</div>` : `<p class="form-error">This browser won't let the game save here (private windows and some school computers block it). Copy your save code instead.</p>`}
      ${mode === "save" ? `
        <h3 class="sub-h">Save code</h3>
        <p class="muted">Copy this code to move your journey to another computer. Paste it under “Enter a save code” on the title screen.</p>
        <textarea id="code-out" readonly spellcheck="false" aria-label="Your save code">${esc(code)}</textarea>
        <div class="modal-actions"><button class="btn-outline-paper" type="button" id="copy-code">Copy code</button>
          <button class="btn-primary-paper" type="button" data-close data-autofocus>Done ›</button></div>`
        : `<div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Cancel</button></div>`}`,
      { dialogClass: "modal-wide" });
    $$("[data-save]").forEach((b) => b.addEventListener("click", () => {
      const n = +b.dataset.save;
      const s = slots.find((x) => x.n === n);
      const doSave = () => {
        if (window.STATE.saveToSlot(state, n)) { closeModal(); toast(`Saved to slot ${n}.`); }
        else toast("Couldn't save. Copy your save code instead.");
      };
      if (!s.empty && state.slot !== n) { closeModal(); confirmModal("Replace this save?", `Slot ${n} holds ${s.summary.text}. It will be replaced.`, "Replace", () => { window.STATE.saveToSlot(state, n); toast(`Saved to slot ${n}.`); }); }
      else doSave();
    }));
    $$("[data-load]").forEach((b) => b.addEventListener("click", () => { closeModal(); loadAndResume(+b.dataset.load); }));
    $$("[data-del]").forEach((b) => b.addEventListener("click", () => {
      const n = +b.dataset.del;
      closeModal();
      confirmModal("Delete this journey?", `Slot ${n} will be erased. This can't be undone.`, "Delete", () => { window.STATE.deleteSlot(n); titleScreen(); });
    }));
    const copy = $("#copy-code");
    if (copy) copy.addEventListener("click", () => {
      const ta = $("#code-out");
      ta.focus(); ta.select();
      const done = () => toast("Save code copied.");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, () => { document.execCommand("copy"); done(); });
      else { document.execCommand("copy"); done(); }
    });
  }

  /* =================================================================
     END SCREEN (section 7)
     ================================================================= */
  function finishGame() {
    const state = st();
    const d = E.dateOf(state);
    // Kumarajiva's translation hall opens early in 402.
    if (d.year < 402) E.skipTo(state, 402, 40);
    state.finished = true;
    state.phase = "end";
    window.STATE.autosave(state);
    endScreen();
  }

  function endScreen() {
    const state = st();
    const sc = E.score(state);
    const bg = window.BACKGROUNDS.find((b) => b.id === state.player.background);
    const comp = state.party.map((p) => {
      const r = window.STATE.roleById(p.role);
      const note = p.status === "traveling" ? "arrived in Chang'an" : p.statusNote || p.status;
      return `<li>${esc(p.name)}, the ${esc(r.role.toLowerCase())} <span class="scroll-note">(${esc(note)})</span></li>`;
    }).join("");
    const helpers = state.helpers.length ? state.helpers.map((h) => `<li>${esc(h)}</li>`).join("") : "<li>Every stranger who shared the road</li>";
    show((root) => {
      root.innerHTML = `<div class="screen end-screen">
        ${S.buildScene(LM()[LM().length - 1].scene, { label: "Chang'an" })}
        <div class="scrim scrim-static"></div>
        <section class="end-panel panel-paper" aria-labelledby="end-title">
          <div class="end-left">
            <p class="eyebrow eyebrow-paper">Chapter one complete · Chang'an, ${E.dateOf(state).year} CE</p>
            <h1 id="end-title">The sutras have arrived</h1>
            <p class="end-lead">After ${state.day} days on the road, ${esc(state.player.name)} the ${esc(bg.title.toLowerCase())} delivered ${state.sutras.count} sutras to Kumarajiva's translation hall.</p>
            <h2 class="sub-h">Lamp score</h2>
            <table class="score-table"><tbody>
              <tr><td>Sutras delivered × condition</td><td>${sc.sutras} × ${Math.round(sc.condition)}%</td><td class="pts">${sc.sutraPts}</td></tr>
              <tr><td>Companions who arrived</td><td>${sc.companions} of ${state.party.length}</td><td class="pts">${sc.companionPts}</td></tr>
              <tr><td>Acts of generosity</td><td>${sc.generosity}</td><td class="pts">${sc.generosityPts}</td></tr>
              <tr class="total"><td>Lamp score</td><td></td><td class="pts">${sc.total}</td></tr>
            </tbody></table>
            <div class="end-lamp">${S.lampFlame(3)}<span>The Lamp in China: ${Math.round(state.lamp)}</span></div>
            ${lampMeterHtml(state.lamp)}
            <div class="end-actions">
              <button class="btn-outline-paper" type="button" id="end-title-btn">Title screen</button>
              <button class="btn-primary-paper" type="button" id="end-again">Begin a new journey ›</button>
            </div>
          </div>
          <div class="end-right">
            <h2 class="scroll-h">Gratitude scroll</h2>
            <p class="scroll-intro">The teaching reached Chang'an through many hands. With thanks to:</p>
            <ol class="scroll-list">
              <li>The monks of your monastery in Kucha</li>
              <li>Your companions<ul>${comp}</ul></li>
              <li>The people who helped along the way<ul>${helpers}</ul></li>
              <li>Faxian's party, walking west</li>
              <li>Kumarajiva and the translators of Chang'an</li>
              <li class="scroll-you">…and now, ${esc(state.player.name)}.</li>
            </ol>
            <p class="namu">Namu Amida Butsu</p>
          </div>
        </section>
      </div>`;
      $("#end-title-btn", root).addEventListener("click", titleScreen);
      $("#end-again", root).addEventListener("click", () => { setup.playerName = ""; setup.background = null; setup.companions = []; window.STATE.current = null; setupScreen(); });
      $("#end-again", root).focus();
    });
  }

  /* ---------- Resume a loaded journey where it was left ---------- */
  function resume() {
    const state = st();
    if (!state) return titleScreen();
    if (state.finished || state.phase === "end") return endScreen();
    if (state.phase === "bazaar" || state.phase === "farewell") return bazaarScreen();
    if (state.phase === "travel" && state.km > 0) return travelScreen();
    if (state.landmark === 0 && state.phase !== "landmark") return travelScreen();
    return landmarkScreen();
  }

  /* =================================================================
     SCENE GALLERY (debug: review each landmark's pixel scene)
     ================================================================= */
  function galleryScreen(index, guides) {
    const L = LM();
    index = ((index || 0) + L.length) % L.length;
    const lm = L[index];
    show((root) => {
      root.innerHTML = `
        <div class="screen">
          ${S.buildScene(lm.scene, { label: lm.name })}
          ${guides ? `<div class="hud-guides" aria-hidden="true">
            <div style="left:24px;top:24px;width:340px;height:136px"></div>
            <div style="left:388px;top:24px;width:504px;height:96px"></div>
            <div style="right:24px;top:24px;width:340px;height:136px"></div>
            <div style="left:24px;bottom:24px;width:320px;height:188px"></div>
            <div style="left:368px;bottom:24px;width:544px;height:188px"></div>
            <div style="right:24px;bottom:24px;width:320px;height:188px"></div></div>` : ""}
          <div class="gallery-label panel-dark">
            <p class="eyebrow">Landmark ${index + 1} of ${L.length}</p>
            <p class="name px">${esc(lm.name)}${lm.alt ? ` <span style="color:var(--muted);font-size:14px">(${esc(lm.alt)})</span>` : ""}</p>
            <p class="blurb">${esc(lm.blurb)}</p>
          </div>
          <div class="gallery-nav">
            <button class="btn-primary" type="button" id="g-prev">‹ Prev</button>
            <button class="btn-primary" type="button" id="g-next">Next ›</button>
          </div>
        </div>`;
      $("#g-prev", root).addEventListener("click", () => galleryScreen(index - 1, guides));
      $("#g-next", root).addEventListener("click", () => galleryScreen(index + 1, guides));
      screenKeys = (e) => {
        if (e.key === "ArrowRight") galleryScreen(index + 1, guides);
        else if (e.key === "ArrowLeft") galleryScreen(index - 1, guides);
        else if (e.key === "Escape") titleScreen();
      };
    });
  }

  /* ---------- Debug panel (?debug=1): jump anywhere, add supplies, open any dialogue or event ---------- */
  function sampleGame() {
    const state = window.STATE.newGame({
      playerName: "Kai", background: "scribe",
      companions: ["monk", "guide", "healer", "cook"].map((r) => ({ role: r, name: window.STATE.roleById(r).defaultName }))
    });
    window.STATE.current = state;
    return state;
  }
  function debugPanel() {
    const p = document.createElement("div");
    p.id = "debug-panel";
    const opts = (obj) => Object.keys(obj).map((k) => `<option value="${k}">${esc(k)}</option>`).join("");
    p.innerHTML = `<h3>DEBUG <button type="button" id="dbg-hide" style="display:inline;width:auto;float:right;margin:0">–</button></h3>
      <div id="dbg-body">
      <button type="button" data-go="title">Title screen</button>
      <button type="button" data-go="bazaar">New sample game → bazaar</button>
      <select id="dbg-lm" aria-label="Landmark">${LM().map((l, i) => `<option value="${i}">${i + 1}. ${esc(l.name)}</option>`).join("")}</select>
      <button type="button" data-go="jump">Jump to landmark</button>
      <button type="button" data-go="road">Start road from there</button>
      <button type="button" data-go="supplies">+ Supplies & silk</button>
      <select id="dbg-dlg" aria-label="Dialogue">${opts(window.DIALOGUES)}</select>
      <button type="button" data-go="dialogue">Open dialogue</button>
      <select id="dbg-ev" aria-label="Event">${opts(window.EVENTS)}${opts(window.STORY_EVENTS)}</select>
      <button type="button" data-go="event">Trigger event</button>
      <button type="button" data-go="scene">Scene gallery</button>
      <button type="button" data-go="end">End screen</button>
      <label><input type="checkbox" id="dbg-guides"> HUD outlines (gallery)</label>
      <label><input type="checkbox" id="dbg-fast"> Fast travel</label>
      </div>`;
    document.body.appendChild(p);
    $("#dbg-hide").addEventListener("click", () => { const b = $("#dbg-body"); b.hidden = !b.hidden; });
    $("#dbg-fast").addEventListener("change", (e) => { window.__dsFast = e.target.checked; });
    p.addEventListener("click", (e) => {
      const go = e.target.dataset && e.target.dataset.go; if (!go) return;
      const need = () => st() || sampleGame();
      if (go === "title") titleScreen();
      if (go === "bazaar") { sampleGame(); bazaarScreen(); }
      if (go === "jump" || go === "road") {
        const state = need();
        const i = +$("#dbg-lm").value;
        state.landmark = i; state.km = 0; state.detourKm = 0;
        const flags = state.flags;
        if (i >= 5) { flags.wintered = true; flags.metFaxian = true; state.year = 401; state.dayOfYear = 60 + (i - 5) * 30; }
        if (i >= 8) { flags.guzangSurrendered = true; flags.followArmy = true; state.dayOfYear = 280 + (i - 8) * 20; }
        flags.visited[LM()[i].id] = flags.visited[LM()[i].id] || {};
        if (go === "jump") landmarkScreen(); else if (LM()[i + 1]) travelScreen();
      }
      if (go === "supplies") {
        const s = need().supplies;
        s.food += 30; s.waterMax += 4; s.water = s.waterMax; s.silk += 50; s.camels += 1; s.medicine += 2; s.clothing += 3; s.paper += 3;
        toast("Supplies added.");
        if (travel) renderTravel(); else if (st().phase === "landmark") landmarkScreen(true);
      }
      if (go === "dialogue") { need(); window.DIALOGUE.open($("#dbg-dlg").value, { onEnd: () => {} }); }
      if (go === "event") { need(); window.DIALOGUE.runEvent($("#dbg-ev").value, (r) => afterEvent(r)); }
      if (go === "scene") galleryScreen(+$("#dbg-lm").value, $("#dbg-guides").checked);
      if (go === "end") { need(); endScreen(); }
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    fitStage();
    const params = new URLSearchParams(location.search);
    if (params.get("debug") === "1") debugPanel();
    const scene = params.get("scene");
    if (scene) {
      const i = LM().findIndex((l) => l.id === scene);
      return galleryScreen(i >= 0 ? i : 0, params.get("guides") === "1");
    }
    if (params.get("screen") === "setup") return setupScreen();
    titleScreen();
  }

  window.UI = {
    titleScreen, setupScreen, bazaarScreen, travelScreen, landmarkScreen, endScreen, galleryScreen, resume,
    toast, openModal, closeModal, esc, prefs, chipHtml, lampMeterHtml
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
