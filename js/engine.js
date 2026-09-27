/* Travel loop, resources, health, events and scoring: DESIGN.md sections 3–7.
   Pure game logic: no DOM. The UI calls these and shows what they return. */
(function () {
  "use strict";

  const B = () => window.BALANCE;
  const L = () => window.LANDMARKS;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = () => Math.random();
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  /* ---------- Calendar ---------- */
  function dateOf(state) {
    let year = state.year, doy = state.dayOfYear;
    while (doy > 365) { doy -= 365; year += 1; }
    return { year, doy };
  }
  function seasonOf(doy) {
    const s = B().seasonStarts;
    if (doy >= s.winter || doy < s.spring) return "winter";
    if (doy >= s.autumn) return "autumn";
    if (doy >= s.summer) return "summer";
    return "spring";
  }
  function dateInfo(state) {
    const { year, doy } = dateOf(state);
    const season = seasonOf(doy);
    const Season = season.charAt(0).toUpperCase() + season.slice(1);
    return { year, doy, season, label: `${Season} · ${year} CE`, short: `${season} ${year} CE`, day: state.day };
  }
  function advanceCalendar(state, days) {
    state.day += days;
    state.dayOfYear += days;
    while (state.dayOfYear > 365) { state.dayOfYear -= 365; state.year += 1; }
  }
  // Jump the calendar forward to a date (winter at Dunhuang, the siege of Guzang).
  function skipTo(state, year, doy) {
    const now = dateOf(state);
    const days = (year - now.year) * 365 + (doy - now.doy);
    if (days > 0) advanceCalendar(state, days);
    return Math.max(0, days);
  }
  function weather(state) {
    const { season } = dateInfo(state);
    const seg = segment(state);
    const t = seg ? seg.terrain : "desert";
    const table = {
      spring: ["Windy and bright", "Cool and clear", "Warm days, cold nights"],
      summer: t === "desert" || t === "hardDesert" ? ["Blazing hot", "Hot and dry", "Scorching"] : ["Hot and dusty", "Warm", "Thunder in the hills"],
      autumn: ["Cool and clear", "Crisp and bright", "Windy"],
      winter: ["Bitter cold", "Freezing", "Snow flurries"]
    };
    const opts = table[season];
    return opts[(state.day + state.landmark) % opts.length];
  }

  /* ---------- People ---------- */
  function playerPerson(state) {
    return Object.assign(state.player, { isPlayer: true, role: "player" });
  }
  function traveling(state) {
    return [playerPerson(state)].concat(state.party.filter((p) => p.status === "traveling"));
  }
  function hasRole(state, role) {
    return state.party.some((p) => p.role === role && p.status === "traveling");
  }
  function byRole(state, role) {
    return state.party.find((p) => p.role === role && p.status === "traveling");
  }
  function isMonk(state, p) {
    return p.isPlayer ? state.player.background === "monk" : p.role === "monk";
  }
  function healthWord(hp) {
    for (const [min, w] of B().healthWords) if (hp >= min) return w;
    return "verypoor";
  }
  const HEALTH_LABEL = { good: "Good", fair: "Fair", poor: "Poor", verypoor: "Very poor" };

  // Fill {role} and {player} placeholders with the names the player chose.
  function fill(state, text, target) {
    if (!text) return "";
    return text.replace(/\{(\w+)\}/g, (m, key) => {
      if (key === "player") return state.player.name;
      if (key === "name") return target ? target.name : state.player.name;
      const p = state.party.find((q) => q.role === key);
      if (p) return p.name;
      const r = window.STATE.roleById(key);
      return r ? "your " + r.role.toLowerCase() : m;
    });
  }

  /* ---------- Route ---------- */
  function segment(state) {
    const to = L()[state.landmark + 1];
    if (!to) return null;
    return { from: L()[state.landmark], to, km: to.kmFromPrev + (state.detourKm || 0), terrain: to.terrain };
  }
  // The next landmark with a market, and how far the road is to get there.
  function nextMarket(state) {
    let km = 0;
    for (let i = state.landmark + 1; i < L().length; i++) {
      km += L()[i].kmFromPrev + (i === state.landmark + 1 ? (state.detourKm || 0) - state.km : 0);
      if (L()[i].bazaar) return { lm: L()[i], km: Math.round(km) };
    }
    return null;
  }
  function kmToNext(state) {
    const s = segment(state);
    return s ? Math.max(0, Math.round(s.km - state.km)) : 0;
  }

  /* ---------- Loads and capacity ---------- */
  function capacity(state) {
    const b = B();
    let cap = state.supplies.camels * (b.camelCapacity + (hasRole(state, "cameldriver") ? b.camelDriverCapacity : 0));
    cap += traveling(state).length * b.personCarry;
    return cap;
  }
  function load(state) {
    const b = B(), s = state.supplies;
    let l = s.food * b.load.food + s.waterMax * b.load.water + s.clothing * b.load.clothing +
      s.medicine * b.load.medicine + s.paper * b.load.paper + state.sutras.count * b.load.sutras;
    if (hasRole(state, "cook")) l += b.cookPotsLoad;
    return Math.round(l * 10) / 10;
  }

  /* ---------- Speed and daily use ---------- */
  function speed(state) {
    const b = B();
    let v = b.pace[state.pace];
    if (state.night) v *= b.nightTravelSpeed;
    if (hasRole(state, "scribe")) v *= b.scribeSpeed;
    if (load(state) > capacity(state)) v *= b.overloadSpeed;
    if (state.supplies.camels <= 0) v *= b.noCamelSpeed;
    return Math.max(4, Math.round(v * 10) / 10);
  }
  function foodPerDay(state) {
    const b = B();
    let f = b.foodPerDay[state.rations] * traveling(state).length / 5;
    if (hasRole(state, "cameldriver")) f *= b.camelDriverFodder;
    return f;
  }
  function waterPerDay(state) {
    const b = B();
    const { season } = dateInfo(state);
    const seg = segment(state);
    const desert = seg && (seg.terrain === "desert" || seg.terrain === "hardDesert");
    let w = b.waterPerDay * traveling(state).length / 5;
    if (season === "summer" && desert) w *= b.summerDesertWater;
    if (season === "winter") w *= b.winterWater;
    if (state.night) w *= b.nightTravelWater;
    return w;
  }
  function nightTravelOffered(state) {
    const seg = segment(state);
    return dateInfo(state).season === "summer" && seg && (seg.terrain === "desert" || seg.terrain === "hardDesert");
  }

  /* ---------- Health for one day ---------- */
  // mode: "travel" | "rest" | "monastery"
  function dailyHealth(state, mode, starving, thirsty, out) {
    const b = B(), h = b.healthDaily;
    const people = traveling(state);
    const { season } = dateInfo(state);
    let clothes = state.supplies.clothing;
    people.forEach((p) => {
      let d = h.base + h[state.rations === "bare" ? "bare" : state.rations];
      if (mode === "travel") d += h[state.pace];
      else d += h.rest;
      if (starving) d += h.noFood;
      if (thirsty) d += h.noWater;
      if (season === "winter" && mode === "travel") {
        if (clothes > 0) clothes -= 1; else d += h.coldNoClothing;
      }
      if (state.morale < b.lowMorale) d += h.lowMorale;
      if (p.illness) {
        d += b.illness[p.illness].daily;
        p.illDays -= 1;
        if (p.illDays <= 0) {
          out.toasts.push(`${p.name} has recovered from ${b.illness[p.illness].label}.`);
          p.illness = null;
        }
      }
      p.hp = clamp(p.hp + d, 0, 100);
    });

    // Companions in very poor health may leave to rest, or die.
    state.party.filter((p) => p.status === "traveling").forEach((p) => {
      if (p.hp <= 0) {
        p.status = "died";
        p.statusNote = p.illness ? `died of ${b.illness[p.illness].label}` : "died on the road";
        out.notices.push({ title: `${p.name} has died`, text: `${p.name} the ${roleName(p.role)} ${p.statusNote}. The caravan stops to chant for them, then carries on with heavy hearts.`, kind: "loss" });
        state.morale = clamp(state.morale - 15, 0, 100);
      } else if (p.hp < 20 && rand() < b.veryPoorLeaveChance) {
        p.status = "left";
        p.statusNote = "stayed behind to rest at a monastery";
        out.notices.push({ title: `${p.name} stays behind`, text: `${p.name} the ${roleName(p.role)} is too weak to go on and stays behind to rest at a monastery. You promise to remember them in your chanting.`, kind: "loss" });
        state.morale = clamp(state.morale - 8, 0, 100);
      }
    });

    // The player never dies: they collapse, and the caravan rests until they recover.
    const pl = state.player;
    if (pl.hp <= 5 && !state.collapsing) {
      out.notices.push({ title: "You collapse", text: `${pl.name} is too weak to walk. Your companions make camp and care for you until you can stand again.`, kind: "loss", collapse: true });
    }
  }
  function roleName(id) { const r = window.STATE.roleById(id); return r ? r.role.toLowerCase() : id; }

  function dailyMorale(state, mode, starving, thirsty) {
    const b = B(), m = b.moraleDaily;
    let d = 0;
    if (mode === "travel") {
      if (state.pace === "grueling") d += m.grueling;
      if (state.rations === "bare") d += m.bare;
    } else d += mode === "monastery" ? m.monastery : m.rest;
    if (starving) d += m.noFood;
    if (thirsty) d += m.noWater;
    changeMorale(state, d);
  }
  function changeMorale(state, d) {
    if (d < 0 && hasRole(state, "monk")) d *= B().monkMoraleFactor;
    state.morale = clamp(Math.round((state.morale + d) * 10) / 10, 0, 100);
  }

  function eat(state, factor) {
    const need = foodPerDay(state) * (factor == null ? 1 : factor);
    if (state.supplies.food >= need) { state.supplies.food = round1(state.supplies.food - need); return false; }
    state.supplies.food = 0;
    return true;
  }
  const round1 = (v) => Math.round(v * 10) / 10;

  /* ---------- One travel day ---------- */
  function travelDay(state) {
    const b = B();
    const out = { notices: [], toasts: [], event: null, story: null, arrived: false };
    const seg = segment(state);
    if (!seg) { out.arrived = true; return out; }

    // Food
    const starving = eat(state);
    state.noFoodDays = starving ? (state.noFoodDays || 0) + 1 : 0;

    // Water: use, then maybe find a well
    const wUse = waterPerDay(state);
    let thirsty = false;
    if (state.supplies.water >= wUse) state.supplies.water = round1(state.supplies.water - wUse);
    else { state.supplies.water = 0; thirsty = true; }
    let well = b.wellChance[seg.terrain] || 0.3;
    if (hasRole(state, "guide")) well += b.guideWellBonus;
    if (rand() < well && state.supplies.water < state.supplies.waterMax) {
      const before = state.supplies.water;
      state.supplies.water = Math.min(state.supplies.waterMax, round1(state.supplies.water + b.wellRefill));
      if (before < state.supplies.waterMax * 0.5 || thirsty) {
        const g = byRole(state, "guide");
        out.toasts.push(g ? `${g.name} found a well. You fill your water skins.` : "You found a well and filled your water skins.");
      }
    }

    // Distance
    state.km = round1(state.km + speed(state));

    dailyHealth(state, "travel", starving, thirsty, out);
    dailyMorale(state, "travel", starving, thirsty);

    // Camels can collapse when overloaded or when there is no water.
    if ((load(state) > capacity(state) || thirsty) && state.supplies.camels > 0) {
      const chance = b.camelDieChance * state.supplies.camels * (thirsty ? 6 : 1) * (hasRole(state, "cameldriver") ? 0.5 : 1);
      if (rand() < chance) {
        state.supplies.camels -= 1;
        out.notices.push({ title: "A camel collapses", text: thirsty ? "Without water, one of your camels lies down and will not get up again." : "One of your camels, carrying too heavy a load, collapses on the trail.", kind: "loss" });
      }
    }

    advanceCalendar(state, 1);

    // Other caravans carry the teaching too.
    if (rand() < b.caravanToastChance) {
      const t = pick(window.CARAVAN_TOASTS);
      state.lamp = clamp(state.lamp + 1, 0, 100);
      out.toasts.push({ text: t, lamp: 1 });
    }

    // Kindness of strangers when food runs out.
    // (At most once between two landmarks, so running out of food still matters.)
    if (state.noFoodDays >= b.kindnessAfterNoFoodDays && !out.notices.length && state.flags.kindnessAt !== state.landmark) {
      out.event = "kindness";
      state.flags.kindnessAt = state.landmark;
      state.noFoodDays = 0;
    }

    // Mid-segment story: the Hexi Corridor armies (Zhangye → Guzang).
    if (seg.to.id === "guzang" && !state.flags.hexi && state.km >= 100) {
      state.flags.hexi = true;
      out.story = "hexi_corridor";
    }

    if (state.km >= seg.km) {
      out.arrived = true;
    } else if (!out.event && !out.story && !out.notices.length && rand() < b.eventChancePerDay * (state.flags.followArmy ? 0.5 : 1)) {
      out.event = pickEvent(state);
    }
    return out;
  }

  // Arrive at the next landmark.
  function arrive(state) {
    state.landmark += 1;
    state.km = 0;
    state.detourKm = 0;
    state.night = false;
    state.supplies.water = state.supplies.waterMax; // wells at every oasis town
    const lm = L()[state.landmark];
    state.flags.visited = state.flags.visited || {};
    state.flags.visited[lm.id] = state.flags.visited[lm.id] || {};
    state.log.push(`Day ${state.day}: reached ${lm.name}.`);
    return lm;
  }

  /* ---------- Resting ---------- */
  function restDays(state, n, opts) {
    opts = opts || {};
    const out = { notices: [], toasts: [] };
    const mode = opts.monastery ? "monastery" : "rest";
    for (let i = 0; i < n; i++) {
      // A young monk eats free at monasteries.
      let factor = 1;
      if (opts.monastery && state.player.background === "monk") factor = 1 - 1 / traveling(state).length;
      const starving = eat(state, factor);
      const atTown = !opts.onRoad;
      let thirsty = false;
      if (atTown) state.supplies.water = state.supplies.waterMax;
      else {
        const w = waterPerDay(state) * 0.7;
        if (state.supplies.water >= w) state.supplies.water = round1(state.supplies.water - w); else { state.supplies.water = 0; thirsty = true; }
      }
      dailyHealth(state, mode, starving, thirsty, out);
      dailyMorale(state, mode, starving, thirsty);
      advanceCalendar(state, 1);
    }
    // The scribe mends damaged scrolls while the caravan rests.
    const scribe = byRole(state, "scribe");
    if (scribe && state.sutras.condition < 100 && state.supplies.paper >= 1) {
      const before = state.sutras.condition;
      state.sutras.condition = Math.min(100, state.sutras.condition + B().scribeRepairPerDay * n);
      state.supplies.paper -= 1;
      out.toasts.push(`${scribe.name} mended the scrolls: condition ${before}% → ${state.sutras.condition}%.`);
    }
    return out;
  }

  // Everyone rests up (time skips: winter at Dunhuang, the siege of Guzang).
  function longRest(state) {
    traveling(state).forEach((p) => { p.hp = Math.max(p.hp, 85); p.illness = null; p.illDays = 0; });
    changeMorale(state, 10);
    state.sutras.condition = hasRole(state, "scribe") ? 100 : state.sutras.condition;
  }

  /* ---------- Effects ---------- */
  const SUPPLY_KEYS = ["food", "water", "waterMax", "camels", "clothing", "medicine", "paper", "silk"];
  const EFFECT_LABEL = {
    food: "days food", water: "water", waterMax: "skins", camels: "camels", clothing: "clothes",
    medicine: "medicine", paper: "paper", silk: "silk", sutras: "sutras", sutraCondition: "scrolls",
    morale: "morale", lamp: "lamp", days: "days", health: "health", km: "km"
  };

  // Describe effects as chips: [{ text, kind }]. Status is never color-only: signed numbers.
  function chips(effects) {
    const out = [];
    if (!effects) return out;
    Object.keys(effects).forEach((k) => {
      const v = effects[k];
      if (typeof v !== "number" || !EFFECT_LABEL[k] || v === 0) return;
      const sign = v > 0 ? "+" : "−";
      const abs = Math.abs(v);
      if (k === "lamp") return out.push({ text: `LAMP ${sign}${abs}`, kind: "lamp" });
      if (k === "days") return out.push({ text: `+${abs} DAY${abs > 1 ? "S" : ""}`, kind: "warning" });
      if (k === "sutraCondition") return out.push({ text: `${sign}${abs}% SCROLLS`, kind: v > 0 ? "bonus" : "warning" });
      if (k === "km") return out.push({ text: `${sign}${abs} KM`, kind: v > 0 ? "bonus" : "warning" });
      const kind = k === "water" || k === "waterMax" ? "water" : v > 0 ? "bonus" : "warning";
      out.push({ text: `${sign}${abs} ${EFFECT_LABEL[k].toUpperCase()}`, kind });
    });
    return out;
  }

  function canAfford(state, needs) {
    if (!needs) return true;
    return Object.keys(needs).every((k) => {
      if (SUPPLY_KEYS.includes(k)) return state.supplies[k] >= needs[k];
      if (k === "sutras") return state.sutras.count >= needs[k];
      return true;
    });
  }
  // A choice that costs supplies needs at least that much to be picked.
  function needsFor(effects) {
    const n = {};
    if (!effects) return n;
    Object.keys(effects).forEach((k) => {
      if ((SUPPLY_KEYS.includes(k) || k === "sutras") && effects[k] < 0) n[k] = -effects[k];
    });
    return n;
  }

  function applyEffects(state, effects, target) {
    const out = { notices: [], toasts: [] };
    if (!effects) return out;
    const s = state.supplies;
    Object.keys(effects).forEach((k) => {
      const v = effects[k];
      if (SUPPLY_KEYS.includes(k)) {
        s[k] = Math.max(0, round1(s[k] + v));
        if (k === "waterMax" && s.water > s.waterMax) s.water = s.waterMax;
        if (k === "water") s.water = Math.min(s.water, s.waterMax);
      }
      else if (k === "sutras") state.sutras.count = Math.max(0, state.sutras.count + v);
      else if (k === "sutraCondition") state.sutras.condition = clamp(state.sutras.condition + v, 0, 100);
      else if (k === "morale") changeMorale(state, v);
      else if (k === "lamp") state.lamp = clamp(state.lamp + v, 0, 100);
      else if (k === "generosity") state.generosity += v;
      else if (k === "health") traveling(state).forEach((p) => { p.hp = clamp(p.hp + v, 1, 100); });
      else if (k === "km") state.km = Math.max(0, state.km + v);
      else if (k === "detourKm") state.detourKm = (state.detourKm || 0) + v;
      else if (k === "night") state.night = !!v;
      else if (k === "flag") state.flags[v] = true;
      else if (k === "helper") { if (!state.helpers.includes(v)) state.helpers.push(v); }
      else if (k === "illness") {
        const t = target || pick(traveling(state).filter((p) => !p.illness));
        if (t) { t.illness = v; t.illDays = B().illness[v].days; }
      }
      else if (k === "illDays") { if (target) target.illDays = v; }
      else if (k === "cure") { if (target) { target.illness = null; target.illDays = 0; } }
      else if (k === "leave") {
        const p = byRole(state, v);
        if (p) { p.status = "left"; p.statusNote = effects.leaveNote || "went home"; }
      }
    });
    if (effects.days) {
      const r = restDays(state, effects.days, { onRoad: state.km > 0 });
      out.notices.push(...r.notices); out.toasts.push(...r.toasts);
    }
    return out;
  }

  /* ---------- Random events ---------- */
  function eligible(state, ev) {
    if (ev.random === false) return false;
    const seg = segment(state);
    const { season } = dateInfo(state);
    if (ev.seasons && !ev.seasons.includes(season)) return false;
    if (ev.terrain && seg && !ev.terrain.includes(seg.terrain)) return false;
    if (ev.id === "struggling_caravan" && state.supplies.water < 2) return false;
    if (ev.id === "heat" && state.night) return false;
    if (state.recentEvents && state.recentEvents.includes(ev.id)) return false;
    return true;
  }
  function pickEvent(state) {
    const pool = Object.values(window.EVENTS).filter((e) => eligible(state, e));
    if (!pool.length) return null;
    const total = pool.reduce((t, e) => t + (e.weight || 1), 0);
    let r = rand() * total;
    for (const e of pool) { r -= e.weight || 1; if (r <= 0) { remember(state, e.id); return e.id; } }
    remember(state, pool[0].id);
    return pool[0].id;
  }
  function remember(state, id) {
    state.recentEvents = (state.recentEvents || []).concat(id).slice(-4);
  }

  // Work out how an event plays out for this caravan: a helper role may solve it,
  // and choices are filtered by role and by what you can afford.
  function prepareEvent(state, id) {
    const ev = window.EVENTS[id] || window.STORY_EVENTS[id];
    if (!ev) return null;
    const prep = { id, ev, title: ev.title, text: ev.text, choices: [], helper: null, target: null };

    // Target person (illness events)
    if (ev.target) {
      prep.target = pick(traveling(state).filter((p) => !p.illness)) || state.player;
    }
    prep.choices = (ev.choices || []).filter((c) => !c.requires || hasRole(state, c.requires))
      .filter((c) => !c.when || c.when(state))
      .map((c) => Object.assign({}, c, { disabled: !canAfford(state, Object.assign(needsFor(c.effects), c.needs || {})) }));

    const special = SPECIALS[ev.special];
    if (special && special.prepare) special.prepare(state, prep);

    if (!prep.helper && ev.helpers) {
      const h = ev.helpers.find((x) => hasRole(state, x.role));
      if (h) prep.helper = h;
    }
    if (prep.helper) {
      prep.choices = [{ text: prep.helper.choice || "Continue", effects: prep.helper.effects, result: prep.helper.text, role: prep.helper.role }];
    }
    // Never leave a player stuck: if nothing is affordable, the last choice stays open.
    if (prep.choices.length && prep.choices.every((c) => c.disabled)) prep.choices[prep.choices.length - 1].disabled = false;
    prep.text = fill(state, typeof prep.text === "function" ? prep.text(state) : prep.text, prep.target);
    prep.title = fill(state, ev.title, prep.target);
    prep.choices.forEach((c) => {
      c.label = fill(state, typeof c.text === "function" ? c.text(state) : c.text, prep.target);
      c.chips = chips(c.effects);
    });
    return prep;
  }

  function resolveChoice(state, prep, index) {
    const c = prep.choices[index];
    let effects = c.effects, result = c.result;
    if (c.outcomes) {
      let r = rand();
      const o = c.outcomes.find((x) => (r -= x.p) <= 0) || c.outcomes[c.outcomes.length - 1];
      effects = o.effects; result = o.result;
    }
    const applied = applyEffects(state, effects, prep.target);
    if (c.after) c.after(state, prep);
    const special = SPECIALS[prep.ev.special];
    if (special && special.after) special.after(state, prep, c);
    return {
      text: fill(state, typeof result === "function" ? result(state) : result, prep.target),
      chips: chips(effects),
      notices: applied.notices, toasts: applied.toasts,
      openMarket: !!c.openMarket, endGame: !!c.endGame
    };
  }

  // Event logic that plain data can't express.
  const SPECIALS = {
    coldNight: {
      prepare(state, prep) {
        const n = traveling(state).length, have = state.supplies.clothing;
        if (have >= n) {
          prep.choices = [{ text: "Wrap up and sleep", effects: { morale: 1 }, result: "Everyone wraps up in warm clothing and sleeps soundly under the stars." }];
        } else {
          const cold = n - have;
          prep.text += ` You have warm clothing for ${have} of the ${n} travelers.`;
          prep.choices = [
            { text: "Share blankets and huddle by the fire", effects: { health: -4, morale: -2 }, result: `The ${cold} without warm clothes shiver all night. Everyone feels it in the morning.` },
            { text: "Burn extra fuel to keep the fire high", effects: { food: -2, health: -1 }, result: "You trade some dried dung-cakes and food with a herder for fuel. The night passes." }
          ];
        }
      }
    },
    illness: {
      prepare(state, prep) {
        const t = prep.target, b = B();
        const healer = byRole(state, "healer");
        const ill = prep.ev.illness || "dysentery";
        t.illness = ill; t.illDays = b.illness[ill].days;
        const self = healer === t;
        if (healer && state.supplies.medicine > 0) {
          prep.helper = { role: "healer", effects: { medicine: -1, illDays: b.illnessDaysWithMedicine },
            text: self ? `${healer.name} knows exactly what to take and brews their own medicine. They should recover soon.`
              : `${healer.name} brews medicine from the healer's pouch. ${t.name} is weak but will recover soon.` };
        } else if (healer) {
          prep.helper = { role: "healer", effects: { illDays: b.illnessDaysHealerNoMedicine },
            text: self ? `${healer.name} has no medicine left but chews desert herbs and rests on a camel. They should recover in a few days.`
              : `${healer.name} has no medicine left but knows which desert herbs help. ${t.name} should recover in a few days.` };
        }
      }
    },
    foodSpoils: {
      prepare(state, prep) {
        const lost = Math.max(3, Math.round(state.supplies.food * 0.15));
        if (!hasRole(state, "cook")) prep.choices = [{ text: "Throw out the spoiled food", effects: { food: -Math.min(lost, Math.floor(state.supplies.food)) }, result: "You bury the spoiled food away from the trail and repack the rest more carefully." }];
      }
    },
    lodging: {
      prepare(state, prep) {
        const cost = lodgingCost(state);
        prep.choices.forEach((c) => {
          if (c.lodging) {
            const alms = state.player.background === "monk" ? B().youngMonkAlms : 0;
            c.effects = Object.assign({}, c.effects, { silk: -Math.min(cost, Math.floor(state.supplies.silk)) });
            if (alms) c.effects.food = (c.effects.food || 0) + alms;
            c.disabled = false;
          }
        });
        const monk = byRole(state, "monk");
        if (monk) prep.text += ` Because ${monk.name} is a monk, the whole caravan stays for free.`;
        else if (state.player.background === "monk") prep.text += " As a monk, you stay for free.";
      }
    }
  };

  Object.assign(SPECIALS, {
    winter: {
      prepare(state, prep) {
        const nonMonks = traveling(state).filter((p) => !isMonk(state, p)).length;
        const cost = nonMonks * B().winterLodgingPerPerson;
        prep.winterCost = cost;
        const pay = Math.min(cost, state.supplies.silk);
        prep.choices[0].effects = Object.assign({}, prep.choices[0].effects, { silk: -pay });
        prep.choices[0].disabled = false;
        prep.text += cost ? ` Lodging for the winter costs ${cost} silk.` : " Everyone in your caravan is a monk, so you all stay for free.";
        if (pay < cost) prep.text += " You don't have enough, so you'll work to pay for the rest.";
      },
      after(state) {
        skipTo(state, 401, 60);
        longRest(state);
        state.flags.wintered = true;
      }
    },
    siege: {
      after(state) {
        const d = dateOf(state);
        if (d.year < 401 || (d.year === 401 && d.doy < 275)) skipTo(state, 401, 275);
        longRest(state);
        state.flags.guzangSurrendered = true;
      }
    },
    river: {
      after(state, prep, c) {
        if (state.flags.waitIce) {
          state.flags.waitIce = false;
          const d = dateOf(state);
          skipTo(state, d.doy >= 326 ? d.year + 1 : d.year, 326);
          // Waiting costs food at the camp.
          state.supplies.food = Math.max(0, round1(state.supplies.food - 6));
        }
        state.flags.crossedRiver = true;
      }
    },
    collapse: {
      after(state) {
        const n = B().playerCollapseRestDays;
        restDays(state, n);
        state.player.hp = Math.max(state.player.hp, 45);
        state.player.illness = null;
      }
    }
  });

  // Monastery lodging: monks stay free, and a monk companion gets the whole caravan in free.
  function lodgingCost(state) {
    if (hasRole(state, "monk")) return 0;
    return traveling(state).filter((p) => !isMonk(state, p)).length * B().lodgingPerPerson;
  }

  /* ---------- Bazaar ---------- */
  function priceFactor(state, landmarkId) {
    const b = B();
    let f = b.townPriceUp[landmarkId] || 1;
    if (state.player.background === "merchant") f *= b.merchantDiscount;
    if (hasRole(state, "merchant")) f *= b.merchantDiscount;
    return f;
  }
  function price(state, item, landmarkId) {
    const b = B();
    return Math.max(1, Math.round(b.prices[item] * b.priceStep[item] * priceFactor(state, landmarkId)));
  }
  function sellPrice(state, item, landmarkId) {
    return Math.max(0, Math.floor(price(state, item, landmarkId) * B().sellRate));
  }

  /* ---------- Score (section 7) ---------- */
  function score(state) {
    const b = B().score;
    const arrived = state.party.filter((p) => p.status === "traveling").length;
    const sutraPts = Math.round(state.sutras.count * state.sutras.condition / 100 * b.perSutraAtFull);
    return {
      sutras: state.sutras.count, condition: state.sutras.condition, sutraPts,
      companions: arrived, companionPts: arrived * b.perCompanion,
      generosity: state.generosity, generosityPts: state.generosity * b.perGenerosity,
      total: sutraPts + arrived * b.perCompanion + state.generosity * b.perGenerosity
    };
  }

  window.ENGINE = {
    clamp, dateInfo, dateOf, seasonOf, advanceCalendar, skipTo, weather,
    traveling, hasRole, byRole, isMonk, healthWord, HEALTH_LABEL, fill,
    segment, kmToNext, nextMarket, capacity, load, speed, foodPerDay, waterPerDay, nightTravelOffered,
    travelDay, arrive, restDays, longRest, changeMorale,
    chips, applyEffects, canAfford, needsFor, pickEvent, prepareEvent, resolveChoice,
    price, sellPrice, priceFactor, score, lodgingCost
  };
})();
