/* Dialogue modal (portrait, typewriter, numbered choices, role gating), event cards,
   "What really happened" cards and notices. DESIGN.md section 9.5 (canvas 4). */
(function () {
  "use strict";

  const S = () => window.SPRITES;
  const E = () => window.ENGINE;
  const esc = (s) => window.UI.esc(s);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // Typewriter speed from settings: chars per 16ms tick (0 = instant).
  function typeSpeed() {
    const p = window.UI.prefs().textSpeed;
    return p === "instant" ? 0 : p === "fast" ? 4 : 2;
  }

  // Types text into el. Returns a controller; finish() completes it at once.
  function typewriter(el, text, done) {
    const per = typeSpeed();
    let i = 0, timer = null, finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      el.textContent = text;
      if (done) done();
    }
    if (!per) { finish(); return { finish, isDone: () => true }; }
    el.textContent = "";
    timer = setInterval(() => {
      i += per;
      el.textContent = text.slice(0, i);
      if (i >= text.length) finish();
    }, 16);
    return { finish, isDone: () => finished };
  }

  function chipHtml(c) { return `<span class="chip chip-${c.kind}">${esc(c.text)}</span>`; }

  function choiceRow(c, i, focused) {
    const role = c.requires || c.role;
    const r = role && role !== "player" ? window.STATE.roleById(role) : null;
    return `<button class="choice${focused ? " is-focused" : ""}" type="button" data-i="${i}" ${c.disabled ? 'aria-disabled="true"' : ""}>
      <span class="keycap" aria-hidden="true">${i + 1}</span>
      ${r ? `<span class="role-tag">${esc(r.role.toUpperCase())}</span>` : ""}
      <span class="choice-text">${esc(c.label)}${c.disabled ? ' <span class="choice-why">(not enough)</span>' : ""}</span>
      <span class="choice-chips">${(c.chips || []).map(chipHtml).join("")}</span>
    </button>`;
  }

  // Wire up numbered choices: click, number keys, arrow keys.
  function bindChoices(container, choices, onPick) {
    const rows = $$(".choice", container);
    rows.forEach((row) => {
      row.addEventListener("click", () => {
        const i = +row.dataset.i;
        if (choices[i] && choices[i].disabled) return;
        onPick(i);
      });
      row.addEventListener("focus", () => { rows.forEach((r) => r.classList.remove("is-focused")); row.classList.add("is-focused"); });
    });
    const first = rows.find((r) => r.getAttribute("aria-disabled") !== "true");
    if (first) first.focus();
    return function onKey(e) {
      if (/^[1-9]$/.test(e.key)) {
        const i = +e.key - 1;
        if (choices[i] && !choices[i].disabled) { e.preventDefault(); onPick(i); }
        return true;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx = rows.indexOf(document.activeElement);
        const next = rows[(idx + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length];
        if (next) next.focus();
        return true;
      }
      return false;
    };
  }

  /* ---------- "What really happened" card ---------- */
  function historyCard(title, text, opts) {
    opts = opts || {};
    window.UI.openModal(`
      <p class="eyebrow eyebrow-paper">What really happened</p>
      <h2 id="modal-title">${esc(title)}</h2>
      <p>${esc(text)}</p>
      ${opts.extra || ""}
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Continue ›</button></div>`,
      { onClose: opts.onClose });
  }

  /* ---------- Notice (losses, arrivals) ---------- */
  function notice(n, onDone) {
    window.UI.openModal(`
      <p class="eyebrow eyebrow-paper">${esc(n.eyebrow || dateEyebrow())}</p>
      <h2 id="modal-title">${esc(n.title)}</h2>
      <p>${esc(n.text)}</p>
      ${n.chips ? `<div class="result-chips">${n.chips.map(chipHtml).join("")}</div>` : ""}
      <div class="modal-actions"><button class="btn-primary-paper" type="button" data-close data-autofocus>Continue ›</button></div>`,
      { onClose: onDone });
  }
  function dateEyebrow() {
    const st = window.STATE.current;
    if (!st) return "";
    const d = E().dateInfo(st);
    return `Day ${st.day} · ${d.label}`;
  }

  /* ---------- Event card: paper modal without a portrait ---------- */
  // prep: from ENGINE.prepareEvent, or built by the UI. resolve(i) → { text, chips, notices, toasts, ... }
  function eventCard(prep, resolve, onDone) {
    const ev = prep.ev || {};
    let resolved = null;
    const modal = window.UI.openModal(`
      <div class="event-head">
        <span class="icon-tile">${S().icon(ev.icon || "scroll", 26)}</span>
        <div>
          <p class="eyebrow eyebrow-paper">${esc(prep.eyebrow || (ev.random === false || window.STORY_EVENTS[prep.id] ? "Story · " : "On the road · ") + dateEyebrow())}</p>
          <h2 id="modal-title">${esc(prep.title)}</h2>
        </div>
      </div>
      ${ev.invented ? '<span class="chip chip-invented">Invented meeting · Real people</span>' : ""}
      <p class="event-text">${esc(prep.text)}</p>
      <div class="event-body">
        <div class="dlg-choices" role="group" aria-label="Choices">${prep.choices.map((c, i) => choiceRow(c, i, i === 0)).join("")}</div>
      </div>`,
      { closeButton: false, escCloses: false, dialogClass: "event-card", onKey: (e) => keyHandler && keyHandler(e) });
    let keyHandler = bindChoices(modal, prep.choices, pickChoice);

    function pickChoice(i) {
      if (resolved) return;
      resolved = resolve(i);
      const c = prep.choices[i];
      const history = ev.history || prep.history;
      $(".event-body", modal).innerHTML = `
        <div class="event-chosen"><span class="keycap is-selected" aria-hidden="true">${i + 1}</span> ${esc(c.label)}</div>
        <div class="event-result" role="status">
          <p>${esc(resolved.text || "")}</p>
          ${resolved.chips && resolved.chips.length ? `<div class="result-chips">${resolved.chips.map(chipHtml).join("")}</div>` : ""}
        </div>
        ${history ? `<div class="history-box"><p class="history-label">What really happened</p><p>${esc(history)}</p></div>` : ""}
        <div class="modal-actions"><button class="btn-primary-paper" type="button" id="event-continue">Continue ›</button></div>`;
      const btn = $("#event-continue", modal);
      btn.focus();
      btn.addEventListener("click", finish);
      keyHandler = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); } };
    }
    function finish() {
      window.UI.closeModal();
      if (onDone) onDone(resolved || {});
    }
  }

  // A standard event from data/events.js.
  function runEvent(id, onDone) {
    const st = window.STATE.current;
    const prep = E().prepareEvent(st, id);
    if (!prep) { if (onDone) onDone({}); return; }
    eventCard(prep, (i) => E().resolveChoice(st, prep, i), onDone);
  }

  /* ---------- Dialogue scene (canvas 4) ---------- */
  function openDialogue(id, opts) {
    opts = opts || {};
    const st = window.STATE.current;
    let node = window.DIALOGUES[id];
    if (!node) { if (opts.onEnd) opts.onEnd({}); return; }
    const applyEffects = opts.applyEffects !== false;
    let result = {};
    let lineIdx = 0, typing = null, stage = "lines", keyHandler = null;

    const modal = window.UI.openModal(`<div class="dialogue panel-paper" role="dialog" aria-modal="true" aria-labelledby="dlg-speaker">
        <div class="dlg-left">
          <div class="dlg-portrait"></div>
          <p class="dlg-label">Real history</p>
          <p class="dlg-note"></p>
          <button class="btn-outline-paper btn-small" type="button" id="dlg-history">What really happened ›</button>
        </div>
        <div class="dlg-right">
          <div class="dlg-head">
            <h2 id="dlg-speaker" class="dlg-speaker"></h2>
            <span class="dlg-native" lang="zh"></span>
          </div>
          <div class="dlg-chip"></div>
          <p class="dlg-sub"></p>
          <div class="dlg-box" tabindex="-1" aria-live="polite"><p class="dlg-text"></p><span class="dlg-more" aria-hidden="true">▾</span></div>
          <div class="dlg-choices" role="group" aria-label="Choices"></div>
        </div>
      </div>`,
      { bare: true, escCloses: false, scrimClass: "dialogue-scrim", onKey: (e) => onKey(e) });

    const box = $(".dlg-box", modal), textEl = $(".dlg-text", modal), more = $(".dlg-more", modal);
    const choicesEl = $(".dlg-choices", modal);
    $("#dlg-history", modal).addEventListener("click", () => historyCard(node.historyTitle || node.speaker, node.historyFull || node.history));
    box.addEventListener("click", advance);

    function renderNode(n) {
      node = n;
      $(".dlg-portrait", modal).innerHTML = S().portrait(n.portrait, 288);
      $(".dlg-note", modal).textContent = n.history || "";
      $("#dlg-speaker", modal).textContent = n.speaker;
      $(".dlg-native", modal).textContent = n.native || "";
      $(".dlg-chip", modal).innerHTML = n.invented ? '<span class="chip chip-invented">Invented meeting · Real people</span>' : "";
      $(".dlg-sub", modal).textContent = n.subtitle || "";
      lineIdx = 0; stage = "lines";
      choicesEl.innerHTML = "";
      showLine();
    }
    function lines() { return (node.lines || []).map((l) => E().fill(st, l)); }
    function showLine() {
      const ls = lines();
      if (lineIdx >= ls.length) return showChoices();
      more.hidden = true;
      choicesEl.innerHTML = `<p class="dlg-hint">Press any key or tap to continue</p>`;
      typing = typewriter(textEl, ls[lineIdx], () => { more.hidden = false; });
      box.focus();
    }
    function advance() {
      if (stage === "lines") {
        if (typing && !typing.isDone()) return typing.finish();
        lineIdx += 1;
        showLine();
      } else if (stage === "reply") {
        if (typing && !typing.isDone()) return typing.finish();
      }
    }
    function currentChoices() {
      const src = node.back ? window.DIALOGUES[node.back] : node;
      return (src.choices || [])
        .filter((c) => !c.requires || E().hasRole(st, c.requires))
        .map((c) => {
          const needs = E().needsFor(c.effects);
          return Object.assign({}, c, {
            label: E().fill(st, c.text),
            chips: applyEffects ? E().chips(c.effects) : [],
            disabled: applyEffects && !E().canAfford(st, needs)
          });
        });
    }
    function showChoices() {
      stage = "choices";
      more.hidden = true;
      const cs = currentChoices();
      choicesEl.innerHTML = cs.map((c, i) => choiceRow(c, i, i === 0)).join("");
      keyHandler = bindChoices(choicesEl, cs, (i) => pick(cs[i]));
    }
    function pick(c) {
      if (c.next) { keyHandler = null; return renderNode(window.DIALOGUES[c.next]); }
      if (c.effects && applyEffects) {
        const r = E().applyEffects(st, c.effects);
        result.notices = (result.notices || []).concat(r.notices);
      }
      if (c.endGame) result.endGame = true;
      result.choice = c;
      if (c.reply) {
        stage = "reply";
        choicesEl.innerHTML = choiceRow({ label: "Continue", chips: [] }, 0, true);
        keyHandler = bindChoices(choicesEl, [{}], close);
        more.hidden = true;
        typing = typewriter(textEl, E().fill(st, c.reply));
      } else close();
    }
    function close() {
      window.UI.closeModal();
      if (opts.onEnd) opts.onEnd(result);
    }
    function onKey(e) {
      if (keyHandler && keyHandler(e)) return;
      if (stage === "reply" && (e.key === "Enter" || e.key === " ")) {
        if (typing && !typing.isDone()) { e.preventDefault(); return typing.finish(); }
        e.preventDefault(); return close();
      }
      if (stage === "lines" && !["Tab", "Shift", "Escape"].includes(e.key)) { e.preventDefault(); advance(); }
    }
    renderNode(node);
  }

  window.DIALOGUE = { open: openDialogue, eventCard, runEvent, historyCard, notice, chipHtml, typewriter };
})();
