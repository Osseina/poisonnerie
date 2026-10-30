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
    // Le stock démarre toujours à 0 côté serveur ; seul le prix de vente est saisi ici
    const dataToSend = {
      code_produit: produitData.code_produit || '',
      nom_produit: produitData.nom_produit,
      description: produitData.description || '',
      type_vente: produitData.type_vente || 'poids',
      fournisseur_id: produitData.fournisseur_id ? parseInt(produitData.fournisseur_id) : null,
      categorie_id: produitData.categorie_id ? parseInt(produitData.categorie_id) : null,
      prix_vente: produitData.prix_vente !== undefined && produitData.prix_vente !== null && produitData.prix_vente !== ''
        ? parseFloat(produitData.prix_vente) : null,
      prix_achat: produitData.prix_achat !== undefined && produitData.prix_achat !== null && produitData.prix_achat !== ''
        ? parseFloat(produitData.prix_achat) : null,
      stock_min_kg: parseInt(produitData.stock_min_kg) || 5,
      stock_max_kg: parseInt(produitData.stock_max_kg) || 100,
    };

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
    // Seuls les champs fournis sont envoyés (le serveur ne modifie que ceux-là)
    const dataToSend = { id };
    const champs = ['nom_produit', 'description', 'type_vente', 'stock_min_kg', 'stock_max_kg'];
    champs.forEach((c) => {
      if (produitData[c] !== undefined) dataToSend[c] = produitData[c];
    });
    if (produitData.fournisseur_id !== undefined) {
      dataToSend.fournisseur_id = produitData.fournisseur_id ? parseInt(produitData.fournisseur_id) : null;
    }
    if (produitData.categorie_id !== undefined) {
      dataToSend.categorie_id = produitData.categorie_id ? parseInt(produitData.categorie_id) : null;
    }
    if (produitData.est_actif !== undefined) {
      dataToSend.est_actif = produitData.est_actif ? 1 : 0;
    }
    ['prix_vente', 'prix_achat'].forEach((c) => {
      if (produitData[c] !== undefined) {
        dataToSend[c] = produitData[c] === null || produitData[c] === '' ? null : parseFloat(produitData[c]);
      }
    });

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
    // La liste des fournisseurs est réservée au gestionnaire
    if (JSON.parse(localStorage.getItem('user') || '{}').profile !== 'gestionnaire') return [];
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