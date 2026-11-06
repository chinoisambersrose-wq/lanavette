#!/usr/bin/env bash
# Sauvegarde quotidienne de la base (section 16 du cahier des charges).
#
# A planifier via cron sur le VPS, par exemple a 3h du matin :
#   0 3 * * * MONGODB_URI="mongodb+srv://..." /opt/plateforme/deploy/backup/backup-mongo.sh >> /var/log/backup-mongo.log 2>&1
#
# MongoDB Atlas fournit deja des sauvegardes automatiques (a activer dans son interface) : ce
# script est une sauvegarde complementaire, independante d'Atlas (utile en cas de probleme de
# compte Atlas, ou sur un plan ne proposant pas les sauvegardes continues).
set -euo pipefail

: "${MONGODB_URI:?Variable MONGODB_URI manquante}"
BACKUP_DIR="${BACKUP_DIR:-/opt/plateforme/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
ARCHIVE_PATH="${BACKUP_DIR}/mongo-${TIMESTAMP}.gz"

mkdir -p "${BACKUP_DIR}"

echo "Sauvegarde vers ${ARCHIVE_PATH}..."
mongodump --uri="${MONGODB_URI}" --archive="${ARCHIVE_PATH}" --gzip

if [[ -n "${S3_BACKUP_BUCKET:-}" ]] && command -v aws >/dev/null 2>&1; then
  echo "Televersement vers s3://${S3_BACKUP_BUCKET}..."
  aws s3 cp "${ARCHIVE_PATH}" "s3://${S3_BACKUP_BUCKET}/mongo-backups/$(basename "${ARCHIVE_PATH}")"
fi

echo "Nettoyage des sauvegardes de plus de ${RETENTION_DAYS} jours..."
find "${BACKUP_DIR}" -name 'mongo-*.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "Sauvegarde terminee : ${ARCHIVE_PATH}"
