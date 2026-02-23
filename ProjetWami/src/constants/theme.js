/**
 * Thème de l'application WAMI - Couleurs NEPTA
 * Basé sur l'identité visuelle de NEPTA
 */

export const COLORS = {
  // Couleurs principales NEPTA
  primary: '#00A3E0',        // Bleu cyan principal
  primaryLight: '#7DD3F0',   // Bleu clair
  primaryDark: '#0077B6',    // Bleu foncé
  
  // Couleurs secondaires
  secondary: '#00B4D8',      // Bleu intermédiaire
  accent: '#48CAE4',         // Bleu accent
  
  // Couleurs de fond
  background: '#F8FBFF',     // Blanc légèrement bleuté
  surface: '#FFFFFF',        // Blanc pur
  
  // Couleurs de texte
  text: {
    primary: '#1E293B',      // Texte principal (gris très foncé)
    secondary: '#64748B',    // Texte secondaire (gris moyen)
    light: '#94A3B8',        // Texte clair (gris clair)
    white: '#FFFFFF',        // Texte blanc
  },
  
  // Couleurs d'état
  success: '#10B981',        // Vert succès
  warning: '#F59E0B',        // Orange avertissement
  error: '#EF4444',          // Rouge erreur
  info: '#00A3E0',           // Bleu info (même que primary)
  
  // Couleurs de qualité de l'eau
  water: {
    excellent: '#10B981',    // Vert
    good: '#48CAE4',         // Bleu clair
    moderate: '#F59E0B',     // Orange
    poor: '#EF4444',         // Rouge
  },
  
  // Dégradés NEPTA
  gradients: {
    primary: ['#00A3E0', '#7DD3F0'],           // Bleu principal
    header: ['#0077B6', '#00A3E0', '#48CAE4'], // En-tête
    card: ['#00B4D8', '#7DD3F0'],              // Cartes
    background: ['#F8FBFF', '#E0F4FF'],        // Fond
  },
  
  // Couleurs avec opacité
  opacity: {
    primary10: 'rgba(0, 163, 224, 0.1)',
    primary20: 'rgba(0, 163, 224, 0.2)',
    primary30: 'rgba(0, 163, 224, 0.3)',
    primary50: 'rgba(0, 163, 224, 0.5)',
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white30: 'rgba(255, 255, 255, 0.3)',
    black10: 'rgba(0, 0, 0, 0.1)',
    black20: 'rgba(0, 0, 0, 0.2)',
  },
  
  // Couleurs de bordure
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const FONTS = {
  regular: {
    fontWeight: '400',
  },
  medium: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
  extraBold: {
    fontWeight: '800',
  },
};

export default {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
};
