import React, { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FinancialData, AssistantMode } from '../types';
import { generateTrendAnalysis } from '../services/geminiService';

interface GeminiAssistantProps {
  visibleData: FinancialData[];
  onClose: () => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ visibleData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    const result = await generateTrendAnalysis(visibleData);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h2 className="font-bold text-lg">Asistente Gemini</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-600 text-sm mb-4">
                Genera un análisis de IA de los datos financieros visibles (Fechas: {visibleData[0]?.month} - {visibleData[visibleData.length-1]?.month}).
              </p>
              <button
                onClick={generateAnalysis}
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analizar Tendencias
              </button>
            </div>
            {analysis && (
              <div className="prose prose-sm prose-slate bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GeminiAssistant;