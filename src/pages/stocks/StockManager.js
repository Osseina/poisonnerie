// pages/stocks/StockManager.js
// Une section de stock par adresse (#/stocks/<section>), choisie depuis le sous-menu "Stock".
import React from 'react';
import { Navigate, useParams, useSearchParams, Link } from 'react-router-dom';
import StockEntree from './components/StockEntree';
import StockSortie from './components/StockSortie';
import StockInventaire from './components/StockInventaire';
import StockHistorique from './components/StockHistorique';
import StockNiveau from './components/StockNiveau';
import StockAlertes from './components/StockAlertes';
import StockRapports from './components/StockRapports';
import StockEntreeListe from './components/StockEntreeListe';
import StockSortieListe from './components/StockSortieListe';

// Sections du stock (aussi utilisées par le menu de gauche)
export const SECTIONS_STOCK = [
  { id: 'niveaux', label: 'Niveaux de stock', icon: 'bi-bar-chart', roles: ['gestionnaire', 'vendeur'] },
  { id: 'entree', label: 'Entrée de stock', icon: 'bi-box-arrow-in-down', roles: ['gestionnaire'] },
  { id: 'sortie', label: 'Sortie de stock', icon: 'bi-box-arrow-up', roles: ['gestionnaire', 'vendeur'] },
  { id: 'historique', label: 'Historique', icon: 'bi-clock-history', roles: ['gestionnaire', 'vendeur'] },
  { id: 'inventaire', label: 'Inventaire', icon: 'bi-clipboard-data', roles: ['gestionnaire'] },
  { id: 'alertes', label: 'Alertes', icon: 'bi-exclamation-triangle', roles: ['gestionnaire', 'vendeur'] },
  { id: 'rapports', label: 'Rapports', icon: 'bi-file-text', roles: ['gestionnaire'] },
];

// Vues de l'historique : tous les mouvements, ou les listes détaillées (modifiables)
const VUES_HISTORIQUE = [
  { id: 'tous', label: 'Tous les mouvements', icon: 'bi-clock-history', roles: ['gestionnaire', 'vendeur'] },
  { id: 'entrees', label: 'Entrées', icon: 'bi-box-arrow-in-down', roles: ['gestionnaire'] },
  { id: 'sorties', label: 'Sorties', icon: 'bi-box-arrow-up', roles: ['gestionnaire', 'vendeur'] },
];

const Historique = ({ profil }) => {
  const [params, setParams] = useSearchParams();
  const vues = VUES_HISTORIQUE.filter((v) => v.roles.includes(profil));
  const vue = vues.some((v) => v.id === params.get('vue')) ? params.get('vue') : 'tous';

  return (
    <>
      <div className="stock-vues" role="tablist" aria-label="Type de mouvements">
        {vues.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={vue === v.id}
            className={`stock-vue ${vue === v.id ? 'active' : ''}`}
            onClick={() => setParams(v.id === 'tous' ? {} : { vue: v.id })}
          >
            <i className={`bi ${v.icon}`}></i>
            <span>{v.label}</span>
          </button>
        ))}
      </div>
      {vue === 'entrees' && <StockEntreeListe />}
      {vue === 'sorties' && <StockSortieListe />}
      {vue === 'tous' && <StockHistorique />}
    </>
  );
};

const StockManager = () => {
  const { section } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profil = user.profile;

  const autorisees = SECTIONS_STOCK.filter((s) => s.roles.includes(profil));
  const courante = autorisees.find((s) => s.id === section);

  // Section inconnue ou non autorisée : retour aux niveaux de stock
  if (!courante) {
    return <Navigate to="/stocks/niveaux" replace />;
  }

  const contenu = {
    niveaux: <StockNiveau />,
    entree: <StockEntree />,
    sortie: <StockSortie />,
    historique: <Historique profil={profil} />,
    inventaire: <StockInventaire />,
    alertes: <StockAlertes />,
    rapports: <StockRapports />,
  }[courante.id];

  return (
    <div className="pagetitle">
      <h1 style={{
        fontFamily: 'Montserrat, sans-serif',
        color: '#006994',
        fontWeight: 'bold',
        marginBottom: '8px'
      }}>
        <i className={`bi ${courante.icon} me-2`} style={{ color: '#FF6F00' }}></i>
        {courante.label}
      </h1>

      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item"><Link to="/stocks/niveaux" style={{ color: '#006994' }}>Stock</Link></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>{courante.label}</li>
        </ol>
      </nav>

      <div className="card" style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '4px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          opacity: 0.6
        }} />
        <div className="card-body pt-3" key={courante.id}>
          {contenu}
        </div>
      </div>

      <style>{`
        .stock-vues {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }
        .stock-vue {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border: 1px solid #dfe3e8;
          border-radius: 999px;
          background: #fff;
          color: #495057;
          font-weight: 600;
          font-size: 0.88rem;
        }
        .stock-vue.active {
          background: #006994;
          border-color: #006994;
          color: #fff;
        }
        @media (max-width: 575.98px) {
          .stock-vues { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
          .stock-vue { justify-content: center; padding: 8px 4px; font-size: 0.78rem; }
          .stock-vue i { display: none; }
        }
      `}</style>
    </div>
  );
};

export default StockManager;
