import { API_BASE_URL } from '../../config';
// pages/stock/DemandesValidation.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DemandesValidation = () => {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('toutes'); // toutes, en_attente, validees, rejetees

  useEffect(() => {
    chargerDemandes();
  }, [filter]);

  const chargerDemandes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stock/demandes-attente.php?filter=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDemandes(data.demandes);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const validerDemande = async (id) => {
    if (!window.confirm('Valider cette demande ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stock/valider-demande.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mouvement_id: id, action: 'valider' })
      });
      const data = await response.json();
      if (data.success) {
        chargerDemandes();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const rejeterDemande = async (id) => {
    const motif = prompt('Motif du rejet :');
    if (!motif) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stock/valider-demande.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          mouvement_id: id, 
          action: 'rejeter',
          motif_rejet: motif 
        })
      });
      const data = await response.json();
      if (data.success) {
        chargerDemandes();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'en_attente': { bg: '#ffc107', text: 'En attente' },
      'valide': { bg: '#28a745', text: 'Validé' },
      'rejete': { bg: '#dc3545', text: 'Rejeté' }
    };
    return badges[statut] || badges['en_attente'];
  };

  const getTypeIcon = (type) => {
    const icons = {
      'perte': 'bi-exclamation-triangle',
      'don': 'bi-gift',
      'retour_fournisseur': 'bi-truck'
    };
    return icons[type] || 'bi-question';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="pagetitle">
      <h1>Demandes de validation</h1>
      
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Accueil</a></li>
          <li className="breadcrumb-item"><a href="/stock">Stock</a></li>
          <li className="breadcrumb-item active">Demandes</li>
        </ol>
      </nav>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title">Liste des demandes</h5>
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${filter === 'toutes' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('toutes')}
              >
                Toutes
              </button>
              <button 
                className={`btn btn-sm ${filter === 'en_attente' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setFilter('en_attente')}
              >
                En attente
              </button>
              <button 
                className={`btn btn-sm ${filter === 'validees' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setFilter('validees')}
              >
                Validées
              </button>
              <button 
                className={`btn btn-sm ${filter === 'rejetees' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => setFilter('rejetees')}
              >
                Rejetées
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : demandes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1"></i>
              <p>Aucune demande trouvée</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Demandeur</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map(d => {
                    const badge = getStatutBadge(d.statut);
                    return (
                      <tr key={d.id}>
                        <td>{formatDate(d.created_at)}</td>
                        <td>
                          <i className={`bi ${getTypeIcon(d.type_sortie)} me-2`}></i>
                          {d.type_sortie}
                        </td>
                        <td><strong>{d.nom_produit}</strong></td>
                        <td>{d.quantite} {d.type_vente === 'poids' ? 'kg' : 'unités'}</td>
                        <td>{d.createur}</td>
                        <td>
                          <span title={d.motif}>
                            {d.motif?.substring(0, 30)}
                            {d.motif?.length > 30 ? '...' : ''}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: badge.bg }}>
                            {badge.text}
                          </span>
                          {d.motif_rejet && (
                            <small className="d-block text-danger" title={d.motif_rejet}>
                              Rejet: {d.motif_rejet.substring(0, 20)}...
                            </small>
                          )}
                        </td>
                        <td>
                          {d.statut === 'en_attente' && (
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-success"
                                onClick={() => validerDemande(d.id)}
                                title="Valider"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button 
                                className="btn btn-danger"
                                onClick={() => rejeterDemande(d.id)}
                                title="Rejeter"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemandesValidation;