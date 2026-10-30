// src/reseau.js
// Bandeau "Pas de connexion" quand le téléphone perd Internet,
// et enregistrement du service worker qui garde l'application dans le téléphone.
import { API_BASE_URL } from './config';

// Réveille le serveur dès l'ouverture (il s'endort après 15 min sans visite),
// pendant que l'utilisateur tape son mot de passe ou que la page se charge
fetch(`${API_BASE_URL}/`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});

const bandeau = document.createElement('div');
bandeau.className = 'bandeau-reseau';
bandeau.setAttribute('role', 'status');
bandeau.innerHTML = '<i class="bi bi-wifi-off"></i><span>Pas de connexion Internet : les informations affichées ne sont peut-être pas à jour.</span>';

function majBandeau() {
  if (!document.body) return;
  if (!bandeau.isConnected) document.body.appendChild(bandeau);
  bandeau.classList.toggle('visible', navigator.onLine === false);
}

window.addEventListener('online', majBandeau);
window.addEventListener('offline', majBandeau);
window.addEventListener('load', majBandeau);

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .catch((err) => console.warn('Service worker non enregistré :', err));
  });
}
