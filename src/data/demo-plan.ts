import type { StudyPlan } from "../types";

export const demoPlan: StudyPlan = {
  title: "Two-week Spanish warmup",
  steps: [
    "Days 1-3: basic greetings and pronunciation.",
    "Days 4-7: daily routines and present tense verbs.",
    "Days 8-10: ordering food and travel basics.",
    "Days 11-14: past tense introduction and storytelling.",
  ],
  lessons: [
    {
      id: "sounds",
      title: "Saludos y Sonidos",
      topic: "Greetings and Pronunciation",
      summary:
        "Master the basics of Spanish pronunciation and learn to introduce yourself.",
      basics: [
        "Vowels: a, e, i, o, u are always clear and short.",
        "The letter 'ñ' sounds like 'ny' in canyon.",
        "Greetings: Hola, Buenos días, Adiós, Hasta luego.",
      ],
      sentences: [
        {
          target: "Hola, me llamo Elena. ¡Mucho gusto!",
          translation: "Hi, I am Elena. Nice to meet you!",
          phonetic: "oh-lah, meh yah-moh eh-leh-nah. moo-choh goos-toh",
        },
        {
          target: "¿Cómo estás?",
          translation: "How are you?",
          phonetic: "koh-moh ehs-tahs",
        },
        {
          target: "Soy de México y vivo en Madrid.",
          translation: "I am from Mexico and I live in Madrid.",
          phonetic: "soy deh meh-hee-koh ee bee-boh ehn mah-dreed",
        },
      ],
      exercises: [
        {
          type: "cards",
          prompt: "Select 'See you later'.",
          options: ["Hasta luego", "Buenos días", "Por favor"],
          answer: "Hasta luego",
        },
        {
          type: "fill",
          prompt: "Complete: Me ____ Elena.",
          answer: "llamo",
        },
      ],
    },
    {
      id: "daily-routine",
      title: "Rutina Diaria",
      topic: "Daily Routines",
      summary: "Describe your day and ask others about their schedule.",
      basics: [
        "Reflexive verbs: levantarse (to get up), ducharse (to shower).",
        "Common verbs: comer (to eat), trabajar (to work), dormir (to sleep).",
        "Time: por la mañana, por la tarde, por la noche.",
      ],
      sentences: [
        {
          target: "Me levanto a las siete y tomo café.",
          translation: "I get up at seven and drink coffee.",
          phonetic: "meh leh-bahn-toh ah lah-s syeh-teh ee toh-moh kah-feh",
        },
        {
          target: "¿Trabajas hoy o descansas?",
          translation: "Are you working today or resting?",
          phonetic: "trah-bah-has oy oh des-kan-sas",
        },
        {
          target: "Después del trabajo voy al gimnasio.",
          translation: "After work I go to the gym.",
          phonetic: "des-pwes del trah-bah-ho boy al him-nah-syoh",
        },
      ],
      exercises: [
        {
          type: "order",
          prompt: "Arrange: yo - como - tarde - más.",
          answer: "Yo como más tarde.",
        },
        {
          type: "cards",
          prompt: "Translate 'I sleep'.",
          options: ["Yo duermo", "Yo corro", "Yo hablo"],
          answer: "Yo duermo",
        },
      ],
    },
    {
      id: "service",
      title: "En el Restaurante",
      topic: "Ordering Food",
      summary: "Order meals, ask for the bill, and be polite.",
      basics: [
        "Polite requests: Quisiera... (I would like...), ¿Me trae...? (Can you bring me...?).",
        "Numbers for prices.",
        "Vocabulary: la cuenta (the bill), el menú, agua, postre.",
      ],
      sentences: [
        {
          target: "Quisiera una mesa para dos, por favor.",
          translation: "I would like a table for two, please.",
          phonetic: "kee-syeh-rah oo-nah meh-sah pah-rah dos, por fah-bor",
        },
        {
          target: "¿Cuánto cuesta esto?",
          translation: "How much does this cost?",
          phonetic: "kwan-toh kwes-ta es-toh",
        },
        {
          target: "La cuenta, por favor.",
          translation: "The bill, please.",
          phonetic: "lah kwen-tah, por fah-bor",
        },
      ],
      exercises: [
        {
          type: "fill",
          prompt: "Complete: La ____, por favor.",
          answer: "cuenta",
        },
        {
          type: "match",
          prompt: "Match: Agua -> Water.",
        },
      ],
    },
  ],
};
