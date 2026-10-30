import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategorie, updateCategorie } from '../../services/categorieService';

const CategorieEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nom_categorie: '',
    description: '',
    est_actif: true
  });

  // Récupérer l'utilisateur connecté pour les permissions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = ['gestionnaire'].includes(currentUser.profile);

  useEffect(() => {
    if (!canEdit) {
      navigate('/categories');
      return;
    }
    loadCategorie();
  }, [id]);

  const loadCategorie = async () => {
    try {
      setLoading(true);
      const response = await getCategorie(id);
      const categorie = response.categorie;
      setFormData({
        nom_categorie: categorie.nom_categorie || '',
        description: categorie.description || '',
        est_actif: categorie.est_actif == 1
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.nom_categorie.trim()) {
      setError('Le nom de la catégorie est requis');
      setSubmitting(false);
      return;
    }

    try {
      await updateCategorie(id, formData);
      setSuccess('Catégorie modifiée avec succès');
      setTimeout(() => {
        navigate(`/categories/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
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
          Modification catégorie
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
        Modifier la catégorie
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/categories" style={{ color: '#006994' }}>Catégories</a></li>
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
                {/* En-tête */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-tags" style={{ fontSize: '40px', color: '#006994' }}></i>
                  </div>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontSize: '1.5rem'
                  }}>
                    Modifier : {formData.nom_categorie}
                  </h2>
                </div>

                {error && (
                  <div className="alert alert-danger" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #dc3545'
                  }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #66BB6A'
                  }}>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-8">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-tag me-2"></i>
                        Nom de la catégorie <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="nom_categorie"
                        value={formData.nom_categorie}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
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
                          style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {formData.est_actif ? 'Active' : 'Inactive'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#006994',
                      fontWeight: 'bold'
                    }}>
                      <i className="bi bi-text-paragraph me-2"></i>
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        padding: '10px',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    />
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => navigate(`/categories/${id}`)}
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

export default CategorieEdit;