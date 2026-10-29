import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, toggleUserStatus } from '../../services/userService';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    est_actif: ''
  });

  // Récupérer l'utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isGestionnaire = currentUser.profile === 'gestionnaire';

  // Fonction pour formater le téléphone
  const formatTelephone = (telephone) => {
    if (!telephone) return '';
    // Enlever l'indicatif +227
    const num = telephone.replace('+227', '');
    // Formater XX XX XX XX
    return num.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  };

  // Charger les utilisateurs
  const loadUsers = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.est_actif) cleanFilters.est_actif = filters.est_actif;

      const response = await getUsers(pagination.page, pagination.limit, cleanFilters);
      const usersData = response.data.users || [];
      
      // Calculer les statistiques
      const statsCalc = {
        total: response.data.pagination.total || usersData.length,
        actifs: usersData.filter(u => u.est_actif === 1).length,
        inactifs: usersData.filter(u => u.est_actif === 0).length
      };
      setStats(statsCalc);

      setUsers(usersData);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit, filters]);

  // Gérer la suppression
  const handleDelete = async (id) => {
    if (!isGestionnaire) {
      setError('Seuls les gestionnaires peuvent supprimer des vendeurs');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ?')) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Gérer le changement de statut
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleUserStatus(id, !currentStatus);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Gérer les changements de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', est_actif: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
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
        Gestion des vendeurs
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Vendeurs</li>
        </ol>
      </nav>

      {/* Statistiques - 3 cards principales comme avant */}
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total vendeurs</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.total}</h3>
                    <small>{stats.actifs} actifs, {stats.inactifs} inactifs</small>
                  </div>
                  <i className="bi bi-people" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
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
                    <small>{((stats.actifs / stats.total) * 100 || 0).toFixed(1)}%</small>
                  </div>
                  <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
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
                    <small>{((stats.inactifs / stats.total) * 100 || 0).toFixed(1)}%</small>
                  </div>
                  <i className="bi bi-x-circle" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et bouton nouvel utilisateur - style original */}
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
            {isGestionnaire && (
              <button
                className="btn"
                onClick={() => navigate('/users/create')}
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
                Nouveau vendeur
              </button>
            )}
          </div>
          
          <div className="row g-2">
            <div className="col-md-8">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Rechercher un vendeur</label>
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
            <div className="col-md-2">
              <select 
                className="form-select"
                name="est_actif"
                value={filters.est_actif}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
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

      {/* Tableau des utilisateurs - style original */}
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
            <i className="bi bi-people me-2" style={{ color: '#FF6F00' }}></i>
            Liste des vendeurs
            {pagination.total > 0 && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({pagination.total} vendeur{pagination.total > 1 ? 's' : ''})
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
                      <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>Photo</th>
                      <th style={{ padding: '15px' }}>Nom & Prénom</th>
                      <th style={{ padding: '15px' }}>Téléphone</th>
                      <th style={{ padding: '15px' }}>Statut</th>
                      <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                          <i className="bi bi-people" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                          Aucun vendeur trouvé
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr 
                          key={user.id} 
                          style={{ 
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }} 
                          onClick={() => navigate(`/users/${user.id}`)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td style={{ padding: '15px' }}>
                            <img 
                              src={user.avatar_url || '/assets/img/default-avatar.png'} 
                              alt={user.nom}
                              className="rounded-circle"
                              style={{ 
                                width: '45px', 
                                height: '45px', 
                                objectFit: 'cover',
                                border: '2px solid #006994',
                                padding: '2px'
                              }}
                            />
                          </td>
                          <td style={{ padding: '15px' }}>
                            <strong style={{ color: '#006994' }}>
                              {user.nom} {user.prenom}
                            </strong>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div>
                              <i className="bi bi-telephone me-1" style={{ color: '#28a745' }}></i>
                              <small>{formatTelephone(user.telephone)}</small>
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div className="form-check form-switch" onClick={(e) => e.stopPropagation()}>
                              <input 
                                className="form-check-input" 
                                type="checkbox"
                                checked={user.est_actif === 1}
                                onChange={() => handleToggleStatus(user.id, user.est_actif)}
                                style={{
                                  cursor: 'pointer',
                                  backgroundColor: user.est_actif === 1 ? '#28a745' : '#dc3545',
                                  borderColor: user.est_actif === 1 ? '#28a745' : '#dc3545',
                                  width: '40px',
                                  height: '20px'
                                }}
                              />
                              <span className="ms-2" style={{
                                color: user.est_actif === 1 ? '#28a745' : '#dc3545',
                                fontSize: '0.85rem'
                              }}>
                                {user.est_actif === 1 ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div className="d-flex gap-1">
                              {/* Bouton Voir */}
                              <div style={{ position: 'relative' }}>
                                <button
                                  className="btn btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/users/${user.id}`);
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
                                    setShowTooltip(`view-${user.id}`);
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
                                {showTooltip === `view-${user.id}` && (
                                  <Tooltip text="Voir détails" />
                                )}
                              </div>

                            
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - style original */}
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
                    Page {pagination.page} sur {pagination.pages} • {pagination.total} vendeur(s)
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

export default UserList;