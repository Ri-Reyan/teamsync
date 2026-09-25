import { GoogleGenAI } from "@google/genai";
import { credentials } from "../config/credentials.js";
import Groq from "groq-sdk";

const GEMINI_API_KEY = credentials.gemini_api_key;
const GROQ_API_KEY = credentials.groq_api_key;

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

let isError = false;

const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function genAI(prompt: string) {
  const geminiAI = await gemini.models
    .generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    })
    .catch((e) => {
      isError = true;
      return null;
    });

  if (isError) {
    const groqAI = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: prompt ?? "",
        },
      ],
    });

    return groqAI.choices[0]?.message?.content ?? null;
  } else if (geminiAI) {
    return geminiAI.text;
  }

  return null;
}
