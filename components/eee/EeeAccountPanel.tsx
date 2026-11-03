"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, ShieldCheck, UserRound, Copy, Check } from "lucide-react";

type AccountStatus = {
  signedIn: boolean;
  user?: { name?: string | null; email?: string | null };
  apiKeyConfigured: boolean;
  tokenConfigured: boolean;
  tokenExpiresAt?: string | null;
};

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

export default function EeeAccountPanel() {
  const router = useRouter();
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [newToken, setNewToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/eee/account", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setStatus(data as AccountStatus);
      else setStatus({ signedIn: false, apiKeyConfigured: false, tokenConfigured: false });
    } catch {
      setMessage("Could not load EESimulator account settings.");
    }
  }, []);

  useEffect(() => { void refreshStatus(); }, [refreshStatus]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Account creation failed.");
      }

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (result?.error) throw new Error("Email or password is not valid.");
      setPassword("");
      setMessage(mode === "signup" ? "Account created and signed in." : "Signed in successfully.");
      await refreshStatus();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    await signIn("google", { callbackUrl: "/account" });
    setBusy(false);
  };

  const saveApiKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/eee/ai-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your API key.");
      setApiKey("");
      setMessage("Gemini key encrypted and saved to your account.");
      await refreshStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save your API key.");
    } finally {
      setBusy(false);
    }
  };

  const removeApiKey = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/eee/ai-key", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove the key.");
      setMessage("Saved Gemini key removed.");
      await refreshStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove the key.");
    } finally {
      setBusy(false);
    }
  };

  const createToken = async () => {
    setBusy(true);
    setNewToken("");
    try {
      const response = await fetch("/api/eee/token", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create an app token.");
      setNewToken(result.token as string);
      setMessage("Copy this token now. It will not be shown again.");
      await refreshStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create an app token.");
    } finally {
      setBusy(false);
    }
  };

  const revokeToken = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/eee/token", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not revoke the app token.");
      setNewToken("");
      setMessage("EEE app token revoked.");
      await refreshStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not revoke the app token.");
    } finally {
      setBusy(false);
    }
  };

  const copyToken = async () => {
    await navigator.clipboard.writeText(newToken);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="w-full rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><KeyRound size={20} /></div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">EESimulator account</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in to sync your EEE app access and manage your personal AI provider key.</p>
        </div>
      </div>

      {status?.signedIn ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><UserRound size={17} />{status.user?.name || status.user?.email}</div>
            <button type="button" className="text-sm font-medium text-slate-500 underline" onClick={async () => { await signOut({ redirect: false }); setNewToken(""); await refreshStatus(); router.refresh(); }}>Sign out</button>
          </div>

          <form onSubmit={saveApiKey} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"><ShieldCheck size={17} className="text-emerald-600" />Gemini API key {status.apiKeyConfigured ? <span className="font-normal text-emerald-700">· configured</span> : <span className="font-normal text-amber-700">· not set</span>}</div>
            <label className="block text-xs text-slate-600 dark:text-slate-300" htmlFor="eee-gemini-key">Your key is encrypted before it is stored and is never returned by the API.</label>
            <input id="eee-gemini-key" className={inputClass} type="password" autoComplete="new-password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={status.apiKeyConfigured ? "Enter a replacement key" : "Paste your Gemini API key"} />
            <div className="flex flex-wrap gap-2">
              <button className={buttonClass} disabled={busy || apiKey.trim().length === 0}><KeyRound size={16} />Encrypt and save</button>
              {status.apiKeyConfigured && <button type="button" onClick={removeApiKey} disabled={busy} className="min-h-11 rounded-lg border border-rose-300 px-4 text-sm font-semibold text-rose-700 disabled:opacity-60">Remove key</button>}
            </div>
          </form>

          <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">EEE app connection token</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Paste this token into EESimulator Settings. It grants the app access to your account's AI service and community examples.</p>
            </div>
            {newToken ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input readOnly className={`${inputClass} font-mono`} value={newToken} aria-label="New EEE app token" />
                <button type="button" onClick={copyToken} className={buttonClass}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy"}</button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">{status.tokenConfigured ? `A token is active${status.tokenExpiresAt ? ` until ${new Date(status.tokenExpiresAt).toLocaleDateString()}` : ""}. Creating a new one revokes the old token.` : "No app token has been created."}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={createToken} disabled={busy} className={buttonClass}>{busy && <Loader2 className="animate-spin" size={16} />}{status.tokenConfigured ? "Rotate app token" : "Create app token"}</button>
              {status.tokenConfigured && <button type="button" onClick={revokeToken} disabled={busy} className="min-h-11 rounded-lg border border-rose-300 px-4 text-sm font-semibold text-rose-700 disabled:opacity-60">Revoke token</button>}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button type="button" onClick={() => setMode("signin")} className={`min-h-10 rounded-md text-sm font-semibold ${mode === "signin" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}>Sign in</button>
            <button type="button" onClick={() => setMode("signup")} className={`min-h-10 rounded-md text-sm font-semibold ${mode === "signup" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}>Sign up</button>
          </div>
          <form onSubmit={handleAuth} className="space-y-3">
            {mode === "signup" && <input className={inputClass} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required />}
            <input className={inputClass} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required />
            <input className={inputClass} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (at least 8 characters)" required />
            <button className={`${buttonClass} w-full`} disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}{mode === "signup" ? "Create account" : "Sign in"}</button>
          </form>
          <div className="relative py-1 text-center text-xs text-slate-500"><span className="bg-blue-50 px-2 dark:bg-slate-950">or continue with</span><div className="absolute inset-x-0 top-1/2 -z-10 border-t border-slate-200 dark:border-slate-700" /></div>
          <button type="button" onClick={handleGoogle} disabled={busy} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"><span className="text-base font-bold">G</span>Continue with Google</button>
        </div>
      )}

      {message && <p role="status" className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">{message}</p>}
    </section>
  );
}
