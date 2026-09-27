/* Dialogue scenes: DESIGN.md sections 3, 4 and 10.
   A scene has lines (shown one at a time) and up to 4 numbered choices.
   Choice: { text, requires: role, effects, next: sceneId, reply: "closing line", end: true }
   A scene with `back` shows that scene's choices again after its lines.
   `invented: true` shows the "Invented meeting · Real people" chip.
   {guide}, {scribe}… are replaced with the names the player gave those companions. */
var DIALOGUES = window.DIALOGUES = {};

/* ---------- Kucha: farewell from the monks of your monastery ---------- */
DIALOGUES.farewell_kucha = {
  speaker: "Elder monk", native: "", portrait: "elder",
  subtitle: "Teacher at your monastery in Kucha",
  invented: false,
  history: "Kucha had many monasteries and thousands of monks. Your monastery and its elder are part of your story.",
  historyTitle: "Kucha's monks",
  historyFull: "Kucha was one of the most important Buddhist kingdoms of Central Asia. Chinese travelers later counted more than a hundred monasteries and thousands of monks there. Its most famous son, the monk Kumarajiva, was taken to China by the general Lü Guang's army in 384.",
  lines: [
    "{player}, the sangha has talked it over. We want you to carry these sutras to Chang'an.",
    "Our teacher Kumarajiva was taken east many years ago. China's monasteries want the teachings, and they need more texts than one monk can carry.",
    "No single person sends you. The whole community does. And no single person will get them there. Trust your companions."
  ],
  choices: [
    { text: "Promise to carry them safely", effects: { morale: 5 },
      reply: "Go gently. Every step you take, you take for all of us.", end: true },
    { text: "Ask what the sutras teach", next: "farewell_sutras" },
    { text: "{monk} asks for a blessing for the road", requires: "monk", effects: { morale: 8 },
      reply: "The elder chants a blessing over {monk} and the whole caravan. Even the camels seem calmer.", end: true }
  ]
};
DIALOGUES.farewell_sutras = {
  speaker: "Elder monk", native: "", portrait: "elder", subtitle: "Teacher at your monastery in Kucha",
  invented: false, history: DIALOGUES.farewell_kucha.history, historyTitle: "Kucha's monks", historyFull: DIALOGUES.farewell_kucha.historyFull,
  lines: [
    "Some teach kindness and wisdom. One tells of Amida, the Buddha of Immeasurable Light, and a Pure Land where all beings are welcome.",
    "Keep them dry, keep them safe, and if a monastery asks, let them be copied. A sutra that is shared is never lost."
  ],
  back: "farewell_kucha"
};

/* ---------- Dunhuang: meeting Faxian (the design canvas's first node) ---------- */
DIALOGUES.faxian_dunhuang = {
  speaker: "Faxian", native: "法顯", portrait: "faxian",
  subtitle: "Monk of Chang'an, in his sixties · heading west to India",
  invented: true,
  history: "Faxian passed through Dunhuang in 400 CE. Its ruler, Li Gao, supplied his desert crossing. Your meeting is invented.",
  historyTitle: "Faxian's journey",
  historyFull: "Faxian left Chang'an in 399, already in his sixties, to find complete copies of the Vinaya, the rules for monks and nuns. He crossed the desert from Dunhuang to Shanshan, passed through Agni and Khotan, crossed the Pamir mountains, and spent years in India and Sri Lanka. He sailed home and reached China in 412. His book, A Record of Buddhist Kingdoms, is one of our best descriptions of the Silk Road around 400 CE.",
  lines: [
    "You've come from Kucha? Then you have already crossed the desert we are about to enter.",
    "Li Gao, lord of Dunhuang, gave us food for the road, but none of us knows where the wells are. We go to India for the full rules for monks. China's copies are incomplete."
  ],
  choices: [
    { text: "Share water and dried fruit for his journey", effects: { water: -2, lamp: 3, generosity: 1 },
      reply: "Faxian presses his palms together. \"May your road east be as kind as you have been to us.\"", end: true },
    { text: "{guide} describes the wells on the road to Agni", requires: "guide", effects: { lamp: 2 },
      reply: "Faxian's companions write down every word. \"We will think of {guide} at every well.\"", end: true },
    { text: "Ask why he would travel so far at his age", next: "faxian_why" },
    { text: "Wish them a safe journey and move on",
      reply: "Faxian bows. \"Then we are both carrying the teaching, just in different directions.\"", end: true }
  ]
};
DIALOGUES.faxian_why = {
  speaker: "Faxian", native: "法顯", portrait: "faxian", subtitle: DIALOGUES.faxian_dunhuang.subtitle,
  invented: true, history: DIALOGUES.faxian_dunhuang.history, historyTitle: "Faxian's journey", historyFull: DIALOGUES.faxian_dunhuang.historyFull,
  lines: [
    "In China we have many sutras, but the Vinaya, the rules for how monks and nuns live together, reached us only in pieces.",
    "Without the full rules, how can a sangha live well? So we go to find them, even at my age.",
    "I may not come back. But the texts will."
  ],
  back: "faxian_dunhuang"
};

/* ---------- Dunhuang: Li Gao ---------- */
DIALOGUES.talk_dunhuang = {
  speaker: "Li Gao", native: "李暠", portrait: "ligao",
  subtitle: "Lord of Dunhuang",
  invented: true,
  history: "Li Gao founded the Western Liang kingdom at Dunhuang in 400 CE and was known as a scholar. Your meeting is invented.",
  historyTitle: "Li Gao of Dunhuang",
  historyFull: "Li Gao (his name is also read Li Hao) was the governor of Dunhuang who, in 400 CE, declared his own kingdom, the Western Liang. He loved learning and poetry. Faxian's record says that the governor of Dunhuang supplied Faxian's party for their desert crossing.",
  lines: [
    "A caravan from Kucha! Every road east and west meets here at Dunhuang.",
    "This year I have declared my own kingdom. I would rather rule by learning than by war, though my neighbors may not agree."
  ],
  choices: [
    { text: "Ask about the road east",
      reply: "\"Armies are fighting in the Hexi Corridor. Rest here through the winter, and travel in spring.\"", end: true },
    { text: "{scribe} offers a copied sutra for Dunhuang's monks", requires: "scribe", effects: { paper: -2, lamp: 2, generosity: 1, helper: "Li Gao, lord of Dunhuang" },
      reply: "Li Gao reads the first lines aloud. \"Dunhuang will not forget this gift.\"", end: true },
    { text: "Thank him and take your leave", reply: "Li Gao nods and returns to his scrolls.", end: true }
  ]
};

/* ---------- Chang'an: Kumarajiva and the translation hall ---------- */
DIALOGUES.kumarajiva_changan = {
  speaker: "Kumarajiva", native: "鳩摩羅什", portrait: "kumarajiva",
  subtitle: "Monk of Kucha · leader of the translation hall",
  invented: true,
  history: "Kumarajiva reached Chang'an at the end of 401. In 402 his team translated the Amida Sutra. Delivering your sutras to the hall is your story.",
  historyTitle: "Kumarajiva's translation hall",
  historyFull: "Kumarajiva was born in Kucha to a Kuchean princess and an Indian father. After seventeen years held in Liangzhou, he was brought to Chang'an by Emperor Yao Xing. With hundreds of monks helping, he translated about 35 texts into clear, beautiful Chinese. His translation of the Amida Sutra (402) is the one Shin Buddhist temples still chant today.",
  lines: [
    "You've come all the way from Kucha? Then you have walked the road I was carried along.",
    "Here in the Xiaoyao Garden, hundreds of monks help me turn the sutras into Chinese. No one can do it alone. Every line is talked over by many.",
    "This year we will translate the sutra of Amida, the Buddha of Immeasurable Light."
  ],
  choices: [
    { text: "Offer your sutras to the translation hall",
      reply: "Kumarajiva bows to the bundles you carried across the desert. \"These came through many hands. Now they will pass through many more.\"", end: true, endGame: true },
    { text: "{scribe} offers to help copy the translations", requires: "scribe", effects: { lamp: 3 },
      reply: "Kumarajiva smiles. \"A good scribe is a treasure. Sit here, beside the others.\" You give him your sutras, too.", end: true, endGame: true }
  ]
};

/* ---------- Locals at each landmark (Talk) ---------- */
DIALOGUES.talk_karashahr = {
  speaker: "Gatekeeper of Agni", native: "", portrait: "guard", subtitle: "Keeps the west gate of Agni",
  invented: false, history: "Agni (Karashahr) was an oasis kingdom beside Bosten Lake. Its people spoke a language called Tocharian A.",
  historyTitle: "The people of Agni",
  historyFull: "The people of Agni and Kucha spoke Tocharian languages, related to languages spoken far to the west in Europe. Many Buddhist texts written in Tocharian have been found in the ruins of their monasteries.",
  lines: [
    "Heading east? Keep the lake on your right and the mountains on your left.",
    "The road to Turfan is dry and hot. Fill every water skin you own before you leave."
  ],
  choices: [
    { text: "{interpreter} chats with him in his own language", requires: "interpreter", effects: { morale: 3 },
      reply: "The gatekeeper laughs and gives you a bag of dried apricots. \"It's not often a stranger speaks our tongue!\"", end: true },
    { text: "Thank him", reply: "He waves you on with his spear.", end: true }
  ]
};
DIALOGUES.talk_turfan = {
  speaker: "Farmer of Gaochang", native: "", portrait: "farmer", subtitle: "Grows grapes below the Flaming Mountains",
  invented: false, history: "Turfan's farmers grew grapes and cotton in one of the hottest, lowest places in Asia.",
  historyTitle: "The Turfan basin",
  historyFull: "Parts of the Turfan basin lie below sea level, and summer days can be fiercely hot. Farmers watered their fields with snowmelt from the mountains. Dry air in the basin preserved thousands of documents that tell us about daily life on the Silk Road.",
  lines: [
    "Too hot for you? This is nothing. Wait until midsummer.",
    "If you travel east in summer, walk at night. The sand will burn your camels' feet at noon."
  ],
  choices: [
    { text: "Buy a basket of grapes for the caravan", effects: { silk: -1, morale: 5 },
      reply: "The grapes are sweet and cool. Everyone cheers up.", end: true },
    { text: "Thank the farmer", reply: "\"Safe travels! May the wells be full.\"", end: true }
  ]
};
DIALOGUES.talk_hami = {
  speaker: "Well-keeper of Hami", native: "", portrait: "wellkeeper", subtitle: "Looks after the town well",
  invented: false, history: "The desert between Hami and Dunhuang had very few wells. It was one of the most feared stretches of the road.",
  historyTitle: "The stony desert",
  historyFull: "East of Hami lay a wide gravel desert. Travelers crossed it from well to well, and some wells were several days apart. Caravans that ran out of water there were in serious danger.",
  lines: [
    "Dunhuang? That's the hardest road of all. Some wells are days apart.",
    "Carry more water than you think you need. Buy extra water skins in the market before you go."
  ],
  choices: [
    { text: "{guide} asks which wells are still good", requires: "guide", effects: { water: 2 },
      reply: "The well-keeper draws a map in the sand for {guide}, then tops up your skins for free.", end: true },
    { text: "Thank him", reply: "\"Go carefully.\"", end: true }
  ]
};
DIALOGUES.talk_jiuquan = {
  speaker: "Beacon soldier", native: "", portrait: "soldier", subtitle: "Keeps watch from a beacon tower",
  invented: false, history: "Beacon towers could pass a warning hundreds of kilometers along the corridor in a single day.",
  historyTitle: "Smoke and fire",
  historyFull: "Soldiers in the beacon towers used smoke by day and fire by night. Different numbers of fires meant different things, such as how many raiders were coming. The towers also kept records of every traveler who passed.",
  lines: [
    "See that tower on the ridge? If raiders come, we light a fire, and the next tower lights theirs.",
    "A warning can reach the city before the raiders do. You're safe on this road, as long as the towers are manned."
  ],
  choices: [
    { text: "Share some food with the soldiers", effects: { food: -3, morale: 3, generosity: 1, helper: "The soldiers of the Jiuquan beacons" },
      reply: "The soldiers are delighted. \"We'll watch the road for you all the way to the next tower!\"", end: true },
    { text: "Thank him", reply: "He goes back to watching the horizon.", end: true }
  ]
};
DIALOGUES.talk_zhangye = {
  speaker: "Sogdian trader", native: "", portrait: "trader", subtitle: "From Samarkand, trading silk and silver",
  invented: false, history: "Sogdian merchants from Central Asia ran trading communities in towns all along the Hexi Corridor.",
  historyTitle: "Sogdian traders",
  historyFull: "Sogdians came from the region around Samarkand and Bukhara. They settled in towns along the Silk Road and in China, trading silk, silver, musk and spices. Some Sogdians became Buddhists and helped translate sutras.",
  lines: [
    "Three kingdoms, three armies, and every one of them wants a toll! Business is hard this year.",
    "If you're going to Guzang, go carefully. People say the Later Qin army is coming."
  ],
  choices: [
    { text: "{merchant} swaps news with him in Sogdian", requires: "merchant", effects: { silk: 4 },
      reply: "The two merchants talk for an hour and strike a small deal. {merchant} comes away grinning.", end: true },
    { text: "Thank him", reply: "\"May your profits be large and your tolls small!\"", end: true }
  ]
};
DIALOGUES.talk_guzang = {
  speaker: "Young monk of Guzang", native: "", portrait: "youngmonk", subtitle: "Studies at a monastery in Guzang",
  invented: false, history: "Kumarajiva lived in Guzang for about seventeen years before he was brought to Chang'an.",
  historyTitle: "Kumarajiva in Guzang",
  historyFull: "The rulers of the Later Liang kept Kumarajiva at Guzang but didn't give him the chance to teach much. He used the time to master Chinese, which made his later translations clear and natural.",
  lines: [
    "You're from Kucha? Like the great teacher Kumarajiva!",
    "He has lived here for seventeen years. They say he speaks Chinese better than I do. Now everyone says he'll go to Chang'an."
  ],
  choices: [
    { text: "Tell him about your monastery in Kucha", effects: { morale: 3 },
      reply: "His eyes shine. \"Someday I'll travel west and see it for myself.\"", end: true },
    { text: "Thank him", reply: "He bows and hurries back to his lessons.", end: true }
  ]
};
DIALOGUES.talk_lanzhou = {
  speaker: "Ferryman", native: "", portrait: "ferryman", subtitle: "Takes travelers across the Yellow River",
  invented: false, history: "The Yellow River carries so much yellow silt that it gave the river its name.",
  historyTitle: "The Yellow River",
  historyFull: "The Yellow River picks up fine yellow soil called loess as it flows through the hills. It was a lifeline for farmers and a barrier for travelers. In the coldest weeks of winter it could freeze solid.",
  lines: [
    "Want to cross? My boat takes four silk a trip, and it's never sunk. Well, hardly ever.",
    "In deep winter the river freezes and people walk across for free. Brave people. Or foolish ones."
  ],
  choices: [
    { text: "Ask when the ice will be thick", reply: "\"In the coldest weeks of winter. Before then, you'll need my boat.\"", end: true },
    { text: "Thank him", reply: "\"Come back when you're ready to cross.\"", end: true }
  ]
};
