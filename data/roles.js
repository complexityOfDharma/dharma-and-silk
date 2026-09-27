/* Player backgrounds and companion roles: DESIGN.md section 4.
   Plain script that sets globals, so the game runs from file:// with no server. */
window.BACKGROUNDS = [
  { id: "monk",     title: "Young monk",        perk: "Free food and lodging at monasteries", silkLevel: 1 },
  { id: "merchant", title: "Merchant's child",  perk: "Better prices at bazaars",             silkLevel: 3 },
  { id: "scribe",   title: "Apprentice scribe", perk: "Starts with 2 extra sutra copies",     silkLevel: 2 }
];

/* bonus/cost: short card text. gift: chip text in "Caravan gifts".
   color: avatar tile color in party lists. icon: key into SPRITES.icons. */
window.ROLES = [
  { id: "monk",        role: "Monk",             defaultName: "Punya",       icon: "bowl",
    bonus: "Free monastery lodging; lifts spirits", cost: "Won't trade or handle money",
    gift: "Free lodging", color: "#c8643b" },
  { id: "merchant",    role: "Sogdian merchant", defaultName: "Nanaivandak", icon: "scales",
    bonus: "Better prices; extra silk", cost: "Wants detours to trade towns",
    gift: "Better prices", color: "#8a5210" },
  { id: "cook",        role: "Cook",             defaultName: "Suvarna",     icon: "pot",
    bonus: "Food keeps longer; less illness", cost: "Heavy pots fill camel space",
    gift: "Food keeps longer", color: "#a8566a" },
  { id: "scribe",      role: "Scribe",           defaultName: "Dharmika",    icon: "brush",
    bonus: "Repairs and copies sutras", cost: "Slower; uses paper and ink",
    gift: "Scroll repair", color: "#2f6f69" },
  { id: "interpreter", role: "Interpreter",      defaultName: "Kumudā",      icon: "speech",
    bonus: "Faster, cheaper tolls and checkpoints", cost: "Costs silk to hire",
    gift: "Cheaper tolls", color: "#3a5a95" },
  { id: "guide",       role: "Guide",            defaultName: "Arshi",       icon: "compass",
    bonus: "Finds water; rarely gets lost", cost: "Leaves at home in Agni unless paid",
    gift: "Finds water", color: "#2e6b85" },
  { id: "cameldriver", role: "Camel driver",     defaultName: "Kanaka",      icon: "camel",
    bonus: "Healthy camels that carry more", cost: "Camels need extra fodder",
    gift: "Strong camels", color: "#5b3346" },
  { id: "healer",      role: "Healer",           defaultName: "Vasu",        icon: "leaf",
    bonus: "Cures illness, even dysentery", cost: "Uses medicine",
    gift: "Cures illness", color: "#6d8a3a" }
];

/* Warning chips for gaps in the party (shown in "Caravan gifts"). */
window.PARTY_WARNINGS = [
  { missing: "healer", text: "No healer: dysentery is dangerous!" },
  { missing: "guide",  text: "No guide: wells are hard to find" }
];
