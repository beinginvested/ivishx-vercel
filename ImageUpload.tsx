// File: components/ImageUpload.tsx

"use client";

import { useState } from "react";
import axios from "axios";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage, auth, db } from "../firebase/client";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function ImageUpload({ onResult }: { onResult: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select an image");
    setLoading(true);

    try {
      const imageRef = ref(storage, `charts/${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      const response = await axios.post("/api/analyze", { imageUrl: url });
      const result = response.data;
      onResult(result);

      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "users", user.uid, "signals"), {
          imageUrl: url,
          result: result.setup,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="border p-4 rounded-lg shadow">
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>
    </div>
  );
}
