# Colab Thumbnail Migration

Move this entire folder to Google Drive or upload it to Colab. It contains everything needed for the migration:

- `migrate-thumbnails.js`
- `.env.example`
- `schema.prisma`
- `package.json`
- `migrate-healthclique-drugs.js`

The real `.env` file is intentionally not included. Copy `.env.example` to `.env` and fill in the database and Cloudinary credentials.

## Google Colab

Run these commands in a Python code cell. The `!` prefix tells Colab to run shell commands:

```python
!cd /content/drive/MyDrive/thumbnail-migration-colab && npm install
!cp /content/drive/MyDrive/thumbnail-migration-colab/.env.example /content/drive/MyDrive/thumbnail-migration-colab/.env
```

Edit `.env`, then run a preview:

```python
!cd /content/drive/MyDrive/thumbnail-migration-colab && npx prisma generate --schema schema.prisma && node migrate-thumbnails.js --dry-run
```

Run the migration:

```python
!cd /content/drive/MyDrive/thumbnail-migration-colab && npx prisma generate --schema schema.prisma && node migrate-thumbnails.js
```

Test only five products first:

```python
!cd /content/drive/MyDrive/thumbnail-migration-colab && npx prisma generate --schema schema.prisma && node migrate-thumbnails.js --limit=5
```

Import HealthClique categories and products into the platform as drugs:

```python
!cd /content/drive/MyDrive/thumbnail-migration-colab && node migrate-healthclique-drugs.js --dry-run
!cd /content/drive/MyDrive/thumbnail-migration-colab && node migrate-healthclique-drugs.js --limit=5
!cd /content/drive/MyDrive/thumbnail-migration-colab && node migrate-healthclique-drugs.js
```

The importer reads `HEALTHCLIQUE_MONGODB_URL` as the source and `MONGODB_URL` as the platform destination. It is idempotent by product name and destination category, marks imported records as `catalogType: "drug"`, and prints progress for every category and product.

The script uses Prisma with only the app-style `MONGODB_URL`. Cloudinary is configured through one `CLOUDINARY_URL`, targeting the app cloud `dc5khnuiu`. Products whose original image and old thumbnail are both inaccessible are reported as failed and are not updated.

The script overrides any pre-existing Colab environment variables with the values in this folder's `.env`, so an older injected `.env` cannot replace the app connection string.

The runner prints timestamped progress for environment loading, Prisma connection, product loading, each image download/compression/upload, and each database update. If you run the script from another folder, set `MIGRATION_ENV_FILE` to the copied `.env` path.

If MongoDB still reports `Authentication failed`, verify that the database user password in `.env` is current. The URL in `.env` matches the application's MongoDB URL exactly.
