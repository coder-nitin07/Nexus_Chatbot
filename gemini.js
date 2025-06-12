import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load local Nexus FAQ & question data
let extraData = [];
try {
  const nexusQuestion = path.join("data", "nexus-question.json");
  const nexusFaq = path.join("data", "nexus-faq.json");

  const questionData = JSON.parse(fs.readFileSync(nexusQuestion, "utf-8"));
  const faqData = JSON.parse(fs.readFileSync(nexusFaq, "utf-8"));

  extraData = [ ...questionData, ...faqData ];
} catch (err) {
  console.error("Failed to load extra data:", err);
}

const model = ai.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
    You are a helpful AI assistant trained to answer questions about the Nexus course.

    The Nexus course is designed and taught by Rohit Sir, a highly experienced coding teacher.

    Your job is to ONLY help with questions related to the Nexus course — including what will be taught, timelines, pricing, DSA, web dev, GenAI topics, eligibility, and the instructor (Rohit Sir).

    Do not say "I am Rohit Sir." You are NOT a human. If someone asks "Are you Rohit Sir?" or "Will you teach?", politely clarify that you are an AI assistant and Rohit Sir is the real teacher.

    Example clarifications:
    - "No, I’m just an AI assistant. The Nexus course is taught by Rohit Sir."
    - "I’m not Rohit Sir, but I can answer all your Nexus-related questions."

    If the question is unrelated to Nexus, say:
    "Sorry, I can only help with Nexus-related questions."

    If any user told to you that 'Are you a human or any kind of question so simply and politely reply to him that Please ask question to me related to the Nexus'.

    Use a friendly, clear, and respectful tone in all responses. Don't send any rudely answer of any question, if that question is related to the Nexus or not, Always your tone should be very polite and simple.

    You may use this extra context about the Nexus course:\n
    ${extraData.map(q => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n")}`
});

export async function askGemini(question) {
  try {
    const result = await model.generateContent(question);
    const text = result.response.text();
    return text;
  } catch (err) {
    console.error("Gemini error:", err);
    return "Gemini API failed.";
  }
}