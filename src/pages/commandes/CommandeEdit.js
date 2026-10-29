import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCommande, updateCommande } from '../../services/commandeService';
import { getProduitsForStock } from '../../services/stockService';

const CommandeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingProduits, setLoadingProduits] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [showClientSection, setShowClientSection] = useState(false);
  
  const [clientType, setClientType] = useState('existant');
  
  const [formData, setFormData] = useState({
    client_id: '',
    client_nom: '',
    client_telephone: '',
    client_email: '',
    type_commande: 'boutique',
    frais_livraison: 0,
    remise: 0,
    adresse_livraison: '',
    ville_livraison: '',
    articles: []
  });

  const [articleCourant, setArticleCourant] = useState({
    produit_id: '',
    quantite: 1,
    prix_unitaire: 0,
    stock_dispo: 0,
    type_vente: 'poids',
    nom_produit: ''
  });

  useEffect(() => {
    loadCommande();
    loadProduits();
    loadClients();
  }, [id]);

  // ✅ Fonction pour charger les produits avec leur dernier prix de vente
  const loadProduits = async () => {
    try {
      setLoadingProduits(true);
      // Utiliser l'endpoint spécial pour les commandes
      const response = await fetch(`${API_BASE_URL}/produits/commande.php`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const produitsData = data.data.produits;
        setProduits(produitsData.filter(p => p.stock_disponible > 0));
      }
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoadingProduits(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/list.php`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Erreur chargement clients:', err);
    }
  };

  const loadCommande = async () => {
    try {
      setLoading(true);
      const response = await getCommande(id);
      const commande = response.commande;
      
      setFormData({
        client_id: commande.client_id || '',
        client_nom: commande.client_nom || '',
        client_telephone: commande.client_telephone || '',
        client_email: commande.client_email || '',
        type_commande: commande.type_commande || 'boutique',
        frais_livraison: parseFloat(commande.frais_livraison) || 0,
        remise: parseFloat(commande.remise) || 0,
        adresse_livraison: commande.adresse_livraison || '',
        ville_livraison: commande.ville_livraison || '',
        articles: commande.articles?.map(a => ({
          produit_id: a.produit_id,
          nom_produit: a.nom_produit,
          quantite: parseFloat(a.quantite),
          prix_unitaire: parseFloat(a.prix_unitaire),
          total: parseFloat(a.total_ligne),
          type_vente: a.type_vente || 'poids',
          unite: a.type_vente === 'poids' ? 'kg' : 'unité'
        })) || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArticleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'produit_id') {
      if (!value) {
        setArticleCourant({
          produit_id: '',
          quantite: 1,
          prix_unitaire: 0,
          stock_dispo: 0,
          type_vente: 'poids',
          nom_produit: ''
        });
        return;
      }
      
      const produit = produits.find(p => p.id === parseInt(value));
      
      if (produit) {
        setArticleCourant({
          produit_id: value,
          quantite: 1,
          prix_unitaire: produit.prix_vente || 0,
          stock_dispo: produit.stock_disponible || 0,
          type_vente: produit.type_vente || 'poids',
          nom_produit: produit.nom_produit || ''
        });
      }
    } else if (name === 'quantite') {
      setArticleCourant(prev => ({ ...prev, quantite: value }));
    }
  };

  const ajouterArticle = () => {
    setError('');

    if (!articleCourant.produit_id) {
      setError('Veuillez sélectionner un produit');
      return;
    }

    let quantite;
    if (articleCourant.type_vente === 'poids') {
      quantite = parseFloat(articleCourant.quantite);
    } else {
      quantite = parseInt(articleCourant.quantite);
    }

    if (isNaN(quantite) || quantite <= 0) {
      setError('Quantité invalide');
      return;
    }

    const prix = parseFloat(articleCourant.prix_unitaire);
    if (isNaN(prix) || prix <= 0) {
      setError('Prix invalide. Le produit n\'a pas de prix de vente défini');
      return;
    }

    if (quantite > articleCourant.stock_dispo) {
      const unite = articleCourant.type_vente === 'poids' ? 'kg' : 'unité(s)';
      setError(`Stock insuffisant. Disponible: ${articleCourant.stock_dispo} ${unite}`);
      return;
    }

    const nouvelArticle = {
      produit_id: parseInt(articleCourant.produit_id),
      nom_produit: articleCourant.nom_produit,
      quantite: quantite,
      prix_unitaire: prix,
      total: quantite * prix,
      type_vente: articleCourant.type_vente,
      unite: articleCourant.type_vente === 'poids' ? 'kg' : 'unité'
    };

    setFormData(prev => ({
      ...prev,
      articles: [...prev.articles, nouvelArticle]
    }));

    setArticleCourant({
      produit_id: '',
      quantite: 1,
      prix_unitaire: 0,
      stock_dispo: 0,
      type_vente: 'poids',
      nom_produit: ''
    });
  };

  const supprimerArticle = (index) => {
    setFormData(prev => ({
      ...prev,
      articles: prev.articles.filter((_, i) => i !== index)
    }));
  };

  const calculerTotaux = () => {
    const sousTotal = formData.articles.reduce((sum, a) => sum + a.total, 0);
    const frais = parseFloat(formData.frais_livraison) || 0;
    const remise = parseFloat(formData.remise) || 0;
    const total = sousTotal + frais - remise;
    
    return { sousTotal, frais, remise, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.articles.length === 0) {
      setError('Ajoutez au moins un article');
      return;
    }

    if (showClientSection) {
      if (clientType === 'existant' && !formData.client_id) {
        setError('Veuillez sélectionner un client');
        return;
      }

      if (clientType === 'nouveau' && !formData.client_nom.trim()) {
        setError('Veuillez saisir le nom du client');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const dataToSend = {
        type_commande: formData.type_commande,
        frais_livraison: parseFloat(formData.frais_livraison) || 0,
        remise: parseFloat(formData.remise) || 0,
        adresse_livraison: formData.adresse_livraison,
        ville_livraison: formData.ville_livraison,
        articles: formData.articles.map(a => ({
          produit_id: a.produit_id,
          quantite: a.quantite,
          prix_unitaire: a.prix_unitaire,
          total_ligne: a.total
        }))
      };

      // Ajouter les données client seulement si on modifie le client
      if (showClientSection) {
        dataToSend.client_type = clientType;
        if (clientType === 'existant') {
          dataToSend.client_id = parseInt(formData.client_id);
        } else {
          dataToSend.client_nom = formData.client_nom;
          dataToSend.client_telephone = formData.client_telephone;
          dataToSend.client_email = formData.client_email;
        }
      }

      console.log('📤 Données envoyées:', dataToSend);

      const response = await fetch(`${API_BASE_URL}/commandes/update.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      const textResponse = await response.text();
      console.log('📥 Réponse brute:', textResponse);

      try {
        const data = JSON.parse(textResponse);
        
        if (response.ok && data.success) {
          setSuccess('Commande modifiée avec succès !');
          setTimeout(() => {
            navigate(`/commandes/${id}`);
          }, 1500);
        } else {
          setError(data.message || 'Erreur inconnue');
        }
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        setError('Erreur serveur: réponse invalide');
      }
      
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totaux = calculerTotaux();

  if (loading || loadingProduits) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold'
        }}>
          Modification commande
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
        Modifier la commande
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/commandes" style={{ color: '#006994' }}>Commandes</a></li>
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
                {/* En-tête avec poisson */}
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
                    Modifier la commande
                  </h2>
                  <p style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Modifiez les informations ci-dessous
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
                  {/* Client - Affichage actuel */}
                  <h5 className="mt-3" style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>Client actuel</h5>
                  
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <strong>Nom:</strong> {formData.client_nom}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <strong>Tél:</strong> {formData.client_telephone || '-'}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <strong>Email:</strong> {formData.client_email || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Bouton pour modifier le client */}
                  <div className="mb-4">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowClientSection(!showClientSection)}
                      style={{
                        borderRadius: '20px',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      <i className={`bi bi-${showClientSection ? 'dash' : 'plus'}-circle me-2`}></i>
                      {showClientSection ? 'Annuler modification client' : 'Modifier le client'}
                    </button>
                  </div>

                  {/* Section modification client (affichée conditionnellement) */}
                  {showClientSection && (
                    <>
                      <h5 className="mt-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>
                        <i className="bi bi-pencil me-2"></i>
                        Nouveau client
                      </h5>
                      
                      <div className="mb-3">
                        <div className="btn-group w-100" role="group">
                          <button
                            type="button"
                            className={`btn ${clientType === 'existant' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setClientType('existant')}
                            style={{ borderRadius: '8px 0 0 8px' }}
                          >
                            <i className="bi bi-person-badge me-2"></i>
                            Client existant
                          </button>
                          <button
                            type="button"
                            className={`btn ${clientType === 'nouveau' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setClientType('nouveau')}
                            style={{ borderRadius: '0 8px 8px 0' }}
                          >
                            <i className="bi bi-person-plus me-2"></i>
                            Nouveau client
                          </button>
                        </div>
                      </div>

                      {clientType === 'existant' ? (
                        <div className="row mb-3">
                          <div className="col-md-12">
                            <label className="form-label" style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#006994',
                              fontWeight: 'bold'
                            }}>
                              <i className="bi bi-person me-2"></i>
                              Client <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              name="client_id"
                              value={formData.client_id}
                              onChange={handleClientChange}
                              required={clientType === 'existant'}
                              style={{
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                padding: '10px'
                              }}
                            >
                              <option value="">Sélectionner un client</option>
                              {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                  {client.nom} {client.telephone ? `- ${client.telephone}` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label" style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#006994',
                              fontWeight: 'bold'
                            }}>
                              <i className="bi bi-person me-2"></i>
                              Nom client <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="client_nom"
                              value={formData.client_nom}
                              onChange={handleClientChange}
                              required={clientType === 'nouveau'}
                              style={{
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                padding: '10px'
                              }}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label" style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#006994',
                              fontWeight: 'bold'
                            }}>
                              <i className="bi bi-telephone me-2"></i>
                              Téléphone
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="client_telephone"
                              value={formData.client_telephone}
                              onChange={handleClientChange}
                              style={{
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                padding: '10px'
                              }}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label" style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#006994',
                              fontWeight: 'bold'
                            }}>
                              <i className="bi bi-envelope me-2"></i>
                              Email
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              name="client_email"
                              value={formData.client_email}
                              onChange={handleClientChange}
                              style={{
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                padding: '10px'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Type commande */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-shop me-2"></i>
                        Type commande
                      </label>
                      <select
                        className="form-select"
                        name="type_commande"
                        value={formData.type_commande}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px'
                        }}
                      >
                        <option value="boutique">Boutique</option>
                        <option value="en_ligne">En ligne</option>
                      </select>
                    </div>
                  </div>

                  {/* Articles */}
                  <h5 className="mt-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>Articles</h5>
                  
                  {/* Ajout article */}
                  <div className="row mb-3 bg-light p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="col-md-5">
                      <select
                        className="form-select"
                        name="produit_id"
                        value={articleCourant.produit_id}
                        onChange={handleArticleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px'
                        }}
                      >
                        <option value="">Choisir un produit</option>
                        {produits.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nom_produit} - Stock: {p.stock_disponible} {p.type_vente === 'poids' ? 'kg' : 'unités'} - {p.prix_vente.toLocaleString()} FCFA
                          </option>
                        ))}
                      </select>
                      {produits.length === 0 && (
                        <small className="text-warning d-block mt-1">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Aucun produit disponible avec prix de vente
                        </small>
                      )}
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        name="quantite"
                        value={articleCourant.quantite}
                        onChange={handleArticleChange}
                        min="0.001"
                        step={articleCourant.type_vente === 'poids' ? '0.001' : '1'}
                        placeholder={articleCourant.type_vente === 'poids' ? 'Poids (kg)' : 'Qté'}
                        disabled={!articleCourant.produit_id}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px'
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        value={articleCourant.prix_unitaire}
                        disabled
                        placeholder="Prix"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          backgroundColor: '#e9ecef'
                        }}
                      />
                      {articleCourant.produit_id && articleCourant.prix_unitaire <= 0 && (
                        <small className="text-danger d-block">⚠️ Prix non défini</small>
                      )}
                    </div>
                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={ajouterArticle}
                        disabled={!articleCourant.produit_id || articleCourant.stock_dispo === 0 || articleCourant.prix_unitaire <= 0}
                        style={{
                          borderRadius: '8px',
                          padding: '10px',
                          fontWeight: 'bold'
                        }}
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  </div>

                  {/* Liste articles */}
                  {formData.articles.length > 0 && (
                    <div className="table-responsive mb-3">
                      <table className="table table-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix unit.</th>
                            <th>Total</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.articles.map((a, idx) => (
                            <tr key={idx}>
                              <td>{a.nom_produit}</td>
                              <td>{a.quantite} {a.unite}</td>
                              <td>{a.prix_unitaire.toLocaleString()} FCFA</td>
                              <td className="fw-bold text-primary">{a.total.toLocaleString()} FCFA</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => supprimerArticle(idx)}
                                  style={{ borderRadius: '6px' }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Frais et remise */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-truck me-2"></i>
                        Frais livraison
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="frais_livraison"
                        value={formData.frais_livraison}
                        onChange={handleChange}
                        min="0"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px'
                        }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-percent me-2"></i>
                        Remise
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="remise"
                        value={formData.remise}
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

                  {/* Adresse de livraison */}
                  <div className="row mb-3">
                    <div className="col-md-8">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-geo-alt me-2"></i>
                        Adresse de livraison
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="adresse_livraison"
                        value={formData.adresse_livraison}
                        onChange={handleChange}
                        placeholder="Adresse complète"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px'
                        }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        <i className="bi bi-building me-2"></i>
                        Ville
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="ville_livraison"
                        value={formData.ville_livraison}
                        onChange={handleChange}
                        placeholder="Ville"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Récapitulatif des totaux */}
                  <div className="card mb-3" style={{
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    borderRadius: '8px'
                  }}>
                    <div className="card-body">
                      <h6 style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994', fontWeight: 'bold' }}>
                        Récapitulatif
                      </h6>
                      <table className="table table-sm mb-0">
                        <tbody>
                          <tr>
                            <td>Sous-total</td>
                            <td className="text-end">{totaux.sousTotal.toLocaleString()} FCFA</td>
                          </tr>
                          <tr>
                            <td>Frais livraison</td>
                            <td className="text-end">{totaux.frais.toLocaleString()} FCFA</td>
                          </tr>
                          <tr>
                            <td>Remise</td>
                            <td className="text-end text-danger">-{totaux.remise.toLocaleString()} FCFA</td>
                          </tr>
                          <tr className="fw-bold">
                            <td>TOTAL</td>
                            <td className="text-end text-primary" style={{ fontSize: '1.2rem' }}>
                              {totaux.total.toLocaleString()} FCFA
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/commandes/${id}`)}
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

export default CommandeEdit;