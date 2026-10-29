import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, deleteClient } from '../../services/clientService';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canModify = ['gestionnaire', 'vendeur'].includes(currentUser.profile);

  // Formatage du téléphone pour l'affichage
  const formatTelephone = (telephone) => {
    if (!telephone) return '';
    const num = telephone.replace('+227', '');
    if (num.length === 8) {
      return num.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    return num;
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const response = await getClient(id);
      setClient(response.client);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.nom}" ?`)) {
      try {
        await deleteClient(id);
        navigate('/clients', { 
          state: { message: 'Client supprimé avec succès' } 
        });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          Détails du client
        </h1>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails du client
        </h1>
        <div className="alert alert-danger" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          {error}
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/clients')}
          style={{
            backgroundColor: '#006994',
            color: 'white',
            borderRadius: '8px',
            fontFamily: 'Montserrat, sans-serif',
            border: 'none',
            padding: '10px 20px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#0056b3';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#006994';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails du client
        </h1>
        <div className="alert alert-warning" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #FFB300'
        }}>
          Client non trouvé
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/clients')}
          style={{
            backgroundColor: '#006994',
            color: 'white',
            borderRadius: '8px',
            fontFamily: 'Montserrat, sans-serif',
            border: 'none',
            padding: '10px 20px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#0056b3';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#006994';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </button>
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
        Détails du client
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/clients" style={{ color: '#006994' }}>Clients</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Détails</li>
        </ol>
      </nav>

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            {/* Carte client */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }} />

              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                <div style={{
                  position: 'relative',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #006994'
                  }}>
                    <i className="bi bi-person" style={{ fontSize: '60px', color: '#006994' }}></i>
                  </div>
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    fontSize: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    🐟
                  </span>
                </div>
                
                <h2 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#006994',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '5px',
                  textAlign: 'center'
                }}>
                  {client.nom}
                </h2>
                
                <div className="mt-2 text-center">
                  {client.telephone && (
                    <p className="mb-1 d-flex align-items-center justify-content-center">
                      <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>🇳🇪</span>
                      <span>{formatTelephone(client.telephone)}</span>
                    </p>
                  )}
                </div>

                {/* Barre d'actions */}
                <div className="d-flex gap-2 mt-4 pt-3 border-top w-100 justify-content-center" style={{
                  borderTopColor: '#f0f0f0'
                }}>
                  {/* Retour */}
                  <div style={{ position: 'relative' }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => navigate('/clients')}
                      style={{
                        backgroundColor: '#006994',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        padding: '8px 12px',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        setShowTooltip('back');
                        e.target.style.backgroundColor = '#0056b3';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        setShowTooltip('');
                        e.target.style.backgroundColor = '#006994';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <i className="bi bi-arrow-left"></i>
                    </button>
                    {showTooltip === 'back' && <Tooltip text="Retour" />}
                  </div>

                  {/* Modifier */}
                  {canModify && (
                    <div style={{ position: 'relative' }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate(`/clients/edit/${client.id}`)}
                        style={{
                          backgroundColor: '#FF6F00',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          setShowTooltip('edit');
                          e.target.style.backgroundColor = '#FFB300';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          setShowTooltip('');
                          e.target.style.backgroundColor = '#FF6F00';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      {showTooltip === 'edit' && <Tooltip text="Modifier" />}
                    </div>
                  )}

                  {/* Supprimer (gestionnaire/vendeur) */}
                  {canModify && (
                    <div style={{ position: 'relative' }}>
                      <button
                        className="btn btn-sm"
                        onClick={handleDelete}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          setShowTooltip('delete');
                          e.target.style.backgroundColor = '#c82333';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          setShowTooltip('');
                          e.target.style.backgroundColor = '#dc3545';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                      {showTooltip === 'delete' && <Tooltip text="Supprimer" />}
                    </div>
                  )}
                </div>
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
          </div>

          <div className="col-xl-8">
            {/* Informations détaillées */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }} />

              <div className="card-body pt-3">
                <h5 className="card-title" style={{
                  color: '#006994',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  <i className="bi bi-info-circle me-2" style={{ color: '#FF6F00' }}></i>
                  Informations détaillées
                </h5>
                
                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-person-circle me-2"></i>
                    Nom
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    {client.nom}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-telephone me-2"></i>
                    Téléphone
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    {client.telephone ? (
                      <div className="d-flex align-items-center">
                        <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>🇳🇪</span>
                        <span>{formatTelephone(client.telephone)}</span>
                        <a href={`tel:${client.telephone}`} className="ms-2" style={{ color: '#FF6F00' }}>
                          <i className="bi bi-telephone-forward"></i>
                        </a>
                      </div>
                    ) : 'Non renseigné'}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-geo-alt me-2"></i>
                    Adresse
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    {client.adresse || 'Non renseignée'}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-calendar-check me-2"></i>
                    Client depuis
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    <i className="bi bi-calendar3 me-1" style={{ color: '#28a745' }}></i>
                    {formatDate(client.created_at)}
                  </div>
                </div>

                {client.updated_at && client.updated_at !== client.created_at && (
                  <div className="row mb-3">
                    <div className="col-lg-3 col-md-4 label" style={{
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#006994',
                      fontWeight: 'bold'
                    }}>
                      <i className="bi bi-pencil-square me-2"></i>
                      Dernière modif.
                    </div>
                    <div className="col-lg-9 col-md-8" style={{
                      fontFamily: 'Roboto, sans-serif',
                      color: '#333333'
                    }}>
                      <i className="bi bi-clock me-1" style={{ color: '#FF6F00' }}></i>
                      {formatDate(client.updated_at)}
                    </div>
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientDetails;