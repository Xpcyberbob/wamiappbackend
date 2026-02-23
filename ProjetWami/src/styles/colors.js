// Palette de couleurs Wami
export const colors = {
  // Couleurs principales
  primary: '#0B5394',        // Bleu océan profond
  secondary: '#3498DB',      // Bleu aquatique
  accent: '#48C9B0',         // Turquoise clair

  // Variations de la palette principale
  primaryLight: '#1a6bb8',
  primaryDark: '#084070',
  secondaryLight: '#5dade2',
  secondaryDark: '#2874a6',
  accentLight: '#73ddc3',
  accentDark: '#36b39d',

  // Couleurs de statut
  success: '#48C9B0',        // Turquoise (optimal)
  warning: '#F39C12',        // Orange
  danger: '#E74C3C',         // Rouge
  info: '#3498DB',           // Bleu aquatique

  // Couleurs neutres
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },

  // Couleurs de fond
  background: '#F8F9FA',
  surface: '#FFFFFF',
  overlay: 'rgba(11, 83, 148, 0.1)',

  // Couleurs de texte
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    disabled: '#ADB5BD',
    inverse: '#FFFFFF',
  },

  // Dégradés
  gradients: {
    primary: ['#0B5394', '#3498DB'],           // Bleu océan → Bleu aquatique
    secondary: ['#3498DB', '#48C9B0'],         // Bleu aquatique → Turquoise
    accent: ['#48C9B0', '#73ddc3'],            // Turquoise → Turquoise clair
    ocean: ['#0B5394', '#3498DB', '#48C9B0'],  // Dégradé complet océan
  },

  // Couleurs spécifiques aux écrans
  dashboard: {
    header: ['#0B5394', '#1a6bb8'],
    card: '#FFFFFF',
    border: '#E9ECEF',
  },
  predictions: {
    header: ['#3498DB', '#5dade2'],
    card: '#FFFFFF',
    border: '#E9ECEF',
  },
  recommendations: {
    header: ['#48C9B0', '#73ddc3'],
    card: '#FFFFFF',
    border: '#E9ECEF',
  },
  robot: {
    header: ['#0B5394', '#3498DB'],
    card: '#FFFFFF',
    border: '#E9ECEF',
  },
  chatbot: {
    header: ['#3498DB', '#48C9B0'],
    userBubble: '#3498DB',
    botBubble: '#F1F3F5',
    border: '#E9ECEF',
  },

  // Couleurs pour les graphiques
  charts: {
    line1: '#0B5394',
    line2: '#3498DB',
    line3: '#48C9B0',
    grid: '#E9ECEF',
    text: '#6C757D',
  },

  // Couleurs pour la qualité de l'eau
  waterQuality: {
    optimal: '#48C9B0',      // Turquoise
    good: '#3498DB',         // Bleu aquatique
    warning: '#F39C12',      // Orange
    critical: '#E74C3C',     // Rouge
  },
};

export default colors;
