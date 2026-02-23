import { Audio } from 'expo-av';

/**
 * TTS Service via Backend Proxy
 * Utilise Microsoft Edge TTS (voix réalistes) avec fallback Meta MMS
 * Le backend proxy gère la synthèse et renvoie l'audio.
 * 
 * Edge TTS (voix naturelles) :
 * - fr  → fr-FR-DeniseNeural (Français)
 * - en  → en-US-JennyNeural (English)
 * - ar  → ar-SA-ZariyahNeural (Arabe)
 * - sw  → sw-KE-ZuriNeural (Swahili)
 * 
 * Fallback MMS (langues africaines) :
 * - bci → facebook/mms-tts-bci (Baoulé)
 * - ha  → facebook/mms-tts-hau (Hausa)
 * - malinke → fallback français
 */

const SUPPORTED_LANGUAGES = ['fr', 'en', 'bci', 'ar', 'sw', 'ha', 'malinke'];

class MMSTtsService {
  constructor() {
    this.backendUrl = null;
    this.soundObject = null;
    this.isPlaying = false;
    this.onSpeakingStart = null;
    this.onSpeakingEnd = null;
    this.retryCount = 0;
    this.maxRetries = 2;
  }

  /**
   * Configure la clé API (conservé pour compatibilité, mais le backend gère la clé)
   */
  setApiKey(key) {
    // La clé est maintenant gérée côté backend
  }

  /**
   * Obtient l'URL du backend
   */
  getBackendUrl() {
    if (this.backendUrl) return this.backendUrl;
    this.backendUrl = process.env.EXPO_PUBLIC_ROBOT_BACKEND_URL || 'https://wamiappbackend.onrender.com';
    return this.backendUrl;
  }

  /**
   * Vérifie si une langue est supportée par MMS
   */
  isLanguageSupported(languageCode) {
    return SUPPORTED_LANGUAGES.includes(languageCode);
  }

  /**
   * Appelle le backend proxy pour générer l'audio TTS
   * Le backend forward la requête à Hugging Face (pas de CORS)
   */
  async generateAudio(text, languageCode = 'fr') {
    const backendUrl = this.getBackendUrl();
    const url = `${backendUrl}/tts/speak`;

    console.log(`🎤 TTS: Génération audio [${languageCode}] via backend proxy`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language: languageCode }),
    });

    if (!response.ok) {
      // Si le modèle est en cours de chargement (cold start)
      if (response.status === 503 && this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`⏳ MMS TTS: Modèle en chargement, tentative ${this.retryCount}/${this.maxRetries} dans 10s...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        return this.generateAudio(text, languageCode);
      }
      const errorText = await response.text();
      throw new Error(`MMS TTS Error (${response.status}): ${errorText}`);
    }

    this.retryCount = 0;
    const audioBlob = await response.blob();
    console.log(`✅ TTS: Audio généré (${(audioBlob.size / 1024).toFixed(1)} KB)`);
    return audioBlob;
  }

  /**
   * Synthèse vocale complète : génère et joue l'audio
   */
  async speak(text, languageCode = 'fr') {
    if (!text || !text.trim()) {
      console.log('⚠️ MMS TTS: Texte vide');
      return;
    }

    try {
      // Arrêter tout audio en cours
      await this.stop();

      // Notifier le début
      this.isPlaying = true;
      if (this.onSpeakingStart) this.onSpeakingStart();

      // Découper le texte en segments si trop long
      // Edge TTS gère bien les longs textes, on peut augmenter la limite
      const segments = this.splitText(text, 800);

      for (const segment of segments) {
        if (!this.isPlaying) break; // Arrêt demandé

        const audioBlob = await this.generateAudio(segment, languageCode);
        await this.playAudioBlob(audioBlob);
      }

      // Notifier la fin
      this.isPlaying = false;
      if (this.onSpeakingEnd) this.onSpeakingEnd();

    } catch (error) {
      console.error('❌ MMS TTS Error:', error.message);
      this.isPlaying = false;
      if (this.onSpeakingEnd) this.onSpeakingEnd();
      throw error;
    }
  }

  /**
   * Joue un blob audio via expo-av
   */
  async playAudioBlob(audioBlob) {
    try {
      // Convertir le blob en base64 data URI
      const reader = new FileReader();
      const base64Audio = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Créer et jouer le son
      const { sound } = await Audio.Sound.createAsync(
        { uri: base64Audio },
        { shouldPlay: true }
      );

      this.soundObject = sound;

      // Attendre la fin de la lecture
      await new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            resolve();
          }
        });
      });

      // Nettoyer
      await sound.unloadAsync();
      this.soundObject = null;

    } catch (error) {
      console.error('❌ MMS TTS Playback Error:', error);
      throw error;
    }
  }

  /**
   * Arrête la lecture audio
   */
  async stop() {
    this.isPlaying = false;
    if (this.soundObject) {
      try {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
      } catch (e) {
        // Ignorer les erreurs de nettoyage
      }
      this.soundObject = null;
    }
    if (this.onSpeakingEnd) this.onSpeakingEnd();
  }

  /**
   * Découpe le texte en segments de taille maximale
   * Coupe aux phrases pour un rendu naturel
   */
  splitText(text, maxLength = 400) {
    if (text.length <= maxLength) return [text];

    const segments = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).trim().length > maxLength) {
        if (current.trim()) segments.push(current.trim());
        current = sentence;
      } else {
        current = current ? current + ' ' + sentence : sentence;
      }
    }

    if (current.trim()) segments.push(current.trim());
    return segments.length > 0 ? segments : [text.substring(0, maxLength)];
  }

  /**
   * Définit les callbacks
   */
  setCallbacks(onStart, onEnd) {
    this.onSpeakingStart = onStart;
    this.onSpeakingEnd = onEnd;
  }

  /**
   * Vérifie si l'audio est en cours de lecture
   */
  isCurrentlySpeaking() {
    return this.isPlaying;
  }
}

// Instance singleton
const mmsTtsService = new MMSTtsService();

export default mmsTtsService;
