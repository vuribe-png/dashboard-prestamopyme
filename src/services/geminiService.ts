import { GoogleGenAI } from "@google/genai";
import { FinancialData } from "../types";

// CORRECCIÓN: Usamos import.meta.env.VITE_API_KEY que es el estándar de Vite/Netlify
const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTrendAnalysis = async (data: FinancialData[]): Promise<string> => {
  if (!apiKey) {
    return "Error: Falta la API Key. Por favor configura la variable de entorno VITE_API_KEY en Netlify.";
  }

  const prompt = `
    Analiza los siguientes datos financieros sobre Inflación vs Tasas de Interés (en Soles) para un reporte ejecutivo.
    
    Contexto de Datos:
    - Región: Perú (Implícito por 'Soles')
    - Inflación: Tasa de inflación anual (%)
    - Tasa 181-360d: Tasa de interés para depósitos a plazo fijo entre 181 y 360 días.
    - Tasa >360d: Tasa de interés para depósitos mayores a 360 días.

    Puntos de Datos:
    ${data.map(d => `- ${d.month}: Inf: ${d.inflation}%, Tasa(181-360): ${d.rate_181_360}%, Tasa(>360): ${d.rate_mas_360}%`).join('\n')}

    Por favor proporciona:
    1. Un breve resumen de la tendencia (Tasas subiendo/bajando vs Inflación).
    2. Un análisis de "Tasa Real" (¿Las tasas están superando a la inflación?).
    3. Recomendación de inversión basada estrictamente en estos datos (Corto vs Largo plazo).
    
    Mantén el tono profesional, ejecutivo y conciso (menos de 200 palabras). Formatea la respuesta en Markdown.
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