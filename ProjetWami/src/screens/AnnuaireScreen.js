import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const CATEGORIES = [
  { id: 'all', label: 'Tous', icon: 'apps' },
  { id: 'fournisseur', label: 'Fournisseurs', icon: 'cube' },
  { id: 'consultant', label: 'Consultants', icon: 'school' },
  { id: 'client', label: 'Clients', icon: 'people' },
  { id: 'service', label: 'Services', icon: 'construct' },
];

const CONTACTS = [
  {
    id: '1',
    name: 'AquaEquip CI',
    category: 'fournisseur',
    specialty: 'Équipements piscicoles (aérateurs, pompes, filets)',
    location: 'Abidjan, Cocody',
    phone: '+225 07 07 07 97 97',
    color: '#3b82f6',
  },
  {
    id: '2',
    name: 'PisciFeed Africa',
    category: 'fournisseur',
    specialty: 'Aliments pour poissons (tilapia, clarias)',
    location: 'Abidjan, Yopougon',
    phone: '+225 05 05 05 12 12',
    color: '#3b82f6',
  },
  {
    id: '3',
    name: 'Dr. Kouamé Yao',
    category: 'consultant',
    specialty: 'Expert en aquaculture et santé des poissons',
    location: 'Bouaké',
    phone: '+225 01 01 01 45 45',
    color: '#8b5cf6',
  },
  {
    id: '4',
    name: 'AquaConsult Pro',
    category: 'consultant',
    specialty: 'Conseil en gestion de fermes piscicoles',
    location: 'Abidjan, Plateau',
    phone: '+225 07 07 07 88 88',
    color: '#8b5cf6',
  },
  {
    id: '5',
    name: 'Marché Poissons Frais',
    category: 'client',
    specialty: 'Achat de tilapia et clarias frais',
    location: 'Abidjan, Adjamé',
    phone: '+225 05 05 05 33 33',
    color: '#10b981',
  },
  {
    id: '6',
    name: 'Restaurant Le Maquis',
    category: 'client',
    specialty: 'Achat régulier de poissons pour restauration',
    location: 'Abidjan, Zone 4',
    phone: '+225 01 01 01 77 77',
    color: '#10b981',
  },
  {
    id: '7',
    name: 'TechBassin Services',
    category: 'service',
    specialty: 'Installation et maintenance de bassins',
    location: 'Abidjan, Marcory',
    phone: '+225 07 07 07 55 55',
    color: '#f59e0b',
  },
  {
    id: '8',
    name: 'AquaLab Analyses',
    category: 'service',
    specialty: "Analyse de qualité d'eau et diagnostic",
    location: 'Abidjan, Cocody',
    phone: '+225 05 05 05 66 66',
    color: '#f59e0b',
  },
];

export default function AnnuaireScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredContacts = CONTACTS.filter(c => {
    const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchSearch = c.name.toLowerCase().includes(searchText.toLowerCase())
      || c.specialty.toLowerCase().includes(searchText.toLowerCase())
      || c.location.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  const callContact = (phone) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'fournisseur': return 'cube';
      case 'consultant': return 'school';
      case 'client': return 'people';
      case 'service': return 'construct';
      default: return 'business';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'fournisseur': return 'Fournisseur';
      case 'consultant': return 'Consultant';
      case 'client': return 'Client';
      case 'service': return 'Service technique';
      default: return category;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B5394', '#1a6bb8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Annuaire</Text>
        <Text style={styles.headerSubtitle}>Ressources pour pisciculteurs</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un contact..."
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={selectedCategory === cat.id ? '#ffffff' : '#0B5394'}
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.listContainer}>
        {filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Aucun contact trouvé</Text>
          </View>
        ) : (
          filteredContacts.map(contact => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => {
                setSelectedContact(contact);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIcon, { backgroundColor: contact.color + '20' }]}>
                <Ionicons name={getCategoryIcon(contact.category)} size={24} color={contact.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactSpecialty} numberOfLines={1}>{contact.specialty}</Text>
                <View style={styles.contactLocationRow}>
                  <Ionicons name="location-outline" size={14} color="#94a3b8" />
                  <Text style={styles.contactLocation}>{contact.location}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.callButton, { backgroundColor: contact.color }]}
                onPress={() => callContact(contact.phone)}
              >
                <Ionicons name="call" size={18} color="#ffffff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedContact && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedContact.name}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={32} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={[styles.modalIconLarge, { backgroundColor: selectedContact.color + '20' }]}>
                    <Ionicons name={getCategoryIcon(selectedContact.category)} size={48} color={selectedContact.color} />
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="pricetag" size={18} color="#64748b" />
                    <Text style={styles.modalInfoLabel}>Catégorie</Text>
                    <Text style={styles.modalInfoValue}>{getCategoryLabel(selectedContact.category)}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="briefcase" size={18} color="#64748b" />
                    <Text style={styles.modalInfoLabel}>Spécialité</Text>
                    <Text style={styles.modalInfoValue}>{selectedContact.specialty}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="location" size={18} color="#64748b" />
                    <Text style={styles.modalInfoLabel}>Localisation</Text>
                    <Text style={styles.modalInfoValue}>{selectedContact.location}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="call" size={18} color="#64748b" />
                    <Text style={styles.modalInfoLabel}>Contact</Text>
                    <Text style={styles.modalInfoValue}>{selectedContact.phone}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalCallButton, { backgroundColor: selectedContact.color }]}
                    onPress={() => callContact(selectedContact.phone)}
                  >
                    <Ionicons name="call" size={22} color="#ffffff" />
                    <Text style={styles.modalCallText}>Appeler</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    marginLeft: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#0B5394',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#0B5394',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B5394',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactSpecialty: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  contactLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactLocation: {
    fontSize: 12,
    color: '#94a3b8',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
  },
  modalBody: {
    alignItems: 'center',
  },
  modalIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    width: 90,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
  },
  modalCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
    gap: 10,
  },
  modalCallText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
