import { Platform } from 'react-native';

/**
 * Convertit les styles shadow React Native vers React Native Web
 * @param {Object} shadowStyle - Objet contenant shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * @returns {Object} - Style compatible avec React Native Web
 */
export const createShadowStyle = (shadowStyle) => {
  if (Platform.OS === 'web') {
    const {
      shadowColor = '#000',
      shadowOffset = { width: 0, height: 2 },
      shadowOpacity = 0.1,
      shadowRadius = 4,
      elevation = 0
    } = shadowStyle;

    // Convertir en boxShadow pour le web
    const { width, height } = shadowOffset;
    const alpha = shadowOpacity;
    
    // Convertir la couleur avec l'opacité
    let boxShadowColor = shadowColor;
    if (shadowColor.startsWith('#')) {
      // Convertir hex en rgba
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      boxShadowColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (shadowColor.startsWith('rgba')) {
      // Déjà en rgba, ajuster l'opacité
      boxShadowColor = shadowColor.replace(/rgba\(([^)]+)\)/, (match, values) => {
        const [r, g, b] = values.split(',').map(v => v.trim());
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      });
    }

    return {
      boxShadow: `${width}px ${height}px ${shadowRadius}px ${boxShadowColor}`,
      // Garder elevation pour Android
      elevation: Platform.OS === 'android' ? elevation : undefined,
    };
  }

  // Pour iOS et Android, retourner les styles originaux
  return shadowStyle;
};

/**
 * Convertit les styles textShadow React Native vers React Native Web
 * @param {Object} textShadowStyle - Objet contenant textShadowColor, textShadowOffset, textShadowRadius
 * @returns {Object} - Style compatible avec React Native Web
 */
export const createTextShadowStyle = (textShadowStyle) => {
  if (Platform.OS === 'web') {
    const {
      textShadowColor = '#000',
      textShadowOffset = { width: 0, height: 1 },
      textShadowRadius = 1
    } = textShadowStyle;

    const { width, height } = textShadowOffset;
    
    return {
      textShadow: `${width}px ${height}px ${textShadowRadius}px ${textShadowColor}`,
    };
  }

  // Pour iOS et Android, retourner les styles originaux
  return textShadowStyle;
};

/**
 * Styles shadow prédéfinis pour une utilisation courante
 */
export const SHADOW_STYLES = {
  small: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }),
  
  medium: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
  
  large: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  }),
  
  header: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  }),
};
