import { API_BASE_URL } from '../config';
// services/produitCommandeService.js

const API_URL = `${API_BASE_URL}`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const getProduitsPourCommande = async () => {
  try {
    console.log('🔍 Chargement des produits pour commande...');
    const response = await fetch(`${API_URL}/produits/commande.php`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    console.log('✅ Produits pour commande reçus:', data);
    
    if (data.success && data.data?.produits) {
      return data.data.produits;
    }
    return [];
  } catch (error) {
    console.error('❌ Erreur getProduitsPourCommande:', error);
    return [];
  }
};