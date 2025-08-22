export interface Hearing {
  date: string; // YYYY-MM-DD
  notes: string;
}

export interface Expense {
  description: string;
  amount: number;
}

export interface Case {
  id: string;
  title: string;
  clientName: string;
  clientAddress?: string;
  clientPhone?: string;
  caseNumber: string;
  court: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  juniorAdvocate?: string;
  history?: Hearing[];
  expenses?: Expense[];
}
