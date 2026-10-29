import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduit, updateProduit, getFournisseurs, getCategories } from '../../services/produitService';

const ProduitEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [typeVente, setTypeVente] = useState('poids');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nom_produit: '',
    // Seuils d'alerte
    stock_min_kg: '5',
    stock_max_kg: '100',
    // Communs
    fournisseur_id: '',
    categorie_id: '',
    est_actif: true
  });

  // Récupérer l'utilisateur connecté pour les permissions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = ['gestionnaire', 'vendeur'].includes(currentUser.profile);

  useEffect(() => {
    if (!canEdit) {
      navigate('/produits');
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Charger le produit, les fournisseurs et les catégories en parallèle
      const [produitRes, fournisseursRes, categoriesRes] = await Promise.all([
        getProduit(id),
        getFournisseurs(),
        getCategories()
      ]);
      
      const produit = produitRes.produit;
      setTypeVente(produit.type_vente || 'poids');
      
      setFormData({
        nom_produit: produit.nom_produit || '',
        stock_min_kg: produit.stock_min_kg || '5',
        stock_max_kg: produit.stock_max_kg || '100',
        fournisseur_id: produit.fournisseur_id || '',
        categorie_id: produit.categorie_id || '',
        est_actif: produit.est_actif == 1
      });
      
      setFournisseurs(fournisseursRes);
      setCategories(categoriesRes);
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
    if (!formData.nom_produit.trim()) {
      setError('Le nom du produit est requis');
      setSubmitting(false);
      return;
    }

    try {
      // Préparer les données (SANS LES PRIX)
      const dataToSend = {
        nom_produit: formData.nom_produit,
        fournisseur_id: formData.fournisseur_id ? parseInt(formData.fournisseur_id) : null,
        categorie_id: formData.categorie_id ? parseInt(formData.categorie_id) : null,
        est_actif: formData.est_actif ? 1 : 0,
        // Seuils d'alerte (communs aux deux types)
        stock_min_kg: parseInt(formData.stock_min_kg) || 5,
        stock_max_kg: parseInt(formData.stock_max_kg) || 100
      };

      await updateProduit(id, dataToSend);
      setSuccess('Produit modifié avec succès !');
      setTimeout(() => {
        navigate(`/produits/${id}`);
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
          Modification produit
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
        Modifier le produit
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="/produits" style={{ color: '#006994' }}>Produits</a></li>
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
                    <i className="bi bi-box" style={{ fontSize: '40px', color: '#006994' }}></i>
                  </div>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontSize: '1.5rem'
                  }}>
                    Modifier : {formData.nom_produit}
                  </h2>
                  <p style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Les prix sont gérés dans les entrées de stock
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
                  {/* Statut et nom */}
                  <div className="row mb-4">
                    <div className="col-md-8">
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
                          padding: '12px'
                        }}
                      />
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

                  {/* Type de vente (lecture seule) */}
                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: '#006994' }}>
                      <i className="bi bi-tag me-2"></i>
                      Type de vente
                    </label>
                    <div>
                      <span className="badge" style={{
                        backgroundColor: typeVente === 'poids' ? '#006994' : '#FF6F00',
                        color: 'white',
                        padding: '8px 15px',
                        fontSize: '0.9rem'
                      }}>
                        <i className={`bi ${typeVente === 'poids' ? 'bi-weight' : 'bi-box'} me-1`}></i>
                        {typeVente === 'poids' ? 'Vente au poids (kilos)' : 'Vente à l\'unité'}
                      </span>
                      <small className="text-muted d-block mt-1">
                        <i className="bi bi-info-circle me-1"></i>
                        Le type de vente ne peut pas être modifié
                      </small>
                    </div>
                  </div>

                  {/* Seuils d'alerte */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Stock minimum d'alerte
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
                      <small className="text-muted">
                        {typeVente === 'poids' ? 'En kilos' : 'En unités'}
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: '#006994' }}>
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Stock maximum d'alerte
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
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
                    Les prix et les quantités en stock sont gérés dans les mouvements de stock.
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/produits/${id}`)}
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
                      disabled={submitting}
                      style={{
                        backgroundColor: '#FF6F00',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '10px 30px',
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

export default ProduitEdit;