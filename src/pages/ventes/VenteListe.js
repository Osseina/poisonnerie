import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVentes } from '../../services/venteService';
import { MODES_PAIEMENT, getModePaiementStyle } from '../../constants/modesPaiement';

const VenteListe = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [ventes, setVentes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendeurs, setVendeurs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    mode_paiement: '',
    date_debut: '',
    date_fin: '',
    vendeur_id: '' // ✅ Nouveau filtre pour gestionnaire
  });
  const [showTooltip, setShowTooltip] = useState('');

  const isGestionnaire = user.profile === 'gestionnaire';
  const isVendeur = user.profile === 'vendeur';

  useEffect(() => {
    loadVentes();
  }, [pagination.page, pagination.limit, filters]);

  const loadVentes = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.mode_paiement) cleanFilters.mode_paiement = filters.mode_paiement;
      if (filters.date_debut) cleanFilters.date_debut = filters.date_debut;
      if (filters.date_fin) cleanFilters.date_fin = filters.date_fin;
      
      // ✅ Ajouter le filtre vendeur seulement pour le gestionnaire
      if (isGestionnaire && filters.vendeur_id) {
        cleanFilters.vendeur_id = filters.vendeur_id;
      }

      const response = await getVentes(pagination.page, pagination.limit, cleanFilters);
      const ventesData = response.data.ventes || [];
      
      setVentes(ventesData);
      setPagination(response.data.pagination);
      
      // ✅ Stocker la liste des vendeurs pour le filtre
      if (response.data.vendeurs) {
        setVendeurs(response.data.vendeurs);
      }
      
      // Calculer les statistiques
      const statsCalc = {
        total: response.data.pagination.total,
        totalMontant: ventesData.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0),
        totalArticles: ventesData.reduce((acc, v) => acc + (parseFloat(v.nb_articles) || 0), 0),
        parMode: {}
      };
      
      // Compter par mode de paiement
      ventesData.forEach(vente => {
        const mode = vente.mode_paiement || 'autre';
        if (!statsCalc.parMode[mode]) {
          statsCalc.parMode[mode] = {
            count: 0,
            montant: 0
          };
        }
        statsCalc.parMode[mode].count++;
        statsCalc.parMode[mode].montant += parseFloat(vente.total) || 0;
      });
      
      setStats(statsCalc);
    } catch (err) {
      console.error('Erreur chargement ventes:', err);
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
    setFilters({ 
      search: '', 
      mode_paiement: '', 
      date_debut: '', 
      date_fin: '',
      vendeur_id: '' 
    });
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const getModePaiementInfo = (mode) => {
    return MODES_PAIEMENT[mode?.toUpperCase()] || MODES_PAIEMENT.AUTRE;
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

  return (
    <div className="pagetitle">
      <h1 style={{ 
        fontFamily: 'Montserrat, sans-serif',
        color: '#006994',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Gestion des ventes
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Ventes</li>
        </ol>
      </nav>

      {/* Message pour les vendeurs (optionnel) */}
      {isVendeur && (
        <div className="alert alert-info mb-4" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #40C4FF',
          backgroundColor: '#e6f3ff',
          fontSize: '0.9rem'
        }}>
          <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
          Vous voyez uniquement vos propres ventes.
        </div>
      )}

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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total ventes</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.total}</h3>
                  </div>
                  <i className="bi bi-cart" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Montant total</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{formatPrice(stats.totalMontant)}</h3>
                  </div>
                  <i className="bi bi-currency-dollar" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Articles vendus</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.totalArticles}</h3>
                  </div>
                  <i className="bi bi-box" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card" style={{
              backgroundColor: '#40C4FF',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(64,196,255,0.3)',
              border: 'none',
              color: '#333'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Moyenne/vente</h6>
                    <h3 style={{ fontWeight: 'bold' }}>
                      {formatPrice(stats.totalMontant / (stats.total || 1))}
                    </h3>
                  </div>
                  <i className="bi bi-graph-up" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et bouton nouvelle vente */}
      <div className="card mb-4" style={{
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0" style={{ color: '#006994', fontWeight: 'bold' }}>
              <i className="bi bi-funnel me-2" style={{ color: '#FF6F00' }}></i>
              Filtres
            </h5>
            <button
              className="btn"
              onClick={() => navigate('/ventes/create')}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                padding: '10px 20px',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: '0 2px 6px rgba(40, 167, 69, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#34ce57';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 6px rgba(40, 167, 69, 0.3)';
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Nouvelle vente
            </button>
          </div>
          
          <div className="row g-2">
            <div className="col-md-2">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Rechercher une vente</label>
              <input
                type="text"
                className="form-control"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px'
                }}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="mode_paiement"
                value={filters.mode_paiement}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px'
                }}
              >
                <option value="">Tous paiements</option>
                {Object.values(MODES_PAIEMENT).map(mode => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Du</label>
              <input
                type="date"
                className="form-control"
                name="date_debut"
                value={filters.date_debut}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px'
                }}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Au</label>
              <input
                type="date"
                className="form-control"
                name="date_fin"
                value={filters.date_fin}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px'
                }}
              />
            </div>
            
            {/* ✅ Filtre vendeur - visible seulement pour gestionnaire */}
            {isGestionnaire && (
              <div className="col-md-2">
                <select
                  className="form-select"
                  name="vendeur_id"
                  value={filters.vendeur_id}
                  onChange={handleFilterChange}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 15px'
                  }}
                >
                  <option value="">Tous vendeurs</option>
                  {vendeurs.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.prenom} {v.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className={`col-md-${isGestionnaire ? '2' : '4'}`}>
              <button
                className="btn w-100"
                onClick={handleResetFilters}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px',
                  fontWeight: 'bold'
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

          {/* Mini stats par mode de paiement */}
          {stats && Object.keys(stats.parMode).length > 0 && (
            <div className="mt-3 d-flex gap-2 flex-wrap">
              {Object.entries(stats.parMode).map(([mode, data]) => {
                const modeInfo = getModePaiementInfo(mode);
                return (
                  <div key={mode} className="badge" style={{
                    backgroundColor: modeInfo.color + '20',
                    color: modeInfo.color,
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'normal'
                  }}>
                    <i className={`bi ${modeInfo.icon} me-1`}></i>
                    {modeInfo.label}: {data.count} vente(s) - {formatPrice(data.montant)}
                  </div>
                );
              })}
            </div>
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
          opacity: 0.3
        }} />
      </div>

      {/* Liste des ventes */}
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
            <i className="bi bi-clock-history me-2" style={{ color: '#FF6F00' }}></i>
            Historique des ventes
            {pagination.total > 0 && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({pagination.total} vente{pagination.total > 1 ? 's' : ''})
              </span>
            )}
          </h5>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>Facture</th>
                      <th style={{ padding: '15px' }}>Date</th>
                      <th style={{ padding: '15px' }}>Client</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Articles</th>
                      <th style={{ padding: '15px' }}>Total</th>
                      <th style={{ padding: '15px' }}>Paiement</th>
                      <th style={{ padding: '15px' }}>Vendeur</th>
                      <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventes.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                          <i className="bi bi-cart-x" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                          Aucune vente trouvée
                        </td>
                      </tr>
                    ) : (
                      ventes.map(vente => {
                        const modePaiement = getModePaiementInfo(vente.mode_paiement);
                        return (
                          <tr 
                            key={vente.id} 
                            style={{ 
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              opacity: (isVendeur && vente.created_by !== user.id) ? 0.5 : 1
                            }}
                            onClick={() => navigate(`/ventes/${vente.id}`)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <td style={{ padding: '15px' }}>
                              <code style={{
                                backgroundColor: '#e9ecef',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                color: '#006994',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}>
                                {vente.numero_facture}
                              </code>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <i className="bi bi-calendar3 me-2" style={{ color: '#006994', fontSize: '0.9rem' }}></i>
                              <span style={{ fontSize: '0.95rem' }}>{formatDate(vente.created_at)}</span>
                            </td>
                            <td style={{ padding: '15px' }}>
                              {vente.client_nom ? (
                                <>
                                  <strong style={{ color: '#006994' }}>{vente.client_nom}</strong>
                                  {vente.client_telephone && (
                                    <small className="d-block text-muted" style={{ fontSize: '0.85rem' }}>
                                      <i className="bi bi-telephone me-1" style={{ fontSize: '0.8rem' }}></i>
                                      {vente.client_telephone}
                                    </small>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted">
                                  <i className="bi bi-person me-1"></i>
                                  Client divers
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <span className="badge" style={{
                                backgroundColor: '#e9ecef',
                                color: '#333',
                                padding: '5px 10px',
                                borderRadius: '20px',
                                fontSize: '0.9rem'
                              }}>
                                <i className="bi bi-box me-1"></i>
                                {vente.nb_articles}
                              </span>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <strong style={{ 
                                color: '#28a745',
                                fontSize: '1.1rem',
                                fontWeight: 'bold'
                              }}>
                                {formatPrice(vente.total)}
                              </strong>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <span className="badge" style={{
                                backgroundColor: modePaiement.color,
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 'normal'
                              }}>
                                <i className={`bi ${modePaiement.icon} me-1`}></i>
                                {modePaiement.label}
                              </span>
                            </td>
                            <td style={{ padding: '15px' }}>
                              {vente.vendeur_nom ? (
                                <span>
                                  <i className="bi bi-person-badge me-1" style={{ color: '#006994' }}></i>
                                  {vente.vendeur_nom}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ position: 'relative' }}>
                                <button
                                  className="btn btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/ventes/${vente.id}`);
                                  }}
                                  style={{
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    borderRadius: '8px',
                                    border: 'none',
                                    padding: '8px 12px',
                                    transition: 'all 0.3s',
                                    fontSize: '0.9rem'
                                  }}
                                  onMouseEnter={(e) => {
                                    setShowTooltip(`view-${vente.id}`);
                                    e.target.style.backgroundColor = '#138496';
                                    e.target.style.transform = 'scale(1.05)';
                                  }}
                                  onMouseLeave={(e) => {
                                    setShowTooltip('');
                                    e.target.style.backgroundColor = '#17a2b8';
                                    e.target.style.transform = 'scale(1)';
                                  }}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                {showTooltip === `view-${vente.id}` && (
                                  <Tooltip text="Voir détails" />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <select
                      className="form-select form-select-sm"
                      value={pagination.limit}
                      onChange={(e) => setPagination(prev => ({
                        ...prev,
                        limit: parseInt(e.target.value),
                        page: 1
                      }))}
                      style={{
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0',
                        padding: '8px 12px'
                      }}
                    >
                      <option value="10">10 par page</option>
                      <option value="20">20 par page</option>
                      <option value="50">50 par page</option>
                      <option value="100">100 par page</option>
                    </select>
                  </div>
                  
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                          style={{ color: '#006994' }}
                        >
                          <i className="bi bi-chevron-double-left"></i>
                        </button>
                      </li>
                      <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          style={{ color: '#006994' }}
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
                                color: 'white'
                              } : {
                                color: '#006994'
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
                          style={{ color: '#006994' }}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                      <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
                          style={{ color: '#006994' }}
                        >
                          <i className="bi bi-chevron-double-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                  
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    Page {pagination.page} sur {pagination.pages}
                  </div>
                </div>
              )}
            </>
          )}
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
    </div>
  );
};

export default VenteListe;