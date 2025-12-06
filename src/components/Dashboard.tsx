import React, { useState, useEffect, useMemo } from 'react';
import { FinancialData } from '../types';
import { fetchFinancialData } from '../services/dataService';
import { COLORS } from '../constants';
import MetricCard from './MetricCard';
import { TrendLineChart } from './Charts';
import GeminiAssistant from './GeminiAssistant';
import { Sparkles, Filter, XCircle, Calendar } from 'lucide-react';

type TimeRange = '6M' | '1Y' | '3Y' | '5Y' | 'MAX' | 'CUSTOM';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Time Range State - Defaults to 3Y as requested
  const [timeRange, setTimeRange] = useState<TimeRange>('3Y');
  
  // Filter State
  const [filterStart, setFilterStart] = useState<string>('');
  const [filterEnd, setFilterEnd] = useState<string>('');
  
  // Hover State for Charts
  const [hoveredMetric, setHoveredMetric] = useState<FinancialData | null>(null);

  // UI State
  const [showGemini, setShowGemini] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
    
    // Polling interval: Refresh every 2 minutes (120000 ms)
    const intervalId = setInterval(() => {
        loadData();
    }, 120000);

    return () => clearInterval(intervalId);
  }, []);

  const loadData = async () => {
    // Only set loading on first load to avoid UI flicker during polling
    if (data.length === 0) setLoading(true);
    
    try {
      const fetchedData = await fetchFinancialData();
      setData(fetchedData);
      setError(null);
    } catch (err: any) {
      console.error("Polling error:", err);
      // Only set error state if we have no data at all
      if (data.length === 0) {
          setError(err.message || 'Error al cargar datos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to format timestamp to YYYY-MM
  const formatMonthInput = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  // Helper to parse YYYY-MM to timestamp
  const parseMonthInput = (value: string): number => {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month - 1, 1).getTime();
  };

  // Filter Logic
  const isFilterActive = !!(filterStart || filterEnd);

  // Update time range if manual filters are used
  useEffect(() => {
    if (isFilterActive && timeRange !== 'CUSTOM') {
        setTimeRange('CUSTOM');
    }
  }, [isFilterActive]);

  const handleRangeChange = (range: TimeRange) => {
      setTimeRange(range);
      // Clear manual filters when a preset is selected
      setFilterStart('');
      setFilterEnd('');
  };

  const displayedData = useMemo(() => {
    // 1. Manual Filtering
    if (isFilterActive) {
        let startTs = filterStart ? parseMonthInput(filterStart) : -Infinity;
        let endTs = filterEnd ? parseMonthInput(filterEnd) : Infinity;

        return data.filter(d => {
            const ts = d.timestamp || 0;
            return ts >= startTs && ts <= endTs;
        });
    }

    // 2. Preset Ranges (always relative to the end of data)
    const total = data.length;
    if (total === 0) return [];

    let sliceCount = total;
    switch (timeRange) {
        case '6M': sliceCount = 6; break;
        case '1Y': sliceCount = 12; break;
        case '3Y': sliceCount = 36; break;
        case '5Y': sliceCount = 60; break;
        case 'MAX': sliceCount = total; break;
        default: sliceCount = 36;
    }

    return data.slice(Math.max(0, total - sliceCount));

  }, [data, timeRange, filterStart, filterEnd, isFilterActive]);
  
  // Min/Max for inputs
  const minDate = data.length > 0 ? formatMonthInput(data[0].timestamp || 0) : '';
  const maxDate = data.length > 0 ? formatMonthInput(data[data.length - 1].timestamp || 0) : '';

  const clearFilters = () => {
    setFilterStart('');
    setFilterEnd('');
    setTimeRange('3Y'); // Reset to 3Y default
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-800">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
        <p className="font-bold animate-pulse tracking-tight">Cargando datos...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white p-8 rounded-none shadow-lg max-w-md w-full text-center border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Error de Carga</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={loadData} className="px-6 py-2 bg-black text-white font-bold hover:bg-slate-800 transition">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Handle case where displayedData is empty after filtering/range selection
  if (displayedData.length === 0) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-white">
             <p className="text-lg font-medium">No hay datos disponibles para el rango seleccionado.</p>
             <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline font-semibold">Limpiar Filtros</button>
        </div>
      );
  }
  
  // Now we are guaranteed that displayedData has at least one item.
  // So, latestMetric is guaranteed to be a FinancialData object, not null.
  const latestMetric = displayedData[displayedData.length - 1];
  
  // activeMetric can be hoveredMetric (if any) or latestMetric.
  const activeMetric = hoveredMetric || latestMetric;

  // Find the previous metric relative to the active metric
  // Note: We search in the FULL dataset ('data') to ensure we can find the previous month 
  // even if it's not in the currently filtered 'displayedData' view.
  const activeIndex = data.findIndex(d => d.month === activeMetric.month);
  const previousMetric = activeIndex > 0 ? data[activeIndex - 1] : undefined;

  const rangeButtons: { label: string; value: TimeRange }[] = [
      { label: '6 Meses', value: '6M' },
      { label: '1 Año', value: '1Y' },
      { label: '3 Años', value: '3Y' },
      { label: '5 Años', value: '5Y' },
      { label: 'MÁX', value: 'MAX' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20">
      {/* Navbar - Bloomberg Style: Black Header or Clean White with Heavy Font */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
             {/* Logo SVG con los 3 colores de la marca */}
             <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                {/* Top Circle - Amarillo/Naranja */}
                <circle cx="24" cy="16" r="10" fill="#F9BA48" />
                {/* Bottom Left - Verde */}
                <circle cx="16" cy="30" r="10" fill="#00B050" stroke="white" strokeWidth="2.5" />
                {/* Bottom Right - Naranja Oscuro */}
                <circle cx="32" cy="30" r="10" fill="#FB8500" stroke="white" strokeWidth="2.5" />
             </svg>
             {/* Typography Update: Font-Black (Weight 900) and tighter tracking */}
             <span className="text-3xl font-black tracking-tighter leading-none flex items-center">
               <span style={{ color: '#00B050' }}>Prestamo</span>
               <span style={{ color: '#F9BA48' }}>pyme.com</span>
             </span>
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={() => setShowFilters(!showFilters)}
               className={`p-2 rounded-md transition-colors ${showFilters || isFilterActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
               title="Filtrar por Fecha"
             >
               <Filter className="w-5 h-5" />
             </button>
             <button 
                onClick={() => setShowGemini(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md font-bold text-sm hover:bg-slate-800 transition-all"
             >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Preguntar a Gemini</span>
             </button>
          </div>
        </div>
      </nav>
      
      {/* Filter Bar */}
      {(showFilters || isFilterActive) && (
        <div className="bg-slate-50 border-b border-slate-200 py-4 animate-in slide-in-from-top-2">
            <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>Rango:</span>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="month" 
                        value={filterStart}
                        min={minDate}
                        max={filterEnd || maxDate}
                        onChange={(e) => setFilterStart(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-none text-sm focus:ring-1 focus:ring-black focus:outline-none"
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                        type="month" 
                        value={filterEnd}
                        min={filterStart || minDate}
                        max={maxDate}
                        onChange={(e) => setFilterEnd(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-none text-sm focus:ring-1 focus:ring-black focus:outline-none"
                    />
                </div>
                {isFilterActive && (
                    <button 
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-bold px-2 py-1 ml-auto md:ml-0 uppercase tracking-wide"
                    >
                        <XCircle className="w-4 h-4" />
                        Limpiar
                    </button>
                )}
            </div>
        </div>
      )}

      <main className="container mx-auto px-4 md:px-6 py-10 space-y-10">
        
        {/* Header Section - Typography Overhaul */}
        <header className="md:flex md:items-end md:justify-between border-b border-slate-200 pb-8">
          <div className="max-w-4xl">
            {/* Title: Size 40px, Bold (700), Tracking -1.5px (Tighter), Leading 1.1 */}
            <h1 className="text-4xl md:text-[40px] font-bold text-black tracking-tighter mb-4 leading-[1.1]">
                Tasa de interés promedio del sistema financiero Vs Inflación
            </h1>
            {/* Subtitle: Size 20px, Regular (400), Leading 1.5 */}
            <p className="text-[20px] text-slate-700 font-normal leading-relaxed">
                Para Depósitos a Plazo Fijo en Soles - Personas Naturales
            </p>
          </div>
          <div className="mt-6 md:mt-0 text-sm text-slate-500 text-right shrink-0">
             <div className="mb-1">
                 {isFilterActive ? (
                     <span className="text-slate-900 font-bold block">
                         Rango: {displayedData[0]?.month} a {displayedData[displayedData.length-1]?.month}
                     </span>
                 ) : (
                     <span className="block">Datos al cierre: <span className="font-bold text-slate-900">{displayedData.length > 0 ? displayedData[displayedData.length-1].month : ''}</span></span>
                 )}
             </div>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Trend Chart */}
            <div className="order-1 lg:col-span-9 bg-white flex flex-col w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-black tracking-tight">Evolución de Tendencia</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            {displayedData.length > 0 ? `${displayedData[0].month} - ${displayedData[displayedData.length-1].month}` : 'Sin datos'}
                        </p>
                    </div>
                     <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-md">
                        {rangeButtons.map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => handleRangeChange(btn.value)}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-sm transition-all ${
                                    timeRange === btn.value
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-slate-500 hover:text-black hover:bg-slate-200'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 min-h-[450px]">
                    <TrendLineChart 
                        data={displayedData} 
                        onHover={setHoveredMetric}
                    />
                </div>
            </div>

            {/* Metrics Column */}
            <div className="order-2 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:sticky lg:top-24 lg:self-start w-full grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-6">
               <MetricCard 
                  title="Inflación" 
                  value={activeMetric.inflation} 
                  color={COLORS.inflation}
                  subValue={`Periodo: ${activeMetric.month}`}
                  previousValue={previousMetric?.inflation}
                  invertTrendColor={true}
               />
               <MetricCard 
                  title="Tasa Real (181-360d)" 
                  value={activeMetric.rate_181_360}
                  comparisonValue={activeMetric.inflation}
                  color={COLORS.rate181} 
                  subValue={`vs Inflación (${activeMetric.month})`}
                  forceColor={true}
                  previousValue={previousMetric?.rate_181_360}
               />
               <MetricCard 
                  title="Tasa Real (>360d)" 
                  value={activeMetric.rate_mas_360}
                  comparisonValue={activeMetric.inflation}
                  color={COLORS.rate360}
                  subValue={`vs Inflación (${activeMetric.month})`}
                  forceColor={true}
                  previousValue={previousMetric?.rate_mas_360}
               />
            </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-slate-100 mt-10">
        <p className="text-slate-400 text-sm font-medium">© 2025 Prestamopyme. Fuente SBS / BCRP</p>
      </footer>

      {/* Gemini Sidebar/Modal */}
      {showGemini && (
        <GeminiAssistant 
            visibleData={displayedData} 
            onClose={() => setShowGemini(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
