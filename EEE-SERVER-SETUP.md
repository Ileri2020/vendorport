# EESimulator API on HCVP

HCVP is the server for EESimulator AI and community examples. The EEE MAUI client holds no Gemini provider keys. Community example records, app tokens, and encrypted per-user provider keys live in HCVP's MongoDB Prisma schema.

## Configure key encryption

Set `EEE_USER_API_KEY_ENCRYPTION_KEY` in the HCVP server environment to a cryptographically random 32-byte value encoded as base64. Keep it in the deployment secret manager or ignored local `.env`, never commit it, and keep a protected backup. Changing the value without re-encrypting stored rows makes existing user keys unreadable.

`EEE_GEMINI_MODEL` optionally selects the Gemini model; it defaults to `gemini-2.5-flash`. User-provided Gemini keys are stored with AES-256-GCM and are never returned by an API route. The retired `/api/keys/gemini` route no longer exposes the global server key.

## Database and API

After updating the Prisma schema, regenerate the Prisma client and apply the MongoDB schema using the HCVP project's normal Prisma workflow. The new models are `CommunityExample`, `ApiAccessToken`, and `EeeUserApiKey`; they extend the existing `User` model relations.

- `GET /api/examples`: published community schematics.
- `POST /api/examples`: publish a schematic using the user's EEE app bearer token.
- `POST /api/ai/schema-script`: generate a reviewable EESimulator draft using the user's own saved Gemini key and EEE app bearer token.
- `/api/eee/ai-key`: authenticated account-only status, replace, and remove actions. The key is write-only from the browser; it is not returned after saving.
- `/api/eee/token`: authenticated account-only creation, status, rotation, and revocation of a hashed EEE app token. The raw token is shown only once.
- `/api/eee/account`: signed-in account status only; contains no secret material.

Users sign in or register on HCVP's existing `/account` page. In the EESimulator account panel they save their Gemini key and create an app token; they then paste the token into EESimulator's Settings. Configure the EEE API base URL to the HCVP HTTPS origin in production. Local HCVP development defaults to port 3000 (Android emulator host: `http://10.0.2.2:3000`).

Use HTTPS in production. Apply rate limits at the edge as well as in the AI handler for deployments running multiple server instances.
