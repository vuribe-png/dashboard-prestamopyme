export interface FinancialData {
  month: string;
  inflation: number;
  rate_181_360: number;
  rate_mas_360: number;
  timestamp?: number;
}

export enum AssistantMode {
  INSIGHTS = 'INSIGHTS'
}