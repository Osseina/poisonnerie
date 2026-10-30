import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { API_BASE_URL } from '../config';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [stats, setStats] = useState({
    ventes: { aujourdhui: 0, semaine: 0, mois: 0, variation: 0 },
    stock: { total: 0, valeur: 0, rupture: 0, faible: 0 },
    finances: { 
      chiffreAffaires: 0, 
      beneficeTotal: 0, 
      margeMoyenne: 0, 
      perteTotale: 0, 
      produitsEnPerte: 0 
    },
    commandes: { enAttente: 0, livrees: 0, annulees: 0 },
    clients: { total: 0, nouveaux: 0 },
    topProduits: [],
    produitsEnPerte: [],
    activiteRecente: [],
    ventesMensuelles: [],
    role: 'vendeur'
  });

  const isGestionnaire = user.profile === 'gestionnaire';
  const isVendeur = user.profile === 'vendeur';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 1. Charger les statistiques générales
      const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats.php`, { headers });
      const statsData = await statsResponse.json();
      
      // 2. Charger le top produits
      const topResponse = await fetch(`${API_BASE_URL}/dashboard/top-produits.php?limit=5`, { headers });
      const topData = await topResponse.json();

      // 3. Charger l'activité récente
      const activiteResponse = await fetch(`${API_BASE_URL}/dashboard/activite-recente.php`, { headers });
      const activiteData = await activiteResponse.json();

      // 4. Charger les ventes mensuelles
      const ventesMensuellesResponse = await fetch(`${API_BASE_URL}/dashboard/ventes-mensuelles.php`, { headers });
      const ventesMensuellesData = await ventesMensuellesResponse.json();

      // 5. Charger les produits en perte (seulement pour gestionnaire)
      let perteData = { produits: [] };
      if (isGestionnaire) {
        const perteResponse = await fetch(`${API_BASE_URL}/dashboard/produits-en-perte.php`, { headers });
        perteData = await perteResponse.json();
      }

      setStats({
        ventes: statsData.ventes || stats.ventes,
        stock: statsData.stock || stats.stock,
        finances: statsData.finances || stats.finances,
        commandes: statsData.commandes || stats.commandes,
        clients: statsData.clients || stats.clients,
        topProduits: topData.produits || [],
        produitsEnPerte: perteData.produits || [],
        activiteRecente: activiteData.activites || [],
        ventesMensuelles: ventesMensuellesData.ventes || [],
        role: statsData.role || 'vendeur'
      });

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      // Pas de chiffres affichés tant que les vraies données ne sont pas arrivées
      setError(error.message || 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number || 0);
  };

  // Données pour le graphique des ventes mensuelles
  const getVentesMensuellesData = () => {
    if (stats.ventesMensuelles && stats.ventesMensuelles.length > 0) {
      const datasets = [
        {
          label: 'Chiffre d\'affaires',
          data: stats.ventesMensuelles.map(item => item.ca),
          backgroundColor: '#006994',
          borderRadius: 6
        }
      ];

      // Ajouter les bénéfices seulement pour le gestionnaire
      if (isGestionnaire) {
        datasets.push({
          label: 'Bénéfices',
          data: stats.ventesMensuelles.map(item => item.benefice || 0),
          backgroundColor: '#28a745',
          borderRadius: 6
        });
      }

      return {
        labels: stats.ventesMensuelles.map(item => item.mois),
        datasets: datasets
      };
    }
    
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Chiffre d\'affaires',
          data: Array(12).fill(0),
          backgroundColor: '#006994',
          borderRadius: 6
        }
      ]
    };
  };

  // Données pour le graphique des bénéfices (visible seulement pour gestionnaire)
  const getBeneficesData = () => {
    if (!isGestionnaire) return null;
    
    return {
      labels: stats.topProduits.map(p => p.nom?.substring(0, 15) + (p.nom?.length > 15 ? '...' : '')),
      datasets: [
        {
          label: 'Bénéfice (F CFA)',
          data: stats.topProduits.map(p => p.benefice || 0),
          backgroundColor: '#28a745',
          borderRadius: 6
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="pagetitle">
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif',
          color: '#006994',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Tableau de bord
        </h1>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2" style={{ color: '#666' }}>Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  const beneficesData = getBeneficesData();

  return (
    <div className="pagetitle">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 style={{ 
            fontFamily: 'Montserrat, sans-serif',
            color: '#006994',
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            Tableau de bord
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', color: '#666' }}>
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button
          className="btn"
          onClick={loadDashboardData}
          style={{
            backgroundColor: '#006994',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            padding: '8px 16px',
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
          Actualiser
        </button>
      </div>

      {/* Vague décorative */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
        marginBottom: '25px',
        borderRadius: '2px'
      }} />

      {error && (
        <div className="alert alert-danger mb-4 d-flex flex-wrap align-items-center gap-2">
          <span className="flex-grow-1">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={loadDashboardData}>
            <i className="bi bi-arrow-repeat me-1"></i>
            Réessayer
          </button>
        </div>
      )}

      {!error && (<>

      {/* Message pour les vendeurs */}
      {isVendeur && (
        <div className="alert alert-info mb-4" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #40C4FF',
          backgroundColor: '#e6f3ff',
          fontSize: '0.9rem'
        }}>
          <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
          Vous voyez uniquement vos propres statistiques de ventes. Les données financières globales sont réservées aux gestionnaires.
        </div>
      )}

      {/* Ligne 1: KPIs principaux - adaptés selon le rôle */}
      <div className="row mb-4">
        {/* Ventes du jour (visible pour tous) */}
        <div className={`col-xl-${isGestionnaire ? '3' : '4'} col-md-6 mb-3`}>
          <div className="card h-100" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 style={{ color: '#666', fontSize: '0.9rem' }}>Ventes du jour</h6>
                  <h3 style={{ color: '#28a745', fontWeight: 'bold' }}>{formatPrice(stats.ventes.aujourdhui)}</h3>
                  <small className={stats.ventes.variation >= 0 ? 'text-success' : 'text-danger'}>
                    <i className={`bi ${stats.ventes.variation >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'} me-1`}></i>
                    {Math.abs(stats.ventes.variation)}% vs hier
                  </small>
                </div>
                <div style={{
                  backgroundColor: '#28a745',
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-cart" style={{ fontSize: '24px', color: 'white' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bénéfice total (visible seulement pour gestionnaire) */}
        {isGestionnaire && (
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card h-100" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ color: '#666', fontSize: '0.9rem' }}>Bénéfice total</h6>
                    <h3 style={{ color: '#28a745', fontWeight: 'bold' }}>{formatPrice(stats.finances.beneficeTotal)}</h3>
                    <small className="text-success">
                      <i className="bi bi-percent me-1"></i>
                      Marge {stats.finances.margeMoyenne}%
                    </small>
                  </div>
                  <div style={{
                    backgroundColor: '#28a745',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-graph-up-arrow" style={{ fontSize: '24px', color: 'white' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nombre de ventes (pour les vendeurs) */}
        {isVendeur && (
          <div className="col-xl-4 col-md-6 mb-3">
            <div className="card h-100" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ color: '#666', fontSize: '0.9rem' }}>Mes ventes (30j)</h6>
                    <h3 style={{ color: '#006994', fontWeight: 'bold' }}>{formatNumber(stats.ventes.mois / (stats.ventes.aujourdhui || 1))}</h3>
                    <small className="text-muted">
                      <i className="bi bi-calendar me-1"></i>
                      {stats.ventes.mois > 0 ? 'Actif' : 'Aucune vente'}
                    </small>
                  </div>
                  <div style={{
                    backgroundColor: '#006994',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-graph-up" style={{ fontSize: '24px', color: 'white' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pertes totales (visible seulement pour gestionnaire) */}
        {isGestionnaire && (
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card h-100" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ color: '#666', fontSize: '0.9rem' }}>Pertes totales</h6>
                    <h3 style={{ color: '#dc3545', fontWeight: 'bold' }}>{formatPrice(stats.finances.perteTotale)}</h3>
                    <small className="text-danger">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {stats.finances.produitsEnPerte} produit(s) en perte
                    </small>
                  </div>
                  <div style={{
                    backgroundColor: '#dc3545',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-graph-down-arrow" style={{ fontSize: '24px', color: 'white' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Valeur du stock (visible seulement pour gestionnaire) */}
        {isGestionnaire && (
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card h-100" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ color: '#666', fontSize: '0.9rem' }}>Valeur du stock</h6>
                    <h3 style={{ color: '#006994', fontWeight: 'bold' }}>{formatPrice(stats.stock.valeur)}</h3>
                    <small className="text-muted">
                      <i className="bi bi-box me-1"></i>
                      {stats.stock.total} produits
                    </small>
                  </div>
                  <div style={{
                    backgroundColor: '#006994',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-box" style={{ fontSize: '24px', color: 'white' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pour les vendeurs, ajouter une carte de ses stats personnelles */}
        {isVendeur && (
          <div className="col-xl-4 col-md-6 mb-3">
            <div className="card h-100" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ color: '#666', fontSize: '0.9rem' }}>Produits vendus</h6>
                    <h3 style={{ color: '#FF6F00', fontWeight: 'bold' }}>
                      {stats.topProduits.reduce((acc, p) => acc + (p.quantite_totale || 0), 0)}
                    </h3>
                    <small className="text-muted">
                      <i className="bi bi-box me-1"></i>
                      sur {stats.topProduits.length} produit(s)
                    </small>
                  </div>
                  <div style={{
                    backgroundColor: '#FF6F00',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-box-seam" style={{ fontSize: '24px', color: 'white' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ligne 2: Stats secondaires (adaptées) */}
      <div className="row mb-4">
        {/* CA du mois (visible pour tous) */}
        <div className={`col-xl-${isGestionnaire ? '3' : '4'} col-md-6 mb-3`}>
          <div className="card" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 style={{ color: '#666' }}>CA du mois</h6>
                  <h4 style={{ color: '#006994' }}>{formatPrice(stats.ventes.mois)}</h4>
                </div>
                <i className="bi bi-calendar-week" style={{ fontSize: '30px', color: '#006994', opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Commandes en attente (visible pour gestionnaire) */}
        {isGestionnaire && (
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 style={{ color: '#666' }}>Commandes en attente</h6>
                    <h4 style={{ color: '#FF6F00' }}>{stats.commandes.enAttente}</h4>
                  </div>
                  <i className="bi bi-truck" style={{ fontSize: '30px', color: '#FF6F00', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nouveaux clients (visible pour gestionnaire) */}
        {isGestionnaire && (
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 style={{ color: '#666' }}>Nouveaux clients</h6>
                    <h4 style={{ color: '#28a745' }}>{stats.clients.nouveaux}</h4>
                  </div>
                  <i className="bi bi-person-plus" style={{ fontSize: '30px', color: '#28a745', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Produits en rupture (visible pour tous) */}
        <div className={`col-xl-${isGestionnaire ? '3' : '4'} col-md-6 mb-3`}>
          <div className="card" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 style={{ color: '#666' }}>Produits en rupture</h6>
                  <h4 style={{ color: '#dc3545' }}>{stats.stock.rupture}</h4>
                </div>
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '30px', color: '#dc3545', opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Pour les vendeurs, ajouter une carte de ses stats */}
        {isVendeur && (
          <div className="col-xl-4 col-md-6 mb-3">
            <div className="card" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 style={{ color: '#666' }}>Stock faible</h6>
                    <h4 style={{ color: '#ffc107' }}>{stats.stock.faible}</h4>
                  </div>
                  <i className="bi bi-exclamation-diamond" style={{ fontSize: '30px', color: '#ffc107', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alertes (adaptées) */}
      {isGestionnaire && (stats.stock.rupture > 0 || stats.stock.faible > 0 || stats.finances.produitsEnPerte > 0) && (
        <div className="alert alert-warning mb-4" style={{
          borderRadius: '12px',
          borderLeft: '4px solid #FF6F00',
          backgroundColor: '#fff3cd',
          color: '#856404'
        }}>
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3" style={{ fontSize: '24px' }}></i>
            <div>
              <strong>Points d'attention :</strong>
              <p className="mb-0">
                {stats.stock.rupture} produit(s) en rupture, {stats.stock.faible} produit(s) avec stock faible, 
                {stats.finances.produitsEnPerte} produit(s) vendu(s) à perte.
              </p>
            </div>
            <button 
              className="btn btn-sm ms-auto"
              onClick={() => navigate('/stocks/alertes')}
              style={{
                backgroundColor: '#856404',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                padding: '5px 10px'
              }}
            >
              Voir les alertes
            </button>
          </div>
        </div>
      )}

      {/* Alertes simplifiées pour les vendeurs */}
      {isVendeur && (stats.stock.rupture > 0 || stats.stock.faible > 0) && (
        <div className="alert alert-warning mb-4" style={{
          borderRadius: '12px',
          borderLeft: '4px solid #FF6F00',
          backgroundColor: '#fff3cd',
          color: '#856404'
        }}>
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3" style={{ fontSize: '24px' }}></i>
            <div>
              <strong>Stock à surveiller :</strong>
              <p className="mb-0">
                {stats.stock.rupture} produit(s) en rupture, {stats.stock.faible} produit(s) avec stock faible.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Graphiques */}
      <div className="row mb-4">
        {/* Ventes mensuelles (visible pour tous) */}
        <div className={`col-xl-${isGestionnaire && beneficesData && stats.topProduits.length > 0 ? '8' : '12'} mb-3`}>
          <div className="card h-100" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: 0.5
            }} />
            
            <div className="card-body p-4">
              <h5 className="card-title mb-4" style={{ color: '#006994', fontWeight: 'bold' }}>
                <i className="bi bi-bar-chart-fill me-2" style={{ color: '#FF6F00' }}></i>
                Évolution des ventes
                {isVendeur && <span className="ms-2 text-muted small">(mes ventes)</span>}
              </h5>
              <div style={{ position: 'relative', height: '300px' }}>
              <Bar 
                data={getVentesMensuellesData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatPrice(context.raw)}`
                      }
                    }
                  }
                }} 
              />
              </div>
            </div>
          </div>
        </div>

        {/* Top bénéfices produits (visible seulement pour gestionnaire) */}
        {isGestionnaire && beneficesData && stats.topProduits.length > 0 && (
          <div className="col-xl-4 mb-3">
            <div className="card h-100" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #28a745 0%, #40C4FF 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                opacity: 0.5
              }} />
              
              <div className="card-body p-4">
                <h5 className="card-title mb-4" style={{ color: '#006994', fontWeight: 'bold' }}>
                  <i className="bi bi-trophy-fill me-2" style={{ color: '#FF6F00' }}></i>
                  Top 5 bénéfices
                </h5>
                <Bar 
                  data={beneficesData} 
                  options={{
                    responsive: true,
                    indexAxis: 'y',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `Bénéfice: ${formatPrice(context.raw)}`
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableaux - adaptés selon le rôle */}
      <div className="row mb-4">
        {/* Top produits (adapté selon le rôle) */}
        <div className={`col-xl-${isGestionnaire ? '6' : '12'} mb-3`}>
          <div className="card h-100" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #28a745 0%, #40C4FF 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: 0.5
            }} />
            
            <div className="card-body p-4">
              <h5 className="card-title mb-4" style={{ color: '#006994', fontWeight: 'bold' }}>
                <i className="bi bi-star-fill me-2" style={{ color: '#FF6F00' }}></i>
                Top produits
                {isVendeur && <span className="ms-2 text-muted small">(mes ventes)</span>}
              </h5>
              
              {stats.topProduits.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Produit</th>
                        <th>Ventes</th>
                        {isGestionnaire && <th>CA</th>}
                        {isGestionnaire && <th>Bénéfice</th>}
                        {isGestionnaire && <th>Marge</th>}
                        {isVendeur && <th>Quantité</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topProduits.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong style={{ color: '#006994' }}>{p.nom}</strong>
                          </td>
                          <td>{p.ventes} {p.ventes > 1 ? 'ventes' : 'vente'}</td>
                          {isGestionnaire && (
                            <>
                              <td>{formatPrice(p.ca)}</td>
                              <td style={{ color: '#28a745', fontWeight: 'bold' }}>
                                +{formatPrice(p.benefice)}
                              </td>
                              <td>
                                <span className="badge bg-success">
                                  {p.marge}%
                                </span>
                              </td>
                            </>
                          )}
                          {isVendeur && (
                            <td>
                              <span className="badge bg-info">
                                {p.quantite_totale || 0} unités
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Produits en perte (visible seulement pour gestionnaire) */}
        {isGestionnaire && (
          <div className="col-xl-6 mb-3">
            <div className="card h-100" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '4px',
                background: 'linear-gradient(45deg, #dc3545 0%, #40C4FF 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                opacity: 0.5
              }} />
              
              <div className="card-body p-4">
                <h5 className="card-title mb-4" style={{ color: '#006994', fontWeight: 'bold' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#FF6F00' }}></i>
                  Produits vendus à perte
                </h5>
                
                {stats.produitsEnPerte.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th>Produit</th>
                          <th>Ventes</th>
                          <th>Prix vente</th>
                          <th>Prix achat</th>
                          <th>Perte</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.produitsEnPerte.map(p => (
                          <tr key={p.id}>
                            <td>
                              <strong style={{ color: '#006994' }}>{p.nom}</strong>
                            </td>
                            <td>{p.ventes} unités</td>
                            <td>{formatPrice(p.prix_vente)}</td>
                            <td className="text-danger">{formatPrice(p.prix_achat)}</td>
                            <td style={{ color: '#dc3545', fontWeight: 'bold' }}>
                              -{formatPrice(p.perte)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-check-circle" style={{ fontSize: '40px', color: '#28a745' }}></i>
                    <p className="mt-2">Aucun produit vendu à perte</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activité récente (adaptée) */}
      <div className="row">
        <div className="col-12">
          <div className="card" style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '4px',
              background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: 0.5
            }} />
            
            <div className="card-body p-4">
              <h5 className="card-title mb-4" style={{ color: '#006994', fontWeight: 'bold' }}>
                <i className="bi bi-clock-history me-2" style={{ color: '#FF6F00' }}></i>
                Activité récente
                {isVendeur && <span className="ms-2 text-muted small">(mes actions)</span>}
              </h5>
              
              {stats.activiteRecente.length > 0 ? (
                <div className="timeline">
                  {stats.activiteRecente.map((item, index) => (
                    <div key={item.id} className="d-flex mb-3 pb-2" style={{
                      borderBottom: index < stats.activiteRecente.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <div className="me-3">
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '20px',
                          backgroundColor: 
                            item.type === 'vente' ? '#28a745' :
                            item.type === 'commande' ? '#FF6F00' :
                            item.type === 'stock_entree' ? '#006994' : 
                            item.type === 'stock_sortie' ? '#dc3545' :
                            item.type === 'client' ? '#17a2b8' : '#6c757d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className={`bi ${
                            item.type === 'vente' ? 'bi-cart' :
                            item.type === 'commande' ? 'bi-truck' :
                            item.type === 'stock_entree' ? 'bi-box-arrow-in-down' :
                            item.type === 'stock_sortie' ? 'bi-box-arrow-up' :
                            item.type === 'client' ? 'bi-person-plus' : 'bi-clock'
                          }`} style={{ color: 'white', fontSize: '18px' }}></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <strong style={{ color: '#006994' }}>{item.description}</strong>
                          <small className="text-muted">{item.date}</small>
                        </div>
                        {item.montant && (
                          <p className="mb-0">
                            <span className="text-success">+{formatPrice(item.montant)}</span>
                          </p>
                        )}
                        {item.quantite && (
                          <p className="mb-0 text-warning">{item.quantite}</p>
                        )}
                        {item.nom && !item.montant && !item.quantite && (
                          <p className="mb-0">{item.nom}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>Aucune activité récente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </>)}
    </div>
  );
};

export default Dashboard;