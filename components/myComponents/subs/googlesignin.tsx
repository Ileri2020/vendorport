// @ts-nocheck
'use server'

import { signIn } from "@/auth";
import { FcGoogle } from "react-icons/fc";
import { headers } from "next/headers";

// Login paths that should never be used as a return destination.
const LOGIN_PATHS = ["/login", "/register", "/signup", "/sign-in", "/sign-up"];

/**
 * Determines where to send the user after Google OAuth completes.
 *
 * Strategy (in priority order):
 * 1. Use the referer URL if it is a valid *.vport.store host AND is not a login/register page.
 * 2. Fall back to the origin subdomain's homepage, derived from the x-forwarded-host or host header.
 * 3. Fall back to "/" (root domain homepage).
 *
 * This handles the sidebar Login Drawer case correctly: when a user opens
 * the Drawer on adepoju05.vport.store/store, the referer is that store page
 * and they are returned there after authentication. If somehow the referer
 * is a login page, we use the host header to return them to the store homepage.
 */
async function getReturnUrl() {
  const headerMap = await headers();
  const referer = headerMap.get("referer");

  // Determine the current host (works behind Vercel's reverse proxy)
  const rawHost =
    headerMap.get("x-forwarded-host") ||
    headerMap.get("host") ||
    "vport.store";
  // x-forwarded-host can be a comma-separated list; take the first entry
  const host = rawHost.split(",")[0].trim();

  const isProduction = process.env.NODE_ENV === "production";
  const isValidHost =
    host === "vport.store" ||
    host.endsWith(".vport.store") ||
    host === "localhost" ||
    host.startsWith("localhost:");

  // Build the subdomain fallback homepage URL from the originating host
  const protocol = isProduction ? "https" : "http";
  const hostFallback = isValidHost ? `${protocol}://${host}/` : "/";

  // Try to use the referer if it's a valid vport.store URL and not a login page
  if (referer) {
    try {
      const url = new URL(referer);
      const isAllowedHost =
        url.hostname === "vport.store" ||
        url.hostname.endsWith(".vport.store") ||
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1";

      const isLoginPath = LOGIN_PATHS.some(
        (p) => url.pathname === p || url.pathname.startsWith(p + "/")
      );

      if (isAllowedHost && !isLoginPath) {
        return url.toString();
      }
    } catch {
      // fall through
    }
  }

  // Return the originating subdomain's homepage (or root if host is invalid)
  return hostFallback;
}

/* ================= GOOGLE ================= */

export const GoogleSignIn = async () => {
  const googleSignInAction = async () => {
    "use server";
    await signIn("google", { redirectTo: await getReturnUrl() });
  };

  return (
    <div className="m-2">
      <form action={googleSignInAction}>
        <button
          type="submit"
          className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
        >
          <FcGoogle className="h-4 w-4" />
          <span className="text-sm">Google</span>
        </button>
      </form>
    </div>
  );
};

export const googleSignIn = async () => {
  "use server";
  await signIn("google", { redirectTo: await getReturnUrl() });
};

/* ================= FACEBOOK ================= */

export const facebookSignIn = async () => {
  "use server";
  await signIn("facebook");
};