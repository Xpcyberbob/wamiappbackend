import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

export default function ShopScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Données de démonstration pour les poissons
  const fishProducts = [
    {
      id: 1,
      name: 'Tilapia',
      category: 'consommation',
      price: 5000,
      unit: 'kg',
      stock: 150,
      image: '🐟',
      description: 'Tilapia frais de qualité supérieure',
      minOrder: 1,
    },
    {
      id: 2,
      name: 'Carpe',
      category: 'consommation',
      price: 4500,
      unit: 'kg',
      stock: 200,
      image: '🐠',
      description: 'Carpe fraîche, idéale pour la cuisine',
      minOrder: 1,
    },
    {
      id: 3,
      name: 'Silure',
      category: 'consommation',
      price: 6000,
      unit: 'kg',
      stock: 100,
      image: '🐡',
      description: 'Silure de rivière, chair tendre',
      minOrder: 1,
    },
    {
      id: 4,
      name: 'Alevins Tilapia',
      category: 'elevage',
      price: 50,
      unit: 'pièce',
      stock: 5000,
      image: '🐟',
      description: 'Alevins de tilapia pour élevage',
      minOrder: 100,
    },
    {
      id: 5,
      name: 'Alevins Carpe',
      category: 'elevage',
      price: 45,
      unit: 'pièce',
      stock: 3000,
      image: '🐠',
      description: 'Alevins de carpe, croissance rapide',
      minOrder: 100,
    },
    {
      id: 6,
      name: 'Alevins Silure',
      category: 'elevage',
      price: 60,
      unit: 'pièce',
      stock: 2000,
      image: '🐡',
      description: 'Alevins de silure pour élevage',
      minOrder: 50,
    },
    {
      id: 7,
      name: 'Poisson-Chat',
      category: 'consommation',
      price: 5500,
      unit: 'kg',
      stock: 120,
      image: '🐟',
      description: 'Poisson-chat frais, excellent goût',
      minOrder: 1,
    },
    {
      id: 8,
      name: 'Géniteurs Tilapia',
      category: 'elevage',
      price: 2000,
      unit: 'pièce',
      stock: 50,
      image: '🐟',
      description: 'Géniteurs sélectionnés pour reproduction',
      minOrder: 2,
    },
  ];

  const categories = [
    { id: 'all', name: 'Tous', icon: 'grid-outline' },
    { id: 'consommation', name: 'Consommation', icon: 'restaurant-outline' },
    { id: 'elevage', name: 'Élevage', icon: 'fish-outline' },
  ];

  const filteredProducts = fishProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    Alert.alert(
      'Ajouter au panier',
      `Voulez-vous ajouter ${product.name} au panier ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ajouter',
          onPress: () => Alert.alert('Succès', `${product.name} ajouté au panier`),
        },
      ]
    );
  };

  const handleContactSeller = () => {
    Alert.alert(
      'Contacter le vendeur',
      'Souhaitez-vous contacter le vendeur pour plus d\'informations ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'WhatsApp',
          onPress: () => Alert.alert('Info', 'Ouverture de WhatsApp...'),
        },
        {
          text: 'Appeler',
          onPress: () => Alert.alert('Info', 'Lancement de l\'appel...'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ma Boutique</Text>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color="#fff" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un poisson..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Catégories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? '#fff' : COLORS.primary}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste des produits */}
      <ScrollView style={styles.productsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              {/* Badge catégorie */}
              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor:
                      product.category === 'consommation'
                        ? COLORS.primary + '20'
                        : '#10b981' + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    {
                      color: product.category === 'consommation' ? COLORS.primary : '#10b981',
                    },
                  ]}
                >
                  {product.category === 'consommation' ? 'Consommation' : 'Élevage'}
                </Text>
              </View>

              {/* Image du poisson */}
              <View style={styles.productImageContainer}>
                <Text style={styles.productEmoji}>{product.image}</Text>
              </View>

              {/* Informations du produit */}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>

                {/* Prix et stock */}
                <View style={styles.productDetails}>
                  <View>
                    <Text style={styles.productPrice}>
                      {product.price.toLocaleString()} FCFA
                    </Text>
                    <Text style={styles.productUnit}>par {product.unit}</Text>
                  </View>
                  <View style={styles.stockContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={product.stock > 0 ? '#10b981' : '#ef4444'}
                    />
                    <Text
                      style={[
                        styles.stockText,
                        { color: product.stock > 0 ? '#10b981' : '#ef4444' },
                      ]}
                    >
                      {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                    </Text>
                  </View>
                </View>

                {/* Commande minimum */}
                <Text style={styles.minOrder}>
                  Commande min: {product.minOrder} {product.unit}
                </Text>

                {/* Boutons d'action */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <Ionicons name="cart-outline" size={20} color="#fff" />
                    <Text style={styles.addToCartText}>Ajouter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handleContactSeller}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Message si aucun produit */}
        {filteredProducts.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="fish-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            <Text style={styles.emptySubtext}>
              Essayez de modifier vos critères de recherche
            </Text>
          </View>
        )}

        {/* Bouton contacter le vendeur */}
        <TouchableOpacity style={styles.contactSellerButton} onPress={handleContactSeller}>
          <Ionicons name="call-outline" size={24} color="#fff" />
          <Text style={styles.contactSellerText}>Contacter le vendeur</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🐟 Poissons frais et de qualité</Text>
          <Text style={styles.footerSubtext}>Livraison disponible dans toute la région</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productImageContainer: {
    height: 150,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 80,
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productUnit: {
    fontSize: 12,
    color: '#999',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  minOrder: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  contactSellerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    marginHorizontal: 15,
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  contactSellerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});
