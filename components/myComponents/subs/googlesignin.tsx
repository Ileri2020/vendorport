// @ts-nocheck
'use server'

import { signIn } from "@/auth";
import { getSafeAuthReturnUrl } from "@/lib/auth-return-url";
import { FcGoogle } from "react-icons/fc";
import { headers } from "next/headers";

async function getReturnUrl() {
  const headerList = await headers();
  const referer = headerList.get("referer");
  const forwardedHost = headerList.get("x-forwarded-host") || headerList.get("host");
  const forwardedProto = headerList.get("x-forwarded-proto") || "https";
  const currentOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : undefined;

  return getSafeAuthReturnUrl(referer, currentOrigin || "/");
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