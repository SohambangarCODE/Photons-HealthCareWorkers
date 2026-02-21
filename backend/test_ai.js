require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

async function test(model) {
  try {
    console.log(`Testing ${model}...`);
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: 'Say hello' }] }],
    });
    console.log(`SUCCESS with ${model}:`, response.text?.substring(0, 50));
    return true;
  } catch(e) {
    const code = e.message.includes('429') ? '429-QUOTA' : e.message.includes('404') ? '404-NOT_FOUND' : 'OTHER';
    console.log(`FAIL ${model}: ${code} - ${e.message?.substring(0, 100)}`);
    return false;
  }
}

async function main() {
  const models = [
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
  ];
  for (const m of models) {
    const ok = await test(m);
    if (ok) break;
  }
}
main();
