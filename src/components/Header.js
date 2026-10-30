import { API_BASE_URL, getAssetUrl } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // IMPORTANT: Ajout de Link

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);

  // Fonction pour charger le profil depuis l'API
  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/utilisateurs/profile.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAvatarKey(Date.now());
      } else {
        // Fallback vers localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      // Fallback vers localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger le profil au montage et écouter les mises à jour
  useEffect(() => {
    loadProfile();

    // Écouter les événements de mise à jour du profil
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') {
        loadProfile();
      }
    });

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  // Charger les demandes en attente pour le gestionnaire
  useEffect(() => {
    if (user?.profile === 'gestionnaire') {
      chargerDemandes();
      const interval = setInterval(chargerDemandes, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.profile]);

  // Fonction pour obtenir l'URL complète de l'avatar
  const getAvatarUrl = () => {
    if (!user) return '';
    
    if (user.avatar_url && user.avatar_url !== 'default.png') {
      if (user.avatar_url.startsWith('http')) {
        return user.avatar_url;
      }
      if (user.avatar_url.startsWith('/')) {
        return getAssetUrl(user.avatar_url);
      }
      return getAssetUrl('uploads/avatars/' + user.avatar_url);
    }
    
    // Fallback avec initiales
    const name = encodeURIComponent(`${user.prenom || ''} ${user.nom || ''}`.trim() || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=006994&color=fff&size=40&bold=true&length=2`;
  };

  const chargerDemandes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stock/demandes-attente.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.demandes || []);
        setNonLues(data.demandes?.length || 0);
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    }
  };

  // Valider une demande
  const validerDemande = async (id, accepter, motifRejet = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stock/valider-demande.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mouvement_id: id,
          action: accepter ? 'valider' : 'rejeter',
          motif_rejet: motifRejet
        })
      });
      const data = await response.json();
      if (data.success) {
        chargerDemandes();
      }
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    return date.toLocaleDateString('fr-FR');
  };

  // Obtenir le libellé du type
  const getTypeLabel = (type) => {
    const labels = {
      'perte': '📉 Perte',
      'don': '🎁 Don',
      'retour_fournisseur': '📦 Retour fournisseur'
    };
    return labels[type] || type;
  };

  const getProfileLabel = (profile) => {
    const labels = {
      'gestionnaire': 'Gestionnaire',
      'vendeur': 'Vendeur'
    };
    return labels[profile] || 'Utilisateur';
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout.php`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Erreur logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  // Empêcher la propagation du clic sur les boutons
  const handleButtonClick = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <header id="header" className="header fixed-top d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/" className="logo d-flex align-items-center">
            <img src={process.env.PUBLIC_URL + "/assets/img/logo1.png"} alt="Poissonnerie Grema" />
          </Link>
        </div>
        <div className="ms-auto me-3">
          <div className="spinner-border spinner-border-sm" style={{ color: '#006994' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        <Link to="/" className="logo d-flex align-items-center">
          <img src={process.env.PUBLIC_URL + "/assets/img/logo1.png"} alt="Poissonnerie Grema" />
        </Link>
        <i
          className="bi bi-list toggle-sidebar-btn"
          role="button"
          aria-label="Afficher ou masquer le menu"
          onClick={() => document.body.classList.toggle('toggle-sidebar')}
        ></i>
      </div>

      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          {/* Notifications - Visible seulement pour gestionnaire */}
          {user?.profile === 'gestionnaire' && (
            <li className="nav-item dropdown">
              <a className="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                <i className="bi bi-bell"></i>
                {nonLues > 0 && (
                  <span className="badge bg-primary badge-number">{nonLues}</span>
                )}
              </a>
              
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications" style={{ width: '400px', maxHeight: '500px', overflowY: 'auto' }}>
                <li className="dropdown-header d-flex justify-content-between align-items-center">
                  <span>Demandes en attente</span>
                  {notifications.length > 0 && (
                    <Link to="/demandes-validation" className="text-primary small">
                      Voir tout ({notifications.length})
                    </Link>
                  )}
                </li>
                <li><hr className="dropdown-divider" /></li>
                
                {notifications.length === 0 ? (
                  <li>
                    <div className="text-center p-3 text-muted">
                      <i className="bi bi-check-circle fs-4"></i>
                      <p className="mb-0">Aucune demande en attente</p>
                    </div>
                  </li>
                ) : (
                  notifications.slice(0, 5).map(notif => (
                    <li key={notif.id} className="notification-item p-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Link 
                        to={`/demandes-validation?focus=${notif.id}`}
                        style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-start">
                          <i className={`bi fs-4 me-2 ${
                            notif.type_sortie === 'perte' ? 'bi-exclamation-triangle text-warning' :
                            notif.type_sortie === 'don' ? 'bi-gift text-info' : 'bi-truck text-warning'
                          }`}></i>
                          <div style={{ flex: 1 }}>
                            <div className="d-flex justify-content-between">
                              <strong>{getTypeLabel(notif.type_sortie)}</strong>
                              <small className="text-muted">{formatDate(notif.created_at)}</small>
                            </div>
                            <div><strong>{notif.nom_produit}</strong></div>
                            <div className="small">
                              <span className="text-primary">{notif.createur}</span> • {notif.quantite} {notif.type_vente === 'poids' ? 'kg' : 'unités'}
                            </div>
                            {notif.motif && (
                              <div className="small text-muted mt-1">
                                <i className="bi bi-chat"></i> "{notif.motif}"
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                      
                      <div className="d-flex gap-2 mt-2 ps-5">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={(e) => handleButtonClick(e, () => validerDemande(notif.id, true))}
                          style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                        >
                          <i className="bi bi-check-circle"></i> Valider
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={(e) => handleButtonClick(e, () => {
                            const motif = prompt("Motif du rejet :");
                            if (motif) validerDemande(notif.id, false, motif);
                          })}
                          style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                        >
                          <i className="bi bi-x-circle"></i> Rejeter
                        </button>
                      </div>
                    </li>
                  ))
                )}
                
                {notifications.length > 5 && (
                  <>
                    <li><hr className="dropdown-divider" /></li>
                    <li className="dropdown-footer text-center">
                      <Link to="/demandes-validation" className="text-primary">
                        Voir les {notifications.length} demandes
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </li>
          )}

          {/* Profil */}
          <li className="nav-item dropdown pe-3">
            <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
              {user && (
                <>
                  <img 
                    key={avatarKey}
                    src={getAvatarUrl()} 
                    alt="Profile" 
                    className="rounded-circle" 
                    style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                    onError={(e) => {
                      const name = encodeURIComponent(`${user.prenom || ''} ${user.nom || ''}`.trim() || 'User');
                      e.target.src = `https://ui-avatars.com/api/?name=${name}&background=006994&color=fff&size=40&bold=true&length=2`;
                    }}
                  />
                  <span className="d-none d-md-block dropdown-toggle ps-2">
                    {user.prenom || user.nom || 'Mon compte'}
                  </span>
                </>
              )}
            </a>

            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              {user && (
                <>
                  <li className="dropdown-header">
                    <h6>{user.prenom} {user.nom}</h6>
                    <span>{getProfileLabel(user.profile)}</span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center" to="/profile">
                      <i className="bi bi-person"></i>
                      <span>Mon Profil</span>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item d-flex align-items-center" 
                      onClick={handleLogout}
                      style={{ 
                        border: 'none', 
                        background: 'none',
                        width: '100%',
                        textAlign: 'left',
                        color: '#dc3545'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8d7da'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Déconnexion</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;