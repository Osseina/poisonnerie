import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFournisseurs } from '../../services/fournisseurService';

const FournisseurList = () => {
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const [showInactifs, setShowInactifs] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    ville: ''
  });

  // Charger les fournisseurs
  const loadFournisseurs = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.ville) cleanFilters.ville = filters.ville;
      
      // Ne pas filtrer par statut, on le fera côté frontend
      const response = await getFournisseurs(pagination.page, pagination.limit, cleanFilters);
      
      // Calculer les statistiques
      const tousFournisseurs = response.data.fournisseurs || [];
      const statsCalc = {
        total: tousFournisseurs.length,
        actifs: tousFournisseurs.filter(f => f.est_actif === 1).length,
        inactifs: tousFournisseurs.filter(f => f.est_actif === 0).length,
        villes: [...new Set(tousFournisseurs.map(f => f.ville).filter(Boolean))].length
      };
      setStats(statsCalc);

      // Filtrer les inactifs si showInactifs est false
      let fournisseursFiltres = tousFournisseurs;
      if (!showInactifs) {
        fournisseursFiltres = tousFournisseurs.filter(f => f.est_actif === 1);
      }

      setFournisseurs(fournisseursFiltres);
      setPagination({
        ...response.data.pagination,
        total: fournisseursFiltres.length
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFournisseurs();
  }, [pagination.page, pagination.limit, filters.search, filters.ville, showInactifs]);

  // Gérer les changements de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', ville: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Extraire les villes uniques pour le filtre
  const villes = [...new Set(fournisseurs.map(f => f.ville).filter(Boolean))];

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
        Gestion des fournisseurs
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Fournisseurs</li>
        </ol>
      </nav>

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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total fournisseurs</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.total}</h3>
                  </div>
                  <i className="bi bi-building" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Actifs</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.actifs}</h3>
                  </div>
                  <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: '#dc3545',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(220,53,69,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Inactifs</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.inactifs}</h3>
                  </div>
                  <i className="bi bi-x-circle" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Villes</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.villes}</h3>
                  </div>
                  <i className="bi bi-geo-alt" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et bouton nouveau fournisseur */}
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
            <div className="d-flex gap-2">
              {/* Bouton pour afficher/masquer les inactifs */}
              <button
                className="btn"
                onClick={() => {
                  setShowInactifs(!showInactifs);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                style={{
                  backgroundColor: showInactifs ? '#dc3545' : '#28a745',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  boxShadow: showInactifs ? '0 2px 6px rgba(220,53,69,0.3)' : '0 2px 6px rgba(40,167,69,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.8';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <i className={`bi ${showInactifs ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
                {showInactifs ? 'Masquer les inactifs' : 'Afficher les inactifs'}
              </button>

              <button
                className="btn"
                onClick={() => navigate('/fournisseurs/create')}
                style={{
                  backgroundColor: '#FF6F00',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 6px rgba(255,111,0,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FFB300';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255,111,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#FF6F00';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 6px rgba(255,111,0,0.3)';
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nouveau fournisseur
              </button>
            </div>
          </div>
          
          <div className="row g-2">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher (nom société, contact, email...)"
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
              <select
                className="form-select"
                name="ville"
                value={filters.ville}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                <option value="">Toutes les villes</option>
                {villes.map(ville => (
                  <option key={ville} value={ville}>{ville}</option>
                ))}
              </select>
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

          {/* Message d'information sur les inactifs */}
          {!showInactifs && stats?.inactifs > 0 && (
            <div className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-info-circle me-1" style={{ color: '#006994' }}></i>
              {stats.inactifs} fournisseur(s) inactif(s) sont masqué(s). 
              <button
                className="btn btn-link p-0 ms-1"
                onClick={() => {
                  setShowInactifs(true);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                style={{ color: '#006994', textDecoration: 'none' }}
              >
                Cliquez ici pour les voir
              </button>
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

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-danger" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          {error}
        </div>
      )}

      {/* Tableau des fournisseurs */}
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
            <i className="bi bi-truck me-2" style={{ color: '#FF6F00' }}></i>
            Liste des fournisseurs
            {!showInactifs && stats?.inactifs > 0 && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({stats.actifs} actifs, {stats.inactifs} inactifs masqués)
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
                      <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>Société</th>
                      <th style={{ padding: '15px' }}>Contact</th>
                      <th style={{ padding: '15px' }}>Téléphone</th>
                      <th style={{ padding: '15px' }}>Email</th>
                      <th style={{ padding: '15px' }}>Ville</th>
                      <th style={{ padding: '15px' }}>NIF/RCCM</th>
                      <th style={{ padding: '15px' }}>Statut</th>
                      <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fournisseurs.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                          <i className="bi bi-building" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                          Aucun fournisseur trouvé
                        </td>
                      </tr>
                    ) : (
                      fournisseurs.map(f => (
                        <tr 
                          key={f.id} 
                          style={{ 
                            cursor: 'pointer',
                            opacity: f.est_actif === 0 ? 0.7 : 1,
                            backgroundColor: f.est_actif === 0 ? '#fff5f5' : 'transparent',
                            transition: 'background-color 0.2s'
                          }} 
                          onClick={() => navigate(`/fournisseurs/${f.id}`)}
                          onMouseEnter={(e) => {
                            if (f.est_actif === 1) {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (f.est_actif === 1) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <td style={{ padding: '15px' }}>
                            <strong style={{ color: '#006994' }}>
                              <i className="bi bi-building me-2" style={{ color: '#006994' }}></i>
                              {f.nom_societe}
                            </strong>
                          </td>
                          <td style={{ padding: '15px' }}>
                            {f.nom_contact ? (
                              <>
                                <i className="bi bi-person me-1" style={{ color: '#006994' }}></i>
                                {f.nom_contact}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td style={{ padding: '15px' }}>
                            {f.telephone ? (
                              <>
                                <i className="bi bi-telephone me-1" style={{ color: '#28a745' }}></i>
                                {f.telephone}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td style={{ padding: '15px' }}>
                            {f.email ? (
                              <>
                                <i className="bi bi-envelope me-1" style={{ color: '#17a2b8' }}></i>
                                {f.email}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td style={{ padding: '15px' }}>
                            {f.ville ? (
                              <>
                                <i className="bi bi-geo-alt me-1" style={{ color: '#FF6F00' }}></i>
                                {f.ville}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td style={{ padding: '15px' }}>
                            {f.nif && (
                              <div><small><strong>NIF:</strong> {f.nif}</small></div>
                            )}
                            {f.rccm && (
                              <div><small><strong>RCCM:</strong> {f.rccm}</small></div>
                            )}
                            {!f.nif && !f.rccm && (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span 
                              className="badge" 
                              style={{
                                backgroundColor: f.est_actif === 1 ? '#28a745' : '#dc3545',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <i className={`bi ${f.est_actif === 1 ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                              {f.est_actif === 1 ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ position: 'relative' }}>
                              <button
                                className="btn btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/fournisseurs/${f.id}`);
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
                                  setShowTooltip(`view-${f.id}`);
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
                              {showTooltip === `view-${f.id}` && (
                                <Tooltip text="Voir détails" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
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
                        padding: '8px 12px',
                        fontFamily: 'Roboto, sans-serif'
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
                    Page {pagination.page} sur {pagination.pages} • {pagination.total} fournisseur(s)
                    {!showInactifs && stats?.inactifs > 0 && (
                      <span className="ms-2 text-muted">
                        ({stats.inactifs} inactif{stats.inactifs > 1 ? 's' : ''} masqué{stats.inactifs > 1 ? 's' : ''})
                      </span>
                    )}
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

export default FournisseurList;