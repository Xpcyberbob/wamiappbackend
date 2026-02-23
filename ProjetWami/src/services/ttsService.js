import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import mmsTtsService from './mmsTtsService';

// Import conditionnel pour react-native-tts (seulement sur mobile)
let Tts = null;
if (Platform.OS !== 'web') {
  try {
    Tts = require('react-native-tts').default;
  } catch (error) {
    console.log('⚠️ react-native-tts non disponible, utilisation d\'expo-speech');
  }
}

/**
 * Service de synthèse vocale unifié
 * Priorité : Edge TTS (voix réalistes via backend) → react-native-tts → expo-speech
 * Edge TTS pour fr/en/ar/sw, fallback MMS pour bci/ha/malinke
 */
class TTSService {
  constructor() {
    this.isInitialized = false;
    this.isSpeaking = false;
    this.currentEngine = Platform.OS === 'web' ? 'expo-speech' : 'react-native-tts';
    this.useBackendTTS = true; // Edge TTS via backend (toujours actif, pas besoin de clé)
    this.currentLanguage = 'fr';
    this.onSpeakingStart = null;
    this.onSpeakingEnd = null;
    
    this.init();
  }

  /**
   * Initialise le service TTS
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Edge TTS via backend est toujours disponible (pas besoin de clé API)
      this.useBackendTTS = true;
      console.log('🎤 TTS Service: Edge TTS activé (voix réalistes via backend)');

      if (Tts && Platform.OS !== 'web') {
        // Configuration react-native-tts comme fallback
        await this.initReactNativeTts();
        console.log('🎤 TTS Service initialisé avec react-native-tts (fallback)');
      } else {
        // Fallback vers expo-speech
        this.currentEngine = 'expo-speech';
        console.log('🎤 TTS Service initialisé avec expo-speech (fallback)');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Erreur initialisation TTS:', error);
      this.currentEngine = 'expo-speech';
      this.isInitialized = true;
    }
  }

  /**
   * Initialise react-native-tts
   */
  async initReactNativeTts() {
    // Configuration par défaut optimisée pour le français
    Tts.setDefaultRate(0.8); // Vitesse augmentée pour plus de fluidité
    Tts.setDefaultPitch(1.1); // Pitch légèrement plus élevé pour plus de clarté
    Tts.setDefaultLanguage('fr-FR'); // Français

    // Événements
    Tts.addEventListener('tts-start', () => {
      this.isSpeaking = true;
      if (this.onSpeakingStart) this.onSpeakingStart();
    });

    Tts.addEventListener('tts-finish', () => {
      this.isSpeaking = false;
      if (this.onSpeakingEnd) this.onSpeakingEnd();
    });

    Tts.addEventListener('tts-cancel', () => {
      this.isSpeaking = false;
      if (this.onSpeakingEnd) this.onSpeakingEnd();
    });

    // Essayer de définir une voix française optimale
    try {
      const voices = await Tts.voices();
      console.log('🎤 Voix disponibles:', voices.map(v => `${v.name} (${v.language})`));
      
      const frenchVoices = voices.filter(voice => 
        voice.language.startsWith('fr') || 
        voice.name.toLowerCase().includes('french') ||
        voice.name.toLowerCase().includes('français') ||
        voice.name.toLowerCase().includes('france')
      );
      
      if (frenchVoices.length > 0) {
        // Ordre de préférence pour les voix françaises
        let selectedVoice = null;
        
        // 1. Préférer les voix natives françaises
        selectedVoice = frenchVoices.find(voice => 
          voice.language === 'fr-FR' && (
            voice.name.toLowerCase().includes('marie') ||
            voice.name.toLowerCase().includes('claire') ||
            voice.name.toLowerCase().includes('céline') ||
            voice.name.toLowerCase().includes('female')
          )
        );
        
        // 2. Sinon, toute voix française féminine
        if (!selectedVoice) {
          selectedVoice = frenchVoices.find(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('femme')
          );
        }
        
        // 3. Sinon, la première voix française disponible
        if (!selectedVoice) {
          selectedVoice = frenchVoices[0];
        }
        
        Tts.setDefaultVoice(selectedVoice.id);
        console.log('🗣️ Voix française sélectionnée:', selectedVoice.name, '(' + selectedVoice.language + ')');
      } else {
        console.log('⚠️ Aucune voix française trouvée, utilisation de la voix par défaut');
      }
    } catch (error) {
      console.log('⚠️ Impossible de configurer la voix française:', error);
    }
  }

  /**
   * Définit la langue courante pour le TTS
   */
  setLanguage(languageCode) {
    this.currentLanguage = languageCode || 'fr';
  }

  async speak(text, options = {}) {
    await this.init();

    if (!text || !text.trim()) {
      console.log('⚠️ Texte vide pour TTS');
      return;
    }

    const lang = options.language || this.currentLanguage || 'fr';

    try {
      // Nettoyer le texte
      const cleanText = this.cleanTextForSpeech(text);

      // Priorité 1 : Edge TTS via backend (voix réalistes)
      if (this.useBackendTTS) {
        try {
          await this.speakWithBackendTTS(cleanText, lang);
          return;
        } catch (backendError) {
          console.log('⚠️ Backend TTS échoué, fallback local:', backendError.message);
        }
      }
      
      // Priorité 2 : react-native-tts (mobile)
      if (this.currentEngine === 'react-native-tts' && Tts) {
        await this.speakWithReactNativeTts(cleanText, options);
      } else {
        // Priorité 3 : expo-speech (web/fallback)
        await this.speakWithExpoSpeech(cleanText, options);
      }
    } catch (error) {
      console.error('❌ Erreur TTS:', error);
      // Dernier fallback vers expo-speech
      if (this.currentEngine === 'react-native-tts') {
        console.log('🔄 Fallback vers expo-speech');
        await this.speakWithExpoSpeech(this.cleanTextForSpeech(text), options);
      }
    }
  }

  /**
   * Synthèse avec Edge TTS via backend (voix réalistes)
   */
  async speakWithBackendTTS(text, languageCode = 'fr') {
    mmsTtsService.setCallbacks(
      () => {
        this.isSpeaking = true;
        if (this.onSpeakingStart) this.onSpeakingStart();
      },
      () => {
        this.isSpeaking = false;
        if (this.onSpeakingEnd) this.onSpeakingEnd();
      }
    );
    await mmsTtsService.speak(text, languageCode);
  }

  /**
   * Synthèse avec react-native-tts
   */
  async speakWithReactNativeTts(text, options = {}) {
    // Configurer les paramètres si fournis
    if (options.rate) Tts.setDefaultRate(options.rate);
    if (options.pitch) Tts.setDefaultPitch(options.pitch);
    
    // Parler
    Tts.speak(text);
  }

  /**
   * Synthèse avec expo-speech
   */
  async speakWithExpoSpeech(text, options = {}) {
    this.isSpeaking = true;
    if (this.onSpeakingStart) this.onSpeakingStart();

    Speech.speak(text, {
      language: 'fr-FR',
      pitch: options.pitch || 0.95,
      rate: options.rate || 0.8,
      quality: 'enhanced',
      voice: 'com.apple.ttsbundle.Audrey-compact',
      onDone: () => {
        this.isSpeaking = false;
        if (this.onSpeakingEnd) this.onSpeakingEnd();
        if (options.onDone) options.onDone();
      },
      onStopped: () => {
        this.isSpeaking = false;
        if (this.onSpeakingEnd) this.onSpeakingEnd();
        if (options.onStopped) options.onStopped();
      },
      onError: (error) => {
        console.error('❌ Expo Speech Error:', error);
        this.isSpeaking = false;
        if (this.onSpeakingEnd) this.onSpeakingEnd();
        if (options.onError) options.onError(error);
      },
    });
  }

  /**
   * Arrête la synthèse vocale
   */
  async stop() {
    try {
      // Arrêter le TTS backend si actif
      if (this.useBackendTTS) {
        await mmsTtsService.stop();
      }

      if (this.currentEngine === 'react-native-tts' && Tts) {
        Tts.stop();
      } else {
        Speech.stop();
      }
      
      this.isSpeaking = false;
      if (this.onSpeakingEnd) this.onSpeakingEnd();
    } catch (error) {
      console.error('❌ Erreur arrêt TTS:', error);
    }
  }

  /**
   * Nettoie le texte pour la synthèse vocale française
   */
  cleanTextForSpeech(text) {
    if (!text) return '';
    
    return text
      // Remplacer les unités de mesure par leur prononciation française
      .replace(/°C/g, ' degrés Celsius')
      .replace(/°F/g, ' degrés Fahrenheit')
      .replace(/mg\/L/g, ' milligrammes par litre')
      .replace(/g\/L/g, ' grammes par litre')
      .replace(/kg/g, ' kilogrammes')
      .replace(/NTU/g, ' unités de turbidité néphélométrique')
      .replace(/ppt/g, ' parties par millier')
      .replace(/pH/g, ' pé hache') // Meilleure prononciation française
      .replace(/%/g, ' pourcent')
      
      // Remplacer les formules chimiques
      .replace(/\bO2\b/g, 'oxygène')
      .replace(/\bCO2\b/g, 'dioxyde de carbone')
      .replace(/\bNH3\b/g, 'ammoniaque')
      .replace(/\bNH4\b/g, 'ammonium')
      .replace(/\bNO2\b/g, 'nitrite')
      .replace(/\bNO3\b/g, 'nitrate')
      
      // Améliorer la prononciation des mots techniques
      .replace(/\bpisciculture\b/g, 'pisciculture')
      .replace(/\baquaculture\b/g, 'aquaculture')
      .replace(/\bturbidité\b/g, 'turbidité')
      .replace(/\bsalinité\b/g, 'salinité')
      .replace(/\bammoniaque\b/g, 'ammoniaque')
      
      // Supprimer les astérisques (gras/italique markdown)
      .replace(/\*\*/g, '')                   // Astérisques doubles (gras)
      .replace(/\*/g, '')                     // Astérisques simples (italique)
      .replace(/__/g, '')                     // Underscores doubles
      .replace(/_/g, '')                      // Underscores simples
      
      // Supprimer les tirets et caractères de formatage
      .replace(/^[-•]\s+/gm, '')              // Tirets en début de ligne (listes)
      .replace(/\n-\s+/g, '\n')               // Tirets de liste
      .replace(/—/g, ' ')                     // Tiret cadratin
      .replace(/–/g, ' ')                     // Tiret demi-cadratin
      .replace(/~/g, '')                      // Tilde
      .replace(/`/g, '')                      // Backticks (code)
      .replace(/\[|\]/g, '')                  // Crochets
      .replace(/\{|\}/g, '')                  // Accolades
      
      // Supprimer les emojis
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symboles et pictogrammes
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport et symboles de carte
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Drapeaux
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Symboles divers
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Emojis supplémentaires
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Emojis étendus
      
      // Supprimer les symboles spéciaux restants
      .replace(/[•●○■□▪▫]/g, '')              // Puces
      .replace(/[→←↑↓⇒⇐]/g, '')              // Flèches
      .replace(/[✓✔✗✘]/g, '')                // Coches
      .replace(/[⚠️⚡]/g, '')                  // Symboles d'avertissement
      
      // Nettoyer les espaces multiples et sauts de ligne
      .replace(/\n+/g, '. ')                  // Remplacer sauts de ligne par des points
      .replace(/\s+/g, ' ')                   // Espaces multiples → 1 espace
      .trim();
  }

  /**
   * Définit les callbacks
   */
  setCallbacks(onStart, onEnd) {
    this.onSpeakingStart = onStart;
    this.onSpeakingEnd = onEnd;
  }

  /**
   * Vérifie si la synthèse est en cours
   */
  isCurrentlySpeaking() {
    return this.isSpeaking;
  }

  /**
   * Obtient les voix disponibles (react-native-tts seulement)
   */
  async getAvailableVoices() {
    if (this.currentEngine === 'react-native-tts' && Tts) {
      try {
        return await Tts.voices();
      } catch (error) {
        console.error('❌ Erreur récupération voix:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Définit une voix spécifique (react-native-tts seulement)
   */
  async setVoice(voiceId) {
    if (this.currentEngine === 'react-native-tts' && Tts) {
      try {
        Tts.setDefaultVoice(voiceId);
        console.log('🗣️ Voix changée:', voiceId);
      } catch (error) {
        console.error('❌ Erreur changement voix:', error);
      }
    }
  }
}

// Instance singleton
const ttsService = new TTSService();

export default ttsService;
