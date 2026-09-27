/* All tuning numbers in one place: DESIGN.md section 11.
   Playtest balance changes go here; they need no design change. */
window.BALANCE = {
  partySize: 4,
  nameMaxLength: 12,

  // Starting silk by background silk level (1 = low, 2 = medium, 3 = high).
  startingSilk: { 1: 40, 2: 70, 3: 110 },
  merchantCompanionSilk: 20,   // extra silk the Sogdian merchant brings
  interpreterHireCost: 10,     // silk to hire the interpreter

  // Starting supplies before the Kucha bazaar.
  start: {
    food: 30, water: 6, camels: 3, clothing: 2, medicine: 1, paper: 2,
    sutras: 6, sutraCondition: 100, morale: 70, lamp: 10
  },
  scribeBackgroundExtraSutras: 2,

  // Calendar: the journey begins in spring 400 CE.
  startYear: 400,
  startDayOfYear: 80
};
