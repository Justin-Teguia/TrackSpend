const CHART_COLORS = [
  '#f97316','#38bdf8','#22c55e','#a78bfa',
  '#fb923c','#67e8f9','#4ade80','#c4b5fd',
];

async function loadStats() {
  try {
    const d = await apiFetch('/api/stats/global');

    // KPIs
    document.getElementById('kpi-total').textContent = d.total_depenses.toLocaleString('fr-FR');
    document.getElementById('kpi-etudiants').textContent = d.total_etudiants;
    document.getElementById('kpi-nb').textContent = d.total_enregistrements;
    document.getElementById('kpi-moy').textContent = d.moyenne_depense.toLocaleString('fr-FR');

    // Donut catégories
    if(d.categories.length > 0) {
      new Chart(document.getElementById('chartCategories').getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: d.categories.map(c => c.categorie),
          datasets: [{
            data: d.categories.map(c => c.total),
            backgroundColor: CHART_COLORS,
            borderColor: '#111827',
            borderWidth: 3,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 12 } } },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString('fr-FR')} FCFA`
              }
            }
          }
        }
      });
    } else {
      document.getElementById('chartCategories').parentElement.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">Aucune donnée</p>';
    }

    // Bar filières
    if(d.filieres.length > 0) {
      new Chart(document.getElementById('chartFilieres').getContext('2d'), {
        type: 'bar',
        data: {
          labels: d.filieres.map(f => f.filiere),
          datasets: [{
            label: 'Total dépenses (FCFA)',
            data: d.filieres.map(f => f.total),
            backgroundColor: CHART_COLORS,
            borderRadius: 8,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2d45' } },
            y: { ticks: { color: '#94a3b8', callback: v => v.toLocaleString('fr-FR') }, grid: { color: '#1e2d45' } }
          }
        }
      });
    } else {
      document.getElementById('chartFilieres').parentElement.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">Aucune donnée</p>';
    }

    // Line mensuel
    if(d.evolution_mensuelle.length > 0) {
      new Chart(document.getElementById('chartMensuel').getContext('2d'), {
        type: 'line',
        data: {
          labels: d.evolution_mensuelle.map(m => m.mois),
          datasets: [{
            label: 'Dépenses mensuelles (FCFA)',
            data: d.evolution_mensuelle.map(m => m.total),
            borderColor: '#f97316',
            backgroundColor: 'rgba(249,115,22,.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#f97316',
            pointRadius: 5,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#e2e8f0' } } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2d45' } },
            y: { ticks: { color: '#94a3b8', callback: v => v.toLocaleString('fr-FR') }, grid: { color: '#1e2d45' } }
          }
        }
      });
    } else {
      document.getElementById('chartMensuel').parentElement.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">Aucune donnée</p>';
    }

    // Top dépensiers
    const tbody = document.getElementById('topTbody');
    if(d.top_depensiers.length > 0) {
      tbody.innerHTML = d.top_depensiers.map((t,i) => `
        <tr>
          <td>${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</td>
          <td><strong>${t.nom}</strong></td>
          <td>${t.filiere}</td>
          <td style="color:var(--accent);font-weight:700">${t.total.toLocaleString('fr-FR')} FCFA</td>
        </tr>`).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="4" class="loading-cell">Aucune donnée disponible.</td></tr>';
    }

  } catch(e) {
    showToast('Erreur chargement stats: ' + e.message, 'error');
  }
}

loadStats();
