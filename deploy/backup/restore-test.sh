#!/usr/bin/env bash
# Test de restauration (section 16 du cahier des charges) : restaure la derniere sauvegarde dans
# une base MongoDB temporaire et verifie qu'au moins les collections cles existent avec des
# documents. A executer manuellement apres chaque changement important, ou mensuellement.
#
# Usage : ./restore-test.sh [chemin-vers-archive.gz]
# Necessite un MongoDB local ou accessible pour la restauration de test (ne touche jamais la
# base de production : restaure toujours dans une base nommee "restore-test").
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/plateforme/backups}"
RESTORE_URI="${RESTORE_URI:-mongodb://127.0.0.1:27017}"
TEST_DB="restore-test-$(date +%s)"

ARCHIVE_PATH="${1:-$(ls -t "${BACKUP_DIR}"/mongo-*.gz 2>/dev/null | head -n1)}"

if [[ -z "${ARCHIVE_PATH}" || ! -f "${ARCHIVE_PATH}" ]]; then
  echo "Aucune archive de sauvegarde trouvee (ni fournie en argument, ni dans ${BACKUP_DIR})." >&2
  exit 1
fi

echo "Restauration de ${ARCHIVE_PATH} dans ${RESTORE_URI}/${TEST_DB}..."
mongorestore --uri="${RESTORE_URI}/${TEST_DB}" --archive="${ARCHIVE_PATH}" --gzip --nsFrom='*' --nsTo="${TEST_DB}.*"

echo "Verification des collections cles..."
FAILED=0
for collection in users formulas sessions bookings; do
  count=$(mongosh --quiet "${RESTORE_URI}/${TEST_DB}" --eval "db.${collection}.countDocuments({})")
  echo "  ${collection} : ${count} document(s)"
  if [[ "${count}" -eq 0 ]]; then
    echo "  ATTENTION : collection ${collection} vide apres restauration" >&2
    FAILED=1
  fi
done

echo "Nettoyage de la base de test..."
mongosh --quiet "${RESTORE_URI}/${TEST_DB}" --eval "db.dropDatabase()" >/dev/null

if [[ "${FAILED}" -eq 1 ]]; then
  echo "Test de restauration : ECHEC (voir avertissements ci-dessus)" >&2
  exit 1
fi

echo "Test de restauration : OK"
