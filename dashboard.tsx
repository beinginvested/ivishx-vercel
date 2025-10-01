// File: pages/dashboard.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/client";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import ImageUpload from "../components/ImageUpload";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return router.push("/");
      setUser(user);
      const q = query(collection(db, "users", user.uid, "signals"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snap) => {
        setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    });
    return () => unsub();
  }, []);

  return (
    <main className="max-w-2xl mx-auto mt-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Welcome to ivishX</h1>
        <button onClick={() => signOut(auth)} className="text-red-600">Logout</button>
      </div>
      {user && <ImageUpload onResult={(res) => setResult(res.setup)} />}
      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 whitespace-pre-wrap">
          <h2 className="font-semibold mb-2">AI Trade Setup:</h2>
          <p>{result}</p>
        </div>
      )}
      {history.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold mb-2">Previous Signals</h2>
          {history.map(item => (
            <div key={item.id} className="mb-4 p-4 border rounded bg-white">
              <img src={item.imageUrl} alt="Chart" className="w-full rounded mb-2" />
              <pre className="text-sm whitespace-pre-wrap">{item.result}</pre>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
