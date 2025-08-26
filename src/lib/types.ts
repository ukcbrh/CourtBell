
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
  uid: string; // User ID of the owner
  name: string;
  address?: string;
  phone?: string;
}

export interface Junior {
  id: string;
  uid: string; // User ID of the owner
  name: string;
  qualification?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
}

export interface Case {
  id: string;
  uid: string; // User ID of the owner
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
  uid: string; // User ID of the owner
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
