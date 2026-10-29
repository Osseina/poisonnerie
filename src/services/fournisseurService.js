import { API_BASE_URL } from '../config';
// services/fournisseurService.js

const API_URL = `${API_BASE_URL}/fournisseurs`;

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

// Liste des fournisseurs avec pagination et filtres
export const getFournisseurs = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });

  const response = await fetch(`${API_URL}/list.php?${params}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

// Créer un fournisseur
export const createFournisseur = async (fournisseurData) => {
  const response = await fetch(`${API_URL}/create.php`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(fournisseurData)
  });
  return handleResponse(response);
};

// Récupérer un fournisseur
export const getFournisseur = async (id) => {
  const response = await fetch(`${API_URL}/get.php?id=${id}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

// Modifier un fournisseur
export const updateFournisseur = async (id, fournisseurData) => {
  const response = await fetch(`${API_URL}/update.php?id=${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(fournisseurData)
  });
  return handleResponse(response);
};

// Supprimer un fournisseur (soft delete)
export const deleteFournisseur = async (id) => {
  const response = await fetch(`${API_URL}/delete.php?id=${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

// Activer/Désactiver un fournisseur
export const toggleFournisseurStatus = async (id, est_actif) => {
  try {
    const response = await fetch(`${API_URL}/change_status.php`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ 
        id: id,
        est_actif: est_actif ? 1 : 0 
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur toggleFournisseurStatus:', error);
    throw error;
  }
};