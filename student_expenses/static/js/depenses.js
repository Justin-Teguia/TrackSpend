let allDepenses = [];

async function init() {
  await populateEtudiantSelects();
  await loadDepenses();
  // Set today's date as default
  const d = document.querySelector('#addDepForm [name="date_depense"]');
  if(d) d.value = new Date().toISOString().slice(0,10);
}

async function populateEtudiantSelects() {
  try {
    const etudiants = await apiFetch('/api/etudiants');
    const options = etudiants.map(e =>
      `<option value="${e.id}">${e.prenom} ${e.nom} — ${e.filiere}</option>`).join('');
    document.getElementById('filterEtudiant').innerHTML =
      '<option value="">Tous les étudiants</option>' + options;
    document.getElementById('depEtudiantSelect').innerHTML =
      '<option value="">— Choisir un étudiant —</option>' + options;
  } catch(e) { console.error(e); }
}

async function loadDepenses() {
  const etudId = document.getElementById('filterEtudiant').value;
  const url = etudId ? `/api/depenses?etudiant_id=${etudId}` : '/api/depenses';
  try {
    allDepenses = await apiFetch(url);
    filterDepenses();
  } catch(e) {
    document.getElementById('depensesTbody').innerHTML =
      `<tr><td colspan="7" class="loading-cell" style="color:#ef4444">Erreur: ${e.message}</td></tr>`;
  }
}

function filterDepenses() {
  const cat = document.getElementById('filterCategorie').value;
  const filtered = cat ? allDepenses.filter(d => d.categorie === cat) : allDepenses;
  renderDepenses(filtered);
  const total = filtered.reduce((s,d) => s + d.montant, 0);
  document.getElementById('totalAffiche').textContent = total.toLocaleString('fr-FR');
}

function renderDepenses(list) {
  const tbody = document.getElementById('depensesTbody');
  if(list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Aucune dépense trouvée.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map((d, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${d.etudiant_nom}</strong></td>
      <td>${catBadge(d.categorie)}</td>
      <td style="color:var(--accent);font-weight:700">${d.montant.toLocaleString('fr-FR')} FCFA</td>
      <td style="color:var(--muted)">${d.description || '—'}</td>
      <td>${d.date_depense}</td>
      <td>
        <button class="btn-icon" onclick="deleteDepense(${d.id})" title="Supprimer" style="color:#ef4444">🗑️</button>
      </td>
    </tr>`).join('');
}

async function submitAddDep(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const data = Object.fromEntries(fd.entries());
  try {
    await apiFetch('/api/depenses', { method: 'POST', body: JSON.stringify(data) });
    showToast('Dépense enregistrée ✓');
    closeModal('addDepModal');
    ev.target.reset();
    // Reset date to today
    const d = ev.target.querySelector('[name="date_depense"]');
    if(d) d.value = new Date().toISOString().slice(0,10);
    loadDepenses();
  } catch(e) {
    showToast(e.message, 'error');
  }
}

async function deleteDepense(id) {
  if(!confirm('Supprimer cette dépense ?')) return;
  try {
    await apiFetch(`/api/depenses/${id}`, { method: 'DELETE' });
    showToast('Dépense supprimée');
    loadDepenses();
  } catch(e) {
    showToast(e.message, 'error');
  }
}

init();
