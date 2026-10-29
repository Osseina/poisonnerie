import React from 'react';

const CommandeArticles = ({ articles, produits, onAjouter, onModifier, onSupprimer, readonly = false }) => {
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const calculerTotal = () => {
    return articles.reduce((sum, a) => sum + (a.quantite * a.prix_unitaire), 0);
  };

  // ✅ Fonction pour formater la quantité
  const formatQuantite = (value, type_vente) => {
    if (type_vente === 'poids') {
      return parseFloat(value).toFixed(3);
    }
    return parseInt(value);
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <i className="bi bi-cart-x" style={{ fontSize: '3rem' }}></i>
        <p className="mt-2">Aucun article dans la commande</p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unit.</th>
              <th>Total</th>
              {!readonly && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => {
              const total = article.quantite * article.prix_unitaire;
              
              return (
                <tr key={article.id || index}>
                  <td>
                    <strong>{article.nom_produit}</strong>
                    {article.code_produit && (
                      <small className="d-block text-muted">{article.code_produit}</small>
                    )}
                  </td>
                  <td style={{ width: '120px' }}>
                    {readonly ? (
                      article.type_vente === 'poids' 
                        ? article.quantite.toFixed(3) + ' kg'
                        : article.quantite + ' unité(s)'
                    ) : (
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={article.quantite}
                        min="0.001"
                        step={article.type_vente === 'poids' ? '0.001' : '1'}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (article.type_vente === 'poids') {
                            value = parseFloat(value) || 0;
                          } else {
                            value = parseInt(value) || 0;
                          }
                          onModifier(index, value);
                        }}
                      />
                    )}
                    {article.stock_dispo && (
                      <small className="text-muted d-block">
                        Stock: {article.type_vente === 'poids' 
                          ? article.stock_dispo.toFixed(3) + ' kg'
                          : article.stock_dispo + ' unité(s)'}
                      </small>
                    )}
                  </td>
                  <td>{formatPrice(article.prix_unitaire)}</td>
                  <td className="fw-bold text-primary">{formatPrice(total)}</td>
                  {!readonly && (
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onSupprimer(index)}
                        title="Supprimer"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="table-light">
            <tr>
              <td colSpan="3" className="text-end fw-bold">Total général:</td>
              <td className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                {formatPrice(calculerTotal())}
              </td>
              {!readonly && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default CommandeArticles;