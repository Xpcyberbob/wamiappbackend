import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  LANGUAGE_CONFIG,
  getCurrentLanguage,
  saveLanguage,
} from '../services/languageService';

export default function LanguageSelector({ onLanguageChange }) {
  const [currentLang, setCurrentLang] = useState('fr');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  };

  const handleLanguageSelect = async (languageCode) => {
    await saveLanguage(languageCode);
    setCurrentLang(languageCode);
    setModalVisible(false);
    
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  const currentConfig = LANGUAGE_CONFIG[currentLang];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{currentConfig.flag}</Text>
        <Text style={styles.languageName}>{currentConfig.nativeName}</Text>
        <Ionicons name="chevron-down" size={16} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="globe-outline" size={24} color="#0B5394" />
                <Text style={styles.modalTitle}>Choisir la langue</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList}>
              {Object.values(LANGUAGE_CONFIG).map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    currentLang === lang.code && styles.languageItemActive,
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageItemLeft}>
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <View style={styles.languageTextContainer}>
                      <Text style={styles.languageNativeName}>
                        {lang.nativeName}
                      </Text>
                      <Text style={styles.languageEnglishName}>
                        {lang.name}
                      </Text>
                    </View>
                  </View>
                  {currentLang === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#48C9B0" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                🌍 Wami-IA parle votre langue !
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  languageName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B5394',
  },
  languageList: {
    padding: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemActive: {
    backgroundColor: '#E8F4F8',
    borderColor: '#48C9B0',
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageTextContainer: {
    gap: 2,
  },
  languageNativeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  languageEnglishName: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
