/**
 * Service de génération de recommandations dynamiques
 * Basé sur les paramètres de qualité de l'eau
 */

export const generateRecommendations = (waterData) => {
  const recs = [];
  let id = 1;

  // Vérifier la température
  if (waterData.temperature > 27) {
    recs.push({
      id: id++,
      priority: 'high',
      category: 'Température',
      title: 'Température élevée détectée',
      description: `Température actuelle: ${waterData.temperature}°C (optimal: 25-27°C)`,
      action: 'Activer le système de refroidissement',
      icon: 'thermometer-outline',
      color: '#ef4444',
      bgColor: '#fee2e2',
      details: {
        currentValue: `${waterData.temperature}°C`,
        targetValue: '26.0°C',
        steps: [
          'Activer le système de refroidissement',
          'Augmenter l\'aération',
          'Réduire l\'exposition au soleil',
          'Vérifier dans 2 heures',
        ],
        estimatedTime: '2-3 heures',
        impact: 'Critique - Stress thermique pour les poissons',
      },
    });
  } else if (waterData.temperature < 25) {
    recs.push({
      id: id++,
      priority: 'medium',
      category: 'Température',
      title: 'Température basse détectée',
      description: `Température actuelle: ${waterData.temperature}°C (optimal: 25-27°C)`,
      action: 'Augmenter la température',
      icon: 'thermometer-outline',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      details: {
        currentValue: `${waterData.temperature}°C`,
        targetValue: '26.0°C',
        steps: [
          'Activer le système de chauffage',
          'Réduire l\'aération excessive',
          'Vérifier l\'isolation',
        ],
        estimatedTime: '3-4 heures',
        impact: 'Métabolisme ralenti des poissons',
      },
    });
  }

  // Vérifier le pH
  if (waterData.ph > 7.5 || waterData.ph < 7.0) {
    recs.push({
      id: id++,
      priority: waterData.ph > 8.0 || waterData.ph < 6.5 ? 'high' : 'medium',
      category: 'pH',
      title: waterData.ph > 7.5 ? 'pH trop élevé' : 'pH trop bas',
      description: `pH actuel: ${waterData.ph} (optimal: 7.0-7.5)`,
      action: waterData.ph > 7.5 ? 'Réduire le pH' : 'Augmenter le pH',
      icon: 'flask-outline',
      color: waterData.ph > 8.0 || waterData.ph < 6.5 ? '#ef4444' : '#f59e0b',
      bgColor: waterData.ph > 8.0 || waterData.ph < 6.5 ? '#fee2e2' : '#fef3c7',
      details: {
        currentValue: `${waterData.ph}`,
        targetValue: '7.2',
        steps: waterData.ph > 7.5 ? [
          'Ajouter un acidifiant naturel',
          'Augmenter l\'aération',
          'Vérifier dans 4 heures',
        ] : [
          'Ajouter du bicarbonate',
          'Réduire l\'aération',
          'Vérifier dans 4 heures',
        ],
        estimatedTime: '4-6 heures',
        impact: 'Affecte la respiration et le métabolisme',
      },
    });
  }

  // Vérifier l'oxygène
  if (waterData.oxygen < 7) {
    recs.push({
      id: id++,
      priority: waterData.oxygen < 5 ? 'high' : 'medium',
      category: 'Oxygène',
      title: 'Oxygène dissous faible',
      description: `Oxygène: ${waterData.oxygen} mg/L (optimal: 7-9 mg/L)`,
      action: 'Augmenter l\'oxygénation',
      icon: 'water-outline',
      color: waterData.oxygen < 5 ? '#ef4444' : '#f59e0b',
      bgColor: waterData.oxygen < 5 ? '#fee2e2' : '#fef3c7',
      details: {
        currentValue: `${waterData.oxygen} mg/L`,
        targetValue: '8.0 mg/L',
        steps: [
          'Activer les aérateurs',
          'Réduire la densité de poissons',
          'Vérifier les filtres',
          'Surveiller en continu',
        ],
        estimatedTime: '1-2 heures',
        impact: 'Critique - Risque d\'asphyxie',
      },
    });
  }

  // Vérifier l'ammoniaque
  if (waterData.ammonia > 0.2) {
    recs.push({
      id: id++,
      priority: waterData.ammonia > 0.5 ? 'high' : 'medium',
      category: 'Ammoniaque',
      title: 'Niveau d\'ammoniaque élevé',
      description: `Ammoniaque: ${waterData.ammonia} mg/L (optimal: 0-0.2 mg/L)`,
      action: 'Réduire l\'ammoniaque',
      icon: 'warning-outline',
      color: waterData.ammonia > 0.5 ? '#ef4444' : '#f59e0b',
      bgColor: waterData.ammonia > 0.5 ? '#fee2e2' : '#fef3c7',
      details: {
        currentValue: `${waterData.ammonia} mg/L`,
        targetValue: '< 0.2 mg/L',
        steps: [
          'Changer 30% de l\'eau',
          'Réduire l\'alimentation',
          'Vérifier le filtre biologique',
          'Ajouter des bactéries nitrifiantes',
        ],
        estimatedTime: '24-48 heures',
        impact: 'Toxique - Dommages aux branchies',
      },
    });
  }

  // Vérifier la turbidité
  if (waterData.turbidity > 20) {
    recs.push({
      id: id++,
      priority: waterData.turbidity > 40 ? 'high' : 'medium',
      category: 'Turbidité',
      title: 'Eau trouble',
      description: `Turbidité: ${waterData.turbidity} NTU (optimal: 0-20 NTU)`,
      action: 'Clarifier l\'eau',
      icon: 'eye-off-outline',
      color: waterData.turbidity > 40 ? '#ef4444' : '#f59e0b',
      bgColor: waterData.turbidity > 40 ? '#fee2e2' : '#fef3c7',
      details: {
        currentValue: `${waterData.turbidity} NTU`,
        targetValue: '< 15 NTU',
        steps: [
          'Nettoyer les filtres mécaniques',
          'Réduire l\'alimentation',
          'Ajouter un floculant naturel',
          'Vérifier le système de filtration',
        ],
        estimatedTime: '12-24 heures',
        impact: 'Réduit l\'oxygène et stresse les poissons',
      },
    });
  }

  // Si tout est optimal ou moins de 2 recommandations, ajouter des recommandations de maintenance
  if (recs.length === 0) {
    recs.push({
      id: id++,
      priority: 'low',
      category: 'Maintenance',
      title: 'Tout est optimal !',
      description: 'Tous les paramètres sont dans les normes',
      action: 'Continuer la surveillance régulière',
      icon: 'checkmark-circle-outline',
      color: '#10b981',
      bgColor: '#d1fae5',
      details: {
        currentValue: 'Optimal',
        targetValue: 'Maintenir',
        steps: [
          'Continuer la surveillance',
          'Planifier la maintenance préventive',
          'Vérifier l\'alimentation',
          'Observer le comportement des poissons',
        ],
        estimatedTime: 'Continu',
        impact: 'Maintient la santé optimale',
      },
    });
  }

  // Toujours ajouter une recommandation de surveillance si moins de 1 recommandation
  if (recs.length < 1) {
    recs.push({
      id: id++,
      priority: 'low',
      category: 'Surveillance',
      title: 'Surveillance comportementale',
      description: 'Observer le comportement des poissons',
      action: 'Inspection visuelle quotidienne',
      icon: 'eye-outline',
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      details: {
        currentValue: 'Comportement normal',
        targetValue: 'Maintenir',
        steps: [
          'Observer l\'activité de nage',
          'Vérifier l\'appétit',
          'Détecter les signes de stress',
          'Noter les anomalies',
        ],
        estimatedTime: '15 min/jour',
        impact: 'Détection précoce des problèmes',
      },
    });
  }

  return recs;
};

// Données par défaut pour les tests
export const defaultWaterData = {
  temperature: 26.5,
  ph: 7.2,
  oxygen: 8.5,
  ammonia: 0.15,
  turbidity: 12,
  salinity: 0.5,
};
