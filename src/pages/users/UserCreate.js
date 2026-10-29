import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../services/userService';

const UserCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    mot_de_passe: '',
    confirm_mot_de_passe: '',
    profile: 'vendeur' // Par défaut vendeur
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Nouveaux profils (seulement gestionnaire et vendeur)
  const profiles = [
    { 
      value: 'gestionnaire', 
      label: 'Gestionnaire', 
      color: '#FF6F00', 
      icon: 'bi-person-badge', 
      description: 'Gestion complète (peut créer des vendeurs)' 
    },
    { 
      value: 'vendeur', 
      label: 'Vendeur', 
      color: '#40C4FF', 
      icon: 'bi-cart', 
      description: 'Ventes uniquement' 
    }
  ];

  // Récupérer l'utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isGestionnaire = currentUser.profile === 'gestionnaire';

  // Filtrer les profils selon les permissions
  const getAvailableProfiles = () => {
    if (isGestionnaire) {
      // Un gestionnaire ne peut créer que des vendeurs
      return profiles.filter(p => p.value === 'vendeur');
    }
    return []; // Les vendeurs ne peuvent rien créer
  };

  const availableProfiles = getAvailableProfiles();

  // Formatage automatique du téléphone Niger
  const formatTelephone = (value) => {
    // Enlever tout sauf les chiffres
    let numbers = value.replace(/\D/g, '');
    
    // Si commence par 227, garder
    if (numbers.startsWith('227')) {
      numbers = numbers.substring(3);
    }
    
    // Limiter à 8 chiffres
    numbers = numbers.substring(0, 8);
    
    // Formater pour affichage (XX XX XX XX)
    if (numbers.length > 6) {
      return numbers.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    } else if (numbers.length > 4) {
      return numbers.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3');
    } else if (numbers.length > 2) {
      return numbers.replace(/(\d{2})(\d{2})/, '$1 $2');
    }
    return numbers;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telephone') {
      // Formater le téléphone
      const formatted = formatTelephone(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    } else if (formData.prenom.length < 2) {
      newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    }

    // Validation téléphone NIGER (+227)
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est requis';
    } else {
      // Nettoyer le numéro pour validation
      const cleanPhone = formData.telephone.replace(/\s/g, '');
      
      // Vérifier format Niger (commence par 9, 8 chiffres)
      if (!/^[9][0-9]{7}$/.test(cleanPhone)) {
        newErrors.telephone = 'Numéro invalide. Format attendu : 90 12 34 56 (doit commencer par 9)';
      }
      
      // Vérifier les opérateurs Niger
      const prefix = cleanPhone.substring(0, 2);
      const operateursValides = ['90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
      if (!operateursValides.includes(prefix)) {
        newErrors.telephone = `Préfixe invalide. Opérateurs acceptés : ${operateursValides.join(', ')}`;
      }
    }

    // Validation mot de passe
    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = 'Mot de passe requis';
    } else if (formData.mot_de_passe.length < 6) {
      newErrors.mot_de_passe = 'Minimum 6 caractères';
    } else if (!/(?=.*[0-9])/.test(formData.mot_de_passe)) {
      newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins un chiffre';
    }

    // Confirmation mot de passe
    if (formData.mot_de_passe !== formData.confirm_mot_de_passe) {
      newErrors.confirm_mot_de_passe = 'Les mots de passe ne correspondent pas';
    }

    // Vérifier que le profil est autorisé
    if (isGestionnaire && formData.profile !== 'vendeur') {
      newErrors.profile = 'Un gestionnaire ne peut créer que des vendeurs';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroller jusqu'à la première erreur
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    try {
      // Préparer les données pour l'API
      const { confirm_mot_de_passe, ...userData } = formData;
      
      // Nettoyer le téléphone (enlever les espaces)
      userData.telephone = userData.telephone.replace(/\s/g, '');
      
      // L'API ajoutera +227 automatiquement
      
      await createUser(userData);
      
      // Rediriger vers la liste avec message de succès
      navigate('/users', { 
        state: { 
          message: 'Vendeur créé avec succès',
          type: 'success'
        } 
      });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Message si pas de permissions
  if (availableProfiles.length === 0) {
    return (
      <div className="pagetitle">
        <h1 className="text-center" style={{ 
          fontFamily: 'Montserrat, sans-serif', 
          color: '#006994',
          marginBottom: '30px'
        }}>
          Création d'utilisateur
        </h1>
        <div className="alert alert-danger text-center" style={{
          borderRadius: '10px',
          padding: '20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <i className="bi bi-shield-lock-fill me-2" style={{ fontSize: '1.5rem' }}></i>
          <h5>Accès non autorisé</h5>
          <p className="mb-0">Vous n'avez pas les permissions pour créer des utilisateurs.</p>
          <p className="mt-2">
            <small>Seuls les gestionnaires peuvent créer des vendeurs.</small>
          </p>
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
        Créer un vendeur
      </h1>
      
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/" style={{ color: '#006994' }}>Accueil</a>
          </li>
          <li className="breadcrumb-item">
            <a href="/users" style={{ color: '#006994' }}>Vendeurs</a>
          </li>
          <li className="breadcrumb-item active">
            Nouveau vendeur
          </li>
        </ol>
      </nav>

      <section className="section">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="card" style={{
              borderRadius: '15px',
              boxShadow: '0 5px 20px rgba(0,105,148,0.15)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Bande décorative supérieure */}
              <div style={{
                height: '5px',
                background: 'linear-gradient(90deg, #006994, #FF6F00, #40C4FF)',
              }} />

              <div className="card-body p-4">
                {/* En-tête avec drapeau Niger */}
                <div className="text-center mb-4">
                  <div className="mb-3 d-flex justify-content-center align-items-center gap-2">
                    <i className="bi bi-person-plus-fill" style={{ 
                      fontSize: '2rem', 
                      color: '#FF6F00' 
                    }}></i>
                  </div>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontSize: '1.5rem',
                    fontWeight: '600'
                  }}>
                    Ajouter un nouveau vendeur
                  </h2>
                  <p style={{
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Remplissez les informations du vendeur (Niger)
                  </p>
                </div>

                {errors.submit && (
                  <div className="alert alert-danger d-flex align-items-center" style={{
                    borderRadius: '10px',
                    borderLeft: '4px solid #dc3545'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{errors.submit}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Ligne Nom et Prénom */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-person me-2"></i>
                        Nom <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Ex: ISSOUFOU"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                      {errors.nom && (
                        <div className="invalid-feedback">{errors.nom}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-person me-2"></i>
                        Prénom <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.prenom ? 'is-invalid' : ''}`}
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        placeholder="Ex: Ibrahim"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                      {errors.prenom && (
                        <div className="invalid-feedback">{errors.prenom}</div>
                      )}
                    </div>
                  </div>

                  {/* Téléphone (Niger) */}
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-telephone me-2"></i>
                      Numéro de téléphone <span className="text-danger">*</span>
                      <small className="text-muted ms-2">(Niger - +227)</small>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRight: 'none'
                      }}>
                        🇳🇪 +227
                      </span>
                      <input
                        type="tel"
                        className={`form-control ${errors.telephone ? 'is-invalid' : ''}`}
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="90 12 34 56"
                        style={{
                          borderRadius: '0 8px 8px 0',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                    </div>
                    {errors.telephone && (
                      <div className="text-danger mt-1 small">{errors.telephone}</div>
                    )}
                    
                    {/* Aide pour les préfixes */}
                    
                  </div>

                  {/* Profil - Caché car toujours vendeur */}
                  <input type="hidden" name="profile" value="vendeur" />

                  {/* Informations sur le rôle */}
                  <div className="alert alert-info mb-4" style={{
                    borderRadius: '10px',
                    backgroundColor: '#e6f3ff',
                    border: 'none',
                    borderLeft: '4px solid #006994'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-badge fs-4 me-3" style={{ color: '#FF6F00' }}></i>
                      <div>
                        <strong className="d-block">Rôle : Vendeur</strong>
                        <small className="text-muted">
                          Le vendeur pourra gérer les ventes mais pas créer d'autres utilisateurs.
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Ligne Mot de passe */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-lock me-2"></i>
                        Mot de passe <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.mot_de_passe ? 'is-invalid' : ''}`}
                        name="mot_de_passe"
                        value={formData.mot_de_passe}
                        onChange={handleChange}
                        placeholder="Minimum 6 caractères"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                      {errors.mot_de_passe && (
                        <div className="invalid-feedback">{errors.mot_de_passe}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-lock-fill me-2"></i>
                        Confirmation <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirm_mot_de_passe ? 'is-invalid' : ''}`}
                        name="confirm_mot_de_passe"
                        value={formData.confirm_mot_de_passe}
                        onChange={handleChange}
                        placeholder="Confirmer le mot de passe"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                      {errors.confirm_mot_de_passe && (
                        <div className="invalid-feedback">{errors.confirm_mot_de_passe}</div>
                      )}
                    </div>
                  </div>

                  {/* Indicateur de force du mot de passe */}
                  {formData.mot_de_passe && (
                    <div className="mb-3">
                      <small className="text-muted">
                        Force du mot de passe : 
                        <span className={`ms-2 ${
                          formData.mot_de_passe.length < 6 ? 'text-danger' :
                          formData.mot_de_passe.length < 8 ? 'text-warning' : 'text-success'
                        }`}>
                          {formData.mot_de_passe.length < 6 ? 'Faible' :
                           formData.mot_de_passe.length < 8 ? 'Moyen' : 'Fort'}
                        </span>
                      </small>
                      <div className="progress" style={{ height: '4px' }}>
                        <div 
                          className={`progress-bar ${
                            formData.mot_de_passe.length < 6 ? 'bg-danger' :
                            formData.mot_de_passe.length < 8 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (formData.mot_de_passe.length / 12) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/users')}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 25px'
                      }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Annuler
                    </button>
                    
                    <button
                      type="submit"
                      className="btn"
                      disabled={loading}
                      style={{
                        backgroundColor: '#FF6F00',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '10px 30px',
                        border: 'none',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.backgroundColor = '#FFB300';
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.backgroundColor = '#FF6F00';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Création...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Créer le vendeur
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserCreate;