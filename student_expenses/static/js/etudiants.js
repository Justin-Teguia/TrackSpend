let allEtudiants = [];

async function loadEtudiants() {
  try {
    allEtudiants = await apiFetch('/api/etudiants');
    renderTable(allEtudiants);
    renderQuickStats(allEtudiants);
    populateFiliereFilter(allEtudiants);
  } catch(e) {
    document.getElementById('etudiantsTbody').innerHTML =
      `<tr><td colspan="8" class="loading-cell" style="color:#ef4444">Erreur: ${e.message}</td></tr>`;
  }
}

function renderTable(list) {
  const tbody = document.getElementById('etudiantsTbody');
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">Aucun étudiant trouvé.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map((e, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${e.nom}</strong></td>
      <td>${e.prenom}</td>
      <td>${e.filiere}</td>
      <td>${niveauBadge(e.niveau)}</td>
      <td style="color:var(--accent);font-weight:600">${e.budget_mensuel.toLocaleString('fr-FR')} FCFA</td>
      <td style="color:var(--muted);font-size:.82rem">${e.email}</td>
      <td>
        <button class="btn-icon" onclick="openEditModal(${e.id})" title="Modifier">✏️</button>
        <button class="btn-icon" onclick="deleteEtudiant(${e.id},'${e.prenom} ${e.nom}')" title="Supprimer" style="color:#ef4444">🗑️</button>
      </td>
    </tr>`).join('');
}

function renderQuickStats(list) {
  const total_budget = list.reduce((s,e) => s + e.budget_mensuel, 0);
  const filieres = [...new Set(list.map(e => e.filiere))].length;
  document.getElementById('quickStats').innerHTML = `
    <div class="qs-item"><span class="qs-icon">🎓</span><div><div class="qs-val">${list.length}</div><div class="qs-label">Étudiants</div></div></div>
    <div class="qs-item"><span class="qs-icon">💰</span><div><div class="qs-val">${total_budget.toLocaleString('fr-FR')}</div><div class="qs-label">Budget total (FCFA)</div></div></div>
    <div class="qs-item"><span class="qs-icon">🏫</span><div><div class="qs-val">${filieres}</div><div class="qs-label">Filières</div></div></div>
  `;
}

function populateFiliereFilter(list) {
  const sel = document.getElementById('filterFiliere');
  const filieres = [...new Set(list.map(e => e.filiere))].sort();
  sel.innerHTML = '<option value="">Toutes les filières</option>' +
    filieres.map(f => `<option value="${f}">${f}</option>`).join('');
}

function filterTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const fil = document.getElementById('filterFiliere').value;
  const filtered = allEtudiants.filter(e => {
    const match = [e.nom, e.prenom, e.email, e.filiere].join(' ').toLowerCase().includes(q);
    const filMatch = !fil || e.filiere === fil;
    return match && filMatch;
  });
  renderTable(filtered);
}

// ── Add ───────────────────────────────────────────────────────────────────
async function submitAdd(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const data = Object.fromEntries(fd.entries());
  try {
    await apiFetch('/api/etudiants', { method: 'POST', body: JSON.stringify(data) });
    showToast('Étudiant ajouté ✓');
    closeModal('addModal');
    ev.target.reset();
    loadEtudiants();
  } catch(e) {
    showToast(e.message, 'error');
  }
}

// ── Edit ──────────────────────────────────────────────────────────────────
function openEditModal(id) {
  const e = allEtudiants.find(x => x.id === id);
  if (!e) return;
  const form = document.getElementById('editForm');
  form.nom.value = e.nom;
  form.prenom.value = e.prenom;
  form.email.value = e.email;
  form.filiere.value = e.filiere;
  form.niveau.value = e.niveau;
  form.budget_mensuel.value = e.budget_mensuel;
  form.id.value = e.id;
  openModal('editModal');
}

async function submitEdit(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const data = Object.fromEntries(fd.entries());
  const id = data.id;
  delete data.id;
  try {
    await apiFetch(`/api/etudiants/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    showToast('Étudiant mis à jour ✓');
    closeModal('editModal');
    loadEtudiants();
  } catch(e) {
    showToast(e.message, 'error');
  }
}

// ── Delete ────────────────────────────────────────────────────────────────
async function deleteEtudiant(id, nom) {
  if (!confirm(`Supprimer ${nom} et toutes ses dépenses ?`)) return;
  try {
    await apiFetch(`/api/etudiants/${id}`, { method: 'DELETE' });
    showToast(`${nom} supprimé`);
    loadEtudiants();
  } catch(e) {
    showToast(e.message, 'error');
  }
}

// ── Init ──────────────────────────────────────────────────────────────────
loadEtudiants();
