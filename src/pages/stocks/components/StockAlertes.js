import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProduits } from '../../../services/produitService';

const StockAlertes = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const [filters, setFilters] = useState({
  type: 'tous' // 'rupture', 'faible', 'tous' → 'tous' par défaut
});

  useEffect(() => {
    loadProduitsEnAlerte();
  }, [filters.type]);

const loadProduitsEnAlerte = async () => {
  setLoading(true);
  try {
    const response = await getProduits(1, 1000, { est_actif: '1' });
    const tousProduits = response.data?.produits || [];
    
    // Adapter les données pour utiliser stock_min_kg
    const produitsAdaptes = tousProduits.map(p => ({
      ...p,
      stock_min: p.stock_min_kg || 0 // Utiliser stock_min_kg comme stock_min
    }));
    
    console.log('Tous les produits reçus:', produitsAdaptes);
    
    // Filtrer les produits en alerte
    const produitsAvecAlerte = produitsAdaptes.filter(p => {
      const stock = p.type_vente === 'poids' ? p.stock_kg : p.stock_unite;
      const stockMin = p.stock_min || 0;
      
      if (filters.type === 'rupture') return stock <= 0;
      if (filters.type === 'faible') return stock > 0 && stock <= stockMin;
      return stock <= 0 || (stock > 0 && stock <= stockMin); // 'tous'
    });

    console.log('Produits filtrés:', produitsAvecAlerte);

    // Calculer les statistiques
    const rupture = produitsAvecAlerte.filter(p => {
      const stock = p.type_vente === 'poids' ? p.stock_kg : p.stock_unite;
      return stock <= 0;
    }).length;
    
    const faible = produitsAvecAlerte.filter(p => {
      const stock = p.type_vente === 'poids' ? p.stock_kg : p.stock_unite;
      return stock > 0 && stock <= (p.stock_min || 0);
    }).length;

    setStats({
      total: produitsAvecAlerte.length,
      rupture,
      faible,
      valeurStock: produitsAvecAlerte.reduce((acc, p) => {
        const stock = p.type_vente === 'poids' ? p.stock_kg : p.stock_unite;
        const prix = p.type_vente === 'poids' ? p.prix_achat_kg : p.prix_achat_unite;
        return acc + (stock * (prix || 0));
      }, 0)
    });

    setProduits(produitsAvecAlerte);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const getStockStyle = (produit) => {
    const stock = produit.type_vente === 'poids' ? produit.stock_kg : produit.stock_unite;
    if (stock <= 0) return { backgroundColor: '#dc3545', color: 'white' }; // Rouge
    return { backgroundColor: '#ffc107', color: '#333' }; // Jaune
  };

  const getStockMessage = (produit) => {
    const stock = produit.type_vente === 'poids' ? produit.stock_kg : produit.stock_unite;
    const min = produit.stock_min || 0;
    
    if (stock <= 0) return 'Rupture de stock';
    if (stock <= min) return `Stock faible (min: ${min} ${produit.type_vente === 'poids' ? 'kg' : 'unité(s)'})`;
    return '';
  };

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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2" style={{ color: '#666' }}>Chargement des alertes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Statistiques */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: '#dc3545',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(220,53,69,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>En rupture</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.rupture}</h3>
                  </div>
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: '#ffc107',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(255,193,7,0.3)',
              border: 'none',
              color: '#333'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Stock faible</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.faible}</h3>
                  </div>
                  <i className="bi bi-exclamation-diamond-fill" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: '#006994',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,105,148,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Total alertes</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{stats.total}</h3>
                  </div>
                  <i className="bi bi-bell-fill" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white" style={{
              backgroundColor: '#28a745',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(40,167,69,0.3)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ opacity: 0.9, fontSize: '0.9rem' }}>Valeur en jeu</h6>
                    <h3 style={{ fontWeight: 'bold' }}>{formatPrice(stats.valeurStock)}</h3>
                  </div>
                  <i className="bi bi-currency-dollar" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card mb-4" style={{
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
          zIndex: 1,
          opacity: 0.5
        }} />

        <div className="card-body p-4">
          <h5 className="card-title mb-3" style={{ color: '#006994', fontWeight: 'bold' }}>
            <i className="bi bi-funnel me-2" style={{ color: '#FF6F00' }}></i>
            Filtres
          </h5>
          
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters({ type: e.target.value })}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '10px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                <option value="rupture">🔴 En rupture seulement</option>
                <option value="faible">🟡 Stock faible seulement</option>
                <option value="tous">📋 Toutes les alertes</option>
              </select>
            </div>
            <div className="col-md-8">
              <button
                className="btn"
                onClick={loadProduitsEnAlerte}
                style={{
                  backgroundColor: '#006994',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px 25px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0056b3';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#006994';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Actualiser les alertes
              </button>
            </div>
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
          opacity: 0.2
        }} />
      </div>

      {error && (
        <div className="alert alert-danger" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {produits.length === 0 ? (
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

          <div className="card-body p-5 text-center">
            <i className="bi bi-check-circle" style={{ fontSize: '4rem', color: '#28a745' }}></i>
            <h3 style={{ color: '#28a745', marginTop: '15px' }}>Aucune alerte</h3>
            <p style={{ color: '#666', fontSize: '1rem' }}>
              Tous vos stocks sont à des niveaux satisfaisants
            </p>
            <button
              className="btn mt-3"
              onClick={loadProduitsEnAlerte}
              style={{
                backgroundColor: '#006994',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                padding: '8px 20px'
              }}
            >
              <i className="bi bi-arrow-repeat me-2"></i>
              Vérifier à nouveau
            </button>
          </div>

          {/* Vague décorative en bas */}
          <div style={{
            height: '4px',
            background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            opacity: 0.2
          }} />
        </div>
      ) : (
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
            zIndex: 1,
            opacity: 0.5
          }} />

          <div className="card-body p-4">
            <h5 className="card-title" style={{
              color: '#006994',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              marginBottom: '20px'
            }}>
              <i className="bi bi-exclamation-triangle me-2" style={{ color: '#FF6F00' }}></i>
              Produits en alerte
              <span className="ms-2" style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                ({produits.length} produit{produits.length > 1 ? 's' : ''})
              </span>
            </h5>

            <div className="table-responsive">
              <table className="table table-hover align-middle" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ borderTopLeftRadius: '8px', padding: '15px' }}>Code</th>
                    <th style={{ padding: '15px' }}>Produit</th>
                    <th style={{ padding: '15px' }}>Catégorie</th>
                    <th style={{ padding: '15px' }}>Stock actuel</th>
                    <th style={{ padding: '15px' }}>Stock min</th>
                    <th style={{ padding: '15px' }}>Alerte</th>
                    <th style={{ borderTopRightRadius: '8px', padding: '15px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {produits.map(produit => {
                    const stock = produit.type_vente === 'poids' ? produit.stock_kg : produit.stock_unite;
                    const style = getStockStyle(produit);
                    return (
                      <tr key={produit.id} style={{ transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '15px' }}>
                          <code style={{
                            backgroundColor: '#e9ecef',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            color: '#006994',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}>
                            {produit.code_produit || '-'}
                          </code>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <strong style={{ color: '#006994' }}>{produit.nom_produit}</strong>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {produit.nom_categorie ? (
                            <>
                              <i className="bi bi-folder me-1" style={{ color: '#FF6F00' }}></i>
                              {produit.nom_categorie}
                            </>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span className="badge" style={{
                            backgroundColor: '#e9ecef',
                            color: '#333',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.9rem'
                          }}>
                            {stock} {produit.type_vente === 'poids' ? 'kg' : 'unité(s)'}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            backgroundColor: '#f8f9fa',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.9rem'
                          }}>
                            {produit.stock_min || 0} {produit.type_vente === 'poids' ? 'kg' : 'unité(s)'}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span className="badge" style={{
                            backgroundColor: style.backgroundColor,
                            color: style.color,
                            padding: '8px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            <i className={`bi ${stock <= 0 ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill'} me-1`}></i>
                            {getStockMessage(produit)}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ position: 'relative' }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => navigate(`/produits/${produit.id}`)}
                              style={{
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                borderRadius: '8px',
                                border: 'none',
                                padding: '8px 12px',
                                transition: 'all 0.3s',
                                fontSize: '0.9rem'
                              }}
                              onMouseEnter={(e) => {
                                setShowTooltip(`view-${produit.id}`);
                                e.target.style.backgroundColor = '#138496';
                                e.target.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                setShowTooltip('');
                                e.target.style.backgroundColor = '#17a2b8';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {showTooltip === `view-${produit.id}` && (
                              <Tooltip text="Voir le produit" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
            opacity: 0.2
          }} />
        </div>
      )}
    </div>
  );
};

export default StockAlertes;