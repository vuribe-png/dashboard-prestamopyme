// Archivo: src/services/geminiService.ts

import { GoogleGenAI } from "@google/genai";
import { FinancialData } from "../types";

// CAMBIO OBLIGATORIO PARA VITE/NETLIFY:
const apiKey = import.meta.env.VITE_API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

// ... el resto del código sigue igual ...