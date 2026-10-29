import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCommande } from '../../services/commandeService';
import { getProduitsPourCommande } from '../../services/produitCommandeService';

const CommandeCreate = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    loadProduits();
    loadClients();
  }, []);

  // ✅ VERSION CORRIGÉE - utilise les données du service adapté
  const loadProduits = async () => {
    try {
      const data = await getProduitsPourCommande();
      console.log('📦 Produits reçus:', data);
      
      // Les données viennent maintenant du backend avec la bonne structure
      // qui inclut prix_vente depuis stock_mouvements
      const produitsAdaptes = data.map(p => ({
        id: p.id,
        nom_produit: p.nom_produit,
        code_produit: p.code_produit,
        type_vente: p.type_vente || 'poids',
        stock_actuel: p.type_vente === 'poids' ? p.stock_kg || 0 : p.stock_unite || 0,
        prix_vente: p.prix_vente || 0, // ✅ Prix depuis stock_mouvements
        est_actif: p.est_actif
      }));
      
      console.log('✅ Produits adaptés:', produitsAdaptes);
      setProduits(produitsAdaptes);
    } catch (err) {
      console.error('❌ Erreur chargement produits:', err);
      setError('Erreur chargement produits');
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
    } finally {
      setLoadingClients(false);
    }
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArticleChange = (e) => {
    const { name, value } = e.target;
    console.log('Changement:', name, value);
    
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
      console.log('Produit sélectionné:', produit);
      
      if (produit) {
        setArticleCourant({
          produit_id: value,
          quantite: 1,
          prix_unitaire: produit.prix_vente || 0,
          stock_dispo: produit.stock_actuel || 0,
          type_vente: produit.type_vente || 'poids',
          nom_produit: produit.nom_produit || ''
        });
      }
    } else if (name === 'quantite') {
      setArticleCourant(prev => ({ ...prev, quantite: value }));
    }
  };

  const ajouterArticle = () => {
    console.log('Ajout article - état courant:', articleCourant);
    setError('');

    if (!articleCourant.produit_id) {
      setError('Veuillez sélectionner un produit');
      return;
    }

    // Calcul de la quantité
    let quantite;
    if (articleCourant.type_vente === 'poids') {
      quantite = parseFloat(articleCourant.quantite);
      console.log('Quantité poids:', quantite);
    } else {
      quantite = parseInt(articleCourant.quantite);
      console.log('Quantité unité:', quantite);
    }

    if (isNaN(quantite) || quantite <= 0) {
      setError('Quantité invalide');
      return;
    }

    const prix = parseFloat(articleCourant.prix_unitaire);
    if (isNaN(prix) || prix <= 0) {
      setError('Prix invalide. Le produit n\'a peut-être pas de prix de vente défini');
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

    console.log('Nouvel article créé:', nouvelArticle);
    console.log('Panier avant:', formData.articles);

    setFormData(prev => ({
      ...prev,
      articles: [...prev.articles, nouvelArticle]
    }));

    // Réinitialisation
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

    if (clientType === 'existant' && !formData.client_id) {
      setError('Veuillez sélectionner un client');
      return;
    }

    if (clientType === 'nouveau' && !formData.client_nom.trim()) {
      setError('Veuillez saisir le nom du client');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        client_type: clientType,
        client_id: clientType === 'existant' ? parseInt(formData.client_id) : null,
        client_nom: formData.client_nom,
        client_telephone: formData.client_telephone,
        client_email: formData.client_email,
        type_commande: formData.type_commande,
        frais_livraison: parseFloat(formData.frais_livraison) || 0,
        remise: parseFloat(formData.remise) || 0,
        adresse_livraison: formData.adresse_livraison,
        ville_livraison: formData.ville_livraison,
        articles: formData.articles.map(a => ({
          produit_id: a.produit_id,
          quantite: a.quantite,
          prix_unitaire: a.prix_unitaire, // ✅ Envoyer le prix pour éviter les surprises
          total_ligne: a.total
        }))
      };

      console.log('📤 Données envoyées:', dataToSend);

      const response = await fetch(`${API_BASE_URL}/commandes/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('📥 Status réponse:', response.status);
      
      const textResponse = await response.text();
      console.log('📥 Réponse brute:', textResponse);

      try {
        const data = JSON.parse(textResponse);
        console.log('📥 Données parsées:', data);
        
        if (response.ok && data.success) {
          setSuccess('Commande créée avec succès !');
          setTimeout(() => {
            navigate(`/commandes/${data.commande.id}`);
          }, 1500);
        } else {
          setError(data.message || 'Erreur inconnue');
        }
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        console.error('La réponse n\'est pas du JSON valide:', textResponse.substring(0, 200));
        setError('Erreur serveur: réponse invalide');
      }
      
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totaux = calculerTotaux();

  if (loadingProduits || loadingClients) {
    return (
      <div className="pagetitle">
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>
          Nouvelle commande
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
        Nouvelle commande
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/commandes" style={{ color: '#006994' }}>Commandes</a></li>
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
                    Nouvelle commande
                  </h2>
                  <p style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Remplissez les informations ci-dessous
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
                  {/* Type de client */}
                  <h5 className="mt-3" style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>Client</h5>
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
                    /* Sélection client existant */
                    <div className="row mb-4">
                      <div className="col-md-8">
                        <label className="form-label" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#006994',
                          fontWeight: 'bold'
                        }}>
                          <i className="bi bi-person me-2"></i>
                          Client <span style={{ color: '#dc3545' }}>*</span>
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
                            padding: '10px',
                            fontFamily: 'Roboto, sans-serif'
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
                          onChange={handleClientChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            padding: '10px',
                            fontFamily: 'Roboto, sans-serif'
                          }}
                        >
                          <option value="boutique">Boutique</option>
                          <option value="en_ligne">En ligne</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    /* Nouveau client */
                    <>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label" style={{
                            fontFamily: 'Montserrat, sans-serif',
                            color: '#006994',
                            fontWeight: 'bold'
                          }}>
                            <i className="bi bi-person me-2"></i>
                            Nom client <span style={{ color: '#dc3545' }}>*</span>
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
                              padding: '10px',
                              fontFamily: 'Roboto, sans-serif'
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
                              padding: '10px',
                              fontFamily: 'Roboto, sans-serif'
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
                              padding: '10px',
                              fontFamily: 'Roboto, sans-serif'
                            }}
                          />
                        </div>
                      </div>
                      <div className="row mb-4">
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
                            onChange={handleClientChange}
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              padding: '10px',
                              fontFamily: 'Roboto, sans-serif'
                            }}
                          >
                            <option value="boutique">Boutique</option>
                            <option value="en_ligne">En ligne</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Articles */}
                  <h5 className="mt-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>Articles</h5>
                  
                  {/* Ajout article */}
                  <div className="row g-2 align-items-end mx-0 mb-3 bg-light p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Produit</label>
                      <select
                        className="form-select"
                        name="produit_id"
                        value={articleCourant.produit_id}
                        onChange={handleArticleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      >
                        <option value="">Choisir un produit</option>
                        {produits.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nom_produit} - Stock: {p.stock_actuel} {p.type_vente === 'poids' ? 'kg' : 'unité(s)'} - {p.prix_vente.toLocaleString()} FCFA
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
                      <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>{articleCourant.produit_id && articleCourant.type_vente === 'poids' ? 'Poids (kg)' : 'Quantité'}</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantite"
                        value={articleCourant.quantite}
                        onChange={handleArticleChange}
                        min="0.001"
                        step={articleCourant.type_vente === 'poids' ? '0.001' : '1'}
                        disabled={!articleCourant.produit_id}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Prix unitaire (FCFA)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={articleCourant.prix_unitaire}
                        disabled
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif',
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
                        className="btn btn-success w-100 text-nowrap"
                        onClick={ajouterArticle}
                        disabled={!articleCourant.produit_id || articleCourant.stock_dispo === 0 || articleCourant.prix_unitaire <= 0}
                        style={{
                          borderRadius: '8px',
                          padding: '10px',
                          fontWeight: 'bold'
                        }}
                      >
                        <i className="bi bi-plus-lg me-1"></i>Ajouter
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

                  {/* Frais de livraison et adresse */}
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
                        onChange={handleClientChange}
                        min="0"
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
                        <i className="bi bi-percent me-2"></i>
                        Remise
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="remise"
                        value={formData.remise}
                        onChange={handleClientChange}
                        min="0"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif'
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
                        onChange={handleClientChange}
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
                        <i className="bi bi-building me-2"></i>
                        Ville
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="ville_livraison"
                        value={formData.ville_livraison}
                        onChange={handleClientChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          padding: '10px',
                          fontFamily: 'Roboto, sans-serif'
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

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => navigate('/commandes')}
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
                          Créer la commande
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

export default CommandeCreate;