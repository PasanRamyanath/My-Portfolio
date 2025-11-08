"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, User } from "firebase/auth";

interface Props {
  onLogin: (user?: User) => void;
}

const ADMIN_EMAIL = "pjramyanath@gmail.com";

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (email !== ADMIN_EMAIL) {
      setError("Login failed: unauthorized email");
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      onLogin(cred.user);
    } catch {
      setError("Login failed: invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user || !user.email) {
        // Unexpected: no user/email returned from Google
        setError("Google login failed: no account information returned");
        try {
          await auth.signOut();
        } catch (_) {}
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        // Signed in with a Google account, but not the admin email
        try {
          await auth.signOut();
        } catch (_) {}
        setError(`Login failed: unauthorized Google account (${user.email})`);
        return;
      }

      onLogin(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google login error";
      setError(`Login failed: ${message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 text-slate-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
      {error && (
        <p className="text-rose-400 mb-4 text-center font-semibold">{error}</p>
      )}

      <form
        onSubmit={handleEmailLogin}
        className="space-y-4 bg-slate-900/70 p-6 rounded-lg shadow-md border border-white/10 backdrop-blur-md"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-slate-800/60 border border-white/10 rounded text-slate-100 placeholder-slate-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-slate-800/60 border border-white/10 rounded text-slate-100 placeholder-slate-400"
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors"
        >
          Login with Email
        </button>
      </form>

      <div className="text-center my-4 text-slate-400">OR</div>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-colors"
      >
        Login with Google
      </button>
    </div>
  );
}
