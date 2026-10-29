// src/sessionGuard.js
// Si l'API répond 401 (jeton invalide ou session expirée côté serveur),
// on vide la session et on renvoie vers la page de connexion.
import { API_BASE_URL } from './config';

const originalFetch = window.fetch.bind(window);

window.fetch = async (input, init) => {
  const response = await originalFetch(input, init);
  const url = typeof input === 'string' ? input : (input && input.url) || '';

  if (
    response.status === 401 &&
    url.startsWith(API_BASE_URL) &&
    !url.includes('/auth/login.php') &&
    !url.includes('/auth/logout.php') &&
    localStorage.getItem('token')
  ) {
    let message = 'Votre session a expiré. Veuillez vous reconnecter.';
    try {
      const data = await response.clone().json();
      if (data && data.message) message = data.message;
    } catch (e) { /* réponse non JSON */ }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('loginMessage', message);
    window.location.replace(window.location.pathname + '#/login');
  }

  return response;
};
