import React, { useState, useEffect } from 'react';
import { getMouvements, getProduitsForStock } from '../../../services/stockService';

const StockHistorique = () => {
  const [mouvements, setMouvements] = useState([]);
  const [produits, setProduits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    produit_id: '',
    type: '',
    date_debut: '',
    date_fin: ''
  });

  useEffect(() => {
    loadProduits();
  }, []);

  useEffect(() => {
    loadMouvements();
  }, [pagination.page, pagination.limit, filters]);

  const loadProduits = async () => {
    try {
      const data = await getProduitsForStock();
      setProduits(data);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    }
  };

  const loadMouvements = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.produit_id) cleanFilters.produit_id = filters.produit_id;
      if (filters.type) cleanFilters.type = filters.type;
      if (filters.date_debut) cleanFilters.date_debut = filters.date_debut;
      if (filters.date_fin) cleanFilters.date_fin = filters.date_fin;

      const response = await getMouvements(cleanFilters, pagination.page, pagination.limit);
      const mouvementsData = response.data.mouvements || [];
      
      // Calculer les statistiques
      const entrees = mouvementsData.filter(m => m.type_mouvement === 'entree').reduce((acc, m) => acc + m.quantite, 0);
      const sorties = mouvementsData.filter(m => m.type_mouvement === 'sortie').reduce((acc, m) => acc + m.quantite, 0);
      const inventaires = mouvementsData.filter(m => m.type_mouvement === 'inventaire').length;
      
      setStats({
        total: response.data.pagination.total,
        entrees,
        sorties,
        inventaires,
        solde: entrees - sorties
      });
      
      setMouvements(mouvementsData);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ produit_id: '', type: '', date_debut: '', date_fin: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLimitChange = (e) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(e.target.value),
      page: 1 
    }));
  };

  const getTypeStyle = (type) => {
    const styles = {
      'entree': { bg: '#28a745', color: 'white', icon: 'bi-box-arrow-in-down', label: 'Entrée' },
      'sortie': { bg: '#FF6F00', color: 'white', icon: 'bi-box-arrow-up', label: 'Sortie' },
      'inventaire': { bg: '#40C4FF', color: 'white', icon: 'bi-clipboard-data', label: 'Inventaire' },
      'ajustement': { bg: '#ffc107', color: '#333', icon: 'bi-sliders', label: 'Ajustement' }
    };
    return styles[type] || { bg: '#6c757d', color: 'white', icon: 'bi-question', label: type };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0);
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

  if (loading && mouvements.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2" style={{ color: '#666' }}>Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Statistiques */}
      {stats && (
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total mouvements</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{formatNumber(stats.total)}</h3>
                  </div>
                  <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Entrées</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{formatNumber(stats.entrees)}</h3>
                  </div>
                  <i className="bi bi-box-arrow-in-down" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: '#FF6F00',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(255,111,0,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Sorties</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{formatNumber(stats.sorties)}</h3>
                  </div>
                  <i className="bi bi-box-arrow-up" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: stats.solde >= 0 ? '#40C4FF' : '#dc3545',
              borderRadius: '12px',
              boxShadow: `0 4px 12px ${stats.solde >= 0 ? 'rgba(64,196,255,0.3)' : 'rgba(220,53,69,0.3)'}`,
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Solde net</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{formatNumber(stats.solde)}</h3>
                  </div>
                  <i className={`bi ${stats.solde >= 0 ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'}`} style={{ fontSize: '2rem', opacity: 0.5 }}></i>
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
          
          <div className="row g-2">
            <div className="col-md-3">
              <select
                className="form-select"
                name="produit_id"
                value={filters.produit_id}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                <option value="">Tous les produits</option>
                {produits.map(p => (
                  <option key={p.id} value={p.id}>{p.nom_produit}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                <option value="">Tous types</option>
                <option value="entree">Entrée</option>
                <option value="sortie">Sortie</option>
                <option value="inventaire">Inventaire</option>
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                name="date_debut"
                value={filters.date_debut}
                onChange={handleFilterChange}
                placeholder="Date début"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                name="date_fin"
                value={filters.date_fin}
                onChange={handleFilterChange}
                placeholder="Date fin"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              />
            </div>
            <div className="col-md-3">
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

      {/* Indicateur de nombre de résultats */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
          <i className="bi bi-files me-1" style={{ color: '#006994' }}></i>
          {pagination.total > 0 ? (
            <>
              Affichage <strong>{formatNumber((pagination.page - 1) * pagination.limit + 1)}</strong> -{' '}
              <strong>{formatNumber(Math.min(pagination.page * pagination.limit, pagination.total))}</strong>{' '}
              sur <strong>{formatNumber(pagination.total)}</strong> mouvements
            </>
          ) : (
            'Aucun mouvement trouvé'
          )}
        </div>
        <div>
          <select
            className="form-select form-select-sm"
            value={pagination.limit}
            onChange={handleLimitChange}
            style={{
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              padding: '8px 12px',
              fontFamily: 'Roboto, sans-serif',
              width: 'auto'
            }}
          >
            <option value="10">10 par page</option>
            <option value="20">20 par page</option>
            <option value="50">50 par page</option>
            <option value="100">100 par page</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="card" style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '20px'
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

        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-hover align-middle mb-0" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <thead className="sticky-top" style={{ 
                backgroundColor: '#f8f9fa',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <tr>
                  <th style={{ padding: '15px', borderTopLeftRadius: '8px', width: '140px' }}>Date</th>
                  <th style={{ padding: '15px' }}>Produit</th>
                  <th style={{ padding: '15px', width: '100px' }}>Type</th>
                  <th style={{ padding: '15px', width: '80px' }}>Qté</th>
                  <th style={{ padding: '15px', width: '90px' }}>Stock avant</th>
                  <th style={{ padding: '15px', width: '90px' }}>Stock après</th>
                  <th style={{ padding: '15px', width: '120px' }}>Référence</th>
                  <th style={{ padding: '15px', width: '120px', borderTopRightRadius: '8px' }}>Par</th>
                </tr>
              </thead>
              <tbody>
                {mouvements.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                      <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                      Aucun mouvement trouvé
                    </td>
                  </tr>
                ) : (
                  mouvements.map(m => {
                    const style = getTypeStyle(m.type_mouvement);
                    return (
                      <tr key={m.id} style={{ transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '15px' }}>
                          <i className="bi bi-calendar3 me-1" style={{ color: '#006994', fontSize: '0.85rem' }}></i>
                          <small>{formatDate(m.created_at)}</small>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <strong style={{ color: '#006994' }}>{m.nom_produit}</strong>
                          {m.code_produit && (
                            <small className="d-block text-muted">
                              <code style={{ fontSize: '0.85rem' }}>{m.code_produit}</code>
                            </small>
                          )}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span className="badge" style={{
                            backgroundColor: style.bg,
                            color: style.color,
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            width: '100%'
                          }}>
                            <i className={`bi ${style.icon} me-1`}></i>
                            {style.label}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span className={`fw-bold ${m.type_mouvement === 'entree' ? 'text-success' : 'text-danger'}`}>
                            {m.type_mouvement === 'entree' ? '+' : '-'}{formatNumber(m.quantite)}
                          </span>
                        </td>
                        <td className="text-center" style={{ padding: '15px' }}>
                          <span style={{
                            backgroundColor: '#f8f9fa',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.9rem'
                          }}>
                            {formatNumber(m.stock_avant)}
                          </span>
                        </td>
                        <td className="text-center" style={{ padding: '15px' }}>
                          <span style={{
                            backgroundColor: '#f8f9fa',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            {formatNumber(m.stock_apres)}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {m.reference ? (
                            <code style={{
                              backgroundColor: '#e9ecef',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}>
                              {m.reference}
                            </code>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <i className="bi bi-person-badge me-1" style={{ color: '#006994' }}></i>
                          <small>{m.createur_nom || '-'}</small>
                        </td>
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
          height: '4px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.2
        }} />
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="d-flex justify-content-between align-items-center">
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            <i className="bi bi-info-circle me-1" style={{ color: '#006994' }}></i>
            Page {pagination.page} sur {pagination.pages}
          </div>
          
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                  style={{
                    color: '#006994',
                    borderRadius: '8px',
                    margin: '0 2px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  style={{
                    color: '#006994',
                    borderRadius: '8px',
                    margin: '0 2px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <li key={i} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      style={pagination.page === pageNum ? {
                        backgroundColor: '#006994',
                        borderColor: '#006994',
                        color: 'white',
                        borderRadius: '8px',
                        margin: '0 2px'
                      } : {
                        color: '#006994',
                        borderRadius: '8px',
                        margin: '0 2px',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  style={{
                    color: '#006994',
                    borderRadius: '8px',
                    margin: '0 2px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
              <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
                  style={{
                    color: '#006994',
                    borderRadius: '8px',
                    margin: '0 2px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
          
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            <i className="bi bi-files me-1"></i>
            {formatNumber(pagination.total)} total
          </div>
        </div>
      )}

      {/* Loading overlay pour les changements de page */}
      {loading && mouvements.length > 0 && (
        <div className="position-fixed top-50 start-50 translate-middle" style={{ zIndex: 9999 }}>
          <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHistorique;