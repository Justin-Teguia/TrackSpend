from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///depenses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'tp_depenses_etudiants_2024'

db = SQLAlchemy(app)

# ── Modèles ──────────────────────────────────────────────────────────────────

class Etudiant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    filiere = db.Column(db.String(100), nullable=False)
    niveau = db.Column(db.String(20), nullable=False)
    budget_mensuel = db.Column(db.Float, default=0.0)
    date_inscription = db.Column(db.DateTime, default=datetime.utcnow)
    depenses = db.relationship('Depense', backref='etudiant', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'prenom': self.prenom,
            'email': self.email,
            'filiere': self.filiere,
            'niveau': self.niveau,
            'budget_mensuel': self.budget_mensuel,
            'date_inscription': self.date_inscription.strftime('%d/%m/%Y')
        }


class Depense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    etudiant_id = db.Column(db.Integer, db.ForeignKey('etudiant.id'), nullable=False)
    categorie = db.Column(db.String(80), nullable=False)
    montant = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    date_depense = db.Column(db.Date, default=date.today)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'etudiant_id': self.etudiant_id,
            'etudiant_nom': f"{self.etudiant.prenom} {self.etudiant.nom}",
            'categorie': self.categorie,
            'montant': self.montant,
            'description': self.description,
            'date_depense': self.date_depense.strftime('%d/%m/%Y') if self.date_depense else '',
        }


# ── Routes principales ────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/etudiants')
def etudiants():
    return render_template('etudiants.html')

@app.route('/depenses')
def depenses():
    return render_template('depenses.html')

@app.route('/statistiques')
def statistiques():
    return render_template('statistiques.html')


# ── API Étudiants ─────────────────────────────────────────────────────────────

@app.route('/api/etudiants', methods=['GET'])
def api_get_etudiants():
    etudiants = Etudiant.query.all()
    return jsonify([e.to_dict() for e in etudiants])

@app.route('/api/etudiants', methods=['POST'])
def api_add_etudiant():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Données invalides'}), 400
    # Vérif email unique
    if Etudiant.query.filter_by(email=data.get('email', '')).first():
        return jsonify({'error': 'Email déjà utilisé'}), 409
    etudiant = Etudiant(
        nom=data['nom'],
        prenom=data['prenom'],
        email=data['email'],
        filiere=data['filiere'],
        niveau=data['niveau'],
        budget_mensuel=float(data.get('budget_mensuel', 0))
    )
    db.session.add(etudiant)
    db.session.commit()
    return jsonify(etudiant.to_dict()), 201

@app.route('/api/etudiants/<int:id>', methods=['PUT'])
def api_update_etudiant(id):
    etudiant = Etudiant.query.get_or_404(id)
    data = request.get_json()
    etudiant.nom = data.get('nom', etudiant.nom)
    etudiant.prenom = data.get('prenom', etudiant.prenom)
    etudiant.email = data.get('email', etudiant.email)
    etudiant.filiere = data.get('filiere', etudiant.filiere)
    etudiant.niveau = data.get('niveau', etudiant.niveau)
    etudiant.budget_mensuel = float(data.get('budget_mensuel', etudiant.budget_mensuel))
    db.session.commit()
    return jsonify(etudiant.to_dict())

@app.route('/api/etudiants/<int:id>', methods=['DELETE'])
def api_delete_etudiant(id):
    etudiant = Etudiant.query.get_or_404(id)
    db.session.delete(etudiant)
    db.session.commit()
    return jsonify({'message': 'Étudiant supprimé'})


# ── API Dépenses ──────────────────────────────────────────────────────────────

@app.route('/api/depenses', methods=['GET'])
def api_get_depenses():
    etudiant_id = request.args.get('etudiant_id')
    if etudiant_id:
        depenses = Depense.query.filter_by(etudiant_id=etudiant_id).order_by(Depense.date_depense.desc()).all()
    else:
        depenses = Depense.query.order_by(Depense.date_depense.desc()).all()
    return jsonify([d.to_dict() for d in depenses])

@app.route('/api/depenses', methods=['POST'])
def api_add_depense():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Données invalides'}), 400
    date_str = data.get('date_depense')
    dep_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
    depense = Depense(
        etudiant_id=data['etudiant_id'],
        categorie=data['categorie'],
        montant=float(data['montant']),
        description=data.get('description', ''),
        date_depense=dep_date
    )
    db.session.add(depense)
    db.session.commit()
    return jsonify(depense.to_dict()), 201

@app.route('/api/depenses/<int:id>', methods=['DELETE'])
def api_delete_depense(id):
    depense = Depense.query.get_or_404(id)
    db.session.delete(depense)
    db.session.commit()
    return jsonify({'message': 'Dépense supprimée'})


# ── API Statistiques ──────────────────────────────────────────────────────────

@app.route('/api/stats/global')
def stats_global():
    total_etudiants = Etudiant.query.count()
    total_depenses = db.session.query(db.func.sum(Depense.montant)).scalar() or 0
    total_enregistrements = Depense.query.count()
    moyenne_depense = (total_depenses / total_enregistrements) if total_enregistrements > 0 else 0

    # Par catégorie
    cat_data = db.session.query(
        Depense.categorie,
        db.func.sum(Depense.montant).label('total'),
        db.func.count(Depense.id).label('nb')
    ).group_by(Depense.categorie).all()
    categories = [{'categorie': c.categorie, 'total': round(c.total, 2), 'nb': c.nb} for c in cat_data]

    # Par filière
    filiere_data = db.session.query(
        Etudiant.filiere,
        db.func.sum(Depense.montant).label('total'),
        db.func.count(Etudiant.id.distinct()).label('nb_etudiants')
    ).join(Depense).group_by(Etudiant.filiere).all()
    filieres = [{'filiere': f.filiere, 'total': round(f.total, 2), 'nb_etudiants': f.nb_etudiants} for f in filiere_data]

    # Top dépensiers
    top_data = db.session.query(
        Etudiant.nom, Etudiant.prenom, Etudiant.filiere,
        db.func.sum(Depense.montant).label('total')
    ).join(Depense).group_by(Etudiant.id).order_by(db.func.sum(Depense.montant).desc()).limit(5).all()
    top = [{'nom': f"{t.prenom} {t.nom}", 'filiere': t.filiere, 'total': round(t.total, 2)} for t in top_data]

    # Evolution mensuelle
    monthly_data = db.session.query(
        db.func.strftime('%Y-%m', Depense.date_depense).label('mois'),
        db.func.sum(Depense.montant).label('total')
    ).group_by('mois').order_by('mois').all()
    mensuel = [{'mois': m.mois, 'total': round(m.total, 2)} for m in monthly_data]

    return jsonify({
        'total_etudiants': total_etudiants,
        'total_depenses': round(total_depenses, 2),
        'total_enregistrements': total_enregistrements,
        'moyenne_depense': round(moyenne_depense, 2),
        'categories': categories,
        'filieres': filieres,
        'top_depensiers': top,
        'evolution_mensuelle': mensuel
    })


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Données de démonstration si la base est vide
        if Etudiant.query.count() == 0:
            demo_etudiants = [
                Etudiant(nom='Mbarga', prenom='Jean', email='jean.mbarga@univ.cm', filiere='Informatique', niveau='L3', budget_mensuel=50000),
                Etudiant(nom='Atangana', prenom='Marie', email='marie.atangana@univ.cm', filiere='Gestion', niveau='M1', budget_mensuel=60000),
                Etudiant(nom='Fouda', prenom='Paul', email='paul.fouda@univ.cm', filiere='Médecine', niveau='L2', budget_mensuel=80000),
                Etudiant(nom='Nkomo', prenom='Cécile', email='cecile.nkomo@univ.cm', filiere='Droit', niveau='L1', budget_mensuel=45000),
            ]
            for e in demo_etudiants:
                db.session.add(e)
            db.session.flush()
            demo_depenses = [
                Depense(etudiant_id=1, categorie='Alimentation', montant=12000, description='Resto U', date_depense=date(2024,11,5)),
                Depense(etudiant_id=1, categorie='Transport', montant=5000, description='Bus mensuel', date_depense=date(2024,11,8)),
                Depense(etudiant_id=1, categorie='Livres', montant=8500, description='Manuels scolaires', date_depense=date(2024,11,10)),
                Depense(etudiant_id=2, categorie='Alimentation', montant=15000, description='Courses', date_depense=date(2024,11,3)),
                Depense(etudiant_id=2, categorie='Loisirs', montant=7000, description='Cinéma & sortie', date_depense=date(2024,11,15)),
                Depense(etudiant_id=2, categorie='Santé', montant=3500, description='Pharmacie', date_depense=date(2024,11,20)),
                Depense(etudiant_id=3, categorie='Livres', montant=20000, description='Atlas médical', date_depense=date(2024,11,1)),
                Depense(etudiant_id=3, categorie='Alimentation', montant=18000, description='Alimentation', date_depense=date(2024,11,7)),
                Depense(etudiant_id=3, categorie='Logement', montant=25000, description='Loyer chambre', date_depense=date(2024,11,1)),
                Depense(etudiant_id=4, categorie='Transport', montant=4000, description='Taxi', date_depense=date(2024,11,12)),
                Depense(etudiant_id=4, categorie='Alimentation', montant=10000, description='Alimentation', date_depense=date(2024,11,9)),
                Depense(etudiant_id=4, categorie='Loisirs', montant=5000, description='Sport', date_depense=date(2024,11,18)),
            ]
            for d in demo_depenses:
                db.session.add(d)
            db.session.commit()
            print("✅ Données de démo insérées")
    app.run(debug=True)
