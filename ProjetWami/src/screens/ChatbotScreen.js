import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import ttsService from '../services/ttsService';
import { Audio } from 'expo-av';
import WamiAvatar from '../components/WamiAvatar';
import LanguageSelector from '../components/LanguageSelector';
import { getLLMResponse } from '../services/llmService';
import { 
  loadLanguage, 
  getCurrentLanguage, 
  getSystemMessage,
  getTTSCode 
} from '../services/languageService';
import { useWaterData } from '../contexts/WaterDataContext';

export default function ChatbotScreen({ onClose, initialMessage = null }) {
  // Vérification de sécurité : s'assurer que initialMessage est une chaîne ou null
  const safeInitialMessage = (typeof initialMessage === 'string') ? initialMessage : null;
  
  const { waterData } = useWaterData(); // Accès aux données actuelles de l'eau
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [messages, setMessages] = useState(
    safeInitialMessage ? [] : [{
      id: 1,
      text: 'Bonjour, je suis Wami-IA, votre assistante intelligente pour la pisciculture. J\'ai analysé vos données et tout semble optimal. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['Voir les prédictions', 'État du robot', 'Rapport quotidien'],
    }]
  );
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [useLLM, setUseLLM] = useState(true); // Toggle pour activer/désactiver le LLM
  const [isRequestInProgress, setIsRequestInProgress] = useState(false); // Empêcher requêtes multiples
  const scrollViewRef = useRef();
  const abortControllerRef = useRef(null); // Pour annuler les requêtes

  const quickActions = [
    { id: 1, text: 'Analyse complète', icon: 'analytics' },
    { id: 2, text: 'Prédictions IA', icon: 'trending-up' },
    { id: 3, text: 'Contrôle robot', icon: 'hardware-chip' },
    { id: 4, text: 'Rapport quotidien', icon: 'document-text' },
  ];

  // Charger la langue au démarrage
  useEffect(() => {
    loadLanguage().then(lang => {
      setCurrentLanguage(lang);
      
      // Si on a un message initial, envoyer automatiquement à l'IA
      if (safeInitialMessage) {
        // Créer le message utilisateur
        const userMessage = {
          id: 1,
          text: safeInitialMessage,
          sender: 'user',
          timestamp: new Date(),
        };
        
        setMessages([userMessage]);
        setIsTyping(true);
        setIsRequestInProgress(true);
        
        // Envoyer automatiquement à l'IA après un court délai
        setTimeout(() => {
          if (useLLM) {
            getLLMResponse(safeInitialMessage, [], lang, waterData, null)
              .then(async ({ response, suggestions }) => {
                setIsTyping(false);
                setIsRequestInProgress(false);
                
                const botMessage = {
                  id: 2,
                  text: response,
                  sender: 'bot',
                  timestamp: new Date(),
                  suggestions: suggestions || ['Voir plus', 'Analyser', 'Historique'],
                };
                setMessages(prev => [...prev, botMessage]);
                
                // Lire la réponse automatiquement
                try {
                  await speakText(response, lang);
                } catch (ttsError) {
                  console.log('🔇 Synthèse vocale non disponible sur cette plateforme:', ttsError.message);
                  setIsSpeaking(false);
                }
              })
              .catch((error) => {
                console.error('❌ Erreur LLM détaillée:', error);
                setIsTyping(false);
                setIsRequestInProgress(false);
                
                // Message d'erreur détaillé pour le debug
                let errorText = "Je suis désolée, j'ai rencontré un problème technique. ";
                
                if (error.message.includes('API')) {
                  errorText += "Problème de connexion avec le serveur IA. ";
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                  errorText += "Problème de réseau. Vérifiez votre connexion internet. ";
                } else {
                  errorText += `Erreur: ${error.message} `;
                }
                
                errorText += "Vous pouvez utiliser les suggestions ci-dessous ou réessayer.";
                
                const errorMessage = {
                  id: 2,
                  text: errorText,
                  sender: 'bot',
                  timestamp: new Date(),
                  suggestions: ['Réessayer', 'Mode local', 'Voir les données'],
                };
                setMessages(prev => [...prev, errorMessage]);
              });
          }
        }, 500);
      } else {
        // Mettre à jour le message d'accueil par défaut
        const greeting = getSystemMessage('greeting', lang);
        const helpMsg = getSystemMessage('helpMessage', lang);
        setMessages([{
          id: 1,
          text: `${greeting} ${helpMsg}`,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: ['Voir les prédictions', 'État du robot', 'Rapport quotidien'],
        }]);
      }
    });
  }, [safeInitialMessage]);

  // Arrêter la synthèse vocale quand on quitte l'écran
  useEffect(() => {
    return () => {
      // Cleanup: Arrêter la synthèse vocale
      ttsService.stop();
      console.log('🔇 Synthèse vocale arrêtée (écran quitté)');
    };
  }, []);

  // Gérer le changement de langue
  const handleLanguageChange = (newLang) => {
    setCurrentLanguage(newLang);
    const greeting = getSystemMessage('greeting', newLang);
    const helpMsg = getSystemMessage('helpMessage', newLang);
    
    // Ajouter un message de confirmation
    const confirmMessage = {
      id: Date.now(),
      text: `${greeting} ${helpMsg}`,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['Analyse', 'Prédictions', 'Robot'],
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  // Suggestions proactives de Wami-IA
  useEffect(() => {
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      let proactiveSuggestion = '';
      
      if (hour >= 6 && hour < 9) {
        proactiveSuggestion = 'Bonjour ! J\'ai remarqué que c\'est l\'heure de l\'alimentation matinale. Voulez-vous que j\'active le robot pour distribuer la nourriture ?';
      } else if (hour >= 12 && hour < 14) {
        proactiveSuggestion = 'Il est temps de vérifier les paramètres de l\'eau. Voulez-vous que je lance une analyse complète ?';
      } else if (hour >= 18 && hour < 20) {
        proactiveSuggestion = 'Bonsoir ! Voici votre résumé de la journée : Température stable à 26.5°C, pH optimal à 7.2. Tout est sous contrôle.';
      }
      
      if (proactiveSuggestion && messages.length === 1) {
        const suggestion = {
          id: messages.length + 1,
          text: proactiveSuggestion,
          sender: 'bot',
          timestamp: new Date(),
          isProactive: true,
          suggestions: ['Oui, lance l\'analyse', 'Plus tard', 'Voir les détails'],
        };
        setMessages(prev => [...prev, suggestion]);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Demander les permissions audio
    (async () => {
      await Audio.requestPermissionsAsync();
    })();
  }, []);

  // Fonction pour nettoyer le texte des emojis et caractères spéciaux avant la synthèse vocale
  const cleanTextForSpeech = (text) => {
    return text
      // Remplacer les unités de mesure par leur prononciation
      .replace(/°C/g, ' degrés Celsius')
      .replace(/°F/g, ' degrés Fahrenheit')
      .replace(/mg\/L/g, ' milligrammes par litre')
      .replace(/g\/L/g, ' grammes par litre')
      .replace(/kg/g, ' kilogrammes')
      .replace(/NTU/g, ' unités de turbidité')
      .replace(/ppt/g, ' parties par millier')
      .replace(/pH/g, ' pH')
      .replace(/%/g, ' pourcent')
      
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
  };


// Fonction helper pour la synthèse vocale
const speakText = async (text, language = null) => {
  try {
    // Configurer la langue pour Meta MMS
    const lang = language || currentLang || 'fr';
    ttsService.setLanguage(lang);

    // Configurer les callbacks du service TTS
    ttsService.setCallbacks(
      () => setIsSpeaking(true),   // onStart
      () => setIsSpeaking(false)   // onEnd
    );
    
    // Utiliser le service TTS unifié (Meta MMS → react-native-tts → expo-speech)
    await ttsService.speak(text, {
      language: lang,
      rate: 0.8,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onError: (error) => {
        console.error('❌ TTS Error:', error);
        setIsSpeaking(false);
      },
    });
    
  } catch (error) {
    console.error('❌ TTS Error:', error);
    setIsSpeaking(false);
  }
};

const stopRequest = () => {
  // Arrêter la requête en cours
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }
  
  // Arrêter la synthèse vocale
  ttsService.stop();
  
  // Réinitialiser les états
  setIsTyping(false);
  setIsSpeaking(false);
  setIsRequestInProgress(false);
  
  console.log('🛑 Requête arrêtée par l\'utilisateur');
};

  const sendMessage = (text) => {
    if (!text.trim()) return;
    
    // Si l'IA parle ou une requête est en cours, tout arrêter pour la nouvelle requête
    if (isSpeaking || isRequestInProgress) {
      // Annuler la requête LLM en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Arrêter la synthèse vocale
      ttsService.stop();
      setIsSpeaking(false);
      setIsTyping(false);
      setIsRequestInProgress(false);
      console.log('🔇 Requête/TTS précédente interrompue pour nouvelle requête');
    }

    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);
    setIsRequestInProgress(true);
    
    // Créer un nouveau AbortController pour cette requête
    abortControllerRef.current = new AbortController();

    // Appeler le LLM ou utiliser les réponses locales
    if (useLLM) {
      // Utiliser le vrai LLM avec les données actuelles
      getLLMResponse(text, messages, currentLanguage, waterData, abortControllerRef.current?.signal)
        .then(async ({ response, suggestions }) => {
          setIsTyping(false);
          setIsRequestInProgress(false);
          abortControllerRef.current = null;
          
          const botMessage = {
            id: Date.now() + 1,
            text: response,
            sender: 'bot',
            timestamp: new Date(),
            suggestions: suggestions || ['Voir plus', 'Analyser', 'Historique'],
          };
          setMessages(prev => [...prev, botMessage]);
          
          // Voix pour Wami-IA avec animation (multilingue)
          setIsSpeaking(true);
          const ttsLanguage = getTTSCode(currentLanguage);
          console.log('🔊 TTS Language:', ttsLanguage, 'for', currentLanguage);
          
          // Utiliser notre fonction speakText avec ElevenLabs
          await speakText(response, currentLanguage);
        })
        .catch((error) => {
          // Ignorer les erreurs d'annulation
          if (error.name === 'AbortError') {
            console.log('🛑 Requête annulée');
            return;
          }
          
          console.error('Erreur LLM:', error);
          setIsTyping(false);
          setIsRequestInProgress(false);
          abortControllerRef.current = null;
          
          // Fallback sur réponse locale
          const { response, suggestions } = generateWamiResponse(text);
          const botMessage = {
            id: Date.now() + 2,
            text: response + '\n\n⚠️ (Mode local - LLM non disponible)',
            sender: 'bot',
            timestamp: new Date(),
            suggestions: suggestions,
          };
          setMessages(prev => [...prev, botMessage]);
        });
    } else {
      // Utiliser les réponses locales (mode hors ligne)
      setTimeout(async () => {
        const { response, suggestions } = generateWamiResponse(text);
        setIsTyping(false);
        setIsRequestInProgress(false);
        abortControllerRef.current = null;
        
        const botMessage = {
          id: Date.now() + 3,
          text: response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: suggestions,
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Voix pour Wami-IA avec animation (multilingue)
        setIsSpeaking(true);
        const ttsLanguage = getTTSCode(currentLanguage);
        console.log('🔊 TTS Language (fallback):', ttsLanguage, 'for', currentLanguage);
        
        // Utiliser notre fonction speakText avec ElevenLabs
        await speakText(response, currentLanguage);
      }, 1200);
    }
  };

  const generateWamiResponse = (userText) => {
    const lowerText = userText.toLowerCase();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bien sûr' : hour < 18 ? 'Absolument' : 'Certainement';

    // Réponses contextuelles et intelligentes
    if (lowerText.includes('température') || lowerText.includes('temp')) {
      return {
        response: `${greeting}. J'ai analysé la température : elle est actuellement de 26.5°C, ce qui est parfait pour vos poissons. Mes prédictions indiquent une stabilité pour les prochaines 24 heures.`,
        suggestions: ['Voir l\'historique', 'Prédictions 7 jours', 'Alertes température']
      };
    } else if (lowerText.includes('ph')) {
      return {
        response: `Le pH est à 7.2, dans la zone optimale. J'ai remarqué une légère tendance à la hausse ces derniers jours. Je vous suggère de surveiller cela de près.`,
        suggestions: ['Voir les tendances', 'Recommandations', 'Historique pH']
      };
    } else if (lowerText.includes('oxygène') || lowerText.includes('o2')) {
      return {
        response: `Excellent niveau d'oxygène dissous à 8.5 mg/L ! Vos systèmes d'aération fonctionnent parfaitement. Je continue de surveiller en temps réel.`,
        suggestions: ['État des aérateurs', 'Graphique O2', 'Optimiser l\'aération']
      };
    } else if (lowerText.includes('alimentation') || lowerText.includes('nourriture')) {
      return {
        response: `Vous distribuez actuellement 2.5 kg/jour. Selon mes calculs basés sur la croissance de vos poissons, c'est optimal. Voulez-vous que je programme l'alimentation automatique ?`,
        suggestions: ['Programmer alimentation', 'Ajuster quantité', 'Historique alimentation']
      };
    } else if (lowerText.includes('maladie') || lowerText.includes('santé')) {
      return {
        response: `J'ai analysé les comportements et tous les indicateurs sont au vert. Aucun signe de maladie détecté. Je reste vigilante et vous alerterai immédiatement en cas d'anomalie.`,
        suggestions: ['Rapport santé', 'Prévention', 'Historique maladies']
      };
    } else if (lowerText.includes('robot')) {
      return {
        response: `Le robot poisson est en mode surveillance, batterie à 85%. Il a inspecté 4 zones aujourd'hui. Voulez-vous que je le déploie vers une zone spécifique ?`,
        suggestions: ['Voir la carte', 'Déployer robot', 'Historique missions']
      };
    } else if (lowerText.includes('prédiction') || lowerText.includes('prévoir')) {
      return {
        response: `Mes prédictions IA indiquent des conditions stables pour les 7 prochains jours. Température moyenne prévue : 26.8°C. Aucune alerte anticipée.`,
        suggestions: ['Voir prédictions', 'Graphiques', 'Exporter rapport']
      };
    } else if (lowerText.includes('rapport') || lowerText.includes('résumé')) {
      return {
        response: `Voici votre rapport quotidien : ✓ Température : 26.5°C (optimal) ✓ pH : 7.2 (parfait) ✓ O2 : 8.5 mg/L (excellent) ✓ Robot : Opérationnel. Tout est sous contrôle !`,
        suggestions: ['Rapport détaillé', 'Exporter PDF', 'Historique rapports']
      };
    } else if (lowerText.includes('analyse') || lowerText.includes('analyser')) {
      return {
        response: `J'ai effectué une analyse complète de votre système. Tous les paramètres sont dans les normes. Efficacité globale : 97%. Excellent travail !`,
        suggestions: ['Voir détails', 'Recommandations', 'Optimisations']
      };
    } else if (lowerText.includes('merci') || lowerText.includes('thanks')) {
      return {
        response: `Avec plaisir ! Je suis toujours là pour vous aider. N'hésitez pas si vous avez d'autres questions.`,
        suggestions: ['Autre question', 'Rapport quotidien', 'Fermer']
      };
    } else if (lowerText.includes('bonjour') || lowerText.includes('salut') || lowerText.includes('hello')) {
      return {
        response: `Bonjour ! Ravi de vous revoir. J'ai surveillé vos installations pendant votre absence et tout fonctionne parfaitement. Que puis-je faire pour vous ?`,
        suggestions: ['État général', 'Prédictions', 'Contrôle robot']
      };
    } else {
      return {
        response: `J'ai bien compris votre demande. Laissez-moi analyser les données... D'après mes informations, votre pisciculture fonctionne de manière optimale. Souhaitez-vous des détails sur un paramètre spécifique ?`,
        suggestions: ['Qualité eau', 'Robot', 'Prédictions', 'Rapport']
      };
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    // Simuler la transcription vocale avec Wami-IA
    const simulatedTranscription = 'Wami-IA, donne-moi un rapport complet';
    sendMessage(simulatedTranscription);
  };

  const handleQuickAction = (action) => {
    sendMessage(action);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <LinearGradient
        colors={['#3498DB', '#48C9B0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTopBar}>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={36} color="#ffffff" />
            </TouchableOpacity>
          )}
          <LanguageSelector onLanguageChange={handleLanguageChange} />
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <WamiAvatar isSpeaking={isSpeaking} size={70} />
          </View>
          <Text style={styles.headerTitle}>Wami-IA</Text>
          <Text style={styles.headerSubtitle}>Votre assistante intelligente</Text>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper,
            ]}
          >
            {message.sender === 'bot' && (
              <View style={styles.botAvatar}>
                <Ionicons name="chatbubbles" size={20} color="#ffffff" />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                ]}
              >
                {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  message.sender === 'user' ? styles.userTimestamp : styles.botTimestamp,
                ]}
              >
                {message.timestamp.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              
              {/* Suggestions intelligentes de Wami-IA */}
              {message.sender === 'bot' && message.suggestions && (
                <View style={styles.suggestionsContainer}>
                  {message.suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.suggestionChip, isRequestInProgress && styles.suggestionChipDisabled]}
                      onPress={() => sendMessage(suggestion)}
                      disabled={isRequestInProgress}
                    >
                      <Text 
                        style={[styles.suggestionText, isRequestInProgress && styles.suggestionTextDisabled]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {message.sender === 'user' && (
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#ffffff" />
              </View>
            )}
          </View>
        ))}
        
        {/* Indicateur de saisie Wami-IA */}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.botAvatar}>
              <Ionicons name="chatbubbles" size={20} color="#ffffff" />
            </View>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>Wami-IA analyse...</Text>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickActionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionButton, isRequestInProgress && styles.quickActionButtonDisabled]}
              onPress={() => handleQuickAction(action.text)}
              disabled={isRequestInProgress}
            >
              <Ionicons name={action.icon} size={18} color={isRequestInProgress ? '#cbd5e1' : '#0891b2'} />
              <Text style={[styles.quickActionText, isRequestInProgress && styles.quickActionTextDisabled]}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isSpeaking && !isRequestInProgress && (
        <TouchableOpacity
          style={styles.stopSpeakingBar}
          onPress={() => {
            ttsService.stop();
            setIsSpeaking(false);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="volume-mute" size={20} color="#ffffff" />
          <Text style={styles.stopSpeakingText}>Arrêter de parler</Text>
        </TouchableOpacity>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tapez votre message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isRequestInProgress}
        />
        
        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isRequestInProgress}
        >
          <Ionicons
            name={isRecording ? 'mic' : 'mic-outline'}
            size={24}
            color={isRecording ? '#ef4444' : isRequestInProgress ? '#cbd5e1' : '#64748b'}
          />
        </TouchableOpacity>

        {isRequestInProgress ? (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRequest}
          >
            <Ionicons name="stop-circle" size={24} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    padding: 15,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 18,
    padding: 2,
  },
  headerContent: {
    paddingTop: 0,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fce7f3',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0B5394',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    minWidth: '60%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#0B5394',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#1e293b',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#e0f2fe',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#94a3b8',
  },
  quickActionsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickActionButtonDisabled: {
    backgroundColor: '#e2e8f0',
    opacity: 0.6,
  },
  quickActionText: {
    fontSize: 13,
    color: '#0891b2',
    marginLeft: 6,
    fontWeight: '600',
  },
  quickActionTextDisabled: {
    color: '#cbd5e1',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#fee2e2',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  stopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopSpeakingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginBottom: 5,
    borderRadius: 25,
    gap: 8,
  },
  stopSpeakingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#48C9B0',
    flexShrink: 1,
    maxWidth: '100%',
  },
  suggestionChipDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    opacity: 0.6,
  },
  suggestionText: {
    color: '#0B5394',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  suggestionTextDisabled: {
    color: '#94a3b8',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  typingBubble: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94a3b8',
  },
});
