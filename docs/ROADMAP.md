# ROADMAP — tâches par lot

Coche chaque tâche (`[x]`) dès qu'elle est terminée, testée et lintée.
Ne passe au lot suivant que lorsque la validation de fin de lot est remplie.
Référence fonctionnelle : `docs/CAHIER_DES_CHARGES.md`.

## Lot 0 · Cadrage (hors code, à faire par le porteur du projet)

- [ ] Nom de la marque et domaine choisis — remplacer `[NOM]` dans tout le dépôt
- [ ] Liste des formules et prix définitive
- [ ] Ville(s) de lancement et points de RDV
- [ ] Prestataires de paiement choisis, comptes de test créés (Stripe, Alma)
- [ ] Charte graphique : logo, couleurs, typographies
- [ ] Maquettes des écrans clés (accueil, page formule, choix de session, paiement, espace élève, planning moniteur)

**Validation :** marque, formules et prix arrêtés.

## Lot 1 · Socle, API et back-office minimal

### Socle
- [ ] Monorepo npm workspaces : `apps/api`, `apps/app`, `apps/vitrine`, `packages/shared`
- [ ] TypeScript strict, ESLint, Prettier, Husky + lint-staged
- [ ] `.env.example` pour chaque app, chargement et validation des variables avec Zod
- [ ] GitHub Actions : install, lint, test sur chaque push

### API
- [ ] Serveur Express : helmet, cors, compression, rate-limit, gestion d'erreurs centralisée, logs (pino)
- [ ] Connexion MongoDB (Mongoose) + tests avec mongodb-memory-server
- [ ] Modèles : `users`, `studentProfiles`, `instructorProfiles`, `formulas`, `cities`, `meetingPoints`, `examSlots`, `sessions`, `bookings`, `payments`, `lessons`, `examResults`, `waitlist`, `auditLogs`
- [ ] Index : `sessions(formulaId, statut, dates.jour)`, `meetingPoints.location` (2dsphere), `users.email` unique
- [ ] Auth : register, login, refresh (cookie httpOnly), logout, mot de passe oublié
- [ ] Middleware `requireRole('eleve' | 'moniteur' | 'admin')`
- [ ] Routes publiques : catalogue formules, villes, points de RDV, sessions publiées
- [ ] Routes admin : CRUD formules, villes, points de RDV, examSlots, sessions, utilisateurs
- [ ] Règle : une session ne passe à `publiee` que si son examSlot a assez de places
- [ ] `auditLogs` sur changements de prix et actions admin sensibles
- [ ] Script `seed` avec données `[DEMO]` : 6 formules, 1 ville, 3 points de RDV, 2 moniteurs, 4 sessions, comptes de test par rôle
- [ ] Documentation OpenAPI (swagger-ui sur `/api/docs` en dev)

### Back-office (dans `apps/app`, espace `/admin`)
- [ ] Layout admin + routes protégées par rôle
- [ ] Écrans : formules, villes et points de RDV, créneaux d'examen, sessions (création, duplication, publication), liste des élèves

### Tests obligatoires
- [ ] Auth et droits par rôle (un élève ne peut pas appeler une route admin)
- [ ] Publication de session refusée sans créneau d'examen

## Lot 2 · Réservation, paiement et espace élève

- [ ] `POST /bookings` : décrément atomique de `placesRestantes`, statut `en_attente_paiement`, `expireAt` = maintenant + 15 min
- [ ] Tâche planifiée : expiration des réservations non payées et libération des places
- [ ] `POST /bookings/:id/checkout` : création d'une session Stripe Checkout
- [ ] `POST /webhooks/payments` : vérification de signature, idempotence, passage à `confirmee`, création du `payment`
- [ ] Facture PDF générée à la confirmation
- [ ] Parcours élève : formule → ville / point de RDV / boîte → sessions → compte → informations → paiement → confirmation
- [ ] Espace élève : tableau de bord, planning, documents (upload vers R2/S3, URL signées), paiements et factures
- [ ] Report et annulation selon règles de configuration, exception admin tracée
- [ ] Paiement en plusieurs fois (Alma) derrière un drapeau de configuration

### Tests obligatoires
- [ ] Deux réservations simultanées sur la dernière place : une seule réussit
- [ ] Réservation expirée : place libérée
- [ ] Webhook rejoué deux fois : un seul paiement enregistré
- [ ] Webhook à signature invalide : rejeté

**Validation :** une réservation payée de bout en bout en mode test.

## Lot 3 · Site vitrine (Astro)

- [ ] Layout, en-tête (Connexion / Je m'inscris), pied de page, composants : carte de formule, FAQ, avis, CTA
- [ ] Pages : accueil, toutes les formules, page formule dynamique, permis auto / manuel, page ville dynamique, agences (carte), financement, méthode, FAQ, devenir moniteur, pages légales
- [ ] Données (formules, villes, prochaines sessions) lues depuis l'API au build
- [ ] SEO : title / description uniques, Open Graph, sitemap, robots, canoniques
- [ ] Données structurées JSON-LD : `DrivingSchool`, `Product` + `Offer`, `FAQPage`
- [ ] Bandeau cookies, GA4 via GTM chargé après consentement
- [ ] Lighthouse mobile ≥ 90 (performance et SEO) sur accueil, page formule, page ville
- [ ] Blog (collections de contenu Astro en Markdown)

## Lot 4 · Espace moniteur et notifications

- [ ] Espace moniteur `/moniteur` (mobile d'abord) : planning jour / semaine, fiche élève
- [ ] Saisie après leçon : heures, compétences, commentaire, présence
- [ ] Avis de fin de stage prêt / pas prêt + alerte admin
- [ ] Déclaration des disponibilités
- [ ] Récapitulatif mensuel des heures (PDF)
- [ ] Service de notifications (emails Brevo / Resend, SMS) avec modèles en français
- [ ] Notifications de la section 13 du cahier des charges
- [ ] Liste d'attente : inscription + notification à chaque place libérée
- [ ] Saisie des résultats d'examen + statistiques de réussite dans le back-office
- [ ] Export CSV des paiements

**Validation :** recette complète en préproduction (section 16 du cahier des charges).

## Lot 5 · Pilote et lancement

- [ ] Déploiement production : vitrine et app (Vercel), API (VPS Docker + Nginx ou Render), Atlas UE, Cloudflare
- [ ] Sauvegardes quotidiennes de la base + test de restauration
- [ ] Clés Stripe en mode live, webhooks de production configurés
- [ ] Ouverture dans la première ville, suivi des premières réservations
- [ ] Collecte automatique des avis après examen
- [ ] Corrections issues du pilote
