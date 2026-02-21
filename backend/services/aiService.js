const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

exports.analyzeCase = async (caseData) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
    const model = 'gemini-2.5-flash';

    console.log(`[AI] Analyzing case for patient: ${caseData.patientName} with ${caseData.attachments?.length || 0} attachments`);

    let contentParts = [];

    // 1. Add text prompt
    const promptText = `
    You are an expert medical AI assistant providing a preliminary assessment for a primary health worker.
    Analyze the following patient case details:
    - Age: ${caseData.age}
    - Gender: ${caseData.gender}
    - Symptoms: ${caseData.symptoms}
    - Temperature: ${caseData.temperature || 'N/A'} °F
    - Blood Pressure: ${caseData.bloodPressure || 'N/A'}
    - Heart Rate: ${caseData.heartRate || 'N/A'} bpm
    - Medical History: ${caseData.history || 'None provided'}
    
    Also consider any attached medical images/documents if provided.
    
    Respond STRICTLY in JSON format with the following structure:
    {
      "possibleDiseases": ["Disease 1", "Disease 2"],
      "riskLevel": "Low" | "Medium" | "High" | "Critical",
      "recommendation": "Detailed next steps and immediate actions...",
      "confidence": 85
    }
    No markdown formatting like \`\`\`json, just the pure JSON string.
    `;
    contentParts.push(promptText);

    // 2. Add files as base64 inline data
    if (caseData.attachments && caseData.attachments.length > 0) {
      for (const file of caseData.attachments) {
         try {
           const filePath = path.join(__dirname, '..', file.path);
           const fileBuffer = fs.readFileSync(filePath);
           contentParts.push({
             inlineData: {
               data: fileBuffer.toString("base64"),
               mimeType: file.mimetype
             }
           });
         } catch(e) {
           console.error("Error reading attachment for AI:", e);
         }
      }
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contentParts,
      config: {
        responseMimeType: "application/json",
      }
    });

    const respText = response.text;
    console.log("[AI Response]:", respText);
    const parsedResp = JSON.parse(respText);
    
    return {
      possibleDiseases: parsedResp.possibleDiseases || ["Unable to determine"],
      riskLevel: parsedResp.riskLevel || "Medium",
      recommendation: parsedResp.recommendation || "Consult a specialist.",
      confidence: parsedResp.confidence || 70
    };
  } catch (error) {
    console.error("[AI Error]:", error);
    // Fallback if AI fails
    return {
      possibleDiseases: ['Analysis Error'],
      riskLevel: 'Medium',
      recommendation: 'AI service unavailable. Please rely on manual assessment and escalate if necessary.',
      confidence: 0
    };
  }
};
