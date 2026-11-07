# CLAUDE.md — Plateforme d'auto-école en accéléré

Ce fichier est lu automatiquement par Claude Code au démarrage de chaque session.
Le cahier des charges complet est dans `docs/CAHIER_DES_CHARGES.md` et le plan de travail
dans `docs/ROADMAP.md`. Lis-les avant toute tâche importante.

## Le projet en une phrase

Plateforme d'auto-école spécialisée dans le permis en accéléré : l'élève réserve en ligne un
stage intensif dont il connaît les dates, le moniteur et la date d'examen avant de payer.
Nom de marque : **NAVETTE**.

## Langue

- Interface, textes, commentaires métier et messages de commit : **français**.
- Noms de variables, fonctions, fichiers et routes : **anglais** (`booking`, `session`, `formula`).

## Structure du monorepo (npm workspaces)

```
apps/
  vitrine/   # Site marketing statique (Astro + Tailwind), SEO
  app/       # App React + Vite + TS : espaces élève, moniteur, admin (séparés par rôle)
  api/       # API Node.js + Express + TS + Mongoose
packages/
  shared/    # Types TS, schémas Zod et constantes partagés (statuts, rôles, catégories)
docs/
  CAHIER_DES_CHARGES.md
  ROADMAP.md
```

## Stack

| Couche | Choix |
| --- | --- |
| Vitrine | Astro, Tailwind CSS, génération statique, données lues depuis l'API au build |
| App | React 18, Vite, TypeScript strict, React Router, TanStack Query, Tailwind CSS |
| API | Node.js 20+, Express, TypeScript, Mongoose, Zod, JWT (access court + refresh en cookie httpOnly) |
| Base | MongoDB Atlas (région UE) |
| Fichiers | Cloudflare R2 ou S3, URL signées |
| Paiement | Stripe Checkout + webhooks (Alma pour le paiement en plusieurs fois) |
| Emails / SMS | Brevo (ou Resend + Twilio) |
| Tâches planifiées | node-cron (V1), BullMQ + Redis si besoin |

## Commandes (à créer au Lot 1, garder cette liste à jour)

```bash
npm install                 # à la racine
npm run dev -w apps/api     # API sur http://localhost:4000
npm run dev -w apps/app     # App sur http://localhost:5173
npm run dev -w apps/vitrine # Vitrine sur http://localhost:4321
npm run test -w apps/api    # Tests API (Vitest + Supertest + mongodb-memory-server)
npm run lint                # ESLint + Prettier sur tout le monorepo
npm run seed -w apps/api    # Données de démo : formules, villes, sessions, comptes de test
```

## Règles métier NON NÉGOCIABLES

1. **Pas de survente.** `sessions.placesRestantes` se décrémente uniquement de façon atomique :
   `findOneAndUpdate({ _id, placesRestantes: { $gt: 0 } }, { $inc: { placesRestantes: -1 } })`.
   Jamais de lecture puis écriture séparées.
2. **Place bloquée pendant le paiement** : une réservation `en_attente_paiement` expire après
   15 minutes (valeur dans la config) ; une tâche planifiée libère la place.
3. **Examen garanti** : une session ne peut passer à `publiee` que si elle est rattachée à un
   `examSlot` ayant assez de places libres.
4. **Confirmation uniquement par webhook** : une réservation passe à `confirmee` seulement à la
   réception d'un webhook de paiement dont la signature est vérifiée. Jamais sur le retour navigateur.
5. **Montants en centimes** (entiers). **Dates en UTC** en base, affichées en `Europe/Paris`.
6. **Rôles** : `eleve`, `moniteur`, `admin`. Chaque route de l'API passe par un middleware de rôle.
   Un élève ne voit que ses données ; un moniteur que ses élèves et ses sessions, sans aucune donnée de paiement.
7. **Actions sensibles tracées** dans `auditLogs` (changement de prix, remboursement, exception forcée).

## Conventions de code

- TypeScript `strict: true` partout. Pas de `any` sauf justification en commentaire.
- Toute entrée d'API validée par un schéma Zod de `packages/shared`, réutilisé côté front.
- Routes préfixées `/api/v1`, réponses JSON `{ data }` ou `{ error: { code, message } }`.
- Statuts et énumérations définis une seule fois dans `packages/shared` (pas de chaînes en dur).
- Un fichier par modèle Mongoose, un routeur Express par ressource, la logique métier dans `services/`.
- Secrets uniquement dans `.env` (jamais commités) ; maintenir un `.env.example` à jour.
- Tests obligatoires pour : réservation, concurrence sur la dernière place, expiration, webhook, droits par rôle.

## Contenus et originalité

- Le projet s'inspire du **concept** de La Navette (lanavette.co) mais **aucun texte, image, logo,
  slogan, chiffre ou charte graphique** de leur site ne doit être copié.
- N'invente pas de prix, statistiques, avis clients ou taux de réussite : utilise des données de démo
  clairement marquées `[DEMO]` dans le seed.
- Le dossier `research/` contient des données de veille concurrentielle (scraping de lanavette.co,
  captures d'écran) à usage strictement interne d'analyse. Elles ne doivent jamais être copiées dans
  le code, les textes ou les visuels du produit — seulement servir de repère de structure et de prix
  de marché pour calibrer nos propres offres.

## Façon de travailler

- Travaille **un lot à la fois**, dans l'ordre de `docs/ROADMAP.md`. Coche les tâches terminées.
- Avant une tâche importante : propose un plan court, puis exécute.
- Demande avant d'ajouter une dépendance lourde ou de changer un choix de stack ci-dessus.
- Après chaque fonctionnalité : lance les tests et le lint, corrige avant de passer à la suite.
- Livre des fichiers complets et fonctionnels plutôt que des extraits partiels.
