import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategorie, deleteCategorie, toggleCategorieStatus } from '../../services/categorieService';

const CategorieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categorie, setCategorie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');

  // Récupérer l'utilisateur connecté pour les permissions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.profile === 'admin';
  const isGestionnaire = currentUser.profile === 'gestionnaire';
  const canModify = isAdmin || isGestionnaire;

  useEffect(() => {
    loadCategorie();
  }, [id]);

  const loadCategorie = async () => {
    try {
      setLoading(true);
      const response = await getCategorie(id);
      setCategorie(response.categorie);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await deleteCategorie(id);
        navigate('/categories', { 
          state: { message: 'Catégorie supprimée avec succès' } 
        });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleCategorieStatus(id, !categorie.est_actif);
      await loadCategorie();
    } catch (err) {
      setError(err.message);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir le style du badge de statut
  const getStatusStyle = (est_actif) => ({
    backgroundColor: est_actif ? '#66BB6A' : '#dc3545',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '8px',
    fontFamily: 'Roboto, sans-serif'
  });

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails de la catégorie
        </h1>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails de la catégorie
        </h1>
        <div className="alert alert-danger" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          {error}
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/categories')}
          style={{
            backgroundColor: '#006994',
            color: 'white',
            borderRadius: '8px',
            fontFamily: 'Montserrat, sans-serif',
            border: 'none',
            padding: '10px 20px'
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!categorie) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails de la catégorie
        </h1>
        <div className="alert alert-warning" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #FFB300'
        }}>
          Catégorie non trouvée
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/categories')}
          style={{
            backgroundColor: '#006994',
            color: 'white',
            borderRadius: '8px',
            fontFamily: 'Montserrat, sans-serif',
            border: 'none',
            padding: '10px 20px'
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </button>
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
        Détails de la catégorie
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/categories" style={{ color: '#006994' }}>Catégories</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Détails</li>
        </ol>
      </nav>

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            {/* Carte d'identité de la catégorie */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                {/* Icône catégorie */}
                <div style={{
                  position: 'relative',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #006994'
                  }}>
                    <i className="bi bi-tags" style={{ fontSize: '50px', color: '#006994' }}></i>
                  </div>
                  {/* Petit poisson décoratif */}
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    fontSize: '20px'
                  }}>
                    🐟
                  </span>
                </div>
                
                {/* Nom de la catégorie */}
                <h2 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#006994',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '5px',
                  textAlign: 'center'
                }}>
                  {categorie.nom_categorie}
                </h2>
                
                {/* Badge de statut */}
                <div className="mt-2">
                  <span 
                    className="badge"
                    style={getStatusStyle(categorie.est_actif)}
                  >
                    {categorie.est_actif ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Nombre de produits */}
                <div className="mt-3">
                  <span className="badge bg-info" style={{
                    padding: '8px 15px',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-box me-1"></i>
                    {categorie.nombre_produits || 0} produit(s)
                  </span>
                </div>

                {/* Barre d'actions sous la photo */}
                <div className="d-flex gap-2 mt-4 pt-3 border-top w-100 justify-content-center" style={{
                  borderTopColor: '#f0f0f0'
                }}>
                  {/* Bouton Retour */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn btn-sm"
                      onClick={() => navigate('/categories')}
                      onMouseEnter={() => setShowTooltip('back')}
                      onMouseLeave={() => setShowTooltip('')}
                      style={{
                        backgroundColor: '#006994',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        padding: '8px 12px',
                        transition: 'all 0.3s'
                      }}
                    >
                      <i className="bi bi-arrow-left"></i>
                    </button>
                    {showTooltip === 'back' && (
                      <div style={{
                        position: 'absolute',
                        top: '-35px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#333',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        zIndex: 1000
                      }}>
                        Retour
                      </div>
                    )}
                  </div>

                  {/* Bouton Modifier */}
                  {canModify && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={() => navigate(`/categories/edit/${categorie.id}`)}
                        onMouseEnter={() => setShowTooltip('edit')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: '#FF6F00',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      {showTooltip === 'edit' && (
                        <div style={{
                          position: 'absolute',
                          top: '-35px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1000
                        }}>
                          Modifier
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bouton Activer/Désactiver */}
                  {canModify && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={handleToggleStatus}
                        onMouseEnter={() => setShowTooltip('status')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: categorie.est_actif ? '#dc3545' : '#66BB6A',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <i className={`bi ${categorie.est_actif ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                      </button>
                      {showTooltip === 'status' && (
                        <div style={{
                          position: 'absolute',
                          top: '-35px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1000
                        }}>
                          {categorie.est_actif ? 'Désactiver' : 'Activer'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bouton Supprimer (désactivé s'il y a des produits) */}
                  {isAdmin && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={handleDelete}
                        disabled={categorie.nombre_produits > 0}
                        onMouseEnter={() => setShowTooltip('delete')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: categorie.nombre_produits > 0 ? '#ccc' : '#dc3545',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s',
                          cursor: categorie.nombre_produits > 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                      {showTooltip === 'delete' && (
                        <div style={{
                          position: 'absolute',
                          top: '-35px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1000
                        }}>
                          {categorie.nombre_produits > 0 
                            ? 'Impossible - contient des produits' 
                            : 'Supprimer'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-8">
            {/* Informations détaillées */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body pt-3">
                <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                  <li className="nav-item">
                    <button 
                      className="nav-link active" 
                      data-bs-toggle="tab" 
                      data-bs-target="#info"
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      Informations
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className="nav-link" 
                      data-bs-toggle="tab" 
                      data-bs-target="#produits"
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      <i className="bi bi-box me-2"></i>
                      Produits ({categorie.nombre_produits || 0})
                    </button>
                  </li>
                </ul>

                <div className="tab-content pt-3">
                  {/* Onglet Informations */}
                  <div className="tab-pane fade show active" id="info">
                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-tag me-2"></i>
                        Nom
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {categorie.nom_categorie}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-text-paragraph me-2"></i>
                        Description
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {categorie.description || 'Aucune description'}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-3 col-md-4 label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-calendar-check me-2"></i>
                        Date création
                      </div>
                      <div className="col-lg-9 col-md-8" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#333333'
                      }}>
                        {formatDate(categorie.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Onglet Produits */}
                  <div className="tab-pane fade" id="produits">
                    {categorie.produits && categorie.produits.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Code</th>
                              <th>Nom</th>
                              <th>Prix</th>
                              <th>Statut</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {categorie.produits.map(produit => (
                              <tr key={produit.id}>
                                <td><code>{produit.code_produit}</code></td>
                                <td>{produit.nom_produit}</td>
                                <td>{produit.prix_vente} FCFA</td>
                                <td>
                                  <span className={`badge ${produit.est_actif ? 'bg-success' : 'bg-danger'}`}>
                                    {produit.est_actif ? 'Actif' : 'Inactif'}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => navigate(`/produits/${produit.id}`)}
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {categorie.nombre_produits > 20 && (
                          <p className="text-center mt-3">
                            <button 
                              className="btn btn-link"
                              onClick={() => navigate('/produits', { state: { categorie_id: categorie.id } })}
                            >
                              Voir tous les produits de cette catégorie
                            </button>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-4" style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#666'
                      }}>
                        Aucun produit dans cette catégorie
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategorieDetails;