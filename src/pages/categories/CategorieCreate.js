import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCategorie } from '../../services/categorieService';

const CategorieCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom_categorie: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.nom_categorie.trim()) {
      setError('Le nom de la catégorie est requis');
      setLoading(false);
      return;
    }

    try {
      await createCategorie(formData);
      setSuccess('Catégorie créée avec succès !');
      setTimeout(() => {
        navigate('/categories', { 
          state: { message: 'Catégorie créée avec succès' } 
        });
      }, 1500);
    } catch (err) {
      setError(err.message);
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
        Nouvelle catégorie
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/categories" style={{ color: '#006994' }}>Catégories</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Création</li>
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
                {/* En-tête avec poisson */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-tags" style={{ fontSize: '40px', color: '#006994' }}></i>
                  </div>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontSize: '1.5rem'
                  }}>
                    Créer une nouvelle catégorie
                  </h2>
                  <p style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Les catégories permettent d'organiser vos produits
                  </p>
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
                  <div className="mb-3">
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
                      placeholder="Ex: Poissons frais, Fruits de mer, Poissons fumés..."
                      required
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        padding: '10px',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    />
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
                      placeholder="Description de la catégorie (optionnelle)..."
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        padding: '10px',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    />
                    <small style={{
                      fontFamily: 'Roboto, sans-serif',
                      color: '#666'
                    }}>
                      Décrivez brièvement cette catégorie
                    </small>
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => navigate('/categories')}
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
                      disabled={loading}
                      style={{
                        backgroundColor: '#FF6F00',
                        color: 'white',
                        borderRadius: '8px',
                        fontFamily: 'Montserrat, sans-serif',
                        border: 'none',
                        padding: '10px 25px',
                        transition: 'all 0.3s',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
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
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Création...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Créer la catégorie
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

export default CategorieCreate;