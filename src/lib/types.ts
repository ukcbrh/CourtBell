export interface Case {
  id: string;
  title: string;
  clientName: string;
  caseNumber: string;
  court: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
}
