import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWaterData } from '../contexts/WaterDataContext';

export default function PredictionScreen({ openAssistant }) {
  const { width } = useWindowDimensions();
  const chartWidth = width - 80;
  const [selectedParameter, setSelectedParameter] = useState('temperature');
  const [timeRange, setTimeRange] = useState('24h');
  const { fetchTemperatureHistory, backendConnected } = useWaterData();

  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const pollRef = useRef(null);

  const parameters = [
    { id: 'temperature', name: 'Température', icon: 'thermometer', unit: '°C' },
    { id: 'ph', name: 'pH', icon: 'flask', unit: '' },
    { id: 'oxygen', name: 'Oxygène', icon: 'water', unit: 'mg/L' },
    { id: 'ammonia', name: 'Ammoniaque', icon: 'warning', unit: 'mg/L' },
  ];

  const timeRanges = ['24h', '7j', '30j'];

  // Charger l'historique de température depuis la DB
  const loadHistory = useCallback(async () => {
    try {
      const limitMap = { '24h': 288, '7j': 500, '30j': 500 };
      const data = await fetchTemperatureHistory(limitMap[timeRange] || 288);
      if (data && Array.isArray(data)) {
        // data est trié DESC, on inverse pour avoir chronologique
        setHistoryData([...data].reverse());
      }
    } catch (e) {
      console.warn('⚠️ Erreur chargement historique:', e.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [timeRange, fetchTemperatureHistory]);

  useEffect(() => {
    setHistoryLoading(true);
    loadHistory();

    // Rafraîchir toutes les 5 minutes
    pollRef.current = setInterval(loadHistory, 5 * 60 * 1000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadHistory]);

  // Regrouper les données par intervalles de 5 minutes
  const groupByInterval = (data, minutes) => {
    if (!data || data.length === 0) return { labels: [], values: [] };

    const groups = {};
    data.forEach(item => {
      const date = new Date(item.created_at);
      // Arrondir au bloc de N minutes
      const rounded = new Date(date);
      rounded.setMinutes(Math.floor(date.getMinutes() / minutes) * minutes, 0, 0);
      const key = rounded.getTime();

      if (!groups[key]) {
        groups[key] = { sum: 0, count: 0, date: rounded };
      }
      groups[key].sum += parseFloat(item.temp_c);
      groups[key].count += 1;
    });

    const sorted = Object.values(groups).sort((a, b) => a.date - b.date);

    // Limiter le nombre de points affichés pour la lisibilité
    const maxPoints = 12;
    const step = Math.max(1, Math.floor(sorted.length / maxPoints));
    const sampled = sorted.filter((_, i) => i % step === 0 || i === sorted.length - 1);

    const labels = sampled.map(g => {
      const h = g.date.getHours().toString().padStart(2, '0');
      const m = g.date.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    });
    const values = sampled.map(g => Math.round((g.sum / g.count) * 10) / 10);

    return { labels, values };
  };

  // Données statiques pour les autres paramètres
  const staticData = {
    ph: {
      labels: ['Maintenant', '+6h', '+12h', '+18h', '+24h'],
      datasets: [{ data: [7.2, 7.3, 7.4, 7.3, 7.2], color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, strokeWidth: 3 }],
    },
    oxygen: {
      labels: ['Maintenant', '+6h', '+12h', '+18h', '+24h'],
      datasets: [{ data: [8.5, 8.3, 8.0, 8.2, 8.4], color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, strokeWidth: 3 }],
    },
    ammonia: {
      labels: ['Maintenant', '+6h', '+12h', '+18h', '+24h'],
      datasets: [{ data: [0.15, 0.16, 0.18, 0.17, 0.16], color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, strokeWidth: 3 }],
    },
  };

  const getCurrentData = () => {
    if (selectedParameter === 'temperature') {
      const intervalMap = { '24h': 5, '7j': 60, '30j': 360 };
      const { labels, values } = groupByInterval(historyData, intervalMap[timeRange] || 5);

      if (values.length === 0) {
        return {
          labels: ['--'],
          datasets: [{ data: [0], color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`, strokeWidth: 3 }],
        };
      }

      return {
        labels,
        datasets: [{
          data: values,
          color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
          strokeWidth: 3,
        }],
      };
    }
    return staticData[selectedParameter] || staticData.ph;
  };

  const getParameterInfo = () => {
    return parameters.find(p => p.id === selectedParameter);
  };

  const predictions = [
    {
      time: 'Dans 6 heures',
      status: 'optimal',
      message: 'Conditions optimales maintenues',
      icon: 'checkmark-circle',
      color: '#10b981',
    },
    {
      time: 'Dans 12 heures',
      status: 'attention',
      message: 'Légère augmentation de température prévue',
      icon: 'alert-circle',
      color: '#f59e0b',
    },
    {
      time: 'Dans 24 heures',
      status: 'optimal',
      message: 'Retour à des conditions optimales',
      icon: 'checkmark-circle',
      color: '#10b981',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#3498DB', '#5dade2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconHeader}>
            <MaterialCommunityIcons name="brain" size={64} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Prédictions</Text>
          <Text style={styles.headerSubtitle}>• Analyse prédictive basée sur l'IA</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Sélectionner un paramètre</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parameterScroll}>
          {parameters.map((param) => (
            <TouchableOpacity
              key={param.id}
              style={[
                styles.parameterButton,
                selectedParameter === param.id && styles.parameterButtonActive,
              ]}
              onPress={() => setSelectedParameter(param.id)}
            >
              <Ionicons
                name={param.icon}
                size={24}
                color={selectedParameter === param.id ? '#ffffff' : '#64748b'}
              />
              <Text
                style={[
                  styles.parameterButtonText,
                  selectedParameter === param.id && styles.parameterButtonTextActive,
                ]}
              >
                {param.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Période de prédiction</Text>
        <View style={styles.timeRangeContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.chartTitle}>
              {selectedParameter === 'temperature' ? 'Historique' : 'Prédiction'} - {getParameterInfo()?.name}
            </Text>
            {selectedParameter === 'temperature' && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: backendConnected ? '#10b981' : '#ef4444', marginRight: 5 }} />
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                  {backendConnected ? 'Temps réel' : 'Hors ligne'}
                </Text>
              </View>
            )}
          </View>
          {selectedParameter === 'temperature' && historyLoading ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#0891b2" />
              <Text style={{ marginTop: 10, color: '#94a3b8', fontSize: 13 }}>Chargement de l'historique...</Text>
            </View>
          ) : (
            <LineChart
              data={getCurrentData()}
              width={chartWidth}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#faf5ff',
                backgroundGradientTo: '#f3e8ff',
                decimalPlaces: 1,
                color: (opacity = 1) => getCurrentData().datasets[0].color(opacity),
                labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  fill: '#ffffff',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#e2e8f0',
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              fromZero={false}
            />
          )}
          {selectedParameter === 'temperature' && historyData.length > 0 && (
            <Text style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 5 }}>
              {historyData.length} mesures • Intervalle : {timeRange === '24h' ? '5 min' : timeRange === '7j' ? '1h' : '6h'}
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Alertes Prédictives</Text>
        {predictions.map((prediction, index) => (
          <View key={index} style={styles.predictionCard}>
            <View style={[styles.predictionIcon, { backgroundColor: prediction.color + '20' }]}>
              <Ionicons name={prediction.icon} size={24} color={prediction.color} />
            </View>
            <View style={styles.predictionContent}>
              <Text style={styles.predictionTime}>{prediction.time}</Text>
              <Text style={styles.predictionMessage}>{prediction.message}</Text>
            </View>
          </View>
        ))}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#0891b2" />
          <Text style={styles.infoText}>
            Les prédictions sont basées sur l'analyse des données historiques et des modèles d'apprentissage automatique.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    padding: 20,
    paddingTop: 15,
    paddingBottom: 35,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    paddingTop: 5,
    alignItems: 'center',
  },
  iconHeader: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#f3e8ff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
    marginTop: -15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 15,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  parameterScroll: {
    marginBottom: 20,
  },
  parameterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  parameterButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    elevation: 6,
  },
  parameterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  parameterButtonTextActive: {
    color: '#ffffff',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeRangeButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    elevation: 4,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  timeRangeTextActive: {
    color: '#ffffff',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#f3e8ff',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 0,
  },
  predictionCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  predictionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  predictionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  predictionTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  predictionMessage: {
    fontSize: 13,
    color: '#64748b',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#0c4a6e',
    lineHeight: 18,
  },
});
