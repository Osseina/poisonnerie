export const STATUTS_COMMANDE = {
  EN_ATTENTE: { value: 'en_attente', label: 'En attente', color: '#ffc107', icon: 'bi-hourglass' },
  LIVREE: { value: 'livree', label: 'Livrée', color: '#28a745', icon: 'bi-check2-all' },
  ANNULEE: { value: 'annulee', label: 'Annulée', color: '#dc3545', icon: 'bi-x-circle' }
};

export const STATUTS_LISTE = Object.values(STATUTS_COMMANDE);

export const getStatutStyle = (statut) => {
  return STATUTS_COMMANDE[statut?.toUpperCase()] || STATUTS_COMMANDE.EN_ATTENTE;
};