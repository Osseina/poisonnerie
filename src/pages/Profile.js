import { API_BASE_URL, getAssetUrl } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordMode, setPasswordMode] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [passwordData, setPasswordData] = useState({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirm_mot_de_passe: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [avatarKey, setAvatarKey] = useState(Date.now());

  // Fonction pour générer l'URL complète de l'avatar
  const getAvatarUrl = (avatar_url) => {
    if (!avatar_url || avatar_url === 'default.png') {
      return null; // Retourne null pour utiliser le fallback
    }
    
    if (avatar_url.startsWith('http')) {
      return avatar_url;
    }
    if (avatar_url.startsWith('/')) {
      return getAssetUrl(avatar_url);
    }
    return getAssetUrl('uploads/avatars/' + avatar_url);
  };

  // Fonction pour obtenir l'avatar (avec fallback)
  const getAvatarDisplay = () => {
    if (!user) return null;

    const avatarUrl = getAvatarUrl(user.avatar_url);
    
    if (avatarUrl) {
      return (
        <img 
          key={avatarKey}
          src={avatarUrl} 
          alt={`${user.prenom} ${user.nom}`}
          className="rounded-circle"
          style={{ 
            width: '140px', 
            height: '140px', 
            objectFit: 'cover',
            border: '4px solid #006994',
            padding: '3px'
          }}
          onError={(e) => {
            console.log('Erreur chargement avatar, utilisation fallback');
            e.target.style.display = 'none';
            // Afficher le fallback
            e.target.parentElement.querySelector('.avatar-fallback').style.display = 'flex';
          }}
        />
      );
    }

    // Fallback avec initiales
    const name = encodeURIComponent(`${user.prenom} ${user.nom}`);
    return (
      <div
        className="rounded-circle avatar-fallback d-flex align-items-center justify-content-center"
        style={{
          width: '140px',
          height: '140px',
          backgroundColor: '#006994',
          color: 'white',
          fontSize: '3rem',
          fontWeight: 'bold',
          border: '4px solid #006994',
          padding: '3px',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        {user.prenom?.[0]}{user.nom?.[0]}
      </div>
    );
  };

  // Charger le profil depuis l'API (PAS depuis localStorage)
  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Non authentifié');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/utilisateurs/profile.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        // Mettre à jour localStorage pour les autres composants
        localStorage.setItem('user', JSON.stringify(data.user));
        setAvatarKey(Date.now());
      } else {
        setError(data.message);
        // Si erreur, essayer de charger depuis localStorage en secours
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      // En cas d'erreur réseau, utiliser localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setError('Erreur de chargement du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger le profil au montage
  useEffect(() => {
    loadProfile();

    // Écouter les événements de mise à jour du profil
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  // Gérer l'upload d'avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 2 Mo');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/utilisateurs/profile.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Photo de profil mise à jour avec succès');
        
        // Recharger tout le profil depuis l'API
        await loadProfile();
        
        // Déclencher un événement pour mettre à jour le header
        window.dispatchEvent(new Event('profile-updated'));
        
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (passwordData.nouveau_mot_de_passe !== passwordData.confirm_mot_de_passe) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.nouveau_mot_de_passe.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/utilisateurs/profile.php`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ancien_mot_de_passe: passwordData.ancien_mot_de_passe,
          nouveau_mot_de_passe: passwordData.nouveau_mot_de_passe
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Mot de passe modifié avec succès');
        setPasswordMode(false);
        setPasswordData({
          ancien_mot_de_passe: '',
          nouveau_mot_de_passe: '',
          confirm_mot_de_passe: ''
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur de modification du mot de passe');
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour obtenir le style du badge profil
  const getProfileStyle = (profile) => {
    const styles = {
      'gestionnaire': { backgroundColor: '#FF6F00', icon: 'bi-person-badge', label: 'Gestionnaire' },
      'vendeur': { backgroundColor: '#17a2b8', icon: 'bi-cart', label: 'Vendeur' }
    };
    return styles[profile] || { backgroundColor: '#6c757d', icon: 'bi-person', label: profile };
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

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Mon Profil
        </h1>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
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
          Mon Profil
        </h1>
        <div className="alert alert-danger" role="alert">
          Utilisateur non trouvé
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: '#006994',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            padding: '10px 20px'
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Connexion
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
        Mon Profil
      </h1>

      {success && (
        <div className="alert alert-success" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #66BB6A'
        }}>
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            {/* Carte de profil avec photo et upload */}
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
                right: 0,
                opacity: 0.5
              }} />

              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                <div style={{
                  position: 'relative',
                  marginBottom: '15px'
                }}>
                  {/* Affichage avatar avec fallback intégré */}
                  {getAvatarDisplay()}
                  
                  {/* Bouton d'upload */}
                  <label
                    htmlFor="avatar-upload"
                    style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      backgroundColor: '#FF6F00',
                      color: 'white',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '2px solid white',
                      transition: 'all 0.3s',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFB300';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF6F00';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <i className="bi bi-camera"></i>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingAvatar}
                    />
                  </label>

                  {uploadingAvatar && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 20
                    }}>
                      <div className="spinner-border spinner-border-sm" style={{ color: 'white' }} role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                  )}

                  <span style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    fontSize: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 10
                  }}>
                    🐟
                  </span>
                </div>
                
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
                    {profileStyle.label}
                  </span>
                </h3>
                
                <div className="mt-2 d-flex gap-2">
                  <span 
                    className="badge"
                    style={{
                      backgroundColor: user.est_actif ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className={`bi ${user.est_actif ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                    {user.est_actif ? 'Actif' : 'Inactif'}
                  </span>
                  
                  {user.est_verifie && (
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <i className="bi bi-patch-check-fill me-1"></i>
                      Vérifié
                    </span>
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
                {/* Onglets simplifiés */}
                <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${!passwordMode ? 'active' : ''}`}
                      onClick={() => setPasswordMode(false)}
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold',
                        borderBottom: !passwordMode ? '2px solid #006994' : 'none'
                      }}
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      Informations
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${passwordMode ? 'active' : ''}`}
                      onClick={() => setPasswordMode(true)}
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold',
                        borderBottom: passwordMode ? '2px solid #006994' : 'none'
                      }}
                    >
                      <i className="bi bi-key me-2"></i>
                      Mot de passe
                    </button>
                  </li>
                </ul>

                <div className="tab-content pt-3">
                  {/* Onglet Informations (lecture seule) */}
                  {!passwordMode && (
                    <div className="tab-pane fade show active">
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
                          {user.telephone || 'Non renseigné'}
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
                            {profileStyle.label}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-calendar-check me-2"></i>
                          Membre depuis
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {formatDate(user.created_at)}
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
                          {user.derniere_connexion ? formatDate(user.derniere_connexion) : 'Jamais connecté'}
                        </div>
                      </div>

                      {/* Message informatif */}
                      <div className="alert alert-info mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        Pour modifier vos informations personnelles (nom, prénom, téléphone), contactez un administrateur.
                      </div>
                    </div>
                  )}

                  {/* Onglet Mot de passe */}
                  {passwordMode && (
                    <div className="tab-pane fade show active">
                      <form onSubmit={handleSubmitPassword}>
                        <div className="mb-3">
                          <label className="form-label" style={{
                            fontFamily: 'Montserrat, sans-serif',
                            color: '#006994',
                            fontWeight: 'bold'
                          }}>
                            <i className="bi bi-lock me-2"></i>
                            Ancien mot de passe
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            name="ancien_mot_de_passe"
                            value={passwordData.ancien_mot_de_passe}
                            onChange={handlePasswordChange}
                            required
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label" style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#006994',
                              fontWeight: 'bold'
                            }}>
                              <i className="bi bi-key me-2"></i>
                              Nouveau mot de passe
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              name="nouveau_mot_de_passe"
                              value={passwordData.nouveau_mot_de_passe}
                              onChange={handlePasswordChange}
                              required
                              minLength="6"
                              style={{
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                padding: '10px'
                              }}
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label" style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#006994',
                              fontWeight: 'bold'
                            }}>
                              <i className="bi bi-check-circle me-2"></i>
                              Confirmation
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              name="confirm_mot_de_passe"
                              value={passwordData.confirm_mot_de_passe}
                              onChange={handlePasswordChange}
                              required
                              style={{
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                padding: '10px'
                              }}
                            />
                          </div>
                        </div>

                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            type="button"
                            className="btn"
                            onClick={() => setPasswordMode(false)}
                            style={{
                              backgroundColor: '#6c757d',
                              color: 'white',
                              borderRadius: '8px',
                              border: 'none',
                              padding: '10px 20px'
                            }}
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="btn"
                            disabled={submitting}
                            style={{
                              backgroundColor: '#FF6F00',
                              color: 'white',
                              borderRadius: '8px',
                              border: 'none',
                              padding: '10px 20px',
                              opacity: submitting ? 0.7 : 1
                            }}
                          >
                            {submitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Modification...
                              </>
                            ) : 'Changer le mot de passe'}
                          </button>
                        </div>
                      </form>
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
                opacity: 0.2
              }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;