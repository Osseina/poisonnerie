import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduit, deleteProduit, toggleProduitStatus } from '../../services/produitService';

const ProduitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');

  // Récupérer l'utilisateur connecté pour les permissions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isGestionnaire = currentUser.profile === 'gestionnaire';
  const isVendeur = currentUser.profile === 'vendeur';
  const canModify = isGestionnaire || isVendeur;

  useEffect(() => {
    loadProduit();
  }, [id]);

  const loadProduit = async () => {
    try {
      setLoading(true);
      const response = await getProduit(id);
      setProduit(response.produit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduit(id);
        navigate('/produits', { 
          state: { message: 'Produit supprimé avec succès' } 
        });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleProduitStatus(id, !produit.est_actif);
      await loadProduit();
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

  // Formater le poids
  const formatWeight = (weight) => {
    if (weight === null || weight === undefined || weight === '') return '0 kg';
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return '0 kg';
    
    if (numWeight >= 1000) {
      return `${(numWeight / 1000).toFixed(3)} t`;
    }
    return `${numWeight.toFixed(3)} kg`;
  };

  // Obtenir le style du badge de statut
  const getStatusStyle = (est_actif) => ({
    backgroundColor: est_actif ? '#28a745' : '#dc3545',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '8px',
    fontFamily: 'Roboto, sans-serif'
  });

  // Obtenir le style du badge de stock
  const getStockStyle = (produit) => {
    if (!produit) return { backgroundColor: '#666' };
    
    if (produit.type_vente === 'poids') {
      const stock = parseFloat(produit.stock_kg) || 0;
      const min = parseInt(produit.stock_min_kg) || 5;
      
      if (stock <= 0) return { backgroundColor: '#dc3545' };
      if (stock < min) return { backgroundColor: '#FF6F00' };
      return { backgroundColor: '#28a745' };
    } else {
      const stock = parseInt(produit.stock_unite) || 0;
      const min = parseInt(produit.stock_min_kg) || 5;
      
      if (stock <= 0) return { backgroundColor: '#dc3545' };
      if (stock < min) return { backgroundColor: '#FF6F00' };
      return { backgroundColor: '#28a745' };
    }
  };

  // Obtenir le libellé du stock
  const getStockLabel = (produit) => {
    if (!produit) return 'Stock: 0';
    
    if (produit.type_vente === 'poids') {
      const stock = parseFloat(produit.stock_kg) || 0;
      return `Stock: ${formatWeight(stock)}`;
    } else {
      const stock = parseInt(produit.stock_unite) || 0;
      return `Stock: ${stock} unité(s)`;
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
          Détails du produit
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
          Détails du produit
        </h1>
        <div className="alert alert-danger" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          {error}
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/produits')}
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

  if (!produit) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails du produit
        </h1>
        <div className="alert alert-warning" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #FFB300'
        }}>
          Produit non trouvé
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/produits')}
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
        Détails du produit
        {isVendeur && (
          <span style={{
            fontSize: '0.8rem',
            backgroundColor: '#e6f3ff',
            color: '#006994',
            padding: '4px 10px',
            borderRadius: '20px',
            marginLeft: '15px',
            fontWeight: 'normal'
          }}>
            <i className="bi bi-person me-1"></i>
            Mode vendeur
          </span>
        )}
        {isGestionnaire && (
          <span style={{
            fontSize: '0.8rem',
            backgroundColor: '#FF6F00',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            marginLeft: '15px',
            fontWeight: 'normal'
          }}>
            <i className="bi bi-person-badge me-1"></i>
            Mode gestionnaire
          </span>
        )}
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="/produits" style={{ color: '#006994' }}>Produits</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Détails</li>
        </ol>
      </nav>

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            {/* Carte d'identité du produit */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Vague décorative en haut */}
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                opacity: 0.5
              }} />

              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                {/* Icône produit selon le type */}
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
                    <i className={`bi ${produit.type_vente === 'poids' ? 'bi-weight' : 'bi-box'}`} 
                       style={{ fontSize: '50px', color: '#006994' }}></i>
                  </div>
                  {/* Petit poisson décoratif */}
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    fontSize: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    🐟
                  </span>
                </div>
                
                {/* Nom du produit */}
                <h2 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#006994',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '5px',
                  textAlign: 'center'
                }}>
                  {produit.nom_produit}
                </h2>
                
                {/* Type de produit */}
                <span className="badge mb-2" style={{
                  backgroundColor: produit.type_vente === 'poids' ? '#006994' : '#FF6F00',
                  color: 'white',
                  padding: '5px 10px',
                  fontSize: '0.9rem'
                }}>
                  <i className={`bi ${produit.type_vente === 'poids' ? 'bi-weight' : 'bi-box'} me-1`}></i>
                  {produit.type_vente === 'poids' ? 'Vente au poids' : 'Vente à l\'unité'}
                </span>
                
                {/* Code produit */}
                {produit.code_produit && (
                  <p style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem',
                    marginBottom: '10px'
                  }}>
                    <code>{produit.code_produit}</code>
                  </p>
                )}

                {/* Badges */}
                <div className="mt-2 d-flex gap-2 flex-wrap justify-content-center">
                  <span 
                    className="badge"
                    style={getStatusStyle(produit.est_actif)}
                  >
                    <i className={`bi ${produit.est_actif ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                    {produit.est_actif ? 'Actif' : 'Inactif'}
                  </span>
                  
                  <span 
                    className="badge"
                    style={getStockStyle(produit)}
                  >
                    <i className="bi bi-box me-1"></i>
                    {getStockLabel(produit)}
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
                      onClick={() => navigate('/produits')}
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
                      onMouseEnter={(e) => {
                        setShowTooltip('back');
                        e.target.style.backgroundColor = '#0056b3';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        setShowTooltip('');
                        e.target.style.backgroundColor = '#006994';
                        e.target.style.transform = 'scale(1)';
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
                        onClick={() => navigate(`/produits/edit/${produit.id}`)}
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
                        onMouseEnter={(e) => {
                          setShowTooltip('edit');
                          e.target.style.backgroundColor = '#FFB300';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          setShowTooltip('');
                          e.target.style.backgroundColor = '#FF6F00';
                          e.target.style.transform = 'scale(1)';
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
                          backgroundColor: produit.est_actif ? '#dc3545' : '#28a745',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          setShowTooltip('status');
                          e.target.style.backgroundColor = produit.est_actif ? '#c82333' : '#218838';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          setShowTooltip('');
                          e.target.style.backgroundColor = produit.est_actif ? '#dc3545' : '#28a745';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <i className={`bi ${produit.est_actif ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
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
                          {produit.est_actif ? 'Désactiver' : 'Activer'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bouton Supprimer (seulement gestionnaire) */}
                  {isGestionnaire && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={handleDelete}
                        onMouseEnter={() => setShowTooltip('delete')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          setShowTooltip('delete');
                          e.target.style.backgroundColor = '#c82333';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          setShowTooltip('');
                          e.target.style.backgroundColor = '#dc3545';
                          e.target.style.transform = 'scale(1)';
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
                          Supprimer
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Vague décorative en bas */}
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                opacity: 0.3
              }} />
            </div>
          </div>

          <div className="col-xl-8">
            {/* Informations détaillées */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Vague décorative en haut */}
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }} />

              <div className="card-body pt-3">
                <h5 className="card-title" style={{
                  color: '#006994',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  <i className="bi bi-info-circle me-2" style={{ color: '#FF6F00' }}></i>
                  Informations détaillées
                </h5>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-upc-scan me-2"></i>
                    Code produit
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    {produit.code_produit || (
                      <span className="text-muted">Généré automatiquement</span>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-tag me-2"></i>
                    Nom produit
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    <strong>{produit.nom_produit}</strong>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-tags me-2"></i>
                    Catégorie
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    {produit.nom_categorie || (
                      <span className="text-muted">Non catégorisé</span>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-box me-2"></i>
                    Stock actuel
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    <span className="badge" style={{
                      ...getStockStyle(produit),
                      fontSize: '1rem',
                      padding: '5px 15px'
                    }}>
                      {getStockLabel(produit)}
                    </span>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Seuil d'alerte
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    {produit.type_vente === 'poids' 
                      ? formatWeight(produit.stock_min_kg)
                      : `${produit.stock_min_kg || 5} unité(s)`}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-truck me-2"></i>
                    Fournisseur
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    {produit.fournisseur_nom ? (
                      <button
                        className="btn btn-link p-0"
                        onClick={() => navigate(`/fournisseurs/${produit.fournisseur_id}`)}
                        style={{ color: '#FF6F00', textDecoration: 'none' }}
                      >
                        {produit.fournisseur_nom}
                        <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.8rem' }}></i>
                      </button>
                    ) : (
                      <span className="text-muted">Aucun fournisseur</span>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-3 col-md-4 label" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#006994',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-calendar-plus me-2"></i>
                    Créé le
                  </div>
                  <div className="col-lg-9 col-md-8" style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#333333'
                  }}>
                    <i className="bi bi-calendar3 me-1" style={{ color: '#28a745' }}></i>
                    {formatDate(produit.created_at)}
                    {produit.createur_nom && (
                      <span className="text-muted ms-2">
                        par {produit.createur_prenom} {produit.createur_nom}
                      </span>
                    )}
                  </div>
                </div>

                {produit.updated_at && (
                  <div className="row mb-3">
                    <div className="col-lg-3 col-md-4 label" style={{
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#006994',
                      fontWeight: 'bold'
                    }}>
                      <i className="bi bi-pencil-square me-2"></i>
                      Dernière modif.
                    </div>
                    <div className="col-lg-9 col-md-8" style={{
                      fontFamily: 'Roboto, sans-serif',
                      color: '#333333'
                    }}>
                      <i className="bi bi-clock me-1" style={{ color: '#FF6F00' }}></i>
                      {formatDate(produit.updated_at)}
                    </div>
                  </div>
                )}

                {/* Message pour les vendeurs */}
                {isVendeur && (
                  <div className="alert alert-info mt-3" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #40C4FF',
                    backgroundColor: '#e6f3ff',
                    fontSize: '0.9rem'
                  }}>
                    <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
                    Les prix d'achat et de vente sont gérés dans les mouvements de stock.
                  </div>
                )}
              </div>

              {/* Vague décorative en bas */}
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                opacity: 0.3
              }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProduitDetails;