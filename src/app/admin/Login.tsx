"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

interface Props {
  onLogin: () => void;
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
      setError("Unauthorized email");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed: unknown error";
      setError(message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      if (userEmail !== ADMIN_EMAIL) {
        await auth.signOut();
        setError("Unauthorized Google account");
        return;
      }
      onLogin();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google login failed";
      setError(message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
      {error && (
        <p className="text-red-500 mb-4 text-center font-semibold">{error}</p>
      )}

      <form
        onSubmit={handleEmailLogin}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Login with Email
        </button>
      </form>

      <div className="text-center my-4">OR</div>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
      >
        Login with Google
      </button>
    </div>
  );
}
