import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntreesStock, updateEntreeStock } from '../../../services/stockService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StockEntreeListe = () => {
  const navigate = useNavigate();
  const [entrees, setEntrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    quantite: '',
    prix_vente: '',
    lot_prix_achat_gros: '',
    numero_livraison: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    produit_id: '',
    fournisseur_id: '',
    date_debut: '',
    date_fin: ''
  });

  useEffect(() => {
    loadEntrees();
  }, [pagination.page, pagination.limit, filters]);

  const loadEntrees = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.produit_id) cleanFilters.produit_id = filters.produit_id;
      if (filters.fournisseur_id) cleanFilters.fournisseur_id = filters.fournisseur_id;
      if (filters.date_debut) cleanFilters.date_debut = filters.date_debut;
      if (filters.date_fin) cleanFilters.date_fin = filters.date_fin;

      const response = await getEntreesStock(cleanFilters, pagination.page, pagination.limit);
      setEntrees(response.data.entrees);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ produit_id: '', fournisseur_id: '', date_debut: '', date_fin: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const startEdit = (entree) => {
    setEditingId(entree.id);
    setEditForm({
      quantite: entree.quantite,
      prix_vente: entree.prix_vente || '',
      lot_prix_achat_gros: entree.lot_prix_achat_gros || '',
      numero_livraison: entree.numero_livraison || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      setError('');
      const updateData = {};
      
      if (editForm.quantite) updateData.quantite = parseFloat(editForm.quantite);
      if (editForm.prix_vente) updateData.prix_vente = parseFloat(editForm.prix_vente);
      if (editForm.lot_prix_achat_gros) updateData.lot_prix_achat_gros = parseFloat(editForm.lot_prix_achat_gros);
      if (editForm.numero_livraison) updateData.numero_livraison = editForm.numero_livraison;

      await updateEntreeStock(id, updateData);
      setSuccess('Entrée modifiée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      setEditingId(null);
      loadEntrees();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price || 0);
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

  if (loading && entrees.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: '#FF6F00' }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-danger" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545',
          marginBottom: '20px'
        }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #66BB6A',
          marginBottom: '20px'
        }}>
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </div>
      )}

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3" style={{ color: '#006994', fontWeight: 'bold' }}>
            <i className="bi bi-funnel me-2" style={{ color: '#FF6F00' }}></i>
            Filtres
          </h5>
          
          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                name="date_debut"
                value={filters.date_debut}
                onChange={handleFilterChange}
                placeholder="Date début"
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                name="date_fin"
                value={filters.date_fin}
                onChange={handleFilterChange}
                placeholder="Date fin"
              />
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={handleResetFilters}
              >
                <i className="bi bi-eraser me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des entrées */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-4" style={{ color: '#006994', fontWeight: 'bold' }}>
            <i className="bi bi-box-arrow-in-down me-2" style={{ color: '#28a745' }}></i>
            Liste des entrées de stock
            {pagination.total > 0 && (
              <span className="ms-2" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                ({pagination.total} entrée{pagination.total > 1 ? 's' : ''})
              </span>
            )}
          </h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Fournisseur</th>
                  <th>Quantité</th>
                  <th>Prix vente</th>
                  <th>Prix achat</th>
                  <th>N° livraison</th>
                  <th>Créateur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entrees.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <i className="bi bi-inbox fs-1 d-block mb-2" style={{ color: '#ccc' }}></i>
                      Aucune entrée trouvée
                    </td>
                  </tr>
                ) : (
                  entrees.map(entree => (
                    <tr key={entree.id}>
                      {editingId === entree.id ? (
                        // Mode édition
                        <>
                          <td>{formatDate(entree.created_at)}</td>
                          <td><strong>{entree.nom_produit}</strong></td>
                          <td>{entree.fournisseur_nom || '-'}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              name="quantite"
                              value={editForm.quantite}
                              onChange={handleEditChange}
                              step="0.001"
                              style={{ width: '100px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              name="prix_vente"
                              value={editForm.prix_vente}
                              onChange={handleEditChange}
                              step="0.01"
                              style={{ width: '100px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              name="lot_prix_achat_gros"
                              value={editForm.lot_prix_achat_gros}
                              onChange={handleEditChange}
                              step="0.01"
                              style={{ width: '100px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="numero_livraison"
                              value={editForm.numero_livraison}
                              onChange={handleEditChange}
                              style={{ width: '120px' }}
                            />
                          </td>
                          <td>{entree.createur_nom || '-'}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => saveEdit(entree.id)}
                                title="Enregistrer"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={cancelEdit}
                                title="Annuler"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // Mode visualisation
                        <>
                          <td>{formatDate(entree.created_at)}</td>
                          <td><strong style={{ color: '#006994' }}>{entree.nom_produit}</strong></td>
                          <td>{entree.fournisseur_nom || '-'}</td>
                          <td>
                            <span className="badge bg-info">
                              {entree.quantite} {entree.type_vente === 'poids' ? 'kg' : 'unités'}
                            </span>
                          </td>
                          <td>
                            {entree.prix_vente ? (
                              <span className="text-success fw-bold">{formatPrice(entree.prix_vente)}</span>
                            ) : '-'}
                          </td>
                          <td>
                            {entree.lot_prix_achat_gros ? (
                              <span className="text-warning">{formatPrice(entree.lot_prix_achat_gros)}</span>
                            ) : '-'}
                          </td>
                          <td>{entree.numero_livraison || '-'}</td>
                          <td>{entree.createur_nom || '-'}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <div style={{ position: 'relative' }}>
                                <button
                                  className="btn btn-sm"
                                  onClick={() => startEdit(entree)}
                                  style={{
                                    backgroundColor: '#FF6F00',
                                    color: 'white',
                                    borderRadius: '6px',
                                    border: 'none',
                                    padding: '6px 10px'
                                  }}
                                  onMouseEnter={() => setShowTooltip(`edit-${entree.id}`)}
                                  onMouseLeave={() => setShowTooltip('')}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                {showTooltip === `edit-${entree.id}` && (
                                  <Tooltip text="Modifier" />
                                )}
                              </div>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                <select
                  className="form-select form-select-sm"
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                  style={{ width: '120px' }}
                >
                  <option value="10">10 par page</option>
                  <option value="20">20 par page</option>
                  <option value="50">50 par page</option>
                  <option value="100">100 par page</option>
                </select>
              </div>
              
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                      style={{ color: '#006994' }}
                    >
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                  </li>
                  <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      style={{ color: '#006994' }}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  
                  <li className="page-item active">
                    <span className="page-link" style={{ backgroundColor: '#006994', borderColor: '#006994' }}>
                      {pagination.page}
                    </span>
                  </li>
                  
                  <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      style={{ color: '#006994' }}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                  <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
                      style={{ color: '#006994' }}
                    >
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
              
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                Page {pagination.page} sur {pagination.pages}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockEntreeListe;