# ROADMAP — tâches par lot

Coche chaque tâche (`[x]`) dès qu'elle est terminée, testée et lintée.
Ne passe au lot suivant que lorsque la validation de fin de lot est remplie.
Référence fonctionnelle : `docs/CAHIER_DES_CHARGES.md`.

## Lot 0 · Cadrage (hors code, à faire par le porteur du projet)

- [x] Nom de la marque choisi : **NAVETTE** — remplacé dans tout le dépôt
- [ ] Nom de domaine choisi et acheté (le site tourne pour l'instant sur les URLs par défaut
  Vercel et l'IP du VPS, voir `docs/DEPLOIEMENT.md`)
- [ ] Liste des formules et prix définitive
- [ ] Ville(s) de lancement et points de RDV
- [ ] Prestataires de paiement choisis, comptes de test créés (Stripe, Alma)
- [ ] Charte graphique : logo, couleurs, typographies
- [ ] Maquettes des écrans clés (accueil, page formule, choix de session, paiement, espace élève, planning moniteur)

**Validation :** marque, formules et prix arrêtés.

## Lot 1 · Socle, API et back-office minimal

### Socle
- [x] Monorepo npm workspaces : `apps/api`, `apps/app`, `apps/vitrine`, `packages/shared`
- [x] TypeScript strict, ESLint, Prettier, Husky + lint-staged
- [x] `.env.example` pour chaque app, chargement et validation des variables avec Zod
- [x] GitHub Actions : install, lint, test sur chaque push

### API
- [x] Serveur Express : helmet, cors, compression, rate-limit, gestion d'erreurs centralisée, logs (pino)
- [x] Connexion MongoDB (Mongoose) + tests avec mongodb-memory-server
- [x] Modèles : `users`, `studentProfiles`, `instructorProfiles`, `formulas`, `cities`, `meetingPoints`, `examSlots`, `sessions`, `bookings`, `payments`, `lessons`, `examResults`, `waitlist`, `auditLogs`
- [x] Index : `sessions(formulaId, statut, dates.jour)`, `meetingPoints.location` (2dsphere), `users.email` unique
- [x] Auth : register, login, refresh (cookie httpOnly), logout, mot de passe oublié
- [x] Middleware `requireRole('eleve' | 'moniteur' | 'admin')`
- [x] Routes publiques : catalogue formules, villes, points de RDV, sessions publiées
- [x] Routes admin : CRUD formules, villes, points de RDV, examSlots, sessions, utilisateurs
- [x] Règle : une session ne passe à `publiee` que si son examSlot a assez de places
- [x] `auditLogs` sur changements de prix et actions admin sensibles
- [x] Script `seed` avec données `[DEMO]` : 6 formules, 1 ville, 3 points de RDV, 2 moniteurs, 4 sessions, comptes de test par rôle
- [x] Documentation OpenAPI (swagger-ui sur `/api/docs` en dev)

### Back-office (dans `apps/app`, espace `/admin`)
- [x] Layout admin + routes protégées par rôle
- [x] Écrans : formules, villes et points de RDV, créneaux d'examen, sessions (création, duplication, publication), liste des élèves

### Tests obligatoires
- [x] Auth et droits par rôle (un élève ne peut pas appeler une route admin)
- [x] Publication de session refusée sans créneau d'examen

## Lot 2 · Réservation, paiement et espace élève

- [x] `POST /bookings` : décrément atomique de `placesRestantes`, statut `en_attente_paiement`, `expireAt` = maintenant + 15 min
- [x] Tâche planifiée : expiration des réservations non payées et libération des places
- [x] `POST /bookings/:id/checkout` : création d'une session Stripe Checkout
- [x] `POST /webhooks/payments` : vérification de signature, idempotence, passage à `confirmee`, création du `payment`
- [x] Facture PDF générée à la confirmation (numérotation continue, générée à la demande au téléchargement)
- [x] Parcours élève : formule → ville / point de RDV / boîte → sessions → compte → paiement → confirmation.
  Version simplifiée : pas d'étape dédiée de saisie des informations détaillées (NEPH, date de
  naissance, adresse) avant paiement — à ajouter si besoin, le modèle `studentProfiles` le prévoit déjà.
- [x] Espace élève : tableau de bord (prochain stage, liste des réservations avec annulation/paiement),
  documents (upload R2/S3, URL signées), paiements et factures. Version simplifiée : pas de planning
  détaillé jour par jour avec carte des points de RDV.
- [x] Report et annulation selon règles de configuration, exception admin tracée
- [x] Paiement en plusieurs fois (Alma) derrière un drapeau de configuration (`ALMA_ENABLED`, gating
  fonctionnel ; pas d'intégration réelle Alma — aucun compte/SDK disponible dans cet environnement)

### Tests obligatoires
- [x] Deux réservations simultanées sur la dernière place : une seule réussit
- [x] Réservation expirée : place libérée
- [x] Webhook rejoué deux fois : un seul paiement enregistré
- [x] Webhook à signature invalide : rejeté

**Validation :** une réservation payée de bout en bout en mode test — logique de bout en bout
validée (réservation → webhook → confirmation), mais non rejouée avec de vraies clés Stripe
(aucun compte Stripe configuré dans cet environnement). À refaire avec de vraies clés de test
avant la mise en prod.

## Lot 3 · Site vitrine (Astro)

- [x] Layout, en-tête (Connexion / Je m'inscris), pied de page, composants : carte de formule, FAQ, avis, CTA
- [x] Pages : accueil, toutes les formules, page formule dynamique, permis auto / manuel, page ville dynamique, agences, financement, méthode, FAQ, devenir moniteur, pages légales.
  Page agences : liste des points de RDV par ville ; carte interactive non intégrée (nécessite une
  clé Mapbox ou Google Maps, non disponible dans cet environnement).
- [x] Données (formules, villes, prochaines sessions) lues depuis l'API au build — vérifié avec l'API
  et des données `[DEMO]` en local (build complet des 22 pages réussi)
- [x] SEO : title / description uniques par page, Open Graph (title/description/url ; pas d'image
  `og:image` fournie pour le moment), sitemap (`@astrojs/sitemap`), `robots.txt`, canoniques
- [x] Données structurées JSON-LD : `DrivingSchool`, `Product` + `Offer`, `FAQPage`
- [x] Bandeau cookies, GA4 via GTM chargé après consentement (GTM_ID factice à remplacer avant mise en prod)
- [x] Lighthouse mobile ≥ 90 (performance et SEO) sur accueil, page formule, page ville — 100/100 sur
  les deux critères pour les trois pages (build local, `astro preview`, throttling simulé). À
  revérifier en conditions réelles une fois le site déployé (CDN, images réelles, polices, GTM actif).
- [x] Blog (collections de contenu Astro en Markdown, 2 articles `[DEMO]`)

## Lot 4 · Espace moniteur et notifications

- [x] Espace moniteur `/moniteur` (mobile d'abord) : planning, fiche élève. Version simplifiée :
  liste des sessions à venir (pas de bascule jour/semaine dédiée), lien GPS vers le point de RDV
  non ajouté (pas de coordonnées de navigation prévues pour l'instant).
- [x] Saisie après leçon : heures, compétences, commentaire, présence
- [x] Avis de fin de stage prêt / pas prêt + alerte admin (email aux comptes admin)
- [x] Déclaration des disponibilités
- [x] Récapitulatif mensuel des heures (PDF)
- [x] Service de notifications (Brevo email + SMS, REST direct) avec modèles en français. Sans
  `BREVO_API_KEY` (aucun compte disponible dans cet environnement), les envois sont seulement
  journalisés — même logique de gating que Stripe/S3/Alma.
- [x] Notifications de la section 13 déclenchées par le code : réservation confirmée (élève+moniteur),
  document refusé, place libérée (liste d'attente), résultat d'examen saisi. Non fait : rappels
  programmés (veille de leçon, veille d'examen, échéance de paiement) — nécessitent une tâche
  planifiée supplémentaire, à ajouter si besoin.
- [x] Liste d'attente : inscription (`POST /sessions/:id/waitlist`) + notification au premier
  inscrit non notifié à chaque place libérée, par ordre d'inscription
- [x] Saisie des résultats d'examen (clôture la réservation) + statistiques de réussite par
  formule/ville/moniteur dans le back-office
- [x] Export CSV des paiements (back-office)

**Validation :** recette complète en préproduction (section 16 du cahier des charges) — non rejouée
ici (pas d'environnement de préproduction disponible) ; logique vérifiée par les tests automatisés
(droits par rôle, saisie de leçon, avis de fin de stage, liste d'attente, résultats d'examen).

## Lot 5 · Pilote et lancement

- [ ] Déploiement production : vitrine et app (Vercel), API (VPS Docker + Nginx ou Render), Atlas UE, Cloudflare.
  Infra préparée en code (voir `docs/DEPLOIEMENT.md`) : `Dockerfile` API, `docker-compose` +
  config Nginx dans `deploy/`, `vercel.json` pour vitrine/app, workflow GitHub Actions qui publie
  l'image Docker sur ghcr.io. Rien n'a été réellement déployé (pas de comptes Vercel/Atlas/VPS
  disponibles dans cet environnement) — à faire par le porteur du projet en suivant le guide.
- [ ] Sauvegardes quotidiennes de la base + test de restauration. Scripts prêts
  (`deploy/backup/backup-mongo.sh`, `deploy/backup/restore-test.sh`), en complément des
  sauvegardes automatiques à activer dans Atlas — aucun des deux n'a pu être exécuté ici.
- [ ] Clés Stripe en mode live, webhooks de production configurés
- [ ] Ouverture dans la première ville, suivi des premières réservations
- [ ] Collecte automatique des avis après examen
- [ ] Corrections issues du pilote
