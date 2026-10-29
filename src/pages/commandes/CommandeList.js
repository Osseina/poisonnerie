import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCommandes } from '../../services/commandeService';

const CommandeList = () => {
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnnulees, setShowAnnulees] = useState(false);
  const [showTooltip, setShowTooltip] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
    date: '' // Un seul champ date
  });

  // Définition des statuts
  const STATUTS_COMMANDE = {
    EN_ATTENTE: { value: 'en_attente', label: 'En attente', color: '#ffc107', icon: 'bi-hourglass-split' },
    LIVREE: { value: 'livree', label: 'Livrée', color: '#28a745', icon: 'bi-check-circle' },
    ANNULEE: { value: 'annulee', label: 'Annulée', color: '#dc3545', icon: 'bi-x-circle' }
  };

  useEffect(() => {
    loadCommandes();
  }, [pagination.page, pagination.limit, filters, showAnnulees]);

  const loadCommandes = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.statut) cleanFilters.statut = filters.statut;
      if (filters.date) {
        cleanFilters.date_debut = filters.date;
        cleanFilters.date_fin = filters.date;
      }

      const response = await getCommandes(pagination.page, pagination.limit, cleanFilters);
      
      // Filtrer les commandes annulées si showAnnulees est false
      let commandesFiltrees = response.data.commandes;
      if (!showAnnulees) {
        commandesFiltrees = commandesFiltrees.filter(cmd => cmd.statut !== 'annulee');
      }
      
      setCommandes(commandesFiltrees);
      setStats(response.data.stats);
      setPagination({
        ...response.data.pagination,
        total: commandesFiltrees.length // Ajuster le total après filtre local
      });
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
    setFilters({ search: '', statut: '', date: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const getStatutInfo = (statut) => {
    switch(statut) {
      case 'en_attente':
        return STATUTS_COMMANDE.EN_ATTENTE;
      case 'livree':
        return STATUTS_COMMANDE.LIVREE;
      case 'annulee':
        return STATUTS_COMMANDE.ANNULEE;
      default:
        return STATUTS_COMMANDE.EN_ATTENTE;
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

  return (
    <div className="pagetitle">
      <h1 style={{ 
        fontFamily: 'Montserrat, sans-serif',
        color: '#006994',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Gestion des commandes
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Commandes</li>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total commandes</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.total}</h3>
                    <small>CA: {formatPrice(stats.ca_total)}</small>
                  </div>
                  <i className="bi bi-cart" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: '#ffc107',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(255,193,7,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>En attente</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.en_attente || 0}</h3>
                  </div>
                  <i className="bi bi-hourglass-split" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Livrées</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.livree || 0}</h3>
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
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Annulées</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.annulee || 0}</h3>
                  </div>
                  <i className="bi bi-x-circle" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et bouton nouvelle commande */}
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
              {/* Bouton pour afficher/masquer les annulées */}
              <button
                className="btn"
                onClick={() => {
                  setShowAnnulees(!showAnnulees);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                style={{
                  backgroundColor: showAnnulees ? '#dc3545' : '#6c757d',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  boxShadow: showAnnulees ? '0 2px 6px rgba(220,53,69,0.3)' : '0 2px 6px rgba(108,117,125,0.3)'
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
                <i className={`bi ${showAnnulees ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
                {showAnnulees ? 'Masquer les annulées' : 'Afficher les annulées'}
              </button>

              <button
                className="btn"
                onClick={() => navigate('/commandes/create')}
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
                Nouvelle commande
              </button>
            </div>
          </div>
          
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher (n° commande, client)..."
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
            <div className="col-md-3">
              <select
                className="form-select"
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                <option value="">Tous statuts</option>
                <option value="en_attente">En attente</option>
                <option value="livree">Livrée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                placeholder="Date"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px 15px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              />
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

          {/* Message d'information sur les annulées */}
          {!showAnnulees && stats?.annulee > 0 && (
            <div className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-info-circle me-1" style={{ color: '#006994' }}></i>
              {stats.annulee} commande(s) annulée(s) sont masquées. 
              <button
                className="btn btn-link p-0 ms-1"
                onClick={() => {
                  setShowAnnulees(true);
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

      {/* Tableau des commandes */}
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
            <i className="bi bi-list-check me-2" style={{ color: '#FF6F00' }}></i>
            Liste des commandes
            {!showAnnulees && stats?.annulee > 0 && (
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({stats.total} commandes, {stats.annulee} annulées masquées)
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
                      <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>N° Commande</th>
                      <th style={{ padding: '15px' }}>Date</th>
                      <th style={{ padding: '15px' }}>Client</th>
                      <th style={{ padding: '15px' }}>Contact</th>
                      <th style={{ padding: '15px' }}>Type</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Articles</th>
                      <th style={{ padding: '15px' }}>Total</th>
                      <th style={{ padding: '15px' }}>Statut</th>
                      <th style={{ padding: '15px' }}>Facturée</th>
                      <th style={{ padding: '15px' }}>Vendeur</th>
                      <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commandes.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="text-center py-5" style={{ fontStyle: 'italic', color: '#999' }}>
                          <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                          {showAnnulees 
                            ? 'Aucune commande trouvée' 
                            : 'Aucune commande active trouvée (les annulées sont masquées)'}
                        </td>
                      </tr>
                    ) : (
                      commandes.map(cmd => {
                        const statutInfo = getStatutInfo(cmd.statut);
                        return (
                          <tr 
                            key={cmd.id} 
                            style={{ 
                              cursor: 'pointer',
                              opacity: cmd.statut === 'annulee' ? 0.7 : 1,
                              backgroundColor: cmd.statut === 'annulee' ? '#fff5f5' : 'transparent',
                              transition: 'background-color 0.2s'
                            }}
                            onClick={() => navigate(`/commandes/${cmd.id}`)}
                            onMouseEnter={(e) => {
                              if (cmd.statut !== 'annulee') {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (cmd.statut !== 'annulee') {
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
                                {cmd.numero_commande}
                              </code>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <i className="bi bi-calendar3 me-2" style={{ color: '#006994', fontSize: '0.9rem' }}></i>
                              <span style={{ fontSize: '0.95rem' }}>{formatDate(cmd.created_at)}</span>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <i className="bi bi-person me-2" style={{ color: '#006994' }}></i>
                              <strong style={{ color: '#006994' }}>{cmd.client_nom || 'Client inconnu'}</strong>
                            </td>
                            <td style={{ padding: '15px' }}>
                              {cmd.client_telephone && (
                                <div>
                                  <i className="bi bi-telephone me-1" style={{ color: '#28a745' }}></i>
                                  <span>{cmd.client_telephone}</span>
                                </div>
                              )}
                              {cmd.client_email && (
                                <div>
                                  <i className="bi bi-envelope me-1" style={{ color: '#17a2b8' }}></i>
                                  <small>{cmd.client_email}</small>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '15px' }}>
                              <span className="badge" style={{
                                backgroundColor: cmd.type_commande === 'en_ligne' ? '#40C4FF' : '#6c757d',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem'
                              }}>
                                <i className={`bi ${cmd.type_commande === 'en_ligne' ? 'bi-globe' : 'bi-shop'} me-1`}></i>
                                {cmd.type_commande === 'en_ligne' ? 'En ligne' : 'Boutique'}
                              </span>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <span className="badge" style={{
                                backgroundColor: '#e9ecef',
                                color: '#333',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.9rem'
                              }}>
                                <i className="bi bi-box me-1"></i>
                                {cmd.nb_articles || 0}
                              </span>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <strong style={{ 
                                color: '#28a745',
                                fontSize: '1.1rem',
                                fontWeight: 'bold'
                              }}>
                                {formatPrice(cmd.total)}
                              </strong>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <span className="badge" style={{
                                backgroundColor: statutInfo.color,
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem'
                              }}>
                                <i className={`bi ${statutInfo.icon} me-1`}></i>
                                {statutInfo.label}
                              </span>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              {cmd.est_facturee == 1 ? (
                                <span className="badge" style={{
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.85rem'
                                }}>
                                  <i className="bi bi-check-circle me-1"></i>
                                  Oui
                                </span>
                              ) : (
                                <span className="badge" style={{
                                  backgroundColor: '#6c757d',
                                  color: 'white',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.85rem'
                                }}>
                                  <i className="bi bi-x-circle me-1"></i>
                                  Non
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '15px' }}>
                              <i className="bi bi-person-badge me-1" style={{ color: '#006994' }}></i>
                              <span>{cmd.vendeur_nom || '-'}</span>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ position: 'relative' }}>
                                <button
                                  className="btn btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/commandes/${cmd.id}`);
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
                                    setShowTooltip(`view-${cmd.id}`);
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
                                {showTooltip === `view-${cmd.id}` && (
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
                    Page {pagination.page} sur {pagination.pages} • {pagination.total} commande(s)
                    {!showAnnulees && stats?.annulee > 0 && (
                      <span className="ms-2 text-muted">
                        ({stats.annulee} annulée{stats.annulee > 1 ? 's' : ''} masquée{stats.annulee > 1 ? 's' : ''})
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

export default CommandeList;