import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVente, getProduitsForVente } from '../../services/venteService';
import { MODES_PAIEMENT_LISTE, getModePaiementStyle } from '../../constants/modesPaiement';

const VenteCreate = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // État pour le panier
  const [panier, setPanier] = useState([]);
  
  // Article en cours d'ajout
  const [articleCourant, setArticleCourant] = useState({
    produit_id: '',
    quantite: 1,
    prix_unitaire: 0,
    stock_dispo: 0,
    type_vente: 'poids',
    nom_produit: ''
  });

  // Client (optionnel)
  const [client, setClient] = useState({
    client_id: '',
    client_nom: '',
    client_telephone: '',
    client_email: ''
  });

  // Paiement
  const [modePaiement, setModePaiement] = useState('especes');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      const data = await getProduitsForVente();
      console.log('📦 Produits chargés:', data);
      
      // Adapter les données si nécessaire
      const produitsAdaptes = data.map(p => ({
        id: p.id,
        nom_produit: p.nom_produit,
        code_produit: p.code_produit,
        type_vente: p.type_vente || 'poids',
        stock_actuel: p.stock_disponible || 0,
        prix_vente: p.prix_vente || 0,
        est_actif: p.est_actif
      }));
      
      setProduits(produitsAdaptes);
    } catch (err) {
      console.error('❌ Erreur chargement produits:', err);
      setError('Erreur chargement produits');
    } finally {
      setLoadingProduits(false);
    }
  };

  const handleProduitChange = (e) => {
    const produitId = e.target.value;
    if (!produitId) {
      setArticleCourant({
        produit_id: '',
        quantite: 1,
        prix_unitaire: 0,
        stock_dispo: 0,
        type_vente: 'poids',
        nom_produit: ''
      });
      return;
    }

    const produit = produits.find(p => p.id === parseInt(produitId));
    console.log('Produit sélectionné:', produit);
    
    setArticleCourant({
      produit_id: produitId,
      quantite: 1,
      prix_unitaire: produit?.prix_vente || 0,
      stock_dispo: produit?.stock_actuel || 0,
      type_vente: produit?.type_vente || 'poids',
      nom_produit: produit?.nom_produit || ''
    });
  };

  // ✅ Fonction pour formater la quantité à 3 décimales max
  const formatQuantite = (value, type_vente) => {
    // Remplacer virgule par point
    let strValue = String(value).replace(',', '.');
    
    // Extraire le nombre
    let numValue = type_vente === 'poids' ? parseFloat(strValue) : parseInt(strValue);
    
    if (isNaN(numValue) || numValue <= 0) return 0;
    
    if (type_vente === 'poids') {
      // Limiter à 3 décimales
      numValue = Math.round(numValue * 1000) / 1000;
    } else {
      // Unité : entier
      numValue = Math.floor(numValue);
    }
    
    return numValue;
  };

  const handleQuantiteChange = (e) => {
    const rawValue = e.target.value;
    
    if (rawValue === '') {
      setArticleCourant(prev => ({ ...prev, quantite: '' }));
      return;
    }

    const formattedValue = formatQuantite(rawValue, articleCourant.type_vente);
    
    if (formattedValue > 0) {
      setArticleCourant(prev => ({ ...prev, quantite: formattedValue }));
    }
  };

  // ✅ Validation au blur (perte de focus)
  const handleQuantiteBlur = () => {
    if (articleCourant.quantite === '' || articleCourant.quantite <= 0) {
      setArticleCourant(prev => ({ ...prev, quantite: 1 }));
    } else {
      const formatted = formatQuantite(articleCourant.quantite, articleCourant.type_vente);
      setArticleCourant(prev => ({ ...prev, quantite: formatted }));
    }
  };

  const ajouterAuPanier = () => {
    setError('');

    if (!articleCourant.produit_id) {
      setError('Veuillez sélectionner un produit');
      return;
    }

    if (articleCourant.prix_unitaire <= 0) {
      setError('Ce produit n\'a pas de prix de vente défini');
      return;
    }

    // ✅ Formater la quantité une dernière fois
    const quantite = formatQuantite(articleCourant.quantite, articleCourant.type_vente);
      
    if (quantite <= 0) {
      setError('La quantité doit être un nombre positif');
      return;
    }

    if (quantite > articleCourant.stock_dispo) {
      const unite = articleCourant.type_vente === 'poids' ? 'kg' : 'unité(s)';
      setError(`Stock insuffisant. Disponible: ${articleCourant.stock_dispo.toFixed(3)} ${unite}`);
      return;
    }

    const total = quantite * articleCourant.prix_unitaire;

    setPanier([...panier, {
      produit_id: parseInt(articleCourant.produit_id),
      nom_produit: articleCourant.nom_produit,
      quantite: quantite,
      prix_unitaire: articleCourant.prix_unitaire,
      total: total,
      type_vente: articleCourant.type_vente,
      unite: articleCourant.type_vente === 'poids' ? 'kg' : 'unité'
    }]);

    setArticleCourant({
      produit_id: '',
      quantite: 1,
      prix_unitaire: 0,
      stock_dispo: 0,
      type_vente: 'poids',
      nom_produit: ''
    });
  };

  const supprimerDuPanier = (index) => {
    setPanier(panier.filter((_, i) => i !== index));
  };

  const calculerTotal = () => {
    return panier.reduce((sum, item) => sum + item.total, 0);
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (panier.length === 0) {
      setError('Ajoutez au moins un article');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ Formater toutes les quantités avant envoi
      const articlesFormates = panier.map(item => ({
        produit_id: item.produit_id,
        quantite: item.quantite, // Déjà formaté
        prix_unitaire: item.prix_unitaire,
        total_ligne: item.total
      }));

      const dataToSend = {
        client_id: client.client_id ? parseInt(client.client_id) : null,
        client_nom: client.client_nom,
        client_telephone: client.client_telephone,
        client_email: client.client_email,
        mode_paiement: modePaiement,
        notes: notes,
        articles: articlesFormates
      };

      console.log('📤 Données envoyées:', dataToSend);

      const response = await createVente(dataToSend);
      console.log('✅ Réponse:', response);
      
      setSuccess('Vente enregistrée avec succès !');
      
      setTimeout(() => {
        navigate(`/ventes/${response.vente.id}`);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const total = calculerTotal();

  if (loadingProduits) {
    return (
      <div className="pagetitle">
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>
          Nouvelle vente
        </h1>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pagetitle">
      <h1 style={{ 
        fontFamily: 'Montserrat, sans-serif',
        color: '#006994',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Nouvelle vente
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="/ventes" style={{ color: '#006994' }}>Ventes</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Nouvelle vente</li>
        </ol>
      </nav>

      <div className="row">
        {/* Panier */}
        <div className="col-lg-8">
          <div className="card mb-3" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Vague décorative en haut */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: 0.5
            }} />

            <div className="card-body">
              <h5 className="card-title" style={{ color: '#006994', fontWeight: 'bold' }}>
                <i className="bi bi-cart me-2" style={{ color: '#FF6F00' }}></i>
                Panier
              </h5>
              
              {error && (
                <div className="alert alert-danger" style={{
                  borderRadius: '8px',
                  borderLeft: '4px solid #dc3545'
                }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" style={{
                  borderRadius: '8px',
                  borderLeft: '4px solid #66BB6A'
                }}>
                  {success}
                </div>
              )}

              {/* Ajout article */}
              <div className="row mb-3 bg-light p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="col-md-5">
                  <select
                    className="form-select"
                    value={articleCourant.produit_id}
                    onChange={handleProduitChange}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      padding: '10px'
                    }}
                  >
                    <option value="">Choisir produit</option>
                    {produits.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nom_produit} - Stock: {p.stock_actuel.toFixed(3)} {p.type_vente === 'poids' ? 'kg' : 'unité(s)'} - {p.prix_vente.toLocaleString()} FCFA
                      </option>
                    ))}
                  </select>
                  {produits.length === 0 && (
                    <small className="text-warning d-block mt-1">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Aucun produit disponible avec prix de vente
                    </small>
                  )}
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    value={articleCourant.quantite}
                    onChange={handleQuantiteChange}
                    onBlur={handleQuantiteBlur}
                    min="0.001"
                    step={articleCourant.type_vente === 'poids' ? '0.001' : '1'}
                    placeholder={articleCourant.type_vente === 'poids' ? 'Poids (kg)' : 'Qté'}
                    disabled={!articleCourant.produit_id}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      padding: '10px'
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    value={articleCourant.prix_unitaire}
                    disabled
                    placeholder="Prix"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      padding: '10px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                  {articleCourant.produit_id && articleCourant.prix_unitaire <= 0 && (
                    <small className="text-danger d-block">⚠️ Prix non défini</small>
                  )}
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={ajouterAuPanier}
                    disabled={!articleCourant.produit_id || articleCourant.prix_unitaire <= 0}
                    style={{
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
              </div>

              {/* Liste du panier */}
              {panier.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unit.</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {panier.map((item, index) => (
                        <tr key={index}>
                          <td>{item.nom_produit}</td>
                          <td>
                            {item.type_vente === 'poids' 
                              ? item.quantite.toFixed(3) 
                              : item.quantite} {item.unite}
                          </td>
                          <td>{item.prix_unitaire.toLocaleString()} FCFA</td>
                          <td className="fw-bold text-primary">{item.total.toLocaleString()} FCFA</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => supprimerDuPanier(index)}
                              style={{ borderRadius: '6px' }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted py-3">
                  <i className="bi bi-cart me-2"></i>
                  Panier vide
                </p>
              )}
            </div>

            {/* Vague décorative en bas */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              opacity: 0.2
            }} />
          </div>

          {/* Client (optionnel) */}
          <div className="card mb-3" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: 0.5
            }} />

            <div className="card-body">
              <h5 className="card-title" style={{ color: '#006994', fontWeight: 'bold' }}>
                <i className="bi bi-person me-2" style={{ color: '#FF6F00' }}></i>
                Client (optionnel)
              </h5>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nom du client"
                    name="client_nom"
                    value={client.client_nom}
                    onChange={handleClientChange}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      padding: '10px'
                    }}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Téléphone"
                    name="client_telephone"
                    value={client.client_telephone}
                    onChange={handleClientChange}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      padding: '10px'
                    }}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    name="client_email"
                    value={client.client_email}
                    onChange={handleClientChange}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      padding: '10px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              opacity: 0.2
            }} />
          </div>

          {/* Notes */}
          <div className="card mb-3" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: 0.5
            }} />

            <div className="card-body">
              <h5 className="card-title" style={{ color: '#006994', fontWeight: 'bold' }}>
                <i className="bi bi-chat me-2" style={{ color: '#FF6F00' }}></i>
                Notes
              </h5>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Notes sur la vente..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '10px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              />
            </div>

            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              opacity: 0.2
            }} />
          </div>
        </div>

        {/* Résumé et paiement */}
        <div className="col-lg-4">
          <div className="card" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: 0.5
            }} />

            <div className="card-body">
              <h5 className="card-title" style={{ color: '#006994', fontWeight: 'bold' }}>
                <i className="bi bi-calculator me-2" style={{ color: '#FF6F00' }}></i>
                Résumé
              </h5>
              
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: '#006994' }}>
                  Mode de paiement
                </label>
                <select
                  className="form-select"
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    padding: '10px'
                  }}
                >
                  {MODES_PAIEMENT_LISTE.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              <hr style={{ borderColor: '#e0e0e0' }} />

              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#666' }}>Total articles:</span>
                <span className="fw-bold">{panier.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span style={{ color: '#666', fontSize: '1.1rem' }}>TOTAL:</span>
                <span className="fw-bold text-primary" style={{ fontSize: '1.3rem' }}>
                  {total.toLocaleString()} FCFA
                </span>
              </div>

              <button
                className="btn w-100 py-3"
                onClick={handleSubmit}
                disabled={loading || panier.length === 0}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s',
                  opacity: (loading || panier.length === 0) ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && panier.length > 0) {
                    e.target.style.backgroundColor = '#34ce57';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && panier.length > 0) {
                    e.target.style.backgroundColor = '#28a745';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Traitement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Valider la vente
                  </>
                )}
              </button>
            </div>

            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              opacity: 0.2
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenteCreate;