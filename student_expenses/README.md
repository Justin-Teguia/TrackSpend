# TrackSpend — TP Collecte de Données : Dépenses Étudiants

Application Flask complète pour collecter et analyser les dépenses des étudiants.

## 🚀 Installation & Lancement

### Prérequis
- Python 3.9+ installé

### Étapes

```bash
# 1. Aller dans le dossier du projet
cd student_expenses

# 2. Créer un environnement virtuel (recommandé)
python -m venv venv

# Activer l'environnement :
# Windows :
venv\Scripts\activate
# Mac/Linux :
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Lancer l'application
python app.py
```

### 5. Ouvrir dans le navigateur
```
http://127.0.0.1:5000
```

> ✅ Des données de démonstration sont automatiquement insérées au premier démarrage.

---

## 📁 Structure du projet

```
student_expenses/
├── app.py                  # Application Flask (routes + API + modèles)
├── requirements.txt        # Dépendances Python
├── depenses.db             # Base SQLite (créée automatiquement)
├── templates/
│   ├── base.html           # Template de base (navbar, footer)
│   ├── index.html          # Page d'accueil / tableau de bord
│   ├── etudiants.html      # Gestion des étudiants (CRUD)
│   ├── depenses.html       # Gestion des dépenses (CRUD)
│   └── statistiques.html   # Graphiques et analyses
└── static/
    ├── css/
    │   └── style.css       # Styles CSS
    └── js/
        ├── main.js         # Utilitaires globaux (toast, modals, API)
        ├── etudiants.js    # Logique page étudiants
        ├── depenses.js     # Logique page dépenses
        └── stats.js        # Graphiques Chart.js
```

---

## 📊 Fonctionnalités

### Gestion des Étudiants
- ✅ Ajouter / Modifier / Supprimer un étudiant
- ✅ Champs : Nom, Prénom, Email, Filière, Niveau, Budget mensuel
- ✅ Recherche et filtre par filière

### Gestion des Dépenses
- ✅ Enregistrer une dépense pour un étudiant
- ✅ Catégories : Alimentation, Transport, Logement, Livres, Santé, Loisirs, Vêtements, Autre
- ✅ Filtrer par étudiant ou par catégorie
- ✅ Total des dépenses en temps réel

### Statistiques & Visualisations
- ✅ KPIs globaux (total, nb étudiants, enregistrements, moyenne)
- ✅ Donut chart : Répartition par catégorie
- ✅ Bar chart : Dépenses par filière
- ✅ Line chart : Évolution mensuelle
- ✅ Top 5 des plus grandes dépenses

---

## 🔌 API REST

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/etudiants | Liste des étudiants |
| POST | /api/etudiants | Ajouter un étudiant |
| PUT | /api/etudiants/<id> | Modifier un étudiant |
| DELETE | /api/etudiants/<id> | Supprimer un étudiant |
| GET | /api/depenses | Liste des dépenses |
| POST | /api/depenses | Ajouter une dépense |
| DELETE | /api/depenses/<id> | Supprimer une dépense |
| GET | /api/stats/global | Statistiques globales |

---

## 🛠️ Technologies

- **Backend** : Flask, Flask-SQLAlchemy, SQLite
- **Frontend** : HTML5, CSS3 (variables CSS, Grid, Flexbox), JavaScript ES6+
- **Charts** : Chart.js (CDN)
- **Fonts** : Syne + DM Sans (Google Fonts)
