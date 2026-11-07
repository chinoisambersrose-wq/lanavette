# Déploiement — Lot 5

Ce document décrit comment mettre en production ce qui est déjà préparé dans le dépôt
(`Dockerfile`, `deploy/`, `vercel.json`, workflows GitHub Actions). Il ne remplace pas le Lot 0 :
nom de marque, prix définitifs, ville de lancement et comptes de paiement doivent être tranchés
avant une ouverture publique (voir `docs/ROADMAP.md`).

Rien de tout cela n'a été exécuté depuis cet environnement : aucune commande ci-dessous n'a été
lancée contre de vrais comptes Vercel/Atlas/Stripe/Cloudflare. Chaque étape doit être suivie et
vérifiée par le porteur du projet.

## Vue d'ensemble

| Composant | Hébergement | Déclenchement |
| --- | --- | --- |
| `apps/vitrine` | Vercel | Git (push sur `main`), auto-détecté par Vercel |
| `apps/app` | Vercel | Git (push sur `main`), auto-détecté par Vercel |
| `apps/api` | VPS (Docker + Nginx) | GitHub Actions (`.github/workflows/deploy-api.yml`) |
| Base de données | MongoDB Atlas (région UE) | — |
| Fichiers privés | Cloudflare R2 (ou S3) | — |
| DNS / CDN | Cloudflare | — |

L'API doit être en ligne et accessible **avant** le premier build de la vitrine : `astro build`
lit le catalogue (formules, villes, sessions) via l'API au moment du build.

## 1. MongoDB Atlas

1. Créer un cluster dans une région UE (ex. Paris ou Francfort).
2. Créer un utilisateur applicatif dédié (pas le compte admin Atlas).
3. Autoriser l'accès réseau : IP du VPS de l'API (pas `0.0.0.0/0`).
4. Activer les sauvegardes automatiques (Atlas > Backup) — c'est la sauvegarde quotidienne
   principale demandée en section 16 du cahier des charges. `deploy/backup/backup-mongo.sh` est
   une sauvegarde complémentaire indépendante d'Atlas (utile si le plan ne propose pas les
   sauvegardes continues, ou en secours).
5. Récupérer la chaîne de connexion → `MONGODB_URI` en production.

## 2. API (VPS + Docker + Nginx)

### Image Docker

`apps/api/Dockerfile` (contexte = racine du monorepo, car il a besoin de `packages/shared`) :

```bash
docker build -f apps/api/Dockerfile -t plateforme-api .
```

`.github/workflows/deploy-api.yml` construit cette image et la publie automatiquement sur
`ghcr.io/<compte>/<repo>/api` à chaque push sur `main` touchant `apps/api` ou `packages/shared`.
Aucun secret n'est requis pour cette partie (le `GITHUB_TOKEN` suffit).

### VPS

Important : sur ce VPS, Docker + Docker Compose sont déjà installés et le serveur héberge déjà
d'autres sites en production, avec un nginx **système** (hors Docker) propriétaire des ports
80/443. `deploy/docker-compose.yml` ne lance donc **pas** de conteneur nginx : l'API publie son
port directement sur le host (`4100` par défaut — `4000` y était déjà pris par un autre service),
et on branche le nginx système existant dessus une fois un domaine choisi.

1. Copier sur le VPS, dans `/opt/plateforme/` :
   - `deploy/docker-compose.yml`
   - `deploy/.env.example` → copié en `.env`, rempli avec les vraies valeurs de production
     (jamais commité)
2. Se connecter au registre et lancer le conteneur :
   ```bash
   docker login ghcr.io -u <compte> -p <token GitHub avec droit read:packages>
   docker compose pull
   docker compose up -d
   ```
   L'API est alors joignable sur `http://<ip-du-vps>:4100` (accès direct, sans HTTPS) — suffisant
   pour tester en attendant un nom de domaine.
3. Une fois un domaine choisi et pointé vers l'IP du VPS (Cloudflare DNS, sous-domaine type
   `api.votredomaine.fr`) :
   ```bash
   cp deploy/nginx/api.conf /etc/nginx/sites-available/api-lanavette
   # remplacer api.exemple.fr par le vrai sous-domaine dans ce fichier,
   # et commenter le bloc 443 le temps d'obtenir le premier certificat
   ln -s /etc/nginx/sites-available/api-lanavette /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   certbot certonly --webroot -w /var/www/certbot -d api.votredomaine.fr
   # reactiver le bloc 443 dans le fichier, puis :
   nginx -t && systemctl reload nginx
   ```
4. Planifier le renouvellement du certificat (cron `certbot renew` deux fois par mois) et la
   sauvegarde (`deploy/backup/backup-mongo.sh`, voir le cron dans ce fichier).

### Déploiement automatique (optionnel)

Pour que `deploy-api.yml` se connecte en SSH et relance l'API après chaque publication d'image,
configurer dans **Settings > Secrets and variables > Actions** du dépôt GitHub :

- Variables (non secrètes) : `VPS_HOST`, `VPS_USER`
- Secret : `VPS_SSH_KEY` (clé privée dédiée, droits limités au redémarrage des conteneurs)

Sans ces secrets, l'étape est simplement ignorée et le déploiement reste manuel (étape 5
ci-dessus, à refaire après chaque image publiée).

## 3. Vitrine et app (Vercel)

Pour chacun des deux projets (`apps/vitrine`, `apps/app`) :

1. Importer le dépôt GitHub dans Vercel.
2. **Root Directory** : `apps/vitrine` (ou `apps/app`) — `vercel.json` à l'intérieur suppose
   cette racine (ses commandes font `cd ../..` pour revenir à la racine du monorepo).
3. Variables d'environnement :
   - `apps/vitrine` : `API_URL` (URL publique de l'API, ex. `https://api.votredomaine.fr/api/v1`),
     `APP_URL` (URL de l'app élève)
   - `apps/app` : `VITE_API_URL` (même API, ex. `https://api.votredomaine.fr/api/v1`)
4. Domaine personnalisé via Cloudflare (CNAME vers Vercel), ex. `www.votredomaine.fr` pour la
   vitrine et `app.votredomaine.fr` pour l'app.
5. Mettre à jour côté API les variables `APP_ORIGIN` et `VITRINE_ORIGIN` (CORS) avec ces domaines
   définitifs, et côté vitrine `site` dans `apps/vitrine/astro.config.mjs` (actuellement un
   placeholder `https://www.exemple.fr`, utilisé pour le sitemap et les URLs canoniques).

Vercel rebuild automatiquement à chaque push sur `main` (aucun workflow GitHub Actions
supplémentaire nécessaire pour ces deux apps).

## 4. Stripe en mode live

1. Activer le compte Stripe (informations légales de l'entreprise).
2. Récupérer les clés **live** (`sk_live_...`) et configurer le webhook de production
   (`https://api.votredomaine.fr/api/v1/webhooks/payments`, événement
   `checkout.session.completed`) → `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` en production.
3. Ne jamais réutiliser les clés `sk_test_...` en production (règle déjà appliquée par le code :
   `ALMA_ENABLED` et les clés Stripe sont lues depuis l'environnement, jamais codées en dur).

## 5. Sauvegardes et test de restauration

- Sauvegarde principale : backups automatiques Atlas (section 16 du cahier des charges).
- Sauvegarde complémentaire : `deploy/backup/backup-mongo.sh`, à planifier en cron sur le VPS.
- Test de restauration : `deploy/backup/restore-test.sh` restaure la dernière sauvegarde dans une
  base temporaire (jamais la production) et vérifie que les collections clés contiennent des
  documents. À exécuter après chaque changement important de schéma, ou mensuellement.

## 6. Avant l'ouverture au public

- [x] Nom de marque tranché : **NAVETTE**, remplacé partout dans le code (vitrine, app, emails,
  factures PDF). Reste à trancher : domaine, prix définitifs, ville de lancement, charte graphique
- [ ] `exemple.fr` remplacé par le vrai domaine une fois choisi (sitemap, URLs canoniques,
  CORS `APP_ORIGIN`/`VITRINE_ORIGIN`)
- [ ] Seed de démo retiré avant l'ouverture publique : le script `apps/api/src/seed.ts` a été
  lancé une fois sur la base de production pour valider le déploiement de bout en bout (données
  clairement marquées `[DEMO]`) — à effacer (ou simplement laisser les vraies formules les
  remplacer) avant d'ouvrir au public
- [ ] Scénarios de recette de la section 16 du cahier des charges rejoués en préproduction avec
  de vraies clés de test (Lot 2 et Lot 4 l'ont été uniquement avec des tests automatisés et des
  clés factices, faute de comptes Stripe/Atlas/Vercel disponibles dans cet environnement)
