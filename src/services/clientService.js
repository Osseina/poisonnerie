import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/clients`;

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

// Liste des clients
export const getClients = async () => {
  try {
    const response = await fetch(`${API_URL}/list.php`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getClients:', error);
    throw error;
  }
};

// Récupérer un client
export const getClient = async (id) => {
  try {
    const response = await fetch(`${API_URL}/get.php?id=${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getClient:', error);
    throw error;
  }
};

// Créer un client
export const createClient = async (clientData) => {
  try {
    const response = await fetch(`${API_URL}/create.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(clientData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur createClient:', error);
    throw error;
  }
};

// Modifier un client
export const updateClient = async (id, clientData) => {
  try {
    const response = await fetch(`${API_URL}/update.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(clientData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur updateClient:', error);
    throw error;
  }
};

// Supprimer un client (soft delete)
export const deleteClient = async (id) => {
  try {
    const response = await fetch(`${API_URL}/delete.php?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur deleteClient:', error);
    throw error;
  }
};