import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProduits } from '../../services/produitService';
import { getFournisseurs } from '../../services/fournisseurService';
import { getCategories } from '../../services/categorieService';
import { showSuccess, showError } from '../../components/Toast';
import toast, { Toaster } from 'react-hot-toast';

const ProduitList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [produits, setProduits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const [showInactifs, setShowInactifs] = useState(false);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    fournisseur_id: '',
    categorie_id: ''
  });

  // Afficher le message de succès
  useEffect(() => {
    if (location.state?.message) {
      showSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Charger les fournisseurs pour le filtre
  useEffect(() => {
    loadFournisseurs();
    loadCategories();
  }, []);

  const loadFournisseurs = async () => {
    try {
      const response = await getFournisseurs(1, 100);
      setFournisseurs(response.data?.fournisseurs || []);
    } catch (err) {
      console.error('Erreur chargement fournisseurs:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  // Calculer le stock actuel selon le type de vente
  const getStockActuel = (produit) => {
    return produit.type_vente === 'poids' 
      ? parseFloat(produit.stock_kg || 0)
      : parseInt(produit.stock_unite || 0);
  };

  // Charger les produits
  const loadProduits = async () => {
    setLoading(true);
    try {
      const cleanFilters = {
        ...filters,
        ...(!showInactifs && { est_actif: '1' })
      };
      
      // Supprimer les filtres vides
      Object.keys(cleanFilters).forEach(key => {
        if (!cleanFilters[key] && cleanFilters[key] !== 0) {
          delete cleanFilters[key];
        }
      });

      console.log('Filtres envoyés:', cleanFilters);

      const response = await getProduits(pagination.page, pagination.limit, cleanFilters);
      
      const tousProduits = (response.data.produits || []).map(produit => ({
        ...produit,
        stock_actuel: getStockActuel(produit)
      }));
      
      // Calculer les statistiques
      const statsCalc = {
        total: tousProduits.length,
        actifs: tousProduits.filter(p => p.est_actif === 1).length,
        inactifs: tousProduits.filter(p => p.est_actif === 0).length,
        enRupture: tousProduits.filter(p => {
          const stock = getStockActuel(p);
          return stock <= (p.stock_min_kg || 0);
        }).length
      };
      
      setStats(statsCalc);
      setProduits(tousProduits);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduits();
  }, [pagination.page, pagination.limit, filters.search, filters.fournisseur_id, filters.categorie_id, showInactifs]);

  // Gérer les changements de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', fournisseur_id: '', categorie_id: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Formater le stock
  const formatStock = (produit) => {
    if (produit.type_vente === 'poids') {
      return `${produit.stock_kg || 0} kg`;
    } else {
      return `${produit.stock_unite || 0} unité(s)`;
    }
  };

  // Obtenir le style du badge de stock
  const getStockStyle = (produit) => {
    const stock = getStockActuel(produit);
    const min = produit.stock_min_kg || 0;
    
    if (stock <= 0) return { backgroundColor: '#dc3545', color: 'white' }; // Rupture
    if (stock <= min) return { backgroundColor: '#ffc107', color: '#333' }; // Stock faible
    return { backgroundColor: '#28a745', color: 'white' }; // Stock OK
  };

  // Récupérer l'utilisateur connecté pour les permissions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canCreate = ['gestionnaire', 'vendeur'].includes(currentUser.profile);

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
        Gestion des produits
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Produits</li>
        </ol>
      </nav>

      {/* Statistiques */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white" style={{
              backgroundColor: '#006994',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,105,148,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total affiché</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.total}</h3>
                  </div>
                  <i className="bi bi-box" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
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
          <div className="col-md-4">
            <div className="card text-white" style={{
              backgroundColor: '#ffc107',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(255,193,7,0.3)',
              border: 'none',
              color: '#333'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Stock faible</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.enRupture}</h3>
                  </div>
                  <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et bouton nouveau produit */}
      <div className="card mb-4" style={{
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
                  transition: 'all 0.3s'
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

              {canCreate && (
                <button
                  className="btn"
                  onClick={() => navigate('/produits/create')}
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
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#FF6F00';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Nouveau produit
                </button>
              )}
            </div>
          </div>
          
          <div className="row g-2">
            <div className="col-md-4">
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
                  padding: '10px 15px'
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
            <div className="col-md-3">
              <select 
                className="form-select"
                name="fournisseur_id"
                value={filters.fournisseur_id}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px'
                }}
              >
                <option value="">Tous fournisseurs</option>
                {fournisseurs.map(f => (
                  <option key={f.id} value={f.id}>{f.nom_societe}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                name="categorie_id"
                value={filters.categorie_id}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px'
                }}
              >
                <option value="">Toutes catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nom_categorie}</option>
                ))}
              </select>
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

          {/* Message d'information sur les inactifs */}
          {!showInactifs && stats?.inactifs > 0 && (
            <div className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-info-circle me-1" style={{ color: '#006994' }}></i>
              {stats.inactifs} produit(s) inactif(s) sont masqué(s). 
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

      {/* Tableau des produits */}
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
            <i className="bi bi-boxes me-2" style={{ color: '#FF6F00' }}></i>
            Liste des produits
            {!showInactifs && stats?.inactifs > 0 && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({stats.actifs} actifs, {stats.inactifs} inactifs masqués)
              </span>
            )}
            {showInactifs && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                (Total: {stats?.total} produits)
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
                      <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>Code</th>
                      <th style={{ padding: '15px' }}>Nom produit</th>
                      <th style={{ padding: '15px' }}>Catégorie</th>
                      <th style={{ padding: '15px' }}>Fournisseur</th>
                      <th style={{ padding: '15px' }}>Type</th>
                      <th style={{ padding: '15px' }}>Prix</th>
                      <th style={{ padding: '15px' }}>Stock</th>
                      <th style={{ padding: '15px' }}>Statut</th>
                      <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produits.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                          <i className="bi bi-box" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                          Aucun produit trouvé
                        </td>
                      </tr>
                    ) : (
                      produits.map(produit => (
                        <tr 
                          key={produit.id}
                          style={{ 
                            cursor: 'pointer',
                            opacity: produit.est_actif === 0 ? 0.7 : 1,
                            backgroundColor: produit.est_actif === 0 ? '#fff5f5' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                          onClick={() => navigate(`/produits/${produit.id}`)}
                          onMouseEnter={(e) => {
                            if (produit.est_actif === 1) {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (produit.est_actif === 1) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
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
                              {produit.code_produit || '---'}
                            </code>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <strong style={{ color: '#006994' }}>
                              <i className="bi bi-box me-2" style={{ color: '#006994' }}></i>
                              {produit.nom_produit}
                            </strong>
                            {produit.description && (
                              <small className="d-block text-muted" style={{ fontSize: '0.85rem' }}>
                                {produit.description.substring(0, 30)}...
                              </small>
                            )}
                          </td>
                          <td style={{ padding: '15px' }}>
                            {produit.nom_categorie ? (
                              <>
                                <i className="bi bi-folder me-1" style={{ color: '#FF6F00' }}></i>
                                {produit.nom_categorie}
                              </>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '15px' }}>
                            {produit.fournisseur_nom ? (
                              <>
                                <i className="bi bi-truck me-1" style={{ color: '#17a2b8' }}></i>
                                {produit.fournisseur_nom}
                              </>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span className="badge" style={{
                              backgroundColor: produit.type_vente === 'poids' ? '#40C4FF' : '#66BB6A',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.85rem'
                            }}>
                              {produit.type_vente === 'poids' ? 'Au poids' : 'À l\'unité'}
                            </span>
                          </td>
                          <td style={{ padding: '15px', whiteSpace: 'nowrap' }}>
                            {produit.prix_vente != null && parseFloat(produit.prix_vente) > 0 ? (
                              <strong style={{ color: '#28a745' }}>
                                {parseFloat(produit.prix_vente).toLocaleString('fr-FR')} F
                                <small className="text-muted fw-normal">/{produit.type_vente === 'poids' ? 'kg' : 'u'}</small>
                              </strong>
                            ) : (
                              <span className="badge bg-warning text-dark">Non défini</span>
                            )}
                            {produit.prix_achat != null && parseFloat(produit.prix_achat) > 0 && (
                              <small className="d-block text-muted">achat {parseFloat(produit.prix_achat).toLocaleString('fr-FR')} F</small>
                            )}
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span 
                              className="badge" 
                              style={{
                                ...getStockStyle(produit),
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <i className={`bi ${
                                getStockActuel(produit) <= 0 
                                  ? 'bi-exclamation-triangle' 
                                  : 'bi-box'
                              } me-1`}></i>
                              {formatStock(produit)}
                            </span>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span 
                              className="badge" 
                              style={{
                                backgroundColor: produit.est_actif === 1 ? '#28a745' : '#dc3545',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <i className={`bi ${produit.est_actif === 1 ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                              {produit.est_actif === 1 ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ position: 'relative' }}>
                              <button
                                className="btn btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/produits/${produit.id}`);
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
                                  setShowTooltip(`view-${produit.id}`);
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
                              {showTooltip === `view-${produit.id}` && (
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

export default ProduitList;