import React, { useState, useEffect } from 'react';
import { entreStock, getProduitsForStock, getFournisseurs } from '../../../services/stockService';

const StockEntree = () => {
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alerte, setAlerte] = useState('');
  
  // Mode de saisie : 'simple' ou 'lot'
  const [modeSaisie, setModeSaisie] = useState('simple');
  
  const [formData, setFormData] = useState({
    produit_id: '',
    // Prix de vente (prérempli avec le prix actuel du produit, facultatif)
    prix_vente: '',
    // Mode simple
    quantite_simple: '',
    prix_achat_unitaire: '', // ✅ NOUVEAU : prix d'achat unitaire
    // Mode lot
    fournisseur_id: '',
    lot_quantite_gros: '',
    lot_unite_gros: 'carton',
    lot_prix_achat_gros: '',
    lot_conversion_unite: '',
    // Numéro livraison
    numero_livraison: ''
  });
  
  const [calculs, setCalculs] = useState({
    quantite_totale: 0,
    prix_revient_unitaire: 0,
    unite_vente: 'kg' // ou 'unité'
  });
  
  const [resultat, setResultat] = useState(null);
  const [selectedProduit, setSelectedProduit] = useState(null);

  useEffect(() => {
    loadProduits();
    loadFournisseurs();
  }, []);

  // Mettre à jour le produit sélectionné
  useEffect(() => {
    if (formData.produit_id) {
      const produit = produits.find(p => p.id === parseInt(formData.produit_id));
      setSelectedProduit(produit);
      // Préremplir avec le prix de vente actuel du produit
      setFormData(prev => ({
        ...prev,
        prix_vente: produit && produit.prix_vente != null && parseFloat(produit.prix_vente) > 0
          ? String(parseFloat(produit.prix_vente))
          : '',
        // Prix d'achat unitaire prérempli avec le dernier prix connu du produit
        prix_achat_unitaire: produit && produit.prix_achat != null && parseFloat(produit.prix_achat) > 0
          ? String(parseFloat(produit.prix_achat))
          : ''
      }));
      setCalculs(prev => ({
        ...prev,
        unite_vente: produit?.type_vente === 'poids' ? 'kg' : 'unité'
      }));
    } else {
      setSelectedProduit(null);
    }
  }, [formData.produit_id, produits]);

  // Calculs automatiques pour le mode lot
  useEffect(() => {
    if (modeSaisie === 'lot' && 
        formData.lot_quantite_gros && 
        formData.lot_prix_achat_gros && 
        formData.lot_conversion_unite) {
      
      const quantiteGros = parseFloat(formData.lot_quantite_gros) || 0;
      const conversion = parseFloat(formData.lot_conversion_unite) || 0;
      const prixAchatGros = parseFloat(formData.lot_prix_achat_gros) || 0;
      
      const quantiteTotale = quantiteGros * conversion;
      const prixRevient = quantiteTotale > 0 ? prixAchatGros / quantiteTotale : 0;
      
      setCalculs(prev => ({
        ...prev,
        quantite_totale: quantiteTotale,
        prix_revient_unitaire: prixRevient.toFixed(2)
      }));
    } else {
      setCalculs(prev => ({
        ...prev,
        quantite_totale: 0,
        prix_revient_unitaire: 0
      }));
    }
  }, [modeSaisie, formData.lot_quantite_gros, formData.lot_prix_achat_gros, formData.lot_conversion_unite]);

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

  const loadFournisseurs = async () => {
    try {
      const data = await getFournisseurs();
      console.log('Fournisseurs chargés:', data);
      setFournisseurs(data);
    } catch (err) {
      console.error('Erreur chargement fournisseurs:', err);
    } finally {
      setLoadingFournisseurs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`🔧 Changement ${name}:`, value);
    
    // Pour les champs numériques
    if (['lot_quantite_gros', 'lot_prix_achat_gros', 'lot_conversion_unite', 
         'quantite_simple', 'prix_vente', 'prix_achat_unitaire'].includes(name)) {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
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
    setAlerte('');
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

    // Prix de vente facultatif, mais jamais négatif
    if (formData.prix_vente !== '' && parseFloat(formData.prix_vente) < 0) {
      setError('Le prix de vente ne peut pas être négatif');
      setLoading(false);
      return;
    }

    try {
      let dataToSend = {
        produit_id: parseInt(formData.produit_id)
      };
      if (formData.prix_vente !== '' && parseFloat(formData.prix_vente) > 0) {
        dataToSend.prix_vente = parseFloat(formData.prix_vente);
      }

      if (modeSaisie === 'simple') {
        // MODE SIMPLE : validation de la quantité et du prix d'achat
        let quantite;
        
        if (selectedProduit.type_vente === 'poids') {
          quantite = parseFloat(formData.quantite_simple);
          if (!formData.quantite_simple || isNaN(quantite) || quantite <= 0) {
            throw new Error('La quantité doit être un nombre positif (ex: 2.5)');
          }
        } else {
          quantite = parseInt(formData.quantite_simple);
          if (!formData.quantite_simple || isNaN(quantite) || quantite <= 0) {
            throw new Error('La quantité doit être un nombre entier positif');
          }
          if (!Number.isInteger(quantite)) {
            throw new Error('Pour les produits à l\'unité, la quantité doit être un nombre entier');
          }
        }

        // ✅ Validation du prix d'achat unitaire
        const prixAchatUnitaire = parseFloat(formData.prix_achat_unitaire);
        if (!formData.prix_achat_unitaire || isNaN(prixAchatUnitaire) || prixAchatUnitaire <= 0) {
          throw new Error('Le prix d\'achat unitaire est requis');
        }
        
        dataToSend.quantite = quantite;
        dataToSend.prix_achat_unitaire = prixAchatUnitaire; // ✅ Envoi du prix d'achat
        
      } else {
        // MODE LOT
        if (!formData.lot_quantite_gros || parseFloat(formData.lot_quantite_gros) <= 0) {
          throw new Error('La quantité en gros est requise');
        }
        if (!formData.lot_prix_achat_gros || parseFloat(formData.lot_prix_achat_gros) <= 0) {
          throw new Error('Le prix d\'achat total est requis');
        }
        if (!formData.lot_conversion_unite || parseFloat(formData.lot_conversion_unite) <= 0) {
          throw new Error('La conversion par lot est requise');
        }
        
        dataToSend = {
          ...dataToSend,
          fournisseur_id: formData.fournisseur_id ? parseInt(formData.fournisseur_id) : null,
          lot_quantite_gros: parseFloat(formData.lot_quantite_gros),
          lot_unite_gros: formData.lot_unite_gros,
          lot_prix_achat_gros: parseFloat(formData.lot_prix_achat_gros),
          lot_conversion_unite: parseFloat(formData.lot_conversion_unite),
          numero_livraison: formData.numero_livraison
        };
      }

      console.log('📤 Données envoyées:', dataToSend);
      const response = await entreStock(dataToSend);
      
      setSuccess(response.message);
      setResultat(response.data);
      
      if (response.data.alerte) {
        setAlerte(response.data.alerte);
      }

      await loadProduits();

      // Réinitialiser le formulaire
      setFormData({
        produit_id: '',
        prix_vente: '',
        quantite_simple: '',
        prix_achat_unitaire: '',
        fournisseur_id: '',
        lot_quantite_gros: '',
        lot_unite_gros: 'carton',
        lot_prix_achat_gros: '',
        lot_conversion_unite: '',
        numero_livraison: ''
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

  const getUnite = () => {
    return selectedProduit?.type_vente === 'poids' ? 'kg' : 'unité';
  };

  if (loadingProduits || loadingFournisseurs) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2" style={{ color: '#666' }}>Chargement...</p>
      </div>
    );
  }

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

      {alerte && (
        <div className="alert alert-warning" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #ffc107'
        }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {alerte}
        </div>
      )}

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
            Quantité ajoutée : <strong className="text-success">+{resultat.quantite_ajoutee} {resultat.unite || getUnite()}</strong>
          </p>
          {resultat.avertissement_prix && (
            <p className="mb-1 text-warning fw-semibold">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {resultat.avertissement_prix}
            </p>
          )}
          {resultat.prix_vente > 0 && (
            <p className="mb-1">
              Prix de vente : <strong className="text-primary">{resultat.prix_vente} F CFA/{getUnite()}</strong>
            </p>
          )}
          {resultat.prix_revient_unitaire > 0 && (
            <p className="mb-1">
              Prix revient : <strong className="text-info">{resultat.prix_revient_unitaire} F CFA/{getUnite()}</strong>
            </p>
          )}
          <p className="mb-0">
            Stock après : <strong className="text-info">{resultat.stock_apres} {resultat.unite || getUnite()}</strong>
          </p>
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
            <i className="bi bi-box-arrow-in-down" style={{ fontSize: '40px', color: '#006994' }}></i>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              color: '#006994',
              fontSize: '1.5rem',
              marginTop: '10px'
            }}>
              Entrée de stock
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Sélection du produit */}
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
                <div className="mt-2 p-2" style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: '4px solid #006994'
                }}>
                  <small>
                    <i className="bi bi-info-circle me-1"></i>
                    Type: <strong>{selectedProduit.type_vente === 'poids' ? 'Au poids (kg)' : 'À l\'unité'}</strong>
                  </small>
                </div>
              )}
            </div>

            {/* Prix de vente */}
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ color: '#006994' }}>
                <i className="bi bi-tag me-2"></i>
                Prix de vente
                {selectedProduit && (
                  <span className="ms-2 text-muted">(par {getUnite()})</span>
                )}
              </label>
              <input
                type="number"
                className="form-control"
                name="prix_vente"
                value={formData.prix_vente}
                onChange={handleChange}
                min="0"
                step="0.01"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '10px'
                }}
              />
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Prérempli avec le prix actuel du produit. Modifiez-le pour changer le prix à la caisse.
              </small>
            </div>

            {/* Mode de saisie */}
            {selectedProduit && (
              <div className="mb-4">
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${modeSaisie === 'simple' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setModeSaisie('simple')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Saisie simple
                  </button>
                  <button
                    type="button"
                    className={`btn ${modeSaisie === 'lot' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setModeSaisie('lot')}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Achat en gros
                  </button>
                </div>
              </div>
            )}

            {/* Mode SIMPLE avec prix d'achat */}
            {modeSaisie === 'simple' && selectedProduit && (
              <>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-sort-numeric-up-alt me-2"></i>
                      Quantité <span className="text-danger">*</span>
                      <span className="ms-2 text-muted">({getUnite()})</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantite_simple"
                      value={formData.quantite_simple}
                      onChange={handleChange}
                      min="0"
                      step={getQuantiteStep()}
                      required
                    />
                    <small className="text-muted d-block mt-1">
                      {selectedProduit.type_vente === 'poids' 
                        ? '⚖️ Accepte les décimales' 
                        : '📦 Nombres entiers uniquement'}
                    </small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-currency-dollar me-2"></i>
                      Prix d'achat unitaire <span className="text-danger">*</span>
                      <span className="ms-2 text-muted">(par {getUnite()})</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="prix_achat_unitaire"
                      value={formData.prix_achat_unitaire}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mode LOT (inchangé) */}
            {modeSaisie === 'lot' && selectedProduit && (
              <>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-truck me-2"></i>
                      Fournisseur
                    </label>
                    <select
                      className="form-select"
                      name="fournisseur_id"
                      value={formData.fournisseur_id}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      {fournisseurs.map(f => (
                        <option key={f.id} value={f.id}>{f.nom_societe}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-upc-scan me-2"></i>
                      N° livraison
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="numero_livraison"
                      value={formData.numero_livraison}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="card mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-body">
                    <h6 className="card-title" style={{ color: '#006994' }}>
                      <i className="bi bi-box-seam me-2"></i>
                      Détails de l'achat en gros
                    </h6>
                    
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label">Quantité (gros) *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="lot_quantite_gros"
                          value={formData.lot_quantite_gros}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      
                      <div className="col-md-4">
                        <label className="form-label">Unité (gros)</label>
                        <select
                          className="form-control"
                          name="lot_unite_gros"
                          value={formData.lot_unite_gros}
                          onChange={handleChange}
                        >
                          <option value="carton">Carton</option>
                          <option value="caisse">Caisse</option>
                          <option value="sac">Sac</option>
                          <option value="kg">Kilogramme</option>
                        </select>
                      </div>
                      
                      <div className="col-md-4">
                        <label className="form-label">Prix total (FCFA) *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="lot_prix_achat_gros"
                          value={formData.lot_prix_achat_gros}
                          onChange={handleChange}
                          min="0"
                          step="any"
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label">
                          Conversion (1 {formData.lot_unite_gros} = ? {getUnite()}) *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="lot_conversion_unite"
                          value={formData.lot_conversion_unite}
                          onChange={handleChange}
                          min="0"
                          step={selectedProduit.type_vente === 'poids' ? '0.001' : '1'}
                          required
                        />
                        <small className="text-muted">
                          Ex: 1 carton = {selectedProduit.type_vente === 'poids' ? '10 kg' : '12 unités'}
                        </small>
                      </div>
                    </div>

                    {calculs.quantite_totale > 0 && (
                      <div className="alert alert-success mt-3 mb-0">
                        <div className="row">
                          <div className="col-md-6">
                            <strong>Quantité totale :</strong> {calculs.quantite_totale} {getUnite()}
                          </div>
                          <div className="col-md-6">
                            <strong>Prix revient :</strong> {calculs.prix_revient_unitaire} F CFA/{getUnite()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Message d'information */}
            <div className="alert alert-info mb-4">
              <i className="bi bi-info-circle me-2"></i>
              Les champs marqués d'un <span className="text-danger">*</span> sont obligatoires.
            </div>

            {/* Boutons */}
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => window.history.back()}
                style={{ borderRadius: '8px', padding: '10px 25px' }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Annuler
              </button>
              
              <button
                type="submit"
                className="btn"
                disabled={loading || !selectedProduit}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '10px 30px',
                  border: 'none',
                  opacity: (loading || !selectedProduit) ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Valider
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

export default StockEntree;