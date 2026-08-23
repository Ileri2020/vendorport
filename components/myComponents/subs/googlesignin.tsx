// @ts-nocheck
'use server'

import { signIn } from "@/auth";
import { FcGoogle } from "react-icons/fc";
import { headers } from "next/headers";

async function getReturnUrl() {
  const referer = (await headers()).get("referer");
  if (!referer) return "/";
  try {
    const url = new URL(referer);
    const isAllowed = url.hostname === "vport.store"
      || url.hostname.endsWith(".vport.store")
      || url.hostname === "localhost"
      || url.hostname === "127.0.0.1";
    return isAllowed ? url.toString() : "/";
  } catch {
    return "/";
  }
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