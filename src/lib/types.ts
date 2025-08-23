export interface Hearing {
  date: string; // YYYY-MM-DD
  notes: string;
}

export interface Expense {
  description: string;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface Junior {
  id: string;
  name: string;
  qualification?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
}

export interface Case {
  id: string;
  title: string;
  clientId: string; 
  juniorId?: string;
  caseNumber: string;
  court: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  history?: Hearing[];
  expenses?: Expense[];
}

export interface UserProfile {
  name?: string;
  upiId?: string;
  photoDataUrl?: string;
}
