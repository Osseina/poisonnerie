import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, updateClient } from '../../services/clientService';

const ClientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    adresse: ''
  });

  // Formatage du téléphone Niger
  const formatTelephone = (value) => {
    let numbers = value.replace(/\D/g, '');
    
    if (numbers.startsWith('227')) {
      numbers = numbers.substring(3);
    }
    
    numbers = numbers.substring(0, 8);
    
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
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const response = await getClient(id);
      const client = response.client;
      
      // Formater le téléphone pour l'affichage
      let telephone = client.telephone || '';
      telephone = telephone.replace('+227', '');
      telephone = telephone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      
      setFormData({
        nom: client.nom || '',
        telephone: telephone,
        adresse: client.adresse || ''
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

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (formData.telephone) {
      const cleanPhone = formData.telephone.replace(/\s/g, '');
      if (cleanPhone.length < 8) {
        newErrors.telephone = 'Minimum 8 chiffres';
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
      const clientData = {
        nom: formData.nom,
        telephone: formData.telephone ? formData.telephone.replace(/\s/g, '') : '',
        adresse: formData.adresse
      };
      
      await updateClient(id, clientData);
      
      navigate(`/clients/${id}`, { 
        state: { message: 'Client modifié avec succès' } 
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
          Modification client
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
        Modifier le client
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/clients" style={{ color: '#006994' }}>Clients</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Modification</li>
        </ol>
      </nav>

      <section className="section">
        <div className="row">
          <div className="col-lg-10 offset-lg-1">
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
                    Modifier le client
                  </h2>
                </div>

                {errors.submit && (
                  <div className="alert alert-danger d-flex align-items-center" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #dc3545',
                    marginBottom: '20px'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{errors.submit}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 align-items-end">
                    {/* Nom */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                        <i className="bi bi-person-circle me-1"></i>
                        Nom <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
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

                    {/* Téléphone */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                        <i className="bi bi-telephone me-1"></i>
                        Téléphone
                      </label>
                      <div className="input-group">
                        <span className="input-group-text" style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          borderRight: 'none',
                          padding: '10px'
                        }}>
                          🇳🇪
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

                    {/* Adresse */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                        <i className="bi bi-geo-alt me-1"></i>
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
                  </div>

                  {/* Message d'information */}
                  <div className="alert alert-info mt-4 mb-4" style={{
                    borderRadius: '10px',
                    backgroundColor: '#e6f3ff',
                    border: 'none',
                    borderLeft: '4px solid #006994',
                    padding: '10px 15px'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
                      <small>
                        <span className="fw-bold">*</span> Champ obligatoire • 
                        Téléphone: tous les préfixes acceptés (80, 88, 87, 96, 77, 74...)
                      </small>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/clients/${id}`)}
                      style={{
                        borderRadius: '8px',
                        padding: '8px 25px'
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
                        padding: '8px 30px',
                        border: 'none',
                        opacity: submitting ? 0.7 : 1,
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
                        'Enregistrer'
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

export default ClientEdit;