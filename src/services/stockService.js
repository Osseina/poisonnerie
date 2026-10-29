import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}`;

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

// ========== FOURNISSEURS ==========
export const getFournisseurs = async () => {
  try {
    console.log('🔍 Chargement des fournisseurs...');
    const response = await fetch(`${API_URL}/fournisseurs/list.php?limit=1000`, {
      headers: getHeaders()
    });
    const data = await handleResponse(response);
    console.log('✅ Fournisseurs reçus:', data);
    
    return data.data?.fournisseurs || [];
  } catch (error) {
    console.error('❌ Erreur getFournisseurs:', error);
    return [];
  }
};

// ========== ENTRÉE ==========
export const entreStock = async (data) => {
  try {
    const response = await fetch(`${API_URL}/stock/entree.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur entreStock:', error);
    throw error;
  }
};

// ========== SORTIE ==========
export const sortieStock = async (data) => {
  try {
    const response = await fetch(`${API_URL}/stock/sortie.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur sortieStock:', error);
    throw error;
  }
};

// ========== INVENTAIRE ==========
export const inventaireStock = async (data) => {
  try {
    const response = await fetch(`${API_URL}/stock/inventaire.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur inventaireStock:', error);
    throw error;
  }
};

// ========== HISTORIQUE ==========
export const getMouvements = async (filters = {}, page = 1, limit = 50) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    const response = await fetch(`${API_URL}/stock/historique.php?${params}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getMouvements:', error);
    throw error;
  }
};

// ========== LISTE DES ENTRÉES ==========
export const getEntreesStock = async (filters = {}, page = 1, limit = 20) => {
  try {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await fetch(`${API_URL}/stock/entrees-list.php?${params}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getEntreesStock:', error);
    throw error;
  }
};

// ========== LISTE DES SORTIES ==========
export const getSortiesStock = async (filters = {}, page = 1, limit = 20) => {
  try {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await fetch(`${API_URL}/stock/sorties-list.php?${params}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getSortiesStock:', error);
    throw error;
  }
};

// ========== MODIFIER UNE ENTRÉE ==========
export const updateEntreeStock = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/stock/entree-update.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur updateEntreeStock:', error);
    throw error;
  }
};

// ========== MODIFIER UNE SORTIE ==========
export const updateSortieStock = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/stock/sortie-update.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur updateSortieStock:', error);
    throw error;
  }
};

// ========== NIVEAUX DE STOCK ==========
export const getNiveauxStock = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.stock_faible) params.append('stock_faible', '1');
    if (filters.fournisseur_id) params.append('fournisseur_id', filters.fournisseur_id);
    if (filters.categorie_id) params.append('categorie_id', filters.categorie_id);
    
    const url = `${API_URL}/stock/niveau.php${params.toString() ? '?' + params.toString() : ''}`;
    console.log('🔍 Appel API Niveau:', url);
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    const data = await handleResponse(response);
    console.log('✅ Réponse reçue:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Erreur getNiveauxStock:', error);
    throw error;
  }
};

// ========== PRODUITS POUR SELECTS ==========
export const getProduitsForStock = async () => {
  try {
    const response = await fetch(`${API_URL}/produits/list.php?limit=1000`, {
      headers: getHeaders()
    });
    const data = await response.json();
    return data.data?.produits || [];
  } catch (error) {
    console.error('❌ Erreur getProduitsForStock:', error);
    return [];
  }
};

// ========== ALERTES STOCK ==========
export const getAlertesStock = async () => {
  try {
    const response = await fetch(`${API_URL}/stock/alertes.php`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Erreur getAlertesStock:', error);
    throw error;
  }
};

// ========== RAPPORTS ==========
export const getRapportsStock = async (periode = 'mois') => {
  try {
    console.log(`🔍 Chargement des rapports pour période: ${periode}`);
    const response = await fetch(`${API_BASE_URL}/stock/rapports.php?periode=${periode}`, {
      headers: getHeaders()
    });
    
    const data = await handleResponse(response);
    console.log('✅ Rapports reçus:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur getRapportsStock:', error);
    throw error;
  }
};