import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/categories`;

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

// Liste des catégories
export const getCategories = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/list.php?${params}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getCategories:', error);
    throw error;
  }
};

// Récupérer une catégorie
export const getCategorie = async (id) => {
  try {
    const response = await fetch(`${API_URL}/get.php?id=${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getCategorie:', error);
    throw error;
  }
};

// Créer une catégorie
export const createCategorie = async (categorieData) => {
  try {
    const response = await fetch(`${API_URL}/create.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categorieData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur createCategorie:', error);
    throw error;
  }
};

// Modifier une catégorie
export const updateCategorie = async (id, categorieData) => {
  try {
    const response = await fetch(`${API_URL}/update.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categorieData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur updateCategorie:', error);
    throw error;
  }
};

// Supprimer une catégorie
export const deleteCategorie = async (id) => {
  try {
    const response = await fetch(`${API_URL}/delete.php?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur deleteCategorie:', error);
    throw error;
  }
};

// Activer/Désactiver une catégorie
export const toggleCategorieStatus = async (id, est_actif) => {
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
    console.error('Erreur toggleCategorieStatus:', error);
    throw error;
  }
};