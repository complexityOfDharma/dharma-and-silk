/* Game state. Save/load (slots, autosave, save codes) arrives in phase 4;
   for now this builds a new game from the party setup. */
(function () {
  "use strict";

  const SAVE_VERSION = 1;

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
      player: { name: setup.playerName, background: setup.background, health: "good" },
      party: setup.companions.map((c) => ({
        role: c.role, name: c.name || roleById(c.role).defaultName, health: "good", status: "traveling"
      })),
      supplies: {
        food: B.start.food, water: B.start.water, camels: B.start.camels, clothing: B.start.clothing,
        medicine: B.start.medicine, paper: B.start.paper, silk: Math.max(0, silk)
      },
      sutras: { count: sutras, condition: B.start.sutraCondition },
      morale: B.start.morale,
      lamp: B.start.lamp,
      pace: "steady",
      rations: "filling",
      landmark: 0,
      kmSinceLandmark: 0,
      year: B.startYear,
      dayOfYear: B.startDayOfYear,
      day: 1,
      helpers: [],
      generosity: 0,
      log: []
    };
  }

  function hasRole(state, role) {
    return state.party.some((p) => p.role === role && p.status === "traveling");
  }

  window.STATE = { SAVE_VERSION, newGame, hasRole, roleById, current: null };
})();
