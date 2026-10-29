import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from './Layout';
import useIdleTimer from '../hooks/useIdleTimer';

const PrivateRoute = ({ refreshData, setRefreshKey }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Activer le timer d'inactivité (30 minutes)
  useIdleTimer(30 * 60 * 1000);

  // Vérification de l'authentification
  if (!token || !user.id) {
    // Nettoyer au cas où
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: 'Veuillez vous connecter pour accéder à cette page'
        }} 
        replace 
      />
    );
  }

  // Vérification optionnelle de l'expiration du token (côté client)
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    if (payload.exp && payload.exp < Date.now() / 1000) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return (
        <Navigate 
          to="/login" 
          state={{ 
            from: location.pathname,
            message: 'Votre session a expiré. Veuillez vous reconnecter.'
          }} 
          replace 
        />
      );
    }
  } catch (e) {
    console.error('Erreur décodage token:', e);
  }

  // Tout est bon, afficher le layout
  return (
    <Layout refreshData={refreshData} setRefreshKey={setRefreshKey}>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoute;