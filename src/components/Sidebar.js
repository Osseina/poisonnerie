import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SECTIONS_STOCK } from '../pages/stocks/StockManager';

// Entrées du menu de gauche (le sous-menu Stock est construit à part)
const ENTREES_MENU = [
  { id: 'accueil', to: '/dashboard', label: 'Accueil', icon: 'bi-grid', roles: ['gestionnaire', 'vendeur'] },
  { id: 'ventes', to: '/ventes', label: 'Ventes', icon: 'bi-cash-stack', roles: ['gestionnaire', 'vendeur'] },
  { id: 'commandes', to: '/commandes', label: 'Commandes', icon: 'bi-cart', roles: ['gestionnaire', 'vendeur'] },
  { id: 'produits', to: '/produits', label: 'Produits', icon: 'bi-box', roles: ['gestionnaire', 'vendeur'] },
  { id: 'stock', label: 'Stock', icon: 'bi-boxes', roles: ['gestionnaire', 'vendeur'] },
  { id: 'categories', to: '/categories', label: 'Catégories', icon: 'bi-tags', roles: ['gestionnaire'] },
  { id: 'clients', to: '/clients', label: 'Clients', icon: 'bi-person-lines-fill', roles: ['gestionnaire', 'vendeur'] },
  { id: 'fournisseurs', to: '/fournisseurs', label: 'Fournisseurs', icon: 'bi-truck', roles: ['gestionnaire'] },
  { id: 'utilisateurs', to: '/users', label: 'Utilisateurs', icon: 'bi-people', roles: ['gestionnaire'] },
];

const Sidebar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  // Mettre à jour si l'utilisateur change dans un autre onglet
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdate', handleStorageChange);
    };
  }, []);

  const isGestionnaire = user.profile === 'gestionnaire';
  const isVendeur = user.profile === 'vendeur';

  const location = useLocation();

  // Page active (la page elle-même ou une de ses sous-pages)
  const estActif = (to) => location.pathname === to || location.pathname.startsWith(to + '/');
  const stockActif = location.pathname.startsWith('/stocks') || location.pathname === '/demandes-validation';
  const [stockOuvert, setStockOuvert] = useState(stockActif);
  useEffect(() => {
    if (stockActif) setStockOuvert(true);
  }, [stockActif]);

  // Sur mobile (< 1200px) le menu est caché par défaut et s'ouvre avec la classe
  // "toggle-sidebar" sur <body>. On le referme après chaque changement de page.
  useEffect(() => {
    if (window.innerWidth < 1200) {
      document.body.classList.remove('toggle-sidebar');
    }
  }, [location.pathname]);

  // Sur mobile, toucher le contenu à côté du menu ouvert le referme
  useEffect(() => {
    const fermerSiMobile = (e) => {
      if (window.innerWidth >= 1200 || !document.body.classList.contains('toggle-sidebar')) return;
      if (e.target.closest('#sidebar') || e.target.closest('.toggle-sidebar-btn')) return;
      document.body.classList.remove('toggle-sidebar');
    };
    document.addEventListener('click', fermerSiMobile);
    return () => document.removeEventListener('click', fermerSiMobile);
  }, []);

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav">
        {ENTREES_MENU.filter((e) => e.roles.includes(user.profile)).map((e) => {
          // Sous-menu Stock
          if (e.id === 'stock') {
            const sousEntrees = [
              ...SECTIONS_STOCK.filter((s) => s.roles.includes(user.profile))
                .map((s) => ({ to: `/stocks/${s.id}`, label: s.label, icon: s.icon })),
              ...(isGestionnaire ? [{ to: '/demandes-validation', label: 'Demandes de validation', icon: 'bi-check2-square' }] : []),
            ];
            return (
              <li className="nav-item" key={e.id}>
                <button
                  type="button"
                  className={`nav-link w-100 border-0 ${stockActif ? '' : 'collapsed'}`}
                  aria-expanded={stockOuvert}
                  onClick={() => setStockOuvert((o) => !o)}
                >
                  <i className={`bi ${e.icon}`}></i>
                  <span>{e.label}</span>
                  <i className={`bi bi-chevron-down ms-auto sidebar-chevron ${stockOuvert ? 'ouvert' : ''}`}></i>
                </button>
                <ul className={`nav-content collapse ${stockOuvert ? 'show' : ''}`}>
                  {sousEntrees.map((s) => (
                    <li key={s.to}>
                      <Link to={s.to} className={estActif(s.to) ? 'active' : ''}>
                        <i className={`bi ${s.icon}`}></i>
                        <span>{s.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }
          return (
            <li className="nav-item" key={e.id}>
              <Link className={`nav-link ${estActif(e.to) ? '' : 'collapsed'}`} to={e.to}>
                <i className={`bi ${e.icon}`}></i>
                <span>{e.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Petit indicateur de rôle (optionnel) */}
      <div className="mt-3 text-center small" style={{ color: '#999' }}>
        {isGestionnaire && <span><i className="bi bi-person-badge me-1"></i>Gestionnaire</span>}
        {isVendeur && <span><i className="bi bi-person me-1"></i>Vendeur</span>}
      </div>
    </aside>
  );
};

export default Sidebar;