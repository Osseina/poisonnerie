import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFournisseur } from '../../services/fournisseurService';

const FournisseurCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom_societe: '',
    nom_contact: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: 'Niger',
    nif: '',
    rccm: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    // Validation téléphone assouplie - juste vérifier qu'il y a des chiffres
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

    setLoading(true);
    try {
      const fournisseurData = {
        ...formData,
        telephone: formData.telephone ? formData.telephone.replace(/\s/g, '') : ''
      };
      
      await createFournisseur(fournisseurData);
      navigate('/fournisseurs', { 
        state: { message: 'Fournisseur créé avec succès' } 
      });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pagetitle">
      <h1 style={{ 
        fontFamily: 'Montserrat, sans-serif',
        color: '#006994',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Nouveau fournisseur
      </h1>
      
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/" style={{ color: '#006994' }}>Accueil</a>
          </li>
          <li className="breadcrumb-item">
            <a href="/fournisseurs" style={{ color: '#006994' }}>Fournisseurs</a>
          </li>
          <li className="breadcrumb-item active">
            Nouveau
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
              <div style={{
                height: '5px',
                background: 'linear-gradient(90deg, #006994, #FF6F00, #40C4FF)',
              }} />

              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-truck" style={{ 
                      fontSize: '3rem', 
                      color: '#FF6F00' 
                    }}></i>
                  </div>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontSize: '1.5rem',
                    fontWeight: '600'
                  }}>
                    Ajouter un fournisseur
                  </h2>
                  <p style={{
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Remplissez les informations ci-dessous
                  </p>
                </div>

                {errors.submit && (
                  <div className="alert alert-danger d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{errors.submit}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Société et Contact */}
                  <div className="row mb-3">
                    <div className="col-md-6">
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
                  </div>

                  {/* Contact */}
                  <div className="row mb-3">
                    <div className="col-md-6">
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

                  {/* Adresse, Ville et Pays sur la même ligne */}
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
                      onClick={() => navigate('/fournisseurs')}
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
                          Créer le fournisseur
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

export default FournisseurCreate;