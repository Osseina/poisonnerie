import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFournisseur, updateFournisseur } from '../../services/fournisseurService';

const FournisseurEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nom_societe: '',
    nom_contact: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: 'Niger',
    nif: '',
    rccm: '',
    est_actif: true
  });

  // Récupérer l'utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isGestionnaire = currentUser.profile === 'gestionnaire';

  // Formatage du téléphone Niger (sans restriction de préfixe)
  const formatTelephone = (value) => {
    let numbers = value.replace(/\D/g, '');
    
    if (numbers.startsWith('227')) {
      numbers = numbers.substring(3);
    }
    
    // Limiter à 8 chiffres pour le formatage visuel
    numbers = numbers.substring(0, 8);
    
    // Formater en groupes de 2 chiffres si on a 8 chiffres
    if (numbers.length === 8) {
      return numbers.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    } else if (numbers.length > 4) {
      return numbers.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3');
    } else if (numbers.length > 2) {
      return numbers.replace(/(\d{2})(\d{2})/, '$1 $2');
    }
    return numbers;
  };

  useEffect(() => {
    if (!isGestionnaire) {
      navigate('/fournisseurs');
      return;
    }
    loadFournisseur();
  }, [id]);

  const loadFournisseur = async () => {
    try {
      setLoading(true);
      const response = await getFournisseur(id);
      const fournisseur = response.fournisseur;
      
      // Formater le téléphone pour l'affichage
      let telephone = fournisseur.telephone || '';
      telephone = telephone.replace('+227', '');
      telephone = telephone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      
      setFormData({
        nom_societe: fournisseur.nom_societe || '',
        nom_contact: fournisseur.nom_contact || '',
        email: fournisseur.email || '',
        telephone: telephone,
        adresse: fournisseur.adresse || '',
        ville: fournisseur.ville || '',
        pays: fournisseur.pays || 'Niger',
        nif: fournisseur.nif || '',
        rccm: fournisseur.rccm || '',
        est_actif: fournisseur.est_actif == 1
      });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'telephone') {
      setFormData(prev => ({
        ...prev,
        [name]: formatTelephone(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom_societe.trim()) {
      newErrors.nom_societe = 'Le nom de la société est requis';
    }

    if (!formData.email && !formData.telephone) {
      newErrors.email = 'Email ou téléphone requis';
      newErrors.telephone = 'Email ou téléphone requis';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email invalide';
    }

    // Validation téléphone assouplie
    if (formData.telephone) {
      const cleanPhone = formData.telephone.replace(/\s/g, '');
      if (cleanPhone.length < 8) {
        newErrors.telephone = 'Le numéro doit contenir au moins 8 chiffres';
      }
      // Plus de restriction sur le préfixe ! Tous les préfixes acceptés
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
      const updateData = {
        ...formData,
        telephone: formData.telephone ? formData.telephone.replace(/\s/g, '') : '',
        est_actif: formData.est_actif ? 1 : 0
      };
      
      await updateFournisseur(id, updateData);
      navigate(`/fournisseurs/${id}`, { 
        state: { message: 'Fournisseur modifié avec succès' } 
      });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Modification fournisseur
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
        Modifier le fournisseur
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/fournisseurs" style={{ color: '#006994' }}>Fournisseurs</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Modification</li>
        </ol>
      </nav>

      <section className="section">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
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
                right: 0
              }} />

              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-truck" style={{ fontSize: '40px', color: '#006994' }}></i>
                  </div>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontSize: '1.5rem'
                  }}>
                    Modifier {formData.nom_societe}
                  </h2>
                  <p style={{
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Modifiez les informations du fournisseur
                  </p>
                </div>

                {errors.submit && (
                  <div className="alert alert-danger d-flex align-items-center" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #dc3545'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{errors.submit}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Société et Contact */}
                  <div className="row mb-3">
                    <div className="col-md-8">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-building me-2"></i>
                        Nom de la société <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nom_societe ? 'is-invalid' : ''}`}
                        name="nom_societe"
                        value={formData.nom_societe}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                      {errors.nom_societe && (
                        <div className="invalid-feedback">{errors.nom_societe}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-toggle-on me-2"></i>
                        Statut
                      </label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="est_actif"
                          checked={formData.est_actif}
                          onChange={handleChange}
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: formData.est_actif ? '#28a745' : '#dc3545',
                            borderColor: formData.est_actif ? '#28a745' : '#dc3545',
                            width: '40px',
                            height: '20px'
                          }}
                        />
                        <label className="form-check-label ms-2" style={{ 
                          color: formData.est_actif ? '#28a745' : '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          {formData.est_actif ? 'Actif' : 'Inactif'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-person me-2"></i>
                        Nom du contact
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nom_contact ? 'is-invalid' : ''}`}
                        name="nom_contact"
                        value={formData.nom_contact}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-telephone me-2"></i>
                        Téléphone
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
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-envelope me-2"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        padding: '10px'
                      }}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Adresse */}
                  <div className="row mb-3">
                    <div className="col-md-5">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-geo-alt me-2"></i>
                        Adresse
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.adresse ? 'is-invalid' : ''}`}
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-building me-2"></i>
                        Ville
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.ville ? 'is-invalid' : ''}`}
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-flag me-2"></i>
                        Pays
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="pays"
                        value={formData.pays}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                    </div>
                  </div>

                  {/* NIF et RCCM */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-file-text me-2"></i>
                        NIF
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nif ? 'is-invalid' : ''}`}
                        name="nif"
                        value={formData.nif}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-file-text me-2"></i>
                        RCCM
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.rccm ? 'is-invalid' : ''}`}
                        name="rccm"
                        value={formData.rccm}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Message d'information */}
                  <div className="alert alert-info mb-4" style={{
                    borderRadius: '10px',
                    backgroundColor: '#e6f3ff',
                    border: 'none',
                    borderLeft: '4px solid #006994'
                  }}>
                    <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
                    Les champs marqués d'un <span className="text-danger">*</span> sont obligatoires.
                    <div className="mt-1 small">
                      <span className="text-muted">Téléphone: accepte tous les préfixes nigériens (80, 88, 87, 96, 77, 74, etc.)</span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/fournisseurs/${id}`)}
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
                      disabled={submitting}
                      style={{
                        backgroundColor: '#FF6F00',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '10px 30px',
                        border: 'none',
                        opacity: submitting ? 0.7 : 1,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s'
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
                          <span className="spinner-border spinner-border-sm me-2" />
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

export default FournisseurEdit;