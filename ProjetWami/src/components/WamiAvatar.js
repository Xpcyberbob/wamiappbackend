import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  LinearGradient, 
  Stop,
  G
} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function WamiAvatar({ isSpeaking = false, size = 80 }) {
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isSpeaking) {
      // Animation de pulsation du cercle principal
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animation des ondes sonores (3 vagues décalées)
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim1, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(waveAnim2, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(waveAnim3, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim3, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animation du glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Arrêter les animations
      pulseAnim.setValue(1);
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
      glowAnim.setValue(0.3);
    }
  }, [isSpeaking]);

  const center = size / 2;
  const mainRadius = size * 0.35;

  // Calcul des ondes sonores
  const wave1Scale = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const wave1Opacity = waveAnim1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  const wave2Scale = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const wave2Opacity = waveAnim2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  const wave3Scale = waveAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const wave3Opacity = waveAnim3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Dégradé principal Wami-IA */}
          <LinearGradient id="wamiGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0B5394" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#3498DB" stopOpacity="1" />
            <Stop offset="1" stopColor="#48C9B0" stopOpacity="1" />
          </LinearGradient>

          {/* Dégradé pour le glow */}
          <LinearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#48C9B0" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#73ddc3" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Ondes sonores animées (quand elle parle) */}
        {isSpeaking && (
          <G>
            <AnimatedCircle
              cx={center}
              cy={center}
              r={mainRadius}
              fill="none"
              stroke="url(#wamiGradient)"
              strokeWidth="3"
              opacity={wave1Opacity}
              scale={wave1Scale}
              origin={`${center}, ${center}`}
            />
            <AnimatedCircle
              cx={center}
              cy={center}
              r={mainRadius}
              fill="none"
              stroke="url(#wamiGradient)"
              strokeWidth="3"
              opacity={wave2Opacity}
              scale={wave2Scale}
              origin={`${center}, ${center}`}
            />
            <AnimatedCircle
              cx={center}
              cy={center}
              r={mainRadius}
              fill="none"
              stroke="url(#wamiGradient)"
              strokeWidth="3"
              opacity={wave3Opacity}
              scale={wave3Scale}
              origin={`${center}, ${center}`}
            />
          </G>
        )}

        {/* Cercle de glow externe */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={mainRadius + 8}
          fill="url(#glowGradient)"
          opacity={glowAnim}
        />

        {/* Cercle principal Wami-IA */}
        <Circle
          cx={center}
          cy={center}
          r={mainRadius}
          fill="url(#wamiGradient)"
        />

        {/* Icône IA au centre (cerveau stylisé) */}
        <G transform={`translate(${center}, ${center})`}>
          {/* Cerveau gauche */}
          <Path
            d="M -8 -6 Q -12 -10 -12 -4 Q -12 2 -8 4 Q -6 5 -4 3 Q -2 1 -2 -2 Q -2 -6 -6 -8 Q -8 -8 -8 -6 Z"
            fill="#ffffff"
            opacity="0.9"
          />
          {/* Cerveau droit */}
          <Path
            d="M 8 -6 Q 12 -10 12 -4 Q 12 2 8 4 Q 6 5 4 3 Q 2 1 2 -2 Q 2 -6 6 -8 Q 8 -8 8 -6 Z"
            fill="#ffffff"
            opacity="0.9"
          />
          
          {/* Connexions neuronales */}
          <Path
            d="M -4 0 L 4 0"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.8"
          />
          <Path
            d="M -2 -4 L 2 -4"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.6"
          />
          <Path
            d="M -2 4 L 2 4"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Points de connexion */}
          <Circle cx="-4" cy="0" r="1.5" fill="#ffffff" opacity="0.9" />
          <Circle cx="4" cy="0" r="1.5" fill="#ffffff" opacity="0.9" />
          <Circle cx="0" cy="-4" r="1.5" fill="#ffffff" opacity="0.8" />
          <Circle cx="0" cy="4" r="1.5" fill="#ffffff" opacity="0.8" />
        </G>

        {/* Barres de fréquence audio (quand elle parle) */}
        {isSpeaking && (
          <G transform={`translate(${center}, ${center + mainRadius + 15})`}>
            {/* 5 barres qui s'animent */}
            <AnimatedPath
              d="M -20 0 L -20 -8"
              stroke="#0B5394"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.8}
            />
            <AnimatedPath
              d="M -10 0 L -10 -12"
              stroke="#3498DB"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.9}
            />
            <AnimatedPath
              d="M 0 0 L 0 -16"
              stroke="#48C9B0"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={1}
            />
            <AnimatedPath
              d="M 10 0 L 10 -12"
              stroke="#3498DB"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.9}
            />
            <AnimatedPath
              d="M 20 0 L 20 -8"
              stroke="#0B5394"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.8}
            />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
