// src/config.js
// URL de l'API PHP. En production, définir REACT_APP_API_URL
// (fichier .env.production ou variables d'environnement de l'hébergeur).
export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost/stock-api').replace(/\/+$/, '');

// Construit l'URL complète d'un fichier servi par l'API (ex. avatars).
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Anciennes valeurs locales du type "/stock-api/uploads/..."
  const clean = path.replace(/^\/stock-api/, '');
  return `${API_BASE_URL}${clean.startsWith('/') ? '' : '/'}${clean}`;
};
