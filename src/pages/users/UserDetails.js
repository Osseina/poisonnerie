import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, deleteUser, toggleUserStatus } from '../../services/userService';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');

  // Récupérer l'utilisateur connecté pour les permissions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isGestionnaire = currentUser.profile === 'gestionnaire';

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await getUser(id);
      setUser(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ?')) {
      try {
        await deleteUser(id);
        navigate('/users', { 
          state: { message: 'Vendeur supprimé avec succès' } 
        });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus(id, !user.est_actif);
      await loadUser();
    } catch (err) {
      setError(err.message);
    }
  };

  // Style personnalisé pour les badges
  const getProfileStyle = (profile) => {
    const styles = {
      'vendeur': { backgroundColor: '#40C4FF', icon: 'bi-cart' }
    };
    return styles[profile] || { backgroundColor: '#6c757d', icon: 'bi-person' };
  };

  // Fonction pour obtenir le libellé du profil
  const getProfileLabel = (profile) => {
    const labels = {
      'vendeur': 'Vendeur'
    };
    return labels[profile] || profile;
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

  // Formater le téléphone
  const formatTelephone = (telephone) => {
    if (!telephone) return 'Non renseigné';
    const num = telephone.replace('+227', '');
    return num.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  };

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails utilisateur
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
          Détails utilisateur
        </h1>
        <div className="alert alert-danger" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          {error}
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/users')}
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
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#006994';
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails utilisateur
        </h1>
        <div className="alert alert-warning" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #FFB300'
        }}>
          Utilisateur non trouvé
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/users')}
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
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#006994';
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </button>
      </div>
    );
  }

  const profileStyle = getProfileStyle(user.profile);

  return (
    <div className="pagetitle">
      <h1 style={{ 
        fontFamily: 'Montserrat, sans-serif',
        color: '#006994',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Détails utilisateur
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="/users" style={{ color: '#006994' }}>Utilisateurs</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Détails</li>
        </ol>
      </nav>

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            {/* Carte de profil avec actions intégrées */}
            <div className="card" style={{
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
                opacity: 0.5
              }} />

              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                {/* Photo de profil */}
                <div style={{
                  position: 'relative',
                  marginBottom: '15px'
                }}>
                  <img 
                    src={user.avatar_url || '/assets/img/default-avatar.png'} 
                    alt={`${user.prenom} ${user.nom}`}
                    className="rounded-circle"
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      objectFit: 'cover',
                      border: '3px solid #006994',
                      padding: '3px'
                    }}
                  />
                  {/* Petit poisson décoratif */}
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
                
                {/* Nom et profil */}
                <h2 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#006994',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '5px'
                }}>
                  {user.prenom} {user.nom}
                </h2>
                
                <h3 style={{ marginBottom: '10px' }}>
                  <span 
                    className="badge"
                    style={{
                      backgroundColor: profileStyle.backgroundColor,
                      fontFamily: 'Montserrat, sans-serif',
                      padding: '8px 15px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      color: 'white'
                    }}
                  >
                    <i className={`bi ${profileStyle.icon} me-1`}></i>
                    {getProfileLabel(user.profile)}
                  </span>
                </h3>
                
                {/* Badges de statut */}
                <div className="mt-2 d-flex gap-2">
                  <span 
                    className="badge"
                    style={{
                      backgroundColor: user.est_actif ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className={`bi ${user.est_actif ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                    {user.est_actif ? 'Actif' : 'Inactif'}
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
                      onClick={() => navigate('/users')}
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
                  {isGestionnaire && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={() => navigate(`/users/${user.id}/edit`)}
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
                  {isGestionnaire && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={handleToggleStatus}
                        style={{
                          backgroundColor: user.est_actif ? '#dc3545' : '#28a745',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          setShowTooltip('status');
                          e.target.style.backgroundColor = user.est_actif ? '#c82333' : '#218838';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          setShowTooltip('');
                          e.target.style.backgroundColor = user.est_actif ? '#dc3545' : '#28a745';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <i className={`bi ${user.est_actif ? 'bi-person-x' : 'bi-person-check'}`}></i>
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
                          {user.est_actif ? 'Désactiver' : 'Activer'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bouton Supprimer */}
                  {isGestionnaire && (
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
              {/* Vague décorative en haut */}
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                opacity: 0.5
              }} />

              <div className="card-body pt-3">
                <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                  <li className="nav-item">
                    <button 
                      className="nav-link active" 
                      data-bs-toggle="tab" 
                      data-bs-target="#profile-overview"
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold',
                        borderBottom: '2px solid #006994'
                      }}
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      Informations
                    </button>
                  </li>
                </ul>

                <div className="tab-content pt-3">
                  <div className="tab-pane fade show active" id="profile-overview">
                    
                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-person-circle me-2"></i>
                        Nom complet
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {user.prenom} {user.nom}
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
                        {user.telephone ? (
                          <>
                            <i className="bi bi-telephone me-1" style={{ color: '#28a745' }}></i>
                            {formatTelephone(user.telephone)}
                          </>
                        ) : 'Non renseigné'}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-briefcase me-2"></i>
                        Profil
                      </div>
                      <div className="col-lg-9 col-md-8">
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: profileStyle.backgroundColor,
                            fontFamily: 'Montserrat, sans-serif',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            color: 'white'
                          }}
                        >
                          <i className={`bi ${profileStyle.icon} me-1`}></i>
                          {getProfileLabel(user.profile)}
                        </span>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-shield-check me-2"></i>
                        Statut
                      </div>
                      <div className="col-lg-9 col-md-8">
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: user.est_actif ? '#28a745' : '#dc3545',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '20px'
                          }}
                        >
                          <i className={`bi ${user.est_actif ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                          {user.est_actif ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-clock-history me-2"></i>
                        Dernière connexion
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {user.derniere_connexion ? (
                          <>
                            <i className="bi bi-calendar3 me-1" style={{ color: '#006994' }}></i>
                            {formatDate(user.derniere_connexion)}
                          </>
                        ) : 'Jamais connecté'}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-calendar-check me-2"></i>
                        Compte créé le
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        <i className="bi bi-calendar-plus me-1" style={{ color: '#28a745' }}></i>
                        {formatDate(user.created_at)}
                      </div>
                    </div>

                    {user.updated_at && user.updated_at !== user.created_at && (
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
                          {formatDate(user.updated_at)}
                        </div>
                      </div>
                    )}
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserDetails;