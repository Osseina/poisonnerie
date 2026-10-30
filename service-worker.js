// public/service-worker.js
// Garde l'application dans le téléphone pour qu'elle s'ouvre même avec un réseau faible ou absent.
// Seuls les fichiers de l'application sont gardés : les données (API) passent toujours par le réseau.

const CACHE = 'grema-app-v1';
const CACHE_POLICES = 'grema-polices-v1';

// Fichiers de base de l'application (les fichiers compilés viennent de asset-manifest.json)
const FICHIERS_BASE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './logo192.png',
  './assets/img/logo1.png',
  './assets/vendor/bootstrap/css/bootstrap.min.css',
  './assets/vendor/bootstrap/js/bootstrap.bundle.min.js',
  './assets/vendor/bootstrap-icons/bootstrap-icons.css',
  './assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2?dd67030699838ea613ee6dbda90effa6',
  './assets/css/style.css',
  './assets/js/main.js',
];

const urlDe = (chemin) => new URL(chemin, self.registration.scope).href;

// Fichiers compilés de la version en ligne (noms avec empreinte, ex. main.1367587c.js)
async function fichiersCompiles() {
  const reponse = await fetch(urlDe('./asset-manifest.json'), { cache: 'no-store' });
  const manifeste = await reponse.json();
  return Object.values(manifeste.files || {})
    .filter((f) => !f.endsWith('.map') && !f.endsWith('index.html'))
    .map(urlDe);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(FICHIERS_BASE.map(urlDe));
    try {
      await cache.addAll(await fichiersCompiles());
    } catch (e) { /* ils seront gardés au premier chargement */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms
      .filter((n) => n.startsWith('grema-') && ![CACHE, CACHE_POLICES].includes(n))
      .map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

// Après une mise à jour de l'application : on oublie les anciens fichiers compilés
let menageFait = false;
async function menage() {
  if (menageFait) return;
  menageFait = true;
  try {
    const actuels = new Set(await fichiersCompiles());
    const cache = await caches.open(CACHE);
    for (const requete of await cache.keys()) {
      if (requete.url.includes('/static/') && !actuels.has(requete.url)) {
        await cache.delete(requete);
      }
    }
  } catch (e) { /* hors ligne : on réessaiera plus tard */ }
}

// Page : réseau d'abord (pour avoir la dernière version), sinon la copie gardée
async function page(requete) {
  const cache = await caches.open(CACHE);
  try {
    const controleur = new AbortController();
    const minuterie = setTimeout(() => controleur.abort(), 6000);
    const reponse = await fetch(requete, { signal: controleur.signal });
    clearTimeout(minuterie);
    if (reponse.ok) {
      await cache.put(urlDe('./index.html'), reponse.clone());
      menage();
    }
    return reponse;
  } catch (e) {
    return (await cache.match(urlDe('./index.html'))) || (await cache.match(urlDe('./'))) || Response.error();
  }
}

// Fichiers de l'application : copie gardée d'abord, sinon réseau (et on la garde).
// Avec rafraichir, la copie est remise à jour en arrière-plan (fichiers dont le nom ne change pas).
async function fichier(requete, nomCache, rafraichir = false) {
  const cache = await caches.open(nomCache);
  const garde = await cache.match(requete);
  if (garde && !rafraichir) return garde;
  const reseau = fetch(requete).then(async (reponse) => {
    if (reponse.ok || reponse.type === 'opaque') {
      await cache.put(requete, reponse.clone());
    }
    return reponse;
  });
  if (garde) {
    reseau.catch(() => {});
    return garde;
  }
  return reseau;
}

self.addEventListener('fetch', (event) => {
  const requete = event.request;
  if (requete.method !== 'GET') return;
  const url = new URL(requete.url);

  // Polices Google
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(fichier(requete, CACHE_POLICES));
    return;
  }

  // Tout le reste hors du site (dont l'API) : jamais mis en cache
  if (!requete.url.startsWith(self.registration.scope)) return;

  if (requete.mode === 'navigate') {
    event.respondWith(page(requete));
    return;
  }

  // Pas de cache pour la liste des fichiers ni pour les photos envoyées
  if (url.pathname.endsWith('asset-manifest.json') || url.pathname.includes('/uploads/')) return;

  // Fichiers compilés (nom avec empreinte) : ne changent jamais ; les autres sont rafraîchis
  const compile = url.pathname.includes('/static/');
  event.respondWith(fichier(requete, CACHE, !compile));
});
