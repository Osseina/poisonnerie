// pages/stocks/DemandesValidation.js
import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '../../config';

const BLEU = '#006994';
const ORANGE = '#FF6F00';

const FILTRES = [
  { id: 'en_attente', label: 'En attente', icon: 'bi-hourglass-split', couleur: '#e0a800' },
  { id: 'toutes', label: 'Toutes', icon: 'bi-list-ul', couleur: BLEU },
  { id: 'validees', label: 'Validées', icon: 'bi-check-circle', couleur: '#28a745' },
  { id: 'rejetees', label: 'Rejetées', icon: 'bi-x-circle', couleur: '#dc3545' },
];

const STATUTS = {
  en_attente: { bg: '#ffc107', color: '#212529', text: 'En attente', icon: 'bi-hourglass-split' },
  valide: { bg: '#28a745', color: '#fff', text: 'Validée', icon: 'bi-check-circle' },
  rejete: { bg: '#dc3545', color: '#fff', text: 'Rejetée', icon: 'bi-x-circle' },
};

const TYPES = {
  perte: { icon: 'bi-exclamation-triangle', label: 'Perte' },
  don: { icon: 'bi-gift', label: 'Don' },
  retour_fournisseur: { icon: 'bi-truck', label: 'Retour fournisseur' },
};

const formatQuantite = (d) =>
  `${parseFloat(d.quantite).toLocaleString('fr-FR')} ${d.type_vente === 'poids' ? 'kg' : 'unité(s)'}`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const DemandesValidation = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('en_attente');
  const [enCours, setEnCours] = useState(null); // id de la demande en traitement
  // Fenêtre de confirmation : { demande, action: 'valider' | 'rejeter' }
  const [dialogue, setDialogue] = useState(null);
  const [motifRejet, setMotifRejet] = useState('');

  const chargerDemandes = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stock/demandes-attente.php?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setDemandes(data.demandes || []);
      } else {
        toast.error(data.message || 'Impossible de charger les demandes');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    chargerDemandes();
  }, [chargerDemandes]);

  const ouvrirDialogue = (demande, action) => {
    setMotifRejet('');
    setDialogue({ demande, action });
  };

  const fermerDialogue = () => {
    if (enCours) return;
    setDialogue(null);
  };

  const confirmerAction = async () => {
    if (!dialogue) return;
    const { demande, action } = dialogue;
    const motif = motifRejet.trim();
    if (action === 'rejeter' && !motif) {
      toast.error('Indiquez le motif du rejet');
      return;
    }

    setEnCours(demande.id);
    try {
      const token = localStorage.getItem('token');
      const body = action === 'valider'
        ? { mouvement_id: demande.id, action: 'valider' }
        : { mouvement_id: demande.id, action: 'rejeter', motif_rejet: motif };

      const response = await fetch(`${API_BASE_URL}/stock/valider-demande.php`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(action === 'valider' ? 'Demande validée' : 'Demande rejetée');
        setDialogue(null);
        chargerDemandes();
      } else {
        toast.error(data.message || 'L\'opération a échoué');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setEnCours(null);
    }
  };

  const filtreActif = FILTRES.find((f) => f.id === filter);

  return (
    <div className="pagetitle">
      <Toaster position="top-center" />
      <h1>Demandes de validation</h1>

      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="#/">Accueil</a></li>
          <li className="breadcrumb-item"><a href="#/stocks">Stock</a></li>
          <li className="breadcrumb-item active">Demandes</li>
        </ol>
      </nav>

      <div className="card" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div className="card-body pt-3">
          {/* Filtres */}
          <div className="dv-filtres" role="tablist" aria-label="Filtrer les demandes">
            {FILTRES.map((f) => {
              const actif = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={actif}
                  className="dv-filtre"
                  onClick={() => setFilter(f.id)}
                  style={{
                    borderColor: actif ? f.couleur : '#dfe3e8',
                    backgroundColor: actif ? f.couleur : '#fff',
                    color: actif ? '#fff' : '#495057',
                  }}
                >
                  <i className={`bi ${f.icon}`} style={{ color: actif ? '#fff' : f.couleur }}></i>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          <h5 className="card-title d-flex align-items-center gap-2 mb-2" style={{ color: BLEU }}>
            <i className={`bi ${filtreActif.icon}`} style={{ color: ORANGE }}></i>
            {filtreActif.label}
            {!loading && (
              <span className="badge rounded-pill" style={{ backgroundColor: '#e9f3f8', color: BLEU }}>
                {demandes.length}
              </span>
            )}
          </h5>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: BLEU }} role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : demandes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              <p className="mb-0">
                {filter === 'en_attente' ? 'Aucune demande en attente. Tout est à jour.' : 'Aucune demande trouvée'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Type</th>
                    <th>Quantité</th>
                    <th>Demandeur</th>
                    <th>Date</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((d) => {
                    const statut = STATUTS[d.statut] || STATUTS.en_attente;
                    const type = TYPES[d.type_sortie] || { icon: 'bi-question-circle', label: d.type_sortie };
                    const occupe = enCours === d.id;
                    return (
                      <tr key={d.id}>
                        <td><strong>{d.nom_produit}</strong></td>
                        <td>
                          <i className={`bi ${type.icon} me-1`} style={{ color: ORANGE }}></i>
                          {type.label}
                        </td>
                        <td>{formatQuantite(d)}</td>
                        <td>{d.createur}</td>
                        <td>{formatDate(d.created_at)}</td>
                        <td>
                          <span title={d.motif}>
                            {d.motif?.substring(0, 40)}
                            {d.motif?.length > 40 ? '…' : ''}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: statut.bg, color: statut.color }}>
                            <i className={`bi ${statut.icon} me-1`}></i>
                            {statut.text}
                          </span>
                          {d.motif_rejet && (
                            <small className="d-block text-danger mt-1" title={d.motif_rejet}>
                              Motif : {d.motif_rejet.substring(0, 40)}{d.motif_rejet.length > 40 ? '…' : ''}
                            </small>
                          )}
                        </td>
                        <td>
                          {d.statut === 'en_attente' && (
                            <div className="dv-actions">
                              <button
                                type="button"
                                className="btn dv-btn"
                                style={{ backgroundColor: '#28a745', color: '#fff' }}
                                disabled={occupe}
                                onClick={() => ouvrirDialogue(d, 'valider')}
                              >
                                <i className="bi bi-check-lg me-1"></i>Valider
                              </button>
                              <button
                                type="button"
                                className="btn dv-btn"
                                style={{ backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545' }}
                                disabled={occupe}
                                onClick={() => ouvrirDialogue(d, 'rejeter')}
                              >
                                <i className="bi bi-x-lg me-1"></i>Rejeter
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

      {/* Fenêtre de confirmation / motif de rejet */}
      {dialogue && (
        <div className="dv-overlay" onClick={fermerDialogue}>
          <div className="dv-dialogue" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h5 style={{ color: dialogue.action === 'valider' ? '#28a745' : '#dc3545', fontWeight: 700 }}>
              <i className={`bi ${dialogue.action === 'valider' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
              {dialogue.action === 'valider' ? 'Valider la demande' : 'Rejeter la demande'}
            </h5>
            <p className="mb-3" style={{ color: '#444' }}>
              <strong>{dialogue.demande.nom_produit}</strong> :{' '}
              {formatQuantite(dialogue.demande)}{' '}
              ({(TYPES[dialogue.demande.type_sortie] || { label: dialogue.demande.type_sortie }).label.toLowerCase()}),
              demandé par {dialogue.demande.createur}.
            </p>

            {dialogue.action === 'rejeter' && (
              <div className="mb-3">
                <label htmlFor="motif-rejet" className="form-label fw-semibold">Motif du rejet</label>
                <textarea
                  id="motif-rejet"
                  className="form-control"
                  rows="3"
                  autoFocus
                  value={motifRejet}
                  onChange={(e) => setMotifRejet(e.target.value)}
                ></textarea>
              </div>
            )}

            <div className="dv-dialogue-boutons">
              <button type="button" className="btn btn-light" onClick={fermerDialogue} disabled={!!enCours}>
                Annuler
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: dialogue.action === 'valider' ? '#28a745' : '#dc3545', color: '#fff' }}
                onClick={confirmerAction}
                disabled={!!enCours}
              >
                {enCours ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className={`bi ${dialogue.action === 'valider' ? 'bi-check-lg' : 'bi-x-lg'} me-1`}></i>
                )}
                {dialogue.action === 'valider' ? 'Valider' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dv-filtres {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 4px 0 12px;
        }
        .dv-filtre {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        }
        .dv-actions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
          flex-wrap: nowrap;
        }
        .dv-btn {
          border: none;
          border-radius: 8px;
          font-weight: 600;
          padding: 6px 12px;
          white-space: nowrap;
        }
        .dv-btn:disabled { opacity: 0.6; }
        .dv-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 16px;
        }
        .dv-dialogue {
          background: #fff;
          border-radius: 14px;
          padding: 20px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        }
        .dv-dialogue-boutons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        @media (max-width: 767.98px) {
          .dv-filtres {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .dv-filtre { padding: 9px 8px !important; font-size: 0.85rem !important; }
          .dv-actions { width: 100%; }
          .dv-actions .dv-btn { flex: 1 1 0; min-height: 40px; }
          .dv-dialogue { align-self: flex-end; border-radius: 16px 16px 12px 12px; }
          .dv-dialogue-boutons .btn { flex: 1 1 0; min-height: 42px; }
        }
      `}</style>
    </div>
  );
};

export default DemandesValidation;
