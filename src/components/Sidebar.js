import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // IMPORTANT: Importer Link

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

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav">
        {/* Accueil - visible pour tous */}
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard">
            <i className="bi bi-grid"></i>
            <span>Accueil</span>
          </Link>
        </li>
        
        {/* 🔒 UTILISATEURS - visible seulement pour gestionnaire */}
        {isGestionnaire && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/users">
              <i className="bi bi-people"></i>
              <span>Utilisateurs</span>
            </Link>
          </li>
        )}

        {/* 🔒 FOURNISSEURS - visible seulement pour gestionnaire */}
        {isGestionnaire && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/fournisseurs">
              <i className="bi bi-truck"></i>
              <span>Fournisseurs</span>
            </Link>
          </li>
        )}

        {/* 🔒 CLIENTS - visible pour gestionnaire ET vendeur */}
        {(isGestionnaire || isVendeur) && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/clients">
              <i className="bi bi-people"></i>
              <span>Clients</span>
            </Link>
          </li>
        )}

        {/* 🔒 CATÉGORIES - visible seulement pour gestionnaire */}
        {isGestionnaire && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/categories">
              <i className="bi bi-tags"></i>
              <span>Catégories</span>
            </Link>
          </li>
        )}

        {/* 🔒 PRODUITS - visible pour gestionnaire ET vendeur */}
        {(isGestionnaire || isVendeur) && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/produits">
              <i className="bi bi-box"></i>
              <span>Produits</span>
            </Link>
          </li>
        )}

        {/* 🔒 GESTION DES STOCKS - visible pour gestionnaire ET vendeur */}
        {(isGestionnaire || isVendeur) && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/stocks">
              <i className="bi bi-boxes"></i>
              <span>Gestion des stocks</span>
            </Link>
          </li>
        )}

        {/* 🔒 COMMANDES - visible pour gestionnaire ET vendeur */}
        {(isGestionnaire || isVendeur) && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/commandes">
              <i className="bi bi-cart"></i>
              <span>Commandes</span>
            </Link>
          </li>
        )}

        {/* 🔒 VENTES - visible pour gestionnaire ET vendeur */}
        {(isGestionnaire || isVendeur) && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/ventes">
              <i className="bi bi-cash-stack"></i>
              <span>Ventes</span>
            </Link>
          </li>
        )}

        {/* 🔒 DEMANDES DE VALIDATION - visible pour gestionnaire */}
        {isGestionnaire && (
          <li className="nav-item">
            <Link className="nav-link collapsed" to="/demandes-validation">
              <i className="bi bi-check-circle"></i>
              <span>Demandes validation</span>
            </Link>
          </li>
        )}
        
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