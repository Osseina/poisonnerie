import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCommande, changeStatut, annulerCommande } from '../../services/commandeService';

const CommandeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [showChangeStatut, setShowChangeStatut] = useState(false);
  const [activeTab, setActiveTab] = useState('infos'); // 'infos', 'client', 'articles', 'historique'

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canModify = ['admin', 'gestionnaire', 'vendeur'].includes(currentUser.profile);

  // Définition des statuts
  const STATUTS_COMMANDE = {
    EN_ATTENTE: { value: 'en_attente', label: 'En attente', color: '#ffc107', icon: 'bi-hourglass-split' },
    LIVREE: { value: 'livree', label: 'Livrée', color: '#28a745', icon: 'bi-check-circle' },
    ANNULEE: { value: 'annulee', label: 'Annulée', color: '#dc3545', icon: 'bi-x-circle' }
  };

  useEffect(() => {
    loadCommande();
  }, [id]);

  const loadCommande = async () => {
    try {
      setLoading(true);
      const response = await getCommande(id);
      setCommande(response.commande);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatut = async (nouveauStatut) => {
    try {
      await changeStatut(id, nouveauStatut, commentaire);
      await loadCommande();
      setShowChangeStatut(false);
      setCommentaire('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnnuler = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        await annulerCommande(id, 'Annulation manuelle');
        await loadCommande();
      } catch (err) {
        setError(err.message);
      }
    }
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const getStatutInfo = (statut) => {
    switch(statut) {
      case 'en_attente':
        return STATUTS_COMMANDE.EN_ATTENTE;
      case 'livree':
        return STATUTS_COMMANDE.LIVREE;
      case 'annulee':
        return STATUTS_COMMANDE.ANNULEE;
      default:
        return STATUTS_COMMANDE.EN_ATTENTE;
    }
  };

  const statutActuel = getStatutInfo(commande?.statut);

  const statutsSuivants = {
    'en_attente': ['livree', 'annulee'],
    'livree': [],
    'annulee': []
  };

  const prochainsStatuts = statutsSuivants[commande?.statut] || [];

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails de la commande
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
          Détails de la commande
        </h1>
        <div className="alert alert-danger" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          {error}
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/commandes')}
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

  if (!commande) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Détails de la commande
        </h1>
        <div className="alert alert-warning" role="alert" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #FFB300'
        }}>
          Commande non trouvée
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/commandes')}
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
      <div className="d-flex justify-content-between align-items-center">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Commande {commande.numero_commande}
        </h1>
        
        {/* Badge Commande/Vente */}
        {commande.est_facturee == 1 && (
          <span className="badge" style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            fontSize: '1rem',
            borderRadius: '8px'
          }}>
            <i className="bi bi-check-circle-fill me-2"></i>
            FACTURÉE - VENTE
          </span>
        )}
      </div>

      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/commandes" style={{ color: '#006994' }}>Commandes</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Détails</li>
        </ol>
      </nav>

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            {/* Carte de commande */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
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
                    <i className="bi bi-receipt" style={{ fontSize: '60px', color: '#006994' }}></i>
                  </div>
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    fontSize: '20px'
                  }}>
                    🐟
                  </span>
                </div>
                
                <h2 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#006994',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '5px'
                }}>
                  {commande.numero_commande}
                </h2>
                
                <h3 style={{ marginBottom: '10px' }}>
                  <span 
                    className="badge"
                    style={{
                      backgroundColor: statutActuel.color,
                      color: 'white',
                      fontFamily: 'Montserrat, sans-serif',
                      padding: '8px 15px',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <i className={`bi ${statutActuel.icon} me-2`}></i>
                    {statutActuel.label}
                  </span>
                </h3>
                
                <div className="mt-2">
                  <span 
                    className="badge"
                    style={{
                      backgroundColor: commande.est_facturee == 1 ? '#66BB6A' : '#6c757d',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontFamily: 'Roboto, sans-serif'
                    }}
                  >
                    <i className={`bi ${commande.est_facturee == 1 ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                    {commande.est_facturee == 1 ? 'Facturée' : 'Non facturée'}
                  </span>
                </div>

                {/* Barre d'actions sous l'icône */}
                <div className="d-flex gap-2 mt-4 pt-3 border-top w-100 justify-content-center" style={{
                  borderTopColor: '#f0f0f0'
                }}>
                  {/* Bouton Retour */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn btn-sm"
                      onClick={() => navigate('/commandes')}
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
                      <Tooltip text="Retour à la liste" />
                    )}
                  </div>

                  {/* Bouton Modifier (si modifiable) */}
                  {canModify && commande.statut !== 'livree' && commande.statut !== 'annulee' && commande.est_facturee != 1 && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={() => navigate(`/commandes/edit/${commande.id}`)}
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
                        <Tooltip text="Modifier la commande" />
                      )}
                    </div>
                  )}

                  {/* Bouton Changer statut */}
                  {canModify && prochainsStatuts.length > 0 && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={() => setShowChangeStatut(!showChangeStatut)}
                        onMouseEnter={() => setShowTooltip('status')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: '#40C4FF',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <i className="bi bi-arrow-repeat"></i>
                      </button>
                      {showTooltip === 'status' && (
                        <Tooltip text="Changer le statut" />
                      )}
                    </div>
                  )}

                  {/* Bouton Annuler */}
                  {canModify && commande.statut !== 'livree' && commande.statut !== 'annulee' && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn btn-sm"
                        onClick={handleAnnuler}
                        onMouseEnter={() => setShowTooltip('cancel')}
                        onMouseLeave={() => setShowTooltip('')}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '8px 12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                      {showTooltip === 'cancel' && (
                        <Tooltip text="Annuler la commande" />
                      )}
                    </div>
                  )}
                </div>

                {/* Panneau de changement de statut */}
                {showChangeStatut && (
                  <div className="mt-3 p-3 w-100" style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <h6 className="mb-2" style={{ color: '#006994' }}>Changer le statut :</h6>
                    {prochainsStatuts.map(statut => {
                      const info = getStatutInfo(statut);
                      return (
                        <button
                          key={statut}
                          className="btn w-100 mb-2"
                          style={{
                            backgroundColor: info.color,
                            color: 'white',
                            borderRadius: '8px',
                            border: 'none',
                            padding: '8px'
                          }}
                          onClick={() => handleChangeStatut(statut)}
                        >
                          <i className={`bi ${info.icon} me-2`}></i>
                          {info.label}
                        </button>
                      );
                    })}
                    <button
                      className="btn btn-secondary w-100"
                      onClick={() => setShowChangeStatut(false)}
                      style={{ borderRadius: '8px' }}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-8">
            {/* Informations détaillées avec onglets */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body pt-3">
                {/* Onglets */}
                <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'infos' ? 'active' : ''}`}
                      onClick={() => setActiveTab('infos')}
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
                      className={`nav-link ${activeTab === 'client' ? 'active' : ''}`}
                      onClick={() => setActiveTab('client')}
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      <i className="bi bi-person me-2"></i>
                      Client
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'articles' ? 'active' : ''}`}
                      onClick={() => setActiveTab('articles')}
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      <i className="bi bi-cart me-2"></i>
                      Articles
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'historique' ? 'active' : ''}`}
                      onClick={() => setActiveTab('historique')}
                      style={{
                        color: '#006994',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      <i className="bi bi-clock-history me-2"></i>
                      Historique
                    </button>
                  </li>
                </ul>

                <div className="tab-content pt-3">
                  {/* Onglet Informations */}
                  {activeTab === 'infos' && (
                    <div className="tab-pane fade show active">
                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-calendar me-2"></i>
                          Créée le
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {formatDate(commande.created_at)}
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-person-badge me-2"></i>
                          Vendeur
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {commande.vendeur_nom || 'Inconnu'}
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-shop me-2"></i>
                          Type commande
                        </div>
                        <div className="col-lg-9 col-md-8">
                          <span className="badge" style={{
                            backgroundColor: commande.type_commande === 'en_ligne' ? '#40C4FF' : '#6c757d',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '8px'
                          }}>
                            {commande.type_commande === 'en_ligne' ? 'En ligne' : 'Boutique'}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-geo-alt me-2"></i>
                          Adresse livraison
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {commande.adresse_livraison || 'Non renseignée'}<br />
                          {commande.ville_livraison && <small className="text-muted">{commande.ville_livraison}</small>}
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-chat me-2"></i>
                          Notes
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {commande.notes || 'Aucune note'}
                        </div>
                      </div>

                      {commande.updated_at && commande.updated_at !== commande.created_at && (
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
                            {formatDate(commande.updated_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Onglet Client */}
                  {activeTab === 'client' && (
                    <div className="tab-pane fade show active">
                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-person-circle me-2"></i>
                          Nom
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {commande.client_nom || 'Client inconnu'}
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-telephone me-2"></i>
                          Téléphone
                        </div>
                        <div className="col-lg-9 col-md-8" style={{
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}>
                          {commande.client_telephone || 'Non renseigné'}
                          {commande.client_telephone && (
                            <a href={`tel:${commande.client_telephone}`} className="ms-2" style={{ color: '#FF6F00' }}>
                              <i className="bi bi-telephone-forward"></i>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-lg-3 col-md-4 label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-envelope me-2"></i>
                          Email
                        </div>
                        <div className="col-lg-9 col-md-8">
                          {commande.client_email ? (
                            <a href={`mailto:${commande.client_email}`} style={{
                              color: '#FF6F00',
                              textDecoration: 'none',
                              fontFamily: 'Roboto, sans-serif'
                            }}>
                              {commande.client_email}
                              <i className="bi bi-box-arrow-up-right ms-2" style={{ fontSize: '0.8rem' }}></i>
                            </a>
                          ) : 'Non renseigné'}
                        </div>
                      </div>

                      {commande.client_id && (
                        <div className="mt-3">
                          <button
                            className="btn btn-sm"
                            onClick={() => navigate(`/clients/${commande.client_id}`)}
                            style={{
                              backgroundColor: '#006994',
                              color: 'white',
                              borderRadius: '8px',
                              border: 'none',
                              padding: '8px 15px'
                            }}
                          >
                            <i className="bi bi-person-lines-fill me-2"></i>
                            Voir la fiche client
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Onglet Articles */}
                  {activeTab === 'articles' && (
                    <div className="tab-pane fade show active">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Produit</th>
                              <th className="text-center">Qté</th>
                              <th className="text-end">Prix unit.</th>
                              <th className="text-end">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {commande.articles?.map((article, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{article.nom_produit}</strong>
                                  {article.code_produit && (
                                    <small className="d-block text-muted">{article.code_produit}</small>
                                  )}
                                </td>
                                <td className="text-center">
                                  <span className="badge" style={{ backgroundColor: '#e9ecef', color: '#333' }}>
                                    {article.quantite} {article.type_vente === 'poids' ? 'kg' : 'unité(s)'}
                                  </span>
                                </td>
                                <td className="text-end">{formatPrice(article.prix_unitaire)}</td>
                                <td className="text-end fw-bold" style={{ color: '#006994' }}>
                                  {formatPrice(article.total_ligne)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totaux */}
                      <div className="row mt-3">
                        <div className="col-md-6 offset-md-6">
                          <table className="table table-sm">
                            <tbody>
                              <tr>
                                <td>Sous-total</td>
                                <td className="text-end">{formatPrice(commande.sous_total)}</td>
                              </tr>
                              {commande.frais_livraison > 0 && (
                                <tr>
                                  <td>Frais livraison</td>
                                  <td className="text-end">{formatPrice(commande.frais_livraison)}</td>
                                </tr>
                              )}
                              {commande.remise > 0 && (
                                <tr>
                                  <td>Remise</td>
                                  <td className="text-end text-danger">-{formatPrice(commande.remise)}</td>
                                </tr>
                              )}
                              <tr className="fw-bold">
                                <td>TOTAL</td>
                                <td className="text-end" style={{ color: '#006994', fontSize: '1.2rem' }}>
                                  {formatPrice(commande.total)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Historique */}
                  {activeTab === 'historique' && (
                    <div className="tab-pane fade show active">
                      {commande.historique && commande.historique.length > 0 ? (
                        <div className="timeline">
                          {commande.historique.map((item, idx) => {
                            const statut = getStatutInfo(item.statut);
                            return (
                              <div key={idx} className="d-flex mb-3">
                                <div className="me-3">
                                  <span className="badge" style={{
                                    backgroundColor: statut.color,
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}>
                                    <i className={`bi ${statut.icon}`} style={{ color: 'white', fontSize: '1.2rem' }}></i>
                                  </span>
                                </div>
                                <div>
                                  <p className="mb-1">
                                    <strong>{statut.label}</strong>
                                    {item.commentaire && <span className="text-muted"> - {item.commentaire}</span>}
                                  </p>
                                  <small className="text-muted">
                                    {formatDate(item.changed_at)} par {item.changeur_nom || 'Système'}
                                  </small>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted text-center py-3">
                          <i className="bi bi-clock-history me-2"></i>
                          Aucun historique disponible
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Composant Tooltip réutilisable
const Tooltip = ({ text }) => (
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
    {text}
  </div>
);

export default CommandeDetails;