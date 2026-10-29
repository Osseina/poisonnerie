import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/ventes`;

// Récupérer le token
const getToken = () => localStorage.getItem('token');

// Headers par défaut
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Gérer les réponses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur serveur');
  }
  return data;
};

// ========== VENTES ==========
// Liste des ventes avec pagination
export const getVentes = async (page = 1, limit = 20, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    const response = await fetch(`${API_URL}/list.php?${params}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getVentes:', error);
    throw error;
  }
};

// Récupérer une vente
export const getVente = async (id) => {
  try {
    const response = await fetch(`${API_URL}/get.php?id=${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getVente:', error);
    throw error;
  }
};

// Créer une vente directe (boutique)
export const createVente = async (venteData) => {
  try {
    const response = await fetch(`${API_URL}/create.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(venteData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur createVente:', error);
    throw error;
  }
};

// Créer une vente depuis une commande
export const createVenteFromCommande = async (commandeId) => {
  try {
    const response = await fetch(`${API_URL}/create-from-commande.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ commande_id: commandeId })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur createVenteFromCommande:', error);
    throw error;
  }
};

// Annuler une vente (retour stock)
export const annulerVente = async (id, motif = '') => {
  try {
    const response = await fetch(`${API_URL}/annuler.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ motif })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur annulerVente:', error);
    throw error;
  }
};

// ✅ NOUVELLE VERSION : Récupérer les produits pour une vente (avec prix depuis stock_mouvements)
export const getProduitsForVente = async () => {
  try {
    console.log('🔍 Chargement des produits pour vente...');
    
    // Utiliser l'endpoint spécifique pour les ventes
    const response = await fetch(`${API_BASE_URL}/produits/pour-vente.php`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    console.log('📦 Réponse brute:', data);
    
    if (data.success) {
      console.log('✅ Produits chargés:', data.produits);
      return data.produits || [];
    } else {
      console.error('❌ Erreur dans la réponse:', data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Erreur getProduitsForVente:', error);
    return [];
  }
};

