// ── Toast ────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Modal ─────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
// Close on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ── Nav toggle (mobile) ───────────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
}

// ── API helpers ───────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erreur ${res.status}`);
  }
  return res.json();
}

// ── Category badge colors ─────────────────────────────────────────────────
const CAT_COLORS = {
  Alimentation: 'badge-green',
  Transport:    'badge-blue',
  Logement:     'badge-purple',
  Livres:       'badge-orange',
  Santé:        'badge-green',
  Loisirs:      'badge-blue',
  Vêtements:    'badge-purple',
  Autre:        'badge-orange'
};
const NIVEAU_COLOR = { L1:'badge-blue', L2:'badge-blue', L3:'badge-blue', M1:'badge-green', M2:'badge-green', Doctorat:'badge-purple' };

function catBadge(cat) {
  return `<span class="badge ${CAT_COLORS[cat]||'badge-orange'}">${cat}</span>`;
}
function niveauBadge(n) {
  return `<span class="badge ${NIVEAU_COLOR[n]||'badge-orange'}">${n}</span>`;
}
