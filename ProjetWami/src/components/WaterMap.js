import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const MAP_WIDTH = screenWidth - 40;
const MAP_HEIGHT = 300;

export default function WaterMap({ robotPosition, zones }) {
  const [animatedPosition, setAnimatedPosition] = useState(robotPosition);

  useEffect(() => {
    // Animation douce du mouvement du robot
    const interval = setInterval(() => {
      setAnimatedPosition(prev => ({
        x: prev.x + (robotPosition.x - prev.x) * 0.2,
        y: prev.y + (robotPosition.y - prev.y) * 0.2,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [robotPosition]);

  // Convertir les coordonnées réelles en coordonnées SVG
  const toSvgX = (x) => (x / 100) * MAP_WIDTH;
  const toSvgY = (y) => (y / 100) * MAP_HEIGHT;

  // Zones de qualité d'eau
  const renderZones = () => {
    return zones.map((zone, index) => (
      <Rect
        key={index}
        x={toSvgX(zone.x)}
        y={toSvgY(zone.y)}
        width={toSvgX(zone.width)}
        height={toSvgY(zone.height)}
        fill={zone.color}
        opacity={0.3}
        rx={8}
      />
    ));
  };

  // Grille de fond
  const renderGrid = () => {
    const lines = [];
    const gridSize = 10;
    
    // Lignes verticales
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * MAP_WIDTH;
      lines.push(
        <Path
          key={`v${i}`}
          d={`M ${x} 0 L ${x} ${MAP_HEIGHT}`}
          stroke="#cbd5e1"
          strokeWidth="0.5"
          strokeDasharray="4,4"
        />
      );
    }
    
    // Lignes horizontales
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * MAP_HEIGHT;
      lines.push(
        <Path
          key={`h${i}`}
          d={`M 0 ${y} L ${MAP_WIDTH} ${y}`}
          stroke="#cbd5e1"
          strokeWidth="0.5"
          strokeDasharray="4,4"
        />
      );
    }
    
    return lines;
  };

  // Points d'intérêt (capteurs, zones d'alimentation, etc.)
  const renderPOIs = () => {
    const pois = [
      { x: 20, y: 20, type: 'sensor', label: 'C1' },
      { x: 80, y: 20, type: 'sensor', label: 'C2' },
      { x: 20, y: 80, type: 'feeder', label: 'A1' },
      { x: 80, y: 80, type: 'sensor', label: 'C3' },
    ];

    return pois.map((poi, index) => (
      <React.Fragment key={index}>
        <Circle
          cx={toSvgX(poi.x)}
          cy={toSvgY(poi.y)}
          r={6}
          fill={poi.type === 'sensor' ? '#3b82f6' : '#10b981'}
          opacity={0.8}
        />
        <SvgText
          x={toSvgX(poi.x)}
          y={toSvgY(poi.y) - 12}
          fontSize="10"
          fill="#1e293b"
          fontWeight="600"
          textAnchor="middle"
        >
          {poi.label}
        </SvgText>
      </React.Fragment>
    ));
  };

  // Trajectoire du robot (historique)
  const renderTrajectory = () => {
    // Simuler une trajectoire
    const trajectory = [
      { x: 30, y: 30 },
      { x: 40, y: 35 },
      { x: 50, y: 40 },
      { x: 60, y: 45 },
      { x: robotPosition.x, y: robotPosition.y },
    ];

    const pathData = trajectory
      .map((point, index) => {
        const x = toSvgX(point.x);
        const y = toSvgY(point.y);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');

    return (
      <Path
        d={pathData}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        strokeDasharray="5,5"
        opacity={0.5}
      />
    );
  };

  // Robot poisson avec animation
  const renderRobot = () => {
    const x = toSvgX(animatedPosition.x);
    const y = toSvgY(animatedPosition.y);

    return (
      <React.Fragment>
        {/* Cercle de détection */}
        <Circle
          cx={x}
          cy={y}
          r={25}
          fill="#3b82f6"
          opacity={0.1}
        />
        <Circle
          cx={x}
          cy={y}
          r={20}
          fill="#3b82f6"
          opacity={0.15}
        />
        
        {/* Robot */}
        <Circle
          cx={x}
          cy={y}
          r={12}
          fill="#3b82f6"
        />
        
        {/* Indicateur de direction */}
        <Path
          d={`M ${x} ${y - 12} L ${x + 8} ${y - 18} L ${x} ${y - 15} L ${x - 8} ${y - 18} Z`}
          fill="#1d4ed8"
        />
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="map-marker-radius" size={24} color="#3b82f6" />
        <Text style={styles.title}>Cartographie du Bassin</Text>
      </View>

      <View style={styles.mapContainer}>
        <Svg width={MAP_WIDTH} height={MAP_HEIGHT} style={styles.svg}>
          {/* Dégradé de fond (eau) */}
          <Defs>
            <LinearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#dbeafe" stopOpacity="1" />
              <Stop offset="1" stopColor="#bfdbfe" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Fond eau */}
          <Rect
            x={0}
            y={0}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            fill="url(#waterGradient)"
            rx={12}
          />

          {/* Grille */}
          {renderGrid()}

          {/* Zones de qualité */}
          {renderZones()}

          {/* Points d'intérêt */}
          {renderPOIs()}

          {/* Trajectoire */}
          {renderTrajectory()}

          {/* Robot */}
          {renderRobot()}
        </Svg>

        {/* Coordonnées du robot */}
        <View style={styles.coordinates}>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>X:</Text>
            <Text style={styles.coordValue}>{robotPosition.x.toFixed(1)}m</Text>
          </View>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>Y:</Text>
            <Text style={styles.coordValue}>{robotPosition.y.toFixed(1)}m</Text>
          </View>
          <View style={styles.coordItem}>
            <MaterialCommunityIcons name="speedometer" size={16} color="#64748b" />
            <Text style={styles.coordValue}>1.2 m/s</Text>
          </View>
        </View>
      </View>

      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Robot Poisson</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6', opacity: 0.5 }]} />
          <Text style={styles.legendText}>Capteurs</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Alimentation</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginLeft: 10,
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  svg: {
    backgroundColor: 'transparent',
  },
  coordinates: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  coordValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
});
