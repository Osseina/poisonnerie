import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/produits`;

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

// Liste des produits avec pagination
export const getProduits = async (page = 1, limit = 20, filters = {}) => {
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
    console.error('Erreur getProduits:', error);
    throw error;
  }
};

// Récupérer un produit
export const getProduit = async (id) => {
  try {
    const response = await fetch(`${API_URL}/get.php?id=${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getProduit:', error);
    throw error;
  }
};

// ✅ Créer un produit (adapté aux nouveaux champs)
export const createProduit = async (produitData) => {
  try {
    // Construction des données selon le type
    const dataToSend = {
      code_produit: produitData.code_produit || '',
      nom_produit: produitData.nom_produit,
      description: produitData.description || '',
      type_vente: produitData.type_vente || 'poids',
      fournisseur_id: produitData.fournisseur_id ? parseInt(produitData.fournisseur_id) : null,
      categorie_id: produitData.categorie_id ? parseInt(produitData.categorie_id) : null,
    };

    // Ajouter les champs selon le type
    if (produitData.type_vente === 'poids') {
      dataToSend.prix_achat_kg = parseFloat(produitData.prix_achat_kg) || 0;
      dataToSend.prix_vente_kg = parseFloat(produitData.prix_vente_kg) || 0;
      dataToSend.stock_initial = parseFloat(produitData.stock_initial) || 0;
      dataToSend.stock_min_kg = parseInt(produitData.stock_min_kg) || 5;
      dataToSend.stock_max_kg = parseInt(produitData.stock_max_kg) || 100;
    } else {
      dataToSend.prix_achat_unite = parseFloat(produitData.prix_achat_unite) || 0;
      dataToSend.prix_vente_unite = parseFloat(produitData.prix_vente_unite) || 0;
      dataToSend.stock_initial = parseInt(produitData.stock_initial) || 0;
      dataToSend.stock_min_unite = parseInt(produitData.stock_min_unite) || 5;
      dataToSend.stock_max_unite = parseInt(produitData.stock_max_unite) || 100;
    }

    const response = await fetch(`${API_URL}/create.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dataToSend)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur createProduit:', error);
    throw error;
  }
};

// ✅ Modifier un produit (adapté aux nouveaux champs)
export const updateProduit = async (id, produitData) => {
  try {
    // Construction des données selon le type
    const dataToSend = {
      code_produit: produitData.code_produit || '',
      nom_produit: produitData.nom_produit,
      description: produitData.description || '',
      type_vente: produitData.type_vente,
      fournisseur_id: produitData.fournisseur_id ? parseInt(produitData.fournisseur_id) : null,
      categorie_id: produitData.categorie_id ? parseInt(produitData.categorie_id) : null,
      est_actif: produitData.est_actif ? 1 : 0
    };

    // Ajouter les champs selon le type
    if (produitData.type_vente === 'poids') {
      dataToSend.prix_achat_kg = parseFloat(produitData.prix_achat_kg) || 0;
      dataToSend.prix_vente_kg = parseFloat(produitData.prix_vente_kg) || 0;
      dataToSend.stock_min_kg = parseInt(produitData.stock_min_kg) || 5;
      dataToSend.stock_max_kg = parseInt(produitData.stock_max_kg) || 100;
    } else {
      dataToSend.prix_achat_unite = parseFloat(produitData.prix_achat_unite) || 0;
      dataToSend.prix_vente_unite = parseFloat(produitData.prix_vente_unite) || 0;
      dataToSend.stock_min_unite = parseInt(produitData.stock_min_unite) || 5;
      dataToSend.stock_max_unite = parseInt(produitData.stock_max_unite) || 100;
    }

    const response = await fetch(`${API_URL}/update.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dataToSend)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur updateProduit:', error);
    throw error;
  }
};

// Supprimer un produit (soft delete)
export const deleteProduit = async (id) => {
  try {
    const response = await fetch(`${API_URL}/delete.php?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur deleteProduit:', error);
    throw error;
  }
};

// Activer/Désactiver un produit
export const toggleProduitStatus = async (id, est_actif) => {
  try {
    const response = await fetch(`${API_URL}/change_status.php`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ 
        id: parseInt(id),
        est_actif: est_actif ? 1 : 0 
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur toggleProduitStatus:', error);
    throw error;
  }
};

// Récupérer les fournisseurs pour le select
export const getFournisseurs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/list.php?limit=1000`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success && data.data?.fournisseurs) {
      return data.data.fournisseurs;
    }
    
    console.warn('⚠️ Structure fournisseurs inattendue:', data);
    return [];
  } catch (error) {
    console.error('❌ Erreur getFournisseurs:', error);
    return [];
  }
};

// Récupérer les catégories pour le select
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/list.php`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success && data.categories) {
      return data.categories;
    }
    
    console.warn('⚠️ Structure catégories inattendue:', data);
    return [];
  } catch (error) {
    console.error('❌ Erreur getCategories:', error);
    return [];
  }
};