import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de base de l'API (à modifier selon votre backend)
const API_URL = 'https://votre-api.com/api';

/**
 * Service d'authentification
 * Gère les appels API pour la connexion, l'inscription et la gestion des tokens
 */
class AuthService {
  /**
   * Connexion de l'utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Données de l'utilisateur et token
   */
  async login(email, password) {
    try {
      // Pour la démo, simuler une réponse API
      // En production, remplacer par un vrai appel API:
      // const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données de démo
      const userData = {
        id: 1,
        email: email,
        name: email.split('@')[0],
        token: 'demo-token-' + Date.now(),
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      // Sauvegarder le token
      await this.saveToken(userData.token);

      return userData;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error('Échec de la connexion. Vérifiez vos identifiants.');
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} Données de l'utilisateur créé
   */
  async register(userData) {
    try {
      // En production:
      // const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now(),
        ...userData,
        token: 'demo-token-' + Date.now(),
        createdAt: new Date().toISOString(),
      };

      await this.saveToken(newUser.token);

      return newUser;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error('Échec de l\'inscription. Veuillez réessayer.');
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout() {
    try {
      // En production, invalider le token côté serveur:
      // await axios.post(`${API_URL}/auth/logout`);
      
      await this.removeToken();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Récupérer le profil de l'utilisateur
   * @returns {Promise<Object>} Profil de l'utilisateur
   */
  async getProfile() {
    try {
      const token = await this.getToken();
      
      // En production:
      // const response = await axios.get(`${API_URL}/auth/profile`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: 1,
        email: 'demo@wami.com',
        name: 'Utilisateur Démo',
        role: 'admin',
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le profil de l'utilisateur
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<Object>} Profil mis à jour
   */
  async updateProfile(updates) {
    try {
      const token = await this.getToken();
      
      // En production:
      // const response = await axios.put(`${API_URL}/auth/profile`, updates, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Réinitialiser le mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      // En production:
      // await axios.post(`${API_URL}/auth/reset-password`, { email });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Email de réinitialisation envoyé à:', email);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  }

  // Méthodes de gestion du token

  /**
   * Sauvegarder le token d'authentification
   * @param {string} token
   */
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('@auth_token', token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      throw error;
    }
  }

  /**
   * Récupérer le token d'authentification
   * @returns {Promise<string|null>}
   */
  async getToken() {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  /**
   * Supprimer le token d'authentification
   */
  async removeToken() {
    try {
      await AsyncStorage.removeItem('@auth_token');
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      throw error;
    }
  }

  /**
   * Configurer les intercepteurs Axios pour ajouter le token aux requêtes
   */
  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expiré ou invalide, déconnecter l'utilisateur
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }
}

export default new AuthService();
