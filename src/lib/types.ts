
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
  photoDataUrl?: string;
  mobileNumber?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  accountType?: string;
  ifscCode?: string;
  upiId?: string;
}

export interface Transaction {
  id: string;
  type: 'in' | 'out';
  description: string;
  amount: number;
  date: string; // ISO 8601 format
  relatedTo: {
    type: 'client' | 'junior' | 'other';
    id: string;
    name: string;
  };
}
