import { signIn } from "@/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirectTo") || "/";

  let targetUrl = "/";
  try {
    const parsed = new URL(returnUrl);
    if (
      parsed.hostname === "vport.store" ||
      parsed.hostname.endsWith(".vport.store") ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1"
    ) {
      targetUrl = parsed.toString();
    }
  } catch {
    targetUrl = "/";
  }

  return await signIn("google", { redirectTo: targetUrl });
}
