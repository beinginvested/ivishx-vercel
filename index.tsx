// File: pages/index.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/client";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) router.push("/dashboard");
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 border p-4 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">ivishX Login / Signup</h1>
      <input type="email" placeholder="Email" className="w-full mb-2 border p-2"
        value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="w-full mb-2 border p-2"
        value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded">
        {mode === "login" ? "Login" : "Sign Up"}
      </button>
      <p className="mt-2 text-sm text-center">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button className="text-blue-600 underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
}
