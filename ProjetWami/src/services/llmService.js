import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getCurrentLanguage, LANGUAGES, getSystemMessage } from './languageService';

// Configuration du LLM - Google Gemini (Principal, Gratuit)
const GEMINI_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY 
  || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Backup 1 : Groq (Gratuit)
const GROQ_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GROQ_API_KEY 
  || process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Backup 2 : OpenAI (Payant)
const OPENAI_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY 
  || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Debug: Vérifier les clés API
console.log('🚀 Gemini API Key présente:', GEMINI_API_KEY ? 'Oui (' + GEMINI_API_KEY.substring(0, 10) + '...)' : 'Non');
console.log('🔑 Groq API Key présente (backup 1):', GROQ_API_KEY ? 'Oui (' + GROQ_API_KEY.substring(0, 10) + '...)' : 'Non');
console.log('🔑 OpenAI API Key présente (backup 2):', OPENAI_API_KEY ? 'Oui (' + OPENAI_API_KEY.substring(0, 10) + '...)' : 'Non');
console.log('🌐 Environment:', process.env.NODE_ENV);
console.log('📱 Platform:', Platform?.OS || 'unknown');

// Contexte système pour Wami-IA (multilingue)
const getSystemPrompt = (languageCode) => {
  const languageInstructions = {
    fr: 'Réponds en français simple et clair.',
    malinke: 'Réponds en Malinké (Maninkakan). Utilise les termes techniques en français entre parenthèses. Exemple: "Funteni (Température) ye 26°C ye."',
    sw: 'Jibu kwa Kiswahili rahisi na wazi.',
    ha: 'Ka amsa da Hausa mai sauƙi da bayani.',
    en: 'Respond in simple and clear English.',
    bci: 'Réponds en Baoulé. Utilise les termes techniques en français entre parenthèses si nécessaire.',
    ar: 'أجب بالعربية البسيطة والواضحة.',
  };

  return `Tu es Wami-IA, assistante en pisciculture.

RÈGLE PRINCIPALE : Réponds UNIQUEMENT à ce que l'utilisateur demande. Rien de plus.

COMPORTEMENT STRICT :
- Si on te dit "Bonjour" → réponds juste "Bonjour ! Comment puis-je t'aider ?". RIEN D'AUTRE.
- Si on te demande la température → donne SEULEMENT la température. Ne parle pas du pH, de l'oxygène, etc.
- Si on te demande un conseil → donne UN conseil précis. Pas une liste de 10 choses.
- Si on te demande tous les paramètres → là seulement, donne tout.
- N'ajoute JAMAIS d'informations non demandées.
- Ne répète JAMAIS ce que tu as déjà dit.
- Maximum 2-3 phrases par réponse.

STYLE :
- Phrases courtes et directes
- Tutoiement
- 1 emoji max par réponse
- Pas de listes à puces sauf si demandé

ANALYSE (uniquement si des données sont fournies) :
- Température : OPTIMAL 25-28°C | ATTENTION 22-25 ou 28-30°C | CRITIQUE <22 ou >30°C
- pH : OPTIMAL 7.0-7.5 | ATTENTION 6.5-7.0 ou 7.5-8.0 | CRITIQUE <6.5 ou >8.0
- Oxygène : OPTIMAL >6 mg/L | ATTENTION 4-6 | CRITIQUE <4
- Ammoniaque : OPTIMAL <0.25 mg/L | ATTENTION 0.25-0.5 | CRITIQUE >0.5
- Turbidité : OPTIMAL <20 NTU | ATTENTION 20-30 | CRITIQUE >30
- Salinité : OPTIMAL 0.3-0.7 ppt | ATTENTION 0.1-0.3 ou 0.7-1.0 | CRITIQUE <0.1 ou >1.0
- Si un paramètre est hors norme, signale-le et donne UNE action corrective.

INTERDICTIONS :
1. JAMAIS de format JSON {}
2. JAMAIS d'informations non demandées
3. JAMAIS de répétitions
4. JAMAIS de longs paragraphes

${languageInstructions[languageCode] || languageInstructions.fr}`;
};

/**
 * Appel à Google Gemini (Principal, Gratuit)
 * @param {Array} messages - Historique de conversation
 * @param {string} languageCode - Code de langue
 * @returns {Promise<Object>} Réponse du LLM
 */
export const callGemini = async (messages, languageCode = 'fr', signal = null) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Clé API Gemini non configurée');
    }

    console.log('🚀 Appel Google Gemini (gemini-2.0-flash)...');

    // Convertir les messages au format Gemini
    const geminiContents = [];
    
    // Ajouter le system prompt comme premier message utilisateur contextuel
    const systemPrompt = getSystemPrompt(languageCode);
    
    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const url = `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
      ...(signal ? { signal } : {}),
    });

    console.log('📥 Réponse Gemini, status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Gemini');
    }

    const data = await response.json();
    console.log('✅ Réponse Gemini OK');
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Réponse Gemini vide');
    }

    // Essayer de parser en JSON
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (e) {
      console.log('📝 Réponse naturelle reçue (pas de JSON)');
      
      const suggestions = [];
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.trim().match(/^[-•]\s+(.+)/)) {
          const suggestion = line.trim().replace(/^[-•]\s+/, '');
          if (suggestion.length > 0 && suggestions.length < 3) {
            suggestions.push(suggestion);
          }
        }
      });
      
      if (suggestions.length === 0) {
        suggestions.push('Voir les détails', 'Analyser plus', 'Historique');
      }
      
      return {
        response: content,
        suggestions: suggestions,
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel à Gemini:', error);
    throw error;
  }
};

/**
 * Appel à Groq (Backup 1, Gratuit)
 * @param {Array} messages - Historique de conversation
 * @param {string} languageCode - Code de langue
 * @returns {Promise<Object>} Réponse du LLM
 */
export const callGroq = async (messages, languageCode = 'fr', signal = null) => {
  try {
    console.log('🚀 Appel Groq avec clé:', GROQ_API_KEY ? GROQ_API_KEY.substring(0, 15) + '...' : 'AUCUNE');
    
    if (!GROQ_API_KEY) {
      throw new Error('Clé API Groq non configurée');
    }

    console.log('📤 Envoi requête à Groq (Llama 3.3 70B)...');
    
    // Nettoyer les messages pour éviter les références circulaires
    const cleanMessages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : String(msg.content || '')
    }));
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Modèle production Groq, excellent multilingue
        messages: [
          { role: 'system', content: getSystemPrompt(languageCode) },
          ...cleanMessages,
        ],
        temperature: 0.7,
        max_tokens: 500,
        // Note: Groq ne supporte pas response_format pour tous les modèles
      }),
      ...(signal ? { signal } : {}),
    });

    console.log('📥 Réponse reçue, status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erreur Groq:', error);
      throw new Error(error.error?.message || 'Erreur API Groq');
    }

    const data = await response.json();
    console.log('✅ Réponse Groq OK');
    const content = data.choices[0].message.content;
    
    // Essayer de parser en JSON d'abord (pour compatibilité)
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (e) {
      // Si ce n'est pas du JSON, c'est une réponse naturelle (ce qu'on veut !)
      console.log('📝 Réponse naturelle reçue (pas de JSON)');
      
      // Extraire les suggestions si elles sont présentes dans le texte
      const suggestions = [];
      const lines = content.split('\n');
      
      lines.forEach(line => {
        // Détecter les lignes qui commencent par - ou • (suggestions)
        if (line.trim().match(/^[-•]\s+(.+)/)) {
          const suggestion = line.trim().replace(/^[-•]\s+/, '');
          if (suggestion.length > 0 && suggestions.length < 3) {
            suggestions.push(suggestion);
          }
        }
      });
      
      // Si pas de suggestions trouvées, en générer des génériques
      if (suggestions.length === 0) {
        suggestions.push('Voir les détails', 'Analyser plus', 'Historique');
      }
      
      return {
        response: content,
        suggestions: suggestions,
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel à Groq:', error);
    throw error;
  }
};

/**
 * Appel à OpenAI (backup)
 * @param {Array} messages - Historique de conversation
 * @param {string} languageCode - Code de langue
 * @returns {Promise<Object>} Réponse du LLM
 */
export const callOpenAI = async (messages, languageCode = 'fr', signal = null) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('Clé API OpenAI non configurée');
    }

    console.log('🚀 Appel OpenAI GPT-4o-mini...');

    // Nettoyer les messages pour éviter les références circulaires
    const cleanMessages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : String(msg.content || '')
    }));

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: getSystemPrompt(languageCode) },
          ...cleanMessages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
      ...(signal ? { signal } : {}),
    });

    console.log('📥 Réponse OpenAI, status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API OpenAI');
    }

    const data = await response.json();
    console.log('✅ Réponse OpenAI OK');
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (e) {
      console.log('📝 Réponse naturelle reçue (pas de JSON)');
      
      const suggestions = [];
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.trim().match(/^[-•]\s+(.+)/)) {
          const suggestion = line.trim().replace(/^[-•]\s+/, '');
          if (suggestion.length > 0 && suggestions.length < 3) {
            suggestions.push(suggestion);
          }
        }
      });
      
      if (suggestions.length === 0) {
        suggestions.push('Voir les détails', 'Analyser plus', 'Historique');
      }
      
      return {
        response: content,
        suggestions: suggestions,
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel à OpenAI:', error);
    throw error;
  }
};

/**
 * Appel à Anthropic Claude (alternative)
 * @param {Array} messages - Historique de conversation
 * @returns {Promise<Object>} Réponse du LLM
 */
export const callClaude = async (messages) => {
  const ANTHROPIC_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

  try {
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      throw new Error('Clé API Anthropic non configurée');
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        system: getSystemPrompt('fr'),
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Anthropic');
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      return {
        response: content,
        suggestions: ['Voir les détails', 'Analyser plus', 'Historique'],
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel à Claude:', error);
    throw error;
  }
};

/**
 * Appel à Ollama (local, gratuit)
 * @param {Array} messages - Historique de conversation
 * @returns {Promise<Object>} Réponse du LLM
 */
export const callOllama = async (messages) => {
  const OLLAMA_URL = 'http://localhost:11434/api/chat';

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // ou 'mistral', 'codellama', etc.
        messages: [
          { role: 'system', content: getSystemPrompt('fr') },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur Ollama. Assurez-vous qu\'Ollama est lancé.');
    }

    const data = await response.json();
    const content = data.message.content;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      return {
        response: content,
        suggestions: ['Voir les détails', 'Analyser plus', 'Historique'],
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel à Ollama:', error);
    throw error;
  }
};

/**
 * Fonction principale pour appeler le LLM configuré (multilingue)
 * @param {string} userMessage - Message de l'utilisateur
 * @param {Array} conversationHistory - Historique de conversation
 * @param {string} languageCode - Code de langue (optionnel, détecté automatiquement)
 * @param {Object} waterData - Données actuelles de l'eau (optionnel)
 * @returns {Promise<Object>} Réponse du LLM
 */
export const getLLMResponse = async (userMessage, conversationHistory = [], languageCode = null, waterData = null, signal = null) => {
  // Obtenir la langue actuelle ou détecter
  const currentLang = languageCode || getCurrentLanguage();
  
  // Construire l'historique au format attendu
  const messages = conversationHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

  // Si on a des données d'eau, les inclure dans le contexte (sauf en mode apprentissage)
  let contextualMessage = userMessage;
  
  // Vérifier si c'est le mode apprentissage
  const isLearningMode = userMessage.includes('MODE APPRENTISSAGE') || userMessage.includes('Je suis débutant en pisciculture');
  
  if (waterData && !isLearningMode) {
    console.log('🌊 Données d\'eau transmises à l\'IA:', waterData);
    const waterContext = `
DONNÉES ACTUELLES DE L'EAU (à utiliser pour ton analyse) :
- Température : ${waterData.temperature}°C
- pH : ${waterData.ph}
- Oxygène : ${waterData.oxygen} mg/L
- Ammoniaque : ${waterData.ammonia} mg/L
- Turbidité : ${waterData.turbidity} NTU
- Salinité : ${waterData.salinity} ppt

IMPORTANT : Utilise CES données exactes dans ta réponse, pas des valeurs génériques !

Question de l'utilisateur : ${userMessage}`;
    contextualMessage = waterContext;
  } else if (isLearningMode) {
    console.log('📚 Mode apprentissage détecté - Pas de données d\'eau transmises');
    contextualMessage = userMessage;
  } else {
    console.log('⚠️ Aucune donnée d\'eau transmise à l\'IA');
  }

  // Ajouter le nouveau message
  messages.push({
    role: 'user',
    content: contextualMessage,
  });

  // Appeler Groq en priorité (gratuit), fallback Gemini, puis OpenAI
  try {
    console.log('🎯 Tentative avec Groq...');
    return await callGroq(messages, currentLang, signal);
  } catch (groqError) {
    // Si la requête a été annulée, ne pas essayer les fallbacks
    if (groqError.name === 'AbortError') throw groqError;
    console.warn('⚠️ Groq échoué, tentative avec Gemini...', groqError.message);
    
    try {
      return await callGemini(messages, currentLang, signal);
    } catch (geminiError) {
      if (geminiError.name === 'AbortError') throw geminiError;
      console.warn('⚠️ Gemini échoué, tentative avec OpenAI...', geminiError.message);
      try {
        return await callOpenAI(messages, currentLang, signal);
      } catch (openaiError) {
        if (openaiError.name === 'AbortError') throw openaiError;
        console.error('❌ OpenAI aussi échoué:', openaiError.message);
      }
    }
    
    // Fallback sur réponse locale multilingue si les deux APIs échouent
    const fallbackMessages = {
      fr: "Je rencontre un problème de connexion. Voici ce que je peux vous dire avec mes données locales : Tous vos paramètres sont dans les normes optimales.",
      malinke: "N bɛ gɛlɛya sɔrɔ ka kɛ ɲɔgɔn cɛ. Nin ye n bɛ se ka fɔ i ye ne ka kunnafoniw la : I ka fɛɛn bɛɛ bɛ ɲuman na.",
      sw: "Nina tatizo la muunganisho. Hii ndiyo ninachoweza kukuambia kutoka kwa data yangu ya ndani: Vipimo vyako vyote viko vizuri.",
      ha: "Ina fuskantar matsala ta haɗi. Ga abin da zan iya faɗa muku da bayanan gida: Duk abubuwan ku suna daidai.",
      en: "I'm experiencing a connection issue. Here's what I can tell you from my local data: All your parameters are within optimal ranges.",
      ar: "أواجه مشكلة في الاتصال. إليك ما يمكنني إخبارك به من بياناتي المحلية: جميع معاييرك ضمن النطاقات المثلى.",
    };
    
    return {
      response: fallbackMessages[currentLang] || fallbackMessages.fr,
      suggestions: ['Réessayer', 'Voir les données', 'Rapport local'],
    };
  }
};

export default {
  getLLMResponse,
  callGemini,
  callGroq,
  callOpenAI,
  callClaude,
  callOllama,
};