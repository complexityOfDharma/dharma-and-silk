/* Random events and fixed story events: DESIGN.md sections 3 and 6.
   Each event: id, title, text, choices, which roles change the outcome (helpers),
   which seasons and terrain it can happen in, and a "What really happened" note.

   Choices: { text, effects, result, requires: role, outcomes: [{ p, effects, result }] }
   Helpers: if a companion with that role is traveling, their outcome replaces the choices.
   Effects: food, water, waterMax, camels, clothing, medicine, paper, silk, sutras,
            sutraCondition, morale, lamp, health, days, km, detourKm, generosity, helper, illness.
   Text can use {guide}, {healer}… (the names the player chose), {player} and {name}. */

window.EVENTS = {
  sandstorm: {
    id: "sandstorm", title: "Sandstorm", icon: "drop", weight: 3,
    seasons: ["spring", "summer", "autumn"], terrain: ["desert", "hardDesert"],
    text: "The sky turns brown, then black. A wall of sand rolls toward the caravan, roaring like the sea.",
    choices: [
      { text: "Stop, kneel the camels and cover the sutras", effects: { days: 2 },
        result: "You wrap the sutra bundles in felt and shelter behind the kneeling camels. Two days later the air clears. The scrolls are safe." },
      { text: "Keep walking through it", effects: { sutraCondition: -15, morale: -4 },
        result: "Sand gets into everything, including the sutra bundles. Some pages are scratched and faded." }
    ],
    history: "Spring and summer storms in the Taklamakan Desert can turn day into night. Today people call them kara-buran, the black storm. Travelers learned to stop, kneel their camels and wait them out."
  },

  dry_well: {
    id: "dry_well", title: "The well is dry", icon: "drop", weight: 3,
    terrain: ["desert", "hardDesert", "corridor"],
    text: "You reach the well you were counting on. At the bottom there is only cracked mud.",
    helpers: [{ role: "guide", effects: { water: 3 },
      text: "{guide} shades their eyes, points to a line of tamarisk bushes, and leads you to a second well an hour away." }],
    choices: [
      { text: "Dig deeper", outcomes: [
        { p: 0.5, effects: { days: 1, water: 2 }, result: "After a day of digging, muddy water seeps in. You fill two skins." },
        { p: 0.5, effects: { days: 1 }, result: "You dig all day and find only damp sand." }] },
      { text: "Save your strength and move on", effects: { morale: -3 }, result: "You tighten the stoppers on your water skins and walk on." }
    ],
    history: "Oasis kingdoms dug and looked after wells along the caravan roads, but blowing sand could fill a well, and a dry year could empty it. Guides who knew the hidden springs were worth their weight in silk."
  },

  heat: {
    id: "heat", title: "Desert heat", icon: "drop", weight: 3,
    seasons: ["summer"], terrain: ["desert", "hardDesert"],
    text: "By midday the sand is too hot to touch. The camels groan and everyone is drinking more than they should.",
    choices: [
      { text: "Travel at night from now on", effects: { night: 1 },
        result: "You rest in the shade through the day and walk under the stars. It's slower, but you use much less water. (You can change this in the travel controls.)" },
      { text: "Push on through the day", effects: { water: -1, health: -5 },
        result: "You make good distance, but everyone is sunburned and thirsty." }
    ],
    history: "In summer, caravans crossing the Tarim Basin often traveled at night and rested through the heat of the day, finding their way by the stars."
  },

  cold_night: {
    id: "cold_night", title: "A freezing night", icon: "clothing", weight: 2, special: "coldNight",
    seasons: ["spring", "autumn", "winter"],
    text: "The sun sets and the heat vanishes. By midnight there is frost on the camels' blankets.",
    choices: [],
    history: "Deserts lose heat fast after sunset. Even after a hot day, nights in the Taklamakan and the Gobi could drop below freezing, so travelers carried felt coats and blankets."
  },

  lame_camel: {
    id: "lame_camel", title: "A lame camel", icon: "camel", weight: 2,
    text: "One of the camels is limping badly and falls behind the line.",
    helpers: [{ role: "cameldriver", effects: {},
      text: "{cameldriver} lifts the camel's foot, pulls out a sharp stone, and packs the cut with salve. By evening it's walking normally." }],
    choices: [
      { text: "Rest two days so it can heal", effects: { days: 2 }, result: "The camel rests and its foot heals." },
      { text: "Trade it to a herder for silk", effects: { camels: -1, silk: 6 }, result: "A herder takes the camel and gives you a little silk. Your other camels carry more now." }
    ],
    history: "Two-humped Bactrian camels could carry heavy loads for weeks with little water, but stones and gravel cut their soft foot pads. Camel drivers were skilled animal doctors."
  },

  dysentery: {
    id: "dysentery", title: "Dysentery", icon: "medicine", weight: 2, special: "illness", illness: "dysentery", target: true,
    text: "{name} has dysentery from bad water. Their stomach cramps and they can barely stay on their feet.",
    choices: [
      { text: "Give them medicine", effects: { medicine: -1, illDays: 3 }, result: "The medicine helps. {name} should recover in a few days." },
      { text: "Stop and rest for two days", effects: { days: 2 }, result: "You make camp and care for {name}. Rest helps, but they are still sick." },
      { text: "Keep going and hope it passes", effects: {}, result: "{name} rides on a camel, wrapped in a blanket. It will be a hard week." }
    ],
    history: "Illness from dirty water was one of the greatest dangers on any long journey. Monasteries along the Silk Road often cared for sick travelers, and some monks trained as healers."
  },

  fever: {
    id: "fever", title: "Fever", icon: "medicine", weight: 1, special: "illness", illness: "fever", target: true,
    text: "{name} wakes up burning with fever and shivering at the same time.",
    choices: [
      { text: "Give them medicine", effects: { medicine: -1, illDays: 3 }, result: "The fever breaks by the next evening." },
      { text: "Rest a day", effects: { days: 1 }, result: "{name} sleeps in the shade of the camels. The fever lingers." },
      { text: "Keep going", effects: {}, result: "{name} rides a camel and sips water all day." }
    ],
    history: "Travelers carried herbs and remedies bought in oasis markets. Many medical texts found at Dunhuang and Turfan list cures for fevers and stomach illness."
  },

  oasis_toll: {
    id: "oasis_toll", title: "Toll at an oasis", icon: "silk", weight: 2,
    terrain: ["desert", "hardDesert", "corridor"],
    text: "Guards from a small oasis kingdom block the road. Every caravan must pay a toll to pass.",
    helpers: [
      { role: "interpreter", effects: { silk: -1 }, text: "{interpreter} greets the guards in their own language and jokes with their captain. The toll shrinks to almost nothing." },
      { role: "merchant", effects: { silk: -2 }, text: "{merchant} knows the captain from an earlier trip and bargains the toll down." }
    ],
    choices: [
      { text: "Pay the toll", effects: { silk: -4 }, result: "The guards count your silk and wave you through." },
      { text: "Take the long way around", effects: { days: 2, detourKm: 20 }, result: "You leave the road and circle around the oasis. It costs you two days." }
    ],
    history: "Oasis kingdoms grew rich by taxing the caravans that passed through. In return they kept the wells and roads safe and ran markets and inns."
  },

  checkpoint: {
    id: "checkpoint", title: "Border checkpoint", icon: "scroll", weight: 2,
    terrain: ["corridor", "loess"],
    text: "Soldiers at a gate tower ask for your travel permit and look closely at your camels' loads.",
    helpers: [{ role: "interpreter", effects: {}, text: "{interpreter} explains in careful Chinese that you are carrying sutras for the monasteries of Chang'an. The officer stamps your pass and lets you through." }],
    choices: [
      { text: "Show the sutras and explain", outcomes: [
        { p: 0.6, effects: {}, result: "The officer is a Buddhist himself. He bows to the sutras and lets you pass." },
        { p: 0.4, effects: { days: 3 }, result: "Nobody can understand you. You wait three days until someone who speaks your language arrives." }] },
      { text: "Pay a fee to pass quickly", effects: { silk: -5 }, result: "The fee is paid and the gate opens." }
    ],
    history: "Travelers in China needed written travel passes, checked at border posts. Passes and travel records written on strips of wood survive from Han dynasty forts in the desert near Dunhuang."
  },

  food_spoils: {
    id: "food_spoils", title: "Food spoils", icon: "food", weight: 2, special: "foodSpoils",
    seasons: ["spring", "summer", "autumn"],
    text: "You open a food sack and find the flatbread moldy and the dried fruit crawling with beetles.",
    helpers: [{ role: "cook", effects: {}, text: "{cook} had packed the food in sealed jars with salt and ash. Only a little is spoiled, and {cook} turns it into soup for the camels." }],
    choices: [],
    history: "Caravans carried food that could last: dried fruit, hard flatbread, grain, cheese and dried meat. Keeping it dry and free of pests was the cook's constant battle."
  },

  lost_trail: {
    id: "lost_trail", title: "Lost the trail", icon: "compass", weight: 2,
    terrain: ["desert", "hardDesert"],
    text: "The wind has wiped out the tracks. Every dune looks the same, and nobody is sure which way is east.",
    helpers: [{ role: "guide", effects: {}, text: "{guide} climbs a dune, finds a pile of stones that marks the old road, and turns the caravan back onto the trail." }],
    choices: [
      { text: "Retrace your steps to the last marker", effects: { km: -30, days: 1 }, result: "You walk back to the last stone marker and start again. You lost a day." },
      { text: "Steer by the sun and hope", outcomes: [
        { p: 0.5, effects: {}, result: "Luck is with you: by evening you spot the trail again." },
        { p: 0.5, effects: { days: 3, water: -2 }, result: "You wander for three days before finding the trail. Water is running low." }] }
    ],
    history: "Desert roads were marked with piles of stones and followed from well to well. When blowing sand hid the way, travelers could wander for days, which is why guides who knew the desert were so valued."
  },

  struggling_caravan: {
    id: "struggling_caravan", title: "A caravan asks for water", icon: "drop", weight: 2,
    terrain: ["desert", "hardDesert", "corridor"],
    text: "A small caravan staggers toward you. Their water skins are empty, and a child is crying from thirst.",
    choices: [
      { text: "Share two skins of water", effects: { water: -2, lamp: 2, generosity: 1, morale: 3, helper: "A thirsty caravan from Khotan" },
        result: "They drink and bow deeply. Their leader gives you his blessing and a name to call on in Chang'an." },
      { text: "You can't spare any", effects: { morale: -4 }, result: "You walk on in silence. Nobody feels good about it." }
    ],
    history: "The Buddha taught generosity (dana) as the first of the perfections. Along the Silk Road, travelers of many faiths depended on each other's help to survive."
  },

  monastery_oasis: {
    id: "monastery_oasis", title: "A monastery at an oasis", icon: "bowl", weight: 2, special: "lodging",
    text: "Beside a small spring stands a monastery with a painted stupa. The monks invite your caravan to stay.",
    choices: [
      { text: "Stay two nights and help with chores", lodging: true, effects: { days: 2, health: 10, morale: 6, lamp: 1, food: 3 },
        result: "You rest, share meals with the monks, and join the evening chanting. They send you off with alms food for the road." },
      { text: "{scribe} copies a sutra with the monks", requires: "scribe", effects: { paper: -2, sutras: 1, days: 1, lamp: 1 },
        result: "{scribe} works by lamplight with the monastery's scribes. You carry one more sutra east." },
      { text: "Thank them and move on", effects: { morale: 2 }, result: "The monks give you their blessing for the road." }
    ],
    history: "Monasteries dotted the Silk Road oases. They were places of study and worship, but also inns, hospitals, libraries and even banks for travelers."
  },

  scroll_damage: {
    id: "scroll_damage", title: "Flash flood", icon: "scroll", weight: 2,
    seasons: ["spring", "summer"], terrain: ["corridor", "loess"],
    text: "A storm in the mountains sends a rush of muddy water down a dry riverbed, right through your camp.",
    helpers: [{ role: "scribe", effects: { sutraCondition: -5, paper: -1 }, text: "{scribe} grabs the sutra bundles first and dries each page by the fire. Only a few pages are smudged." }],
    choices: [
      { text: "Save the sutras first", effects: { sutraCondition: -10, food: -3 }, result: "You save the sutras, but the water carries off some food." },
      { text: "Save the food first", effects: { sutraCondition: -25 }, result: "The food is safe, but water soaks the sutra bundles." }
    ],
    history: "Sutras were written on paper, birch bark or palm leaves. Water, fire and insects were their enemies. Scribes constantly recopied old texts before they fell apart."
  },

  traders: {
    id: "traders", title: "Traders on the road", icon: "scales", weight: 2,
    text: "At a caravanserai you meet a Sogdian caravan heading west. They have food, water skins and warm coats to sell.",
    choices: [
      { text: "Visit the traders", openMarket: true, effects: {}, result: "You spread out a blanket and start to bargain." },
      { text: "Keep going", effects: {}, result: "You wave goodbye and walk on." }
    ],
    history: "Sogdian merchants from Samarkand and Bukhara ran trading networks all along the Silk Road. Letters written by Sogdian traders around 313 CE were found in a watchtower near Dunhuang."
  }
};

/* Fixed story events (section 3) and events the engine triggers itself. */
window.STORY_EVENTS = {
  toll_agni: {
    id: "toll_agni", title: "The toll at Agni", icon: "silk",
    text: "The guards of Agni stop every caravan at the gate. The toll is set by the king.",
    helpers: [{ role: "interpreter", effects: { silk: -2 }, text: "{interpreter} speaks to the gatekeeper in the language of Agni, and the toll is cut in half." }],
    choices: [
      { text: "Pay the toll", effects: { silk: -5 }, result: "You pay, and the guards wave you into the town." },
      { text: "Offer to pay in food instead", effects: { food: -8 }, result: "The gatekeeper takes eight days of food for the palace kitchens." }
    ],
    history: "Agni (Karashahr) was an independent oasis kingdom that controlled the road between Kucha and Turfan. Its kings grew rich on caravan tolls."
  },

  guide_home: {
    id: "guide_home", title: "{guide} is home", icon: "compass",
    text: "Agni is {guide}'s home. Their family runs out to meet them. {guide} says they will stay here, unless you can pay them to guide you all the way to Chang'an.",
    choices: [
      { text: "Pay {guide} to stay with the caravan", effects: { silk: -10 }, result: "{guide} hugs their family goodbye and promises to come home rich with stories." },
      { text: "Thank {guide} and say goodbye", effects: { leave: "guide", leaveNote: "went home to Agni", morale: -3 },
        result: "You thank {guide} for guiding you safely. Their family gives you bread and melons for the road." }
    ],
    history: "Local guides knew the hidden wells and safe routes of their own region. Caravans often hired a new guide at each oasis, since few people knew the whole road."
  },

  permit_jiuquan: {
    id: "permit_jiuquan", title: "Border permit", icon: "scroll",
    text: "At Jiuquan every traveler entering the Hexi Corridor needs a permit from the local officials.",
    helpers: [{ role: "interpreter", effects: { silk: -3 }, text: "{interpreter} writes the request in proper Chinese. The official approves it the same day at half the usual fee." }],
    choices: [
      { text: "Pay for a permit", effects: { silk: -6 }, result: "After a day of waiting, you have your permit." },
      { text: "Wait for a cheaper permit", effects: { days: 5, silk: -2 }, result: "You wait five days in line with other caravans for a cheaper permit." }
    ],
    history: "Rulers of the Hexi Corridor controlled who could travel east into China. Officials wrote travel passes listing each traveler, their animals and their goods."
  },

  winter_dunhuang: {
    id: "winter_dunhuang", title: "Winter at Dunhuang", icon: "clothing", special: "winter",
    text: "Armies are fighting on the road east, and no caravans are getting through this year. Winter will follow. The monks of Dunhuang invite you to stay until spring. Monks stay for free; everyone else pays for lodging.",
    choices: [
      { text: "Stay the winter and help at the monastery", effects: { lamp: 3, food: 15 }, result: "You spend the winter sweeping courtyards, carrying water and chanting with the monks. When the ice melts, it is spring of 401, and the monks send you off with food for the road." }
    ],
    history: "Travelers on the Silk Road often waited out the winter in an oasis town. Faxian's own journey took fifteen years, partly because of long stops like this."
  },

  hexi_corridor: {
    id: "hexi_corridor", title: "Armies on the road", icon: "compass",
    text: "Soldiers of rival kingdoms are camped across the road ahead. Travelers say fighting could break out any day.",
    choices: [
      { text: "Wait for the armies to move on", effects: { days: 10, morale: -3 }, result: "You wait ten days in a village. At last the soldiers march away and the road is open." },
      { text: "Detour through the hills", outcomes: [
        { p: 0.65, effects: { detourKm: 60, food: -3 }, result: "You climb into the hills and around the camps. It's a longer road, but you stay out of trouble." },
        { p: 0.35, effects: { detourKm: 90, food: -3, days: 3 }, result: "The hill paths are confusing and you get lost for three days before finding your way back." }] }
    ],
    history: "Around 400 CE the Hexi Corridor was split between several warring kingdoms: the Later Liang, Northern Liang, Southern Liang and Western Liang. Travelers often had to wait or go around."
  },

  guzang_siege: {
    id: "guzang_siege", title: "The siege of Guzang", icon: "compass",
    text: "The army of the Later Qin has surrounded Guzang. Nobody may enter or leave until the city gives up.",
    choices: [
      { text: "Camp with the other caravans and wait", effects: { food: -10, morale: -4 },
        result: "Months pass. In the autumn of 401, the ruler of Guzang surrenders to the Later Qin." },
      { text: "{monk} and you help at a monastery outside the walls", requires: "monk", effects: { lamp: 3, morale: 4 },
        result: "You wait out the siege at a small monastery, teaching children to chant. In the autumn of 401, Guzang surrenders." }
    ],
    special: "siege",
    history: "In 401 the Later Qin army attacked Liangzhou, and its ruler, Lü Long, surrendered. The Later Qin emperor, Yao Xing, had wanted Kumarajiva for years, and now the monk was escorted to Chang'an. Your caravan following the army is part of your story."
  },

  follow_army: {
    id: "follow_army", title: "In the army's wake", icon: "camel", invented: true,
    text: "Kumarajiva, the famous monk of Kucha, is leaving Guzang for Chang'an with an escort of soldiers. The road behind the army will be the safest road east.",
    choices: [
      { text: "Follow the army east", effects: { flag: "followArmy", morale: 5, food: 8 }, result: "You fall in behind the army's baggage carts. Bandits won't come near a road this well guarded, and the army cooks sell you their leftover grain cheaply." }
    ],
    history: "Kumarajiva was taken from Kucha to Liangzhou in 384 and held there for about seventeen years. In 401 the Later Qin brought him to Chang'an, where he arrived at the very end of that year."
  },

  yellow_river: {
    id: "yellow_river", title: "The Yellow River", icon: "drop", special: "river",
    text: "The Yellow River is wide and fast here, full of yellow silt.",
    choices: [
      { text: "Pay the ferry", effects: { silk: -4 }, result: "The ferrymen take your caravan across in three trips. Everyone makes it safely." },
      { text: "Cross on the winter ice", when: (s) => window.ENGINE.dateInfo(s).season === "winter", outcomes: [
        { p: 0.75, effects: {}, result: "The ice creaks and groans, but it holds. You cross for free." },
        { p: 0.25, effects: { camels: -1, food: -5, morale: -5 }, result: "Halfway across, the ice cracks under one camel. You save the sutras, but lose the camel and some food." }] },
      { text: "Wait for the river to freeze", when: (s) => window.ENGINE.dateInfo(s).season !== "winter", effects: { flag: "waitIce" },
        result: "You camp by the river until the ice is thick enough to cross." }
    ],
    history: "The Yellow River froze in the coldest weeks of winter, and people crossed it on foot. The rest of the year, ferries carried travelers, animals and goods across."
  },

  kindness: {
    id: "kindness", title: "Kindness of strangers", icon: "food",
    text: "Your food is gone. As you sit by an empty cooking pot, a caravan of traders stops beside you and opens their own food sacks.",
    choices: [
      { text: "Accept their help with thanks", effects: { food: 8, morale: 5, helper: "Traders who shared their food" },
        result: "They share bread, cheese and dried apricots, and ask nothing in return. Someday, you'll do the same for someone else." }
    ],
    history: "No one crossed the Silk Road alone. Caravans of different peoples and faiths helped each other with food, water and news."
  },

  collapse: {
    id: "collapse", title: "You collapse", icon: "medicine", special: "collapse",
    text: "{player} is too weak to walk. Your companions make camp and care for you.",
    choices: [
      { text: "Rest until you can stand", effects: {}, result: "After several days you can walk again, slowly." }
    ],
    history: "Travelers relied completely on their companions. In the gratitude scroll at the end of your journey, you'll see everyone who carried you."
  }
};

/* Other caravans carry the teaching too (section 5): toasts during travel, LAMP +1 each. */
window.CARAVAN_TOASTS = [
  "Monks from Khotan reached Chang'an with new sutras",
  "A Sogdian caravan carried a painted Buddha image east",
  "Scribes in Liangzhou copied a sutra for a village temple",
  "Pilgrims from Gandhara reached Dunhuang",
  "A merchant paid for a new cave at Mogao",
  "Nuns in Chang'an welcomed new students",
  "A monk from Kashmir arrived at Chang'an to translate",
  "Villagers near Turfan built a small stupa",
  "Monks in Kucha finished copying a Vinaya text",
  "Travelers shared water with a family on the road"
];
