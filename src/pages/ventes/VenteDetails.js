import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVente } from '../../services/venteService';
import { MODES_PAIEMENT, getModePaiementStyle } from '../../constants/modesPaiement';

const VenteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vente, setVente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const factureRef = useRef();

  useEffect(() => {
    loadVente();
  }, [id]);

  const loadVente = async () => {
    try {
      setLoading(true);
      const response = await getVente(id);
      setVente(response.vente);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const getModePaiementInfo = (mode) => {
    return MODES_PAIEMENT[mode?.toUpperCase()] || MODES_PAIEMENT.AUTRE;
  };

  const imprimerFacture = () => {
    // Ouvrir une nouvelle fenêtre avec seulement la facture
    const factureWindow = window.open('', '_blank');
    factureWindow.document.write(`
      <html>
        <head>
          <title>Facture ${vente.numero_facture}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              padding: 0;
            }
            .facture {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header img {
              max-height: 80px;
              margin-bottom: 10px;
            }
            .header h2 {
              color: #006994;
              margin: 5px 0;
              font-family: Montserrat, sans-serif;
            }
            .header p {
              margin: 2px 0;
              color: #333;
            }
            .info {
              width: 100%;
              margin-bottom: 30px;
            }
            .info td {
              padding: 5px;
              vertical-align: top;
            }
            .info .right {
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f0f0f0;
              padding: 10px;
              text-align: left;
              border-bottom: 2px solid #006994;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .total {
              font-weight: bold;
              color: #006994;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              font-style: italic;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="facture">
            <div class="header">
              <img src="/assets/img/logo1.png" alt="Logo" style="max-height:80px" />
              <h2>Poissonnerie Grema</h2>
              <p>Niamey, Niger</p>
              <p>Tel: 90 12 34 56</p>
            </div>

            <table class="info">
              <tr>
                <td width="50%">
                  <strong>Facture N°:</strong> ${vente.numero_facture}<br />
                  <strong>Date:</strong> ${formatDateShort(vente.created_at)}
                </td>
                <td class="right" width="50%">
                  ${vente.client_nom ? `<strong>Client:</strong> ${vente.client_nom}<br />` : ''}
                  ${vente.client_telephone ? `<strong>Tél:</strong> ${vente.client_telephone}<br />` : ''}
                  <strong>Paiement:</strong> ${getModePaiementInfo(vente.mode_paiement).label}
                </td>
              </tr>
            </table>

            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${vente.articles?.map(article => `
                  <tr>
                    <td>${article.nom_produit}</td>
                    <td>${article.quantite} ${article.type_vente === 'poids' ? 'kg' : ''}</td>
                    <td>${formatPrice(article.prix_unitaire)}</td>
                    <td>${formatPrice(article.total_ligne)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align:right"><strong>TOTAL:</strong></td>
                  <td class="total">${formatPrice(vente.total)}</td>
                </tr>
              </tfoot>
            </table>

            <div class="footer">
              ${vente.notes ? `<p><strong>Notes:</strong> ${vente.notes}</p>` : ''}
              <p>Merci de votre confiance et à bientôt !</p>
              <p>Poissonnerie Grema - Poisson frais tous les jours</p>
            </div>
          </div>
        </body>
      </html>
    `);
    factureWindow.document.close();
    factureWindow.focus();
    factureWindow.print();
  };

  if (loading) {
    return (
      <div className="pagetitle">
        <h1>Détails de la vente</h1>
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
        <h1>Détails de la vente</h1>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/ventes')}>
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!vente) {
    return (
      <div className="pagetitle">
        <h1>Détails de la vente</h1>
        <div className="alert alert-warning">Vente non trouvée</div>
        <button className="btn btn-primary" onClick={() => navigate('/ventes')}>
          Retour à la liste
        </button>
      </div>
    );
  }

  const modePaiement = getModePaiementInfo(vente.mode_paiement);

  return (
    <div className="pagetitle">
      {/* Boutons d'action */}
      <div className="d-flex justify-content-between align-items-center">
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', color: '#006994' }}>
          Vente {vente.numero_facture}
        </h1>
        <button
          className="btn btn-outline-primary"
          onClick={imprimerFacture}
        >
          <i className="bi bi-file-pdf me-2"></i>
          Générer PDF
        </button>
      </div>

      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Accueil</a></li>
          <li className="breadcrumb-item"><a href="/ventes">Ventes</a></li>
          <li className="breadcrumb-item active">Détails</li>
        </ol>
      </nav>

      {/* Vue normale */}
      <div className="normal-view">
        <div className="row">
          {/* Colonne gauche */}
          <div className="col-md-4">
            {/* Carte principale */}
            <div className="card mb-3" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="text-center mb-3">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    border: '3px solid #28a745'
                  }}>
                    <i className="bi bi-receipt" style={{ fontSize: '40px', color: '#28a745' }}></i>
                  </div>
                  <h5 className="mt-2 mb-0">{vente.numero_facture}</h5>
                  <small className="text-muted">{new Date(vente.created_at).toLocaleString('fr-FR')}</small>
                </div>

                <hr />

                <div className="text-center mb-3">
                  <span className="badge" style={{
                    backgroundColor: modePaiement.color,
                    color: 'white',
                    padding: '8px 16px',
                    fontSize: '1rem',
                    borderRadius: '8px'
                  }}>
                    <i className={`bi ${modePaiement.icon} me-2`}></i>
                    {modePaiement.label}
                  </span>
                </div>

                <div className="text-center">
                  <div className="display-6 fw-bold text-primary mb-2">
                    {formatPrice(vente.total)}
                  </div>
                  <p className="text-muted mb-0">
                    {vente.articles?.length || 0} article(s)
                  </p>
                </div>

                {/* Barre d'actions */}
                <div className="d-flex gap-2 mt-3 pt-3 border-top justify-content-center">
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn btn-sm"
                      onClick={() => navigate('/ventes')}
                      onMouseEnter={() => setShowTooltip('back')}
                      onMouseLeave={() => setShowTooltip('')}
                      style={{
                        backgroundColor: '#006994',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        padding: '8px 12px'
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
                        Retour à la liste
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Client (si renseigné) */}
            {vente.client_nom && (
              <div className="card mb-3" style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none'
              }}>
                <div className="card-body">
                  <h5 className="card-title" style={{ color: '#006994' }}>
                    <i className="bi bi-person me-2"></i>
                    Client
                  </h5>
                  <p className="mb-1"><strong>{vente.client_nom}</strong></p>
                  {vente.client_telephone && (
                    <p className="mb-1">
                      <i className="bi bi-telephone me-2" style={{ color: '#666' }}></i>
                      {vente.client_telephone}
                    </p>
                  )}
                  {vente.client_email && (
                    <p className="mb-1">
                      <i className="bi bi-envelope me-2" style={{ color: '#666' }}></i>
                      {vente.client_email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Vendeur */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <h5 className="card-title" style={{ color: '#006994' }}>
                  <i className="bi bi-person-badge me-2"></i>
                  Vendeur
                </h5>
                <p className="mb-1"><strong>{vente.vendeur_nom || 'Inconnu'}</strong></p>
                {vente.notes && (
                  <div className="mt-2">
                    <small className="text-muted">Notes:</small>
                    <p className="mb-0">{vente.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="col-md-8">
            {/* Articles */}
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <h5 className="card-title" style={{ color: '#006994' }}>
                  <i className="bi bi-cart me-2"></i>
                  Articles vendus
                </h5>
                
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unit.</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vente.articles?.map((article, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{article.nom_produit}</strong>
                          </td>
                          <td>
                            {article.quantite} {article.type_vente === 'poids' ? 'kg' : 'unité(s)'}
                          </td>
                          <td>{formatPrice(article.prix_unitaire)}</td>
                          <td className="fw-bold text-primary">{formatPrice(article.total_ligne)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="3" className="text-end fw-bold">Total TTC:</td>
                        <td className="fw-bold text-primary" style={{ fontSize: '1.2rem' }}>
                          {formatPrice(vente.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenteDetails;