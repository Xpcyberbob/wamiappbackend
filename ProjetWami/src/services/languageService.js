// Service de gestion multilingue pour Wami-IA
import AsyncStorage from '@react-native-async-storage/async-storage';

// Langues supportées
export const LANGUAGES = {
  FR: 'fr',
  MALINKE: 'malinke',
  SWAHILI: 'sw',
  HAUSA: 'ha',
  ENGLISH: 'en',
  BAOULE: 'bci',
  ARABIC: 'ar',
};

// Configuration des langues
export const LANGUAGE_CONFIG = {
  fr: {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    ttsCode: 'fr-FR',
    rtl: false,
  },
  malinke: {
    code: 'malinke',
    name: 'Malinké',
    nativeName: 'Maninkakan',
    flag: '🇬🇳',
    ttsCode: 'fr-FR', // Fallback to French TTS
    rtl: false,
  },
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇹🇿',
    ttsCode: 'sw-KE',
    rtl: false,
  },
  ha: {
    code: 'ha',
    name: 'Hausa',
    nativeName: 'Hausa',
    flag: '🇳🇬',
    ttsCode: 'fr-FR', // Fallback to French TTS
    rtl: false,
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    ttsCode: 'en-US',
    rtl: false,
  },
  bci: {
    code: 'bci',
    name: 'Baoulé',
    nativeName: 'Baoulé',
    flag: '🇨🇮',
    ttsCode: 'fr-FR',
    rtl: false,
  },
  ar: {
    code: 'ar',
    name: 'Arabe',
    nativeName: 'العربية',
    flag: '🇸🇦',
    ttsCode: 'ar-SA',
    rtl: true,
  },
};

// Glossaire technique multilingue
export const TECHNICAL_GLOSSARY = {
  temperature: {
    fr: 'Température',
    malinke: 'Funteni',
    sw: 'Joto',
    ha: 'Zafi',
    en: 'Temperature',
    bci: 'Wafflɛ',
    ar: 'درجة الحرارة',
  },
  ph: {
    fr: 'pH (acidité)',
    malinke: 'pH (ji ka acidité)',
    sw: 'pH (asidi)',
    ha: 'pH (acidity)',
    en: 'pH (acidity)',
    bci: 'pH (nzue i wafflɛ)',
    ar: 'الحموضة',
  },
  oxygen: {
    fr: 'Oxygène',
    malinke: 'Fɔnɔ',
    sw: 'Oksijeni',
    ha: 'Iskar oxygen',
    en: 'Oxygen',
    bci: 'Wawa',
    ar: 'الأكسجين',
  },
  ammonia: {
    fr: 'Ammoniaque',
    malinke: 'Ammoniaque (kɔnɔ juguman)',
    sw: 'Amonia',
    ha: 'Ammonia',
    en: 'Ammonia',
    bci: 'Ammoniaque',
    ar: 'الأمونيا',
  },
  turbidity: {
    fr: 'Turbidité',
    malinke: 'Ji ka jɛman',
    sw: 'Ukungu',
    ha: 'Hazo',
    en: 'Turbidity',
    bci: 'Nzue i bɔflɛ',
    ar: 'العكارة',
  },
  optimal: {
    fr: 'Optimal',
    malinke: 'Ka ɲi kosɔbɛ',
    sw: 'Bora kabisa',
    ha: 'Mafi kyau',
    en: 'Optimal',
    bci: 'Ɔ ti kpa',
    ar: 'مثالي',
  },
  good: {
    fr: 'Bon',
    malinke: 'Ka ɲi',
    sw: 'Nzuri',
    ha: 'Mai kyau',
    en: 'Good',
    bci: 'Ɔ ti kpa',
    ar: 'جيد',
  },
  warning: {
    fr: 'Attention',
    malinke: 'Kɔlɔsi',
    sw: 'Tahadhari',
    ha: 'Hankali',
    en: 'Warning',
    bci: 'Nian!',
    ar: 'تحذير',
  },
  critical: {
    fr: 'Critique',
    malinke: 'Gɛlɛya',
    sw: 'Hatari',
    ha: 'Matsananci',
    en: 'Critical',
    bci: 'Ɔ ti tɛ',
    ar: 'حرج',
  },
};

// Messages système multilingues
export const SYSTEM_MESSAGES = {
  greeting: {
    fr: 'Bonjour, je suis Wami-IA, votre assistante intelligente pour la pisciculture.',
    malinke: 'I ka ɲɛ! N ye Wami-IA ye, i ka dɛmɛbaga hakili la pisciculture kama.',
    sw: 'Habari! Mimi ni Wami-IA, msaidizi wako wa akili kwa ufugaji wa samaki.',
    ha: 'Sannu! Ni ne Wami-IA, mataimakinka mai hankali don kiwon kifi.',
    en: 'Hello! I am Wami-IA, your intelligent assistant for fish farming.',
    bci: 'Anjɔ ! Min yɛ Wami-IA, ɔ ukaman ngɔ si jɛ suɛ trɛ diɛ nun.',
    ar: 'مرحبا! أنا Wami-IA، مساعدك الذكي لتربية الأسماك.',
  },
  waterQualityGood: {
    fr: 'La qualité de l\'eau est excellente. Tous les paramètres sont optimaux.',
    malinke: 'Ji ka kɔnɔkow ka ɲi kosɔbɛ. Fɛɛn bɛɛ bɛ ɲuman na.',
    sw: 'Ubora wa maji ni mzuri sana. Vipimo vyote ni bora.',
    ha: 'Ingancin ruwa yana da kyau sosai. Duk abubuwan suna daidai.',
    en: 'Water quality is excellent. All parameters are optimal.',
    bci: 'Nzue\'n ti kpa. Like kwlaa ti kpa.',
    ar: 'جودة المياه ممتازة. جميع المعايير مثالية.',
  },
  helpMessage: {
    fr: 'Comment puis-je vous aider aujourd\'hui ?',
    malinke: 'Ne bɛ se ka i dɛmɛ cogo di bi?',
    sw: 'Ninaweza kukusaidia vipi leo?',
    ha: 'Yaya zan iya taimaka maka yau?',
    en: 'How can I help you today?',
    bci: 'Ɛ waan n yo sɛ man wɔ andɛ?',
    ar: 'كيف يمكنني مساعدتك اليوم؟',
  },
  analyzing: {
    fr: 'J\'analyse vos données...',
    malinke: 'N bɛ i ka kunnafoniw lajɛ...',
    sw: 'Ninachanganua data yako...',
    ha: 'Ina nazarin bayananku...',
    en: 'Analyzing your data...',
    bci: 'N su nian wɔ ninnge mun...',
    ar: 'أقوم بتحليل بياناتك...',
  },
};

// Langue actuelle (par défaut : Français)
let currentLanguage = LANGUAGES.FR;

// Sauvegarder la langue choisie
export const saveLanguage = async (languageCode) => {
  try {
    await AsyncStorage.setItem('@wami_language', languageCode);
    currentLanguage = languageCode;
  } catch (error) {
    console.error('Erreur sauvegarde langue:', error);
  }
};

// Charger la langue sauvegardée
export const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('@wami_language');
    if (savedLanguage) {
      currentLanguage = savedLanguage;
    }
    return currentLanguage;
  } catch (error) {
    console.error('Erreur chargement langue:', error);
    return LANGUAGES.FR;
  }
};

// Obtenir la langue actuelle
export const getCurrentLanguage = () => currentLanguage;

// Traduire un terme technique
export const translateTechnical = (term, languageCode = currentLanguage) => {
  const translation = TECHNICAL_GLOSSARY[term];
  if (!translation) return term;
  return translation[languageCode] || translation.fr;
};

// Obtenir un message système
export const getSystemMessage = (messageKey, languageCode = currentLanguage) => {
  const message = SYSTEM_MESSAGES[messageKey];
  if (!message) return '';
  return message[languageCode] || message.fr;
};

// Détecter la langue d'un texte (simple heuristique)
export const detectLanguage = (text) => {
  const lowerText = text.toLowerCase();
  
  // Malinké
  if (lowerText.match(/\b(i ka|ne b[eɛ]|ka ɲi|funteni|ji ka)\b/)) {
    return LANGUAGES.MALINKE;
  }
  
  // Swahili
  if (lowerText.match(/\b(habari|nzuri|maji|samaki|bora)\b/)) {
    return LANGUAGES.SWAHILI;
  }
  
  // Hausa
  if (lowerText.match(/\b(sannu|ruwa|kifi|kyau|yaya)\b/)) {
    return LANGUAGES.HAUSA;
  }
  
  // Arabe (caractères arabes)
  if (lowerText.match(/[\u0600-\u06FF]/)) {
    return LANGUAGES.ARABIC;
  }
  
  // Anglais
  if (lowerText.match(/\b(hello|water|fish|quality|how)\b/)) {
    return LANGUAGES.ENGLISH;
  }
  
  // Par défaut : Français
  return LANGUAGES.FR;
};

// Formater un message avec termes techniques
export const formatMessageWithTechnical = (message, languageCode = currentLanguage) => {
  let formattedMessage = message;
  
  // Remplacer les termes techniques par leur traduction
  Object.keys(TECHNICAL_GLOSSARY).forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const translation = translateTechnical(term, languageCode);
    
    // Si pas en français, ajouter le terme français entre parenthèses
    if (languageCode !== LANGUAGES.FR && translation !== term) {
      const frenchTerm = TECHNICAL_GLOSSARY[term].fr;
      formattedMessage = formattedMessage.replace(regex, `${translation} (${frenchTerm})`);
    } else {
      formattedMessage = formattedMessage.replace(regex, translation);
    }
  });
  
  return formattedMessage;
};

// Obtenir le code TTS pour la langue
export const getTTSCode = (languageCode = currentLanguage) => {
  const config = LANGUAGE_CONFIG[languageCode];
  return config ? config.ttsCode : 'fr-FR';
};

// Obtenir la configuration complète d'une langue
export const getLanguageConfig = (languageCode = currentLanguage) => {
  return LANGUAGE_CONFIG[languageCode] || LANGUAGE_CONFIG.fr;
};

export default {
  LANGUAGES,
  LANGUAGE_CONFIG,
  saveLanguage,
  loadLanguage,
  getCurrentLanguage,
  translateTechnical,
  getSystemMessage,
  detectLanguage,
  formatMessageWithTechnical,
  getTTSCode,
  getLanguageConfig,
};
