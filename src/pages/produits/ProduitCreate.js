import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduit, getFournisseurs, getCategories } from '../../services/produitService';

const ProduitCreate = () => {
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Type de produit
  const [typeVente, setTypeVente] = useState('poids'); // 'poids' ou 'unite'
  
  const [formData, setFormData] = useState({
    nom_produit: '',
    // Pour produits au poids
    stock_initial_kg: '',
    stock_min_kg: '5',
    stock_max_kg: '100',
    // Pour produits à l'unité
    stock_initial_unite: '',
    stock_min_unite: '5',
    stock_max_unite: '100',
    // Communs
    fournisseur_id: '',
    categorie_id: ''
  });

  // Charger les fournisseurs et catégories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        const fournisseursData = await getFournisseurs();
        setFournisseurs(fournisseursData);
        
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

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
    if (!formData.nom_produit.trim()) {
      setError('Le nom du produit est requis');
      setLoading(false);
      return;
    }

    try {
      // Préparer les données (code généré automatiquement par le backend)
      const dataToSend = {
        nom_produit: formData.nom_produit,
        type_vente: typeVente,
        fournisseur_id: formData.fournisseur_id || null,
        categorie_id: formData.categorie_id || null,
      };

      if (typeVente === 'poids') {
        dataToSend.stock_initial = formData.stock_initial_kg ? parseFloat(formData.stock_initial_kg) : 0;
        dataToSend.stock_min_kg = parseInt(formData.stock_min_kg) || 5;
        dataToSend.stock_max_kg = parseInt(formData.stock_max_kg) || 100;
      } else {
        dataToSend.stock_initial = formData.stock_initial_unite ? parseInt(formData.stock_initial_unite) : 0;
        dataToSend.stock_min_unite = parseInt(formData.stock_min_unite) || 5;
        dataToSend.stock_max_unite = parseInt(formData.stock_max_unite) || 100;
      }

      await createProduit(dataToSend);
      setSuccess('Produit créé avec succès !');
      setTimeout(() => {
        navigate('/produits', { 
          state: { message: 'Produit créé avec succès' } 
        });
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Nouveau produit
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
        Nouveau produit
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="/produits" style={{ color: '#006994' }}>Produits</a></li>
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
                {/* En-tête */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-box" style={{ fontSize: '40px', color: '#006994' }}></i>
                  </div>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontSize: '1.5rem'
                  }}>
                    Nouveau produit
                  </h2>
                  <p style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Les prix seront saisis lors des entrées de stock
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
                  {/* Nom produit (seul champ obligatoire) */}
                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-tag me-2"></i>
                      Nom du produit <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="nom_produit"
                      value={formData.nom_produit}
                      onChange={handleChange}
                    
                      required
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        padding: '12px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  {/* Type de vente */}
                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-tag me-2"></i>
                      Type de vente
                    </label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="typeVente"
                          id="typePoids"
                          checked={typeVente === 'poids'}
                          onChange={() => setTypeVente('poids')}
                          style={{ borderColor: '#006994' }}
                        />
                        <label className="form-check-label" htmlFor="typePoids">
                          <i className="bi bi-weight me-1" style={{ color: '#006994' }}></i>
                          Au poids (kg)
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="typeVente"
                          id="typeUnite"
                          checked={typeVente === 'unite'}
                          onChange={() => setTypeVente('unite')}
                          style={{ borderColor: '#006994' }}
                        />
                        <label className="form-check-label" htmlFor="typeUnite">
                          <i className="bi bi-box me-1" style={{ color: '#006994' }}></i>
                          À l'unité
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Gestion du stock */}
                  <div className="mb-4">
                    <h6 className="mb-3" style={{ color: '#006994', fontWeight: 'bold' }}>
                      <i className="bi bi-bar-chart me-2"></i>
                      Gestion du stock
                    </h6>
                    
                    {typeVente === 'poids' ? (
                      // Produits au poids
                      <div className="row">
                        <div className="col-md-4 mb-2">
                          <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                            Stock initial (kg)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="stock_initial_kg"
                            value={formData.stock_initial_kg}
                            onChange={handleChange}
                            min="0"
                            step="0.001"
                            placeholder="0"
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                            Stock minimum (kg)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="stock_min_kg"
                            value={formData.stock_min_kg}
                            onChange={handleChange}
                            min="0"
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                            Stock maximum (kg)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="stock_max_kg"
                            value={formData.stock_max_kg}
                            onChange={handleChange}
                            min="0"
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      // Produits à l'unité
                      <div className="row">
                        <div className="col-md-4 mb-2">
                          <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                            Stock initial
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="stock_initial_unite"
                            value={formData.stock_initial_unite}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            placeholder="0"
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                            Stock minimum
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="stock_min_unite"
                            value={formData.stock_min_unite}
                            onChange={handleChange}
                            min="0"
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label fw-bold" style={{ color: '#006994', fontSize: '0.9rem' }}>
                            Stock maximum
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="stock_max_unite"
                            value={formData.stock_max_unite}
                            onChange={handleChange}
                            min="0"
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fournisseur et Catégorie */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-truck me-2"></i>
                        Fournisseur
                      </label>
                      <select
                        className="form-select"
                        name="fournisseur_id"
                        value={formData.fournisseur_id}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px'
                        }}
                      >
                        <option value="">Sélectionner un fournisseur</option>
                        {fournisseurs.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.nom_societe}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-tags me-2"></i>
                        Catégorie
                      </label>
                      <select
                        className="form-select"
                        name="categorie_id"
                        value={formData.categorie_id}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px'
                        }}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.nom_categorie}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message d'information */}
                  <div className="alert alert-info mb-4" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #40C4FF',
                    backgroundColor: '#e6f3ff',
                    fontSize: '0.9rem',
                    padding: '10px 15px'
                  }}>
                    <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
                    Le code produit sera généré automatiquement. Les prix seront saisis lors des entrées de stock.
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/produits')}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 25px'
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
                        padding: '10px 30px',
                        border: 'none',
                        opacity: loading ? 0.7 : 1,
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
                        'Créer le produit'
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

export default ProduitCreate;