import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/commandes`;

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

// ========== COMMANDES ==========
// Liste des commandes avec pagination et filtres
export const getCommandes = async (page = 1, limit = 20, filters = {}) => {
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
    console.error('Erreur getCommandes:', error);
    throw error;
  }
};

// Récupérer une commande
export const getCommande = async (id) => {
  try {
    const response = await fetch(`${API_URL}/get.php?id=${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getCommande:', error);
    throw error;
  }
};

// Créer une commande
export const createCommande = async (commandeData) => {
  try {
    const response = await fetch(`${API_URL}/create.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(commandeData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur createCommande:', error);
    throw error;
  }
};

// ✅ Mettre à jour une commande (une seule fois)
export const updateCommande = async (id, commandeData) => {
  try {
    const response = await fetch(`${API_URL}/update.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(commandeData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur updateCommande:', error);
    throw error;
  }
};

// Changer le statut d'une commande
export const changeStatut = async (id, statut, commentaire = '') => {
  try {
    const response = await fetch(`${API_URL}/change-statut.php`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ 
        commande_id: id,
        statut,
        commentaire 
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur changeStatut:', error);
    throw error;
  }
};

// Annuler une commande
export const annulerCommande = async (id, motif = '') => {
  try {
    const response = await fetch(`${API_URL}/annuler.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ motif })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur annulerCommande:', error);
    throw error;
  }
};


// ========== DÉTAILS COMMANDE ==========
// Récupérer les détails d'une commande
export const getCommandeDetails = async (commandeId) => {
  try {
    const response = await fetch(`${API_URL}/details.php?commande_id=${commandeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getCommandeDetails:', error);
    throw error;
  }
};

// Ajouter un article à une commande
export const addArticle = async (commandeId, articleData) => {
  try {
    const response = await fetch(`${API_URL}/add-article.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        commande_id: commandeId,
        ...articleData
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur addArticle:', error);
    throw error;
  }
};

// Modifier un article
export const updateArticle = async (detailId, articleData) => {
  try {
    const response = await fetch(`${API_URL}/update-article.php?id=${detailId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(articleData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur updateArticle:', error);
    throw error;
  }
};

// Supprimer un article
export const deleteArticle = async (detailId) => {
  try {
    const response = await fetch(`${API_URL}/delete-article.php?id=${detailId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur deleteArticle:', error);
    throw error;
  }
};

// ========== HISTORIQUE ==========
// Récupérer l'historique d'une commande
export const getCommandeHistorique = async (commandeId) => {
  try {
    const response = await fetch(`${API_URL}/historique.php?commande_id=${commandeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur getCommandeHistorique:', error);
    throw error;
  }
};

// ========= LIMITE DE CRÉDIT ==========
// Vérifier la limite de crédit d'un client
export const checkCreditLimit = async (clientId, montant) => {
  try {
    const response = await fetch(`${API_URL}/check-credit.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ client_id: clientId, montant })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur checkCreditLimit:', error);
    throw error;
  }
};