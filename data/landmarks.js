/* The ten landmarks of Chapter 1: DESIGN.md section 3.
   `scene` is the landmark's scene composition: a list of features drawn in order,
   back to front, by SPRITES.FEATURES in js/sprites.js. The stage is 1280×800;
   keep the band between y≈170 and y≈590 clear of HUD so the landmark and camp show. */
(function () {
  const SKY = { type: "sky" };
  const HORIZON = 488;

  window.LANDMARKS = [
    {
      id: "kucha", name: "Kucha", alt: "", kmFromPrev: 0,
      terrain: "desert", talk: null,
      visitTitle: "The monasteries of Kucha",
      visitText: "Kucha was one of the great Buddhist kingdoms of the Silk Road. Its monks followed the teachings of the Sarvastivada school, and its monasteries were famous as far away as China.",
      visitHistory: "Near Kucha, at Kizil, monks and artists cut hundreds of cave temples into a cliff and painted them with scenes from the Buddha's lives. Many paintings survive today, though some were cut out and taken to museums in Europe about a hundred years ago.",
      blurb: "A Buddhist kingdom of monasteries and painted caves.",
      visit: "Monastery", bazaar: true, monastery: true,
      scene: [
        SKY, { type: "stars", seed: 3, count: 36, yMax: 180 },
        { type: "sun", x: 1080, y: 300, r: 56 },
        { type: "mountains", color: "dune-mid", base: 460, height: 240, spacing: 150, seed: 12, snow: true },
        { type: "dunes", layers: [{ color: "dune-far", base: 460, waves: [[12, 420, 0.5], [6, 150, 2]] }] },
        { type: "ground", y: HORIZON, seed: 1 },
        { type: "road", x: 760, top: HORIZON, topWidth: 32, spread: 7 },
        { type: "hall", x: 96, w: 224, base: HORIZON, h: 72 },
        { type: "stupa", x: 364, base: HORIZON, unit: 6, color: "cliff-ledge" },
        { type: "wall", x: 520, w: 560, base: HORIZON, h: 48, gate: { x: 712, w: 96 } },
        { type: "poplars", base: HORIZON, trees: [[472, 120], [1104, 136], [1152, 104], [1220, 128]] },
        { type: "camp", x: 440, base: 580 }
      ]
    },
    {
      id: "karashahr", name: "Karashahr", alt: "Agni", kmFromPrev: 300,
      terrain: "desert", talk: "talk_karashahr",
      visitTitle: "Agni by the lake",
      visitText: "Agni (Karashahr) sat beside Bosten Lake, the largest lake in the region. Reeds grew along its shores, and the kingdom had its own Buddhist monasteries.",
      visitHistory: "In 400 CE the Chinese monk Faxian stayed in Agni for more than two months on his way west. He wrote that the monks there followed strict rules, and that the people were not very welcoming to travelers from China.",
      blurb: "An oasis kingdom beside a great lake. Travelers pay a toll here.",
      visit: "Lakeshore", bazaar: false, monastery: true,
      scene: [
        SKY, { type: "stars", seed: 5, count: 30, yMax: 170 },
        { type: "sun", x: 300, y: 320, r: 48 },
        { type: "mountains", color: "dune-mid", base: 440, height: 150, spacing: 180, seed: 4 },
        { type: "ground", y: 440, color: "dune-far", dot: "sky-coral", dots: 20, seed: 2 },
        { type: "water", x0: 0, x1: 760, y: 448, h: 56, color: "#5f86a0", seed: 3 },
        { type: "reeds", x0: 0, x1: 720, y: 512, count: 48, color: "dune-mid" },
        { type: "ground", y: 512, seed: 6 },
        { type: "houses", base: 512, houses: [[1180, 64, 40]] },
        { type: "wall", x: 820, w: 400, base: 512, h: 56, gate: { x: 940, w: 112 } },
        { type: "poplars", base: 512, trees: [[776, 112], [1224, 120]] },
        { type: "camp", x: 420, base: 588 }
      ]
    },
    {
      id: "turfan", name: "Turfan", alt: "Gaochang", kmFromPrev: 300,
      terrain: "desert", talk: "talk_turfan",
      visitTitle: "Gaochang",
      visitText: "Gaochang, near Turfan, was a walled town in a hot, low basin below the red Flaming Mountains. Farmers watered their fields and vineyards with snowmelt from the mountains.",
      visitHistory: "Many of Gaochang's people were Chinese settlers living alongside local peoples, and Buddhism thrived there. Archaeologists have found Buddhist texts at Turfan written in more than a dozen languages.",
      blurb: "A walled city below the red Flaming Mountains. Hot in summer.",
      visit: "Monastery", bazaar: true, monastery: true,
      scene: [
        SKY, { type: "stars", seed: 8, count: 28, yMax: 160 },
        { type: "sun", x: 640, y: 260, r: 64 },
        { type: "stripedHills", base: 340, band: 24, x0: 0, x1: 1280,
          colors: ["terracotta", "cliff-strata", "cliff", "dune-far", "cliff-strata"],
          waves: [[28, 380, 0.3], [12, 140, 1.5]] },
        { type: "ground", y: HORIZON, seed: 3 },
        { type: "road", x: 640, top: HORIZON, topWidth: 32, spread: 6 },
        { type: "wall", x: 80, w: 1120, base: HORIZON, h: 64, gate: { x: 592, w: 96, h: 48 } },
        { type: "hall", x: 212, w: 176, base: HORIZON - 64, h: 40 },
        { type: "houses", base: HORIZON - 64, houses: [[880, 64, 32], [960, 88, 40]] },
        { type: "poplars", base: HORIZON, trees: [[40, 112], [1208, 120]] },
        { type: "camp", x: 760, base: 584 }
      ]
    },
    {
      id: "hami", name: "Hami", alt: "Yiwu", kmFromPrev: 400,
      terrain: "desert", talk: "talk_hami",
      visitTitle: "The last oasis",
      visitText: "Hami (Yiwu) was a small oasis with good springs and green fields. East of it lay a stony desert with very few wells, the hardest stretch of the road to Dunhuang.",
      visitHistory: "Travelers crossing this desert watched for old camel tracks and the piles of stones earlier caravans left to mark the way. Carrying enough water was a matter of life and death.",
      blurb: "The last oasis before the hardest stretch of desert.",
      visit: "Well", bazaar: true, monastery: false,
      scene: [
        SKY, { type: "stars", seed: 13, count: 40, yMax: 200 },
        { type: "sun", x: 1000, y: 340, r: 60 },
        { type: "mountains", color: "dune-mid", base: 430, height: 110, spacing: 220, seed: 9, x0: 0, x1: 700 },
        { type: "dunes", layers: [
          { color: "dune-far", base: 440, waves: [[20, 360, 1.2], [8, 120, 0]] },
          { color: "dune-mid", base: 480, waves: [[16, 300, 2], [8, 100, 0.4]] }
        ] },
        { type: "ground", y: 504, seed: 4 },
        { type: "houses", base: 504, houses: [[520, 80, 40], [616, 56, 32], [880, 72, 40]] },
        { type: "poplars", base: 504, trees: [[456, 104], [688, 128], [736, 96], [960, 112]] },
        { type: "camp", x: 480, base: 588 }
      ]
    },
    {
      id: "dunhuang", name: "Dunhuang", alt: "", kmFromPrev: 400,
      terrain: "hardDesert", talk: "talk_dunhuang",
      visitTitle: "The Mogao Caves",
      visitText: "Near Dunhuang, monks began cutting cave temples into the cliff at Mogao in the 300s. Families, merchants and officials paid for new caves, painted from floor to ceiling.",
      visitHistory: "Over the next thousand years, people carved more than 700 caves. In one small cave, sealed around the year 1000, tens of thousands of scrolls survived until 1900: Buddhist sutras, letters, contracts and even a printed Diamond Sutra from 868.",
      blurb: "Cave temples cut into the cliff above the Mingsha dunes.",
      visit: "Caves", bazaar: true, monastery: true,
      scene: [
        SKY, { type: "stars", seed: 17, count: 34, yMax: 180 },
        { type: "sun", x: 1016, y: 316, r: 56 },
        // Mingsha dunes behind the town
        { type: "dunes", layers: [
          { color: "dune-far", base: 400, waves: [[28, 420, 0.8], [10, 130, 2]], x0: 320 },
          { color: "dune-mid", base: 448, waves: [[20, 340, 2.4], [8, 110, 0.5]], x0: 320 }
        ] },
        { type: "ground", y: HORIZON, seed: 5 },
        { type: "road", x: 736, top: HORIZON, topWidth: 32, spread: 8, drift: -2 },
        // Mogao cliff face with rows of caves and a wooden walkway
        { type: "cliff", x0: 0, x1: 360, top: 176, base: HORIZON,
          rows: [{ y: 232, gap: 56, offset: 24 }, { y: 304, gap: 48, offset: 40, w: 16, h: 20 },
            { y: 368, gap: 56, offset: 16 }, { y: 432, gap: 64, offset: 48, w: 24, h: 28 }] },
        { type: "wall", x: 520, w: 480, base: HORIZON, h: 48, gate: { x: 688, w: 96 } },
        { type: "poplars", base: HORIZON, trees: [[392, 128], [440, 96], [1024, 120], [1072, 144], [1200, 112]] },
        { type: "camp", x: 480, base: 584 }
      ]
    },
    {
      id: "jiuquan", name: "Jiuquan", alt: "", kmFromPrev: 400,
      terrain: "corridor", talk: "talk_jiuquan",
      visitTitle: "Beacon towers",
      visitText: "Watchtowers of rammed earth lined the road through the Hexi Corridor. Soldiers sent signals from tower to tower: smoke by day and fire by night.",
      visitHistory: "Travelers needed written permits to pass the border posts here. Wooden slips found near these towers record the names of travelers, their animals and where they were going.",
      blurb: "A border town. Beacon towers watch the road; you need a permit.",
      visit: "Beacons", bazaar: false, monastery: true,
      scene: [
        SKY, { type: "stars", seed: 19, count: 36, yMax: 190 },
        { type: "sun", x: 240, y: 330, r: 52 },
        { type: "mountains", color: "dune-mid", base: 460, height: 230, spacing: 140, seed: 21, snow: true },
        { type: "dunes", layers: [{ color: "dune-far", base: 470, waves: [[10, 300, 1], [6, 90, 0]] }] },
        { type: "ground", y: HORIZON, seed: 7 },
        { type: "beacon", base: HORIZON, towers: [[128, 96], [360, 72], [1160, 88]] },
        { type: "wall", x: 560, w: 480, base: HORIZON, h: 56, gate: { x: 752, w: 96 } },
        { type: "road", x: 800, top: HORIZON, topWidth: 32, spread: 6 },
        { type: "camp", x: 440, base: 584 }
      ]
    },
    {
      id: "zhangye", name: "Zhangye", alt: "", kmFromPrev: 200,
      terrain: "corridor", talk: "talk_zhangye",
      visitTitle: "The camps of rival kingdoms",
      visitText: "Around 400 CE, several small kingdoms fought over the Hexi Corridor. Zhangye was the capital of one of them, the Northern Liang.",
      visitHistory: "In the summer of 400, Faxian's party spent the monks' rainy-season retreat at Zhangye. The road ahead was blocked by fighting, and the ruler of Zhangye supported the monks while they waited.",
      blurb: "In the Hexi Corridor, where rival kingdoms camp their armies.",
      visit: "Camps", bazaar: true, monastery: false,
      scene: [
        SKY, { type: "stars", seed: 23, count: 30, yMax: 170 },
        { type: "sun", x: 1080, y: 290, r: 52 },
        { type: "stripedHills", base: 360, band: 20, x0: 0, x1: 1280,
          colors: ["sky-rose", "apricot", "dune-far", "sky-plum", "cliff-ledge", "terracotta"],
          waves: [[36, 300, 0.2], [14, 110, 1.8]] },
        { type: "ground", y: HORIZON, seed: 8 },
        { type: "tents", base: HORIZON, banners: true, flag: "sky-dusk",
          tents: [[96, 88], [208, 72], [1040, 88], [1152, 72]] },
        { type: "houses", base: HORIZON, houses: [[544, 80, 40], [640, 64, 32], [720, 96, 48]] },
        { type: "poplars", base: HORIZON, trees: [[480, 104], [832, 120]] },
        { type: "road", x: 640, top: HORIZON, topWidth: 24, spread: 6 },
        { type: "camp", x: 400, base: 584 }
      ]
    },
    {
      id: "guzang", name: "Guzang", alt: "Wuwei", kmFromPrev: 250,
      terrain: "corridor", talk: "talk_guzang",
      visitTitle: "Guzang, the city of Liangzhou",
      visitText: "Guzang (Wuwei) was the capital of the Later Liang kingdom. The monk Kumarajiva lived here for about seventeen years, kept by its rulers.",
      visitHistory: "During his long years in Guzang, Kumarajiva learned to speak and write Chinese well. That made him one of the greatest translators in history once he reached Chang'an.",
      blurb: "Capital of Liangzhou, where the monk Kumarajiva has been held for years.",
      visit: "City", bazaar: true, monastery: true,
      scene: [
        SKY, { type: "stars", seed: 29, count: 34, yMax: 180 },
        { type: "sun", x: 200, y: 300, r: 52 },
        { type: "mountains", color: "dune-mid", base: 440, height: 120, spacing: 200, seed: 31 },
        { type: "ground", y: HORIZON, seed: 9 },
        { type: "wall", x: 240, w: 880, base: HORIZON, h: 88, gate: { x: 624, w: 128, h: 64 } },
        { type: "hall", x: 336, w: 176, base: HORIZON - 88, h: 32 },
        { type: "hall", x: 872, w: 160, base: HORIZON - 88, h: 24 },
        { type: "tents", base: HORIZON + 24, banners: true, flag: "terracotta",
          tents: [[16, 96], [128, 80], [1128, 96]] },
        { type: "road", x: 688, top: HORIZON, topWidth: 40, spread: 6 },
        { type: "camp", x: 360, base: 588 }
      ]
    },
    {
      id: "lanzhou", name: "Lanzhou", alt: "", kmFromPrev: 250,
      terrain: "loess", talk: "talk_lanzhou",
      visitTitle: "The Yellow River crossing",
      visitText: "Lanzhou (then called Jincheng) guarded a crossing of the Yellow River between steep hills of yellow loess soil.",
      visitHistory: "Travelers crossed by ferry boat. In the coldest part of winter the river could freeze hard enough for carts and camels to walk across.",
      blurb: "The Yellow River crossing, between steep loess hills.",
      visit: "Ferry", bazaar: false, monastery: false,
      scene: [
        SKY, { type: "stars", seed: 31, count: 36, yMax: 190 },
        { type: "sun", x: 960, y: 300, r: 60 },
        { type: "dunes", layers: [
          { color: "cliff", base: 360, waves: [[40, 360, 0.3], [16, 120, 2.2]] },
          { color: "cliff-strata", base: 420, waves: [[24, 280, 1.6], [10, 90, 0.8]] }
        ] },
        { type: "ground", y: 440, color: "cliff-ledge", dot: "cliff", dots: 20, seed: 12 },
        { type: "water", x0: 0, x1: 1280, y: 456, h: 64, color: "#b07a4a", seed: 7, ripples: 18 },
        { type: "boat", x: 760, y: 468, unit: 4 },
        { type: "ground", y: 520, seed: 10 },
        { type: "poplars", base: 520, trees: [[96, 104], [1152, 120]] },
        { type: "camp", x: 440, base: 592 }
      ]
    },
    {
      id: "changan", name: "Chang'an", alt: "", kmFromPrev: 600,
      terrain: "loess", talk: null,
      visitTitle: "The translation hall",
      visitText: "Emperor Yao Xing of the Later Qin gave Kumarajiva a place to work in Chang'an, the Xiaoyao Garden. Hundreds of monks came to help.",
      visitHistory: "Kumarajiva's team translated about 35 texts, including the Lotus Sutra, the Diamond Sutra and the Amida Sutra. Kumarajiva would read a text aloud in Chinese, the monks discussed each line, and scribes wrote down the version they agreed on.",
      blurb: "The capital. Emperor Yao Xing welcomes monks here.",
      visit: "Translation hall", bazaar: true, monastery: true,
      scene: [
        SKY, { type: "stars", seed: 37, count: 40, yMax: 190 },
        { type: "sun", x: 1100, y: 320, r: 56 },
        { type: "mountains", color: "dune-mid", base: 430, height: 100, spacing: 240, seed: 41 },
        { type: "ground", y: HORIZON, seed: 11 },
        { type: "tower", x: 340, base: HORIZON - 72, tiers: 5, w: 80 },
        { type: "hall", x: 800, w: 240, base: HORIZON - 72, h: 40 },
        { type: "wall", x: 0, w: 1280, base: HORIZON, h: 72, gate: { x: 576, w: 128, h: 64 } },
        { type: "road", x: 640, top: HORIZON, topWidth: 40, spread: 7 },
        { type: "poplars", base: HORIZON, trees: [[112, 112], [1136, 120]] },
        { type: "camp", x: 360, base: 588 }
      ]
    }
  ];
})();
