// src/sessionGuard.js
// Enveloppe de fetch pour les appels à l'API :
// - réseau faible : délai maximum, nouvel essai automatique des lectures, message clair en français ;
// - réponse 401 (jeton invalide ou session expirée côté serveur) : on vide la session
//   et on renvoie vers la page de connexion.
import { API_BASE_URL } from './config';

const originalFetch = window.fetch.bind(window);

// Délai laissé au serveur (il peut mettre ~30 s à se réveiller) et aux réseaux lents
const DELAI_MAX = 60000;
// Pauses avant chaque nouvel essai d'une lecture (GET)
const PAUSES_NOUVEL_ESSAI = [1500, 4000];

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// Un appel, avec délai maximum (sauf si l'appelant gère déjà l'annulation)
async function appel(input, init) {
  if (init && init.signal) return originalFetch(input, init);
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), DELAI_MAX);
  try {
    return await originalFetch(input, { ...init, signal: controleur.signal });
  } finally {
    clearTimeout(minuterie);
  }
}

async function appelApi(input, init) {
  const methode = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
  // Seules les lectures sont réessayées : réessayer une vente risquerait de l'enregistrer deux fois
  const essais = methode === 'GET' ? PAUSES_NOUVEL_ESSAI.length + 1 : 1;

  for (let i = 0; i < essais; i++) {
    try {
      return await appel(input, init);
    } catch (err) {
      const annuleParAppelant = init && init.signal && init.signal.aborted;
      if (annuleParAppelant) throw err;
      if (i < essais - 1) {
        await pause(PAUSES_NOUVEL_ESSAI[i]);
        continue;
      }
      throw new Error(navigator.onLine === false
        ? 'Pas de connexion Internet. Vérifiez vos données mobiles ou le wifi, puis réessayez.'
        : 'Connexion au serveur impossible : le réseau est trop faible ou coupé. Réessayez dans un instant.');
    }
  }
}

window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input && input.url) || '';
  if (!url.startsWith(API_BASE_URL)) {
    return originalFetch(input, init);
  }

  const response = await appelApi(input, init);

  if (
    response.status === 401 &&
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
