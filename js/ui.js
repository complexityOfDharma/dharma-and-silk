/* Screens: title, party setup, bazaar placeholder, scene gallery.
   DESIGN.md section 9.5. Each screen renders into #screen and may set a key handler. */
(function () {
  "use strict";

  const S = window.SPRITES;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const screenEl = () => $("#screen");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

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
    return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  }
  document.addEventListener("keydown", (e) => {
    if (modalStack.length) {
      const m = modalStack[modalStack.length - 1];
      if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
      if (e.key === "Tab") trapFocus(e, m.el);
      return;
    }
    if (screenKeys) screenKeys(e);
  });

  /* ---------- Toast (9.4) ---------- */
  let toastTimer = null;
  function toast(text, lampGain) {
    const root = $("#toast-root");
    root.innerHTML = `<div class="toast"><span>${esc(text)}</span>${lampGain ? `<span class="lamp-gain">LAMP +${lampGain}</span>` : ""}</div>`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { root.innerHTML = ""; }, 3200);
  }

  /* ---------- Modal (paper panel, Esc closes) ---------- */
  function openModal(html, opts) {
    opts = opts || {};
    const returnFocus = document.activeElement;
    const scrim = document.createElement("div");
    scrim.className = "scrim";
    scrim.innerHTML = `<div class="modal panel-paper" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal-close" type="button" aria-label="Close">X</button>${html}</div>`;
    $("#modal-root").appendChild(scrim);
    const m = { el: scrim, returnFocus, onClose: opts.onClose };
    modalStack.push(m);
    $(".modal-close", scrim).addEventListener("click", closeModal);
    scrim.addEventListener("mousedown", (e) => { if (e.target === scrim) closeModal(); });
    $$("[data-close]", scrim).forEach((b) => b.addEventListener("click", closeModal));
    const first = $(opts.focus || "[data-autofocus]", scrim) || $(".modal-close", scrim);
    first.focus();
    return scrim;
  }
  function closeModal() {
    const m = modalStack.pop(); if (!m) return;
    m.el.remove();
    if (m.onClose) m.onClose();
    if (m.returnFocus && document.contains(m.returnFocus)) m.returnFocus.focus();
  }
  function trapFocus(e, root) {
    const f = $$("button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])", root)
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function show(render) {
    screenKeys = null;
    $("#toast-root").innerHTML = "";
    while (modalStack.length) closeModal();
    render(screenEl());
  }

  /* =================================================================
     TITLE (canvas 1)
     ================================================================= */
  let soundOn = false;

  function titleScreen() {
    show((root) => {
      const save = null; // phase 4: latest save summary, e.g. "Kai · Dunhuang, autumn 400 CE"
      const items = [
        { id: "begin", label: "Begin the journey" },
        { id: "continue", label: "Continue", sub: save || "No saved journey yet", disabled: !save },
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
    if (id === "continue") return toast("No saved journey yet. Saving arrives in the next build.");
    if (id === "code") return saveCodeModal();
    if (id === "history") return historyModal();
  }

  function historyModal() {
    openModal(`
      <p class="eyebrow" style="color:var(--terracotta)">About 400 CE</p>
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
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Close ›</button></div>`);
  }

  function saveCodeModal() {
    openModal(`
      <h2 id="modal-title">Enter a save code</h2>
      <p>Paste the save code you copied from another computer, or one your teacher gave you.</p>
      <label class="visually-hidden" for="save-code">Save code</label>
      <textarea id="save-code" data-autofocus spellcheck="false" placeholder="Paste your save code here"></textarea>
      <p class="muted">Save codes arrive with the save system in the next build.</p>
      <div class="modal-actions">
        <button class="btn-outline-paper" type="button" data-close>Cancel</button>
        <button class="btn-primary-paper" type="button" disabled style="opacity:.5">Load journey ›</button>
      </div>`);
  }

  function settingsModal() {
    openModal(`
      <h2 id="modal-title">Settings</h2>
      <p>Text speed and sound settings come in a later build.</p>
      <p class="muted">Keys: 1–9 pick an option · Enter confirms · Esc closes a window · Tab moves between buttons.</p>
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Close ›</button></div>`);
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
          return;
        }
      };
    });
  }

  function clearMsg() { const m = $("#form-message"); if (m) m.textContent = ""; }

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

  function setMsg(t) { const m = $("#form-message"); if (m) m.textContent = t; }

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
    window.STATE.current = window.STATE.newGame({
      playerName: name, background: setup.background,
      companions: setup.companions.map((c) => ({ role: c.role, name: c.name }))
    });
    bazaarPlaceholder();
  }

  /* =================================================================
     KUCHA BAZAAR placeholder (the real bazaar is phase 5)
     ================================================================= */
  function partyRowHtml(p) {
    const r = window.STATE.roleById(p.role);
    return `<li class="party-row">
      <span class="avatar" style="background:${r.color}">${esc((p.name || "?").charAt(0).toUpperCase())}</span>
      <span class="who">${esc(p.name)} <span class="role">· ${esc(r.role)}</span></span>
      <span class="health health-good">GOOD</span></li>`;
  }

  function bazaarPlaceholder() {
    const st = window.STATE.current;
    const kucha = window.LANDMARKS[0];
    const bg = window.BACKGROUNDS.find((b) => b.id === st.player.background);
    const sup = st.supplies;
    const supplies = [
      ["food", sup.food, "days of food"], ["drop", sup.water, "water skins"],
      ["camel", sup.camels, "camels"], ["clothing", sup.clothing, "warm clothes"],
      ["medicine", sup.medicine, "medicine"], ["brush", sup.paper, "paper & ink"],
      ["scroll", st.sutras.count, "sutras"], ["silk", sup.silk, "silk"]
    ];
    show((root) => {
      root.innerHTML = `
        <div class="screen">
          ${S.buildScene(kucha.scene, { label: "Kucha" })}
          <div class="scrim" style="z-index:1"></div>
          <section class="bazaar-card panel-paper" style="z-index:2" aria-labelledby="bz-title">
            <p class="eyebrow">Step 2 of 3 · Kucha, spring 400 CE</p>
            <h1 id="bz-title">The Kucha bazaar</h1>
            <p class="lead">The monks of your monastery have entrusted you with their sutras. Your caravan gathers at the bazaar.</p>
            <div class="bazaar-cols">
              <div>
                <h2>Your caravan</h2>
                <ul class="party-list">
                  <li class="party-row">
                    <span class="avatar" style="background:var(--terracotta)">${esc(st.player.name.charAt(0).toUpperCase())}</span>
                    <span class="who">${esc(st.player.name)} <span class="role">· ${esc(bg.title)}</span></span>
                    <span class="health health-good">GOOD</span></li>
                  ${st.party.map(partyRowHtml).join("")}
                </ul>
              </div>
              <div>
                <h2>Supplies</h2>
                <div class="supply-grid">
                  ${supplies.map(([ic, v, l]) => `<div class="supply">${S.icon(ic, 24)}<span class="val">${v}</span><span class="lbl">${l}</span></div>`).join("")}
                </div>
              </div>
            </div>
            <p class="bazaar-note">The bazaar opens in the next build. You'll buy food, water, camels and warm clothing here before setting out east.</p>
            <div class="bazaar-actions">
              <button class="btn-outline-paper" type="button" id="bz-back">‹ Back to your caravan</button>
              <button class="btn-primary-paper" type="button" id="bz-title-btn">Title screen ›</button>
            </div>
          </section>
        </div>`;
      $("#bz-back", root).addEventListener("click", setupScreen);
      $("#bz-title-btn", root).addEventListener("click", titleScreen);
      $("#bz-title-btn", root).focus();
    });
  }

  /* =================================================================
     SCENE GALLERY (debug: review each landmark's pixel scene)
     ================================================================= */
  function galleryScreen(index, guides) {
    const L = window.LANDMARKS;
    index = ((index || 0) + L.length) % L.length;
    const lm = L[index];
    show((root) => {
      root.innerHTML = `
        <div class="screen">
          ${S.buildScene(lm.scene, { label: lm.name })}
          ${guides ? `<div class="hud-guides" aria-hidden="true">
            <div style="left:24px;top:24px;width:340px;height:120px"></div>
            <div style="left:400px;top:24px;width:480px;height:96px"></div>
            <div style="right:24px;top:24px;width:300px;height:120px"></div>
            <div style="left:24px;bottom:24px;width:320px;height:180px"></div>
            <div style="left:376px;bottom:24px;width:528px;height:180px"></div>
            <div style="right:24px;bottom:24px;width:320px;height:180px"></div></div>` : ""}
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

  /* ---------- Debug panel (?debug=1). Phase 11 adds events, dialogues, supplies. ---------- */
  function debugPanel() {
    const p = document.createElement("div");
    p.id = "debug-panel";
    p.innerHTML = `<h3>DEBUG</h3>
      <button type="button" data-go="title">Title screen</button>
      <button type="button" data-go="setup">Party setup</button>
      <button type="button" data-go="bazaar">Bazaar (sample party)</button>
      <select id="dbg-scene" aria-label="Landmark scene">
        ${window.LANDMARKS.map((l, i) => `<option value="${i}">${i + 1}. ${esc(l.name)}</option>`).join("")}
      </select>
      <button type="button" data-go="scene">Show scene</button>
      <label><input type="checkbox" id="dbg-guides"> HUD outlines</label>`;
    document.body.appendChild(p);
    p.addEventListener("click", (e) => {
      const go = e.target.dataset && e.target.dataset.go; if (!go) return;
      if (go === "title") titleScreen();
      if (go === "setup") setupScreen();
      if (go === "bazaar") {
        Object.assign(setup, {
          playerName: "Kai", background: "scribe",
          companions: ["monk", "guide", "healer", "cook"].map((r) => ({ role: r, name: window.STATE.roleById(r).defaultName }))
        });
        tryContinue();
      }
      if (go === "scene") galleryScreen(+$("#dbg-scene").value, $("#dbg-guides").checked);
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    fitStage();
    const params = new URLSearchParams(location.search);
    if (params.get("debug") === "1") debugPanel();
    const scene = params.get("scene");
    if (scene) {
      const i = window.LANDMARKS.findIndex((l) => l.id === scene);
      return galleryScreen(i >= 0 ? i : 0, params.get("guides") === "1");
    }
    if (params.get("screen") === "setup") return setupScreen();
    titleScreen();
  }

  window.UI = { titleScreen, setupScreen, galleryScreen, toast, openModal, closeModal, esc };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
