import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WaterQualityCard({ title, value, unit, icon, color, onPress }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Réinitialiser l'animation quand la valeur change
    setIsAnimating(true);
    setDisplayValue(0);
    setShowCursor(true);
    fadeAnim.setValue(0);

    // Animation de fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const targetValue = parseFloat(value);
    const duration = 800; // Animation rapide
    const steps = 20; // Moins de re-renders
    const stepDuration = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        setDisplayValue(targetValue);
        setIsAnimating(false);
        setShowCursor(false);
        clearInterval(timer);
      } else {
        // Utiliser une courbe d'accélération (ease-out) plus prononcée
        const progress = currentStep / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 4); // Quartic ease-out
        setDisplayValue(targetValue * easedProgress);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  // Animation du curseur clignotant
  useEffect(() => {
    if (!isAnimating) return;

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500); // Clignotement toutes les 500ms

    return () => clearInterval(cursorTimer);
  }, [isAnimating]);

  // Formater la valeur affichée avec le même nombre de décimales que la valeur originale
  const formatValue = (val) => {
    const originalDecimals = value.toString().split('.')[1]?.length || 0;
    return val.toFixed(originalDecimals);
  };

  const CardContent = (
    <>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={[styles.valueContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.value, { color: color }]}>
            {formatValue(displayValue)}
            {isAnimating && showCursor && (
              <Text style={[styles.cursor, { color: color }]}>|</Text>
            )}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </Animated.View>
      </View>
      <View style={[styles.statusIndicator, { backgroundColor: color, shadowColor: color }]} />
    </>
  );

  return onPress ? (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color, shadowColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {CardContent}
      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  ) : (
    <View style={[styles.card, { borderLeftColor: color, shadowColor: color }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={[styles.valueContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.value, { color: color }]}>
            {formatValue(displayValue)}
            {isAnimating && showCursor && (
              <Text style={[styles.cursor, { color: color }]}>|</Text>
            )}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </Animated.View>
      </View>
      <View style={[styles.statusIndicator, { backgroundColor: color, shadowColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f8fafc',
  },
  iconContainer: {
    marginRight: 12,
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
    fontWeight: '600',
  },
  cursor: {
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  chevronContainer: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -8,
  },
});
