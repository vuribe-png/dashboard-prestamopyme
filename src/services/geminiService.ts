import { GoogleGenAI } from "@google/genai";
import { FinancialData } from "../types";

// IMPORTANTE: En Vite se usa import.meta.env
const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTrendAnalysis = async (data: FinancialData[]): Promise<string> => {
  if (!apiKey) {
    return "Error: Falta la API Key. Por favor configura tu API Key de Gemini en Netlify (VITE_API_KEY).";
  }

  const prompt = `
    Analiza los siguientes datos financieros sobre Inflación vs Tasas de Interés (en Soles).
    Región: Perú.
    Puntos de Datos:
    ${data.map(d => `- ${d.month}: Inf: ${d.inflation}%, Tasa(181-360): ${d.rate_181_360}%, Tasa(>360): ${d.rate_mas_360}%`).join('\n')}
    Proporciona un resumen ejecutivo breve, análisis de tasa real y recomendación.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se generó análisis.";
  } catch (error) {
    console.error("Error Análisis Gemini:", error);
    return "Lo siento, no pude generar el análisis en este momento.";
  }
};