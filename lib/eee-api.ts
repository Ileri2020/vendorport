import { createHash, createDecipheriv, createCipheriv, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const MAX_EEE_REQUEST_BYTES = 2_100_000;
export const MAX_EEE_CONTENT_BYTES = 1_000_000;

export class EeePayloadTooLargeError extends Error {
  constructor() {
    super("The request exceeds the maximum allowed size.");
    this.name = "EeePayloadTooLargeError";
  }
}

export async function readBoundedJson(request: NextRequest, maxBytes = MAX_EEE_REQUEST_BYTES): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw new EeePayloadTooLargeError();
  if (!request.body) throw new SyntaxError("A JSON request body is required.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new EeePayloadTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body)) as unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function optionalText(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new TypeError("Optional fields must be strings.");
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new RangeError("A field exceeds its maximum length.");
  return normalized || undefined;
}

export function buildComponentSummary(components: unknown[]): string {
  const counts = new Map<string, number>();
  for (const component of components) {
    if (!isRecord(component)) continue;
    const type = typeof component.ComponentType === "string" ? component.ComponentType : "Component";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return [...counts.entries()].slice(0, 8).map(([type, count]) => `${count}x ${type}`).join(", ") || "Empty circuit";
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  const id = (session?.user as { id?: unknown } | undefined)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function getApiTokenUserId(request: NextRequest): Promise<string | null> {
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([A-Za-z0-9_-]{32,})$/i.exec(authorization);
  if (!match) return null;

  const tokenHash = createHash("sha256").update(match[1], "utf8").digest("hex");
  const token = await prisma.apiAccessToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, revokedAt: true },
  });
  if (!token || token.revokedAt || token.expiresAt <= new Date()) return null;

  await prisma.apiAccessToken.update({ where: { id: token.id }, data: { lastUsedAt: new Date() } });
  return token.userId;
}

function encryptionKey(): Buffer {
  const encoded = process.env.EEE_USER_API_KEY_ENCRYPTION_KEY;
  if (!encoded) throw new Error("User API key encryption is not configured on this server.");
  let key: Buffer;
  try {
    key = /^[0-9a-f]{64}$/i.test(encoded) ? Buffer.from(encoded, "hex") : Buffer.from(encoded, "base64");
  } catch {
    throw new Error("User API key encryption is not configured correctly.");
  }
  if (key.length !== 32) throw new Error("EEE_USER_API_KEY_ENCRYPTION_KEY must encode exactly 32 bytes.");
  return key;
}

export function encryptUserApiKey(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return { ciphertext: ciphertext.toString("base64"), iv: iv.toString("base64"), authTag: cipher.getAuthTag().toString("base64") };
}

export function decryptUserApiKey(record: { ciphertext: string; iv: string; authTag: string }): string {
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(record.iv, "base64"));
  decipher.setAuthTag(Buffer.from(record.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(record.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function hashApiToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createApiToken(): string {
  return randomBytes(32).toString("base64url");
}
