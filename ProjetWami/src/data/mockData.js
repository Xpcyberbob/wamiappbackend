/**
 * Données de test pour le développement
 * Ces données simulent les réponses de l'API
 */

// Données de qualité de l'eau
export const mockWaterQuality = {
  current: {
    temperature: 26.5,
    ph: 7.2,
    oxygen: 8.5,
    ammonia: 0.15,
    turbidity: 12,
    salinity: 0.5,
    timestamp: new Date().toISOString(),
  },
  history: {
    temperature: {
      '24h': [
        { timestamp: '00:00', value: 26.2 },
        { timestamp: '04:00', value: 26.0 },
        { timestamp: '08:00', value: 26.3 },
        { timestamp: '12:00', value: 26.8 },
        { timestamp: '16:00', value: 27.1 },
        { timestamp: '20:00', value: 26.5 },
      ],
      '7d': [
        { timestamp: 'Lun', value: 26.3 },
        { timestamp: 'Mar', value: 26.5 },
        { timestamp: 'Mer', value: 26.8 },
        { timestamp: 'Jeu', value: 27.0 },
        { timestamp: 'Ven', value: 26.7 },
        { timestamp: 'Sam', value: 26.4 },
        { timestamp: 'Dim', value: 26.5 },
      ],
    },
  },
  ranges: {
    temperature: { min: 24, max: 28, optimal: [25, 27] },
    ph: { min: 6.5, max: 8.5, optimal: [7.0, 7.5] },
    oxygen: { min: 5, max: 12, optimal: [7, 9] },
    ammonia: { min: 0, max: 0.5, optimal: [0, 0.2] },
    turbidity: { min: 0, max: 50, optimal: [0, 20] },
    salinity: { min: 0, max: 2, optimal: [0, 1] },
  },
};

// Prédictions
export const mockPredictions = {
  temperature: {
    '24h': [
      { timestamp: 'Maintenant', value: 26.5, confidence: 1.0 },
      { timestamp: '+6h', value: 26.8, confidence: 0.92 },
      { timestamp: '+12h', value: 27.2, confidence: 0.85 },
      { timestamp: '+18h', value: 27.0, confidence: 0.78 },
      { timestamp: '+24h', value: 26.6, confidence: 0.72 },
    ],
    '7d': [
      { timestamp: 'Jour 1', value: 26.5, confidence: 0.90 },
      { timestamp: 'Jour 2', value: 26.7, confidence: 0.85 },
      { timestamp: 'Jour 3', value: 27.1, confidence: 0.80 },
      { timestamp: 'Jour 4', value: 27.3, confidence: 0.75 },
      { timestamp: 'Jour 5', value: 27.0, confidence: 0.70 },
      { timestamp: 'Jour 6', value: 26.8, confidence: 0.65 },
      { timestamp: 'Jour 7', value: 26.5, confidence: 0.60 },
    ],
  },
  alerts: [
    {
      id: 1,
      time: 'Dans 6 heures',
      status: 'optimal',
      message: 'Conditions optimales maintenues',
      priority: 'low',
      parameter: 'temperature',
    },
    {
      id: 2,
      time: 'Dans 12 heures',
      status: 'attention',
      message: 'Légère augmentation de température prévue',
      priority: 'medium',
      parameter: 'temperature',
      predictedValue: 27.2,
    },
    {
      id: 3,
      time: 'Dans 24 heures',
      status: 'optimal',
      message: 'Retour à des conditions optimales',
      priority: 'low',
      parameter: 'temperature',
    },
  ],
};

// Recommandations
export const mockRecommendations = [
  {
    id: 1,
    priority: 'high',
    category: 'Température',
    title: 'Ajuster la température',
    description: 'La température augmentera dans les prochaines heures',
    action: 'Activer le système de refroidissement',
    icon: 'thermometer',
    color: '#ef4444',
    details: {
      currentValue: '27.2°C',
      targetValue: '26.0°C',
      steps: [
        'Activer le système de refroidissement',
        'Augmenter l\'aération',
        'Vérifier dans 2 heures',
      ],
      estimatedTime: '2-3 heures',
      impact: 'Critique pour le bien-être des poissons',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    priority: 'medium',
    category: 'Alimentation',
    title: 'Ajuster la ration alimentaire',
    description: 'Basé sur la croissance observée',
    action: 'Augmenter de 10% la ration quotidienne',
    icon: 'nutrition',
    color: '#f59e0b',
    details: {
      currentValue: '2.5 kg/jour',
      targetValue: '2.75 kg/jour',
      steps: [
        'Augmenter progressivement la ration',
        'Observer le comportement alimentaire',
        'Surveiller la qualité de l\'eau',
      ],
      estimatedTime: '3-5 jours',
      impact: 'Améliore la croissance et la santé',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    priority: 'low',
    category: 'Maintenance',
    title: 'Nettoyage du filtre',
    description: 'Maintenance préventive recommandée',
    action: 'Planifier le nettoyage cette semaine',
    icon: 'funnel',
    color: '#10b981',
    details: {
      currentValue: 'Dernier nettoyage: il y a 12 jours',
      targetValue: 'Nettoyage tous les 14 jours',
      steps: [
        'Préparer le matériel de nettoyage',
        'Nettoyer les médias filtrants',
        'Vérifier l\'état des composants',
        'Redémarrer le système',
      ],
      estimatedTime: '1-2 heures',
      impact: 'Maintient l\'efficacité du système de filtration',
    },
    createdAt: new Date().toISOString(),
  },
];

// Statut du robot
export const mockRobotStatus = {
  connected: true,
  battery: 85,
  mode: 'surveillance',
  depth: 1.2,
  speed: 'medium',
  position: {
    x: 10.5,
    y: 15.2,
    z: 1.2,
  },
  sensors: {
    temperature: 26.5,
    pressure: 1.2,
    turbidity: 12,
  },
  camera: {
    active: true,
    streamUrl: 'rtsp://robot-ip/stream',
  },
  lights: false,
  autoMode: false,
  lastUpdate: new Date().toISOString(),
};

// Réponses du chatbot
export const mockChatbotResponses = {
  temperature: 'La température actuelle de votre bassin est de 26.5°C, ce qui est optimal pour la plupart des espèces. Je recommande de maintenir entre 25-28°C.',
  ph: 'Le pH actuel est de 7.2, ce qui est dans la plage idéale (7.0-7.5). Continuez à surveiller régulièrement.',
  oxygen: 'Le niveau d\'oxygène dissous est de 8.5 mg/L. C\'est excellent! Maintenez une bonne aération pour garder ce niveau.',
  ammonia: 'Le niveau d\'ammoniaque est de 0.15 mg/L, ce qui est acceptable. Surveillez qu\'il ne dépasse pas 0.2 mg/L.',
  feeding: 'Pour une croissance optimale, je recommande de nourrir vos poissons 2-3 fois par jour avec une quantité qu\'ils peuvent consommer en 5 minutes. Actuellement, vous donnez 2.5 kg/jour.',
  health: 'Pour prévenir les maladies, assurez-vous de maintenir une bonne qualité d\'eau, évitez la surpopulation et observez régulièrement le comportement de vos poissons. Signalez-moi tout comportement anormal.',
  robot: 'Le robot poisson est actuellement en mode surveillance. Vous pouvez le contrôler depuis l\'onglet Robot pour inspecter différentes zones du bassin.',
  default: 'Je comprends votre question. Basé sur les données actuelles de votre pisciculture, tout semble fonctionner correctement. Avez-vous des préoccupations spécifiques?',
};

// Actions rapides du chatbot
export const mockQuickActions = [
  { id: 1, text: 'Qualité de l\'eau', icon: 'water' },
  { id: 2, text: 'Alimentation', icon: 'nutrition' },
  { id: 3, text: 'Santé des poissons', icon: 'medkit' },
  { id: 4, text: 'Maintenance', icon: 'construct' },
  { id: 5, text: 'Température', icon: 'thermometer' },
  { id: 6, text: 'pH', icon: 'flask' },
];

// Espèces de poissons (pour future utilisation)
export const mockFishSpecies = [
  {
    id: 1,
    name: 'Tilapia',
    scientificName: 'Oreochromis niloticus',
    optimalTemp: { min: 25, max: 30 },
    optimalPh: { min: 6.5, max: 8.5 },
    feedingRate: 0.03, // 3% du poids corporel
    growthRate: 1.5, // kg/mois
  },
  {
    id: 2,
    name: 'Carpe',
    scientificName: 'Cyprinus carpio',
    optimalTemp: { min: 20, max: 28 },
    optimalPh: { min: 7.0, max: 8.0 },
    feedingRate: 0.025,
    growthRate: 1.2,
  },
  {
    id: 3,
    name: 'Silure',
    scientificName: 'Clarias gariepinus',
    optimalTemp: { min: 25, max: 32 },
    optimalPh: { min: 6.5, max: 8.0 },
    feedingRate: 0.04,
    growthRate: 2.0,
  },
];

// Historique des événements
export const mockEventHistory = [
  {
    id: 1,
    type: 'feeding',
    description: 'Distribution de nourriture',
    amount: '2.5 kg',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    type: 'maintenance',
    description: 'Nettoyage du filtre',
    duration: '1.5 heures',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'alert',
    description: 'Température élevée détectée',
    value: '28.5°C',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    type: 'robot',
    description: 'Inspection complète du bassin',
    duration: '45 minutes',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export default {
  mockWaterQuality,
  mockPredictions,
  mockRecommendations,
  mockRobotStatus,
  mockChatbotResponses,
  mockQuickActions,
  mockFishSpecies,
  mockEventHistory,
};
