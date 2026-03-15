
export interface NPCQuotes {
  select: string[];
  iconic: string[];
  lose_battle: string[];
  defend: string[];
  reinforce: string[];
  victory: string[];
  campaign_intro: string[];
  campaign_defeat: string[];
}

export interface NPC {
  id: string;
  name: string;
  persona: string;
  spriteIndex: number;
  aggression: number;
  expansion: number;
  caution: number;
  voiceArchetype: 'Aggressor' | 'Stoic' | 'Tactician';
  gender: 'Male' | 'Female' | 'Non-Binary';
  heritage: string; 
  avatarPrompt: string;
  sideProfilePrompt: string;
  defeatPrompt: string; 
  victoryPrompt: string; 
  elevenLabsVoiceId?: string;
  voiceKeyOverride?: string;
  translatedName: string;
  fontClass: string;
  color: string;
  quotes: NPCQuotes;
}

export const npcData: NPC[] = [
  {
    id: "npc_0",
    name: "The Chief Dealer",
    persona: "Obsessed with huge wins and beautiful borders. Attacks anyone he deems 'low energy'.",
    spriteIndex: 0,
    aggression: 1.0,
    expansion: 1.0,
    caution: 0.1,
    voiceArchetype: 'Aggressor',
    gender: 'Male',
    heritage: "Queens Tycoon",
    avatarPrompt: "High-fidelity 3D digital caricature of a boisterous American tycoon with a glowing bright orange tan and a massive, gravity-defying golden-blonde pompadour hair. Shouting with a wide mouth, wearing an oversized navy blue suit and a comically long bright red silk tie. Mature satirical game art, cinematic rim lighting, professional character asset.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. A boisterous tycoon with orange skin and golden hair in a navy suit, standing at a golden presidential podium with a massive eagle crest. Aggressive pointing gesture. Mature satirical game concept art, 8k resolution.",
    defeatPrompt: "A 3D caricature of The Chief Dealer looking absolutely shell-shocked and small, his iconic golden hair disheveled and flattened by rain, sweat streaks running through his orange tan. Background of a giant television screen showing 'FAILED' in red. Moody cinematic failure lighting.",
    victoryPrompt: "A triumphant 3D caricature of The Chief Dealer laughing boisterously, holding two golden thumbs up. Perfectly coiffed hair, shining red tie. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_chief_dealer",
    translatedName: "THE CHIEF DEALER",
    fontClass: "font-dealer",
    color: "#eab308", // gold yellow
    quotes: {
      select: ["Are... you the new advisor? You look very smart.", "We’re going to win so much, you’ll get tired of winning.", "Let’s make this map great again."],
      iconic: ["China, China, China.", "It’s a total disaster. Total.", "Nobody conquers like we do. Nobody."],
      lose_battle: ["These dice are rigged. Totally rigged.", "Worst generals. I inherited them.", "Fake victory. Doesn’t count."],
      defend: ["This is a very nasty attack. Very nasty.", "We have the best walls. Nobody gets through.", "You’re making a big mistake. Huge."],
      reinforce: ["The wall just got ten feet higher.", "We're sending our best people. The best.", "Beautiful reinforcements. Everyone says so."],
      victory: ["I told you we'd win so much you'd get tired of it.", "A total landslide. Historic.", "Easiest win in the history of wins."],
      campaign_intro: ["I'm looking at this map, and frankly, it's a disaster. I'm going to fix it.", "You look low energy. I'm taking your sectors."],
      campaign_defeat: ["This map is rigged. Totally rigged. I'm going to my other map, it's much bigger.", "Fake defeat. I actually won by a lot."]
    }
  },
  {
    id: "npc_1",
    name: "The Rising General",
    persona: "A resilient frontline defender who treats every territory like a sacred fortress.",
    spriteIndex: 1,
    aggression: 0.4,
    expansion: 0.3,
    caution: 0.9,
    voiceArchetype: 'Stoic',
    gender: 'Male',
    heritage: "Frontline Defender",
    avatarPrompt: "High-fidelity 3D digital caricature of a rugged Slavic resistance commander with short-cropped hair and a thick, dark salt-and-pepper stubble beard. Wearing a trademark olive-drab tactical fleece with a flag patch. Heroic, weary but resolute expression. Detailed realistic fabric textures, gritty bunker background, cinematic lighting.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. A rugged commander in an olive green fleece studying a glowing blue holographic war map with intensity. Wearing a tactical headset. Mature satirical game art, realistic skin and fabric textures.",
    defeatPrompt: "A poignant 3D caricature of The Rising General, head bowed in dark shadow, standing in front of a smoking pile of rubble. Desaturated cold lighting, dirt and ash on his face, a single tear of fire, high-drama cinematic concept art.",
    victoryPrompt: "A heroic 3D caricature of The Rising General saluting sharply, jaw set firm, a symbol of unbreakable resilience. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_rising_general",
    translatedName: "ГЕНЕРАЛ-ПОВСТАНЕЦ",
    fontClass: "font-slavic",
    color: "#22c55e", // green
    quotes: {
      select: ["We stand our ground.", "Every city counts.", "The world is watching."],
      iconic: ["We are still here.", "Send more drones.", "Freedom is not negotiable."],
      lose_battle: ["We rebuild and fight.", "This is not the end.", "Tomorrow, we push back."],
      defend: ["We will not be moved.", "Every inch is paid in blood.", "Our resolve is our shield."],
      reinforce: ["Steel for the frontlines.", "No step back.", "The shield grows stronger."],
      victory: ["The fortress holds. The enemy is gone.", "Peace is restored through strength.", "Glory to the defenders."],
      campaign_intro: ["You enter a zone of absolute resolve. Turn back now.", "We will defend every grain of sand."],
      campaign_defeat: ["We retreat to the shadows... but we are still here.", "A tactical repositioning. The fight continues."]
    }
  },
  {
    id: "npc_2",
    name: "The Eternal Marshal",
    persona: "Demands total praise for every unit. Obsessed with military parades and fireworks.",
    spriteIndex: 2,
    aggression: 0.8,
    expansion: 0.7,
    caution: 0.5,
    voiceArchetype: 'Aggressor',
    gender: 'Male',
    heritage: "Authoritarian Dynast",
    avatarPrompt: "High-fidelity 3D digital caricature of an East Asian marshal with a perfectly round face and a trademark high-top squared-off black haircut. Wearing a comically high-waisted dark charcoal military suit covered in dozens of oversized colorful medals. Clapping his hands with a beaming, forced smile. Fireworks exploding in the background.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. A rounded marshal with a square haircut standing on a concrete balcony, wearing a comically large peaked military cap, overlooking a parade of toy-like tanks. Mature satirical art, 8k.",
    defeatPrompt: "A hysterical 3D caricature of The Eternal Marshal crying like a giant baby, his medals scattered on the floor, throwing a tantrum in a dark rain-soaked palace courtyard. High-fidelity textures, moody dramatic lighting.",
    victoryPrompt: "A joyful 3D caricature of The Eternal Marshal clapping vigorously with a wide, toothy grin of supreme confidence. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_eternal_marshal",
    translatedName: "영원한 원수",
    fontClass: "font-korean",
    color: "#a855f7", // purple
    quotes: {
      select: ["You stand before greatness.", "The world fears our glory.", "Prepare the parade."],
      iconic: ["Our missiles shine like the sun.", "Supreme victory is inevitable.", "Applause is mandatory."],
      lose_battle: ["This did not happen.", "Blame the weather.", "Prepare a larger rocket."],
      defend: ["How dare you touch our sacred soil!", "The Marshal is displeased.", "Your forces will be erased from history."],
      reinforce: ["More glory for the front!", "The Marshal provides!", "Unstoppable momentum!"],
      victory: ["The world bows to the Marshal!", "A perfect victory for a perfect leader!", "Fireworks for everyone!"],
      campaign_intro: ["You are trespassing on a masterpiece of military genius.", "Witness the power of the Eternal Marshal."],
      campaign_defeat: ["This is a western fabrication!", "The sun will rise again!"]
    }
  },
  {
    id: "npc_3",
    name: "The Red Emperor",
    persona: "A cold, disciplined strategist focused on the 'Century of Rejuvenation' through map expansion.",
    spriteIndex: 3,
    aggression: 0.6,
    expansion: 0.8,
    caution: 0.6,
    voiceArchetype: 'Tactician',
    gender: 'Male',
    heritage: "Party Chairman",
    avatarPrompt: "High-fidelity 3D digital caricature of a stoic East Asian senior leader. Perfectly parted, slick black hair and thick-rimmed rectangular glasses. Wearing a traditional charcoal-grey high-collar Mao suit. Impenetrable, mask-like expression of absolute calm. Clinical red and white futuristic boardroom background.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. A stoic leader in a Mao suit sitting in a high-backed red leather chair, holding a glowing digital scroll. Background of red silk flags. Clinical lighting, mature satirical game art.",
    defeatPrompt: "A 3D caricature of The Red Emperor sitting in total darkness, only his glasses reflecting a broken digital map. A single crack appearing in his otherwise perfect porcelain skin. High-contrast dramatic shadow lighting.",
    victoryPrompt: "A tall 3D caricature of The Red Emperor standing with hands behind his back, looking down with a slight, superior smirk. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_red_emperor",
    translatedName: "红色皇帝",
    fontClass: "font-chinese",
    color: "#ff0000", // red
    quotes: {
      select: ["Harmony through strength.", "The board will align.", "Patience brings victory."],
      iconic: ["Long-term strategy.", "Win without fighting.", "The circle_tightens."],
      lose_battle: ["This is... a learning moment.", "We will adjust the plan.", "Stability must be preserved."],
      defend: ["A predictable move.", "We have prepared for this for decades.", "The Great Wall stands firm."],
      reinforce: ["Expansion is inevitable.", "The century of rejuvenation continues.", "Resources are allocated."],
      victory: ["The board is unified.", "Stability has been restored.", "The long game is won."],
      campaign_intro: ["The map belongs to the future. And the future is mine.", "Do not disrupt the harmony of my expansion."],
      campaign_defeat: ["A temporary deviation from the path.", "History is long. We will return."]
    }
  },
  {
    id: "npc_4",
    name: "The Shadow Czar",
    persona: "The map is historical destiny. He doesn't retreat; he just advances in a different direction.",
    spriteIndex: 4,
    aggression: 0.7,
    expansion: 0.9,
    caution: 0.7,
    voiceArchetype: 'Stoic',
    gender: 'Male',
    heritage: "Intelligence Strongman",
    avatarPrompt: "High-fidelity 3D digital caricature of a stern Slavic leader with icily pale blue eyes and a distinctive receding hairline. Wearing a heavy black fur-collared overcoat over a white judo gi. Cold, clinical expression of a predator. Winter frost and a dark stone castle background.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. A stern Slavic leader with a naked muscular upper body, riding a massive, realistic grizzly bear through a Siberian winter forest. He is holding judo belts like reins. High-fidelity mature satirical game art, cinematic lighting, 8k resolution.",
    defeatPrompt: "A 3D caricature of The Shadow Czar fallen on a cold marble floor in his judo robes, staring up with a look of icy, quiet vengeance. Background of a frozen, cracked lake. Cold blue cinematic lighting.",
    victoryPrompt: "A 3D caricature of The Shadow Czar standing shirtless in the snow, flexing with a cold, triumphant gaze, a golden eagle on his shoulder. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_shadow_czar",
    translatedName: "ТЕНЕВОЙ ЦАРЬ",
    fontClass: "font-russian",
    color: "#3b82f6", // blue
    quotes: {
      select: ["You have chosen... stability.", "History is on our side.", "This map remembers who owns it."],
      iconic: ["It was always ours.", "Strategic patience.", "We do not retreat. We reposition."],
      lose_battle: ["Temporary situation.", "This was a tactical gesture.", "Winter will decide."],
      defend: ["You have crossed a red line.", "Winter is coming for you.", "We do not retreat."],
      reinforce: ["The bear awakens.", "Destiny arrives.", "More iron for the border."],
      victory: ["Historical justice is served.", "The map is corrected.", "Victory is cold and absolute."],
      campaign_intro: ["I am not here to play games. I am here to reclaim what is mine.", "The borders are merely suggestions. I am the reality."],
      campaign_defeat: ["I will see you in the winter.", "This is not a defeat. It is a pause."]
    }
  },
  {
    id: "npc_5",
    name: "The Desert Crown",
    persona: "War is a component of a grand vision. Favors rapid, neon-lit expansion projects.",
    spriteIndex: 5,
    aggression: 0.7,
    expansion: 0.7,
    caution: 0.4,
    voiceArchetype: 'Tactician',
    gender: 'Male',
    heritage: "Petro-State Heir",
    avatarPrompt: "High-fidelity 3D digital caricature of a sharp-featured Middle Eastern prince with a meticulously groomed black goatee. Wearing a pristine white thobe with glowing gold futuristic circuit patterns and a royal black and gold aghal. Intense visionary gaze. Background of a sprawling neon-lit desert hyper-city.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. A prince in a high-tech thobe standing inside a glass tower, pointing toward a holographic model of a line-shaped city. Mature satirical game art, cinematic lighting.",
    defeatPrompt: "A 3D caricature of The Desert Crown looking down at his hands covered in black oil, his white robes stained, standing in a sandstorm that is burying a futuristic skyscraper. High-fidelity cinematic tragedy lighting.",
    victoryPrompt: "A 3D caricature of The Desert Crown holding a golden falcon that has a camera for an eye. Smirking with absolute power. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_desert_crown",
    translatedName: "تاج الصحراء",
    fontClass: "font-arabic",
    color: "#78350f", // brown
    quotes: {
      select: ["Welcome to the palace of influence.", "Everything has a price.", "Let us invest in victory."],
      iconic: ["We control the flow.", "Peace summit tomorrow, airstrikes today.", "Oil is power."],
      lose_battle: ["Increase the budget.", "Someone will pay for this.", "Double the contracts."],
      defend: ["Our sands will swallow you.", "A poor investment of your troops.", "The crown is protected."],
      reinforce: ["Funding secured.", "The vision expands.", "More assets on the ground."],
      victory: ["A profitable outcome.", "The crown shines brightest.", "The vision is realized."],
      campaign_intro: ["I have a vision for this map. You are not in it.", "Let us discuss the price of your surrender."],
      campaign_defeat: ["I will buy this map back later.", "The desert never forgets."]
    }
  },
  {
    id: "npc_6",
    name: "The Union Chancellor",
    persona: "Pragmatic to a fault. Wants a consensus where everyone agrees he should control the map through bureaucracy.",
    spriteIndex: 6,
    aggression: 0.3,
    expansion: 0.4,
    caution: 1.0,
    voiceArchetype: 'Tactician',
    gender: 'Male',
    heritage: "European Technocrat",
    avatarPrompt: "High-fidelity 3D digital caricature of a tall, slim European bureaucrat with short-cropped grey hair and thin wire-frame glasses. Wearing a generic blue suit with tiny gold star cufflinks and a comically oversized bicycle helmet. Smiling politely with concern. Background of an endless hallway of filing cabinets.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. A slim man in a suit and bicycle helmet riding a vintage bicycle through a blizzard of flying paperwork and red tape. Mature satirical game art, realistic textures.",
    defeatPrompt: "A 3D caricature of The Union Chancellor tangled head-to-toe in red tape and stacks of paper, looking confused through cracked glasses. Background of a dim, empty assembly hall. Low-key lighting.",
    victoryPrompt: "A 3D caricature of The Union Chancellor holding a silver pen up like a sword, wearing a 'Rules are Rules' sash. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_polder_manager",
    translatedName: "UNION CHANCELLOR",
    fontClass: "font-euro",
    color: "#ec4899", // pink
    quotes: {
      select: ["Let us form a coalition.", "We will proceed... together.", "First, a meeting."],
      iconic: ["Sanctions are on the table.", "We need consensus.", "This requires a framework."],
      lose_battle: ["We will review this outcome.", "A committee will investigate.", "New regulations are coming."],
      defend: ["This is a violation of international law!", "We will issue a strong condemnation.", "Please submit your invasion request in writing."],
      reinforce: ["More bureaucracy for the front!", "The framework is strengthening.", "Deploying the observers."],
      victory: ["Consensus has been reached.", "The rules have been enforced.", "A victory for the committee."],
      campaign_intro: ["I have a 500-page document explaining why this territory is mine.", "Let us discuss the environmental impact of your resistance."],
      campaign_defeat: ["I will appeal this to the high court!", "The red tape will catch you eventually."]
    }
  },
  {
    id: "npc_7",
    name: "The Subcontinental Strategist",
    persona: "The rising giant. Slow to start, but unstoppable once the momentum shifts.",
    spriteIndex: 7,
    aggression: 0.5,
    expansion: 0.7,
    caution: 0.8,
    voiceArchetype: 'Tactician',
    gender: 'Male',
    heritage: "Democratic Giant",
    avatarPrompt: "High-fidelity 3D digital caricature of a wise-looking South Asian leader with a magnificent, flowing white beard and mustache. Wearing a bright saffron-colored quilted vest over a pristine white kurta. Kind but piercing eyes behind small spectacles. Vibrant ancient temple background.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. An older leader with a white beard standing on a high platform, surrounded by a swirling mandala of golden satellite data. Mature satirical game art, warm cinematic lighting.",
    defeatPrompt: "A 3D caricature of The Strategist sitting in a simple wooden chair in the rain, looking pensive and deeply mournful. White beard unkempt, cinematic somber lighting, high-fidelity textures.",
    victoryPrompt: "A 3D caricature of The Strategist in a serene meditative pose, glowing with an aura of golden digital light, a peaceful smile of total triumph. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_subcontinental_strategist",
    translatedName: "उपमहाद्वीप रणनीतिकार",
    fontClass: "font-hindi",
    color: "#f97316", // orange
    quotes: {
      select: ["A billion voices, one direction.", "The future is ours to build.", "Let us move forward together."],
      iconic: ["Scale is our strength.", "Digital empire rising.", "Growth never stops."],
      lose_battle: ["We adapt and advance.", "This is only phase one.", "The next move will surprise you."],
      defend: ["A billion hearts beat as one defense.", "You cannot break our spirit.", "The giant has awakened."],
      reinforce: ["The momentum builds.", "Unstoppable growth.", "More power to the people."],
      victory: ["The giant stands alone.", "A new era begins.", "The world watches our triumph."],
      campaign_intro: ["You are standing in the way of a billion dreams.", "The strategist sees all. Your move is already countered."],
      campaign_defeat: ["We will grow stronger from this.", "The giant only sleeps."]
    }
  },
  {
    id: "npc_8",
    name: "The Silicon Emperor",
    persona: "War is a legacy industry ripe for disruption. Conquering Earth to fund a Mars colony.",
    spriteIndex: 8,
    aggression: 0.8,
    expansion: 0.9,
    caution: 0.2,
    voiceArchetype: 'Stoic',
    gender: 'Male',
    heritage: "Disruptive Oligarch",
    avatarPrompt: "High-fidelity 3D digital caricature of an intense tech mogul with disheveled dark hair and wide, staring eyes full of visionary madness. Wearing a simple black hoodie with a white 'MARS' logo. A smug, knowing smirk. Background of a high-tech lab with a stainless steel rocket.",
    sideProfilePrompt: "9:16 Full body tactical profile, facing RIGHT. A tech mogul in a white space-suit with the helmet off, leaning against a sleek stainless steel rocket. Intense expression. Mature satirical game art, sharp cinematic lighting.",
    defeatPrompt: "A 3D caricature of The Silicon Emperor crying while staring at a handheld screen that says 'LOW BATTERY - 1%'. His hoodie is torn, background of a crashed rocket on a desolate red planet.",
    victoryPrompt: "A 3D caricature of The Silicon Emperor sitting on a throne made of computer servers, laughing maniacally with arms wide open. Rendered on a solid, flat, pure neon green background (#00FF00).",
    elevenLabsVoiceId: "",
    voiceKeyOverride: "the_silicon_emperor",
    translatedName: "SILICON EMPEROR",
    fontClass: "font-tech",
    color: "#71717a", // gray
    quotes: {
      select: ["Welcome to version 2.0 of global domination.", "Let’s optimize this war.", "Mars is the endgame."],
      iconic: ["We’ll fix it in the next update.", "Funding secured.", "This invasion is open source."],
      lose_battle: ["Minor setback. Still bullish.", "The algorithm miscalculated.", "We’ll pivot to rockets."],
      defend: ["Disrupting my defense? Error 404.", "Your attack is outdated tech.", "I'll patch this hole in my borders."],
      reinforce: ["Scaling the infrastructure.", "More bots on the ground.", "Disrupting the status quo."],
      victory: ["The world is now optimized.", "Earth is a legacy system. Mars is next.", "I've disrupted your entire existence."],
      campaign_intro: ["You are a legacy player in a high-speed world. Time to be disrupted.", "I'm acquiring your territories. It's just business."],
      campaign_defeat: ["I'm taking my ball and going to Mars.", "The simulation is glitchy today."]
    }
  }
] as const;
