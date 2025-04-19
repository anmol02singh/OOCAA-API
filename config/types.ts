export interface SearchParams {
  criteria: string; 
  value: string;    
}

export type TcaRange = [string, string]; 

export interface ObjectTypeCounts {
  payload: number;
  debris: number;
  rocketBody: number;
  unknown: number;
  other: number;
  total: number;
}