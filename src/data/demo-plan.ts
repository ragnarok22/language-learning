import { StudyPlan } from "../types";

export const demoPlan: StudyPlan = {
  title: "Two-week Dutch warmup",
  steps: [
    "Days 1–3: nail sounds, greetings, and spelling patterns.",
    "Days 4–7: daily routines, schedules, and travel basics.",
    "Days 8–10: shops, cafés, and short service dialogues.",
    "Days 11–14: storytelling, simple past tense, and review.",
  ],
  lessons: [
    {
      id: "sounds",
      title: "Klanken & Greetings",
      topic: "Sound patterns and first impressions",
      summary:
        "Tune your ear to common vowel pairs and introduce yourself confidently.",
      basics: [
        "Short vs. long vowels (a/aa, e/ee) and the Dutch “g” (soft throat).",
        "Greetings: hoi, hallo, goedemorgen, tot ziens, doei.",
        "Small talk frames: Ik ben..., Ik kom uit..., Hoe gaat het?",
      ],
      sentences: [
        {
          dutch: "Hoi, ik ben Noor. Leuk je te ontmoeten!",
          translation: "Hi, I am Noor. Nice to meet you!",
          phonetic: "hoy, ik ben nor. leuk yuh tuh uh-moat-nuh",
        },
        {
          dutch: "Hoe gaat het met je?",
          translation: "How are you doing?",
          phonetic: "hoo ghaat hut met yuh",
        },
        {
          dutch: "Ik kom uit Spanje, en ik woon in Utrecht.",
          translation: "I come from Spain, and I live in Utrecht.",
          phonetic: "ik kom out spahn-yuh, en ik vohn in uu-trekht",
        },
      ],
      exercises: [
        {
          type: "cards",
          prompt: "Pick the way to say “See you soon”.",
          options: ["Tot snel", "Tot nooit", "Dag het gaat"],
          answer: "Tot snel",
        },
        {
          type: "fill",
          prompt: "Complete: Ik ____ uit Canada.",
          answer: "kom",
        },
      ],
    },
    {
      id: "daily-routine",
      title: "Dagelijkse routine",
      topic: "Time blocks and daily verbs",
      summary: "Talk through morning to evening and ask about someone’s plans.",
      basics: [
        "Verb order in main clauses: subject + verb + time + place + rest.",
        "Common verbs: opstaan, werken, koken, slapen, gaan.",
        "Time markers: ’s ochtends, vanmiddag, vanavond, morgen.",
      ],
      sentences: [
        {
          dutch: "Ik sta om zeven uur op en ik maak koffie.",
          translation: "I get up at seven and I make coffee.",
          phonetic: "ik staa om zay-vun uur op en ik maak kof-fee",
        },
        {
          dutch: "Werk je morgen thuis of op kantoor?",
          translation: "Are you working from home tomorrow or at the office?",
          phonetic: "verk yuh mor-ghun tuys of op kan-toor",
        },
        {
          dutch: "Na het eten ga ik wandelen met mijn hond.",
          translation: "After dinner I go for a walk with my dog.",
          phonetic: "naa hut ay-tun gaa ik van-duh-luhn met mayn hond",
        },
      ],
      exercises: [
        {
          type: "order",
          prompt: "Arrange: “ik - ga - vanavond - sporten”.",
          answer: "Ik ga vanavond sporten.",
        },
        {
          type: "cards",
          prompt: "Choose the translation for “I like to cook”.",
          options: [
            "Ik houd van koken.",
            "Ik hou van lopen.",
            "Ik ga naar koken.",
          ],
          answer: "Ik houd van koken.",
        },
      ],
    },
    {
      id: "service",
      title: "In de winkel en het café",
      topic: "Service interactions",
      summary:
        "Order food, ask for prices, and handle polite requests with u/jij forms.",
      basics: [
        "Polite forms: mag ik…?, alstublieft/alstjeblieft, dank u/je.",
        "Numbers to 100 and euro amounts.",
        "Modal verbs: kan, mag, wil for requests.",
      ],
      sentences: [
        {
          dutch: "Mag ik een cappuccino zonder suiker, alstublieft?",
          translation: "May I have a cappuccino without sugar, please?",
          phonetic: "mach ik un kap-u-chee-no zon-der sow-ker, al-stu-bleeft",
        },
        {
          dutch: "Dat kost vier euro vijftig.",
          translation: "That costs four euros fifty.",
          phonetic: "dat kost fear eu-ro fai-f-tich",
        },
        {
          dutch: "Heeft u iets vegetarisch?",
          translation: "Do you have something vegetarian?",
          phonetic: "heeft uu its vay-ghay-tar-isch",
        },
      ],
      exercises: [
        {
          type: "fill",
          prompt: "Complete: Mag ___ helpen?",
          answer: "ik u",
        },
        {
          type: "match",
          prompt:
            "Match the amount to the spoken form: €3,20 → drie euro twintig.",
        },
      ],
    },
  ],
};
