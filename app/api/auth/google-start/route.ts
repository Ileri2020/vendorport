import { signIn } from "@/auth";
import { getSafeAuthReturnUrl } from "@/lib/auth-return-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirectTo") || "/";
  const targetUrl = getSafeAuthReturnUrl(returnUrl, request.url);

  return await signIn("google", { redirectTo: targetUrl });
}
