import React, { useState, useEffect } from 'react';
import { inventaireStock, getProduitsForStock } from '../../../services/stockService';

const StockInventaire = () => {
  const [produits, setProduits] = useState([]);
  const [inventaire, setInventaire] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resultat, setResultat] = useState(null);
  const [notes, setNotes] = useState('');
  const [filtre, setFiltre] = useState('');
  const [showTooltip, setShowTooltip] = useState('');

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      const data = await getProduitsForStock();
      console.log('Produits chargés:', data);
      setProduits(data);
      
      // Initialiser l'inventaire avec les stocks actuels
      const inventaireInit = data.map(p => {
        const stockActuel = p.type_vente === 'poids' 
          ? parseFloat(p.stock_kg || 0)
          : parseInt(p.stock_unite || 0);
          
        return {
          produit_id: p.id,
          nom_produit: p.nom_produit,
          type_vente: p.type_vente,
          stock_theorique: stockActuel,
          quantite_physique: stockActuel,
          unite: p.type_vente === 'poids' ? 'kg' : 'unité(s)'
        };
      });
      
      setInventaire(inventaireInit);
      
      // Calculer les stats
      const statsCalc = {
        total: inventaireInit.length,
        aVerifier: inventaireInit.length,
        verifies: 0,
        ecarts: 0
      };
      setStats(statsCalc);
      
    } catch (err) {
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoadingProduits(false);
    }
  };

  const handleChange = (produitId, value) => {
    setInventaire(prev => prev.map(item => {
      if (item.produit_id === produitId) {
        let parsedValue;
        if (item.type_vente === 'poids') {
          parsedValue = value === '' ? 0 : parseFloat(value);
        } else {
          parsedValue = value === '' ? 0 : parseInt(value);
        }
        return { 
          ...item, 
          quantite_physique: isNaN(parsedValue) ? 0 : parsedValue 
        };
      }
      return item;
    }));
  };

  const calculerEcart = (theorique, physique, type) => {
    if (type === 'poids') {
      return (parseFloat(physique) - parseFloat(theorique)).toFixed(3);
    }
    return parseInt(physique) - parseInt(theorique);
  };

  const getEcartStyle = (ecart) => {
    const numEcart = parseFloat(ecart);
    if (numEcart === 0) return { color: '#28a745' };
    if (numEcart > 0) return { color: '#006994', fontWeight: 'bold' };
    return { color: '#dc3545', fontWeight: 'bold' };
  };

  const produitsFiltres = inventaire.filter(item =>
    item.nom_produit.toLowerCase().includes(filtre.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setResultat(null);

    // Préparer les données
    const dataToSend = {
      inventaire: inventaire.map(item => ({
        produit_id: item.produit_id,
        quantite_physique: item.quantite_physique
      })),
      notes: notes,
      date_inventaire: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await inventaireStock(dataToSend);
      setSuccess(response.message);
      setResultat(response.data);
      
      // Recharger les produits après inventaire
      await loadProduits();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Tooltip = ({ text }) => (
    <div style={{
      position: 'absolute',
      top: '-35px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#333',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      whiteSpace: 'nowrap',
      zIndex: 1000
    }}>
      {text}
    </div>
  );

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

      {/* Résultat de l'inventaire */}
      {resultat && (
        <div className="alert alert-info mb-4" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #40C4FF',
          backgroundColor: '#e6f3ff'
        }}>
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-info-circle-fill me-2" style={{ color: '#006994' }}></i>
            <h6 className="mb-0" style={{ color: '#006994', fontWeight: 'bold' }}>Résultat de l'inventaire</h6>
          </div>
          <div className="row">
            <div className="col-md-4">
              <p className="mb-1">
                <i className="bi bi-box me-1" style={{ color: '#006994' }}></i>
                Total produits : <strong>{resultat.total}</strong>
              </p>
            </div>
            <div className="col-md-4">
              <p className="mb-1">
                <i className="bi bi-pencil me-1" style={{ color: '#FF6F00' }}></i>
                Produits corrigés : <strong className="text-warning">{resultat.corriges}</strong>
              </p>
            </div>
            <div className="col-md-4">
              <p className="mb-1">
                <i className="bi bi-exclamation-triangle me-1" style={{ color: '#dc3545' }}></i>
                Écarts détectés : <strong className="text-danger">{resultat.ecarts?.length || 0}</strong>
              </p>
            </div>
          </div>
          
          {resultat.ecarts && resultat.ecarts.length > 0 && (
            <div className="mt-2 p-2" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <p className="mb-1 fw-bold" style={{ color: '#006994' }}>Détail des écarts :</p>
              {resultat.ecarts.map((ecart, idx) => (
                <div key={idx} className="small mb-1 pb-1" style={{
                  borderBottom: idx < resultat.ecarts.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <span style={{ color: '#006994' }}>{ecart.produit_nom}</span> : 
                  <span className="text-muted ms-1">théorique {ecart.stock_theorique} {ecart.unite}</span>
                  <span className="mx-1">→</span>
                  <span className="text-info">physique {ecart.stock_physique} {ecart.unite}</span>
                  <span className="ms-2" style={ecart.ecart > 0 ? { color: '#006994' } : { color: '#dc3545' }}>
                    ({ecart.ecart > 0 ? '+' : ''}{ecart.ecart} {ecart.unite})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulaire d'inventaire */}
      <div className="card" style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Vague décorative en haut */}
        <div style={{
          height: '8px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }} />

        <div className="card-body p-4">
          {/* En-tête avec icône */}
          <div className="text-center mb-4">
            <div className="mb-3">
              <svg width="60" height="45" viewBox="0 0 60 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 22.5 C 22.5 11.25, 37.5 11.25, 45 22.5 C 37.5 33.75, 22.5 33.75, 15 22.5" fill="#006994" opacity="0.6"/>
                <circle cx="38" cy="19" r="3" fill="#FFB300"/>
                <path d="M10 18 L 2 14 M10 27 L 2 31" stroke="#40C4FF" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              color: '#006994',
              fontSize: '1.5rem'
            }}>
              Inventaire de stock
            </h2>
            <p style={{
              fontFamily: 'Roboto, sans-serif',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              Comptez physiquement vos stocks et corrigez les écarts
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="mb-4">
            <div className="position-relative">
              <i className="bi bi-search" style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999',
                zIndex: 10
              }}></i>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrer les produits..."
                value={filtre}
                onChange={(e) => setFiltre(e.target.value)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '12px 15px 12px 45px',
                  fontFamily: 'Roboto, sans-serif',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#006994';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,105,148,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <small className="text-muted mt-1 d-block">
              <i className="bi bi-info-circle me-1"></i>
              {produitsFiltres.length} produit(s) affiché(s) sur {inventaire.length} total
            </small>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tableau d'inventaire */}
            <div className="table-responsive" style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <table className="table table-hover align-middle mb-0" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <thead className="sticky-top" style={{ 
                  backgroundColor: '#f8f9fa',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <tr>
                    <th style={{ padding: '15px', borderTopLeftRadius: '8px' }}>Produit</th>
                    <th style={{ padding: '15px' }}>Type</th>
                    <th style={{ padding: '15px', width: '120px' }}>Stock théorique</th>
                    <th style={{ padding: '15px', width: '140px' }}>Stock physique</th>
                    <th style={{ padding: '15px', width: '120px', borderTopRightRadius: '8px' }}>Écart</th>
                  </tr>
                </thead>
                <tbody>
                  {produitsFiltres.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                        <i className="bi bi-box" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                        Aucun produit trouvé
                      </td>
                    </tr>
                  ) : (
                    produitsFiltres.map(item => {
                      const ecart = calculerEcart(item.stock_theorique, item.quantite_physique, item.type_vente);
                      return (
                        <tr key={item.produit_id} style={{ transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '15px' }}>
                            <strong style={{ color: '#006994' }}>{item.nom_produit}</strong>
                            <br />
                            <small className="text-muted">
                              {item.type_vente === 'poids' ? 'Produit au poids' : 'Produit à l\'unité'}
                            </small>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span className="badge" style={{
                              backgroundColor: item.type_vente === 'poids' ? '#40C4FF' : '#66BB6A',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.85rem'
                            }}>
                              {item.type_vente === 'poids' ? 'kg' : 'unité'}
                            </span>
                          </td>
                          <td className="text-center" style={{ padding: '15px' }}>
                            <span style={{
                              backgroundColor: '#f8f9fa',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontWeight: '500'
                            }}>
                              {item.stock_theorique} {item.unite}
                            </span>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.quantite_physique}
                              onChange={(e) => handleChange(item.produit_id, e.target.value)}
                              min="0"
                              step={item.type_vente === 'poids' ? '0.001' : '1'}
                              style={{
                                width: '120px',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                padding: '8px 10px',
                                textAlign: 'center',
                                transition: 'all 0.3s'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#006994';
                                e.target.style.boxShadow = '0 0 0 3px rgba(0,105,148,0.1)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e0e0e0';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </td>
                          <td className="text-center" style={{ padding: '15px' }}>
                            <span className="badge" style={{
                              backgroundColor: parseFloat(ecart) === 0 ? '#28a745' : (parseFloat(ecart) > 0 ? '#006994' : '#dc3545'),
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              {parseFloat(ecart) > 0 ? '+' : ''}{ecart} {item.unite}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="form-label" style={{
                fontFamily: 'Montserrat, sans-serif',
                color: '#006994',
                fontWeight: 'bold'
              }}>
                <i className="bi bi-chat me-2"></i>
                Notes (optionnel)
              </label>
              <textarea
                className="form-control"
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations sur l'inventaire..."
                style={{
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '12px',
                  fontFamily: 'Roboto, sans-serif',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#006994';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,105,148,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Message d'information */}
            <div className="alert alert-info mb-4" style={{
              borderRadius: '8px',
              borderLeft: '4px solid #40C4FF',
              backgroundColor: '#e6f3ff',
              fontSize: '0.9rem'
            }}>
              <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
              Saisissez les quantités physiques réelles. Les écarts seront automatiquement calculés
              et des mouvements de stock seront créés.
            </div>

            {/* Boutons */}
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setFiltre('');
                  setNotes('');
                  loadProduits(); // Recharger l'état initial
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  borderRadius: '8px',
                  fontFamily: 'Montserrat, sans-serif',
                  border: 'none',
                  padding: '12px 25px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                }}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Réinitialiser
              </button>
              
              <button
                type="submit"
                className="btn"
                disabled={loading}
                style={{
                  backgroundColor: '#40C4FF',
                  color: 'white',
                  borderRadius: '8px',
                  fontFamily: 'Montserrat, sans-serif',
                  border: 'none',
                  padding: '12px 25px',
                  transition: 'all 0.3s',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#00B0FF';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#40C4FF';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Valider l'inventaire
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Vague décorative en bas */}
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

export default StockInventaire;