export const MODES_PAIEMENT = {
  ESPECES: { value: 'especes', label: 'Espèces', icon: 'bi-cash', color: '#28a745' },
  CARTE: { value: 'carte', label: 'Carte bancaire', icon: 'bi-credit-card', color: '#007bff' },
  CHEQUE: { value: 'cheque', label: 'Chèque', icon: 'bi-receipt', color: '#6f42c1' },
  MOBILE: { value: 'mobile', label: 'Mobile Money', icon: 'bi-phone', color: '#fd7e14' },
  AUTRE: { value: 'autre', label: 'Autre', icon: 'bi-three-dots', color: '#6c757d' }
};

export const MODES_PAIEMENT_LISTE = Object.values(MODES_PAIEMENT);

export const getModePaiementStyle = (mode) => {
  return MODES_PAIEMENT[mode?.toUpperCase()] || MODES_PAIEMENT.AUTRE;
};