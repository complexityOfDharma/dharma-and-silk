/* Pixel sprites and scene builders: DESIGN.md section 9.6 and the appendix.
   Everything is inline SVG with shape-rendering="crispEdges".
   Sprites are path strings in grid units, scaled by their unit size. */
(function () {
  "use strict";

  const W = 1280, H = 800;

  // Read a color token from css/tokens.css so colors live in one place.
  const tokenCache = {};
  function T(name) {
    if (!tokenCache[name]) {
      tokenCache[name] = getComputedStyle(document.documentElement)
        .getPropertyValue("--" + name).trim() || "#ff00ff";
    }
    return tokenCache[name];
  }

  // Small seeded random generator so scenes look the same every time.
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const snap = (v, g) => Math.round(v / g) * g;

  function rectD(x, y, w, h) { return `M${x} ${y}h${w}v${h}h${-w}z`; }
  function path(d, fill, extra) {
    return `<path d="${d}" fill="${fill}"${extra ? " " + extra : ""}/>`;
  }
  // A sprite drawn from grid-unit path data at a given pixel unit size.
  function sprite(d, x, y, unit, fill, extra) {
    return `<path transform="translate(${x} ${y}) scale(${unit})" d="${d}" fill="${fill}"${extra ? " " + extra : ""}/>`;
  }
  function flip(d, x, y, unit, widthUnits, fill) {
    return `<path transform="translate(${x + widthUnits * unit} ${y}) scale(${-unit} ${unit})" d="${d}" fill="${fill}"/>`;
  }

  /* ---------- Sprite data (appendix) ---------- */

  const CAMEL = {
    w: 20, h: 14,
    body: "M8 0h2v2h-2z M5 3h2v1h-2z M11 3h2v1h-2z M16 3h3v1h-3z M15 4h5v1h-5z M4 4h10v1h-10z M14 4h2v3h-2z M3 5h12v1h-12z M2 6h15v2h-15z M2 8h14v1h-14z M3 9h12v1h-12z M3 10h1v4h-1z M5 10h1v4h-1z M12 10h1v4h-1z M14 10h1v4h-1z M1 6h1v3h-1z",
    blanket: "M4 5h10v1h-10z",
    bags: "M4 6h3v2h-3z M11 6h3v2h-3z",
    rider: "M7 2h4v2h-4z"
  };
  // Resting camel, legs folded (20×9 units). Not in the appendix; same style.
  const CAMEL_REST = {
    w: 20, h: 10,
    body: "M16 0h3v2h-3z M19 1h1v1h-1z M15 1h2v5h-2z M6 2h5v1h-5z M5 3h7v1h-7z M3 4h13v1h-13z M2 5h14v3h-14z M1 5h1v2h-1z M2 8h4v1h-4z M11 8h5v1h-5z M1 9h17v1h-17z",
    blanket: "M5 4h8v1h-8z",
    bags: "M6 5h2v2h-2z M10 5h2v2h-2z"
  };
  const MONK_WALK = "M1 0h2v2h-2z M0 2h4v5h-4z M0 7h1v2h-1z M3 7h1v2h-1z M5 0h1v9h-1z";
  const STUPA = "M6 0h2v6h-2z M5 2h4v1h-4z M5 4h4v1h-4z M5 6h4v2h-4z M4 8h6v1h-6z M3 9h8v1h-8z M2 10h10v2h-10z M1 12h12v6h-12z M0 18h14v3h-14z";
  const STUPA_LAMP = "M6 -2h2v2h-2z";
  const FLAME_ICON = {
    outer: "M3 0h2v2h-2z M2 2h4v2h-4z M1 4h6v3h-6z M2 7h4v1h-4z",
    core: "M3 4h2v3h-2z M0 9h8v1h-8z M1 8h6v1h-6z"
  };
  // Seated traveler by a fire (6×7 units): head, body, folded legs.
  const SITTER = {
    skin: "M2 0h2v2h-2z",
    robe: "M1 2h4v3h-4z M0 5h6v2h-6z"
  };
  const STANDER = {
    skin: "M2 0h2v2h-2z",
    robe: "M1 2h4v5h-4z",
    legs: "M1 7h1v2h-1z M4 7h1v2h-1z"
  };

  const PORTRAITS = {
    faxian: [
      ["#b8607a", "M0 0h32v10h-32z"],
      ["#e08c74", "M0 10h32v6h-32z"],
      ["#f6c28b", "M0 16h32v8h-32z"],
      ["#e7a476", "M0 24V20h6v-1h8v1h8v-2h10v14H0Z"],
      ["#ffe4a8", "M2 3h3v1h-3z M1 4h5v2h-5z M2 6h3v1h-3z"],
      ["#6b4234", "M27 5h1v27h-1z"],
      ["#f2b35e", "M26 1h3v1h-3z M25 2h1v3h-1z M29 2h1v3h-1z M26 5h3v1h-3z"],
      ["#e8b48a", "M12 5h8v1h-8z M11 6h10v1h-10z M10 7h12v10h-12z M11 17h10v1h-10z M12 18h8v1h-8z M9 11h1v3h-1z M22 11h1v3h-1z M14 19h4v2h-4z M25 24h3v2h-3z"],
      ["#f6d2ae", "M13 5h4v1h-4z M12 6h4v1h-4z"],
      ["#c98d63", "M21 8h1v9h-1z M20 17h1v1h-1z M19 18h1v1h-1z M15 14h2v1h-2z M14 19h4v1h-4z M12 14h1v2h-1z M19 14h1v2h-1z M13 8h6v1h-6z"],
      ["#fff4e6", "M11 10h3v1h-3z M18 10h3v1h-3z"],
      ["#2a1a14", "M12 12h2v1h-2z M18 12h2v1h-2z"],
      ["#9a5a44", "M14 16h4v1h-4z"],
      ["#b5533a", "M8 21h16v1h-16z M5 22h20v10h-20z"],
      ["#6f6258", "M13 21h6v1h-6z M14 22h4v2h-4z M15 24h2v1h-2z"],
      ["#cd6a45", "M6 22h3v1h-3z M7 23h3v1h-3z M9 24h3v1h-3z M10 25h3v1h-3z M12 26h3v1h-3z M13 27h3v1h-3z M15 28h3v1h-3z M16 29h3v1h-3z M18 30h3v1h-3z M19 31h3v1h-3z"],
      ["#8a3a28", "M22 23h1v9h-1z M9 28h1v4h-1z M5 29h4v1h-4z"]
    ]
  };

  /* ---------- Icons: 24px stroke icons, square caps (section 9.4) ---------- */
  const ICONS = {
    bowl: "M3 11h18 M4 11c0 5 3 8 8 8s8-3 8-8 M9 19v2h6v-2 M10 7l2-3 2 3",
    scales: "M12 3v17 M8 21h8 M4 7h16 M4 7l-2 7h6z M20 7l-2 7h6z M12 3h0",
    pot: "M4 9h16 M5 9v8c0 2 1 3 3 3h8c2 0 3-1 3-3V9 M2 11h2 M20 11h2 M9 6c0-1 1-2 3-2s3 1 3 2",
    brush: "M19 3l-9 9 M10 12l2 2 M10 12c-3 0-5 2-5 5l-2 4c4 0 8-1 9-5z",
    speech: "M3 4h18v12H11l-5 4v-4H3z M7 8h10 M7 12h6",
    compass: "M12 3a9 9 0 1 0 0.01 0z M15 9l-2 5-4 1 2-5z",
    camel: "M3 20v-6l2-4h5l2-3 2 3h2l2-4h3v3l-2 2v3 M8 20v-6 M17 20v-6 M14 20v-5",
    leaf: "M4 20c0-9 6-15 16-16 0 10-6 16-15 16z M4 20l9-9",
    drop: "M12 3l6 9a6 6 0 1 1-12 0z",
    silk: "M4 5h12v14H4z M16 7h4v10h-4 M8 5v14 M12 5v14",
    scroll: "M6 3h12v18H6z M3 6h3 M3 3v3 M18 18h3v3 M9 8h6 M9 12h6 M9 16h4",
    food: "M5 11h14l-2 9H7z M8 11V8 M12 11V6 M16 11V8",
    clothing: "M8 3l-5 4 3 4 2-1v11h8V10l2 1 3-4-5-4c0 2-2 3-4 3s-4-1-4-3z",
    medicine: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
    sound: "M4 9h4l5-4v14l-5-4H4z M16 9c1 1 1 5 0 6 M19 6c3 3 3 9 0 12",
    soundOff: "M4 9h4l5-4v14l-5-4H4z M16 9l6 6 M22 9l-6 6",
    gear: "M10 3h4v3l2 1 2-2 3 3-2 2 1 2h3v4h-3l-1 2 2 2-3 3-2-2-2 1v3h-4v-3l-2-1-2 2-3-3 2-2-1-2H3v-4h3l1-2-2-2 3-3 2 2 2-1z M12 10a2 2 0 1 0 0.01 0z",
    check: "M5 12l5 5 9-10",
    plus: "M12 5v14 M5 12h14",
    pencil: "M4 20l1-5 11-11 4 4-11 11z M14 6l4 4"
  };
  function icon(name, size, color, stroke) {
    const d = ICONS[name] || ICONS.scroll;
    return `<svg class="icon" viewBox="0 0 24 24" width="${size || 24}" height="${size || 24}" aria-hidden="true" focusable="false">` +
      `<path d="${d}" fill="none" stroke="${color || "currentColor"}" stroke-width="${stroke || 2.3}" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;
  }

  /* ---------- Scene building blocks (section 9.6) ---------- */

  // Sky: flat horizontal bands. bands = [[token, yEnd], ...]
  const SKY_DUSK = [["sky-night", 120], ["sky-dusk", 208], ["sky-mauve", 288], ["sky-plum", 360],
    ["sky-rose", 424], ["sky-coral", 480], ["sky-glow", 800]];
  function sky(bands, top) {
    let y = top || 0, out = "";
    for (const [tok, yEnd] of bands) {
      out += path(rectD(0, y, W, yEnd - y), T(tok));
      y = yEnd;
    }
    return out;
  }

  function stars(seed, count, yMax, avoid) {
    const r = rng(seed); let d = "", dim = "";
    for (let i = 0; i < count; i++) {
      const x = snap(r() * (W - 8), 4), y = snap(8 + r() * (yMax - 8), 4);
      if (avoid && avoid(x, y)) continue;
      const big = r() > 0.8;
      const piece = big ? `M${x} ${y + 4}h12v4h-12z M${x + 4} ${y}h4v12h-4z` : rectD(x, y, 4, 4);
      if (r() > 0.5) d += piece; else dim += piece;
    }
    return path(d, T("cream")) + path(dim, T("cream"), 'opacity="0.55"');
  }

  // Pixel circle built from rows of `row` px, centered on (cx, cy).
  function pixelCircle(cx, cy, r, row, fill, extra) {
    let d = "";
    for (let y = -r; y < r; y += row) {
      const mid = y + row / 2;
      const half = snap(Math.sqrt(Math.max(0, r * r - mid * mid)), row);
      if (half <= 0) continue;
      d += rectD(cx - half, cy + y, half * 2, row);
    }
    return path(d, fill, extra);
  }
  function sun(cx, cy, r, halos) {
    let out = "";
    (halos || [[r + 56, 0.15], [r + 28, 0.22]]).forEach(([hr, op]) => {
      out += pixelCircle(cx, cy, hr, 8, T("sun"), `opacity="${op}"`);
    });
    return out + pixelCircle(cx, cy, r, 8, T("sun"));
  }

  // Stepped silhouette: sample a smooth curve every `step` px, snap y to 8.
  // fn(x) returns the ridge height (y) at x.
  function stepped(fn, fill, x0, x1, step, bottom) {
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? W : x1; step = step || 16; bottom = bottom || H;
    let d = `M${x0} ${bottom}`;
    for (let x = x0; x < x1; x += step) {
      d += `V${snap(fn(x + step / 2), 8)}H${Math.min(x + step, x1)}`;
    }
    return path(d + `V${bottom}Z`, fill);
  }
  // A smooth ridge from a few sine waves, for dunes and hills.
  function ridge(base, waves) {
    return (x) => waves.reduce((y, [amp, len, phase]) =>
      y + amp * Math.sin((x / len) * Math.PI * 2 + (phase || 0)), base);
  }
  // Ground height of a stepped path at x (for standing sprites on ridges).
  function groundAt(fn, x, step) { step = step || 16; const cx = Math.floor(x / step) * step + step / 2; return snap(fn(cx), 8); }

  function camel(x, y, unit, color, opts) {
    opts = opts || {};
    const u = unit || 4;
    if (opts.silhouette) {
      return sprite(CAMEL.body + (opts.rider ? " " + CAMEL.rider : ""), x, y, u, color);
    }
    let out = sprite(CAMEL.body, x, y, u, color || T("camel"));
    out += sprite(CAMEL.blanket, x, y, u, T("terracotta"));
    out += sprite(CAMEL.bags, x, y, u, T("apricot"));
    return out;
  }
  function camelResting(x, y, unit, faceLeft) {
    const u = unit || 4, c = CAMEL_REST;
    if (faceLeft) {
      return flip(c.body, x, y, u, c.w, T("camel")) + flip(c.blanket, x, y, u, c.w, T("terracotta"));
    }
    return sprite(c.body, x, y, u, T("camel")) + sprite(c.blanket, x, y, u, T("terracotta"));
  }
  function person(x, y, unit, robe, seated, faceLeft) {
    const u = unit || 4, s = seated ? SITTER : STANDER;
    let out = sprite(s.skin, x, y, u, "#e8b48a") + sprite(s.robe, x, y, u, robe);
    if (!seated) out += sprite(s.legs, x, y, u, T("trunk"));
    return out;
  }
  // Campfire with two flame frames that flicker (CSS class .flicker-a / .flicker-b).
  function campfire(x, y, unit) {
    const u = unit || 4;
    const logs = "M0 6h2v1h-2z M2 5h2v1h-2z M4 4h2v1h-2z M6 5h2v1h-2z M8 6h2v1h-2z M1 7h8v1h-8z";
    const fA = "M4 0h1v1h-1z M3 1h3v1h-3z M2 2h5v2h-5z M3 4h3v1h-3z";
    const fB = "M5 0h1v1h-1z M4 1h2v1h-2z M2 2h5v1h-5z M3 3h4v1h-4z M3 4h3v1h-3z";
    const core = "M4 2h1v2h-1z";
    return `<g class="campfire">` +
      pixelCircle(x + 5 * u, y + 5 * u, 32, 4, T("flame"), 'opacity="0.16"') +
      sprite(logs, x, y, u, T("trunk")) +
      `<g class="flicker-a">${sprite(fA, x, y, u, T("flame"))}${sprite(core, x, y, u, T("sun"))}</g>` +
      `<g class="flicker-b">${sprite(fB, x, y, u, T("flame"))}${sprite(core, x + u, y, u, T("sun"))}</g>` +
      `</g>`;
  }
  function stupa(x, groundY, unit, color, lamp) {
    const u = unit || 4, y = groundY - 21 * u;
    return sprite(STUPA, x, y, u, color) + (lamp ? sprite(STUPA_LAMP, x, y, u, T("apricot")) : "");
  }

  /* ---------- Landmark scene features ----------
     data/landmarks.js lists features per landmark; each builder below draws one. */

  const FEATURES = {
    sky(f) { return sky(f.bands || SKY_DUSK); },
    stars(f) { return stars(f.seed || 7, f.count || 40, f.yMax || 200); },
    sun(f) { return sun(f.x, f.y, f.r || 56); },
    moon(f) {
      return pixelCircle(f.x, f.y, f.r || 24, 4, T("cream")) +
        pixelCircle(f.x + (f.r || 24) * 0.5, f.y - 4, (f.r || 24) * 0.8, 4, f.bg || T("sky-night"));
    },
    dunes(f) {
      // f.layers: [{ color, base, waves, x0, x1 }]
      return f.layers.map((l) => stepped(ridge(l.base, l.waves), T(l.color), l.x0, l.x1)).join("");
    },
    mountains(f) {
      // Jagged range with optional snow caps.
      const r = rng(f.seed || 3); let out = "";
      const peaks = [];
      for (let x = (f.x0 || 0); x < (f.x1 || W); x += f.spacing || 160) {
        peaks.push([x + r() * 60, f.base - (f.height || 160) * (0.6 + r() * 0.4)]);
      }
      const fn = (x) => {
        let y = f.base;
        for (const [px, py] of peaks) {
          const dy = py + Math.abs(x - px) * (f.slope || 1.1);
          if (dy < y) y = dy;
        }
        return y;
      };
      out += stepped(fn, T(f.color || "sky-mauve"), f.x0, f.x1, 16, f.bottom || 800);
      if (f.snow) {
        // Cap every column whose ridge rises above the snowline.
        const line = f.base - (f.height || 160) * 0.62;
        let d = "";
        for (let x = (f.x0 || 0); x < (f.x1 || W); x += 16) {
          const y = snap(fn(x + 8), 8);
          if (y < line) d += rectD(x, y, 16, Math.min(24, snap(line - y, 8) + 8));
        }
        out += path(d, T("cream"), 'opacity="0.9"');
      }
      return out;
    },
    stripedHills(f) {
      // Banded hills (Flaming Mountains, Danxia). Each band is a stepped ridge a few px lower.
      const colors = f.colors.map(T); let out = "";
      colors.forEach((c, i) => {
        out += stepped(ridge(f.base + i * (f.band || 16), f.waves), c, f.x0, f.x1);
      });
      return out;
    },
    ground(f) {
      const r = rng(f.seed || 11);
      let d = "";
      for (let i = 0; i < (f.dots || 60); i++) {
        const x = snap(r() * W, 8), y = snap(f.y + 16 + r() * (H - f.y - 16), 8);
        d += rectD(x, y, 8, 4);
      }
      return path(rectD(0, f.y, W, H - f.y), T(f.color || "ground")) + path(d, T(f.dot || "ground-dot"));
    },
    road(f) {
      // Stepped road narrowing toward (x, top).
      let d = "";
      const steps = Math.ceil((H - f.top) / 16);
      for (let i = 0; i < steps; i++) {
        const y = f.top + i * 16, half = snap((f.topWidth || 32) / 2 + i * (f.spread || 12), 8);
        d += rectD(f.x - half + snap(i * (f.drift || 0), 8), y, half * 2, 16);
      }
      return path(d, T(f.color || "ground-dot"));
    },
    water(f) {
      // Lake or river: flat band with light ripple lines.
      const r = rng(f.seed || 5);
      let ripples = "";
      for (let i = 0; i < (f.ripples || 14); i++) {
        const x = snap((f.x0 || 0) + r() * ((f.x1 || W) - (f.x0 || 0) - 48), 8);
        const y = snap(f.y + 8 + r() * (f.h - 16), 8);
        ripples += rectD(x, y, 24 + snap(r() * 32, 8), 4);
      }
      return path(rectD(f.x0 || 0, f.y, (f.x1 || W) - (f.x0 || 0), f.h), f.color || "#5a8fa6") +
        path(ripples, T("water"), 'opacity="0.8"');
    },
    reeds(f) {
      let d = "";
      const r = rng(f.seed || 9);
      for (let i = 0; i < f.count; i++) {
        const x = snap(f.x0 + r() * (f.x1 - f.x0), 4), h = 16 + snap(r() * 24, 4);
        d += rectD(x, f.y - h, 4, h);
      }
      return path(d, T(f.color || "dune-near"));
    },
    cliff(f) {
      // Mogao-style cliff face with strata, ledges, rows of caves and wooden walkways.
      const x0 = f.x0 || 0, x1 = f.x1, top = f.top, base = f.base;
      const topFn = ridge(top, [[10, 150, 0.7], [6, 60, 2]]);
      let body = `M${x0} ${base}`;
      for (let x = x0; x < x1 - 16; x += 16) body += `V${snap(topFn(x + 8), 8)}H${x + 16}`;
      body += `V${top}`;
      // stepped right edge going down
      const stepsN = Math.ceil((base - top) / 32);
      for (let i = 0; i < stepsN; i++) {
        const y = top + i * 32;
        body += `H${x1 + (i % 2) * 16 + i * 4}V${y + 32}`;
      }
      body += `H${x0}Z`;
      let out = path(body, T("cliff"));
      let strata = "", ledge = "", caves = "", walk = "", posts = "";
      for (let y = top + 24; y < base; y += 48) strata += rectD(x0, y, x1 - x0 - 16, 4);
      out += path(strata, T("cliff-strata"));
      let rim = "";
      for (let x = x0; x < x1 - 16; x += 16) rim += rectD(x, snap(topFn(x + 8), 8), 16, 8);
      out += path(rim, T("cliff-ledge"));
      (f.rows || []).forEach((row, ri) => {
        const r = rng(31 + ri);
        for (let x = x0 + (row.offset || 24); x < x1 - 40; x += row.gap || 56) {
          const w = row.w || 16, h = row.h || 24;
          caves += rectD(x, row.y, w, h);
          if (r() > 0.4) ledge += rectD(x - 4, row.y - 4, w + 8, 4);
        }
        walk += rectD(x0, row.y + (row.h || 24), x1 - x0 - 24, 4);
        for (let x = x0 + 16; x < x1 - 32; x += 48) posts += rectD(x, row.y + (row.h || 24) + 4, 4, 12);
      });
      out += path(ledge, T("cliff-ledge")) + path(caves, T("cave")) +
        path(walk, T("trunk")) + path(posts, T("trunk"));
      return out;
    },
    wall(f) {
      // Rammed-earth wall with crenellations, optional gate tower.
      const { x, w, base } = f, h = f.h || 56, y = base - h;
      let d = rectD(x, y, w, h), cren = "", shade = "";
      for (let cx = x; cx < x + w; cx += 24) cren += rectD(cx, y - 8, 12, 8);
      for (let sy = y + 16; sy < base; sy += 16) shade += rectD(x, sy, w, 4);
      let out = path(d + cren, T("wall")) + path(shade, T("ground-dot"), 'opacity="0.6"');
      if (f.gate) {
        const gx = f.gate.x, gw = f.gate.w || 96, gh = f.gate.h || 56;
        const ty = y - gh;
        out += path(rectD(gx, ty, gw, gh + h), T("wall"));
        out += path(rectD(gx + gw / 2 - 16, base - 40, 32, 40), T("cave"));
        // tiered roof
        out += path(rectD(gx - 16, ty - 8, gw + 32, 8) + rectD(gx - 8, ty - 16, gw + 16, 8) +
          rectD(gx + 16, ty - 32, gw - 32, 16) + rectD(gx + 8, ty - 40, gw - 16, 8), T("roof"));
        let slits = "";
        for (let sx = gx + 16; sx <= gx + gw - 24; sx += 24) slits += rectD(sx, ty + 12, 8, 16);
        out += path(slits, T("cave"));
      }
      return out;
    },
    hall(f) {
      // A large timber hall with a sweeping roof (Chang'an, monasteries).
      const { x, w, base } = f, h = f.h || 64;
      let out = path(rectD(x, base - 16, w, 16), T("wall")); // platform
      out += path(rectD(x + 16, base - 16 - h, w - 32, h), T("cliff-ledge"));
      let cols = "";
      for (let cx = x + 24; cx < x + w - 24; cx += 32) cols += rectD(cx, base - 16 - h, 8, h);
      out += path(cols, T("terracotta"));
      const ry = base - 16 - h;
      out += path(rectD(x - 8, ry - 8, w + 16, 8) + rectD(x - 16, ry - 4, 16, 4) + rectD(x + w, ry - 4, 16, 4) +
        rectD(x + 8, ry - 24, w - 16, 16) + rectD(x + 24, ry - 40, w - 48, 16), T("roof"));
      out += path(rectD(x + w / 2 - 16, base - 16 - 40, 32, 40), T("cave"));
      return out;
    },
    tower(f) {
      // Multi-storey pagoda tower (Chang'an).
      const { x, base } = f, tiers = f.tiers || 4; let out = "", d = "", roof = "";
      let w = f.w || 64, y = base;
      for (let i = 0; i < tiers; i++) {
        const th = 32;
        d += rectD(x - w / 2 + 8, y - th, w - 16, th);
        roof += rectD(x - w / 2 - 8, y - th - 8, w + 16, 8);
        y -= th + 8; w -= 8;
      }
      roof += rectD(x - 4, y - 24, 8, 24);
      out += path(d, T("cliff-ledge")) + path(roof, T("roof"));
      return out;
    },
    poplars(f) {
      // Tall narrow poplars in autumn gold. f.trees: [[x, height]]
      let gold = "", shade = "", trunk = "";
      f.trees.forEach(([x, h]) => {
        const base = f.base, w = 32;
        trunk += rectD(x + 12, base - 24, 8, 24);
        const top = base - 16 - h;
        gold += rectD(x + 8, top, 16, 8) + rectD(x + 4, top + 8, 24, 16) + rectD(x, top + 24, w, h - 40) +
          rectD(x + 4, base - 32, 24, 16);
        shade += rectD(x + 20, top + 16, 8, h - 40) + rectD(x + 4, base - 24, 24, 8);
      });
      const leaf = f.color ? T(f.color) : T("poplar");
      const leafShade = f.shade ? T(f.shade) : T("poplar-shade");
      return path(trunk, T("trunk")) + path(gold, leaf) + path(shade, leafShade);
    },
    stupa(f) { return stupa(f.x, f.base, f.unit || 4, f.color ? T(f.color) : T("wall"), f.lamp !== false); },
    beacon(f) {
      // Han beacon towers: tapering rammed-earth blocks with a smoke plume option.
      let out = "";
      f.towers.forEach(([x, h]) => {
        out += path(rectD(x, f.base - h, 40, h) + rectD(x + 4, f.base - h - 8, 32, 8) + rectD(x + 8, f.base - h - 16, 8, 8) +
          rectD(x + 24, f.base - h - 16, 8, 8), T(f.color || "wall"));
        out += path(rectD(x, f.base - h + 16, 40, 4) + rectD(x, f.base - h + 40, 40, 4), T("ground-dot"), 'opacity="0.6"');
      });
      return out;
    },
    tents(f) {
      // Army or caravan tents with banners.
      let body = "", door = "", pole = "", flag = "";
      f.tents.forEach(([x, w]) => {
        const h = w * 0.6, base = f.base;
        for (let i = 0; i < h; i += 8) {
          const inset = snap((i / h) * (w / 2 - 8), 8);
          body += rectD(x + inset, base - i - 8, w - inset * 2, 8);
        }
        door += rectD(x + w / 2 - 8, base - 24, 16, 24);
        if (f.banners) { pole += rectD(x + w / 2 - 2, base - h - 40, 4, 40); flag += rectD(x + w / 2 + 2, base - h - 40, 20, 12); }
      });
      return path(body, T(f.color || "paper-line")) + path(door, T("cave")) + path(pole, T("trunk")) +
        path(flag, T(f.flag || "terracotta"));
    },
    houses(f) {
      // Low flat-roofed mud-brick houses.
      let body = "", roof = "", win = "";
      f.houses.forEach(([x, w, h]) => {
        body += rectD(x, f.base - h, w, h);
        roof += rectD(x - 4, f.base - h - 4, w + 8, 4);
        win += rectD(x + 8, f.base - h + 12, 8, 8);
        if (w > 48) win += rectD(x + w - 16, f.base - h + 12, 8, 8);
      });
      return path(body, T(f.color || "wall")) + path(roof, T("cliff-strata")) + path(win, T("cave"));
    },
    boat(f) {
      const u = f.unit || 4;
      const hull = "M0 3h24v2h-24z M2 5h20v1h-20z M4 6h16v1h-16z";
      const cabin = "M8 0h8v3h-8z";
      return sprite(hull, f.x, f.y, u, T("trunk")) + sprite(cabin, f.x, f.y, u, T("roof")) +
        person(f.x + 18 * u, f.y - 9 * u + 3 * u, u, T("panel-2"));
    },
    camp(f) {
      // Caravan camp: 2 resting camels, a campfire and 2 figures.
      const x = f.x, base = f.base;
      return camelResting(x, base - 40, 4) +
        camelResting(x + 96, base - 40 - 8, 4, true) +
        person(x + 196, base - 28, 4, T("terracotta"), true) +
        campfire(x + 228, base - 32, 4) +
        person(x + 280, base - 28, 4, T("panel-2"), true, true);
    },
    caravan(f) {
      // Walking caravan (travel screen, story scenes).
      let out = "";
      const u = f.unit || 4;
      out += person(f.x + 3 * 88, f.base - 36, u, T("terracotta"));
      for (let i = 0; i < (f.camels || 3); i++) out += camel(f.x + i * 88, f.base - 56, u);
      return out;
    }
  };

  function buildScene(features, opts) {
    opts = opts || {};
    const body = features.map((f) => {
      const b = FEATURES[f.type];
      if (!b) { console.warn("Unknown scene feature", f.type); return ""; }
      return b(f);
    }).join("");
    return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" role="img" aria-label="${opts.label || ""}">${body}</svg>`;
  }

  /* ---------- Title scene (section 9.5, canvas 1) ---------- */

  const TITLE_DUNES = {
    far: "M0 800V560H16V552H64V544H96V536H144V528H208V520H320V512H400V520H496V528H544V536H576V544H624V552H688V560H768V568H896V560H960V552H1008V544H1040V536H1056V528H1088V520H1120V512H1168V504H1248V512H1280V800Z",
    mid: "M0 800V616H32V608H80V600H144V592H288V600H368V608H416V616H464V624H512V632H560V640H656V648H720V640H816V632H864V624H896V616H928V608H960V600H992V592H1024V584H1072V576H1200V584H1248V592H1280V800Z",
    near: "M0 800V688H16V680H64V672H112V664H176V656H496V664H560V672H608V680H656V688H704V696H800V704H928V696H1008V688H1056V680H1088V672H1136V664H1184V656H1264V664H1280V800Z",
    front: "M0 800V744H16V736H112V728H208V720H336V712H592V720H704V728H784V736H896V744H1168V736H1248V728H1280V800Z"
  };
  // Mid-dune ridge heights by x (from the path above), to stand the caravan on.
  function midRidgeY(x) {
    const steps = [[928, 608], [960, 600], [992, 592], [1024, 584], [1072, 576], [1200, 584], [1248, 592], [1280, 592]];
    let y = 608;
    for (const [sx, sy] of steps) { if (x < sx) return y; y = sy; }
    return y;
  }

  function titleScene() {
    const bands = [["sky-night", 136], ["sky-dusk", 232], ["sky-mauve", 312], ["sky-plum", 384],
      ["sky-rose", 440], ["sky-coral", 488], ["sky-glow", 800]];
    let out = sky(bands);
    out += stars(21, 70, 300, (x, y) => x > 880 && y > 260);
    out += sun(1016, 440, 96, [[176, 0.15], [136, 0.24]]);
    out += path(TITLE_DUNES.far, T("dune-far"));
    // Caravan silhouette on the mid-dune ridge, in the dune's own color.
    const mid = T("dune-mid");
    let car = "";
    const camelsX = [896, 984, 1072];
    camelsX.forEach((x, i) => {
      // Stand each camel so its lowest leg touches the ridge; overlap merges into the dune.
      const feet = Math.max(midRidgeY(x + 12), midRidgeY(x + 58));
      car += camel(x, feet - 56, 4, mid, { silhouette: true, rider: i === 1 });
    });
    const monkX = 1164;
    car += sprite(MONK_WALK, monkX, midRidgeY(monkX + 12) - 36, 4, mid);
    out += path(TITLE_DUNES.mid, mid) + car;
    out += path(TITLE_DUNES.near, T("dune-near"));
    out += stupa(1200, 656, 4, T("dune-near"), true);
    out += path(TITLE_DUNES.front, T("panel"));
    return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" role="img" aria-label="A caravan of camels crosses the dunes at dusk. A stupa stands on the near dune.">${out}</svg>`;
  }

  /* ---------- Night camp scene (party setup, 460×200) ---------- */

  function nightCampScene() {
    const w = 460, h = 200;
    let out = path(rectD(0, 0, w, h), T("panel"));
    const r = rng(4); let st = "";
    for (let i = 0; i < 16; i++) st += rectD(snap(r() * (w - 8), 4), snap(r() * 80, 4), 4, 4);
    out += path(st, T("cream"), 'opacity="0.6"');
    out += pixelCircle(380, 40, 20, 4, T("cream"));
    out += pixelCircle(392, 36, 16, 4, T("panel"));
    const hills1 = ridge(120, [[16, 300, 0.4], [8, 120, 1]]);
    const hills2 = ridge(150, [[12, 240, 2], [6, 90, 0]]);
    let d1 = `M0 ${h}`, d2 = `M0 ${h}`;
    for (let x = 0; x < w; x += 16) {
      d1 += `V${snap(hills1(x + 8), 8)}H${Math.min(x + 16, w)}`;
      d2 += `V${snap(hills2(x + 8), 8)}H${Math.min(x + 16, w)}`;
    }
    out += path(d1 + `V${h}Z`, T("panel-2")) + path(d2 + `V${h}Z`, T("sky-night"));
    out += path(rectD(0, 176, w, 24), T("shadow"));
    out += camelResting(60, 176 - 40, 4);
    out += person(190, 176 - 28, 4, T("terracotta"), true);
    out += campfire(222, 176 - 32, 4);
    out += person(272, 176 - 28, 4, T("panel-line"), true, true);
    return `<svg class="night-camp" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
  }

  /* ---------- Portraits and small sprites for the UI ---------- */

  /* ---------- Portrait builder: same 32×32 grid and framing as Faxian (appendix) ---------- */
  const FACE = {
    skin: "M12 5h8v1h-8z M11 6h10v1h-10z M10 7h12v10h-12z M11 17h10v1h-10z M12 18h8v1h-8z M9 11h1v3h-1z M22 11h1v3h-1z M14 19h4v2h-4z",
    highlight: "M13 5h4v1h-4z M12 6h4v1h-4z",
    shade: "M21 8h1v9h-1z M20 17h1v1h-1z M19 18h1v1h-1z M15 14h2v1h-2z M14 19h4v1h-4z M12 14h1v2h-1z M19 14h1v2h-1z",
    wrinkle: "M13 8h6v1h-6z",
    brows: "M11 10h3v1h-3z M18 10h3v1h-3z",
    eyesClosed: "M12 12h2v1h-2z M18 12h2v1h-2z",
    eyesOpen: "M12 11h2v2h-2z M18 11h2v2h-2z",
    eyeShine: "M12 11h1v1h-1z M18 11h1v1h-1z",
    mouth: "M14 16h4v1h-4z",
    smile: "M13 15h1v1h-1z M14 16h4v1h-4z M18 15h1v1h-1z",
    beard: "M10 14h1v3h-1z M21 14h1v3h-1z M11 16h3v2h-3z M18 16h3v2h-3z M12 18h8v2h-8z M13 20h6v1h-6z",
    mustache: "M13 15h6v1h-6z",
    robe: "M8 21h16v1h-16z M5 22h20v10h-20z",
    under: "M13 21h6v1h-6z M14 22h4v2h-4z M15 24h2v1h-2z",
    drape: "M6 22h3v1h-3z M7 23h3v1h-3z M9 24h3v1h-3z M10 25h3v1h-3z M12 26h3v1h-3z M13 27h3v1h-3z M15 28h3v1h-3z M16 29h3v1h-3z M18 30h3v1h-3z M19 31h3v1h-3z",
    seams: "M22 23h1v9h-1z M9 28h1v4h-1z M5 29h4v1h-4z",
    collar: "M12 21h8v1h-8z M13 22h6v1h-6z M14 23h4v1h-4z",
    staff: "M27 5h1v27h-1z",
    staffRings: "M26 1h3v1h-3z M25 2h1v3h-1z M29 2h1v3h-1z M26 5h3v1h-3z",
    spear: "M27 3h1v29h-1z",
    spearTip: "M26 0h3v1h-3z M27 1h1v2h-1z"
  };
  const HATS = {
    shaved: { hat: "M12 5h8v1h-8z M11 6h10v1h-10z" },
    guan: { hat: "M11 4h10v1h-10z M10 5h12v3h-12z M9 7h1v4h-1z M22 7h1v4h-1z M13 1h6v3h-6z", band: "M11 2h10v1h-10z" },
    helmet: { hat: "M11 3h10v1h-10z M10 4h12v4h-12z M9 7h1v6h-1z M22 7h1v6h-1z", band: "M15 1h2v2h-2z" },
    peaked: { hat: "M14 0h4v1h-4z M13 1h6v1h-6z M12 2h8v1h-8z M11 3h10v2h-10z M10 5h12v3h-12z", band: "M10 7h12v1h-12z" },
    turban: { hat: "M11 2h10v1h-10z M10 3h12v1h-12z M9 4h14v4h-14z", band: "M9 6h14v1h-14z" },
    straw: { hat: "M13 2h6v1h-6z M11 3h10v2h-10z M5 5h22v2h-22z", band: "M11 4h10v1h-10z" },
    hair: { hat: "M11 4h10v1h-10z M10 5h12v3h-12z M9 6h1v6h-1z M22 6h1v6h-1z", band: "M10 7h12v1h-12z" }
  };
  function makePortrait(o) {
    const bg = o.bg || ["#b8607a", "#e08c74", "#f6c28b", "#e7a476"];
    const layers = [
      [bg[0], "M0 0h32v10h-32z"], [bg[1], "M0 10h32v6h-32z"], [bg[2], "M0 16h32v8h-32z"],
      [bg[3], "M0 24V20h6v-1h8v1h8v-2h10v14H0Z"]
    ];
    if (o.sun !== false) layers.push(["#ffe4a8", "M2 3h3v1h-3z M1 4h5v2h-5z M2 6h3v1h-3z"]);
    if (o.prop === "staff") layers.push(["#6b4234", FACE.staff], ["#f2b35e", FACE.staffRings]);
    if (o.prop === "spear") layers.push(["#6b4234", FACE.spear], ["#cdb5c4", FACE.spearTip]);
    layers.push([o.skin, FACE.skin], [o.light, FACE.highlight], [o.shade, FACE.shade]);
    if (o.old) layers.push([o.shade, FACE.wrinkle]);
    const hat = HATS[o.hat || "shaved"];
    layers.push([o.hatColor || o.shade, hat.hat]);
    if (hat.band && o.bandColor) layers.push([o.bandColor, hat.band]);
    layers.push([o.brows || "#2a1a14", FACE.brows]);
    if (o.eyes === "closed") layers.push(["#2a1a14", FACE.eyesClosed]);
    else layers.push(["#2a1a14", FACE.eyesOpen], ["#fff4e6", FACE.eyeShine]);
    if (o.beard) layers.push([o.beard, FACE.beard]);
    if (o.mustache) layers.push([o.mustache, FACE.mustache]);
    layers.push(["#9a5a44", o.smile ? FACE.smile : FACE.mouth]);
    layers.push([o.robe, FACE.robe], [o.under || "#6f6258", o.collar ? FACE.collar : FACE.under]);
    if (o.drape) layers.push([o.drape, FACE.drape], [o.seams || "#8a3a28", FACE.seams]);
    if (o.prop === "staff" || o.prop === "spear") layers.push([o.skin, "M25 24h3v2h-3z"]);
    return layers;
  }
  Object.assign(PORTRAITS, {
    elder: makePortrait({ skin: "#dba47a", light: "#efc49d", shade: "#b98561", old: true, brows: "#fff4e6", eyes: "closed",
      robe: "#9a3f33", drape: "#c0573e", seams: "#6f2a22", prop: "staff" }),
    ligao: makePortrait({ skin: "#e8b48a", light: "#f6d2ae", shade: "#c98d63", hat: "guan", hatColor: "#24234a", bandColor: "#f2b35e",
      beard: "#2a1a14", mustache: "#2a1a14", robe: "#37325f", under: "#f6ecdf", collar: true,
      bg: ["#5a3d6e", "#8a4f78", "#e08c74", "#bf7a52"] }),
    kumarajiva: makePortrait({ skin: "#c98d63", light: "#dca27a", shade: "#a8704c", old: true, brows: "#2a1a14",
      robe: "#7a2e2e", drape: "#c8643b", seams: "#5a1f1f", smile: true,
      bg: ["#37325f", "#8a4f78", "#e08c74", "#cf956a"] }),
    guard: makePortrait({ skin: "#e0a47a", light: "#f0c29c", shade: "#bd8258", hat: "turban", hatColor: "#f6ecdf", bandColor: "#c8643b",
      mustache: "#4a2a38", robe: "#5a3d6e", under: "#cdb5c4", collar: true, prop: "spear",
      bg: ["#5a3d6e", "#8a4f78", "#7fc8e0", "#a8566a"] }),
    farmer: makePortrait({ skin: "#d99a6c", light: "#edb68a", shade: "#b57a50", hat: "hair", hatColor: "#2a1a14", bandColor: "#2f6f69",
      robe: "#6d8a3a", under: "#f6ecdf", collar: true, smile: true,
      bg: ["#c8643b", "#a7643f", "#f6c28b", "#bf7a52"] }),
    wellkeeper: makePortrait({ skin: "#d39a70", light: "#e9b890", shade: "#ae7a52", old: true, hat: "turban", hatColor: "#cdb5c4", bandColor: "#6d5a66",
      brows: "#fff4e6", beard: "#fff4e6", mustache: "#fff4e6", robe: "#a7643f", under: "#e3cfb8", collar: true }),
    soldier: makePortrait({ skin: "#e3aa7e", light: "#f3c9a2", shade: "#c08a60", hat: "helmet", hatColor: "#6d5a66", bandColor: "#c8643b",
      mustache: "#2a1a14", robe: "#6b3346", under: "#8a4f78", collar: true, prop: "spear",
      bg: ["#37325f", "#5a3d6e", "#a8566a", "#6b3659"] }),
    trader: makePortrait({ skin: "#e6ad84", light: "#f5caa5", shade: "#c48c62", hat: "peaked", hatColor: "#c8643b", bandColor: "#f2b35e",
      beard: "#6b4234", mustache: "#6b4234", robe: "#2e6b85", under: "#f2b35e", collar: true, smile: true,
      bg: ["#b8607a", "#f09c70", "#f6c28b", "#f0b53f"] }),
    youngmonk: makePortrait({ skin: "#e8b48a", light: "#f6d2ae", shade: "#c98d63", smile: true,
      robe: "#b5533a", drape: "#f2b35e", seams: "#8a3a28",
      bg: ["#5a3d6e", "#b8607a", "#e08c74", "#cf956a"] }),
    ferryman: makePortrait({ skin: "#c98d63", light: "#dca27a", shade: "#a8704c", hat: "straw", hatColor: "#dc9a6c", bandColor: "#a7643f",
      mustache: "#2a1a14", robe: "#6f6258", under: "#e3cfb8", collar: true,
      bg: ["#8a4f78", "#e08c74", "#b07a4a", "#dc9a6c"] })
  });

  /* ---------- Travel scene: scrolling layers and a walking caravan (section 9.5) ---------- */
  // Waves must repeat every 1280px so each layer can scroll forever without a seam.
  function loopRidge(base, waves) {
    return (x) => waves.reduce((y, [amp, k, phase]) => y + amp * Math.sin((x / (1280 / k)) * Math.PI * 2 + (phase || 0)), base);
  }
  function loopStepped(fn, fill) {
    let d = `M0 ${H}`;
    for (let x = 0; x < 2560; x += 16) d += `V${snap(fn(x + 8), 8)}H${x + 16}`;
    return path(d + `V${H}Z`, fill);
  }
  function loopDots(seed, y0, y1, n, fill, w) {
    const r = rng(seed); let d = "";
    for (let i = 0; i < n; i++) {
      const x = snap(r() * 1272, 8), y = snap(y0 + r() * (y1 - y0), 8);
      d += rectD(x, y, w || 8, 4) + rectD(x + 1280, y, w || 8, 4);
    }
    return path(d, fill);
  }
  function loopPeaks(base, height, spacing, seed, color, snow) {
    const r = rng(seed), peaks = [];
    for (let x = 0; x < 1280; x += spacing) peaks.push([x + r() * spacing * 0.5, base - height * (0.55 + r() * 0.45)]);
    const fn = (x) => {
      let y = base;
      const xx = x % 1280;
      for (const [px, py] of peaks) {
        for (const off of [-1280, 0, 1280]) {
          const dy = py + Math.abs(xx - (px + off)) * 1.1;
          if (dy < y) y = dy;
        }
      }
      return y;
    };
    let out = loopStepped(fn, color);
    if (snow) {
      const line = base - height * 0.62; let d = "";
      for (let x = 0; x < 2560; x += 16) {
        const y = snap(fn(x + 8), 8);
        if (y < line) d += rectD(x, y, 16, Math.min(24, snap(line - y, 8) + 8));
      }
      out += path(d, T("cream"), 'opacity="0.9"');
    }
    return out;
  }
  function loopSprites(xs, draw) { return xs.map((x) => draw(x) + draw(x + 1280)).join(""); }

  const CAMEL_LEGS = ["M3 10h1v4h-1z M5 10h1v4h-1z M12 10h1v4h-1z M14 10h1v4h-1z",
    "M2 10h1v4h-1z M6 10h1v3h-1z M11 10h1v3h-1z M15 10h1v4h-1z"];
  const CAMEL_NOLEGS = CAMEL.body.replace(" M3 10h1v4h-1z M5 10h1v4h-1z M12 10h1v4h-1z M14 10h1v4h-1z", "");
  const PERSON_LEGS = ["M1 7h1v2h-1z M4 7h1v2h-1z", "M2 7h1v2h-1z M3 7h1v2h-1z"];

  function walkingCamel(x, y) {
    const u = 4;
    return sprite(CAMEL_NOLEGS, x, y, u, T("camel")) + sprite(CAMEL.blanket, x, y, u, T("terracotta")) +
      sprite(CAMEL.bags, x, y, u, T("apricot")) +
      `<g class="walk-a">${sprite(CAMEL_LEGS[0], x, y, u, T("camel"))}</g>` +
      `<g class="walk-b">${sprite(CAMEL_LEGS[1], x, y, u, T("camel"))}</g>`;
  }
  function walkingPerson(x, y, robe, staff) {
    const u = 4;
    return sprite(STANDER.skin, x, y, u, "#e8b48a") + sprite(STANDER.robe, x, y, u, robe) +
      (staff ? sprite("M5 0h1v9h-1z", x, y, u, T("trunk")) : "") +
      `<g class="walk-b">${sprite(PERSON_LEGS[0], x, y, u, T("trunk"))}</g>` +
      `<g class="walk-a">${sprite(PERSON_LEGS[1], x, y, u, T("trunk"))}</g>`;
  }
  // people: [{ color, leader }], camels: number
  function walkingCaravan(people, camels, groundY) {
    let out = "", x = 860;
    const lead = people[0];
    out += walkingPerson(x, groundY - 36, lead.color, true);
    x -= 40;
    const rest = people.slice(1);
    const nCamels = Math.min(4, camels);
    for (let i = 0; i < Math.max(nCamels, rest.length); i++) {
      if (i < nCamels) { x -= 84; out += walkingCamel(x, groundY - 56); }
      if (rest[i]) { x -= 30; out += walkingPerson(x, groundY - 36, rest[i].color); }
    }
    return out;
  }

  const NIGHT_SKY = [["sky-night", 260], ["sky-dusk", 400], ["sky-mauve", 800]];
  function travelScene(o) {
    const terrain = o.terrain || "desert", night = !!o.night, winter = o.season === "winter";
    let back = sky(night ? NIGHT_SKY : SKY_DUSK) + stars(night ? 44 : 9, night ? 70 : 30, night ? 360 : 190);
    back += night ? FEATURES.moon({ x: 1060, y: 150, r: 28, bg: T("sky-night") }) : sun(1040, 330, 56);
    let far = "", mid = "", near = "", ground = "", props = "";
    const groundY = 560;
    if (terrain === "desert" || terrain === "hardDesert") {
      far = terrain === "desert"
        ? loopStepped(loopRidge(420, [[26, 2, 0.4], [12, 5, 1.2]]), T("dune-far"))
        : loopStepped(loopRidge(452, [[10, 2, 1], [6, 4, 0.2]]), T("dune-far"));
      mid = loopStepped(loopRidge(476, [[20, 3, 1.8], [8, 8, 0.4]]), T("dune-mid"));
      near = terrain === "desert" ? loopStepped(loopRidge(516, [[16, 2, 2.6], [6, 6, 0.9]]), T("dune-near")) : "";
    } else if (terrain === "corridor") {
      far = loopPeaks(470, 230, 160, 21, T("dune-mid"), true);
      mid = loopStepped(loopRidge(488, [[12, 3, 0.5], [6, 7, 2]]), T("dune-far"));
      props = loopSprites([300, 980], (x) => FEATURES.beacon({ base: 500, towers: [[x, 64]], color: "wall" }));
    } else {
      far = loopStepped(loopRidge(380, [[40, 2, 0.3], [16, 5, 2.2]]), T("cliff"));
      mid = loopStepped(loopRidge(440, [[24, 3, 1.6], [10, 7, 0.8]]), T("cliff-strata"));
      props = loopSprites([200, 760, 1100], (x) => FEATURES.poplars({ base: 520, trees: [[x, 96]] }));
    }
    ground = path(rectD(0, groundY - 40, 2560, H - groundY + 40), T(terrain === "hardDesert" ? "cliff-ledge" : "ground")) +
      loopDots(3, groundY - 32, H, 90, T(winter ? "cream" : "ground-dot"), 8);
    if (terrain === "hardDesert") ground += loopDots(8, groundY - 24, H, 40, T("cliff-strata"), 4) +
      loopSprites([420, 1010], (x) => path(rectD(x, groundY - 48, 24, 8) + rectD(x + 4, groundY - 56, 16, 8) + rectD(x + 8, groundY - 64, 8, 8), T("cliff-strata")));
    const shade = night ? path(rectD(0, 0, 2560, H), T("sky-night"), 'opacity="0.35"') : "";
    return `<svg class="scene travel-scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true">
      ${back}
      <g class="scroll scroll-far">${far}</g>
      <g class="scroll scroll-mid">${mid}${props}</g>
      <g class="scroll scroll-near">${near}</g>
      <g class="scroll scroll-ground">${ground}${shade}</g>
      <g class="caravan">${walkingCaravan(o.people || [{ color: T("terracotta") }], o.camels == null ? 3 : o.camels, groundY + 8)}</g>
    </svg>`;
  }

  function portrait(id, px) {
    const p = PORTRAITS[id]; if (!p) return "";
    const size = px || 288;
    return `<svg class="portrait" viewBox="0 0 32 32" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">` +
      p.map(([c, d]) => `<path d="${d}" fill="${c}"/>`).join("") + `</svg>`;
  }
  function lampFlame(px) {
    const u = px || 3;
    return `<svg class="lamp-flame" viewBox="0 0 8 10" width="${8 * u}" height="${10 * u}" shape-rendering="crispEdges" aria-hidden="true">` +
      `<path d="${FLAME_ICON.outer}" fill="${T("flame")}"/><path d="${FLAME_ICON.core}" fill="${T("apricot")}"/></svg>`;
  }

  window.SPRITES = {
    W, H, T, rng, snap, rectD, path, sprite, icon, ICONS,
    sky, stars, sun, pixelCircle, stepped, ridge, groundAt,
    camel, camelResting, person, campfire, stupa,
    FEATURES, buildScene, titleScene, nightCampScene, portrait, lampFlame, travelScene, makePortrait, PORTRAITS,
    CAMEL, CAMEL_REST, MONK_WALK, STUPA
  };
})();
