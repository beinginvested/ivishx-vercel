// File: pages/api/analyze.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ivishxPrompt } from "../../utils/ivishxPrompt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { imageUrl } = req.body;
    const prompt = ivishxPrompt(imageUrl);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    return res.status(200).json({ setup: data.choices?.[0]?.message?.content || "No setup found." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
