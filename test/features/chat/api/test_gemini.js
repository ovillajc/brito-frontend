require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        { role: 'user', parts: [{ text: 'Hello' }] },
      ],
    });
    console.log(response.text);
  } catch (e) {
    console.error('Error in Gemini:', e);
  }
}
run();
