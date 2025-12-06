import { FinancialData } from '../types';
import { GOOGLE_SHEET_URL, BACKUP_DATA, MONTHS_ES } from '../constants';

const CACHE_KEY = 'findash_financial_data_v3'; // Versión actualizada para forzar refresco
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hora (3600000 ms)

const parseDate = (monthYear: string): number => {
  if (!monthYear) return 0;
  const parts = monthYear.split('-');
  if (parts.length !== 2) return 0;
  
  const [monthStr, yearStr] = parts;
  const year = parseInt(yearStr) < 100 ? 2000 + parseInt(yearStr) : parseInt(yearStr);
  const monthIndex = MONTHS_ES.indexOf(monthStr);
  
  // Create a date object (using day 1)
  return new Date(year, monthIndex, 1).getTime();
};

export const fetchFinancialData = async (): Promise<FinancialData[]> => {
  // 1. Estrategia de Caché: Intentar cargar desde localStorage primero
  try {
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const { timestamp, data } = JSON.parse(cachedRaw);
      const age = Date.now() - timestamp;
      
      // Si la data es válida (menor a CACHE_DURATION), la retornamos inmediatamente
      if (age < CACHE_DURATION) {
        console.log(`Cargando datos desde caché (${(age / 60000).toFixed(1)} mins de antigüedad)`);
        return data;
      }
    }
  } catch (error) {
    console.warn("Error al leer caché, procediendo a carga de red:", error);
    localStorage.removeItem(CACHE_KEY); // Limpiar caché corrupta si existe
  }

  // 2. Carga de Red
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${GOOGLE_SHEET_URL}&t=${timestamp}`);
    
    if (!response.ok) {
      throw new Error('La respuesta de la red no fue correcta');
    }
    
    const csvText = await response.text();
    const rows = csvText.trim().split(/\r?\n/);
    const data: FinancialData[] = [];
    
    // Determine start row (skip header if present)
    const startRow = (rows[0] && isNaN(parseFloat(rows[0].split(',')[1]))) ? 1 : 0;

    for (let i = startRow; i < rows.length; i++) {
      const cells = rows[i].split(',');
      if (cells.length >= 4) {
        const month = cells[0].trim();
        const inflation = parseFloat(cells[1]);
        const rate1 = parseFloat(cells[2]);
        const rate2 = parseFloat(cells[3]);
        
        if (month && !isNaN(inflation) && !isNaN(rate1) && !isNaN(rate2)) {
            const timestamp = parseDate(month);
            data.push({ 
                month, 
                inflation, 
                rate_181_360: rate1, 
                rate_mas_360: rate2,
                timestamp
            });
        }
      }
    }
    
    if (data.length === 0) {
      throw new Error("No se encontraron datos válidos en el CSV");
    }

    // Sort by date
    data.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    // 3. Guardar en Caché
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));
    } catch (cacheError) {
      console.warn("No se pudo guardar en caché (posiblemente almacenamiento lleno):", cacheError);
    }

    return data;
    
  } catch (error) {
    console.warn("Fallo al cargar desde Google Sheets, usando datos de respaldo:", error);
    
    // Si falla la red pero tenemos caché (aunque sea expirada), podríamos considerar usarla
    // Pero por seguridad, fallback a BACKUP_DATA para asegurar consistencia si la red falla
    
    // Add timestamps to backup data for consistency
    const processedBackup = BACKUP_DATA.map(d => ({
        ...d,
        timestamp: parseDate(d.month)
    })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    return processedBackup;
  }
};
