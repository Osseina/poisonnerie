import React, { useState, useEffect } from 'react';
import StockEntree from './components/StockEntree';
import StockSortie from './components/StockSortie';
import StockInventaire from './components/StockInventaire';
import StockHistorique from './components/StockHistorique';
import StockNiveau from './components/StockNiveau';
import StockAlertes from './components/StockAlertes';
import StockRapports from './components/StockRapports';
// ✅ Nouveaux imports
import StockEntreeListe from './components/StockEntreeListe';
import StockSortieListe from './components/StockSortieListe';

const StockManager = () => {
  const [activeTab, setActiveTab] = useState('niveau');
  const [showTooltip, setShowTooltip] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const isGestionnaire = user.profile === 'gestionnaire';
  const isVendeur = user.profile === 'vendeur';

  // ✅ Définir tous les onglets disponibles avec leurs rôles
  const allTabs = [
    { id: 'niveau', label: 'Niveaux', icon: 'bi-bar-chart', color: '#006994', description: 'Vue d\'ensemble des stocks', roles: ['gestionnaire', 'vendeur'] },
    { id: 'entree', label: 'Entrée', icon: 'bi-box-arrow-in-down', color: '#28a745', description: 'Ajouter du stock', roles: ['gestionnaire'] },
    { id: 'liste-entrees', label: 'Liste entrées', icon: 'bi-list-ul', color: '#17a2b8', description: 'Historique des entrées', roles: ['gestionnaire'] },
    { id: 'sortie', label: 'Sortie', icon: 'bi-box-arrow-up', color: '#FF6F00', description: 'Retirer du stock', roles: ['gestionnaire', 'vendeur'] },
    { id: 'liste-sorties', label: 'Liste sorties', icon: 'bi-list-ul', color: '#fd7e14', description: 'Historique des sorties', roles: ['gestionnaire', 'vendeur'] },
    { id: 'inventaire', label: 'Inventaire', icon: 'bi-clipboard-data', color: '#40C4FF', description: 'Comptage physique', roles: ['gestionnaire'] },
    { id: 'historique', label: 'Historique', icon: 'bi-clock-history', color: '#66BB6A', description: 'Tous mouvements', roles: ['gestionnaire', 'vendeur'] },
    { id: 'alertes', label: 'Alertes', icon: 'bi-exclamation-triangle', color: '#dc3545', description: 'Stocks critiques', roles: ['gestionnaire', 'vendeur'] },
    { id: 'rapports', label: 'Rapports', icon: 'bi-file-text', color: '#6f42c1', description: 'Analyses et statistiques', roles: ['gestionnaire'] }
  ];

  // Filtrer les onglets selon le rôle
  const tabs = allTabs.filter(tab => tab.roles.includes(user.profile));

  // Rediriger vers le premier onglet autorisé si l'onglet actuel n'est pas accessible
  useEffect(() => {
    const isTabAccessible = tabs.some(tab => tab.id === activeTab);
    if (!isTabAccessible && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [user.profile, activeTab, tabs]);

  // Fonction pour rendre le composant actif avec une clé unique
  const renderComponent = () => {
    const key = `tab-content-${activeTab}`;
    
    switch(activeTab) {
      case 'niveau':
        return <StockNiveau key={key} />;
      case 'entree':
        return <StockEntree key={key} />;
      case 'liste-entrees':
        return <StockEntreeListe key={key} />;
      case 'sortie':
        return <StockSortie key={key} />;
      case 'liste-sorties':
        return <StockSortieListe key={key} />;
      case 'inventaire':
        return <StockInventaire key={key} />;
      case 'historique':
        return <StockHistorique key={key} />;
      case 'alertes':
        return <StockAlertes key={key} />;
      case 'rapports':
        return <StockRapports key={key} />;
      default:
        return <StockNiveau key={key} />;
    }
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

  return (
    <div className="pagetitle">
      <h1 style={{ 
        fontFamily: 'Montserrat, sans-serif',
        color: '#006994',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Gestion des stocks
        {isVendeur && (
          <span style={{
            fontSize: '0.8rem',
            backgroundColor: '#e6f3ff',
            color: '#006994',
            padding: '4px 10px',
            borderRadius: '20px',
            marginLeft: '15px',
            fontWeight: 'normal'
          }}>
            <i className="bi bi-person me-1"></i>
            Mode vendeur
          </span>
        )}
        {isGestionnaire && (
          <span style={{
            fontSize: '0.8rem',
            backgroundColor: '#FF6F00',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            marginLeft: '15px',
            fontWeight: 'normal'
          }}>
            <i className="bi bi-person-badge me-1"></i>
            Mode gestionnaire
          </span>
        )}
      </h1>
      
      <nav>
        <ol className="breadcrumb" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <li className="breadcrumb-item"><a href="#/" style={{ color: '#006994' }}>Accueil</a></li>
          <li className="breadcrumb-item active" style={{ color: '#333333' }}>Stocks</li>
        </ol>
      </nav>

      {/* ✅ Message adapté pour les vendeurs */}
      {isVendeur && (
        <div className="alert alert-info mb-4" style={{
          borderRadius: '8px',
          borderLeft: '4px solid #40C4FF',
          backgroundColor: '#e6f3ff',
          fontSize: '0.9rem'
        }}>
          <i className="bi bi-info-circle me-2" style={{ color: '#006994' }}></i>
          Vous êtes en mode vendeur. Les onglets "Entrée", "Liste entrées", "Inventaire" et "Rapports" sont réservés aux gestionnaires.
        </div>
      )}

      {/* Onglets */}
      <div className="card" style={{
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: 'none',
        marginBottom: '0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Vague décorative en haut */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          opacity: 0.5
        }} />

        <div className="card-body p-0">
          <ul className="nav nav-tabs" style={{ 
            borderBottom: '2px solid #f0f0f0',
            paddingLeft: '10px',
            paddingTop: '5px',
            flexWrap: 'wrap'
          }}>
            {tabs.map(tab => (
              <li className="nav-item" key={tab.id} style={{ position: 'relative' }}>
                <button
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={() => setShowTooltip(`tab-${tab.id}`)}
                  onMouseLeave={() => setShowTooltip('')}
                  style={{
                    color: activeTab === tab.id ? tab.color : '#666',
                    borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : 'none',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    transition: 'all 0.3s',
                    padding: '12px 20px',
                    position: 'relative',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 0
                  }}
                >
                  <i className={`bi ${tab.icon} me-2`} style={{ 
                    color: activeTab === tab.id ? tab.color : '#666',
                    transition: 'all 0.3s'
                  }}></i>
                  {tab.label}
                </button>
                {showTooltip === `tab-${tab.id}` && (
                  <Tooltip text={tab.description} />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Vague décorative en bas */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.2
        }} />
      </div>

      {/* Contenu des onglets */}
      <div className="card" style={{
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: 'none',
        borderTop: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Vague décorative en haut */}
        <div style={{
          height: '8px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1
        }} />

        <div className="card-body p-4">
          {/* Indicateur de l'onglet actif */}
          <div className="d-flex align-items-center mb-3">
            <div style={{
              width: '4px',
              height: '24px',
              backgroundColor: tabs.find(t => t.id === activeTab)?.color || '#006994',
              borderRadius: '2px',
              marginRight: '10px'
            }} />
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <i className={`bi ${tabs.find(t => t.id === activeTab)?.icon} me-2`} 
                 style={{ color: tabs.find(t => t.id === activeTab)?.color }}></i>
              {tabs.find(t => t.id === activeTab)?.description}
            </span>
          </div>

          {renderComponent()}
        </div>

        {/* Vague décorative en bas */}
        <div style={{
          height: '8px',
          background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.3
        }} />
      </div>

      {/* Petit message contextuel selon l'onglet */}
      <div className="mt-2 text-end" style={{ fontSize: '0.8rem', color: '#999' }}>
        <i className="bi bi-info-circle me-1" style={{ color: '#006994' }}></i>
        {activeTab === 'niveau' && 'Visualisez tous vos stocks et leur état'}
        {activeTab === 'entree' && 'Ajoutez du stock à vos produits'}
        {activeTab === 'liste-entrees' && 'Consultez et modifiez les entrées de stock'}
        {activeTab === 'sortie' && 'Retirez du stock suite à une vente ou une perte'}
        {activeTab === 'liste-sorties' && 'Consultez et modifiez les sorties de stock'}
        {activeTab === 'inventaire' && 'Réalisez un comptage physique de vos stocks'}
        {activeTab === 'historique' && 'Consultez l\'historique des mouvements'}
        {activeTab === 'alertes' && 'Surveillez les stocks critiques et ruptures'}
        {activeTab === 'rapports' && 'Analysez vos données de stock'}
      </div>
    </div>
  );
};

export default StockManager;