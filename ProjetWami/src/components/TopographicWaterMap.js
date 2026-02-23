import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { 
  Rect, 
  Circle, 
  Path, 
  Defs, 
  LinearGradient, 
  Stop, 
  Text as SvgText,
  Ellipse,
  G
} from 'react-native-svg';

export default function TopographicWaterMap({ robotPosition, zones }) {
  const { width } = useWindowDimensions();
  const MAP_WIDTH = width - 40;
  const MAP_HEIGHT = 300;
  
  const [animatedPosition, setAnimatedPosition] = useState(robotPosition);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPosition(prev => ({
        x: prev.x + (robotPosition.x - prev.x) * 0.2,
        y: prev.y + (robotPosition.y - prev.y) * 0.2,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [robotPosition]);

  const toSvgX = (x) => (x / 100) * MAP_WIDTH;
  const toSvgY = (y) => (y / 100) * MAP_HEIGHT;

  // Lignes de contour topographiques (profondeur)
  const renderContourLines = () => {
    const contours = [];
    const depths = [
      { depth: 0.5, color: '#48C9B0', opacity: 0.3 },
      { depth: 1.0, color: '#3498DB', opacity: 0.4 },
      { depth: 1.5, color: '#2874a6', opacity: 0.5 },
      { depth: 2.0, color: '#1a6bb8', opacity: 0.6 },
      { depth: 2.5, color: '#0B5394', opacity: 0.7 },
    ];

    // Zones de profondeur avec lignes concentriques
    const depthZones = [
      { cx: 30, cy: 30, maxRadius: 25 },
      { cx: 70, cy: 25, maxRadius: 20 },
      { cx: 50, cy: 60, maxRadius: 30 },
      { cx: 25, cy: 75, maxRadius: 18 },
      { cx: 75, cy: 70, maxRadius: 22 },
    ];

    depthZones.forEach((zone, zoneIndex) => {
      depths.forEach((depth, depthIndex) => {
        const radius = (zone.maxRadius * (depths.length - depthIndex)) / depths.length;
        const cx = toSvgX(zone.cx);
        const cy = toSvgY(zone.cy);
        
        contours.push(
          <Ellipse
            key={`contour-${zoneIndex}-${depthIndex}`}
            cx={cx}
            cy={cy}
            rx={toSvgX(radius)}
            ry={toSvgY(radius * 0.8)}
            fill="none"
            stroke={depth.color}
            strokeWidth="2"
            opacity={depth.opacity}
          />
        );
      });
    });

    return contours;
  };

  // Zones de profondeur remplies avec dégradés
  const renderDepthZones = () => {
    return zones.map((zone, index) => {
      const gradient = `depthGradient${index}`;
      return (
        <G key={`zone-${index}`}>
          <Defs>
            <LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={zone.color} stopOpacity="0.2" />
              <Stop offset="1" stopColor={zone.color} stopOpacity="0.5" />
            </LinearGradient>
          </Defs>
          <Rect
            x={toSvgX(zone.x)}
            y={toSvgY(zone.y)}
            width={toSvgX(zone.width)}
            height={toSvgY(zone.height)}
            fill={`url(#${gradient})`}
            rx={12}
          />
        </G>
      );
    });
  };

  // Grille topographique subtile
  const renderTopographicGrid = () => {
    const lines = [];
    const gridSize = 20;
    
    for (let i = 0; i <= gridSize; i++) {
      const x = (i / gridSize) * MAP_WIDTH;
      const y = (i / gridSize) * MAP_HEIGHT;
      
      // Lignes verticales ondulées
      const verticalPath = [];
      for (let j = 0; j <= 20; j++) {
        const py = (j / 20) * MAP_HEIGHT;
        const offset = Math.sin(j * 0.5) * 3;
        verticalPath.push(j === 0 ? `M ${x + offset} ${py}` : `L ${x + offset} ${py}`);
      }
      
      lines.push(
        <Path
          key={`v${i}`}
          d={verticalPath.join(' ')}
          stroke="#94a3b8"
          strokeWidth="0.5"
          opacity="0.2"
        />
      );
      
      // Lignes horizontales ondulées
      const horizontalPath = [];
      for (let j = 0; j <= 20; j++) {
        const px = (j / 20) * MAP_WIDTH;
        const offset = Math.sin(j * 0.5) * 3;
        horizontalPath.push(j === 0 ? `M ${px} ${y + offset}` : `L ${px} ${y + offset}`);
      }
      
      lines.push(
        <Path
          key={`h${i}`}
          d={horizontalPath.join(' ')}
          stroke="#94a3b8"
          strokeWidth="0.5"
          opacity="0.2"
        />
      );
    }
    
    return lines;
  };

  // Points d'intérêt avec effet 3D
  const renderPOIs = () => {
    const pois = [
      { x: 20, y: 20, type: 'sensor', label: 'C1', depth: 1.2 },
      { x: 80, y: 20, type: 'sensor', label: 'C2', depth: 1.8 },
      { x: 20, y: 80, type: 'feeder', label: 'A1', depth: 0.8 },
      { x: 80, y: 80, type: 'sensor', label: 'C3', depth: 1.5 },
    ];

    return pois.map((poi, index) => (
      <G key={`poi-${index}`}>
        {/* Ombre */}
        <Circle
          cx={toSvgX(poi.x) + 2}
          cy={toSvgY(poi.y) + 2}
          r={8}
          fill="#000"
          opacity={0.2}
        />
        {/* Cercle extérieur */}
        <Circle
          cx={toSvgX(poi.x)}
          cy={toSvgY(poi.y)}
          r={8}
          fill={poi.type === 'sensor' ? '#3b82f6' : '#10b981'}
          opacity={0.3}
        />
        {/* Cercle principal */}
        <Circle
          cx={toSvgX(poi.x)}
          cy={toSvgY(poi.y)}
          r={6}
          fill={poi.type === 'sensor' ? '#3b82f6' : '#10b981'}
        />
        {/* Highlight */}
        <Circle
          cx={toSvgX(poi.x) - 1}
          cy={toSvgY(poi.y) - 1}
          r={2}
          fill="#ffffff"
          opacity={0.6}
        />
        {/* Label */}
        <SvgText
          x={toSvgX(poi.x)}
          y={toSvgY(poi.y) - 14}
          fontSize="11"
          fill="#1e293b"
          fontWeight="700"
          textAnchor="middle"
        >
          {poi.label}
        </SvgText>
        {/* Profondeur */}
        <SvgText
          x={toSvgX(poi.x)}
          y={toSvgY(poi.y) + 18}
          fontSize="9"
          fill="#64748b"
          fontWeight="600"
          textAnchor="middle"
        >
          {poi.depth}m
        </SvgText>
      </G>
    ));
  };

  // Trajectoire avec effet d'onde
  const renderTrajectory = () => {
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
      <G>
        {/* Ombre de la trajectoire */}
        <Path
          d={pathData}
          stroke="#000"
          strokeWidth="3"
          fill="none"
          strokeDasharray="6,4"
          opacity={0.1}
        />
        {/* Trajectoire principale */}
        <Path
          d={pathData}
          stroke="#3b82f6"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="6,4"
          opacity={0.6}
        />
      </G>
    );
  };

  // Robot poisson avec effet 3D et ondulations
  const renderRobot = () => {
    const x = toSvgX(animatedPosition.x);
    const y = toSvgY(animatedPosition.y);

    return (
      <G>
        {/* Ondulations (effet sonar) */}
        <Circle cx={x} cy={y} r={35} fill="#3b82f6" opacity={0.05} />
        <Circle cx={x} cy={y} r={28} fill="#3b82f6" opacity={0.08} />
        <Circle cx={x} cy={y} r={21} fill="#3b82f6" opacity={0.12} />
        
        {/* Ombre du poisson */}
        <Path
          d={`M ${x + 3} ${y + 3} 
              Q ${x + 13} ${y + 3} ${x + 18} ${y + 8}
              Q ${x + 13} ${y + 13} ${x + 3} ${y + 13}
              Q ${x - 2} ${y + 8} ${x + 3} ${y + 3} Z`}
          fill="#000"
          opacity={0.2}
        />
        
        {/* Corps du poisson */}
        <Path
          d={`M ${x} ${y} 
              Q ${x + 10} ${y} ${x + 15} ${y + 5}
              Q ${x + 10} ${y + 10} ${x} ${y + 10}
              Q ${x - 5} ${y + 5} ${x} ${y} Z`}
          fill="#3b82f6"
        />
        
        {/* Nageoire dorsale */}
        <Path
          d={`M ${x + 5} ${y + 2} L ${x + 7} ${y - 2} L ${x + 9} ${y + 3} Z`}
          fill="#1e40af"
        />
        
        {/* Queue du poisson */}
        <Path
          d={`M ${x + 15} ${y + 5} 
              L ${x + 22} ${y} 
              L ${x + 20} ${y + 5}
              L ${x + 22} ${y + 10}
              L ${x + 15} ${y + 5} Z`}
          fill="#60a5fa"
        />
        
        {/* Nageoire ventrale */}
        <Path
          d={`M ${x + 5} ${y + 8} L ${x + 7} ${y + 12} L ${x + 9} ${y + 7} Z`}
          fill="#1e40af"
        />
        
        {/* Œil du poisson */}
        <Circle cx={x + 3} cy={y + 4} r={2} fill="#1e293b" />
        <Circle cx={x + 3.5} cy={y + 3.5} r={0.8} fill="#ffffff" />
        
        {/* Écailles (détails) */}
        <Circle cx={x + 6} cy={y + 5} r={1.5} fill="#60a5fa" opacity={0.4} />
        <Circle cx={x + 9} cy={y + 5} r={1.5} fill="#60a5fa" opacity={0.4} />
        
        {/* Highlight sur le corps */}
        <Path
          d={`M ${x + 2} ${y + 2} Q ${x + 8} ${y + 1} ${x + 12} ${y + 3}`}
          stroke="#93c5fd"
          strokeWidth="1.5"
          fill="none"
          opacity={0.6}
        />
      </G>
    );
  };

  // Indicateurs de profondeur
  const renderDepthIndicators = () => {
    const indicators = [
      { x: 5, depth: '0.5m', color: '#0ea5e9' },
      { x: 5, depth: '1.0m', color: '#0284c7' },
      { x: 5, depth: '1.5m', color: '#0369a1' },
      { x: 5, depth: '2.0m', color: '#075985' },
      { x: 5, depth: '2.5m', color: '#0c4a6e' },
    ];

    return indicators.map((ind, index) => (
      <G key={`depth-ind-${index}`}>
        <Rect
          x={5}
          y={20 + index * 25}
          width={30}
          height={3}
          fill={ind.color}
          rx={1.5}
        />
        <SvgText
          x={40}
          y={24 + index * 25}
          fontSize="9"
          fill="#64748b"
          fontWeight="600"
        >
          {ind.depth}
        </SvgText>
      </G>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="map-marker-radius" size={24} color="#3b82f6" />
        <Text style={styles.title}>Cartographie Topographique</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3D</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <Svg width={MAP_WIDTH} height={MAP_HEIGHT} style={styles.svg}>
          {/* Dégradé de fond (eau profonde) */}
          <Defs>
            <LinearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#bfdbfe" stopOpacity="1" />
              <Stop offset="0.5" stopColor="#93c5fd" stopOpacity="1" />
              <Stop offset="1" stopColor="#3b82f6" stopOpacity="0.8" />
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

          {/* Grille topographique */}
          {renderTopographicGrid()}

          {/* Zones de profondeur */}
          {renderDepthZones()}

          {/* Lignes de contour */}
          {renderContourLines()}

          {/* Indicateurs de profondeur */}
          {renderDepthIndicators()}

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
            <MaterialCommunityIcons name="waves" size={16} color="#64748b" />
            <Text style={styles.coordValue}>1.5m</Text>
          </View>
        </View>
      </View>

      {/* Légende améliorée */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <MaterialCommunityIcons name="fish" size={16} color="#3b82f6" />
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
        <View style={styles.legendItem}>
          <View style={styles.legendLine} />
          <Text style={styles.legendText}>Profondeur</Text>
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
    flex: 1,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
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
    flexWrap: 'wrap',
    gap: 10,
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
  legendLine: {
    width: 15,
    height: 2,
    backgroundColor: '#0284c7',
    borderRadius: 1,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
});
