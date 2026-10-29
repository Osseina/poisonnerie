import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSortiesStock, updateSortieStock } from '../../../services/stockService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StockSortieListe = () => {
  const navigate = useNavigate();
  const [sorties, setSorties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTooltip, setShowTooltip] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    quantite: '',
    type_sortie: '',
    motif: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    produit_id: '',
    type_sortie: '',
    date_debut: '',
    date_fin: ''
  });

  // Types de sortie pour le filtre
  const typesSortie = [
    { value: 'vente', label: 'Vente', color: '#28a745' },
    { value: 'perte', label: 'Perte', color: '#dc3545' },
    { value: 'don', label: 'Don', color: '#17a2b8' },
    { value: 'retour_fournisseur', label: 'Retour fournisseur', color: '#fd7e14' },
    { value: 'inventaire', label: 'Inventaire', color: '#6f42c1' },
    { value: 'modification', label: 'Modification', color: '#ffc107' }
  ];

  useEffect(() => {
    loadSorties();
  }, [pagination.page, pagination.limit, filters]);

  const loadSorties = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      if (filters.produit_id) cleanFilters.produit_id = filters.produit_id;
      if (filters.type_sortie) cleanFilters.type_sortie = filters.type_sortie;
      if (filters.date_debut) cleanFilters.date_debut = filters.date_debut;
      if (filters.date_fin) cleanFilters.date_fin = filters.date_fin;

      const response = await getSortiesStock(cleanFilters, pagination.page, pagination.limit);
      setSorties(response.data.sorties);
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
    setFilters({ produit_id: '', type_sortie: '', date_debut: '', date_fin: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const startEdit = (sortie) => {
    setEditingId(sortie.id);
    setEditForm({
      quantite: sortie.quantite,
      type_sortie: sortie.type_sortie || '',
      motif: sortie.motif || ''
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
      if (editForm.type_sortie) updateData.type_sortie = editForm.type_sortie;
      if (editForm.motif) updateData.motif = editForm.motif;

      await updateSortieStock(id, updateData);
      setSuccess('Sortie modifiée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      setEditingId(null);
      loadSorties();
    } catch (err) {
      setError(err.message);
    }
  };

  const getTypeStyle = (type) => {
    const found = typesSortie.find(t => t.value === type);
    return found || { color: '#6c757d', label: type };
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

  if (loading && sorties.length === 0) {
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
            <div className="col-md-2">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Du</label>
              <input
                type="date"
                className="form-control"
                name="date_debut"
                value={filters.date_debut}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#495057' }}>Au</label>
              <input
                type="date"
                className="form-control"
                name="date_fin"
                value={filters.date_fin}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                name="type_sortie"
                value={filters.type_sortie}
                onChange={handleFilterChange}
              >
                <option value="">Tous les types</option>
                {typesSortie.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
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

      {/* Tableau des sorties */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-4" style={{ color: '#006994', fontWeight: 'bold' }}>
            <i className="bi bi-box-arrow-up me-2" style={{ color: '#FF6F00' }}></i>
            Liste des sorties de stock
            {pagination.total > 0 && (
              <span className="ms-2" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                ({pagination.total} sortie{pagination.total > 1 ? 's' : ''})
              </span>
            )}
          </h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Type</th>
                  <th>Quantité</th>
                  <th>Motif</th>
                  <th>Créateur</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorties.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <i className="bi bi-inbox fs-1 d-block mb-2" style={{ color: '#ccc' }}></i>
                      Aucune sortie trouvée
                    </td>
                  </tr>
                ) : (
                  sorties.map(sortie => {
                    const typeInfo = getTypeStyle(sortie.type_sortie);
                    return (
                      <tr key={sortie.id}>
                        {editingId === sortie.id ? (
                          // Mode édition
                          <>
                            <td>{formatDate(sortie.created_at)}</td>
                            <td><strong>{sortie.nom_produit}</strong></td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                name="type_sortie"
                                value={editForm.type_sortie}
                                onChange={handleEditChange}
                                style={{ width: '140px' }}
                              >
                                {typesSortie.map(type => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                            </td>
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
                                type="text"
                                className="form-control form-control-sm"
                                name="motif"
                                value={editForm.motif}
                                onChange={handleEditChange}
                                aria-label="Motif"
                                style={{ width: '150px' }}
                              />
                            </td>
                            <td>{sortie.createur_nom || '-'}</td>
                            <td>
                              <span className="badge" style={{
                                backgroundColor: sortie.statut === 'valide' ? '#28a745' : '#ffc107',
                                color: 'white'
                              }}>
                                {sortie.statut === 'valide' ? 'Validé' : 'En attente'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => saveEdit(sortie.id)}
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
                            <td>{formatDate(sortie.created_at)}</td>
                            <td><strong style={{ color: '#006994' }}>{sortie.nom_produit}</strong></td>
                            <td>
                              <span className="badge" style={{
                                backgroundColor: typeInfo.color,
                                color: 'white',
                                padding: '5px 10px'
                              }}>
                                {typeInfo.label}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-danger">
                                -{sortie.quantite} {sortie.type_vente === 'poids' ? 'kg' : 'unités'}
                              </span>
                            </td>
                            <td>
                              {sortie.motif ? (
                                <span title={sortie.motif}>
                                  {sortie.motif.length > 30 ? sortie.motif.substring(0, 30) + '...' : sortie.motif}
                                </span>
                              ) : '-'}
                            </td>
                            <td>{sortie.createur_nom || '-'}</td>
                            <td>
                              <span className="badge" style={{
                                backgroundColor: sortie.statut === 'valide' ? '#28a745' : '#ffc107',
                                color: 'white'
                              }}>
                                {sortie.statut === 'valide' ? 'Validé' : 'En attente'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <div style={{ position: 'relative' }}>
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => startEdit(sortie)}
                                    style={{
                                      backgroundColor: '#FF6F00',
                                      color: 'white',
                                      borderRadius: '6px',
                                      border: 'none',
                                      padding: '6px 10px'
                                    }}
                                    onMouseEnter={() => setShowTooltip(`edit-${sortie.id}`)}
                                    onMouseLeave={() => setShowTooltip('')}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  {showTooltip === `edit-${sortie.id}` && (
                                    <Tooltip text="Modifier" />
                                  )}
                                </div>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
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

export default StockSortieListe;