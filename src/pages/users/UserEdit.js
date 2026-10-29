import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../../services/userService';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    mot_de_passe: '',
    confirm_mot_de_passe: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [userInfo, setUserInfo] = useState(null);

  // Récupérer les infos de l'utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isGestionnaire = currentUser.profile === 'gestionnaire';

  // Formatage automatique du téléphone Niger
  const formatTelephone = (value) => {
    let numbers = value.replace(/\D/g, '');
    
    if (numbers.startsWith('227')) {
      numbers = numbers.substring(3);
    }
    
    numbers = numbers.substring(0, 8);
    
    if (numbers.length > 6) {
      return numbers.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    } else if (numbers.length > 4) {
      return numbers.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3');
    } else if (numbers.length > 2) {
      return numbers.replace(/(\d{2})(\d{2})/, '$1 $2');
    }
    return numbers;
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await getUser(id);
      const user = response.user;
      setUserInfo(user);
      
      // Formater le téléphone pour l'affichage
      let telephone = user.telephone || '';
      telephone = telephone.replace('+227', '');
      telephone = telephone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        telephone: telephone,
        mot_de_passe: '',
        confirm_mot_de_passe: ''
      });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telephone') {
      setFormData(prev => ({
        ...prev,
        [name]: formatTelephone(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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

    // Validation téléphone NIGER
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est requis';
    } else {
      const cleanPhone = formData.telephone.replace(/\s/g, '');
      
      if (!/^[9][0-9]{7}$/.test(cleanPhone)) {
        newErrors.telephone = 'Numéro invalide. Format attendu : 90 12 34 56 (doit commencer par 9)';
      }
      
      const prefix = cleanPhone.substring(0, 2);
      const operateursValides = ['90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
      if (!operateursValides.includes(prefix)) {
        newErrors.telephone = `Préfixe invalide. Opérateurs acceptés : ${operateursValides.join(', ')}`;
      }
    }

    // Validation mot de passe (optionnel)
    if (formData.mot_de_passe) {
      if (formData.mot_de_passe.length < 6) {
        newErrors.mot_de_passe = 'Minimum 6 caractères';
      } else if (!/(?=.*[0-9])/.test(formData.mot_de_passe)) {
        newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins un chiffre';
      }

      if (formData.mot_de_passe !== formData.confirm_mot_de_passe) {
        newErrors.confirm_mot_de_passe = 'Les mots de passe ne correspondent pas';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Préparer les données à envoyer
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone.replace(/\s/g, '')
      };

      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.mot_de_passe) {
        updateData.mot_de_passe = formData.mot_de_passe;
      }

      await updateUser(id, updateData);
      
      navigate('/users', { 
        state: { message: 'Vendeur modifié avec succès' } 
      });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Vérifier si l'utilisateur a les droits de modification
  const canEdit = () => {
    return isGestionnaire; // Seul le gestionnaire peut modifier
  };

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Modification vendeur
        </h1>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!canEdit()) {
    return (
      <div className="pagetitle">
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>
          Accès non autorisé
        </h1>
        <div className="alert alert-danger">
          Seuls les gestionnaires peuvent modifier les vendeurs.
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
        Modifier un vendeur
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item">
            <a href="#/" style={{ color: '#006994' }}>Accueil</a>
          </li>
          <li className="breadcrumb-item">
            <a href="#/users" style={{ color: '#006994' }}>Vendeurs</a>
          </li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>
            Modification
          </li>
        </ol>
      </nav>

      <section className="section">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            {/* Carte avec poisson décoratif */}
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
                right: 0
              }} />

              <div className="card-body p-4">
                {/* En-tête avec poisson */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <svg width="60" height="45" viewBox="0 0 60 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 22.5 C 22.5 11.25, 37.5 11.25, 45 22.5 C 37.5 33.75, 22.5 33.75, 15 22.5" fill="#006994" opacity="0.6"/>
                      <circle cx="38" cy="19" r="3" fill="#FFB300"/>
                      <path d="M10 18 L 2 14 M10 27 L 2 31" stroke="#FF6F00" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontSize: '1.5rem'
                  }}>
                    Modifier {userInfo?.prenom} {userInfo?.nom}
                  </h2>
                  <p style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Modifiez les informations du vendeur (Niger)
                  </p>
                </div>

                {errors.submit && (
                  <div className="alert alert-danger" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #dc3545'
                  }}>
                    {errors.submit}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Ligne Nom et Prénom */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-person me-2"></i>
                        Nom <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      />
                      {errors.nom && (
                        <div className="invalid-feedback">{errors.nom}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-person me-2"></i>
                        Prénom <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.prenom ? 'is-invalid' : ''}`}
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      />
                      {errors.prenom && (
                        <div className="invalid-feedback">{errors.prenom}</div>
                      )}
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="mb-3">
                    <label className="form-label" style={{
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#006994',
                      fontWeight: 'bold'
                    }}>
                      <i className="bi bi-telephone me-2"></i>
                      Numéro de téléphone <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #ddd',
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
                        style={{
                          borderRadius: '0 8px 8px 0',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      />
                    </div>
                    {errors.telephone && (
                      <div className="invalid-feedback d-block">{errors.telephone}</div>
                    )}
                    
                    
                  </div>

                  {/* Section changement de mot de passe */}
                  <div className="card mt-4 mb-3" style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    border: 'none'
                  }}>
                    <div className="card-body">

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label" style={{
                            fontFamily: 'Roboto, sans-serif',
                            color: '#333333'
                          }}>
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            className={`form-control ${errors.mot_de_passe ? 'is-invalid' : ''}`}
                            name="mot_de_passe"
                            value={formData.mot_de_passe}
                            onChange={handleChange}
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                          {errors.mot_de_passe && (
                            <div className="invalid-feedback">{errors.mot_de_passe}</div>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label" style={{
                            fontFamily: 'Roboto, sans-serif',
                            color: '#333333'
                          }}>
                            Confirmation
                          </label>
                          <input
                            type="password"
                            className={`form-control ${errors.confirm_mot_de_passe ? 'is-invalid' : ''}`}
                            name="confirm_mot_de_passe"
                            value={formData.confirm_mot_de_passe}
                            onChange={handleChange}
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                          {errors.confirm_mot_de_passe && (
                            <div className="invalid-feedback">{errors.confirm_mot_de_passe}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message d'information */}
                  <div className="alert alert-info mb-4" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #40C4FF',
                    backgroundColor: '#e6f3ff',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
                    Les champs marqués d'un <span style={{ color: '#dc3545' }}>*</span> sont obligatoires.
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => navigate('/users')}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        borderRadius: '8px',
                        fontFamily: 'Montserrat, sans-serif',
                        border: 'none',
                        padding: '10px 25px',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#5a6268';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#6c757d';
                      }}
                    >
                      Annuler
                    </button>
                    
                    <button
                      type="button"
                      className="btn me-2"
                      onClick={() => navigate(`/users/${id}`)}
                      style={{
                        backgroundColor: '#006994',
                        color: 'white',
                        borderRadius: '8px',
                        fontFamily: 'Montserrat, sans-serif',
                        border: 'none',
                        padding: '10px 25px',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#0056b3';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#006994';
                      }}
                    >
                      <i className="bi bi-eye me-2"></i>
                      Voir
                    </button>
                    
                    <button
                      type="submit"
                      className="btn"
                      disabled={submitting}
                      style={{
                        backgroundColor: '#FF6F00',
                        color: 'white',
                        borderRadius: '8px',
                        fontFamily: 'Montserrat, sans-serif',
                        border: 'none',
                        padding: '10px 25px',
                        transition: 'all 0.3s',
                        opacity: submitting ? 0.7 : 1,
                        cursor: submitting ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) {
                          e.target.style.backgroundColor = '#FFB300';
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) {
                          e.target.style.backgroundColor = '#FF6F00';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Modification...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Vague décorative en bas */}
              <div style={{
                height: '8px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0
              }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserEdit;