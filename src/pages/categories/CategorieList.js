import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCategories } from '../../services/categorieService';
import { showSuccess, showError } from '../../components/Toast';
import toast, { Toaster } from 'react-hot-toast';

const CategorieList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const [showInactifs, setShowInactifs] = useState(false);
  const [filters, setFilters] = useState({
    search: ''
  });

  // Afficher le message de succès
  useEffect(() => {
    if (location.state?.message) {
      showSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Charger les catégories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;

      const response = await getCategories(cleanFilters);
      
      // Calculer les statistiques
      const toutesCategories = response.categories || [];
      const statsCalc = {
        total: toutesCategories.length,
        actives: toutesCategories.filter(c => c.est_actif === 1).length,
        inactives: toutesCategories.filter(c => c.est_actif === 0).length,
        avecDescription: toutesCategories.filter(c => c.description).length,
        totalProduits: toutesCategories.reduce((acc, c) => acc + (c.nombre_produits || 0), 0)
      };
      setStats(statsCalc);

      // Filtrer les inactives si showInactifs est false
      let categoriesFiltrees = toutesCategories;
      if (!showInactifs) {
        categoriesFiltrees = toutesCategories.filter(c => c.est_actif === 1);
      }

      setCategories(categoriesFiltrees);
      setError('');
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [filters.search, showInactifs]);

  // Gérer les changements de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '' });
  };

  // Récupérer l'utilisateur connecté pour les permissions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canCreate = ['admin', 'gestionnaire'].includes(currentUser.profile);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      <Toaster />
      
      <h1 style={{ 
        fontFamily: 'Montserrat, sans-serif',
        color: '#006994',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Gestion des catégories
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Catégories</li>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total catégories</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.total}</h3>
                  </div>
                  <i className="bi bi-folder" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Actives</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.actives}</h3>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Inactives</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.inactives}</h3>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total produits</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.totalProduits}</h3>
                  </div>
                  <i className="bi bi-box" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et bouton nouvelle catégorie */}
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
              {/* Bouton pour afficher/masquer les inactives */}
              <button
                className="btn"
                onClick={() => {
                  setShowInactifs(!showInactifs);
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
                {showInactifs ? 'Masquer les inactives' : 'Afficher les inactives'}
              </button>

              {canCreate && (
                <button
                  className="btn"
                  onClick={() => navigate('/categories/create')}
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
                  Nouvelle catégorie
                </button>
              )}
            </div>
          </div>
          
          <div className="row g-2">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher une catégorie..."
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

          {/* Message d'information sur les inactives */}
          {!showInactifs && stats?.inactives > 0 && (
            <div className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-info-circle me-1" style={{ color: '#006994' }}></i>
              {stats.inactives} catégorie(s) inactive(s) sont masquée(s). 
              <button
                className="btn btn-link p-0 ms-1"
                onClick={() => setShowInactifs(true)}
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

      {/* Tableau des catégories */}
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
            <i className="bi bi-folder me-2" style={{ color: '#FF6F00' }}></i>
            Liste des catégories
            {!showInactifs && stats?.inactives > 0 && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({stats.actives} actives, {stats.inactives} inactives masquées)
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
            <div className="table-responsive">
              <table className="table table-hover align-middle" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>Nom</th>
                    <th style={{ padding: '15px' }}>Description</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Produits</th>
                    <th style={{ padding: '15px' }}>Statut</th>
                    <th style={{ padding: '15px' }}>Date création</th>
                    <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                        <i className="bi bi-folder" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                        Aucune catégorie trouvée
                      </td>
                    </tr>
                  ) : (
                    categories.map(cat => (
                      <tr 
                        key={cat.id}
                        style={{ 
                          cursor: 'pointer',
                          opacity: cat.est_actif === 0 ? 0.7 : 1,
                          backgroundColor: cat.est_actif === 0 ? '#fff5f5' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => navigate(`/categories/${cat.id}`)}
                        onMouseEnter={(e) => {
                          if (cat.est_actif === 1) {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (cat.est_actif === 1) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: '15px' }}>
                          <strong style={{ color: '#006994' }}>
                            <i className="bi bi-folder me-2" style={{ color: '#006994' }}></i>
                            {cat.nom_categorie}
                          </strong>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {cat.description ? (
                            <span className="text-muted">{cat.description}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <span className="badge" style={{ 
                            backgroundColor: '#17a2b8', 
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem'
                          }}>
                            <i className="bi bi-box me-1"></i>
                            {cat.nombre_produits || 0}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span 
                            className="badge" 
                            style={{
                              backgroundColor: cat.est_actif === 1 ? '#28a745' : '#dc3545',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.85rem'
                            }}
                          >
                            <i className={`bi ${cat.est_actif === 1 ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                            {cat.est_actif === 1 ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <i className="bi bi-calendar3 me-1" style={{ color: '#006994' }}></i>
                          {formatDate(cat.created_at)}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ position: 'relative' }}>
                            <button
                              className="btn btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/categories/${cat.id}`);
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
                                setShowTooltip(`view-${cat.id}`);
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
                            {showTooltip === `view-${cat.id}` && (
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

export default CategorieList;