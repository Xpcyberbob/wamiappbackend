import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import * as Speech from 'expo-speech';
import ttsService from '../services/ttsService';
import { Platform } from 'react-native';
import { useWaterData } from '../contexts/WaterDataContext';
import { useSpeech } from '../contexts/SpeechContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeSelectionScreen({ navigation, openAssistant, onOptionSelected }) {
  const { waterData } = useWaterData();
  const { startSpeaking, stopSpeaking } = useSpeech();
  
  // État pour l'animation d'écriture du slogan
  const [displayedSlogan, setDisplayedSlogan] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const fullSlogan = "Simplifiez votre pisciculture avec l'IA";

  // Animation d'écriture du slogan
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullSlogan.length) {
        setDisplayedSlogan(fullSlogan.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80); // 80ms entre chaque caractère pour un effet fluide

    return () => clearInterval(typingInterval);
  }, []);

  // Animation de clignotement du curseur
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500); // Clignotement toutes les 500ms

    return () => clearInterval(cursorInterval);
  }, []);

  // Arrêter la synthèse vocale quand on quitte l'écran de sélection
  useEffect(() => {
    return () => {
      console.log('🚪 Sortie de l\'écran de sélection - Arrêt de la synthèse vocale');
      try {
        ttsService.stop();
        stopSpeaking();
      } catch (error) {
        console.error('❌ Erreur lors de l\'arrêt de la synthèse vocale:', error);
      }
    };
  }, []);
  
  // Fonction pour générer le message vocal d'état global
  const generateWelcomeVoiceMessage = () => {
    const { temperature, ph, oxygen, ammonia, turbidity, salinity } = waterData;
    
    // Analyser l'état global
    let globalStatus = 'optimal';
    let issues = [];
    
    // Vérifier chaque paramètre
    if (temperature < 24 || temperature > 30) {
      issues.push('température');
      globalStatus = 'attention';
    }
    if (ph < 6.5 || ph > 8.5) {
      issues.push('pH');
      globalStatus = 'attention';
    }
    if (oxygen < 5) {
      issues.push('oxygène');
      globalStatus = 'critique';
    }
    if (ammonia > 0.5) {
      issues.push('ammoniaque');
      globalStatus = 'attention';
    }
    if (turbidity > 20) {
      issues.push('turbidité');
      globalStatus = 'attention';
    }
    
    // Messages d'accueil variés pour plus de naturel
    const greetings = [
      "Salut chef ! Comment allez-vous aujourd'hui ?",
      "Bonjour ! Ravi de vous retrouver !",
      "Hey ! Prêt à prendre soin de vos poissons ?",
      "Coucou ! J'espère que vous passez une belle journée !"
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    // Construire le message vocal avec plus d'humanité
    let message = `${randomGreeting} Alors, voyons ensemble l'état de votre eau... `;
    
    // Ajouter une petite pause naturelle
    message += "Hmm... ";
    
    if (globalStatus === 'optimal') {
      const positiveResponses = [
        "Wahou ! C'est fantastique ! Vos paramètres sont absolument parfaits !",
        "Incroyable ! Vous faites un travail remarquable ! Tout est optimal !",
        "Bravo ! Je suis impressionnée par la qualité de votre eau !",
        "Magnifique ! Vos poissons doivent être aux anges !"
      ];
      message += positiveResponses[Math.floor(Math.random() * positiveResponses.length)] + " ";
      message += `Votre température est nickel à ${temperature} degrés, le pH parfait à ${ph}, et l'oxygène excellent à ${oxygen} milligrammes par litre. `;
      message += "Franchement, chapeau ! Vos petits protégés nagent dans le bonheur ! ";
    } else if (globalStatus === 'attention') {
      const attentionResponses = [
        "Hmm, je vois quelques petits points à surveiller, mais rien de dramatique !",
        "Alors, il y a quelques paramètres qui demandent votre attention, mais on va s'en sortir !",
        "Je remarque quelques ajustements à faire, mais vous gérez très bien !",
        "Il y a quelques petites choses à peaufiner, mais vous êtes sur la bonne voie !"
      ];
      message += attentionResponses[Math.floor(Math.random() * attentionResponses.length)] + " ";
      message += `Les paramètres qui ont besoin d'un petit coup d'œil sont : ${issues.join(', ')}. `;
      message += "Mais ne vous inquiétez pas, ensemble on va remettre tout ça au top ! ";
    } else {
      message += "Oh là ! Je dois vous alerter, il y a une situation qui demande votre attention immédiate ! ";
      message += "Le niveau d'oxygène est vraiment trop bas pour vos poissons. ";
      message += "Mais pas de panique ! Je vais vous guider pour résoudre ça rapidement ! ";
    }
    
    const closingMessages = [
      "N'hésitez surtout pas à me solliciter si vous avez besoin d'aide, je suis là pour ça !",
      "Je reste à votre disposition pour tout conseil, comptez sur moi !",
      "Si vous avez la moindre question, je suis votre assistante dévouée !",
      "Prenez soin de vous et de vos petits compagnons aquatiques !"
    ];
    
    message += closingMessages[Math.floor(Math.random() * closingMessages.length)];
    
    return message;
  };
  
  // Message contextuel pour l'assistant IA sur la création de pisciculture
  const piscicultureGuideMessage = `MODE APPRENTISSAGE - Je suis débutant en pisciculture et je veux tout apprendre !

Bonjour ! Je n'ai pas encore de pisciculture mais j'aimerais en créer une. Peux-tu me guider étape par étape ?

J'aimerais apprendre :
 Les bases de la pisciculture pour débutants
 Comment préparer l'eau et l'environnement
 Quels équipements je vais avoir besoin
 Comment surveiller la qualité de l'eau
 Comment bien nourrir les poissons
 Comment prévenir les maladies

Merci de m'expliquer tout cela simplement, comme si je n'y connaissais rien !`;

  const handlePiscicultureGuide = () => {
    if (openAssistant) {
      openAssistant(piscicultureGuideMessage);
    }
    // Marquer que l'utilisateur a fait son choix
    if (onOptionSelected) {
      onOptionSelected();
    }
  };

  const handleGoToDashboard = () => {
    // Marquer que l'utilisateur a fait son choix
    if (onOptionSelected) {
      onOptionSelected();
    }
    
    // Naviguer vers les onglets principaux
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0891b2', '#06b6d4', '#67e8f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header avec logo et titre */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="fish" size={60} color="#ffffff" />
          </View>
          <Text style={styles.title}>Bienvenue dans Wami</Text>
          <View style={styles.sloganContainer}>
            <Text style={styles.slogan}>
              {displayedSlogan}
              {cursorVisible && (
                <Text style={styles.cursor}>|</Text>
              )}
            </Text>
          </View>
          <Text style={styles.subtitle}>Votre assistant intelligent pour la pisciculture</Text>
        </View>

        {/* Contenu principal avec les deux boutons */}
        <View style={styles.content}>
          <Text style={styles.questionText}>Que souhaitez-vous faire ?</Text>
          
          {/* Bouton 1: Guide pisciculture */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handlePiscicultureGuide}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonIcon}>
                <MaterialCommunityIcons name="school" size={40} color="#0891b2" />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>Apprendre la pisciculture</Text>
                <Text style={styles.buttonDescription}>
                  Découvrez comment créer et gérer votre pisciculture avec l'aide de notre IA
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#0891b2" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Bouton 2: Tableau de bord */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleGoToDashboard}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonIcon}>
                <Ionicons name="analytics" size={40} color="#0891b2" />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>Accéder au tableau de bord</Text>
                <Text style={styles.buttonDescription}>
                  Surveillez vos paramètres d'eau et gérez votre pisciculture
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#0891b2" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer avec informations */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Vous pourrez toujours accéder à ces fonctionnalités depuis l'application
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  sloganContainer: {
    minHeight: 25, // Hauteur fixe pour éviter les sauts de layout
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  slogan: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fbbf24',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cursor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fbbf24',
    opacity: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f2fe',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionButton: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
  },
  buttonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  buttonContent: {
    flex: 1,
    paddingRight: 10,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#e0f2fe',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
