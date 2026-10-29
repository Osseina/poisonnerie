import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/utilisateurs`;

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

// Liste des utilisateurs avec pagination et filtres
export const getUsers = async (page = 1, limit = 20, filters = {}) => {
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

// Créer un utilisateur
export const createUser = async (userData) => {
  const response = await fetch(`${API_URL}/create.php`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

// Récupérer un utilisateur
export const getUser = async (id) => {
  const response = await fetch(`${API_URL}/get.php?id=${id}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

// Modifier un utilisateur
export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_URL}/update.php?id=${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

// Supprimer un utilisateur (soft delete)
export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/delete.php?id=${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

// Activer/Désactiver un utilisateur
// Activer/Désactiver un utilisateur
export const toggleUserStatus = async (id, est_actif) => {
  try {
    const response = await fetch(`${API_URL}/change_status.php`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ 
        id: id,           // ← Ajoute l'id dans le body
        est_actif: est_actif ? 1 : 0 
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur toggleUserStatus:', error);
    throw error;
  }
};