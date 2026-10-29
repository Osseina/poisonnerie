import React, { useState, useEffect } from 'react';
import { getNiveauxStock, getProduitsForStock } from '../../../services/stockService';

const StockNiveau = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [showTooltip, setShowTooltip] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [filters, setFilters] = useState({
    search: '',
    stock_faible: false
  });

  const isGestionnaire = user.profile === 'gestionnaire';
  const isVendeur = user.profile === 'vendeur';

  useEffect(() => {
    loadNiveaux();
  }, [filters]);

  const loadNiveaux = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.stock_faible) cleanFilters.stock_faible = true;

      const response = await getNiveauxStock(cleanFilters);
      console.log('Réponse API:', response); // Pour déboguer
      setProduits(response.data.produits);
      setResume(response.data.resume);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      stock_faible: false
    });
  };

  const getEtatStyle = (etat) => {
    const styles = {
      'rupture': { bg: '#dc3545', text: 'Rupture', icon: 'bi-exclamation-triangle-fill' },
      'critique': { bg: '#FF6F00', text: 'Critique', icon: 'bi-exclamation-circle-fill' },
      'faible': { bg: '#ffc107', text: 'Faible', icon: 'bi-exclamation-diamond-fill', color: '#333' },
      'normal': { bg: '#28a745', text: 'Normal', icon: 'bi-check-circle-fill' }
    };
    return styles[etat] || styles.normal;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Résumé des stocks */}
      {resume && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: '#006994',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,105,148,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total produits</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{resume.total_produits}</h3>
                  </div>
                  <i className="bi bi-box" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Valeur du stock - visible seulement pour gestionnaire */}
          {isGestionnaire && (
            <div className="col-md-3">
              <div className="card text-white" style={{
                backgroundColor: '#28a745',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(40,167,69,0.3)',
                border: 'none'
              }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Valeur stock</h6>
                      <h3 style={{ fontWeight: 'bold' }}>{formatPrice(resume.valeur_totale_stock)}</h3>
                    </div>
                    <i className="bi bi-currency-dollar" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ajustement de la largeur selon le rôle */}
          <div className={`${isGestionnaire ? 'col-md-6' : 'col-md-9'}`}>
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none',
              height: '100%'
            }}>
              <div className="card-body">
                <h6 style={{ color: '#006994', fontWeight: 'bold', marginBottom: '15px' }}>
                  <i className="bi bi-pie-chart me-2" style={{ color: '#FF6F00' }}></i>
                  État des stocks
                </h6>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge" style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    Rupture: {resume.stats.rupture}
                  </span>
                  <span className="badge" style={{
                    backgroundColor: '#FF6F00',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-exclamation-circle-fill me-1"></i>
                    Critique: {resume.stats.critique}
                  </span>
                  <span className="badge" style={{
                    backgroundColor: '#ffc107',
                    color: '#333',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-exclamation-diamond-fill me-1"></i>
                    Faible: {resume.stats.faible}
                  </span>
                  <span className="badge" style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Normal: {resume.stats.normal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card mb-4" style={{
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
          zIndex: 1,
          opacity: 0.5
        }} />

        <div className="card-body p-4">
          <h5 className="card-title mb-3" style={{ color: '#006994', fontWeight: 'bold' }}>
            <i className="bi bi-funnel me-2" style={{ color: '#FF6F00' }}></i>
            Filtres
          </h5>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Rechercher un produit</label>
              <input
                type="text"
                className="form-control"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px',
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
            <div className="col-md-4">
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="stock_faible"
                  checked={filters.stock_faible}
                  onChange={handleFilterChange}
                  id="stockFaible"
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    borderColor: '#006994'
                  }}
                />
                <label className="form-check-label ms-2" htmlFor="stockFaible" style={{ color: '#666' }}>
                  <i className="bi bi-exclamation-triangle me-1" style={{ color: '#FF6F00' }}></i>
                  Uniquement les stocks faibles/rupture
                </label>
              </div>
            </div>
            <div className="col-md-2">
              <button
                className="btn w-100"
                onClick={handleResetFilters}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                }}
              >
                <i className="bi bi-eraser me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
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

      {/* Tableau des stocks */}
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
          right: 0,
          zIndex: 1
        }} />

        <div className="card-body p-4">
          <h5 className="card-title" style={{
            color: '#006994',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            marginBottom: '20px'
          }}>
            <i className="bi bi-bar-chart me-2" style={{ color: '#FF6F00' }}></i>
            Niveaux de stock
            {produits.length > 0 && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({produits.length} produit{produits.length > 1 ? 's' : ''})
              </span>
            )}
          </h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>Produit</th>
                  <th style={{ padding: '15px' }}>Code</th>
                  <th style={{ padding: '15px' }}>Catégorie</th>
                  <th style={{ padding: '15px' }}>Fournisseur</th>
                  <th style={{ padding: '15px' }}>Stock actuel</th>
                  <th style={{ padding: '15px' }}>Seuil min</th>
                  <th style={{ padding: '15px' }}>Seuil max</th>
                  <th style={{ padding: '15px' }}>État</th>
                  {/* Colonne Valeur - visible seulement pour gestionnaire */}
                  {isGestionnaire && (
                    <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Valeur</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {produits.length === 0 ? (
                  <tr>
                    <td colSpan={isGestionnaire ? "9" : "8"} className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                      <i className="bi bi-box" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  produits.map(p => {
                    const etat = getEtatStyle(p.etat_stock);
                    return (
                      <tr key={p.id} style={{ transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '15px' }}>
                          <strong style={{ color: '#006994' }}>{p.nom_produit}</strong>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <code style={{
                            backgroundColor: '#e9ecef',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            color: '#006994'
                          }}>
                            {p.code_produit || '-'}
                          </code>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {p.categorie ? (
                            <>
                              <i className="bi bi-folder me-1" style={{ color: '#FF6F00' }}></i>
                              {p.categorie}
                            </>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          {p.fournisseur ? (
                            <>
                              <i className="bi bi-truck me-1" style={{ color: '#17a2b8' }}></i>
                              {p.fournisseur}
                            </>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span className={`fw-bold ${p.stock_actuel <= p.stock_min ? 'text-danger' : 'text-success'}`}>
                            {p.stock_actuel} {p.unite}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>{p.stock_min}</td>
                        <td style={{ padding: '15px' }}>{p.stock_max}</td>
                        <td style={{ padding: '15px' }}>
                          <span className="badge" style={{
                            backgroundColor: etat.bg,
                            color: etat.color || 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem'
                          }}>
                            <i className={`bi ${etat.icon} me-1`}></i>
                            {etat.text}
                          </span>
                        </td>
                        {/* Valeur du stock - visible seulement pour gestionnaire */}
                        {isGestionnaire && (
                          <td style={{ padding: '15px' }}>
                            <strong style={{ color: '#006994' }}>
                              {formatPrice(p.valeur_stock)}
                            </strong>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vague décorative en bas */}
        <div style={{
          height: '8px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.3
        }} />
      </div>

      {/* Message d'information pour les vendeurs */}
      {isVendeur && (
        <div className="alert alert-info mt-3" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #40C4FF',
          backgroundColor: '#e6f3ff',
          fontSize: '0.9rem'
        }}>
          <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
          Vous voyez uniquement les quantités en stock. Les valeurs financières sont réservées aux gestionnaires.
        </div>
      )}
    </div>
  );
};

export default StockNiveau;