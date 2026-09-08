# Standalone thumbnail migration

The standalone runner does not load the app `.env`, Prisma-generated clients, scraped databases, or app source files. It reads only `scripts/.env.thumbnail-migration`.

Run these in a Colab **code cell** with `!` before shell commands:

```python
!npm install mongodb cloudinary sharp dotenv
!cp scripts/thumbnail-migration.env.example scripts/.env.thumbnail-migration
# Fill in MONGODB_URL, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.
!node scripts/migrate-thumbnails-standalone.js --dry-run
!node scripts/migrate-thumbnails-standalone.js
```

For a limited test:

```python
!node scripts/migrate-thumbnails-standalone.js --limit=5
```

The runner only writes URLs containing the configured `CLOUDINARY_CLOUD_NAME`. A source image that returns `401` cannot be copied without access to its original Cloudinary account; those products are reported as failed rather than having a bad URL saved.
