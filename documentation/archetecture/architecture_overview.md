# 📂 SmartCV Screening – Backend Architecture

## 🏗️ Structure du projet

```bash
backend/
│
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py          # Authentification (login, register, reset password)
│   │   │   ├── users.py         # Gestion des utilisateurs (admin)
│   │   │   ├── jobs.py          # Gestion des offres d’emploi
│   │   │   ├── candidates.py    # Gestion des candidats
│   │   │   ├── cv.py            # Upload et gestion des CV
│   │   │   ├── scoring.py       # Calcul des scores
│   │   │   └── ranking.py       # Classement des candidats
│   │   └── router.py            # Regroupe جميع endpoints
│   │
│   ├── core/
│   │   ├── config.py            # Variables d’environnement (.env)
│   │   ├── security.py          # JWT + Hash password
│   │   └── database.py          # Connexion PostgreSQL
│   │
│   ├── models/
│   │   ├── user.py              # Table users
│   │   ├── job.py               # Table jobs (offres)
│   │   ├── candidate.py         # Table candidates
│   │   ├── application.py       # Relation candidat ↔ job
│   │   ├── cv.py                # Table CV
│   │   └── score.py             # Table scores
│   │
│   ├── schemas/
│   │   ├── auth.py              # Schemas auth (login/register)
│   │   ├── user.py              # Schemas users
│   │   ├── job.py               # Schemas jobs
│   │   ├── candidate.py         # Schemas candidates
│   │   ├── cv.py                # Schemas CV
│   │   └── score.py             # Schemas scoring
│   │
│   ├── services/
│   │   ├── auth_service.py      # Logique auth
│   │   ├── job_service.py       # Logique jobs
│   │   ├── candidate_service.py # Logique candidats
│   │   ├── cv_service.py        # Traitement CV
│   │   ├── scoring_service.py   # Calcul scores
│   │   └── ranking_service.py   # Classement candidats
│   │
│   ├── ai/
│   │   ├── parser.py            # Lecture CV (PDF → texte)
│   │   ├── extractor.py         # Extraction (skills, expériences…)
│   │   ├── embedding.py         # Vectorisation texte
│   │   ├── similarity.py        # Similarité CV ↔ job
│   │   └── scoring.py           # Calcul score intelligent
│   │
│   ├── utils/
│   │   ├── file_handler.py      # Gestion fichiers (upload, stockage)
│   │   └── helpers.py           # Fonctions utilitaires
│   │
│   └── main.py                  # Point d’entrée FastAPI
│
├── requirements.txt             # Dépendances Python
└── .env                         # Variables d’environnement
```

---

## 🧠 Architecture globale

Le projet suit une architecture modulaire basée sur :

* **API Layer** → gestion des routes (FastAPI)
* **Service Layer** → logique métier
* **Data Layer** → modèles SQLAlchemy
* **AI Layer** → traitement intelligent des CV

---

## 🎯 Objectif

Ce backend permet de :

* Gérer les utilisateurs (candidats / recruteurs / admin)
* Publier et gérer des offres d’emploi
* Déposer et analyser des CV automatiquement
* Calculer un score de matching
* Classer les candidats selon leur pertinence

---

## 🚀 Technologies utilisées

* FastAPI
* PostgreSQL
* SQLAlchemy
* JWT Authentication
* NLP / AI (CV parsing & scoring)

---

# 📂 SmartCV Screening – Backend Structure (Auth Module)

## 🏗️ Structure actuelle du backend

```bash
backend/
│
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   └── auth.py
│   │   └── router.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   │
│   ├── models/
│   │   ├── role.py
│   │   ├── user.py
│   │   ├── verification_token.py
│   │   └── __init__.py
│   │
│   ├── schemas/
│   │   └── auth.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   └── email_service.py
│   │
│   └── main.py
│
├── tests/
│   ├── test_auth_service_import.py
│   ├── test_config.py
│   ├── test_database.py
│   ├── test_models_import.py
│   ├── test_role_import.py
│   ├── test_schemas_auth.py
│   └── test_security.py
│
├── requirements.txt
└── .env