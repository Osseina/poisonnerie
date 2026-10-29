import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients } from '../../services/clientService';

const ClientListe = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
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
    search: ''
  });

  useEffect(() => {
    loadClients();
  }, [pagination.page, pagination.limit, filters]);

  // Formatage du téléphone pour l'affichage
  const formatTelephone = (telephone) => {
    if (!telephone) return '';
    const num = telephone.replace('+227', '');
    if (num.length === 8) {
      return num.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    return num;
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;

      const response = await getClients(pagination.page, pagination.limit, cleanFilters);
      
      const tousClients = response.clients || [];
      
      // Statistiques simplifiées
      const statsCalc = {
        total: tousClients.length,
        avecTelephone: tousClients.filter(c => c.telephone).length,
        avecAdresse: tousClients.filter(c => c.adresse).length
      };
      setStats(statsCalc);

      setClients(tousClients);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        total: response.pagination?.total || tousClients.length,
        pages: response.pagination?.pages || 1
      });
    } catch (err) {
      setError(err.message);
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
    setFilters({ search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

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

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Clients
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
        Gestion des clients
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Clients</li>
        </ol>
      </nav>

      {/* Statistiques simplifiées */}
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total clients</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.total}</h3>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Avec téléphone</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.avecTelephone}</h3>
                  </div>
                  <i className="bi bi-telephone" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card text-white" style={{
              backgroundColor: '#FF6F00',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(255,111,0,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Avec adresse</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.avecAdresse}</h3>
                  </div>
                  <i className="bi bi-geo-alt" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et bouton nouveau client */}
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
            <button
              className="btn"
              onClick={() => navigate('/clients/create')}
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
              Nouveau client
            </button>
          </div>
          
          <div className="row g-2">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher par nom ou téléphone..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px',
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
        </div>
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

      {/* Tableau des clients */}
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
            <i className="bi bi-people me-2" style={{ color: '#FF6F00' }}></i>
            Liste des clients
            {pagination.total > 0 && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({pagination.total} client{pagination.total > 1 ? 's' : ''})
              </span>
            )}
          </h5>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>Nom</th>
                  <th style={{ padding: '15px' }}>Téléphone</th>
                  <th style={{ padding: '15px' }}>Adresse</th>
                  <th style={{ padding: '15px' }}>Date création</th>
                  <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                      <i className="bi bi-people" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                      Aucun client trouvé
                    </td>
                  </tr>
                ) : (
                  clients.map(client => (
                    <tr 
                      key={client.id} 
                      style={{ 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }} 
                      onClick={() => navigate(`/clients/${client.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '15px' }}>
                        <strong style={{ color: '#006994' }}>
                          <i className="bi bi-person-circle me-2" style={{ color: '#006994' }}></i>
                          {client.nom}
                        </strong>
                      </td>
                      <td style={{ padding: '15px' }}>
                        {client.telephone ? (
                          <div className="d-flex align-items-center">
                            <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>🇳🇪</span>
                            <span>{formatTelephone(client.telephone)}</span>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {client.adresse || (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <i className="bi bi-calendar3 me-1" style={{ color: '#006994' }}></i>
                        <span>{formatDate(client.created_at)}</span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div className="d-flex gap-1">
                          <div style={{ position: 'relative' }}>
                            <button
                              className="btn btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/clients/${client.id}`);
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
                                setShowTooltip(`view-${client.id}`);
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
                            {showTooltip === `view-${client.id}` && (
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
                  
                  <li className="page-item active">
                    <span className="page-link" style={{ backgroundColor: '#006994', borderColor: '#006994' }}>
                      {pagination.page}
                    </span>
                  </li>
                  
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

export default ClientListe;