"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    await signIn("credentials", {
      email,
      callbackUrl: "/",
    });

    setLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">StreamForge</h1>

        <p className="mt-2 text-zinc-400">Sign in to continue</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-white hover:bg-zinc-800"
        >
          Continue with Google
        </button>

        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-white hover:bg-zinc-800"
        >
          Continue with GitHub
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-500">OR</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Enter seeded email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
