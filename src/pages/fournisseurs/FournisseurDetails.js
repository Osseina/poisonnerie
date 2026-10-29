import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFournisseur, deleteFournisseur, toggleFournisseurStatus } from '../../services/fournisseurService';

const FournisseurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fournisseur, setFournisseur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');

  // Récupérer l'utilisateur connecté pour les permissions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.profile === 'admin';
  const isGestionnaire = currentUser.profile === 'gestionnaire';
  const canModify = isAdmin || isGestionnaire;

  useEffect(() => {
    loadFournisseur();
  }, [id]);

  const loadFournisseur = async () => {
    try {
      setLoading(true);
      const response = await getFournisseur(id);
      setFournisseur(response.fournisseur);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await deleteFournisseur(id);
        navigate('/fournisseurs', { 
          state: { message: 'Fournisseur supprimé avec succès' } 
        });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleFournisseurStatus(id, !fournisseur.est_actif);
      await loadFournisseur();
    } catch (err) {
      setError(err.message);
    }
  };

  // Formater la date
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

  // Obtenir le style du badge de statut
  const getStatusStyle = (est_actif) => ({
    backgroundColor: est_actif ? '#66BB6A' : '#dc3545',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '8px',
    fontFamily: 'Roboto, sans-serif'
  });

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails du fournisseur
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
          Détails du fournisseur
        </h1>
        <div className="alert alert-danger" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          {error}
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/fournisseurs')}
          style={{
            backgroundColor: '#006994',
            color: 'white',
            borderRadius: '8px',
            fontFamily: 'Montserrat, sans-serif',
            border: 'none',
            padding: '10px 20px'
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!fournisseur) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails du fournisseur
        </h1>
        <div className="alert alert-warning" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #FFB300'
        }}>
          Fournisseur non trouvé
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/fournisseurs')}
          style={{
            backgroundColor: '#006994',
            color: 'white',
            borderRadius: '8px',
            fontFamily: 'Montserrat, sans-serif',
            border: 'none',
            padding: '10px 20px'
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
        Détails du fournisseur
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/fournisseurs" style={{ color: '#006994' }}>Fournisseurs</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Détails</li>
        </ol>
      </nav>

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            {/* Carte d'identité du fournisseur */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                {/* Logo / Icône fournisseur */}
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
                    <i className="bi bi-truck" style={{ fontSize: '50px', color: '#006994' }}></i>
                  </div>
                  {/* Petit poisson décoratif */}
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    fontSize: '20px'
                  }}>
                    🐟
                  </span>
                </div>
                
                {/* Nom du fournisseur */}
                <h2 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#006994',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '5px',
                  textAlign: 'center'
                }}>
                  {fournisseur.nom}
                </h2>
                
                {/* ICE / RC (si disponible) */}
                {fournisseur.ice && (
                  <p style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem',
                    marginBottom: '5px'
                  }}>
                    ICE: {fournisseur.ice}
                  </p>
                )}
                
                {/* Badge de statut */}
                <div className="mt-2">
                  <span 
                    className="badge"
                    style={getStatusStyle(fournisseur.est_actif)}
                  >
                    {fournisseur.est_actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {/* Barre d'actions sous la photo */}
                <div className="d-flex gap-2 mt-4 pt-3 border-top w-100 justify-content-center" style={{
                  borderTopColor: '#f0f0f0'
                }}>
                  {/* Bouton Retour */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn btn-sm"
                      onClick={() => navigate('/fournisseurs')}
                      onMouseEnter={() => setShowTooltip('back')}
                      onMouseLeave={() => setShowTooltip('')}
                      style={{
                        backgroundColor: '#006994',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        padding: '8px 12px',
                        transition: 'all 0.3s'
                      }}
                    >
                      <i className="bi bi-arrow-left"></i>
                    </button>
                    {showTooltip === 'back' && (
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
                        Retour
                      </div>
                    )}
                  </div>

                  {/* Bouton Modifier */}
                  {canModify && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={() => navigate(`/fournisseurs/${fournisseur.id}/edit`)}
                        onMouseEnter={() => setShowTooltip('edit')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: '#FF6F00',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      {showTooltip === 'edit' && (
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
                          Modifier
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bouton Activer/Désactiver */}
                  {canModify && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={handleToggleStatus}
                        onMouseEnter={() => setShowTooltip('status')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: fournisseur.est_actif ? '#dc3545' : '#66BB6A',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <i className={`bi ${fournisseur.est_actif ? 'bi-person-x' : 'bi-person-check'}`}></i>
                      </button>
                      {showTooltip === 'status' && (
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
                          {fournisseur.est_actif ? 'Désactiver' : 'Activer'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bouton Supprimer */}
                  {isAdmin && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={handleDelete}
                        onMouseEnter={() => setShowTooltip('delete')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                      {showTooltip === 'delete' && (
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
                          Supprimer
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-8">
            {/* Informations détaillées */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body pt-3">
                <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                  <li className="nav-item">
                    <button 
                      className="nav-link active" 
                      data-bs-toggle="tab" 
                      data-bs-target="#info"
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      Informations
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className="nav-link" 
                      data-bs-toggle="tab" 
                      data-bs-target="#contact"
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      <i className="bi bi-telephone me-2"></i>
                      Contact
                    </button>
                  </li>
                </ul>

                <div className="tab-content pt-3">
                  {/* Onglet Informations générales */}
                  <div className="tab-pane fade show active" id="info">
                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-building me-2"></i>
                        Nom société
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {fournisseur.nom}
                      </div>
                    </div>

                    {fournisseur.ice && (
                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-upc-scan me-2"></i>
                          ICE
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {fournisseur.ice}
                        </div>
                      </div>
                    )}

                    {fournisseur.rc && (
                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-file-text me-2"></i>
                          RC
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {fournisseur.rc}
                        </div>
                      </div>
                    )}

                    {fournisseur.if && (
                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-file-text me-2"></i>
                          IF
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {fournisseur.if}
                        </div>
                      </div>
                    )}

                    {fournisseur.patente && (
                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-file-text me-2"></i>
                          Patente
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {fournisseur.patente}
                        </div>
                      </div>
                    )}

                    {fournisseur.cnss && (
                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-file-text me-2"></i>
                          CNSS
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {fournisseur.cnss}
                        </div>
                      </div>
                    )}

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
                        {fournisseur.adresse || 'Non renseignée'}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-globe me-2"></i>
                        Site web
                      </div>
                      <div className="col-lg-9 col-md-8">
                        {fournisseur.site_web ? (
                          <a href={fournisseur.site_web} target="_blank" rel="noopener noreferrer" style={{
                            color: '#FF6F00',
                            textDecoration: 'none',
                            fontFamily: 'Roboto, sans-serif'
                          }}>
                            {fournisseur.site_web}
                            <i className="bi bi-box-arrow-up-right ms-2" style={{ fontSize: '0.8rem' }}></i>
                          </a>
                        ) : 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  {/* Onglet Contact */}
                  <div className="tab-pane fade" id="contact">
                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-person me-2"></i>
                        Contact principal
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {fournisseur.contact_nom || 'Non renseigné'}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-envelope me-2"></i>
                        Email
                      </div>
                      <div className="col-lg-9 col-md-8">
                        {fournisseur.email ? (
                          <a href={`mailto:${fournisseur.email}`} style={{
                            color: '#FF6F00',
                            textDecoration: 'none',
                            fontFamily: 'Roboto, sans-serif'
                          }}>
                            {fournisseur.email}
                            <i className="bi bi-box-arrow-up-right ms-2" style={{ fontSize: '0.8rem' }}></i>
                          </a>
                        ) : 'Non renseigné'}
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
                        {fournisseur.telephone || 'Non renseigné'}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-phone me-2"></i>
                        Mobile
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {fournisseur.mobile || 'Non renseigné'}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-fax me-2"></i>
                        Fax
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {fournisseur.fax || 'Non renseigné'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations système */}
            <div className="card mt-3" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <h5 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#006994',
                  fontSize: '1rem',
                  marginBottom: '15px'
                }}>
                  <i className="bi bi-gear me-2"></i>
                  Informations système
                </h5>
                
                <div className="row mb-2">
                  <div className="col-md-4" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-person-plus me-1"></i>
                    Créé par:
                  </div>
                  <div className="col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333',
                    fontSize: '0.9rem'
                  }}>
                    {fournisseur.createur_nom ? `${fournisseur.createur_prenom} ${fournisseur.createur_nom}` : 'Système'}
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-4" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-calendar-plus me-1"></i>
                    Créé le:
                  </div>
                  <div className="col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333',
                    fontSize: '0.9rem'
                  }}>
                    {formatDate(fournisseur.created_at)}
                  </div>
                </div>

                {fournisseur.updated_at && (
                  <div className="row mb-2">
                    <div className="col-md-4" style={{
                      fontFamily: 'Roboto, sans-serif',
                      color: '#666',
                      fontSize: '0.9rem'
                    }}>
                      <i className="bi bi-calendar-check me-1"></i>
                      Modifié le:
                    </div>
                    <div className="col-md-8" style={{
                      fontFamily: 'Roboto, sans-serif',
                      color: '#333',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(fournisseur.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FournisseurDetails;