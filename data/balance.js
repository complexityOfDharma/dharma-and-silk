/* All tuning numbers in one place: DESIGN.md section 11.
   Playtest balance changes go here; they need no design change. */
window.BALANCE = {
  partySize: 4,
  nameMaxLength: 12,

  // Starting silk by background silk level (1 = low, 2 = medium, 3 = high).
  startingSilk: { 1: 90, 2: 110, 3: 140 },
  merchantCompanionSilk: 20,   // extra silk the Sogdian merchant brings
  interpreterHireCost: 10,     // silk to hire the interpreter

  // Starting supplies before the Kucha bazaar.
  // food = days of food for the whole caravan; water = full skins (waterMax = skins owned).
  start: {
    food: 20, water: 6, waterMax: 6, camels: 3, clothing: 2, medicine: 1, paper: 2,
    sutras: 6, sutraCondition: 100, morale: 70, lamp: 5
  },
  scribeBackgroundExtraSutras: 2,

  // Calendar: the journey begins in spring 400 CE (day of year 80 ≈ March 21).
  // Seasons follow the Chinese solar calendar: spring from ~Feb 4, summer ~May 5,
  // autumn ~Aug 7, winter ~Nov 7 (day of year).
  startYear: 400,
  startDayOfYear: 80,
  seasonStarts: { spring: 35, summer: 125, autumn: 219, winter: 311 },

  // Travel speed in km per day.
  pace: { steady: 12, strenuous: 16, grueling: 20 },
  nightTravelSpeed: 0.8,       // travel at night: slower...
  nightTravelWater: 0.55,      // ...but uses much less water
  scribeSpeed: 0.93,           // the scribe slows the caravan a little
  overloadSpeed: 0.75,         // camels carrying more than they can
  noCamelSpeed: 0.5,
  lostTrailKm: 30,

  // Daily use. Food and water scale with party size (per 5 people).
  foodPerDay: { filling: 0.8, meager: 0.6, bare: 0.4 },
  camelDriverFodder: 1.1,      // camel driver: camels eat extra fodder
  waterPerDay: 0.5,
  summerDesertWater: 1.6,
  winterWater: 0.7,

  // Wells found on the road: daily chance, per terrain. Each find refills this many skins.
  wellChance: { desert: 0.18, hardDesert: 0.07, corridor: 0.45, loess: 0.65 },
  guideWellBonus: 0.18,
  wellRefill: 3,

  // Health points 0–100 → Good ≥ 70, Fair ≥ 45, Poor ≥ 20, Very poor below.
  healthWords: [[70, "good"], [45, "fair"], [20, "poor"], [0, "verypoor"]],
  healthDaily: {
    base: 1, steady: 0, strenuous: -1, grueling: -2.5,
    filling: 0.5, meager: -0.5, bare: -1.5,
    noFood: -5, noWater: -7, coldNoClothing: -2.5, rest: 4, lowMorale: -0.5
  },
  illness: {
    dysentery: { daily: -5, days: 8, label: "dysentery" },
    fever: { daily: -4, days: 6, label: "a fever" },
    chill: { daily: -3, days: 5, label: "a chill" }
  },
  illnessDaysWithMedicine: 3,
  illnessDaysHealerNoMedicine: 3,
  cookIllnessFactor: 0.5,
  veryPoorLeaveChance: 0.2,    // per day in very poor health: leaves to rest at a monastery
  playerCollapseRestDays: 4,

  // Morale 0–100.
  moraleDaily: { grueling: -1, bare: -1, noFood: -3, noWater: -3, rest: 3, monastery: 5 },
  monkMoraleFactor: 0.5,       // the monk halves morale losses
  lowMorale: 25,

  // Camels: carrying capacity in load units.
  camelCapacity: 12, camelDriverCapacity: 3, cookPotsLoad: 4, personCarry: 4,
  load: { food: 0.2, water: 1, clothing: 1, medicine: 0.5, paper: 0.5, sutras: 0.5 },
  camelDieChance: 0.004,       // per camel per travel day when overloaded or sick

  // Bazaar prices in silk (merchant background and Sogdian merchant each take 15% off).
  prices: { food: 0.2, waterMax: 1, camels: 15, clothing: 2, medicine: 4, paper: 2 },
  priceStep: { food: 5, waterMax: 1, camels: 1, clothing: 1, medicine: 1, paper: 1 },
  merchantDiscount: 0.85,
  sellRate: 0.5,
  townPriceUp: { turfan: 1.1, hami: 1.25, dunhuang: 1.15, zhangye: 1.1, guzang: 1.2, changan: 1 },

  // Monasteries and rest.
  lodgingPerPerson: 1,         // silk per person for a monastery stay (monks free; a monk companion gets everyone in free)
  monasteryAlms: 3,            // days of food the monks share when you stay
  youngMonkAlms: 4,            // extra alms for a young monk (background perk)
  monasteryStayDays: 2,
  scribeRepairPerDay: 10,      // sutra condition regained per rest day (uses paper)
  scribeCopyPaper: 2,          // paper to copy one sutra at a monastery
  teachLamp: 1,                // Lamp for teaching at a monastery (once per landmark)

  // Tolls and permits.
  winterLodgingPerPerson: 2,   // tolls, permits, ferry and guide costs live in data/events.js

  // Merchant companion: detours to trade at bazaar towns.
  merchantDetourDays: 1, merchantDetourSilk: 3,

  // Events.
  eventChancePerDay: 0.085,
  caravanToastChance: 0.05,
  kindnessAfterNoFoodDays: 3,

  // Lamp score (section 7): sutras × condition + companions who arrived + acts of generosity.
  score: { perSutraAtFull: 10, perCompanion: 10, perGenerosity: 5 }
};
