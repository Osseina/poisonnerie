import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { getRapportsStock } from '../../../services/stockService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StockRapports = () => {
  const [periode, setPeriode] = useState('mois');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rapports, setRapports] = useState(null);

  useEffect(() => {
    loadRapports();
  }, [periode]);

  const loadRapports = async () => {
    setLoading(true);
    try {
      const response = await getRapportsStock(periode);
      setRapports(response.data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement rapports:', err);
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Erreur: {error}
      </div>
    );
  }

  if (!rapports) {
    return (
      <div className="alert alert-info">
        Aucune donnée disponible
      </div>
    );
  }

  // Données pour le graphique des mouvements
  const mouvementsData = {
    labels: rapports.mouvements_mensuels.map(m => {
      const [annee, mois] = m.mois.split('-');
      return `${mois}/${annee}`;
    }),
    datasets: [
      {
        label: 'Entrées',
        data: rapports.mouvements_mensuels.map(m => m.entrees),
        backgroundColor: '#28a745',
        borderRadius: 6
      },
      {
        label: 'Sorties',
        data: rapports.mouvements_mensuels.map(m => m.sorties),
        backgroundColor: '#FF6F00',
        borderRadius: 6
      }
    ]
  };

  // Données pour le graphique des catégories
  const categoriesData = {
    labels: rapports.repartition_categories.map(c => c.nom_categorie || 'Sans catégorie'),
    datasets: [
      {
        data: rapports.repartition_categories.map(c => c.valeur_stock || 0),
        backgroundColor: ['#006994', '#28a745', '#FF6F00', '#40C4FF', '#66BB6A', '#dc3545', '#6f42c1'],
        borderWidth: 0
      }
    ]
  };

  // Options des graphiques
  const mouvementsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mouvements de stock par mois'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantité'
        }
      }
    }
  };

  const categoriesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Répartition par catégorie (valeur)'
      }
    }
  };

  return (
    <div>
      {/* Période */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            style={{ borderRadius: '8px' }}
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card" style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <h6 style={{ color: '#666' }}>Total entrées</h6>
              <h3 style={{ color: '#28a745' }}>{rapports.periode.courante.entrees}</h3>
              <small className={rapports.periode.variation_entrees >= 0 ? 'text-success' : 'text-danger'}>
                {rapports.periode.variation_entrees >= 0 ? '+' : ''}{rapports.periode.variation_entrees}% vs période précédente
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <h6 style={{ color: '#666' }}>Total sorties</h6>
              <h3 style={{ color: '#FF6F00' }}>{rapports.periode.courante.sorties}</h3>
              <small className={rapports.periode.variation_sorties >= 0 ? 'text-success' : 'text-danger'}>
                {rapports.periode.variation_sorties >= 0 ? '+' : ''}{rapports.periode.variation_sorties}% vs période précédente
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <h6 style={{ color: '#666' }}>Rotation stock</h6>
              <h3 style={{ color: '#006994' }}>{rapports.periode.rotation_stock}</h3>
              <small className="text-muted">fois / période</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <h6 style={{ color: '#666' }}>Valeur stock</h6>
              <h3 style={{ color: '#28a745' }}>{formatPrice(rapports.stats_generales.valeur_totale_stock)}</h3>
              <small className="text-muted">Stock faible: {rapports.stats_generales.produits_stock_faible} produit(s)</small>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4" style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <Bar data={mouvementsData} options={mouvementsOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4" style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div className="card-body">
              <Pie data={categoriesData} options={categoriesOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des produits les plus actifs */}
      <div className="card" style={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: 'none'
      }}>
        <div className="card-body">
          <h5 style={{
            fontFamily: 'Montserrat, sans-serif',
            color: '#006994',
            fontSize: '1.1rem',
            marginBottom: '15px'
          }}>
            Top 5 des produits les plus mouvementés
          </h5>
          
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Entrées</th>
                <th>Sorties</th>
                <th>Stock actuel</th>
              </tr>
            </thead>
            <tbody>
              {rapports.top_produits.map((produit, index) => (
                <tr key={index}>
                  <td>{produit.nom_produit}</td>
                  <td>{produit.categorie || '-'}</td>
                  <td className="text-success">{produit.entrees}</td>
                  <td className="text-warning">{produit.sorties}</td>
                  <td>{produit.stock_actuel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockRapports;