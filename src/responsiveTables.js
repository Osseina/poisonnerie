// src/responsiveTables.js
// Sur mobile, les tableaux sont affichés en "fiches" (voir responsive.css).
// Ce module recopie le titre de chaque colonne (<th>) sur les cellules (<td data-label>)
// pour pouvoir afficher "Libellé : valeur". Il suit les changements faits par React.

const MIN_COLONNES = 3;

function etiqueterTableau(table) {
  const ths = table.querySelectorAll(':scope > thead > tr:last-child > th');
  if (ths.length < MIN_COLONNES) return;

  const libelles = Array.from(ths).map((th) => th.innerText.trim());
  table.classList.add('table-fiches');

  table.querySelectorAll(':scope > tbody > tr').forEach((tr) => {
    let col = 0;
    Array.from(tr.children).forEach((td) => {
      if (td.tagName !== 'TD') return;
      const span = parseInt(td.getAttribute('colspan') || '1', 10);
      const libelle = span > 1 ? '' : (libelles[col] || '');
      if (td.getAttribute('data-label') !== libelle) td.setAttribute('data-label', libelle);
      const estAction = /^actions?$/i.test(libelle);
      td.classList.toggle('td-actions', estAction);
      td.classList.toggle('td-plein', span > 1);
      col += span;
    });
  });
}

let planifie = false;
function toutEtiqueter() {
  planifie = false;
  document.querySelectorAll('#main table').forEach(etiqueterTableau);
}

function planifier() {
  if (planifie) return;
  planifie = true;
  requestAnimationFrame(toutEtiqueter);
}

if (typeof window !== 'undefined' && 'MutationObserver' in window) {
  const observer = new MutationObserver(planifier);
  const demarrer = () => {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    planifier();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
}
