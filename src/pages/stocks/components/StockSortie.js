import React, { useState, useEffect } from 'react';
import { sortieStock, getProduitsForStock } from '../../../services/stockService';

const StockSortie = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alertes, setAlertes] = useState([]);
  const [formData, setFormData] = useState({
    produit_id: '',
    quantite: '',
    type_sortie: 'vente',
    motif: ''
  });
  const [resultat, setResultat] = useState(null);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [stockDispo, setStockDispo] = useState(0);

  // Récupérer l'utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isGestionnaire = currentUser.profile === 'gestionnaire';
  const isVendeur = currentUser.profile === 'vendeur';

  // Types de sortie disponibles selon le profil
  const getTypesSortie = () => {
    // Types de base accessibles à tous
    const types = [
      { 
        value: 'vente', 
        label: 'Vente', 
        icon: 'bi-cart', 
        color: '#28a745', 
        allowed: true,
        description: 'Sortie standard pour les ventes',
        needsValidation: false
      }
    ];
    
    if (isGestionnaire) {
      // GESTIONNAIRE : tous les types sans validation
      types.push(
        { 
          value: 'perte', 
          label: 'Perte', 
          icon: 'bi-exclamation-triangle', 
          color: '#dc3545', 
          allowed: true,
          description: 'Marchandise abîmée, périmée, etc.',
          needsValidation: false
        },
        { 
          value: 'don', 
          label: 'Don', 
          icon: 'bi-gift', 
          color: '#17a2b8', 
          allowed: true,
          description: 'Don à une association, cadeau, etc.',
          needsValidation: false
        },
        { 
          value: 'retour_fournisseur', 
          label: 'Retour fournisseur', 
          icon: 'bi-truck', 
          color: '#fd7e14', 
          allowed: true,
          description: 'Retour de marchandise au fournisseur',
          needsValidation: false
        }
      );
    } else if (isVendeur) {
      // VENDEUR : tous les types mais avec validation
      types.push(
        { 
          value: 'perte', 
          label: 'Perte (avec validation)', 
          icon: 'bi-exclamation-triangle', 
          color: '#dc3545', 
          allowed: true,
          needsValidation: true,
          description: '⏳ Soumis à validation gestionnaire - motif requis'
        },
        { 
          value: 'don', 
          label: 'Don (avec validation)', 
          icon: 'bi-gift', 
          color: '#17a2b8', 
          allowed: true,
          needsValidation: true,
          description: '⏳ Soumis à validation gestionnaire - motif requis'
        },
        { 
          value: 'retour_fournisseur', 
          label: 'Retour fournisseur (avec validation)', 
          icon: 'bi-truck', 
          color: '#fd7e14', 
          allowed: true,
          needsValidation: true,
          description: '⏳ Soumis à validation gestionnaire - motif requis'
        }
      );
    }
    
    return types;
  };

  const typesSortie = getTypesSortie();

  useEffect(() => {
    loadProduits();
  }, []);

  useEffect(() => {
    if (formData.produit_id) {
      const produit = produits.find(p => p.id === parseInt(formData.produit_id));
      setSelectedProduit(produit);
      if (produit) {
        const stock = produit.type_vente === 'poids' 
          ? parseFloat(produit.stock_kg || 0)
          : parseInt(produit.stock_unite || 0);
        setStockDispo(stock);
      }
    } else {
      setSelectedProduit(null);
      setStockDispo(0);
    }
  }, [formData.produit_id, produits]);

  const loadProduits = async () => {
    try {
      const data = await getProduitsForStock();
      setProduits(data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoadingProduits(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantite') {
      if (selectedProduit?.type_vente === 'poids') {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
          const numValue = parseFloat(value);
          if (value === '' || (numValue > 0 && numValue <= stockDispo)) {
            setFormData(prev => ({
              ...prev,
              [name]: value
            }));
          }
        }
      } else {
        const numValue = parseInt(value);
        if (value === '' || (numValue > 0 && numValue <= stockDispo && Number.isInteger(numValue))) {
          setFormData(prev => ({
            ...prev,
            [name]: value
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setAlertes([]);
    setResultat(null);

    if (!formData.produit_id) {
      setError('Veuillez sélectionner un produit');
      setLoading(false);
      return;
    }

    if (!selectedProduit) {
      setError('Produit non trouvé');
      setLoading(false);
      return;
    }

    let quantite;
    if (selectedProduit.type_vente === 'poids') {
      quantite = parseFloat(formData.quantite);
      if (!formData.quantite || isNaN(quantite) || quantite <= 0) {
        setError('La quantité doit être un nombre positif (ex: 2.5)');
        setLoading(false);
        return;
      }
    } else {
      quantite = parseInt(formData.quantite);
      if (!formData.quantite || isNaN(quantite) || quantite <= 0 || !Number.isInteger(quantite)) {
        setError('La quantité doit être un nombre entier positif');
        setLoading(false);
        return;
      }
    }

    if (quantite > stockDispo) {
      setError(`Stock insuffisant. Disponible: ${stockDispo} ${selectedProduit.type_vente === 'poids' ? 'kg' : 'unité(s)'}`);
      setLoading(false);
      return;
    }

    const typeInfo = typesSortie.find(t => t.value === formData.type_sortie);

    // Validation du motif UNIQUEMENT pour les vendeurs et les types qui nécessitent validation
    if (isVendeur && typeInfo?.needsValidation && !formData.motif.trim()) {
      setError('Le motif est obligatoire pour ce type de sortie');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        produit_id: parseInt(formData.produit_id),
        quantite: quantite,
        type_sortie: formData.type_sortie,
        // N'envoyer le motif que si nécessaire
        ...(isVendeur && typeInfo?.needsValidation && { motif: formData.motif })
      };

      const response = await sortieStock(dataToSend);
      
      setSuccess(response.message);
      setResultat(response.data);
      
      if (response.data.alertes && response.data.alertes.length > 0) {
        setAlertes(response.data.alertes);
      }

      // Notification pour le vendeur quand il soumet une demande
      if (isVendeur && typeInfo?.needsValidation) {
        setAlertes(prev => [
          ...prev, 
          '📨 Votre demande a été envoyée au gestionnaire pour validation. Vous serez notifié de la décision.'
        ]);

        // Simuler l'envoi d'une notification (à remplacer par un vrai service de notification)
        console.log('🔔 Notification envoyée au gestionnaire:', {
          type: 'DEMANDE_VALIDATION_STOCK',
          utilisateur: currentUser.nom || currentUser.prenom || 'Vendeur',
          produit: selectedProduit.nom_produit,
          quantite: quantite,
          unite: getUnite(),
          type_sortie: typeInfo.label,
          motif: formData.motif,
          date: new Date().toISOString()
        });

        // Ici tu pourrais appeler une API pour envoyer une vraie notification
        // await envoyerNotificationGestionnaire({...});
      }

      await loadProduits();

      // Réinitialiser le formulaire
      setFormData({
        produit_id: formData.produit_id,
        quantite: '',
        type_sortie: 'vente',
        motif: ''
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getQuantiteStep = () => {
    return selectedProduit?.type_vente === 'poids' ? '0.001' : '1';
  };

  const getQuantitePlaceholder = () => {
    if (!selectedProduit) return 'Sélectionnez un produit';
    return selectedProduit.type_vente === 'poids' 
      ? `Max: ${stockDispo} kg` 
      : `Max: ${stockDispo} unités`;
  };

  const getUnite = () => {
    return selectedProduit?.type_vente === 'poids' ? 'kg' : 'unité(s)';
  };

  const getTypeInfo = () => {
    return typesSortie.find(t => t.value === formData.type_sortie) || typesSortie[0];
  };

  if (loadingProduits) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2" style={{ color: '#666' }}>Chargement des produits...</p>
      </div>
    );
  }

  const typeInfo = getTypeInfo();

  return (
    <div>
      {/* Messages d'alerte */}
      {error && (
        <div className="alert alert-danger" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #66BB6A'
        }}>
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </div>
      )}

      {alertes.map((alerte, idx) => (
        <div key={idx} className="alert alert-warning" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #ffc107'
        }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {alerte}
        </div>
      ))}

      {resultat && (
        <div className="alert alert-info mb-4" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #40C4FF',
          backgroundColor: '#e6f3ff'
        }}>
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-info-circle-fill me-2" style={{ color: '#006994' }}></i>
            <h6 className="mb-0" style={{ color: '#006994', fontWeight: 'bold' }}>Récapitulatif</h6>
          </div>
          <p className="mb-1">Produit : <strong style={{ color: '#006994' }}>{resultat.produit_nom}</strong></p>
          <p className="mb-1">
            Stock avant : <strong className="text-warning">{resultat.stock_avant} {resultat.unite || getUnite()}</strong>
          </p>
          <p className="mb-1">
            Quantité retirée : <strong className="text-danger">-{resultat.quantite_retiree} {resultat.unite || getUnite()}</strong>
          </p>
          <p className="mb-1">
            Stock après : <strong className="text-info">{resultat.stock_apres} {resultat.unite || getUnite()}</strong>
          </p>
          <p className="mb-0 mt-1">
            <i className="bi bi-tag me-1" style={{ color: '#006994' }}></i>
            Type : <strong>{typeInfo?.label}</strong>
          </p>
          {resultat.motif && (
            <p className="mb-0 mt-1">
              <i className="bi bi-chat me-1" style={{ color: '#006994' }}></i>
              Motif : <em>"{resultat.motif}"</em>
            </p>
          )}
          {isVendeur && typeInfo?.needsValidation && (
            <p className="mb-0 mt-2 text-warning">
              <i className="bi bi-hourglass-split me-1"></i>
              En attente de validation gestionnaire
            </p>
          )}
        </div>
      )}

      {/* Formulaire */}
      <div className="card" style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '8px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }} />

        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-box-arrow-up" style={{ fontSize: '40px', color: '#006994' }}></i>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              color: '#006994',
              fontSize: '1.5rem',
              marginTop: '10px'
            }}>
              Sortie de stock
            </h2>
            {isVendeur && (
              <p className="text-muted small">
                <i className="bi bi-person me-1"></i>
                Connecté en tant que vendeur
              </p>
            )}
            {isGestionnaire && (
              <p className="text-muted small">
                <i className="bi bi-person-badge me-1"></i>
                Connecté en tant que gestionnaire
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Produit */}
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ color: '#006994' }}>
                <i className="bi bi-box me-2"></i>
                Produit <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="produit_id"
                value={formData.produit_id}
                onChange={handleChange}
                required
                style={{
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '10px'
                }}
              >
                <option value="">Sélectionner un produit</option>
                {produits.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nom_produit} - Stock: {p.type_vente === 'poids' 
                      ? `${p.stock_kg || 0} kg` 
                      : `${p.stock_unite || 0} unité(s)`}
                  </option>
                ))}
              </select>
              {selectedProduit && (
                <div className="mt-2 d-flex justify-content-between align-items-center p-2" style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <small style={{ color: '#006994' }}>
                    <i className="bi bi-info-circle me-1"></i>
                    Type: <strong>{selectedProduit.type_vente === 'poids' ? 'Au poids' : 'À l\'unité'}</strong>
                  </small>
                  <small className={stockDispo === 0 ? 'text-danger' : 'text-success'}>
                    <i className={`bi ${stockDispo === 0 ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-1`}></i>
                    <strong>{stockDispo} {getUnite()}</strong>
                  </small>
                </div>
              )}
            </div>

            {/* Quantité et Type de sortie */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: '#006994' }}>
                  <i className="bi bi-sort-numeric-up-alt me-2"></i>
                  Quantité <span className="text-danger">*</span>
                  {selectedProduit && (
                    <span className="ms-2 text-muted">({getUnite()})</span>
                  )}
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleChange}
                  min="0"
                  max={stockDispo || 0}
                  step={getQuantiteStep()}
                  placeholder={getQuantitePlaceholder()}
                  required
                  disabled={!selectedProduit || stockDispo === 0}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    padding: '10px'
                  }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: '#006994' }}>
                  <i className="bi bi-tag me-2"></i>
                  Type de sortie
                </label>
                <select
                  className="form-select"
                  name="type_sortie"
                  value={formData.type_sortie}
                  onChange={handleChange}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    padding: '10px'
                  }}
                >
                  {typesSortie.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {typeInfo?.description && (
                  <small className="text-muted d-block mt-1">
                    <i className="bi bi-info-circle me-1"></i>
                    {typeInfo.description}
                  </small>
                )}
              </div>
            </div>

            {/* Motif - UNIQUEMENT pour les vendeurs et les types qui nécessitent validation */}
            {isVendeur && typeInfo?.needsValidation && (
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: '#006994' }}>
                  <i className="bi bi-chat me-2"></i>
                  Motif <span className="text-danger">*</span>
                  <small className="text-muted ms-2">(obligatoire pour validation)</small>
                </label>
                <textarea
                  className="form-control"
                  name="motif"
                  value={formData.motif}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Expliquez la raison de cette opération..."
                  required
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    padding: '10px'
                  }}
                />
                <div className="alert alert-warning mt-2" style={{
                  backgroundColor: '#fff3cd',
                  border: 'none',
                  borderLeft: '4px solid #ffc107',
                  fontSize: '0.9rem'
                }}>
                  <i className="bi bi-hourglass-split me-2"></i>
                  <strong>Attention :</strong> Cette opération sera soumise à la validation d'un gestionnaire avant d'être effective. Une notification sera envoyée.
                </div>
              </div>
            )}

            {/* Message d'information */}
            <div className="alert alert-info mb-4" style={{
              borderRadius: '8px',
              borderLeft: '4px solid #40C4FF',
              backgroundColor: '#e6f3ff',
              fontSize: '0.9rem'
            }}>
              <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
              {isVendeur && typeInfo?.needsValidation 
                ? "⏳ Cette opération nécessite la validation d'un gestionnaire. Une notification sera envoyée."
                : isGestionnaire 
                  ? "✅ En tant que gestionnaire, vos actions sont immédiates."
                  : "Les champs marqués d'un * sont obligatoires. La quantité sera retirée du stock immédiatement."
              }
            </div>

            {/* Boutons */}
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => window.history.back()}
                style={{
                  borderRadius: '8px',
                  padding: '10px 25px'
                }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Annuler
              </button>
              
              <button
                type="submit"
                className="btn"
                disabled={loading || !selectedProduit || stockDispo === 0}
                style={{
                  backgroundColor: typeInfo?.needsValidation ? '#ffc107' : '#FF6F00',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '10px 30px',
                  border: 'none',
                  opacity: (loading || !selectedProduit || stockDispo === 0) ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Traitement...
                  </>
                ) : !selectedProduit ? (
                  'Sélectionnez un produit'
                ) : stockDispo === 0 ? (
                  'Rupture de stock'
                ) : isVendeur && typeInfo?.needsValidation ? (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Soumettre pour validation
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Valider la sortie
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div style={{
          height: '8px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0
        }} />
      </div>
    </div>
  );
};

export default StockSortie;